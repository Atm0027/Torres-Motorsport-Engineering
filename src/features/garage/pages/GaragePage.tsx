import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    Eye,
    EyeOff,
    RotateCcw,
    Download,
    Share2,
    Maximize2,
    Minimize2,
    Zap,
    Gauge as GaugeIcon,
    Weight,
    Timer,
    Palette,
    Wrench,
    Car,
    Disc,
    Cog,
    Wind,
    CircleDot,
    Sparkles,
    Save,
    ChevronRight,
    Cpu,
    X,
    Paintbrush,
} from 'lucide-react'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { StatBar } from '@components/ui/ProgressBar'
import { useNotify } from '@stores/uiStore'
import { vehiclesDatabase } from '@/data/vehicles'
import { VIEW_MODES } from '@/constants'
import { formatCurrency } from '@utils/formatters'
import type { PartCategory, Vehicle, PerformanceMetrics, User } from '@/types'
import {
    OverviewSection,
    PartsSection,
    ColorsSection
} from '../components'
import { useGarageActions, usePartsFilter } from '../hooks'

// Definir las secciones del garage
const GARAGE_SECTIONS = {
    overview: {
        id: 'overview',
        name: 'Vista General',
        icon: Car,
        description: 'Vista general de tu vehículo',
        color: 'from-torres-primary to-cyan-600',
        categories: [] as PartCategory[],
    },
    engine: {
        id: 'engine',
        name: 'Motor & Potencia',
        icon: Zap,
        description: 'Motor, turbo, admisión, escape y ECU',
        color: 'from-red-500 to-orange-600',
        categories: ['engine', 'turbo', 'supercharger', 'intake', 'exhaust', 'fuel'] as PartCategory[],
    },
    tuning: {
        id: 'tuning',
        name: 'Tuning & ECU',
        icon: Cpu,
        description: 'Mapas de ECU, chips y electrónica',
        color: 'from-purple-500 to-violet-600',
        categories: ['ecu', 'electronics'] as PartCategory[],
    },
    drivetrain: {
        id: 'drivetrain',
        name: 'Mecánica',
        icon: Cog,
        description: 'Transmisión, embrague y diferencial',
        color: 'from-yellow-500 to-amber-600',
        categories: ['transmission', 'clutch', 'differential', 'driveshaft'] as PartCategory[],
    },
    suspension: {
        id: 'suspension',
        name: 'Suspensión',
        icon: Wind,
        description: 'Amortiguadores, muelles y barras',
        color: 'from-green-500 to-emerald-600',
        categories: ['suspension', 'chassis'] as PartCategory[],
    },
    brakes: {
        id: 'brakes',
        name: 'Frenos',
        icon: Disc,
        description: 'Discos, pinzas y líneas de freno',
        color: 'from-orange-500 to-red-600',
        categories: ['brakes'] as PartCategory[],
    },
    wheels: {
        id: 'wheels',
        name: 'Llantas & Neumáticos',
        icon: CircleDot,
        description: 'Llantas, neumáticos y espaciadores',
        color: 'from-blue-500 to-indigo-600',
        categories: ['wheels', 'tires'] as PartCategory[],
    },
    exterior: {
        id: 'exterior',
        name: 'Estética Exterior',
        icon: Sparkles,
        description: 'Carrocería, aerodinámica e iluminación',
        color: 'from-pink-500 to-rose-600',
        categories: ['bodykit', 'aero', 'exterior', 'lighting'] as PartCategory[],
    },
    interior: {
        id: 'interior',
        name: 'Interior',
        icon: Palette,
        description: 'Asientos, instrumentos y seguridad',
        color: 'from-teal-500 to-cyan-600',
        categories: ['interior', 'seats', 'gauges', 'safety'] as PartCategory[],
    },
    colors: {
        id: 'colors',
        name: 'Pintura & Colores',
        icon: Paintbrush,
        description: 'Personaliza los colores de cada parte',
        color: 'from-fuchsia-500 to-purple-600',
        categories: [] as PartCategory[],
    },
} as const

type GarageSectionId = keyof typeof GARAGE_SECTIONS

export function GaragePage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const initialSection = (searchParams.get('section') as GarageSectionId) || 'overview'

    // Usar el hook de acciones
    const {
        currentVehicle,
        viewMode,
        selectedSystem,
        user,
        handleInstallPart,
        handleUninstallPart,
        handleSelectVehicle,
        handleSaveBuild,
        calculateStatsPreview,
        setViewMode,
        selectSystem,
        setCurrentVehicle
    } = useGarageActions()

    const notify = useNotify()

    const [activeSection, setActiveSection] = useState<GarageSectionId>(initialSection)
    const [showOverlay, setShowOverlay] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Hook para filtrar partes
    const currentSectionData = GARAGE_SECTIONS[activeSection]
    const { sectionParts, compatibleParts } = usePartsFilter(
        currentSectionData.categories,
        currentVehicle,
        selectedSystem
    )

    // Escuchar cambios de fullscreen
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [])

    // Sincronizar con URL params
    useEffect(() => {
        const sectionFromUrl = searchParams.get('section') as GarageSectionId
        if (sectionFromUrl && GARAGE_SECTIONS[sectionFromUrl]) {
            setActiveSection(sectionFromUrl)
        }
    }, [searchParams])

    // Set initial vehicle if none selected
    useEffect(() => {
        if (!currentVehicle) {
            const starterVehicle = vehiclesDatabase.find(v => v.id === 'nissan-skyline-r34')
            if (starterVehicle) {
                setCurrentVehicle(starterVehicle)
            }
        }
    }, [currentVehicle, setCurrentVehicle])

    // Handlers
    const handleSectionChange = useCallback((sectionId: GarageSectionId) => {
        setActiveSection(sectionId)
        setSearchParams({ section: sectionId })
        selectSystem(null)
    }, [setSearchParams, selectSystem])

    const handleExportBuild = useCallback(() => {
        if (!currentVehicle) return
        const buildData = {
            vehicle: {
                id: currentVehicle.id,
                name: currentVehicle.name,
                manufacturer: currentVehicle.manufacturer,
                year: currentVehicle.year,
            },
            parts: currentVehicle.installedParts.map(ip => ({
                id: ip.part.id,
                name: ip.part.name,
                brand: ip.part.brand,
            })),
            metrics: currentVehicle.currentMetrics,
            exportDate: new Date().toISOString(),
        }
        const blob = new Blob([JSON.stringify(buildData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${currentVehicle.manufacturer}-${currentVehicle.name}-build.json`
        a.click()
        URL.revokeObjectURL(url)
        notify.success('Build exportado', 'El archivo se ha descargado correctamente')
    }, [currentVehicle, notify])

    const handleShareBuild = useCallback(async () => {
        if (!currentVehicle) return
        const shareText = `¡Mira mi build de ${currentVehicle.manufacturer} ${currentVehicle.name}! ${currentVehicle.currentMetrics?.horsepower ?? 0}CV - Torres Motorsport Engineering`

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Mi Build - Torres Motorsport',
                    text: shareText,
                    url: window.location.href,
                })
                notify.success('Compartido', 'Build compartido exitosamente')
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareText)
                notify.success('Enlace copiado', 'El enlace del build se ha copiado al portapapeles')
            }
        } catch {
            notify.info('Compartir', 'No se pudo compartir el build')
        }
    }, [currentVehicle, notify])

    const handleToggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen()
                notify.info('Pantalla completa', 'Presiona ESC para salir')
            } else {
                await document.exitFullscreen()
            }
        } catch {
            notify.error('Error', 'No se pudo cambiar el modo de pantalla')
        }
    }, [notify])

    const handleRotateView = useCallback(() => {
        notify.info('Vista rotada', 'Vista rotada 90°')
    }, [notify])

    const metrics = currentVehicle?.currentMetrics

    return (
        <div className="h-full flex">
            {/* Left Panel - Sections Navigation */}
            <LeftPanel
                currentVehicle={currentVehicle}
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                onSelectVehicle={handleSelectVehicle}
                onSaveBuild={handleSaveBuild}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Section Header */}
                <SectionHeader
                    currentSectionData={currentSectionData}
                    activeSection={activeSection}
                    viewMode={viewMode}
                    showOverlay={showOverlay}
                    isFullscreen={isFullscreen}
                    onSetViewMode={setViewMode}
                    onToggleOverlay={() => setShowOverlay(!showOverlay)}
                    onRotateView={handleRotateView}
                    onToggleFullscreen={handleToggleFullscreen}
                />

                {/* Content Area */}
                <div className="flex-1 relative bg-blueprint overflow-hidden">
                    {activeSection === 'overview' ? (
                        <OverviewSection
                            vehicle={currentVehicle}
                            metrics={metrics}
                            showOverlay={showOverlay}
                            viewMode={viewMode}
                        />
                    ) : activeSection === 'colors' ? (
                        <ColorsSection vehicle={currentVehicle} />
                    ) : (
                        <PartsSection
                            vehicle={currentVehicle}
                            section={currentSectionData}
                            parts={compatibleParts}
                            allSectionParts={sectionParts}
                            selectedSystem={selectedSystem}
                            onSelectSystem={selectSystem}
                            onInstallPart={handleInstallPart}
                            onUninstallPart={handleUninstallPart}
                            calculateStatsPreview={calculateStatsPreview}
                        />
                    )}
                </div>
            </main>

            {/* Right Panel - Stats & Info */}
            <RightPanel
                currentVehicle={currentVehicle}
                metrics={metrics}
                user={user}
                onUninstallPart={handleUninstallPart}
                onExportBuild={handleExportBuild}
                onShareBuild={handleShareBuild}
            />
        </div>
    )
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface LeftPanelProps {
    currentVehicle: Vehicle | null
    activeSection: GarageSectionId
    onSectionChange: (sectionId: GarageSectionId) => void
    onSelectVehicle: (vehicle: Vehicle) => void
    onSaveBuild: () => void
}

function LeftPanel({ currentVehicle, activeSection, onSectionChange, onSelectVehicle, onSaveBuild }: LeftPanelProps) {
    return (
        <aside className="w-64 min-w-[256px] border-r border-torres-dark-500 bg-torres-dark-800/50 flex flex-col">
            {/* Vehicle Selector */}
            <div className="p-4 border-b border-torres-dark-500">
                <h3 className="font-display text-sm font-semibold text-torres-light-100 uppercase tracking-wider mb-3">
                    Vehículo Activo
                </h3>
                <select
                    className="input text-sm w-full"
                    value={currentVehicle?.id ?? ''}
                    onChange={(e) => {
                        const vehicle = vehiclesDatabase.find(v => v.id === e.target.value)
                        if (vehicle) onSelectVehicle(vehicle)
                    }}
                >
                    {vehiclesDatabase.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.year} {vehicle.manufacturer} {vehicle.name}
                        </option>
                    ))}
                </select>

                {currentVehicle && (
                    <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-torres-light-400">Partes instaladas:</span>
                        <Badge variant="cyan">{currentVehicle.installedParts.length}</Badge>
                    </div>
                )}
            </div>

            {/* Sections List */}
            <div className="flex-1 overflow-auto p-4">
                <h3 className="font-display text-sm font-semibold text-torres-light-100 uppercase tracking-wider mb-3">
                    Secciones
                </h3>
                <nav className="space-y-2">
                    {Object.entries(GARAGE_SECTIONS).map(([key, section]) => {
                        const Icon = section.icon
                        const isActive = activeSection === key
                        const installedCount = section.categories.length > 0 && currentVehicle
                            ? currentVehicle.installedParts.filter(ip =>
                                section.categories.includes(ip.part.category)
                            ).length
                            : 0

                        return (
                            <button
                                key={key}
                                onClick={() => onSectionChange(key as GarageSectionId)}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${isActive
                                    ? 'bg-gradient-to-r ' + section.color + ' text-white shadow-lg'
                                    : 'text-torres-light-300 hover:bg-torres-dark-700 hover:text-torres-light-100'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg flex-shrink-0 ${isActive ? 'bg-white/20' : 'bg-torres-dark-600'}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <p className="text-sm font-medium">{section.name}</p>
                                    <p className={`text-xs ${isActive ? 'text-white/70' : 'text-torres-light-400'}`}>
                                        {section.description}
                                    </p>
                                </div>
                                {installedCount > 0 && (
                                    <Badge variant="cyan" size="sm" className="flex-shrink-0">
                                        {installedCount}
                                    </Badge>
                                )}
                                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-torres-light-500'}`} />
                            </button>
                        )
                    })}
                </nav>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-torres-dark-500 space-y-2">
                <Button
                    className="w-full"
                    size="sm"
                    onClick={onSaveBuild}
                    leftIcon={<Save className="w-4 h-4" />}
                >
                    Guardar Build
                </Button>
            </div>
        </aside>
    )
}

interface SectionHeaderProps {
    currentSectionData: typeof GARAGE_SECTIONS[keyof typeof GARAGE_SECTIONS]
    activeSection: GarageSectionId
    viewMode: string
    showOverlay: boolean
    isFullscreen: boolean
    onSetViewMode: (mode: 'technical' | '3d' | 'blueprint') => void
    onToggleOverlay: () => void
    onRotateView: () => void
    onToggleFullscreen: () => void
}

function SectionHeader({
    currentSectionData,
    activeSection,
    viewMode,
    showOverlay,
    isFullscreen,
    onSetViewMode,
    onToggleOverlay,
    onRotateView,
    onToggleFullscreen
}: SectionHeaderProps) {
    const Icon = currentSectionData.icon

    return (
        <div className="h-14 border-b border-torres-dark-500 bg-torres-dark-800/50 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${currentSectionData.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="font-display font-semibold text-torres-light-100">
                        {currentSectionData.name}
                    </h2>
                    <p className="text-xs text-torres-light-400">{currentSectionData.description}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {activeSection === 'overview' && (
                    <>
                        {Object.entries(VIEW_MODES).map(([key, mode]) => (
                            <button
                                key={key}
                                onClick={() => onSetViewMode(key as 'technical' | '3d' | 'blueprint')}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === key
                                    ? 'bg-torres-primary text-torres-dark-900'
                                    : 'text-torres-light-400 hover:text-torres-light-100 hover:bg-torres-dark-700'
                                    }`}
                            >
                                {mode.name}
                            </button>
                        ))}
                        <div className="w-px h-6 bg-torres-dark-500 mx-2" />
                    </>
                )}
                <button
                    onClick={onToggleOverlay}
                    className="p-2 rounded-lg text-torres-light-400 hover:text-torres-light-100 hover:bg-torres-dark-700"
                    title={showOverlay ? 'Ocultar overlay' : 'Mostrar overlay'}
                >
                    {showOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                    onClick={onRotateView}
                    className="p-2 rounded-lg text-torres-light-400 hover:text-torres-light-100 hover:bg-torres-dark-700"
                    title="Rotar vista"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
                <button
                    onClick={onToggleFullscreen}
                    className="p-2 rounded-lg text-torres-light-400 hover:text-torres-light-100 hover:bg-torres-dark-700"
                    title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
            </div>
        </div>
    )
}

interface RightPanelProps {
    currentVehicle: Vehicle | null
    metrics: PerformanceMetrics | undefined
    user: User | null
    onUninstallPart: (partId: string) => void
    onExportBuild: () => void
    onShareBuild: () => void
}

function RightPanel({ currentVehicle, metrics, user, onUninstallPart, onExportBuild, onShareBuild }: RightPanelProps) {
    return (
        <aside className="w-80 border-l border-torres-dark-500 bg-torres-dark-800/50 flex flex-col">
            {/* Performance Stats */}
            <div className="p-4 border-b border-torres-dark-500">
                <h3 className="font-display text-sm font-semibold text-torres-light-100 uppercase tracking-wider mb-4">
                    Rendimiento Actual
                </h3>

                {metrics && (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <StatBox icon={Zap} value={metrics.horsepower} label="CV" color="text-torres-primary" />
                            <StatBox icon={GaugeIcon} value={metrics.torque} label="Nm" color="text-torres-secondary" />
                            <StatBox icon={Weight} value={metrics.weight} label="kg" color="text-torres-accent" />
                            <StatBox icon={Timer} value={metrics.zeroToSixty} label="0-100 km/h" suffix="s" color="text-torres-success" decimals={1} />
                        </div>

                        <div className="mt-4 space-y-2">
                            <StatBar
                                value={metrics.topSpeed}
                                max={400}
                                label="Velocidad Máxima"
                                unit="km/h"
                                variant="cyan"
                            />
                            <StatBar
                                value={Math.round(metrics.horsepower / metrics.weight * 1000)}
                                max={500}
                                label="Relación Peso/Potencia"
                                unit="CV/ton"
                                variant="orange"
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Installed Parts Summary */}
            <div className="flex-1 overflow-auto p-4">
                <h3 className="font-display text-sm font-semibold text-torres-light-100 uppercase tracking-wider mb-3">
                    Partes Instaladas
                </h3>

                {currentVehicle && currentVehicle.installedParts.length > 0 ? (
                    <div className="space-y-2">
                        {currentVehicle.installedParts.map(ip => (
                            <div
                                key={ip.part.id}
                                className="flex items-center justify-between p-2 bg-torres-dark-700 rounded-lg group"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-torres-light-100 truncate">{ip.part.name}</p>
                                    <p className="text-xs text-torres-light-400">{ip.part.brand}</p>
                                </div>
                                <button
                                    onClick={() => onUninstallPart(ip.part.id)}
                                    className="p-1.5 text-torres-light-400 hover:text-torres-danger hover:bg-torres-danger/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Desinstalar"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-torres-light-400">
                        <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay partes instaladas</p>
                        <p className="text-xs mt-1">Selecciona una sección para comenzar</p>
                    </div>
                )}
            </div>

            {/* User Currency */}
            {user && (
                <div className="p-4 border-t border-torres-dark-500 bg-torres-dark-800">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-torres-light-400">Tu saldo:</span>
                        <span className="text-lg font-display font-bold text-torres-primary">
                            {user.email?.toLowerCase() === 'demo@torres.com' ? '∞' : formatCurrency(user.currency)}
                        </span>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="p-4 border-t border-torres-dark-500 space-y-2">
                <Button
                    className="w-full"
                    onClick={onExportBuild}
                    leftIcon={<Download className="w-4 h-4" />}
                >
                    Exportar Build
                </Button>
                <Button
                    variant="secondary"
                    className="w-full"
                    onClick={onShareBuild}
                    leftIcon={<Share2 className="w-4 h-4" />}
                >
                    Compartir
                </Button>
            </div>
        </aside>
    )
}

// Componente auxiliar para stats
interface StatBoxProps {
    icon: React.ElementType
    value: number
    label: string
    color: string
    suffix?: string
    decimals?: number
}

function StatBox({ icon: Icon, value, label, color, suffix = '', decimals = 0 }: StatBoxProps) {
    const formattedValue = decimals > 0
        ? value.toFixed(decimals)
        : new Intl.NumberFormat('es-ES').format(Math.round(value))

    return (
        <div className="bg-torres-dark-700 rounded-lg p-3">
            <Icon className={`w-4 h-4 ${color} mb-1`} />
            <p className="text-lg font-display font-bold text-torres-light-100">
                {formattedValue}{suffix}
            </p>
            <p className="text-xs text-torres-light-400">{label}</p>
        </div>
    )
}
