import React, { Suspense, useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, ContactShadows, Bounds, useBounds, Preload } from '@react-three/drei'
import * as THREE from 'three'
import type { Vehicle } from '@/types'
import type { PresetsType } from '@react-three/drei/helpers/environment-assets'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

// =============================================================================
// CONFIGURACIÓN DE RENDIMIENTO
// =============================================================================

// Cache para modelos procesados (evita reprocesamiento)
const modelCache = new Map<string, THREE.Group>()

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

// Cache de materiales reutilizables para evitar clonaciones innecesarias
const materialCache = new Map<string, THREE.Material>()

// NO precargar todos los modelos - se cargan bajo demanda
// Esto mejora significativamente el tiempo de carga inicial

function LoadedVehicleModel({
    vehicleId,
    color
}: {
    vehicleId: string
    color: string
}) {
    const modelRef = useRef<THREE.Group>(null)
    const modelPath = `/models/vehicles/${vehicleId}/base.glb`

    // Load the GLB model con DRACO
    const gltf = useGLTF(modelPath)

    // Use bounds API to auto-fit model
    const bounds = useBounds()

    // Process and cache the model - OPTIMIZADO
    const processedScene = useMemo(() => {
        const cacheKey = `${vehicleId}-${color}`

        if (modelCache.has(cacheKey)) {
            return modelCache.get(cacheKey)!.clone()
        }

        const scene = gltf.scene.clone()

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

        // Optimized material processing - menos clonaciones
        const colorObj = new THREE.Color(color)
        const bodyMaterialNames = ['body', 'paint', 'car', 'exterior', 'main', 'carroceria']

        scene.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return

            // Configurar sombras
            child.castShadow = true
            child.receiveShadow = false // Reducir carga - solo proyectan, no reciben

            // Optimizar geometría
            if (child.geometry) {
                child.geometry.computeBoundingSphere()
                // Eliminar atributos no usados para reducir memoria
                if (child.geometry.attributes.uv2) {
                    child.geometry.deleteAttribute('uv2')
                }
            }

            // Frustum culling activado
            child.frustumCulled = true

            if (!child.material) return

            const processMaterial = (mat: THREE.Material): THREE.Material => {
                const matName = mat.name?.toLowerCase() || ''
                const isBodyMaterial = bodyMaterialNames.some(name => matName.includes(name))

                // Cache key para material
                const matCacheKey = `${mat.uuid}-${isBodyMaterial ? color : 'original'}`

                if (materialCache.has(matCacheKey)) {
                    return materialCache.get(matCacheKey)!
                }

                // Solo clonar si necesitamos modificar
                if (isBodyMaterial && (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial)) {
                    const newMat = mat.clone()
                    newMat.color = colorObj
                    newMat.envMapIntensity = 0.8
                    newMat.needsUpdate = false
                    materialCache.set(matCacheKey, newMat)
                    return newMat
                }

                // Para materiales no-body, optimizar pero no clonar
                if (mat instanceof THREE.MeshStandardMaterial) {
                    mat.envMapIntensity = 0.8
                }

                return mat
            }

            if (Array.isArray(child.material)) {
                child.material = child.material.map(processMaterial)
            } else {
                child.material = processMaterial(child.material)
            }
        })

        // Marcar para no actualizar matriz automáticamente
        scene.matrixAutoUpdate = false
        scene.updateMatrix()

        modelCache.set(cacheKey, scene.clone())
        return scene
    }, [gltf.scene, vehicleId, color])

    // Fit to view on first load
    useEffect(() => {
        if (bounds && processedScene && modelRef.current) {
            bounds.refresh(modelRef.current).fit()
        }
    }, [bounds, processedScene])

    return (
        <group ref={modelRef}>
            <primitive object={processedScene} dispose={null} />
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
// COMPONENTE: Wrapper con fallback
// =============================================================================
function VehicleModelWithFallback({
    vehicleId,
    color
}: {
    vehicleId: string
    color: string
}) {
    const [hasError, setHasError] = useState(false)
    const [modelChecked, setModelChecked] = useState(false)
    const [modelExists, setModelExists] = useState(false)

    // Reset state and check if model file exists when vehicleId changes
    useEffect(() => {
        // Reset states when vehicle changes
        setHasError(false)
        setModelChecked(false)
        setModelExists(false)

        const checkModel = async () => {
            try {
                const response = await fetch(`/models/vehicles/${vehicleId}/base.glb`, { method: 'HEAD' })
                setModelExists(response.ok)
            } catch {
                setModelExists(false)
            }
            setModelChecked(true)
        }
        checkModel()
    }, [vehicleId])

    const handleError = useCallback(() => {
        setHasError(true)
    }, [])

    // Mientras se verifica, no mostrar nada (evita flash del placeholder)
    if (!modelChecked) {
        return null
    }

    // Solo mostrar placeholder si realmente no existe el modelo
    if (hasError || !modelExists) {
        return <PlaceholderModel color={color} />
    }

    return (
        <ErrorBoundary onError={handleError} fallback={<PlaceholderModel color={color} />}>
            <LoadedVehicleModel vehicleId={vehicleId} color={color} />
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
    vehicleId
}: {
    preset: string
    isAutoRotating: boolean
    controlsRef: React.RefObject<OrbitControlsImpl | null>
    vehicleId: string
}) {
    const { camera } = useThree()

    // Sincronizar autoRotate
    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.autoRotate = isAutoRotating
        }
    }, [isAutoRotating, controlsRef])

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

        const newPosition = sphericalToCartesian(
            adjustedAzimuth,
            viewConfig.polar,
            viewConfig.distance,
            viewConfig.targetY
        )

        // Posicionar cámara directamente (sin animación)
        camera.position.copy(newPosition)
        controlsRef.current.target.set(0, viewConfig.targetY, 0)
        controlsRef.current.update()
    }, [preset, camera, controlsRef, vehicleId])

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
    onRotationChange?: (azimuth: number) => void
}

export function Vehicle3DCanvas({
    vehicle,
    isRotating = true,
    cameraPreset = 'three-quarter',
    environment = 'studio',
    onRotationChange,
}: Vehicle3DCanvasProps) {
    const controlsRef = useRef<OrbitControlsImpl | null>(null)

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
            frameloop="demand" // Solo renderizar cuando hay cambios
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
                <Suspense fallback={<LoadingFallback color={vehicle.livery.primaryColor} />}>
                    <VehicleModelWithFallback
                        vehicleId={vehicle.id}
                        color={vehicle.livery.primaryColor}
                    />
                </Suspense>
            </Bounds>

            {/* Camera Controller */}
            <CameraController
                preset={cameraPreset}
                isAutoRotating={isRotating}
                controlsRef={controlsRef}
                vehicleId={vehicle.id}
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
