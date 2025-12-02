import { useState, useMemo, useCallback, memo } from 'react'
import {
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Grid3X3,
    Ruler,
    Tag,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { Button } from '@components/ui/Button'
import type { Vehicle, BlueprintViewState, PartCategory } from '@/types'

interface BlueprintViewProps {
    vehicle: Vehicle
    installedParts?: string[]
    highlightedSystem?: PartCategory | null
    onPartClick?: (partId: string) => void
    className?: string
}

type ViewType = 'side' | 'front' | 'rear' | 'top'

const VIEW_LABELS: Record<ViewType, string> = {
    side: 'Vista Lateral',
    front: 'Vista Frontal',
    rear: 'Vista Trasera',
    top: 'Vista Superior'
}

const VIEW_ORDER: ViewType[] = ['side', 'front', 'rear', 'top']

export const BlueprintView = memo(function BlueprintView({
    vehicle,
    installedParts = [],
    highlightedSystem: _highlightedSystem,
    onPartClick: _onPartClick,
    className = ''
}: BlueprintViewProps) {
    const [viewState, setViewState] = useState<BlueprintViewState>({
        activeView: 'side',
        zoom: 1,
        panOffset: { x: 0, y: 0 },
        showGrid: true,
        showDimensions: true,
        showAnnotations: true,
        highlightedParts: []
    })

    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    // Handle zoom
    const handleZoom = useCallback((delta: number) => {
        setViewState(prev => ({
            ...prev,
            zoom: Math.max(0.5, Math.min(3, prev.zoom + delta))
        }))
    }, [])

    // Handle view change
    const handleViewChange = useCallback((view: ViewType) => {
        setViewState(prev => ({
            ...prev,
            activeView: view,
            panOffset: { x: 0, y: 0 }
        }))
    }, [])

    // Cycle views
    const cycleView = useCallback((direction: 1 | -1) => {
        setViewState(prev => {
            const currentIndex = VIEW_ORDER.indexOf(prev.activeView)
            const newIndex = (currentIndex + direction + VIEW_ORDER.length) % VIEW_ORDER.length
            return {
                ...prev,
                activeView: VIEW_ORDER[newIndex],
                panOffset: { x: 0, y: 0 }
            }
        })
    }, [])

    // Reset view
    const resetView = useCallback(() => {
        setViewState(prev => ({
            ...prev,
            zoom: 1,
            panOffset: { x: 0, y: 0 }
        }))
    }, [])

    // Toggle options
    const toggleOption = useCallback((option: 'showGrid' | 'showDimensions' | 'showAnnotations') => {
        setViewState(prev => ({
            ...prev,
            [option]: !prev[option]
        }))
    }, [])

    // Pan handling
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        setIsDragging(true)
        setDragStart({ x: e.clientX - viewState.panOffset.x, y: e.clientY - viewState.panOffset.y })
    }, [viewState.panOffset])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return
        setViewState(prev => ({
            ...prev,
            panOffset: {
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            }
        }))
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

    // Generate grid lines
    const gridLines = useMemo(() => {
        if (!viewState.showGrid) return null
        const lines = []
        const gridSize = 50
        const gridCount = 20

        for (let i = -gridCount; i <= gridCount; i++) {
            // Vertical lines
            lines.push(
                <line
                    key={`v-${i}`}
                    x1={i * gridSize}
                    y1={-gridCount * gridSize}
                    x2={i * gridSize}
                    y2={gridCount * gridSize}
                    stroke="currentColor"
                    strokeWidth={i === 0 ? 1 : 0.5}
                    opacity={i === 0 ? 0.3 : 0.1}
                />
            )
            // Horizontal lines
            lines.push(
                <line
                    key={`h-${i}`}
                    x1={-gridCount * gridSize}
                    y1={i * gridSize}
                    x2={gridCount * gridSize}
                    y2={i * gridSize}
                    stroke="currentColor"
                    strokeWidth={i === 0 ? 1 : 0.5}
                    opacity={i === 0 ? 0.3 : 0.1}
                />
            )
        }
        return lines
    }, [viewState.showGrid])

    // Generate dimension annotations
    const dimensionAnnotations = useMemo(() => {
        if (!viewState.showDimensions) return null

        const dimensions = vehicle.baseSpecs
        const scale = 0.1 // Convert mm to display units

        // Different dimensions based on view
        if (viewState.activeView === 'side') {
            return (
                <g className="dimensions" fill="none" stroke="#00d4ff" strokeWidth="1">
                    {/* Wheelbase */}
                    <line x1={-dimensions.wheelbase * scale / 2} y1={120} x2={dimensions.wheelbase * scale / 2} y2={120} />
                    <line x1={-dimensions.wheelbase * scale / 2} y1={115} x2={-dimensions.wheelbase * scale / 2} y2={125} />
                    <line x1={dimensions.wheelbase * scale / 2} y1={115} x2={dimensions.wheelbase * scale / 2} y2={125} />
                    <text x={0} y={135} textAnchor="middle" fill="#00d4ff" fontSize="10">
                        {dimensions.wheelbase} mm
                    </text>
                </g>
            )
        }

        if (viewState.activeView === 'front' || viewState.activeView === 'rear') {
            return (
                <g className="dimensions" fill="none" stroke="#00d4ff" strokeWidth="1">
                    {/* Track width */}
                    <line x1={-dimensions.trackWidth * scale / 2} y1={100} x2={dimensions.trackWidth * scale / 2} y2={100} />
                    <line x1={-dimensions.trackWidth * scale / 2} y1={95} x2={-dimensions.trackWidth * scale / 2} y2={105} />
                    <line x1={dimensions.trackWidth * scale / 2} y1={95} x2={dimensions.trackWidth * scale / 2} y2={105} />
                    <text x={0} y={115} textAnchor="middle" fill="#00d4ff" fontSize="10">
                        {dimensions.trackWidth} mm
                    </text>
                </g>
            )
        }

        return null
    }, [viewState.showDimensions, viewState.activeView, vehicle.baseSpecs])

    // Detailed blueprint SVG
    const BlueprintSVG = useMemo(() => {
        const { activeView } = viewState
        const strokeColor = "#00d4ff"
        const dimColor = "#0891b2"
        const detailColor = "#06b6d4"

        // Vista Lateral - Muy detallada
        if (activeView === 'side') {
            return (
                <g className="blueprint-car" fill="none" strokeWidth="1.5">
                    {/* Carrocería principal */}
                    <path
                        d="M-200,20 
                           L-185,20 L-175,15 L-160,12 L-145,-5 L-130,-25 L-100,-42 
                           L-60,-52 L0,-55 L80,-52 L120,-42 L145,-20 L160,0 L175,12 
                           L185,18 L200,20 L200,55 L185,60 L160,62 
                           L-160,62 L-185,60 L-200,55 Z"
                        stroke={strokeColor}
                        strokeWidth="2"
                    />

                    {/* Línea de cintura */}
                    <path d="M-175,15 L175,15" stroke={dimColor} strokeWidth="0.5" strokeDasharray="4,4" />

                    {/* Parabrisas */}
                    <path d="M-100,-42 L-60,-52 L0,-55 L-20,-52 L-45,-42 L-65,-25 L-85,-10 L-100,-42" stroke={strokeColor} opacity="0.8" />
                    <path d="M-95,-38 L-62,-48 L-10,-50" stroke={detailColor} strokeWidth="0.5" />

                    {/* Luneta trasera */}
                    <path d="M80,-52 L120,-42 L140,-25 L145,-20 L125,-15 L95,-35 L80,-52" stroke={strokeColor} opacity="0.8" />

                    {/* Ventanillas laterales */}
                    <path d="M-60,-48 L-20,-50 L20,-50 L20,-15 L-85,-15 L-65,-30 L-60,-48" stroke={strokeColor} opacity="0.6" fill={strokeColor} fillOpacity="0.05" />
                    <path d="M25,-50 L75,-48 L95,-35 L100,-18 L25,-18 L25,-50" stroke={strokeColor} opacity="0.6" fill={strokeColor} fillOpacity="0.05" />

                    {/* Pilar B */}
                    <line x1="22" y1="-50" x2="22" y2="-10" stroke={strokeColor} strokeWidth="3" />

                    {/* Manilla puerta */}
                    <rect x="-40" y="-5" width="18" height="5" rx="2" stroke={detailColor} strokeWidth="1" />
                    <rect x="50" y="-5" width="18" height="5" rx="2" stroke={detailColor} strokeWidth="1" />

                    {/* Líneas de puerta */}
                    <path d="M-90,-10 L-90,55" stroke={strokeColor} strokeWidth="1" />
                    <path d="M22,-10 L22,55" stroke={strokeColor} strokeWidth="1" />
                    <path d="M120,-10 L120,55" stroke={strokeColor} strokeWidth="1" />

                    {/* Faro delantero */}
                    <ellipse cx="-165" cy="8" rx="18" ry="12" stroke={strokeColor} />
                    <ellipse cx="-165" cy="8" rx="10" ry="7" stroke={detailColor} strokeWidth="0.5" />
                    <circle cx="-165" cy="8" r="4" stroke={detailColor} strokeWidth="0.5" />

                    {/* Faro trasero */}
                    <rect x="165" y="2" width="18" height="22" rx="3" stroke={strokeColor} />
                    <line x1="167" y1="8" x2="181" y2="8" stroke={detailColor} strokeWidth="0.5" />
                    <line x1="167" y1="14" x2="181" y2="14" stroke={detailColor} strokeWidth="0.5" />
                    <line x1="167" y1="20" x2="181" y2="20" stroke={detailColor} strokeWidth="0.5" />

                    {/* Parrilla/Entrada de aire frontal */}
                    <rect x="-155" y="28" width="40" height="18" rx="2" stroke={strokeColor} />
                    <line x1="-150" y1="32" x2="-120" y2="32" stroke={detailColor} strokeWidth="0.5" />
                    <line x1="-150" y1="37" x2="-120" y2="37" stroke={detailColor} strokeWidth="0.5" />
                    <line x1="-150" y1="42" x2="-120" y2="42" stroke={detailColor} strokeWidth="0.5" />

                    {/* Retrovisor */}
                    <path d="M-88,-18 L-98,-22 L-98,-30 L-92,-28 L-88,-18" stroke={strokeColor} fill={strokeColor} fillOpacity="0.1" />

                    {/* Spoiler/Alerón trasero */}
                    <path d="M140,-25 L155,-32 L175,-30 L180,-25 L170,-22 L145,-22 Z" stroke={strokeColor} strokeWidth="1" />

                    {/* Rueda delantera */}
                    <circle cx="-130" cy="62" r="38" stroke={strokeColor} strokeWidth="2" />
                    <circle cx="-130" cy="62" r="30" stroke={strokeColor} strokeWidth="1.5" />
                    <circle cx="-130" cy="62" r="18" stroke={detailColor} strokeWidth="1" />
                    <circle cx="-130" cy="62" r="8" stroke={detailColor} strokeWidth="0.5" />
                    {/* Radios de la rueda */}
                    {[0, 72, 144, 216, 288].map(angle => (
                        <line
                            key={`front-spoke-${angle}`}
                            x1={-130 + Math.cos(angle * Math.PI / 180) * 8}
                            y1={62 + Math.sin(angle * Math.PI / 180) * 8}
                            x2={-130 + Math.cos(angle * Math.PI / 180) * 28}
                            y2={62 + Math.sin(angle * Math.PI / 180) * 28}
                            stroke={detailColor}
                            strokeWidth="3"
                        />
                    ))}
                    {/* Disco de freno */}
                    <circle cx="-130" cy="62" r="25" stroke={dimColor} strokeWidth="0.5" strokeDasharray="2,2" />

                    {/* Rueda trasera */}
                    <circle cx="130" cy="62" r="38" stroke={strokeColor} strokeWidth="2" />
                    <circle cx="130" cy="62" r="30" stroke={strokeColor} strokeWidth="1.5" />
                    <circle cx="130" cy="62" r="18" stroke={detailColor} strokeWidth="1" />
                    <circle cx="130" cy="62" r="8" stroke={detailColor} strokeWidth="0.5" />
                    {[0, 72, 144, 216, 288].map(angle => (
                        <line
                            key={`rear-spoke-${angle}`}
                            x1={130 + Math.cos(angle * Math.PI / 180) * 8}
                            y1={62 + Math.sin(angle * Math.PI / 180) * 8}
                            x2={130 + Math.cos(angle * Math.PI / 180) * 28}
                            y2={62 + Math.sin(angle * Math.PI / 180) * 28}
                            stroke={detailColor}
                            strokeWidth="3"
                        />
                    ))}
                    <circle cx="130" cy="62" r="25" stroke={dimColor} strokeWidth="0.5" strokeDasharray="2,2" />

                    {/* Paso de rueda/Guardabarros */}
                    <path d="M-175,55 Q-130,30 -85,55" stroke={strokeColor} strokeWidth="1.5" fill="none" />
                    <path d="M85,55 Q130,30 175,55" stroke={strokeColor} strokeWidth="1.5" fill="none" />

                    {/* Falda lateral */}
                    <path d="M-85,58 L85,58" stroke={strokeColor} strokeWidth="1" />
                    <path d="M-80,62 L80,62" stroke={dimColor} strokeWidth="0.5" />

                    {/* Líneas de referencia técnica */}
                    <line x1="-200" y1="100" x2="200" y2="100" stroke={dimColor} strokeWidth="0.3" strokeDasharray="10,5" />
                    <text x="-195" y="97" fill={dimColor} fontSize="6">LÍNEA DE SUELO</text>

                    {/* Cotas de batalla */}
                    <g opacity="0.8">
                        <line x1="-130" y1="110" x2="-130" y2="120" stroke={dimColor} strokeWidth="0.5" />
                        <line x1="130" y1="110" x2="130" y2="120" stroke={dimColor} strokeWidth="0.5" />
                        <line x1="-130" y1="115" x2="130" y2="115" stroke={dimColor} strokeWidth="0.5" />
                        <polygon points="-130,115 -125,113 -125,117" fill={dimColor} />
                        <polygon points="130,115 125,113 125,117" fill={dimColor} />
                        <text x="0" y="125" textAnchor="middle" fill={dimColor} fontSize="8">BATALLA: {vehicle.baseSpecs.wheelbase}mm</text>
                    </g>

                    {/* Altura total */}
                    <g opacity="0.8" transform="translate(220, 0)">
                        <line x1="0" y1="-55" x2="10" y2="-55" stroke={dimColor} strokeWidth="0.5" />
                        <line x1="0" y1="100" x2="10" y2="100" stroke={dimColor} strokeWidth="0.5" />
                        <line x1="5" y1="-55" x2="5" y2="100" stroke={dimColor} strokeWidth="0.5" />
                        <text x="12" y="25" fill={dimColor} fontSize="7" transform="rotate(90, 12, 25)">ALTURA</text>
                    </g>
                </g>
            )
        }

        // Vista Frontal - Muy detallada
        if (activeView === 'front') {
            return (
                <g className="blueprint-car" fill="none" strokeWidth="1.5">
                    {/* Carrocería principal */}
                    <path
                        d="M-95,70 L-95,0 L-85,-25 L-70,-55 L-50,-75 L50,-75 L70,-55 L85,-25 L95,0 L95,70 Z"
                        stroke={strokeColor}
                        strokeWidth="2"
                    />

                    {/* Parabrisas */}
                    <path d="M-65,-70 L65,-70 L75,-55 L80,-35 L-80,-35 L-75,-55 Z" stroke={strokeColor} opacity="0.8" />
                    <path d="M-60,-65 L60,-65" stroke={detailColor} strokeWidth="0.5" />
                    <path d="M-70,-55 L70,-55" stroke={detailColor} strokeWidth="0.5" />

                    {/* Techo */}
                    <path d="M-55,-78 L55,-78 L60,-75 L-60,-75 Z" stroke={strokeColor} strokeWidth="1" />

                    {/* Capó */}
                    <path d="M-80,-30 L80,-30 L85,-15 L90,5 L-90,5 L-85,-15 Z" stroke={strokeColor} />
                    <line x1="0" y1="-30" x2="0" y2="5" stroke={dimColor} strokeWidth="0.5" strokeDasharray="3,3" />

                    {/* Entrada de aire del capó */}
                    <rect x="-30" y="-20" width="60" height="8" rx="2" stroke={detailColor} strokeWidth="1" />
                    <line x1="-25" y1="-16" x2="25" y2="-16" stroke={dimColor} strokeWidth="0.3" />

                    {/* Parrilla/Bumper */}
                    <rect x="-70" y="10" width="140" height="35" rx="5" stroke={strokeColor} />
                    <rect x="-60" y="15" width="120" height="12" rx="2" stroke={detailColor} strokeWidth="1" />
                    <line x1="-55" y1="21" x2="55" y2="21" stroke={dimColor} strokeWidth="0.3" />

                    {/* Logo central */}
                    <circle cx="0" cy="32" r="8" stroke={detailColor} strokeWidth="1" />

                    {/* Faros principales */}
                    <g transform="translate(-70, -8)">
                        <ellipse cx="0" cy="0" rx="20" ry="15" stroke={strokeColor} strokeWidth="1.5" />
                        <ellipse cx="0" cy="0" rx="14" ry="10" stroke={detailColor} strokeWidth="0.8" />
                        <circle cx="-5" cy="0" r="5" stroke={detailColor} strokeWidth="0.5" />
                        <circle cx="5" cy="0" r="5" stroke={detailColor} strokeWidth="0.5" />
                        <ellipse cx="0" cy="0" rx="3" ry="2" stroke={dimColor} strokeWidth="0.3" />
                    </g>
                    <g transform="translate(70, -8)">
                        <ellipse cx="0" cy="0" rx="20" ry="15" stroke={strokeColor} strokeWidth="1.5" />
                        <ellipse cx="0" cy="0" rx="14" ry="10" stroke={detailColor} strokeWidth="0.8" />
                        <circle cx="-5" cy="0" r="5" stroke={detailColor} strokeWidth="0.5" />
                        <circle cx="5" cy="0" r="5" stroke={detailColor} strokeWidth="0.5" />
                        <ellipse cx="0" cy="0" rx="3" ry="2" stroke={dimColor} strokeWidth="0.3" />
                    </g>

                    {/* Luces antiniebla */}
                    <ellipse cx="-55" cy="35" rx="8" ry="6" stroke={detailColor} strokeWidth="1" />
                    <ellipse cx="55" cy="35" rx="8" ry="6" stroke={detailColor} strokeWidth="1" />

                    {/* Splitter frontal */}
                    <path d="M-95,65 L-100,72 L100,72 L95,65" stroke={strokeColor} strokeWidth="1" />
                    <path d="M-85,68 L85,68" stroke={dimColor} strokeWidth="0.5" />

                    {/* Retrovisores */}
                    <path d="M-95,-30 L-110,-35 L-115,-25 L-100,-20 Z" stroke={strokeColor} fill={strokeColor} fillOpacity="0.1" />
                    <path d="M95,-30 L110,-35 L115,-25 L100,-20 Z" stroke={strokeColor} fill={strokeColor} fillOpacity="0.1" />

                    {/* Ruedas */}
                    <g transform="translate(-90, 82)">
                        <ellipse cx="0" cy="0" rx="25" ry="10" stroke={strokeColor} strokeWidth="2" />
                        <ellipse cx="0" cy="0" rx="18" ry="7" stroke={detailColor} strokeWidth="1" />
                        <ellipse cx="0" cy="0" rx="8" ry="3" stroke={dimColor} strokeWidth="0.5" />
                        <line x1="-15" y1="0" x2="15" y2="0" stroke={dimColor} strokeWidth="0.3" />
                    </g>
                    <g transform="translate(90, 82)">
                        <ellipse cx="0" cy="0" rx="25" ry="10" stroke={strokeColor} strokeWidth="2" />
                        <ellipse cx="0" cy="0" rx="18" ry="7" stroke={detailColor} strokeWidth="1" />
                        <ellipse cx="0" cy="0" rx="8" ry="3" stroke={dimColor} strokeWidth="0.5" />
                        <line x1="-15" y1="0" x2="15" y2="0" stroke={dimColor} strokeWidth="0.3" />
                    </g>

                    {/* Cota de ancho de vías */}
                    <g opacity="0.8">
                        <line x1="-90" y1="100" x2="-90" y2="110" stroke={dimColor} strokeWidth="0.5" />
                        <line x1="90" y1="100" x2="90" y2="110" stroke={dimColor} strokeWidth="0.5" />
                        <line x1="-90" y1="105" x2="90" y2="105" stroke={dimColor} strokeWidth="0.5" />
                        <polygon points="-90,105 -85,103 -85,107" fill={dimColor} />
                        <polygon points="90,105 85,103 85,107" fill={dimColor} />
                        <text x="0" y="118" textAnchor="middle" fill={dimColor} fontSize="8">ANCHO VÍAS: {vehicle.baseSpecs.trackWidth}mm</text>
                    </g>

                    {/* Línea central */}
                    <line x1="0" y1="-85" x2="0" y2="95" stroke={dimColor} strokeWidth="0.3" strokeDasharray="5,5" />
                    <text x="5" y="-80" fill={dimColor} fontSize="5">CL</text>
                </g>
            )
        }

        // Vista Trasera - Muy detallada
        if (activeView === 'rear') {
            return (
                <g className="blueprint-car" fill="none" strokeWidth="1.5">
                    {/* Carrocería principal */}
                    <path
                        d="M-95,70 L-95,5 L-85,-20 L-70,-50 L-50,-70 L50,-70 L70,-50 L85,-20 L95,5 L95,70 Z"
                        stroke={strokeColor}
                        strokeWidth="2"
                    />

                    {/* Luneta trasera */}
                    <path d="M-60,-65 L60,-65 L70,-50 L75,-30 L-75,-30 L-70,-50 Z" stroke={strokeColor} opacity="0.8" />
                    <path d="M-55,-60 L55,-60" stroke={detailColor} strokeWidth="0.5" />
                    <line x1="0" y1="-65" x2="0" y2="-30" stroke={dimColor} strokeWidth="0.3" strokeDasharray="3,3" />

                    {/* Techo/Spoiler */}
                    <path d="M-55,-73 L55,-73 L60,-70 L-60,-70 Z" stroke={strokeColor} strokeWidth="1" />
                    <path d="M-65,-78 L65,-78 L70,-75 L-70,-75 Z" stroke={strokeColor} strokeWidth="1.5" />
                    <line x1="-60" y1="-76" x2="60" y2="-76" stroke={detailColor} strokeWidth="0.5" />

                    {/* Maletero */}
                    <path d="M-75,-25 L75,-25 L80,-5 L85,20 L-85,20 L-80,-5 Z" stroke={strokeColor} />

                    {/* Pilotos traseros */}
                    <g transform="translate(-75, -5)">
                        <rect x="-12" y="-12" width="24" height="30" rx="3" stroke={strokeColor} strokeWidth="1.5" />
                        <rect x="-8" y="-8" width="16" height="8" rx="1" stroke="#ff4444" strokeWidth="0.8" />
                        <rect x="-8" y="2" width="16" height="6" rx="1" stroke="#ffaa00" strokeWidth="0.8" />
                        <rect x="-8" y="10" width="16" height="6" rx="1" stroke="#ffffff" strokeWidth="0.8" opacity="0.5" />
                    </g>
                    <g transform="translate(75, -5)">
                        <rect x="-12" y="-12" width="24" height="30" rx="3" stroke={strokeColor} strokeWidth="1.5" />
                        <rect x="-8" y="-8" width="16" height="8" rx="1" stroke="#ff4444" strokeWidth="0.8" />
                        <rect x="-8" y="2" width="16" height="6" rx="1" stroke="#ffaa00" strokeWidth="0.8" />
                        <rect x="-8" y="10" width="16" height="6" rx="1" stroke="#ffffff" strokeWidth="0.8" opacity="0.5" />
                    </g>

                    {/* Luz de freno central */}
                    <rect x="-25" y="-73" width="50" height="4" rx="1" stroke="#ff4444" strokeWidth="0.8" />

                    {/* Emblema/Logo */}
                    <rect x="-20" y="-18" width="40" height="10" rx="2" stroke={detailColor} strokeWidth="0.8" />
                    <text x="0" y="-11" textAnchor="middle" fill={detailColor} fontSize="6">{vehicle.manufacturer}</text>

                    {/* Parachoques trasero */}
                    <rect x="-80" y="25" width="160" height="30" rx="5" stroke={strokeColor} />

                    {/* Difusor */}
                    <path d="M-60,40 L60,40 L65,55 L-65,55 Z" stroke={strokeColor} strokeWidth="1" />
                    <line x1="-40" y1="42" x2="-40" y2="53" stroke={dimColor} strokeWidth="0.5" />
                    <line x1="-20" y1="42" x2="-20" y2="53" stroke={dimColor} strokeWidth="0.5" />
                    <line x1="0" y1="42" x2="0" y2="53" stroke={dimColor} strokeWidth="0.5" />
                    <line x1="20" y1="42" x2="20" y2="53" stroke={dimColor} strokeWidth="0.5" />
                    <line x1="40" y1="42" x2="40" y2="53" stroke={dimColor} strokeWidth="0.5" />

                    {/* Escapes */}
                    <ellipse cx="-35" cy="52" rx="10" ry="6" stroke={strokeColor} strokeWidth="1.5" />
                    <ellipse cx="-35" cy="52" rx="7" ry="4" stroke={detailColor} strokeWidth="0.5" />
                    <ellipse cx="35" cy="52" rx="10" ry="6" stroke={strokeColor} strokeWidth="1.5" />
                    <ellipse cx="35" cy="52" rx="7" ry="4" stroke={detailColor} strokeWidth="0.5" />

                    {/* Matrícula */}
                    <rect x="-30" y="30" width="60" height="12" rx="1" stroke={detailColor} strokeWidth="1" />

                    {/* Ruedas */}
                    <g transform="translate(-90, 82)">
                        <ellipse cx="0" cy="0" rx="25" ry="10" stroke={strokeColor} strokeWidth="2" />
                        <ellipse cx="0" cy="0" rx="18" ry="7" stroke={detailColor} strokeWidth="1" />
                        <ellipse cx="0" cy="0" rx="8" ry="3" stroke={dimColor} strokeWidth="0.5" />
                    </g>
                    <g transform="translate(90, 82)">
                        <ellipse cx="0" cy="0" rx="25" ry="10" stroke={strokeColor} strokeWidth="2" />
                        <ellipse cx="0" cy="0" rx="18" ry="7" stroke={detailColor} strokeWidth="1" />
                        <ellipse cx="0" cy="0" rx="8" ry="3" stroke={dimColor} strokeWidth="0.5" />
                    </g>

                    {/* Cota de ancho */}
                    <g opacity="0.8">
                        <line x1="-95" y1="100" x2="-95" y2="110" stroke={dimColor} strokeWidth="0.5" />
                        <line x1="95" y1="100" x2="95" y2="110" stroke={dimColor} strokeWidth="0.5" />
                        <line x1="-95" y1="105" x2="95" y2="105" stroke={dimColor} strokeWidth="0.5" />
                        <polygon points="-95,105 -90,103 -90,107" fill={dimColor} />
                        <polygon points="95,105 90,103 90,107" fill={dimColor} />
                        <text x="0" y="118" textAnchor="middle" fill={dimColor} fontSize="8">ANCHO: {vehicle.baseSpecs.trackWidth + 50}mm</text>
                    </g>

                    {/* Línea central */}
                    <line x1="0" y1="-85" x2="0" y2="95" stroke={dimColor} strokeWidth="0.3" strokeDasharray="5,5" />
                </g>
            )
        }

        // Vista Superior - Muy detallada  
        if (activeView === 'top') {
            return (
                <g className="blueprint-car" fill="none" strokeWidth="1.5">
                    {/* Carrocería principal */}
                    <path
                        d="M-55,-180 L55,-180 L65,-165 L70,-140 L72,-100 L72,100 L70,140 L65,165 L55,180 L-55,180 L-65,165 L-70,140 L-72,100 L-72,-100 L-70,-140 L-65,-165 Z"
                        stroke={strokeColor}
                        strokeWidth="2"
                    />

                    {/* Línea central longitudinal */}
                    <line x1="0" y1="-185" x2="0" y2="185" stroke={dimColor} strokeWidth="0.5" strokeDasharray="8,4" />
                    <text x="5" y="-175" fill={dimColor} fontSize="5">CL</text>

                    {/* Capó */}
                    <path d="M-55,-175 L55,-175 L60,-160 L65,-130 L-65,-130 L-60,-160 Z" stroke={strokeColor} />
                    <line x1="0" y1="-175" x2="0" y2="-130" stroke={dimColor} strokeWidth="0.3" />

                    {/* Entrada de aire capó */}
                    <rect x="-20" y="-155" width="40" height="15" rx="3" stroke={detailColor} strokeWidth="1" />

                    {/* Parabrisas */}
                    <path d="M-50,-125 L50,-125 L55,-100 L-55,-100 Z" stroke={strokeColor} fill={strokeColor} fillOpacity="0.05" />
                    <line x1="-45" y1="-120" x2="45" y2="-120" stroke={detailColor} strokeWidth="0.5" />
                    <line x1="-50" y1="-110" x2="50" y2="-110" stroke={detailColor} strokeWidth="0.5" />

                    {/* Techo */}
                    <rect x="-45" y="-95" width="90" height="130" rx="8" stroke={strokeColor} />
                    <rect x="-40" y="-90" width="80" height="120" rx="5" stroke={detailColor} strokeWidth="0.5" />

                    {/* Techo solar (opcional) */}
                    <rect x="-25" y="-70" width="50" height="40" rx="3" stroke={dimColor} strokeWidth="0.5" strokeDasharray="4,2" />

                    {/* Pilares */}
                    <line x1="-45" y1="-95" x2="-55" y2="-125" stroke={strokeColor} strokeWidth="2" />
                    <line x1="45" y1="-95" x2="55" y2="-125" stroke={strokeColor} strokeWidth="2" />
                    <line x1="-45" y1="35" x2="-55" y2="60" stroke={strokeColor} strokeWidth="2" />
                    <line x1="45" y1="35" x2="55" y2="60" stroke={strokeColor} strokeWidth="2" />

                    {/* Luneta trasera */}
                    <path d="M-50,40 L50,40 L55,70 L-55,70 Z" stroke={strokeColor} fill={strokeColor} fillOpacity="0.05" />

                    {/* Maletero */}
                    <path d="M-55,75 L55,75 L60,100 L65,140 L-65,140 L-60,100 Z" stroke={strokeColor} />

                    {/* Spoiler trasero */}
                    <path d="M-60,145 L60,145 L65,150 L-65,150 Z" stroke={strokeColor} strokeWidth="1.5" />

                    {/* Retrovisores */}
                    <ellipse cx="-75" cy="-110" rx="12" ry="6" stroke={strokeColor} />
                    <ellipse cx="75" cy="-110" rx="12" ry="6" stroke={strokeColor} />

                    {/* Rueda delantera izquierda */}
                    <g transform="translate(-80, -130)">
                        <rect x="-12" y="-28" width="24" height="56" rx="6" stroke={strokeColor} strokeWidth="2" />
                        <rect x="-8" y="-24" width="16" height="48" rx="4" stroke={detailColor} strokeWidth="1" />
                        <line x1="0" y1="-20" x2="0" y2="20" stroke={dimColor} strokeWidth="0.5" />
                    </g>

                    {/* Rueda delantera derecha */}
                    <g transform="translate(80, -130)">
                        <rect x="-12" y="-28" width="24" height="56" rx="6" stroke={strokeColor} strokeWidth="2" />
                        <rect x="-8" y="-24" width="16" height="48" rx="4" stroke={detailColor} strokeWidth="1" />
                        <line x1="0" y1="-20" x2="0" y2="20" stroke={dimColor} strokeWidth="0.5" />
                    </g>

                    {/* Rueda trasera izquierda */}
                    <g transform="translate(-80, 130)">
                        <rect x="-12" y="-28" width="24" height="56" rx="6" stroke={strokeColor} strokeWidth="2" />
                        <rect x="-8" y="-24" width="16" height="48" rx="4" stroke={detailColor} strokeWidth="1" />
                        <line x1="0" y1="-20" x2="0" y2="20" stroke={dimColor} strokeWidth="0.5" />
                    </g>

                    {/* Rueda trasera derecha */}
                    <g transform="translate(80, 130)">
                        <rect x="-12" y="-28" width="24" height="56" rx="6" stroke={strokeColor} strokeWidth="2" />
                        <rect x="-8" y="-24" width="16" height="48" rx="4" stroke={detailColor} strokeWidth="1" />
                        <line x1="0" y1="-20" x2="0" y2="20" stroke={dimColor} strokeWidth="0.5" />
                    </g>

                    {/* Cota de batalla */}
                    <g opacity="0.8" transform="translate(110, 0)">
                        <line x1="0" y1="-130" x2="10" y2="-130" stroke={dimColor} strokeWidth="0.5" />
                        <line x1="0" y1="130" x2="10" y2="130" stroke={dimColor} strokeWidth="0.5" />
                        <line x1="5" y1="-130" x2="5" y2="130" stroke={dimColor} strokeWidth="0.5" />
                        <polygon points="5,-130 3,-125 7,-125" fill={dimColor} />
                        <polygon points="5,130 3,125 7,125" fill={dimColor} />
                        <text x="15" y="5" fill={dimColor} fontSize="7" transform="rotate(90, 15, 5)">{vehicle.baseSpecs.wheelbase}mm</text>
                    </g>

                    {/* Cota de ancho */}
                    <g opacity="0.8" transform="translate(0, -195)">
                        <line x1="-80" y1="0" x2="-80" y2="-10" stroke={dimColor} strokeWidth="0.5" />
                        <line x1="80" y1="0" x2="80" y2="-10" stroke={dimColor} strokeWidth="0.5" />
                        <line x1="-80" y1="-5" x2="80" y2="-5" stroke={dimColor} strokeWidth="0.5" />
                        <polygon points="-80,-5 -75,-3 -75,-7" fill={dimColor} />
                        <polygon points="80,-5 75,-3 75,-7" fill={dimColor} />
                        <text x="0" y="-12" textAnchor="middle" fill={dimColor} fontSize="7">{vehicle.baseSpecs.trackWidth + 100}mm</text>
                    </g>
                </g>
            )
        }

        return null
    }, [viewState, vehicle])

    return (
        <div className={`blueprint-view flex flex-col h-full bg-torres-dark-900 ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 bg-torres-dark-800 border-b border-torres-dark-600">
                {/* View selector */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cycleView(-1)}
                        className="p-1"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <div className="flex gap-1">
                        {VIEW_ORDER.map(view => (
                            <button
                                key={view}
                                onClick={() => handleViewChange(view)}
                                className={`px-2 py-1 text-xs rounded transition-colors ${viewState.activeView === view
                                    ? 'bg-torres-primary text-white'
                                    : 'bg-torres-dark-700 text-torres-light-400 hover:bg-torres-dark-600'
                                    }`}
                            >
                                {VIEW_LABELS[view]}
                            </button>
                        ))}
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cycleView(1)}
                        className="p-1"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
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
                        {Math.round(viewState.zoom * 100)}%
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
                        variant={viewState.showGrid ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => toggleOption('showGrid')}
                        title="Toggle Grid"
                        className="p-1"
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewState.showDimensions ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => toggleOption('showDimensions')}
                        title="Toggle Dimensions"
                        className="p-1"
                    >
                        <Ruler className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewState.showAnnotations ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => toggleOption('showAnnotations')}
                        title="Toggle Annotations"
                        className="p-1"
                    >
                        <Tag className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Blueprint Canvas */}
            <div
                className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                <svg
                    className="w-full h-full"
                    viewBox="-400 -200 800 400"
                    style={{
                        transform: `scale(${viewState.zoom}) translate(${viewState.panOffset.x / viewState.zoom}px, ${viewState.panOffset.y / viewState.zoom}px)`,
                        transformOrigin: 'center'
                    }}
                >
                    {/* Background */}
                    <rect x="-400" y="-200" width="800" height="400" fill="#0a0f1a" />

                    {/* Grid */}
                    <g className="grid text-torres-primary">
                        {gridLines}
                    </g>

                    {/* Blueprint Content */}
                    <g className="blueprint-content">
                        {BlueprintSVG}
                    </g>

                    {/* Dimension annotations */}
                    {dimensionAnnotations}

                    {/* Part annotations */}
                    {viewState.showAnnotations && installedParts.length > 0 && (
                        <g className="annotations">
                            {/* Would render part labels here */}
                        </g>
                    )}

                    {/* Vehicle info */}
                    <g className="info" transform="translate(-380, -180)">
                        <text fill="#00d4ff" fontSize="14" fontWeight="bold">
                            {vehicle.manufacturer} {vehicle.name}
                        </text>
                        <text fill="#64748b" fontSize="10" y="15">
                            {vehicle.year} • {VIEW_LABELS[viewState.activeView]}
                        </text>
                    </g>

                    {/* Scale indicator */}
                    <g className="scale" transform="translate(300, 170)">
                        <line x1="0" y1="0" x2="50" y2="0" stroke="#00d4ff" strokeWidth="2" />
                        <line x1="0" y1="-5" x2="0" y2="5" stroke="#00d4ff" strokeWidth="2" />
                        <line x1="50" y1="-5" x2="50" y2="5" stroke="#00d4ff" strokeWidth="2" />
                        <text fill="#00d4ff" fontSize="8" x="25" y="12" textAnchor="middle">
                            500mm
                        </text>
                    </g>
                </svg>
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-3 py-1 bg-torres-dark-800 border-t border-torres-dark-600 text-xs text-torres-light-400">
                <span>
                    Batalla: {vehicle.baseSpecs.wheelbase}mm •
                    Ancho vías: {vehicle.baseSpecs.trackWidth}mm
                </span>
                <span>
                    {installedParts.length} modificaciones instaladas
                </span>
            </div>
        </div>
    )
})

export default BlueprintView
