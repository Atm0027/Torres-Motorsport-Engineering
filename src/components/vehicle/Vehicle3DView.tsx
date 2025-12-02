import { useState, useRef, useCallback, useEffect, Suspense, memo, useMemo } from 'react'
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
    Pause,
    Eye,
    EyeOff
} from 'lucide-react'
import { Button } from '@components/ui/Button'
import { useVehicleColors, useVehicleFinishes } from '@stores/garageStore'
import type { Vehicle, VehicleMaterials, EnvironmentConfig } from '@/types'
import { Vehicle3DCanvas } from './Vehicle3DCanvas'

// Fallback de carga para el canvas 3D - Memoizado
const Canvas3DLoader = memo(() => (
    <div className="w-full h-full flex items-center justify-center bg-torres-dark-800">
        <div className="text-center">
            <div className="animate-spin w-10 h-10 border-3 border-torres-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-torres-light-400">Cargando visor 3D...</p>
        </div>
    </div>
))

// =============================================================================
// COMPONENTE: Efectos de fondo por entorno
// =============================================================================
const EnvironmentBackgroundEffects = memo(({ environment }: { environment: EnvironmentConfig['preset'] }) => {
    switch (environment) {
        case 'studio':
            return (
                <div className="absolute inset-0 pointer-events-none z-0">
                    {/* Studio - Fondo limpio con softbox lights simulados */}
                    {/* Softbox superior grande */}
                    <div className="absolute top-0 left-1/4 right-1/4 h-32 bg-gradient-to-b from-white/20 to-transparent blur-2xl" />
                    {/* Reflejo lateral izquierdo */}
                    <div className="absolute left-0 top-1/4 bottom-1/4 w-24 bg-gradient-to-r from-white/15 to-transparent blur-xl" />
                    {/* Reflejo lateral derecho */}
                    <div className="absolute right-0 top-1/4 bottom-1/4 w-24 bg-gradient-to-l from-white/15 to-transparent blur-xl" />
                    {/* Suelo reflectante */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    {/* Grid sutil en perspectiva */}
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `
                                linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)
                            `,
                            backgroundSize: '50px 50px',
                            transform: 'perspective(500px) rotateX(60deg)',
                            transformOrigin: 'center bottom'
                        }}
                    />
                </div>
            )

        case 'garage':
            return (
                <div className="absolute inset-0 pointer-events-none z-0">
                    {/* Garage - Iluminación industrial cálida */}
                    {/* Bombillas colgantes simuladas */}
                    <div className="absolute top-0 left-1/4 w-48 h-48 bg-amber-500/30 rounded-full blur-3xl" />
                    <div className="absolute top-0 right-1/4 w-40 h-40 bg-orange-400/25 rounded-full blur-3xl" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl" />
                    {/* Ventana lateral con luz */}
                    <div className="absolute left-0 top-1/4 w-16 h-48 bg-gradient-to-r from-amber-300/20 to-transparent blur-lg" />
                    {/* Suelo de concreto */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-stone-900/90 via-stone-800/50 to-transparent" />
                    {/* Textura de ladrillo en paredes */}
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                                0deg,
                                transparent,
                                transparent 25px,
                                rgba(139, 90, 43, 0.4) 25px,
                                rgba(139, 90, 43, 0.4) 27px
                            )`
                        }}
                    />
                </div>
            )

        case 'outdoor':
            return (
                <div className="absolute inset-0 pointer-events-none z-0">
                    {/* Outdoor - Cielo y naturaleza */}
                    {/* Sol */}
                    <div className="absolute top-8 right-1/4 w-40 h-40 bg-yellow-300/30 rounded-full blur-3xl" />
                    <div className="absolute top-12 right-1/4 w-20 h-20 bg-white/40 rounded-full blur-xl" />
                    {/* Nubes sutiles */}
                    <div className="absolute top-16 left-1/4 w-48 h-12 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute top-24 left-1/2 w-32 h-8 bg-white/8 rounded-full blur-xl" />
                    {/* Reflejo del cielo en el horizonte */}
                    <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-sky-400/10 to-transparent" />
                    {/* Suelo con hierba */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-emerald-950/60 via-green-900/30 to-transparent" />
                    {/* Línea del horizonte */}
                    <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-green-800/30 to-transparent" />
                    {/* Árboles lejanos (siluetas) */}
                    <div
                        className="absolute bottom-1/3 left-0 right-0 h-16 opacity-20"
                        style={{
                            background: `
                                radial-gradient(ellipse 30px 40px at 10% 100%, #1a3d1a 70%, transparent 70%),
                                radial-gradient(ellipse 25px 35px at 20% 100%, #1a3d1a 70%, transparent 70%),
                                radial-gradient(ellipse 35px 45px at 35% 100%, #1a3d1a 70%, transparent 70%),
                                radial-gradient(ellipse 20px 30px at 50% 100%, #1a3d1a 70%, transparent 70%),
                                radial-gradient(ellipse 40px 50px at 70% 100%, #1a3d1a 70%, transparent 70%),
                                radial-gradient(ellipse 25px 35px at 85% 100%, #1a3d1a 70%, transparent 70%),
                                radial-gradient(ellipse 30px 40px at 95% 100%, #1a3d1a 70%, transparent 70%)
                            `
                        }}
                    />
                </div>
            )

        case 'showroom':
            return (
                <div className="absolute inset-0 pointer-events-none z-0">
                    {/* Showroom - Iluminación dramática de exhibición */}
                    {/* Spotlight principal desde arriba */}
                    <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-2xl"
                        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(99,102,241,0.1) 50%, transparent 100%)' }}
                    />
                    {/* Luces de acento laterales */}
                    <div className="absolute top-1/4 left-0 w-32 h-64 bg-gradient-to-r from-blue-500/10 to-transparent blur-xl" />
                    <div className="absolute top-1/4 right-0 w-32 h-64 bg-gradient-to-l from-purple-500/10 to-transparent blur-xl" />
                    {/* Líneas de neón en el suelo */}
                    <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent blur-sm" />
                    {/* Suelo ultra reflectante */}
                    <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black via-slate-950/80 to-transparent" />
                    {/* Reflejo del coche en el suelo */}
                    <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-white/5 to-transparent" />
                    {/* Partículas de polvo iluminadas */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-white/60 rounded-full" />
                        <div className="absolute top-1/3 right-1/4 w-0.5 h-0.5 bg-white/40 rounded-full" />
                        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-300/50 rounded-full" />
                        <div className="absolute top-2/3 right-1/3 w-0.5 h-0.5 bg-white/30 rounded-full" />
                    </div>
                    {/* Viñeta dramática */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)'
                        }}
                    />
                </div>
            )

        default:
            return null
    }
})
EnvironmentBackgroundEffects.displayName = 'EnvironmentBackgroundEffects'

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

export const Vehicle3DView = memo(function Vehicle3DView({
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
    const [showUI, setShowUI] = useState(true) // Mostrar/ocultar interfaz

    // Obtener colores y acabados del store global
    const vehicleColors = useVehicleColors()
    const vehicleFinishes = useVehicleFinishes()

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

    // Get environment background - memoizado
    const environmentBackground = useMemo(() => {
        switch (environment) {
            case 'studio':
                // Estudio profesional - gris neutro elegante
                return 'bg-gradient-to-b from-slate-800 via-slate-900 to-gray-950'
            case 'garage':
                // Garaje industrial - tonos cálidos anaranjados
                return 'bg-gradient-to-b from-amber-950/50 via-stone-900 to-neutral-950'
            case 'outdoor':
                // Exterior - cielo azul degradando a tierra
                return 'bg-gradient-to-b from-sky-800/60 via-slate-800 to-emerald-950/40'
            case 'showroom':
                // Showroom de lujo - negro con toques de púrpura/azul
                return 'bg-gradient-to-b from-indigo-950/50 via-slate-950 to-black'
            default:
                return 'bg-torres-dark-900'
        }
    }, [environment])

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
                    <div className="w-px h-4 bg-torres-dark-600 mx-1" />
                    <Button
                        variant={showUI ? 'ghost' : 'primary'}
                        size="sm"
                        onClick={() => setShowUI(!showUI)}
                        title={showUI ? 'Ocultar interfaz' : 'Mostrar interfaz'}
                        className="p-1"
                    >
                        {showUI ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* 3D Canvas */}
            <div
                ref={containerRef}
                className={`flex-1 overflow-hidden relative ${environmentBackground} cursor-grab active:cursor-grabbing`}
                onWheel={handleWheel}
            >
                {/* Environment-specific background effects - CAPA MÁS BAJA */}
                <div className="absolute inset-0 z-0">
                    <EnvironmentBackgroundEffects environment={environment} />
                </div>

                {/* 3D Car - Three.js Canvas - CAPA INTERMEDIA */}
                <div className="absolute inset-0 z-10">
                    <Suspense fallback={<Canvas3DLoader />}>
                        <Vehicle3DCanvas
                            vehicle={vehicle}
                            isRotating={isRotating}
                            cameraPreset={cameraPreset}
                            environment={environment}
                            zoom={zoom}
                            vehicleColors={vehicleColors}
                            vehicleFinishes={vehicleFinishes}
                            onRotationChange={handleRotationChange}
                        />
                    </Suspense>

                    {/* Vehicle name overlay */}
                    {showUI && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none z-20">
                            <h3 className="text-lg font-display font-bold text-torres-light-100 drop-shadow-lg">
                                {vehicle.manufacturer} {vehicle.name}
                            </h3>
                            <p className="text-xs text-torres-light-400">
                                {vehicle.year} • {vehicle.currentMetrics.horsepower} CV
                            </p>
                        </div>
                    )}
                </div>

                {/* Instruction overlay */}
                {showUI && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-torres-light-400 bg-torres-dark-900/80 px-3 py-1.5 rounded z-20">
                        <Move className="w-3 h-3" />
                        <span>Arrastra para rotar • Scroll para zoom</span>
                    </div>
                )}
            </div>

            {/* Environment selector */}
            {showUI && (
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
            )}
        </div>
    )
})

export default Vehicle3DView