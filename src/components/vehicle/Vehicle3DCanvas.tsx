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
    'subaru-impreza-sti': 270   // Probando 270° (-90°)
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

// Precargar modelos conocidos
const VEHICLE_PATHS = [
    '/models/vehicles/mazda-rx7-fd/base.glb',
    '/models/vehicles/nissan-skyline-r34/base.glb',
    '/models/vehicles/toyota-supra-a80/base.glb',
    '/models/vehicles/honda-nsx/base.glb',
    '/models/vehicles/mitsubishi-evo-ix/base.glb',
    '/models/vehicles/subaru-impreza-sti/base.glb',
]

// Pre-registrar rutas para useGLTF
VEHICLE_PATHS.forEach(path => {
    useGLTF.preload(path)
})

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

        // Calculate bounding box
        box.setFromObject(scene)
        box.getCenter(center)
        box.getSize(size)

        // Calculate scale to fit model (3.5 units)
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = maxDim > 0 ? 3.5 / maxDim : 1

        // Apply transforms in batch
        scene.scale.setScalar(scale)
        scene.position.set(
            -center.x * scale,
            0,
            -center.z * scale
        )

        // Calculate y position after scaling
        box.setFromObject(scene)
        scene.position.y = -box.min.y

        // Apply initial rotation
        const initialRotation = MODEL_INITIAL_ROTATION[vehicleId] ?? 0
        scene.rotation.y = (initialRotation * Math.PI) / 180

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

    // Check if model file exists
    useEffect(() => {
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

    if (!modelChecked) {
        return <PlaceholderModel color={color} />
    }

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
    controlsRef
}: {
    preset: string
    isAutoRotating: boolean
    controlsRef: React.RefObject<OrbitControlsImpl | null>
}) {
    const { camera } = useThree()
    const targetPositionRef = useRef<THREE.Vector3 | null>(null)
    const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.5, 0))
    const isTransitioning = useRef(false)

    // Cuando cambia el preset, calcular nueva posición de cámara
    useEffect(() => {
        const viewConfig = CAMERA_VIEWS[preset] || CAMERA_VIEWS['three-quarter']
        const newPosition = sphericalToCartesian(
            viewConfig.azimuth,
            viewConfig.polar,
            viewConfig.distance,
            viewConfig.targetY
        )

        targetPositionRef.current = newPosition
        targetLookAtRef.current = new THREE.Vector3(0, viewConfig.targetY, 0)
        isTransitioning.current = true

        // Desactivar temporalmente auto-rotate durante la transición
        if (controlsRef.current) {
            controlsRef.current.autoRotate = false
        }
    }, [preset, controlsRef])

    // Animación suave de la cámara
    useFrame((_, delta) => {
        if (!targetPositionRef.current || !isTransitioning.current) {
            // Reactivar auto-rotate si está habilitado y no estamos en transición
            if (controlsRef.current && isAutoRotating && !isTransitioning.current) {
                controlsRef.current.autoRotate = true
            }
            return
        }

        const currentPos = camera.position.clone()
        const targetPos = targetPositionRef.current

        // Interpolar posición de la cámara
        const lerpFactor = 1 - Math.pow(0.01, delta) // Suavizado exponencial
        camera.position.lerp(targetPos, lerpFactor * 3)

        // Actualizar el target de OrbitControls
        if (controlsRef.current) {
            controlsRef.current.target.lerp(targetLookAtRef.current, lerpFactor * 3)
            controlsRef.current.update()
        }

        // Verificar si llegamos al destino
        const distance = currentPos.distanceTo(targetPos)
        if (distance < 0.05) {
            camera.position.copy(targetPos)
            if (controlsRef.current) {
                controlsRef.current.target.copy(targetLookAtRef.current)
                controlsRef.current.update()
                // Reactivar auto-rotate si está habilitado
                if (isAutoRotating) {
                    controlsRef.current.autoRotate = true
                }
            }
            isTransitioning.current = false
        }
    })

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
                autoRotateSpeed={0.4}
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
