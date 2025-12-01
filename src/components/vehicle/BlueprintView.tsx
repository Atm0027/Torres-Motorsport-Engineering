import { useState, useMemo, useCallback } from 'react'
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
import { getVehicleBlueprints } from '@/services/modelLoader'
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

export function BlueprintView({
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

    // Get blueprint URL based on vehicle and view
    const blueprintUrl = useMemo(() => {
        // First try to get from model config
        const blueprints = getVehicleBlueprints(vehicle.id)

        // If we have a full blueprint, use it (single image with all views)
        if (blueprints?.full) {
            return blueprints.full
        }

        // If we have separate views, use the current view
        if (blueprints) {
            const viewUrl = blueprints[viewState.activeView as keyof typeof blueprints]
            if (viewUrl) return viewUrl
        }

        // Fallback: try common blueprint file patterns
        const extensions = ['.jpg', '.png', '.gif', '.svg']
        for (const ext of extensions) {
            const url = `/blueprints/${vehicle.id}${ext}`
            return url // Return first pattern, image onError will handle failures
        }

        return null
    }, [vehicle.id, viewState.activeView])

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

    // Placeholder blueprint SVG when no image available
    const PlaceholderBlueprint = useMemo(() => {
        const { activeView } = viewState

        // Simple car shapes for each view
        if (activeView === 'side') {
            return (
                <g className="placeholder-car" fill="none" stroke="#00d4ff" strokeWidth="2">
                    {/* Body */}
                    <path d="M-180,0 L-150,0 L-120,-40 L120,-40 L150,0 L180,0 L180,30 L-180,30 Z" />
                    {/* Windows */}
                    <path d="M-110,-35 L-80,-35 L-80,-5 L-110,-5 Z" opacity="0.5" />
                    <path d="M-70,-35 L70,-35 L70,-5 L-70,-5 Z" opacity="0.5" />
                    {/* Wheels */}
                    <circle cx="-120" cy="40" r="35" />
                    <circle cx="-120" cy="40" r="20" />
                    <circle cx="120" cy="40" r="35" />
                    <circle cx="120" cy="40" r="20" />
                    {/* Details */}
                    <rect x="-175" y="5" width="30" height="15" rx="2" opacity="0.5" />
                    <rect x="145" y="5" width="30" height="15" rx="2" opacity="0.5" />
                </g>
            )
        }

        if (activeView === 'front') {
            return (
                <g className="placeholder-car" fill="none" stroke="#00d4ff" strokeWidth="2">
                    {/* Body */}
                    <path d="M-90,50 L-90,-20 L-70,-50 L70,-50 L90,-20 L90,50 Z" />
                    {/* Windshield */}
                    <path d="M-60,-45 L60,-45 L60,-15 L-60,-15 Z" opacity="0.5" />
                    {/* Grille */}
                    <rect x="-50" y="20" width="100" height="25" rx="3" />
                    {/* Headlights */}
                    <ellipse cx="-65" cy="10" rx="15" ry="10" />
                    <ellipse cx="65" cy="10" rx="15" ry="10" />
                    {/* Wheels */}
                    <ellipse cx="-85" cy="55" rx="20" ry="8" />
                    <ellipse cx="85" cy="55" rx="20" ry="8" />
                </g>
            )
        }

        if (activeView === 'rear') {
            return (
                <g className="placeholder-car" fill="none" stroke="#00d4ff" strokeWidth="2">
                    {/* Body */}
                    <path d="M-90,50 L-90,-20 L-70,-50 L70,-50 L90,-20 L90,50 Z" />
                    {/* Rear window */}
                    <path d="M-55,-45 L55,-45 L55,-15 L-55,-15 Z" opacity="0.5" />
                    {/* Tail lights */}
                    <rect x="-85" y="0" width="20" height="30" rx="3" />
                    <rect x="65" y="0" width="20" height="30" rx="3" />
                    {/* Exhaust */}
                    <ellipse cx="-40" cy="45" rx="8" ry="5" />
                    <ellipse cx="40" cy="45" rx="8" ry="5" />
                    {/* Wheels */}
                    <ellipse cx="-85" cy="55" rx="20" ry="8" />
                    <ellipse cx="85" cy="55" rx="20" ry="8" />
                </g>
            )
        }

        if (activeView === 'top') {
            return (
                <g className="placeholder-car" fill="none" stroke="#00d4ff" strokeWidth="2">
                    {/* Body outline */}
                    <path d="M-60,-180 L60,-180 L70,-150 L70,150 L60,180 L-60,180 L-70,150 L-70,-150 Z" />
                    {/* Windshield */}
                    <path d="M-50,-120 L50,-120 L55,-80 L-55,-80 Z" opacity="0.5" />
                    {/* Rear window */}
                    <path d="M-45,80 L45,80 L50,120 L-50,120 Z" opacity="0.5" />
                    {/* Roof */}
                    <rect x="-45" y="-70" width="90" height="140" rx="5" opacity="0.3" />
                    {/* Wheels */}
                    <rect x="-85" y="-140" width="25" height="50" rx="5" />
                    <rect x="60" y="-140" width="25" height="50" rx="5" />
                    <rect x="-85" y="90" width="25" height="50" rx="5" />
                    <rect x="60" y="90" width="25" height="50" rx="5" />
                </g>
            )
        }

        return null
    }, [viewState])

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

                    {/* Blueprint Image or Placeholder */}
                    <g className="blueprint-content">
                        {/* Try to load actual blueprint, fallback to placeholder */}
                        {blueprintUrl && (
                            <image
                                href={blueprintUrl}
                                x="-350"
                                y="-175"
                                width="700"
                                height="350"
                                preserveAspectRatio="xMidYMid meet"
                                opacity="0.9"
                                onError={(e) => {
                                    // Hide broken image
                                    (e.target as SVGImageElement).style.display = 'none'
                                }}
                            />
                        )}
                        {!blueprintUrl && PlaceholderBlueprint}
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
}

export default BlueprintView
