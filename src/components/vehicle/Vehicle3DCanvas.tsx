import React, { Suspense, useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, ContactShadows, Bounds, useBounds, Preload } from '@react-three/drei'
import * as THREE from 'three'
import type { Vehicle } from '@/types'
import type { PresetsType } from '@react-three/drei/helpers/environment-assets'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

// =============================================================================
// CONFIGURACIÓN DE ORIENTACIÓN DE MODELOS
// =============================================================================
// Cada modelo GLB viene con una orientación inicial diferente.
// Este offset se aplica UNA VEZ al cargar el modelo para que todos
// tengan su frente apuntando hacia +Z (hacia la cámara inicial).
//
// El sistema de cámara orbitará alrededor del modelo centrado en el origen.

const MODEL_INITIAL_ROTATION: Record<string, number> = {
    // Rotación inicial Y en grados para corregir la orientación del modelo GLB
    'mazda-rx7-fd': 90,         // Modelo viene orientado hacia -X
    'nissan-skyline-r34': 180,  // Modelo viene orientado hacia -Z
    'toyota-supra-a80': 90,     // Modelo viene orientado hacia -X
    'honda-nsx': 180,           // Modelo viene orientado hacia -Z
    'mitsubishi-evo-ix': 180,   // Modelo viene orientado hacia -Z
    'subaru-impreza-sti': 0     // Sin rotación - usamos offset de cámara
}

// Offset de ángulo azimutal por vehículo para ajustar las vistas de cámara
// Esto compensa modelos que tienen orientación diferente sin rotarlos
const CAMERA_AZIMUTH_OFFSET: Record<string, number> = {
    'subaru-impreza-sti': 90    // El modelo viene orientado 90° diferente
}

// Offset de posición por vehículo para corregir centrado
// Formato: { vehicleId: { x, y, z } } - valores se suman a la posición final
const MODEL_POSITION_OFFSET: Record<string, { x: number; y: number; z: number }> = {
    'mazda-rx7-fd': { x: 0, y: -0.15, z: 0 }  // Bajar ligeramente para que toque el suelo
}

// =============================================================================
// SEPARACIÓN DINÁMICA DE LLANTAS PARA R34
// =============================================================================
// El modelo R34 tiene las llantas fusionadas en body_main.
// Esta función las separa en tiempo de ejecución basándose en posición.
// 
// NOTA: El modelo R34 tiene ejes inusuales:
// - X: longitud del coche (1.08 a 2.45)
// - Y: ancho del coche (-2.42 a 0.92) ← centro en Y ≈ -0.75
// - Z: altura del coche (0.39 a 1.24)

interface WheelCenter {
    x: number      // Posición longitudinal (adelante/atrás)
    y: number      // Posición lateral exacta (no simétrica)
    radius: number // Radio de detección en el plano XY
}

// Centros de las 4 ruedas del R34 (basado en análisis de geometría)
// El coche NO está centrado en Y=0, está desplazado
const R34_WHEEL_CENTERS: WheelCenter[] = [
    // Ruedas del lado derecho (Y positivo)
    { x: 2.30, y: 0.80, radius: 0.25 },   // Delantera derecha
    { x: 1.26, y: 0.80, radius: 0.25 },   // Trasera derecha
    // Ruedas del lado izquierdo (Y negativo)
    { x: 2.30, y: -2.30, radius: 0.25 },  // Delantera izquierda
    { x: 1.26, y: -2.30, radius: 0.25 }   // Trasera izquierda
]

// Rango de altura Z de las llantas (solo las llantas metálicas, no neumáticos)
const R34_WHEEL_Z_MIN = 0.32   // Por encima del neumático
const R34_WHEEL_Z_MAX = 0.75   // Por debajo del paso de rueda

/**
 * Verifica si un punto está dentro de alguna llanta del R34
 */
function isPointInWheel(x: number, y: number, z: number): boolean {
    // Verificar altura Z primero (más rápido)
    if (z < R34_WHEEL_Z_MIN || z > R34_WHEEL_Z_MAX) return false

    // Verificar si está dentro de algún cilindro de rueda
    for (const wheel of R34_WHEEL_CENTERS) {
        const dx = x - wheel.x
        const dy = y - wheel.y
        const distSq = dx * dx + dy * dy
        if (distSq <= wheel.radius * wheel.radius) {
            return true
        }
    }
    return false
}/**
 * Separa las llantas del mesh body_main del R34
 * Crea un nuevo mesh con material wheel_separated para las llantas
 */
function separateR34Wheels(scene: THREE.Group): void {
    let bodyMesh: THREE.Mesh | null = null

    // Buscar el mesh body_main
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            const matName = (child.material as THREE.Material)?.name?.toLowerCase() || ''
            if (matName === 'body_main') {
                bodyMesh = child
            }
        }
    })

    if (!bodyMesh) return

    const geometry = bodyMesh.geometry as THREE.BufferGeometry
    const positions = geometry.attributes.position
    const normals = geometry.attributes.normal
    const uvs = geometry.attributes.uv
    const indices = geometry.index

    if (!positions || !indices) return

    // Arrays para los dos nuevos meshes
    const bodyPositions: number[] = []
    const bodyNormals: number[] = []
    const bodyUvs: number[] = []
    const bodyIndices: number[] = []

    const wheelPositions: number[] = []
    const wheelNormals: number[] = []
    const wheelUvs: number[] = []
    const wheelIndices: number[] = []

    // Mapeo de índices originales a nuevos índices
    const bodyVertexMap = new Map<number, number>()
    const wheelVertexMap = new Map<number, number>()

    // Procesar cada triángulo
    const indexArray = indices.array
    for (let i = 0; i < indexArray.length; i += 3) {
        const i0 = indexArray[i]
        const i1 = indexArray[i + 1]
        const i2 = indexArray[i + 2]

        // Obtener posiciones de los 3 vértices
        const x0 = positions.getX(i0), y0 = positions.getY(i0), z0 = positions.getZ(i0)
        const x1 = positions.getX(i1), y1 = positions.getY(i1), z1 = positions.getZ(i1)
        const x2 = positions.getX(i2), y2 = positions.getY(i2), z2 = positions.getZ(i2)

        // Calcular centro del triángulo
        const cx = (x0 + x1 + x2) / 3
        const cy = (y0 + y1 + y2) / 3
        const cz = (z0 + z1 + z2) / 3

        // ¿Este triángulo pertenece a una llanta?
        const isWheel = isPointInWheel(cx, cy, cz)

        // Añadir al array correspondiente
        const targetPositions = isWheel ? wheelPositions : bodyPositions
        const targetNormals = isWheel ? wheelNormals : bodyNormals
        const targetUvs = isWheel ? wheelUvs : bodyUvs
        const targetIndices = isWheel ? wheelIndices : bodyIndices
        const targetMap = isWheel ? wheelVertexMap : bodyVertexMap

        for (const idx of [i0, i1, i2]) {
            if (!targetMap.has(idx)) {
                const newIdx = targetPositions.length / 3
                targetMap.set(idx, newIdx)

                targetPositions.push(positions.getX(idx), positions.getY(idx), positions.getZ(idx))
                if (normals) {
                    targetNormals.push(normals.getX(idx), normals.getY(idx), normals.getZ(idx))
                }
                if (uvs) {
                    targetUvs.push(uvs.getX(idx), uvs.getY(idx))
                }
            }
            targetIndices.push(targetMap.get(idx)!)
        }
    }

    // Si no hay vértices de rueda, no hacer nada
    if (wheelPositions.length === 0) {
        console.warn('[R34] No se encontraron vértices de llanta')
        return
    }

    // Crear nueva geometría para carrocería
    const bodyGeometry = new THREE.BufferGeometry()
    bodyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(bodyPositions, 3))
    if (bodyNormals.length > 0) {
        bodyGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(bodyNormals, 3))
    }
    if (bodyUvs.length > 0) {
        bodyGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(bodyUvs, 2))
    }
    bodyGeometry.setIndex(bodyIndices)
    bodyGeometry.computeBoundingSphere()

    // Crear nueva geometría para llantas
    const wheelGeometry = new THREE.BufferGeometry()
    wheelGeometry.setAttribute('position', new THREE.Float32BufferAttribute(wheelPositions, 3))
    if (wheelNormals.length > 0) {
        wheelGeometry.setAttribute('normal', new THREE.Float32BufferAttribute(wheelNormals, 3))
    }
    if (wheelUvs.length > 0) {
        wheelGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(wheelUvs, 2))
    }
    wheelGeometry.setIndex(wheelIndices)
    wheelGeometry.computeBoundingSphere()

    // Crear material para llantas (clonar del body y renombrar)
    const originalMat = bodyMesh.material as THREE.MeshStandardMaterial
    const wheelMaterial = originalMat.clone()
    wheelMaterial.name = 'wheel_separated'

    // Crear mesh de llantas
    const wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial)
    wheelMesh.name = 'wheels_r34'
    wheelMesh.castShadow = true
    wheelMesh.receiveShadow = false

    // Actualizar geometría del body
    bodyMesh.geometry.dispose()
    bodyMesh.geometry = bodyGeometry

    // Añadir mesh de llantas al mismo padre
    if (bodyMesh.parent) {
        bodyMesh.parent.add(wheelMesh)
        // Copiar transformación
        wheelMesh.position.copy(bodyMesh.position)
        wheelMesh.rotation.copy(bodyMesh.rotation)
        wheelMesh.scale.copy(bodyMesh.scale)
    }
}

// Override específico de vistas por vehículo (para intercambiar laterales, etc.)
// Formato: { vehicleId: { vistaOriginal: vistaDestino } }
const CAMERA_VIEW_SWAP: Record<string, Record<string, string>> = {
    'nissan-skyline-r34': {
        'side-left': 'side-right',   // Intercambiar izquierda → derecha
        'side-right': 'side-left'    // Intercambiar derecha → izquierda
    },
    'toyota-supra-a80': {
        'front': 'side-left',        // Frontal muestra lateral izquierdo
        'rear': 'side-right',        // Trasera muestra lateral derecho
        'side-left': 'front',        // Lateral izq muestra frontal
        'side-right': 'rear'         // Lateral der muestra trasera
    },
    'mazda-rx7-fd': {
        'front': 'side-left',        // Frontal muestra lateral izquierdo
        'rear': 'side-right',        // Trasera muestra lateral derecho
        'side-left': 'front',        // Lateral izq muestra frontal
        'side-right': 'rear'         // Lateral der muestra trasera
    },
    'honda-nsx': {
        'side-left': 'side-right',   // Intercambiar izquierda → derecha
        'side-right': 'side-left'    // Intercambiar derecha → izquierda
    },
    'mitsubishi-evo-ix': {
        'side-left': 'side-right',   // Intercambiar izquierda → derecha
        'side-right': 'side-left'    // Intercambiar derecha → izquierda
    },
    'subaru-impreza-sti': {
        'front': 'side-right',       // Frontal muestra lateral derecha (para corregir que muestra izquierda)
        'rear': 'side-left',         // Trasera muestra lateral izquierda (para corregir que muestra derecha)
        'side-left': 'rear',         // Lateral izq muestra trasera (para corregir que muestra frontal)
        'side-right': 'front'        // Lateral der muestra frontal (para corregir que muestra trasera)
    }
}

// =============================================================================
// POSICIONES DE CÁMARA PARA VISTAS PRESET
// =============================================================================
// En lugar de rotar el modelo, movemos la cámara a posiciones específicas.
// La cámara siempre mira al centro del modelo (0, targetY, 0).
// 
// Coordenadas esféricas: [distancia, ángulo azimutal (horizontal), ángulo polar (vertical)]
// - Azimutal: 0 = frente, 90 = derecha, 180 = atrás, 270 = izquierda
// - Polar: 0 = arriba, 90 = horizontal

interface CameraViewConfig {
    azimuth: number    // Ángulo horizontal en grados (0-360)
    polar: number      // Ángulo vertical en grados (0 = arriba, 90 = horizontal)
    distance: number   // Distancia desde el centro
    targetY: number    // Altura del punto al que mira la cámara
}

const CAMERA_VIEWS: Record<string, CameraViewConfig> = {
    'front': {
        azimuth: 180,      // Cámara detrás mirando hacia el frente del coche
        polar: 75,         // Ligeramente desde arriba
        distance: 6,
        targetY: 0.5
    },
    'rear': {
        azimuth: 0,        // Cámara delante mirando hacia la trasera
        polar: 75,
        distance: 6,
        targetY: 0.5
    },
    'side-left': {
        azimuth: 90,       // Cámara a la derecha mirando hacia el lado izquierdo
        polar: 80,
        distance: 6,
        targetY: 0.5
    },
    'side-right': {
        azimuth: 270,      // Cámara a la izquierda mirando hacia el lado derecho
        polar: 80,
        distance: 6,
        targetY: 0.5
    },
    'top': {
        azimuth: 180,
        polar: 10,         // Casi desde arriba
        distance: 7,
        targetY: 0
    },
    'three-quarter': {
        azimuth: 225,      // Vista 3/4 frontal izquierda (clásica de showroom)
        polar: 70,
        distance: 6,
        targetY: 0.5
    }
}

// Convertir coordenadas esféricas a cartesianas
function sphericalToCartesian(azimuth: number, polar: number, distance: number, targetY: number): THREE.Vector3 {
    const azimuthRad = (azimuth * Math.PI) / 180
    const polarRad = (polar * Math.PI) / 180

    const x = distance * Math.sin(polarRad) * Math.sin(azimuthRad)
    const y = distance * Math.cos(polarRad) + targetY
    const z = distance * Math.sin(polarRad) * Math.cos(azimuthRad)

    return new THREE.Vector3(x, y, z)
}

// =============================================================================
// COMPONENTE: Modelo de vehículo cargado (OPTIMIZADO)
// =============================================================================

// Cache de modelos base procesados (sin color aplicado)
const baseModelCache = new Map<string, THREE.Group>()

// NO precargar todos los modelos - se cargan bajo demanda
// Esto mejora significativamente el tiempo de carga inicial

// Tipo para los colores de cada zona del vehículo
interface VehicleZoneColors {
    body: string
    wheels: string
    calipers: string
    interior: string
    accents: string
    aero: string
    lights: string
}

// Tipo para los acabados de cada zona
type FinishType = 'gloss' | 'matte' | 'satin' | 'metallic' | 'pearl' | 'chrome'

interface VehicleZoneFinishes {
    body: FinishType
    wheels: FinishType
    calipers: FinishType
    interior: FinishType
    accents: FinishType
    aero: FinishType
    lights: FinishType
}

// Propiedades de material según el acabado - REALISTAS con reflejos de luz
const FINISH_PROPERTIES: Record<FinishType, {
    roughness: number
    metalness: number
    clearcoat: number
    clearcoatRoughness: number
    reflectivity: number
    envMapIntensity: number
    sheen?: number
    sheenRoughness?: number
    sheenColor?: string
    iridescence?: number
    iridescenceIOR?: number
}> = {
    // BRILLANTE - Pintura de fábrica nueva, muy reflectante
    gloss: {
        roughness: 0.08,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.03,
        reflectivity: 1.0,
        envMapIntensity: 1.2
    },
    // MATE - Sin brillo, absorbe luz, aspecto aterciopelado
    matte: {
        roughness: 0.95,
        metalness: 0.0,
        clearcoat: 0.0,
        clearcoatRoughness: 0.0,
        reflectivity: 0.0,
        envMapIntensity: 0.3
    },
    // SATINADO - Semi-brillo suave, elegante
    satin: {
        roughness: 0.35,
        metalness: 0.05,
        clearcoat: 0.4,
        clearcoatRoughness: 0.15,
        reflectivity: 0.5,
        envMapIntensity: 0.7
    },
    // METÁLICO - Partículas metálicas, brillo profundo
    metallic: {
        roughness: 0.15,
        metalness: 0.85,
        clearcoat: 0.9,
        clearcoatRoughness: 0.05,
        reflectivity: 1.0,
        envMapIntensity: 1.5,
        sheen: 0.3,
        sheenRoughness: 0.2
    },
    // PERLADO - Efecto iridiscente, cambia de color con la luz
    pearl: {
        roughness: 0.1,
        metalness: 0.3,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        reflectivity: 1.0,
        envMapIntensity: 1.8,
        iridescence: 1.0,
        iridescenceIOR: 1.5
    },
    // CROMADO - Espejo perfecto, máxima reflexión
    chrome: {
        roughness: 0.0,
        metalness: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        reflectivity: 1.0,
        envMapIntensity: 2.5
    }
}

function LoadedVehicleModel({
    vehicleId,
    colors,
    finishes
}: {
    vehicleId: string
    colors: VehicleZoneColors
    finishes: VehicleZoneFinishes
}) {
    const modelRef = useRef<THREE.Group>(null)
    const modelPath = `/models/vehicles/${vehicleId}/base.glb`

    // Load the GLB model con DRACO
    const gltf = useGLTF(modelPath)

    // Use bounds API to auto-fit model
    const bounds = useBounds()

    // Procesar y cachear el modelo BASE (sin color)
    const baseScene = useMemo(() => {
        const cacheKey = vehicleId

        if (baseModelCache.has(cacheKey)) {
            // Clonar la escena Y los materiales para evitar compartir estado
            const cachedScene = baseModelCache.get(cacheKey)!
            const clonedScene = cachedScene.clone()

            // Importante: clonar los materiales también
            clonedScene.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material) {
                    if (Array.isArray(child.material)) {
                        child.material = child.material.map(mat => mat.clone())
                    } else {
                        child.material = child.material.clone()
                    }
                }
            })

            return clonedScene
        }

        const scene = gltf.scene.clone()

        // SEPARAR LLANTAS DEL R34 (antes de transformar)
        // Esto crea un mesh separado 'wheel_separated' desde body_main
        if (vehicleId === 'nissan-skyline-r34') {
            separateR34Wheels(scene)
        }

        // Reuse vectors para evitar garbage collection
        const box = new THREE.Box3()
        const center = new THREE.Vector3()
        const size = new THREE.Vector3()

        // 1. PRIMERO aplicar rotación inicial (antes de calcular centrado)
        const initialRotation = MODEL_INITIAL_ROTATION[vehicleId] ?? 0
        scene.rotation.y = (initialRotation * Math.PI) / 180
        scene.updateMatrixWorld(true) // Forzar actualización de matrices

        // 2. Calculate bounding box DESPUÉS de rotar
        box.setFromObject(scene)
        box.getCenter(center)
        box.getSize(size)

        // 3. Calculate scale to fit model (3.5 units)
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = maxDim > 0 ? 3.5 / maxDim : 1

        // 4. Apply scale
        scene.scale.setScalar(scale)
        scene.updateMatrixWorld(true)

        // 5. Recalcular bounding box después del escalado
        box.setFromObject(scene)
        box.getCenter(center)

        // 6. Centrar el modelo en X y Z
        scene.position.set(
            -center.x,
            0,
            -center.z
        )
        scene.updateMatrixWorld(true)

        // 7. Posicionar en Y para que esté sobre el suelo
        box.setFromObject(scene)
        scene.position.y = -box.min.y

        // 8. Aplicar offset de posición específico por vehículo (si existe)
        const posOffset = MODEL_POSITION_OFFSET[vehicleId]
        if (posOffset) {
            scene.position.x += posOffset.x
            scene.position.y += posOffset.y
            scene.position.z += posOffset.z
        }

        // Optimizar geometría y configurar sombras (sin aplicar color aún)
        scene.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return

            // Configurar sombras
            child.castShadow = true
            child.receiveShadow = false

            // Optimizar geometría
            if (child.geometry) {
                child.geometry.computeBoundingSphere()
                if (child.geometry.attributes.uv2) {
                    child.geometry.deleteAttribute('uv2')
                }
            }

            child.frustumCulled = true

            // Clonar materiales para poder modificarlos después
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material = child.material.map(mat => mat.clone())
                } else {
                    child.material = child.material.clone()
                }
            }
        })

        // Marcar para no actualizar matriz automáticamente
        scene.matrixAutoUpdate = false
        scene.updateMatrix()

        baseModelCache.set(cacheKey, scene.clone())
        return scene
    }, [gltf.scene, vehicleId])

    // Aplicar colores y acabados por zona al modelo
    useEffect(() => {
        if (!baseScene) return

        // Crear objetos de color para cada zona
        const zoneColors = {
            body: new THREE.Color(colors.body),
            wheels: new THREE.Color(colors.wheels),
            calipers: new THREE.Color(colors.calipers),
            interior: new THREE.Color(colors.interior),
            accents: new THREE.Color(colors.accents),
            aero: new THREE.Color(colors.aero),
            lights: new THREE.Color(colors.lights),
        }

        // =====================================================================
        // CONFIGURACIÓN ESPECÍFICA POR VEHÍCULO
        // Basado en los materiales renombrados de cada modelo GLB
        // =====================================================================
        const vehicleMaterialConfig: Record<string, {
            body: string[]
            wheels: string[]
            calipers: string[]
            interior: string[]
            exclude?: string[]  // Materiales a excluir completamente (no cambiar nunca)
        }> = {
            // =====================================================================
            // TOYOTA SUPRA A80
            // Materiales: carpaint, interior, glass, chrome, plastic, misc_metal, etc.
            // =====================================================================
            'toyota-supra-a80': {
                body: ['carpaint'],
                wheels: [],  // No tiene material de llanta editable separado
                calipers: [],
                interior: ['interior']
            },
            // =====================================================================
            // SUBARU IMPREZA STI
            // Materiales con prefijo Sub_2M_ - algunos tienen texturas
            // =====================================================================
            'subaru-impreza-sti': {
                body: ['sub_2m_carpaint_max1'],  // Sin textura
                wheels: ['sub_2m_rim_main_max1', 'sub_2m_rim_notint_max1'],  // Solo normalTexture
                calipers: [],  // sub_1MAT_Tire_Brake tiene textura completa
                interior: [],  // Tiene textura completa
                exclude: ['sub_1mat_tire_brake', 'sub_2m_interior']  // Tienen texturas
            },
            // =====================================================================
            // MITSUBISHI EVO IX
            // Materiales con prefijo mM_ - nombres largos
            // =====================================================================
            'mitsubishi-evo-ix': {
                body: ['mm_carpaint_max'],  // Sin textura - carpaint
                wheels: ['mm_rim_main_max1', 'mm_rim_notint_max1'],  // Solo normalTexture
                calipers: ['callipergloss'],  // Solo normalTexture
                interior: [],  // Tiene textura completa
                exclude: ['mm_interior']  // Tiene textura
            },
            // =====================================================================
            // NISSAN SKYLINE R34
            // Las llantas se separan dinámicamente de body_main en tiempo de ejecución
            // El material wheel_separated se crea por separateR34Wheels()
            // wheel_rim = partes decorativas (molduras), NO las llantas reales
            // =====================================================================
            'nissan-skyline-r34': {
                body: ['body_paint', 'body_main'],
                wheels: ['wheel_separated'],  // Material creado dinámicamente
                calipers: ['caliper_red'],
                interior: ['interior_main'],
                exclude: ['body_secondary', 'wheel_rim']  // body_secondary tiene textura, wheel_rim no son llantas
            },
            // =====================================================================
            // HONDA NSX
            // Materiales renombrados - body_secondary SIN textura (OK editar)
            // =====================================================================
            'honda-nsx': {
                body: ['body_paint', 'body_secondary'],
                wheels: ['wheel_rim'],
                calipers: ['caliper_brake'],
                interior: ['interior_main']
            },
            // =====================================================================
            // MAZDA RX7 FD
            // Materiales renombrados - todo sin texturas de color
            // =====================================================================
            'mazda-rx7-fd': {
                body: ['body_paint', 'body_secondary'],
                wheels: ['wheel_rim'],
                calipers: [],  // No tiene pinzas editables
                interior: ['interior_main']
            }
        }

        // Obtener configuración específica del vehículo actual
        const vehicleConfig = vehicleMaterialConfig[vehicleId] || {
            body: [], wheels: [], calipers: [], interior: []
        }

        // PATRONES GENÉRICOS (aplicables a todos los modelos)
        const genericPatterns = {
            body: [
                'carpaint', 'car_paint', 'body', 'paint', 'carroceria',
                'karosserie', 'carrosserie', 'carrozzeria', 'exterior'
            ],
            wheels: [
                'wheel', 'rim', 'llanta', 'felge', 'jante', 'cerchio', 'spoke'
            ],
            calipers: [
                'caliper', 'calliper', 'pinza', 'bremssattel', 'brake_caliper'
            ],
            interior: [
                'interior', 'seat', 'dashboard', 'steering', 'cockpit'
            ],
            aero: [
                'spoiler', 'wing', 'diffuser', 'splitter', 'canard', 'lip', 'skirt'
            ]
        }

        // PATRONES A EXCLUIR SIEMPRE
        const neverChange = [
            'glass', 'window', 'windshield', 'cristal', 'vidrio', 'transparent', 'clear', 'lens',
            'tire', 'tyre', 'rubber', 'goma', 'neumatico', 'pneu', 'reifen',
            'chrome', 'cromo', 'mirror', 'espejo', 'reflector', 'reflective',
            'headlight', 'taillight', 'light', 'lamp', 'faro', 'luz', 'piloto', 'scheinwerfer',
            'engine', 'motor', 'exhaust', 'escape', 'muffler', 'pipe',
            'suspension', 'spring', 'shock', 'brake_disc', 'rotor', 'disc', 'disco',
            'carbon', 'fiber', 'fibra', 'cf_',
            'plastic', 'plastico', 'grill', 'grille', 'vent',
            'badge', 'emblem', 'logo', 'numberplate', 'nothing', 'misc_metal'
        ]

        // Función para determinar la zona de un material
        const getZoneForMaterial = (matName: string, meshName: string): keyof typeof zoneColors | null => {
            const combined = `${matName} ${meshName}`.toLowerCase()

            // 0. Verificar exclusiones ESPECÍFICAS del vehículo (prioridad máxima)
            if (vehicleConfig.exclude) {
                for (const pattern of vehicleConfig.exclude) {
                    if (combined.includes(pattern.toLowerCase())) {
                        return null  // Log se hará después con debugLog
                    }
                }
            }

            // 1. Verificar si debe excluirse SIEMPRE (patrones globales)
            for (const pattern of neverChange) {
                if (combined.includes(pattern)) {
                    return null
                }
            }

            // 2. Verificar configuración ESPECÍFICA del vehículo (prioridad máxima)
            for (const pattern of vehicleConfig.calipers) {
                if (combined.includes(pattern.toLowerCase())) return 'calipers'
            }
            for (const pattern of vehicleConfig.wheels) {
                if (combined.includes(pattern.toLowerCase())) return 'wheels'
            }
            for (const pattern of vehicleConfig.interior) {
                if (combined.includes(pattern.toLowerCase())) return 'interior'
            }
            for (const pattern of vehicleConfig.body) {
                if (combined.includes(pattern.toLowerCase())) return 'body'
            }

            // 3. Verificar patrones GENÉRICOS
            for (const pattern of genericPatterns.calipers) {
                if (combined.includes(pattern)) return 'calipers'
            }
            for (const pattern of genericPatterns.wheels) {
                if (combined.includes(pattern)) return 'wheels'
            }
            for (const pattern of genericPatterns.interior) {
                if (combined.includes(pattern)) return 'interior'
            }
            for (const pattern of genericPatterns.aero) {
                if (combined.includes(pattern)) return 'aero'
            }
            for (const pattern of genericPatterns.body) {
                if (combined.includes(pattern)) return 'body'
            }

            return null
        }

        // Función para aplicar acabados mejorados al material
        const applyFinishToMaterial = (mat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial, finish: FinishType) => {
            const props = FINISH_PROPERTIES[finish]

            mat.roughness = props.roughness
            mat.metalness = props.metalness
            mat.envMapIntensity = props.envMapIntensity

            // Propiedades avanzadas solo disponibles en MeshPhysicalMaterial
            if (mat instanceof THREE.MeshPhysicalMaterial) {
                mat.clearcoat = props.clearcoat
                mat.clearcoatRoughness = props.clearcoatRoughness
                mat.reflectivity = props.reflectivity

                // Efecto metálico con sheen
                if (props.sheen !== undefined) {
                    mat.sheen = props.sheen
                    mat.sheenRoughness = props.sheenRoughness ?? 0.25
                    mat.sheenColor = new THREE.Color(0xffffff)
                }

                // Efecto iridiscente (perlado)
                if (props.iridescence !== undefined) {
                    mat.iridescence = props.iridescence
                    mat.iridescenceIOR = props.iridescenceIOR ?? 1.3
                }
            }
        }

        // Almacenar materiales originales para referencia
        const processedMaterials = new Set<THREE.Material>()

        baseScene.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return
            if (!child.material) return

            const applyColorAndFinish = (mat: THREE.Material) => {
                // Evitar procesar el mismo material dos veces
                if (processedMaterials.has(mat)) return

                if (!(mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial)) return

                const matName = mat.name?.toLowerCase() || ''
                const meshName = child.name?.toLowerCase() || ''

                const zone = getZoneForMaterial(matName, meshName)

                if (zone) {
                    processedMaterials.add(mat)

                    // Aplicar color de la zona
                    mat.color.copy(zoneColors[zone])

                    // PARA LLANTAS: Forzar propiedades específicas para que el color sea visible
                    if (zone === 'wheels') {
                        // Remover cualquier textura que pueda estar ocultando el color
                        if (mat.map) mat.map = null
                        // Asegurar que el color sea visible
                        mat.metalness = 0.8  // Metálico pero no tanto que oculte el color
                        mat.roughness = 0.3  // Un poco de brillo
                        mat.envMapIntensity = 1.0
                    } else {
                        // Aplicar acabado normal para otras zonas
                        applyFinishToMaterial(mat, finishes[zone])
                    }

                    mat.needsUpdate = true
                } else {
                    // HEURÍSTICA para modelos con materiales genéricos (Nissan, Honda, Mazda)
                    // Solo aplicar si el vehículo usa materiales genéricos
                    const usesGenericMaterials = vehicleConfig.body.length === 0

                    if (usesGenericMaterials && !processedMaterials.has(mat)) {
                        const r = mat.color.r
                        const g = mat.color.g
                        const b = mat.color.b
                        const brightness = (r + g + b) / 3

                        // Detectar materiales "pintables":
                        // - No son negros puros (brightness > 0.05)
                        // - No son blancos puros (brightness < 0.98)
                        // - Son opacos (opacity > 0.9)
                        // - No son muy metálicos originalmente (metalness < 0.7)
                        // - Tienen algo de color (no grises puros)
                        const max = Math.max(r, g, b)
                        const min = Math.min(r, g, b)
                        const saturation = max > 0 ? (max - min) / max : 0

                        const isPaintable =
                            brightness > 0.05 &&
                            brightness < 0.98 &&
                            mat.opacity > 0.9 &&
                            mat.metalness < 0.7 &&
                            (saturation > 0.15 || (brightness > 0.2 && brightness < 0.8))

                        if (isPaintable) {
                            processedMaterials.add(mat)
                            mat.color.copy(zoneColors.body)
                            applyFinishToMaterial(mat, finishes.body)
                            mat.needsUpdate = true
                            // console.log(`[${vehicleId}] ✓ HEURÍSTICA body "${matName}" bright=${brightness.toFixed(2)} sat=${saturation.toFixed(2)}`)
                        }
                    }
                }
            }

            if (Array.isArray(child.material)) {
                child.material.forEach(applyColorAndFinish)
            } else {
                applyColorAndFinish(child.material)
            }
        })
    }, [baseScene, colors, finishes, vehicleId])

    // Fit to view on first load
    useEffect(() => {
        if (bounds && baseScene && modelRef.current) {
            bounds.refresh(modelRef.current).fit()
        }
    }, [bounds, baseScene])

    return (
        <group ref={modelRef}>
            <primitive object={baseScene} dispose={null} />
        </group>
    )
}

// =============================================================================
// COMPONENTE: Modelo placeholder (OPTIMIZADO)
// =============================================================================
const PlaceholderModel = ({ color }: { color: string }) => (
    <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4, 1.2, 2]} />
        <meshBasicMaterial color={color} />
    </mesh>
)

// =============================================================================
// COMPONENTE: Error Boundary
// =============================================================================
interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback: React.ReactNode
    onError?: () => void
}

interface ErrorBoundaryState {
    hasError: boolean
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true }
    }

    componentDidCatch(): void {
        this.props.onError?.()
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback
        }
        return this.props.children
    }
}

// =============================================================================
// COMPONENTE: Wrapper con fallback (OPTIMIZADO - sin verificación HTTP)
// =============================================================================
function VehicleModelWithFallback({
    vehicleId,
    colors,
    finishes
}: {
    vehicleId: string
    colors: VehicleZoneColors
    finishes: VehicleZoneFinishes
}) {
    const [hasError, setHasError] = useState(false)
    const [currentVehicleId, setCurrentVehicleId] = useState(vehicleId)

    // Reset error cuando cambia el vehículo
    useEffect(() => {
        if (vehicleId !== currentVehicleId) {
            setHasError(false)
            setCurrentVehicleId(vehicleId)
        }
    }, [vehicleId, currentVehicleId])

    const handleError = useCallback(() => {
        setHasError(true)
    }, [])

    // Si hay error, mostrar placeholder
    if (hasError) {
        return <PlaceholderModel color={colors.body} />
    }

    // Intentar cargar el modelo directamente (sin verificación HTTP previa)
    return (
        <ErrorBoundary onError={handleError} fallback={<PlaceholderModel color={colors.body} />}>
            <LoadedVehicleModel vehicleId={vehicleId} colors={colors} finishes={finishes} />
        </ErrorBoundary>
    )
}

// =============================================================================
// COMPONENTE: Control de cámara con transiciones suaves
// =============================================================================
function CameraController({
    preset,
    isAutoRotating,
    controlsRef,
    vehicleId,
    zoom
}: {
    preset: string
    isAutoRotating: boolean
    controlsRef: React.RefObject<OrbitControlsImpl | null>
    vehicleId: string
    zoom: number
}) {
    const { camera } = useThree()

    // Sincronizar autoRotate
    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.autoRotate = isAutoRotating
        }
    }, [isAutoRotating, controlsRef])

    // Aplicar zoom cuando cambia
    useEffect(() => {
        if (!controlsRef.current) return

        // El zoom afecta la distancia de la cámara
        // zoom = 1 es distancia normal, zoom > 1 acerca, zoom < 1 aleja
        const baseDistance = 6
        const targetDistance = baseDistance / zoom

        // Obtener dirección actual de la cámara
        const direction = new THREE.Vector3()
        direction.subVectors(camera.position, controlsRef.current.target).normalize()

        // Aplicar nueva distancia
        camera.position.copy(controlsRef.current.target).addScaledVector(direction, targetDistance)
        controlsRef.current.update()
    }, [zoom, camera, controlsRef])

    // Cuando cambia el preset o el vehículo, posicionar cámara directamente
    useEffect(() => {
        if (!controlsRef.current) return

        // Aplicar swap de vistas si el vehículo lo necesita
        const vehicleSwaps = CAMERA_VIEW_SWAP[vehicleId]
        const effectivePreset = vehicleSwaps?.[preset] ?? preset

        const viewConfig = CAMERA_VIEWS[effectivePreset] || CAMERA_VIEWS['three-quarter']

        // Aplicar offset de ángulo azimutal si el vehículo lo necesita
        const azimuthOffset = CAMERA_AZIMUTH_OFFSET[vehicleId] ?? 0
        const adjustedAzimuth = (viewConfig.azimuth + azimuthOffset) % 360

        // Ajustar distancia según zoom actual
        const adjustedDistance = viewConfig.distance / zoom

        const newPosition = sphericalToCartesian(
            adjustedAzimuth,
            viewConfig.polar,
            adjustedDistance,
            viewConfig.targetY
        )

        // Posicionar cámara directamente (sin animación)
        camera.position.copy(newPosition)
        controlsRef.current.target.set(0, viewConfig.targetY, 0)
        controlsRef.current.update()
    }, [preset, camera, controlsRef, vehicleId, zoom])

    return null
}

// =============================================================================
// COMPONENTE: Loading fallback (OPTIMIZADO - sin animación)
// =============================================================================
const LoadingFallback = ({ color }: { color: string }) => (
    <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[3, 1, 1.5]} />
        <meshBasicMaterial color={color} wireframe />
    </mesh>
)

// =============================================================================
// COMPONENTE: Reporter de rotación (OPTIMIZADO)
// =============================================================================
// Reporta ángulo azimutal con throttling para reducir re-renders
function RotationReporter({
    controlsRef,
    onRotationChange
}: {
    controlsRef: React.RefObject<OrbitControlsImpl | null>
    onRotationChange?: (azimuth: number) => void
}) {
    const { camera } = useThree()
    const lastReportedAngle = useRef(0)
    const frameCount = useRef(0)

    // Solo ejecutar cada 6 frames (~10 FPS para el reporte)
    useFrame(() => {
        if (!onRotationChange || !controlsRef.current) return

        frameCount.current++
        if (frameCount.current < 6) return
        frameCount.current = 0

        const target = controlsRef.current.target
        const dx = camera.position.x - target.x
        const dz = camera.position.z - target.z

        let azimuth = Math.atan2(dx, dz) * 57.2957795 // 180/PI precalculado
        if (azimuth < 0) azimuth += 360

        // Solo reportar si cambió más de 2 grados
        if (Math.abs(azimuth - lastReportedAngle.current) > 2) {
            lastReportedAngle.current = azimuth
            onRotationChange(azimuth | 0) // Bitwise OR para truncar (más rápido que Math.round)
        }
    })

    return null
}

// =============================================================================
// COMPONENTE PRINCIPAL: Vehicle3DCanvas
// =============================================================================
interface Vehicle3DCanvasProps {
    vehicle: Vehicle
    isRotating?: boolean
    cameraPreset?: string
    environment?: 'studio' | 'garage' | 'outdoor' | 'showroom'
    zoom?: number // Nivel de zoom (0.5 - 2)
    vehicleColors?: {
        body: string
        wheels: string
        calipers: string
        interior: string
        accents: string
        aero: string
        lights: string
    }
    vehicleFinishes?: VehicleZoneFinishes
    onRotationChange?: (azimuth: number) => void
}

export function Vehicle3DCanvas({
    vehicle,
    isRotating = true,
    cameraPreset = 'three-quarter',
    environment = 'studio',
    zoom = 1,
    vehicleColors,
    vehicleFinishes,
    onRotationChange,
}: Vehicle3DCanvasProps) {
    const controlsRef = useRef<OrbitControlsImpl | null>(null)

    // Colores por zona: prioridad a vehicleColors, luego valores por defecto
    const defaultColors: VehicleZoneColors = {
        body: vehicle.livery.primaryColor,
        wheels: '#4a4a4a',
        calipers: '#dc2626',
        interior: '#1a1a2e',
        accents: '#00d4ff',
        aero: vehicle.livery.primaryColor,
        lights: '#ffffff',
    }
    const allColors: VehicleZoneColors = vehicleColors ? { ...defaultColors, ...vehicleColors } : defaultColors
    const bodyColor = allColors.body

    // Finishes por zona: prioridad a vehicleFinishes, luego valores por defecto
    const defaultFinishes: VehicleZoneFinishes = {
        body: 'metallic',
        wheels: 'gloss',
        calipers: 'gloss',
        interior: 'matte',
        accents: 'chrome',
        aero: 'satin',
        lights: 'gloss',
    }
    const allFinishes: VehicleZoneFinishes = vehicleFinishes ? { ...defaultFinishes, ...vehicleFinishes } : defaultFinishes

    const environmentMap: Record<string, PresetsType> = {
        'studio': 'studio',
        'garage': 'warehouse',
        'outdoor': 'sunset',
        'showroom': 'night'
    }

    // Posición inicial de la cámara basada en el preset
    const initialCameraPosition = useMemo(() => {
        const viewConfig = CAMERA_VIEWS[cameraPreset] || CAMERA_VIEWS['three-quarter']
        return sphericalToCartesian(
            viewConfig.azimuth,
            viewConfig.polar,
            viewConfig.distance,
            viewConfig.targetY
        )
    }, [cameraPreset])

    return (
        <Canvas
            shadows="soft"
            dpr={[1, 1.5]} // Reducir DPR máximo para mejor rendimiento
            camera={{
                position: [initialCameraPosition.x, initialCameraPosition.y, initialCameraPosition.z],
                fov: 45,
                near: 0.1,
                far: 50 // Reducir far plane
            }}
            style={{ background: 'transparent' }}
            gl={{
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance',
                stencil: false, // Desactivar stencil buffer si no se usa
                depth: true,
                logarithmicDepthBuffer: false // Mejor rendimiento
            }}
            performance={{ min: 0.5 }} // Throttle adaptativo
        >
            {/* Lighting - Optimizado para rendimiento */}
            <ambientLight intensity={0.6} />
            <hemisphereLight intensity={0.4} color="#ffffff" groundColor="#1e3a5f" />

            {/* Luz principal con sombras optimizadas */}
            <spotLight
                position={[8, 8, 8]}
                angle={0.4}
                penumbra={0.5}
                intensity={1.2}
                castShadow
                shadow-mapSize={512} // Reducido de 1024 para mejor rendimiento
                shadow-bias={-0.001}
                shadow-camera-near={1}
                shadow-camera-far={20}
            />

            {/* Luz secundaria sin sombras */}
            <spotLight
                position={[-8, 6, -8]}
                angle={0.4}
                penumbra={0.5}
                intensity={0.6}
                castShadow={false} // Sin sombras para mejor rendimiento
            />

            {/* Environment */}
            <Environment preset={environmentMap[environment]} />

            {/* Ground shadow - Optimizado */}
            <ContactShadows
                position={[0, 0, 0]}
                opacity={0.4}
                scale={10}
                blur={2}
                far={3}
                resolution={256} // Reducido para mejor rendimiento
                frames={1} // Solo renderizar una vez
            />

            {/* Subtle floor plane - Geometría simplificada */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
                <circleGeometry args={[6, 32]} /> {/* Reducido de 64 segmentos */}
                <meshStandardMaterial
                    color="#0a1628"
                    transparent
                    opacity={0.7}
                    roughness={1}
                    metalness={0}
                />
            </mesh>

            {/* Vehicle Model */}
            <Bounds fit clip observe margin={1.2}>
                <Suspense fallback={<LoadingFallback color={bodyColor} />}>
                    <VehicleModelWithFallback
                        vehicleId={vehicle.id}
                        colors={allColors}
                        finishes={allFinishes}
                    />
                </Suspense>
            </Bounds>

            {/* Camera Controller */}
            <CameraController
                preset={cameraPreset}
                isAutoRotating={isRotating}
                controlsRef={controlsRef}
                vehicleId={vehicle.id}
                zoom={zoom}
            />

            {/* Rotation Reporter - reporta el ángulo azimutal al padre */}
            <RotationReporter
                controlsRef={controlsRef}
                onRotationChange={onRotationChange}
            />

            {/* Orbit Controls - Optimizado */}
            <OrbitControls
                ref={controlsRef}
                enablePan={false}
                enableZoom={true}
                enableRotate={true}
                minDistance={3}
                maxDistance={10}
                minPolarAngle={0.3}
                maxPolarAngle={Math.PI / 2 - 0.1}
                target={[0, 0.5, 0]}
                autoRotate={isRotating}
                autoRotateSpeed={1.2}
                enableDamping={true}
                dampingFactor={0.08}
                rotateSpeed={0.5}
                makeDefault
            />

            {/* Preload de assets */}
            <Preload all />
        </Canvas>
    )
}
