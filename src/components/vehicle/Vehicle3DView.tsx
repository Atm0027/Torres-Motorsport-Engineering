import { useState, useRef, useCallback, useEffect, lazy, Suspense } from 'react'
import {
    RotateCcw,
    ZoomIn,
    ZoomOut,
    Move,
    Sun,
    Moon,
    Camera,
    Box,
    Play,
    Pause
} from 'lucide-react'
import { Button } from '@components/ui/Button'
import type { Vehicle, VehicleMaterials, EnvironmentConfig } from '@/types'

// Lazy load del canvas 3D para no bloquear la carga inicial
const Vehicle3DCanvas = lazy(() => import('./Vehicle3DCanvas').then(m => ({ default: m.Vehicle3DCanvas })))

// Fallback de carga para el canvas 3D
const Canvas3DLoader = () => (
    <div className="w-full h-full flex items-center justify-center bg-torres-dark-800">
        <div className="text-center">
            <div className="animate-spin w-10 h-10 border-3 border-torres-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-torres-light-400">Cargando visor 3D...</p>
        </div>
    </div>
)

interface Vehicle3DViewProps {
    vehicle: Vehicle
    onMaterialChange?: (materials: Partial<VehicleMaterials>) => void
    className?: string
}

type CameraPreset = 'front' | 'rear' | 'side-left' | 'side-right' | 'top' | 'three-quarter'

// Constantes fuera del componente
const CAMERA_PRESETS: Record<CameraPreset, { label: string }> = {
    'front': { label: 'Frontal' },
    'rear': { label: 'Trasera' },
    'side-left': { label: 'Izquierda' },
    'side-right': { label: 'Derecha' },
    'top': { label: 'Superior' },
    'three-quarter': { label: '3/4' }
}

const ENVIRONMENT_PRESETS: Record<EnvironmentConfig['preset'], { label: string; icon: typeof Sun }> = {
    'studio': { label: 'Estudio', icon: Sun },
    'garage': { label: 'Garaje', icon: Box },
    'outdoor': { label: 'Exterior', icon: Sun },
    'showroom': { label: 'Showroom', icon: Moon }
}

export function Vehicle3DView({
    vehicle,
    onMaterialChange: _onMaterialChange,
    className = ''
}: Vehicle3DViewProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isRotating, setIsRotating] = useState(true)
    const [currentAzimuth, setCurrentAzimuth] = useState(225) // Ángulo azimutal real de la cámara
    const [zoom, setZoom] = useState(1)
    const [cameraPreset, setCameraPreset] = useState<CameraPreset>('three-quarter')
    const [environment, setEnvironment] = useState<EnvironmentConfig['preset']>('studio')

    // Resetear vista al cambiar de vehículo
    useEffect(() => {
        setCameraPreset('three-quarter')
        setIsRotating(true)
    }, [vehicle.id])

    // Callback para recibir la rotación real desde el canvas
    const handleRotationChange = useCallback((azimuth: number) => {
        setCurrentAzimuth(azimuth)
    }, [])

    // Handle zoom
    const handleZoom = useCallback((delta: number) => {
        setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)))
    }, [])

    // Handle camera preset - detiene rotación automática para mantener la vista
    const handleCameraPreset = useCallback((preset: CameraPreset) => {
        setCameraPreset(preset)
        setIsRotating(false) // Detener rotación para quedarse en la vista seleccionada
    }, [])

    // Handle environment change
    const handleEnvironmentChange = useCallback((preset: EnvironmentConfig['preset']) => {
        setEnvironment(preset)
    }, [])

    // Wheel zoom
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        handleZoom(delta)
    }, [handleZoom])

    // Reset view
    const resetView = useCallback(() => {
        setZoom(1)
        setCameraPreset('three-quarter')
    }, [])

    // Get environment background
    const getEnvironmentBackground = () => {
        switch (environment) {
            case 'studio':
                return 'bg-gradient-to-b from-torres-dark-700 to-torres-dark-900'
            case 'garage':
                return 'bg-gradient-to-b from-amber-950/30 to-torres-dark-900'
            case 'outdoor':
                return 'bg-gradient-to-b from-sky-900/50 to-torres-dark-800'
            case 'showroom':
                return 'bg-gradient-to-b from-torres-dark-600 to-black'
            default:
                return 'bg-torres-dark-900'
        }
    }

    return (
        <div className={`vehicle-3d-view flex flex-col h-full ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 bg-torres-dark-800 border-b border-torres-dark-600">
                {/* Camera presets */}
                <div className="flex items-center gap-1">
                    <Camera className="w-4 h-4 text-torres-light-400 mr-1" />
                    {Object.entries(CAMERA_PRESETS).map(([key, { label }]) => (
                        <button
                            key={key}
                            onClick={() => handleCameraPreset(key as CameraPreset)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${cameraPreset === key
                                ? 'bg-torres-primary text-white'
                                : 'bg-torres-dark-700 text-torres-light-400 hover:bg-torres-dark-600'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                    <Button
                        variant={isRotating ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => {
                            const newRotating = !isRotating
                            setIsRotating(newRotating)
                            // Si activa rotación desde vista superior, volver a 3/4
                            if (newRotating && cameraPreset === 'top') {
                                setCameraPreset('three-quarter')
                            }
                        }}
                        title={isRotating ? 'Pausar rotación' : 'Rotar automáticamente'}
                        className="p-1"
                    >
                        {isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleZoom(0.2)}
                        title="Zoom In"
                        className="p-1"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-torres-light-400 w-12 text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleZoom(-0.2)}
                        title="Zoom Out"
                        className="p-1"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetView}
                        title="Reset View"
                        className="p-1"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* 3D Canvas */}
            <div
                ref={containerRef}
                className={`flex-1 overflow-hidden relative ${getEnvironmentBackground()} cursor-grab active:cursor-grabbing`}
                onWheel={handleWheel}
            >
                {/* Floor reflection */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

                {/* Floor grid */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(0, 212, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0, 212, 255, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px',
                        transform: 'perspective(500px) rotateX(60deg)',
                        transformOrigin: 'center bottom'
                    }}
                />

                {/* 3D Car - Lazy loaded Three.js Canvas */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Suspense fallback={<Canvas3DLoader />}>
                        <Vehicle3DCanvas
                            vehicle={vehicle}
                            isRotating={isRotating}
                            cameraPreset={cameraPreset}
                            environment={environment}
                            onRotationChange={handleRotationChange}
                        />
                    </Suspense>

                    {/* Vehicle name overlay */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10">
                        <h3 className="text-lg font-display font-bold text-torres-light-100 drop-shadow-lg">
                            {vehicle.manufacturer} {vehicle.name}
                        </h3>
                        <p className="text-xs text-torres-light-400">
                            {vehicle.year} • {vehicle.currentMetrics.horsepower} CV
                        </p>
                    </div>
                </div>

                {/* Instruction overlay */}
                <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-torres-light-400 bg-torres-dark-900/80 px-3 py-1.5 rounded z-10">
                    <Move className="w-3 h-3" />
                    <span>Arrastra para rotar • Scroll para zoom</span>
                </div>
            </div>

            {/* Environment selector */}
            <div className="flex items-center justify-between p-2 bg-torres-dark-800 border-t border-torres-dark-600">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-torres-light-400">Entorno:</span>
                    {Object.entries(ENVIRONMENT_PRESETS).map(([key, { label, icon: Icon }]) => (
                        <button
                            key={key}
                            onClick={() => handleEnvironmentChange(key as EnvironmentConfig['preset'])}
                            className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${environment === key
                                ? 'bg-torres-primary text-white'
                                : 'bg-torres-dark-700 text-torres-light-400 hover:bg-torres-dark-600'
                                }`}
                        >
                            <Icon className="w-3 h-3" />
                            {label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-torres-light-400">
                    <span>Ángulo: {currentAzimuth}°</span>
                </div>
            </div>
        </div>
    )
}

export default Vehicle3DView
