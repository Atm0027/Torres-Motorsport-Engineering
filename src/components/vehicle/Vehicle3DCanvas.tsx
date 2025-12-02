import React, { Suspense, useRef, useEffect, useState, useCallback, useMemo, memo } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Bounds, useBounds, Preload, Environment } from '@react-three/drei'
import * as THREE from 'three'
import type { Vehicle } from '@/types'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

// =============================================================================
// MAPEO DE ENTORNOS A ARCHIVOS HDR LOCALES
// =============================================================================
const ENVIRONMENT_HDR_FILES: Record<string, string> = {
    'studio': '/environments/studio.hdr',
    'garage': '/environments/garage.hdr',
    'outdoor': '/environments/outdoor.hdr',
    'showroom': '/environments/showroom.hdr'
}

// =============================================================================
// PRECARGA DE MODELOS - Mejora el tiempo de carga
// =============================================================================
const VEHICLE_IDS = [
    'nissan-skyline-r34',
    'toyota-supra-a80',
    'mazda-rx7-fd',
    'honda-nsx',
    'mitsubishi-evo-ix',
    'subaru-impreza-sti'
]

// Precargar todos los modelos al cargar el módulo
VEHICLE_IDS.forEach(id => {
    useGLTF.preload(`/models/vehicles/${id}/base.glb`)
})

// =============================================================================
// OPTIMIZACIÓN: Pre-cargar geometrías y materiales reutilizables
// =============================================================================
const sharedGeometries = {
    floor: new THREE.CircleGeometry(6, 24), // Reducido a 24 segmentos
    placeholder: new THREE.BoxGeometry(4, 1.2, 2),
    loading: new THREE.BoxGeometry(3, 1, 1.5)
}

// =============================================================================
// CONFIGURACIÓN DE ENTORNOS DE ILUMINACIÓN
// =============================================================================
type EnvironmentType = 'studio' | 'garage' | 'outdoor' | 'showroom'

interface EnvironmentConfig {
    ambient: { intensity: number; color: string }
    hemisphere: { intensity: number; skyColor: string; groundColor: string }
    mainLight: { position: [number, number, number]; intensity: number; color: string }
    fillLight: { position: [number, number, number]; intensity: number; color: string }
    backLight: { position: [number, number, number]; intensity: number; color: string }
    rimLight?: { position: [number, number, number]; intensity: number; color: string }
    floorColor: string
    floorOpacity: number
}

const ENVIRONMENT_CONFIGS: Record<EnvironmentType, EnvironmentConfig> = {
    // ESTUDIO - Iluminación profesional de fotografía, neutra y equilibrada
    studio: {
        ambient: { intensity: 0.6, color: '#ffffff' },
        hemisphere: { intensity: 0.4, skyColor: '#ffffff', groundColor: '#404040' },
        mainLight: { position: [8, 10, 8], intensity: 1.8, color: '#ffffff' },
        fillLight: { position: [-6, 6, -4], intensity: 0.9, color: '#e8e8ff' },
        backLight: { position: [0, 4, -8], intensity: 0.5, color: '#ffffff' },
        rimLight: { position: [-8, 3, 0], intensity: 0.4, color: '#ffffff' },
        floorColor: '#1a1a2e',
        floorOpacity: 0.8
    },
    // GARAJE - Iluminación cálida industrial, sombras más marcadas
    garage: {
        ambient: { intensity: 0.4, color: '#fff5e6' },
        hemisphere: { intensity: 0.3, skyColor: '#ffcc80', groundColor: '#2d2d2d' },
        mainLight: { position: [5, 8, 5], intensity: 1.5, color: '#ffd699' },
        fillLight: { position: [-4, 4, -3], intensity: 0.5, color: '#ff9933' },
        backLight: { position: [0, 3, -6], intensity: 0.3, color: '#ffb366' },
        floorColor: '#2a2520',
        floorOpacity: 0.9
    },
    // EXTERIOR - Luz natural del sol, cielo azul, sombras suaves
    outdoor: {
        ambient: { intensity: 0.5, color: '#e6f2ff' },
        hemisphere: { intensity: 0.6, skyColor: '#87ceeb', groundColor: '#3d5c3d' },
        mainLight: { position: [10, 12, 6], intensity: 2.0, color: '#fffaf0' },
        fillLight: { position: [-8, 5, -5], intensity: 0.7, color: '#add8e6' },
        backLight: { position: [-2, 6, -10], intensity: 0.4, color: '#87ceeb' },
        rimLight: { position: [6, 2, -4], intensity: 0.3, color: '#ffe4b5' },
        floorColor: '#2d3a2d',
        floorOpacity: 0.7
    },
    // SHOWROOM - Iluminación dramática de exhibición, alto contraste
    showroom: {
        ambient: { intensity: 0.3, color: '#e6e6ff' },
        hemisphere: { intensity: 0.2, skyColor: '#4a4a6a', groundColor: '#0a0a14' },
        mainLight: { position: [6, 12, 6], intensity: 2.2, color: '#ffffff' },
        fillLight: { position: [-5, 8, -4], intensity: 0.6, color: '#9999ff' },
        backLight: { position: [0, 5, -8], intensity: 0.8, color: '#6666ff' },
        rimLight: { position: [-6, 2, 2], intensity: 0.5, color: '#00d4ff' },
        floorColor: '#0a0a1a',
        floorOpacity: 0.95
    }
}

// Materiales de suelo para cada entorno (se crean dinámicamente)
const createFloorMaterial = (config: EnvironmentConfig) => {
    return new THREE.MeshStandardMaterial({
        color: config.floorColor,
        transparent: true,
        opacity: config.floorOpacity,
        roughness: 0.8,
        metalness: 0.1
    })
}

// =============================================================================
// COMPONENTE: Iluminación por Entorno (con HDR + luces de apoyo)
// =============================================================================
const EnvironmentLighting = memo(({ environment }: { environment: EnvironmentType }) => {
    const config = ENVIRONMENT_CONFIGS[environment]
    const hdrFile = ENVIRONMENT_HDR_FILES[environment]

    return (
        <>
            {/* Entorno HDR para reflexiones y luz ambiental */}
            <Environment files={hdrFile} background={false} />

            {/* Luz ambiental base (reducida porque HDR aporta) */}
            <ambientLight intensity={config.ambient.intensity * 0.5} color={config.ambient.color} />

            {/* Luz hemisférica para simular cielo/suelo */}
            <hemisphereLight
                intensity={config.hemisphere.intensity * 0.5}
                color={config.hemisphere.skyColor}
                groundColor={config.hemisphere.groundColor}
            />

            {/* Luz principal (key light) */}
            <directionalLight
                position={config.mainLight.position}
                intensity={config.mainLight.intensity}
                color={config.mainLight.color}
                castShadow={false}
            />

            {/* Luz de relleno (fill light) */}
            <directionalLight
                position={config.fillLight.position}
                intensity={config.fillLight.intensity}
                color={config.fillLight.color}
            />

            {/* Luz trasera (back light) */}
            <directionalLight
                position={config.backLight.position}
                intensity={config.backLight.intensity}
                color={config.backLight.color}
            />

            {/* Luz de borde opcional (rim light) */}
            {config.rimLight && (
                <directionalLight
                    position={config.rimLight.position}
                    intensity={config.rimLight.intensity}
                    color={config.rimLight.color}
                />
            )}
        </>
    )
})
EnvironmentLighting.displayName = 'EnvironmentLighting'

// =============================================================================
// COMPONENTE: Suelo del Entorno
// =============================================================================
const EnvironmentFloor = memo(({ environment }: { environment: EnvironmentType }) => {
    const config = ENVIRONMENT_CONFIGS[environment]

    const material = useMemo(() => createFloorMaterial(config), [config])

    useEffect(() => {
        return () => material.dispose()
    }, [material])

    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.001, 0]}
            receiveShadow
            geometry={sharedGeometries.floor}
            material={material}
        />
    )
})
EnvironmentFloor.displayName = 'EnvironmentFloor'

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
    let foundMesh: THREE.Mesh | null = null

    // Buscar el mesh body_main
    scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            const matName = (child.material as THREE.Material)?.name?.toLowerCase() || ''
            if (matName === 'body_main') {
                foundMesh = child
            }
        }
    })

    if (!foundMesh) return

    // Asignar a variable no-null para TypeScript
    const bodyMesh: THREE.Mesh = foundMesh

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

    console.log(`[3D] Cargando modelo: ${modelPath}`)

    // Load the GLB model
    const gltf = useGLTF(modelPath)

    console.log(`[3D] Modelo cargado: ${vehicleId}`, gltf.scene ? 'OK' : 'ERROR')

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

    // Referencia para evitar re-aplicar colores innecesariamente
    const lastColorsRef = useRef<string>('')
    const lastFinishesRef = useRef<string>('')

    // Aplicar colores y acabados por zona al modelo
    useEffect(() => {
        if (!baseScene) return

        // Serializar colores y acabados para comparar
        const colorsKey = JSON.stringify(colors)
        const finishesKey = JSON.stringify(finishes)

        // Si los colores y acabados no cambiaron, no hacer nada
        if (colorsKey === lastColorsRef.current && finishesKey === lastFinishesRef.current) {
            return
        }

        // Actualizar referencias
        lastColorsRef.current = colorsKey
        lastFinishesRef.current = finishesKey

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
        // Nombres EXACTOS de materiales obtenidos del análisis de los modelos GLB
        // =====================================================================
        const vehicleMaterialConfig: Record<string, {
            body: string[]
            wheels: string[]
            calipers: string[]
            interior: string[]
            exclude?: string[]
        }> = {
            // =====================================================================
            // TOYOTA SUPRA A80 - FUNCIONA CORRECTAMENTE (REFERENCIA)
            // =====================================================================
            'toyota-supra-a80': {
                body: ['carpaint'],
                wheels: ['wheel_metal'],  // wheel_metal.001 - busca por prefijo
                calipers: [],
                interior: ['interior'],
                exclude: ['glass', 'chrome', 'light', 'tire', 'rubber', 'plastic']
            },
            // =====================================================================
            // SUBARU IMPREZA STI
            // =====================================================================
            'subaru-impreza-sti': {
                body: ['sub_2m_carpaint_max1', 'sub_2m_carpaintnormal_max1'],
                wheels: ['sub_2m_rim_main_max1', 'sub_2m_rim_notint_max1'],
                calipers: [],  // Tiene textura, no editable
                interior: [],  // Tiene textura, no editable
                exclude: ['tire', 'glass', 'chrome', 'light', 'rubber', 'interior', 'badge']
            },
            // =====================================================================
            // MITSUBISHI EVO IX
            // =====================================================================
            'mitsubishi-evo-ix': {
                body: ['mm_carpaint_max_002', 'mm_carpaintnormal_max1'],
                wheels: ['mm_rim_main_max1', 'mm_rim_notint_max1'],
                calipers: ['callipergloss'],  // mmitsubishi...callipergloss
                interior: [],  // Tiene textura, no editable
                exclude: ['tire', 'glass', 'chrome', 'light', 'rubber', 'interior', 'badge', 'carbon']
            },
            // =====================================================================
            // NISSAN SKYLINE R34
            // ANÁLISIS: body_paint = carrocería principal
            // wheel_rim = llantas, caliper_red = pinzas de freno
            // =====================================================================
            'nissan-skyline-r34': {
                body: ['body_paint', 'body_main'],  // Carrocería principal
                wheels: ['wheel_rim'],  // Llantas
                calipers: ['caliper_red'],
                interior: ['interior_main'],
                exclude: ['glass', 'light', 'tire', 'rubber', 'plastic', 'body_secondary', 'exhaust', 'brake_disc', 'badge', 'chrome_trim', 'chrome']
            },
            // =====================================================================
            // HONDA NSX
            // MODELO EDITADO EN BLENDER: Material.023 renombrado a body_main
            // Material.021 renombrado a body_accent (parachoques)
            // wheel_rim=12953v (llantas), caliper_brake=720v (pinzas)
            // =====================================================================
            'honda-nsx': {
                body: ['body_main', 'body_accent'],  // Carrocería + parachoques (renombrados en Blender)
                wheels: ['wheel_rim'],   // Llantas (12953 vértices)
                calipers: ['caliper_brake'],  // Pinzas de freno
                interior: ['interior_main'],  // Interior
                exclude: ['glass', 'light', 'tire', 'rubber', 'plastic', 'body_secondary', 'exhaust', 'brake_disc', 'body_paint', 'chrome_trim', 'interior_trim', 'misc_parts']
            },
            // =====================================================================
            // MAZDA RX7 FD
            // ANÁLISIS: body_paint = carrocería principal
            // wheel_rim = llantas
            // =====================================================================
            'mazda-rx7-fd': {
                body: ['body_paint', 'body_main'],  // Carrocería principal
                wheels: ['wheel_rim'],  // Llantas
                calipers: [],  // Sin pinzas editables
                interior: ['interior_main'],
                exclude: ['glass', 'light', 'tire', 'rubber', 'plastic', 'body_secondary', 'exhaust', 'brake_disc', 'chrome_trim', 'chrome', 'interior_trim', 'misc_parts']
            }
        }

        // Obtener configuración específica del vehículo actual
        const vehicleConfig = vehicleMaterialConfig[vehicleId] || {
            body: [], wheels: [], calipers: [], interior: []
        }

        // PATRONES GENÉRICOS (aplicables a todos los modelos)
        // NOTA: Evitar patrones demasiado amplios como 'body' o 'paint' que causan falsos positivos
        const genericPatterns = {
            body: [
                'carpaint', 'car_paint', 'body_paint', 'carroceria',
                'karosserie', 'carrosserie', 'carrozzeria'
            ],
            wheels: [
                'wheel_rim', 'wheel_metal', 'rim_main', 'llanta', 'felge', 'jante', 'cerchio'
            ],
            calipers: [
                'caliper', 'calliper', 'pinza', 'bremssattel', 'brake_caliper'
            ],
            interior: [
                'interior_main', 'interior_max', 'seat', 'dashboard', 'steering', 'cockpit'
            ],
            aero: [
                'spoiler', 'wing', 'diffuser', 'splitter', 'canard', 'lip', 'skirt'
            ]
        }

        // PATRONES A EXCLUIR SIEMPRE (nunca cambiar color)
        const neverChange = [
            'glass', 'window', 'windshield', 'cristal', 'vidrio', 'transparent', 'clear', 'lens',
            'tire', 'tyre', 'rubber', 'goma', 'neumatico', 'pneu', 'reifen',
            'chrome', 'cromo', 'chrome_trim', 'mirror', 'espejo', 'reflector', 'reflective',
            'headlight', 'taillight', 'light', 'lamp', 'faro', 'luz', 'piloto', 'scheinwerfer',
            'engine', 'motor', 'exhaust', 'escape', 'muffler', 'pipe',
            'suspension', 'spring', 'shock', 'brake_disc', 'rotor', 'disc', 'disco',
            'carbon', 'fiber', 'fibra', 'cf_',
            'plastic', 'plastico', 'grill', 'grille', 'vent',
            'badge', 'emblem', 'logo', 'numberplate', 'nothing', 'misc_metal',
            'body_secondary', 'secondary'  // Partes negras/texturas de carrocería
        ]

        // Función para normalizar nombre de material (elimina sufijos .001, .002, etc.)
        const normalizeMaterialName = (name: string): string => {
            return name.replace(/\.\d{3}$/i, '').toLowerCase()
        }

        // Función para determinar la zona de un material
        const getZoneForMaterial = (matName: string, meshName: string): keyof typeof zoneColors | null => {
            const matLower = matName.toLowerCase()
            const matNormalized = normalizeMaterialName(matName)
            const combined = `${matName} ${meshName}`.toLowerCase()

            // 1. PRIMERO: Verificar configuración ESPECÍFICA del vehículo (PRIORIDAD ABSOLUTA)
            // Usa nombre normalizado para mayor compatibilidad con sufijos .001, .002, etc.
            for (const pattern of vehicleConfig.body) {
                if (matNormalized === pattern || matNormalized.includes(pattern) || matLower.includes(pattern)) return 'body'
            }
            for (const pattern of vehicleConfig.wheels) {
                if (matNormalized === pattern || matNormalized.includes(pattern) || matLower.includes(pattern)) return 'wheels'
            }
            for (const pattern of vehicleConfig.calipers) {
                if (matNormalized === pattern || matNormalized.includes(pattern) || matLower.includes(pattern)) return 'calipers'
            }
            for (const pattern of vehicleConfig.interior) {
                if (matNormalized === pattern || matNormalized.includes(pattern) || matLower.includes(pattern)) return 'interior'
            }

            // 2. Verificar exclusiones ESPECÍFICAS del vehículo
            if (vehicleConfig.exclude) {
                for (const pattern of vehicleConfig.exclude) {
                    if (combined.includes(pattern.toLowerCase())) {
                        return null
                    }
                }
            }

            // 3. Verificar si debe excluirse SIEMPRE (patrones globales)
            for (const pattern of neverChange) {
                if (combined.includes(pattern)) {
                    return null
                }
            }

            // 4. Verificar patrones GENÉRICOS (fallback para modelos no configurados)
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

                    // PARA CARROCERÍA: Forzar que el color sea visible
                    if (zone === 'body') {
                        // Remover texturas que puedan ocultar el color
                        if (mat.map) mat.map = null
                        // Propiedades de pintura de coche
                        mat.metalness = 0.4
                        mat.roughness = 0.2
                        mat.envMapIntensity = 1.5
                        // Aplicar acabado configurado
                        applyFinishToMaterial(mat, finishes.body)
                    }
                    // PARA LLANTAS: Forzar propiedades específicas para que el color sea visible
                    else if (zone === 'wheels') {
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
// COMPONENTE: Modelo placeholder (OPTIMIZADO - geometría compartida)
// =============================================================================
const PlaceholderModel = memo(({ color }: { color: string }) => {
    const material = useMemo(() => new THREE.MeshBasicMaterial({ color }), [color])

    useEffect(() => {
        return () => material.dispose()
    }, [material])

    return (
        <mesh position={[0, 0.5, 0]} geometry={sharedGeometries.placeholder} material={material} />
    )
})
PlaceholderModel.displayName = 'PlaceholderModel'

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

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('[3D] Error cargando modelo:', error.message)
        console.error('[3D] Component stack:', errorInfo.componentStack)
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
// COMPONENTE: Loading fallback (OPTIMIZADO - geometría compartida, sin animación)
// =============================================================================
const LoadingFallback = memo(({ color }: { color: string }) => {
    const material = useMemo(() => new THREE.MeshBasicMaterial({ color, wireframe: true }), [color])

    useEffect(() => {
        return () => material.dispose()
    }, [material])

    return (
        <mesh position={[0, 0.5, 0]} geometry={sharedGeometries.loading} material={material} />
    )
})
LoadingFallback.displayName = 'LoadingFallback'

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
            shadows={false} // Desactivar sombras para mejor rendimiento inicial
            dpr={[1, 1.5]} // Reducir DPR máximo para mejor rendimiento
            camera={{
                position: [initialCameraPosition.x, initialCameraPosition.y, initialCameraPosition.z],
                fov: 45,
                near: 0.1,
                far: 50 // Aumentar far plane para evitar clipping
            }}
            style={{ background: 'transparent', width: '100%', height: '100%' }}
            gl={{
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance',
                stencil: false,
                depth: true,
                logarithmicDepthBuffer: false,
                preserveDrawingBuffer: false,
                failIfMajorPerformanceCaveat: false
            }}
            performance={{ min: 0.3, max: 1, debounce: 100 }}
            frameloop="always" // Renderizado continuo para evitar problemas de carga
            flat
        >
            {/* Iluminación dinámica basada en el entorno seleccionado */}
            <EnvironmentLighting environment={environment} />

            {/* Suelo dinámico basado en el entorno */}
            <EnvironmentFloor environment={environment} />

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
