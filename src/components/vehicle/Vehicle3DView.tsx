import { useState, useRef, useCallback, useEffect } from 'react'
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

interface Vehicle3DViewProps {
    vehicle: Vehicle
    onMaterialChange?: (materials: Partial<VehicleMaterials>) => void
    className?: string
}

type CameraPreset = 'front' | 'rear' | 'side-left' | 'side-right' | 'top' | 'three-quarter'

const CAMERA_PRESETS: Record<CameraPreset, { position: [number, number, number]; label: string }> = {
    'front': { position: [0, 1, 5], label: 'Frontal' },
    'rear': { position: [0, 1, -5], label: 'Trasera' },
    'side-left': { position: [-5, 1, 0], label: 'Izquierda' },
    'side-right': { position: [5, 1, 0], label: 'Derecha' },
    'top': { position: [0, 6, 0], label: 'Superior' },
    'three-quarter': { position: [4, 2, 4], label: '3/4' }
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
    const [isLoading, setIsLoading] = useState(true)
    const [isRotating, setIsRotating] = useState(true)
    const [rotation, setRotation] = useState(0)
    const [zoom, setZoom] = useState(1)
    const [cameraPreset, setCameraPreset] = useState<CameraPreset>('three-quarter')
    const [environment, setEnvironment] = useState<EnvironmentConfig['preset']>('studio')
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [manualRotation, setManualRotation] = useState({ x: 0, y: 0 })

    // Auto-rotation animation
    useEffect(() => {
        if (!isRotating || isDragging) return

        const interval = setInterval(() => {
            setRotation(prev => (prev + 0.5) % 360)
        }, 50)

        return () => clearInterval(interval)
    }, [isRotating, isDragging])

    // Handle zoom
    const handleZoom = useCallback((delta: number) => {
        setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)))
    }, [])

    // Handle camera preset
    const handleCameraPreset = useCallback((preset: CameraPreset) => {
        setCameraPreset(preset)
        setManualRotation({ x: 0, y: 0 })
    }, [])

    // Handle environment change
    const handleEnvironmentChange = useCallback((preset: EnvironmentConfig['preset']) => {
        setEnvironment(preset)
    }, [])

    // Mouse drag for rotation
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true)
        setDragStart({ x: e.clientX, y: e.clientY })
    }, [])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return

        const deltaX = e.clientX - dragStart.x
        const deltaY = e.clientY - dragStart.y

        setManualRotation(prev => ({
            x: prev.x + deltaY * 0.5,
            y: prev.y + deltaX * 0.5
        }))

        setDragStart({ x: e.clientX, y: e.clientY })
    }, [isDragging, dragStart])

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
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
        setRotation(0)
        setManualRotation({ x: 0, y: 0 })
        setCameraPreset('three-quarter')
    }, [])

    // Calculate total rotation
    const totalRotationY = isRotating && !isDragging ? rotation : manualRotation.y
    const totalRotationX = manualRotation.x

    // Simulated 3D effect with CSS transforms
    const carTransform = `
        perspective(1000px)
        scale(${zoom})
        rotateX(${Math.max(-30, Math.min(30, totalRotationX))}deg)
        rotateY(${totalRotationY}deg)
    `

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

    // Loading simulation
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000)
        return () => clearTimeout(timer)
    }, [vehicle.id])

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
                        onClick={() => setIsRotating(!isRotating)}
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
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
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

                {/* 3D Car placeholder - Will be replaced with actual Three.js canvas */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {isLoading ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 border-4 border-torres-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-torres-light-400">Cargando modelo 3D...</span>
                        </div>
                    ) : (
                        <div
                            className="transition-transform duration-100"
                            style={{ transform: carTransform }}
                        >
                            {/* Placeholder 3D car representation */}
                            <svg
                                viewBox="0 0 400 200"
                                className="w-[500px] h-auto drop-shadow-2xl"
                                style={{
                                    filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5))'
                                }}
                            >
                                {/* Car body - colored based on livery */}
                                <defs>
                                    <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor={vehicle.livery.primaryColor} />
                                        <stop offset="50%" stopColor={vehicle.livery.primaryColor} />
                                        <stop offset="100%" stopColor={adjustColor(vehicle.livery.primaryColor, -30)} />
                                    </linearGradient>
                                    <linearGradient id="glassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#1e3a5f" />
                                        <stop offset="100%" stopColor="#0f172a" />
                                    </linearGradient>
                                </defs>

                                {/* Shadow */}
                                <ellipse cx="200" cy="180" rx="160" ry="15" fill="rgba(0,0,0,0.3)" />

                                {/* Car body */}
                                <path
                                    d="M40,120 L60,120 L90,70 L310,70 L340,120 L360,120 L360,150 L40,150 Z"
                                    fill="url(#bodyGradient)"
                                    stroke={vehicle.livery.accentColor}
                                    strokeWidth="2"
                                />

                                {/* Windows */}
                                <path
                                    d="M100,75 L130,75 L130,110 L100,110 Z"
                                    fill="url(#glassGradient)"
                                    opacity="0.9"
                                />
                                <path
                                    d="M140,75 L260,75 L260,110 L140,110 Z"
                                    fill="url(#glassGradient)"
                                    opacity="0.9"
                                />

                                {/* Front bumper */}
                                <path
                                    d="M40,120 L40,150 L60,150 L60,130 L40,120"
                                    fill={adjustColor(vehicle.livery.primaryColor, -20)}
                                />

                                {/* Rear bumper */}
                                <path
                                    d="M340,120 L360,120 L360,150 L340,150 L340,120"
                                    fill={adjustColor(vehicle.livery.primaryColor, -20)}
                                />

                                {/* Front wheel */}
                                <circle cx="100" cy="155" r="35" fill="#1a1a1a" />
                                <circle cx="100" cy="155" r="28" fill="#2a2a2a" />
                                <circle cx="100" cy="155" r="20" fill="#3a3a3a" />
                                <circle cx="100" cy="155" r="8" fill={vehicle.livery.accentColor} />
                                {/* Wheel spokes */}
                                {[0, 72, 144, 216, 288].map(angle => (
                                    <line
                                        key={angle}
                                        x1={100 + Math.cos(angle * Math.PI / 180) * 8}
                                        y1={155 + Math.sin(angle * Math.PI / 180) * 8}
                                        x2={100 + Math.cos(angle * Math.PI / 180) * 20}
                                        y2={155 + Math.sin(angle * Math.PI / 180) * 20}
                                        stroke="#4a4a4a"
                                        strokeWidth="3"
                                    />
                                ))}

                                {/* Rear wheel */}
                                <circle cx="300" cy="155" r="35" fill="#1a1a1a" />
                                <circle cx="300" cy="155" r="28" fill="#2a2a2a" />
                                <circle cx="300" cy="155" r="20" fill="#3a3a3a" />
                                <circle cx="300" cy="155" r="8" fill={vehicle.livery.accentColor} />
                                {[0, 72, 144, 216, 288].map(angle => (
                                    <line
                                        key={angle}
                                        x1={300 + Math.cos(angle * Math.PI / 180) * 8}
                                        y1={155 + Math.sin(angle * Math.PI / 180) * 8}
                                        x2={300 + Math.cos(angle * Math.PI / 180) * 20}
                                        y2={155 + Math.sin(angle * Math.PI / 180) * 20}
                                        stroke="#4a4a4a"
                                        strokeWidth="3"
                                    />
                                ))}

                                {/* Headlights */}
                                <ellipse cx="50" cy="125" rx="8" ry="12" fill="#fff" opacity="0.9" />
                                <ellipse cx="50" cy="125" rx="5" ry="8" fill="#fffde7" />

                                {/* Tail lights */}
                                <rect x="352" y="125" width="6" height="20" rx="2" fill="#dc2626" />

                                {/* Side accent line */}
                                <line
                                    x1="60"
                                    y1="130"
                                    x2="340"
                                    y2="130"
                                    stroke={vehicle.livery.accentColor}
                                    strokeWidth="2"
                                />
                            </svg>

                            {/* Vehicle name overlay - positioned higher to avoid overlap */}
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
                                <h3 className="text-lg font-display font-bold text-torres-light-100 drop-shadow-lg">
                                    {vehicle.manufacturer} {vehicle.name}
                                </h3>
                                <p className="text-xs text-torres-light-400">
                                    {vehicle.year} • {vehicle.currentMetrics.horsepower} CV
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Instruction overlay - positioned to avoid overlap with parent stats */}
                {!isLoading && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 text-xs text-torres-light-400 bg-torres-dark-900/80 px-3 py-1.5 rounded z-10">
                        <Move className="w-3 h-3" />
                        <span>Arrastra para rotar • Scroll para zoom</span>
                    </div>
                )}
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
                    <span>Rotación: {Math.round(totalRotationY)}°</span>
                </div>
            </div>
        </div>
    )
}

// Helper function to adjust color brightness
function adjustColor(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.max(0, Math.min(255, (num >> 16) + amount))
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount))
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

export default Vehicle3DView
