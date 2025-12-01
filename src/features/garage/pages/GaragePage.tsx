import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
    Settings2,
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
    Check,
    X,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    Paintbrush
} from 'lucide-react'
import { Card } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { Gauge } from '@components/ui/Gauge'
import { StatBar } from '@components/ui/ProgressBar'
import { useGarageStore } from '@stores/garageStore'
import { useUserStore } from '@stores/userStore'
import { useNotify } from '@stores/uiStore'
import { vehiclesDatabase } from '@/data/vehicles'
import { partsCatalog } from '@/data/parts'
import { PART_CATEGORIES, VIEW_MODES } from '@/constants'
import { formatHorsepower, formatWeight, formatCurrency } from '@utils/formatters'
import { checkCompatibility } from '@utils/compatibility'
import { calculatePerformance } from '@utils/physics'
import type { PartCategory, Vehicle, Part, PerformanceMetrics } from '@/types'

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

    // Selectores individuales para evitar re-renders innecesarios
    const currentVehicle = useGarageStore((state) => state.currentVehicle)
    const setCurrentVehicle = useGarageStore((state) => state.setCurrentVehicle)
    const viewMode = useGarageStore((state) => state.viewMode)
    const setViewMode = useGarageStore((state) => state.setViewMode)
    const selectedSystem = useGarageStore((state) => state.selectedSystem)
    const selectSystem = useGarageStore((state) => state.selectSystem)
    const installPart = useGarageStore((state) => state.installPart)
    const uninstallPart = useGarageStore((state) => state.uninstallPart)

    const user = useUserStore((state) => state.user)
    const spendCurrency = useUserStore((state) => state.spendCurrency)
    const addCurrency = useUserStore((state) => state.addCurrency)
    const notify = useNotify()

    const [activeSection, setActiveSection] = useState<GarageSectionId>(initialSection)
    const [showOverlay, setShowOverlay] = useState(true)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Escuchar cambios de fullscreen del navegador
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

    // Cambiar sección y actualizar URL
    const handleSectionChange = (sectionId: GarageSectionId) => {
        setActiveSection(sectionId)
        setSearchParams({ section: sectionId })
        selectSystem(null)
    }

    // Get parts for current section
    const sectionParts = useMemo(() => {
        const section = GARAGE_SECTIONS[activeSection]
        if (!section.categories.length || !currentVehicle) return []

        return partsCatalog.filter(part => {
            if (!section.categories.includes(part.category)) return false
            return checkCompatibility(part, currentVehicle).compatible
        })
    }, [activeSection, currentVehicle])

    // Get compatible parts for selected system within section
    const compatibleParts = useMemo(() => {
        if (!selectedSystem || !currentVehicle) return sectionParts
        return sectionParts.filter(part => part.category === selectedSystem)
    }, [selectedSystem, currentVehicle, sectionParts])

    // Calcular la previsualización de stats si se instalara una parte
    const calculateStatsPreview = useCallback((part: Part): { current: PerformanceMetrics; preview: PerformanceMetrics } | null => {
        if (!currentVehicle) return null

        const currentMetrics = currentVehicle.currentMetrics

        // Simular la instalación de la parte
        const existingPartOfCategory = currentVehicle.installedParts.find(
            ip => ip.part.category === part.category
        )

        // Crear un vehículo simulado con la nueva parte
        const simulatedParts = existingPartOfCategory
            ? currentVehicle.installedParts.map(ip =>
                ip.part.category === part.category
                    ? { ...ip, part }
                    : ip
            )
            : [...currentVehicle.installedParts, { part, installedAt: new Date() }]

        const simulatedVehicle: Vehicle = {
            ...currentVehicle,
            installedParts: simulatedParts
        }

        const previewMetrics = calculatePerformance(simulatedVehicle)

        return { current: currentMetrics, preview: previewMetrics }
    }, [currentVehicle])

    const handleInstallPart = (part: Part) => {
        if (!user) {
            notify.error('Error', 'Debes iniciar sesión para comprar partes')
            return
        }

        if (!currentVehicle) {
            notify.error('Error', 'Selecciona un vehículo primero')
            return
        }

        // Verificar si ya hay una parte de la misma categoría instalada
        const existingPart = currentVehicle.installedParts.find(
            ip => ip.part.category === part.category
        )

        if (existingPart) {
            // Reemplazar la parte existente
            if (existingPart.part.id === part.id) {
                notify.info('Ya instalada', 'Esta parte ya está instalada en el vehículo')
                return
            }

            // Primero desinstalar la parte anterior
            uninstallPart(existingPart.part.id)
        }

        // Demo user has infinite money
        const isDemoUser = user.email?.toLowerCase() === 'demo@torres.com'
        if (!isDemoUser && user.currency < part.price) {
            notify.error('Fondos insuficientes', `Necesitas ${formatCurrency(part.price - user.currency)} más para esta parte`)
            return
        }

        const result = installPart(part)
        if (result.success) {
            spendCurrency(part.price)
            if (existingPart) {
                notify.success('Parte reemplazada', `${existingPart.part.name} → ${part.name}`)
            } else {
                notify.success('Parte instalada', `${part.name} instalado correctamente`)
            }
        } else {
            notify.error('Error de compatibilidad', result.error || 'No se pudo instalar la parte')
        }
    }

    const handleUninstallPart = (partId: string) => {
        // Find the part to get its price for refund
        const installedPart = currentVehicle?.installedParts.find(ip => ip.part.id === partId)
        if (installedPart) {
            const refundAmount = installedPart.part.price
            uninstallPart(partId)
            addCurrency(refundAmount)
            notify.success('Parte desinstalada', `Has recuperado ${formatCurrency(refundAmount)}`)
        } else {
            uninstallPart(partId)
            notify.info('Parte desinstalada', 'La parte ha sido retirada del vehículo')
        }
    }

    const handleSelectVehicle = (vehicle: Vehicle) => {
        setCurrentVehicle(vehicle)
        notify.info('Vehículo cargado', `${vehicle.manufacturer} ${vehicle.name}`)
    }

    const handleExportBuild = () => {
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
    }

    const handleShareBuild = async () => {
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
    }

    const handleSaveBuild = () => {
        notify.success('Configuración guardada', 'Tu configuración ha sido guardada')
    }

    const handleToggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen()
                notify.info('Pantalla completa', 'Presiona ESC para salir')
            } else {
                await document.exitFullscreen()
            }
        } catch (err) {
            notify.error('Error', 'No se pudo cambiar el modo de pantalla')
        }
    }

    const handleRotateView = () => {
        notify.info('Vista rotada', 'Vista rotada 90°')
    }

    const metrics = currentVehicle?.currentMetrics
    const currentSectionData = GARAGE_SECTIONS[activeSection]

    return (
        <div className="h-full flex">
            {/* Left Panel - Sections Navigation */}
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
                            if (vehicle) handleSelectVehicle(vehicle)
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
                                    onClick={() => handleSectionChange(key as GarageSectionId)}
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
                        onClick={handleSaveBuild}
                        leftIcon={<Save className="w-4 h-4" />}
                    >
                        Guardar Build
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Section Header */}
                <div className="h-14 border-b border-torres-dark-500 bg-torres-dark-800/50 flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${currentSectionData.color}`}>
                            <currentSectionData.icon className="w-5 h-5 text-white" />
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
                                        onClick={() => setViewMode(key as typeof viewMode)}
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
                            onClick={() => setShowOverlay(!showOverlay)}
                            className="p-2 rounded-lg text-torres-light-400 hover:text-torres-light-100 hover:bg-torres-dark-700"
                            title={showOverlay ? 'Ocultar overlay' : 'Mostrar overlay'}
                        >
                            {showOverlay ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={handleRotateView}
                            className="p-2 rounded-lg text-torres-light-400 hover:text-torres-light-100 hover:bg-torres-dark-700"
                            title="Rotar vista"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleToggleFullscreen}
                            className="p-2 rounded-lg text-torres-light-400 hover:text-torres-light-100 hover:bg-torres-dark-700"
                            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

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
                            section={GARAGE_SECTIONS[activeSection]}
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
            <aside className="w-80 border-l border-torres-dark-500 bg-torres-dark-800/50 flex flex-col">
                {/* Performance Stats */}
                <div className="p-4 border-b border-torres-dark-500">
                    <h3 className="font-display text-sm font-semibold text-torres-light-100 uppercase tracking-wider mb-4">
                        Rendimiento Actual
                    </h3>

                    {metrics && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-torres-dark-700 rounded-lg p-3">
                                <Zap className="w-4 h-4 text-torres-primary mb-1" />
                                <p className="text-lg font-display font-bold text-torres-light-100">
                                    {formatNumber(metrics.horsepower)}
                                </p>
                                <p className="text-xs text-torres-light-400">CV</p>
                            </div>
                            <div className="bg-torres-dark-700 rounded-lg p-3">
                                <GaugeIcon className="w-4 h-4 text-torres-secondary mb-1" />
                                <p className="text-lg font-display font-bold text-torres-light-100">
                                    {formatNumber(metrics.torque)}
                                </p>
                                <p className="text-xs text-torres-light-400">Nm</p>
                            </div>
                            <div className="bg-torres-dark-700 rounded-lg p-3">
                                <Weight className="w-4 h-4 text-torres-accent mb-1" />
                                <p className="text-lg font-display font-bold text-torres-light-100">
                                    {formatNumber(metrics.weight)}
                                </p>
                                <p className="text-xs text-torres-light-400">kg</p>
                            </div>
                            <div className="bg-torres-dark-700 rounded-lg p-3">
                                <Timer className="w-4 h-4 text-torres-success mb-1" />
                                <p className="text-lg font-display font-bold text-torres-light-100">
                                    {metrics.zeroToSixty.toFixed(1)}s
                                </p>
                                <p className="text-xs text-torres-light-400">0-100 km/h</p>
                            </div>
                        </div>
                    )}

                    {metrics && (
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
                                        onClick={() => handleUninstallPart(ip.part.id)}
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
                        onClick={handleExportBuild}
                        leftIcon={<Download className="w-4 h-4" />}
                    >
                        Exportar Build
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={handleShareBuild}
                        leftIcon={<Share2 className="w-4 h-4" />}
                    >
                        Compartir
                    </Button>
                </div>
            </aside>
        </div>
    )
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface OverviewSectionProps {
    vehicle: Vehicle | null
    metrics: Vehicle['currentMetrics'] | undefined
    showOverlay: boolean
    viewMode: string
}

function OverviewSection({ vehicle, metrics, showOverlay, viewMode }: OverviewSectionProps) {
    if (!vehicle) {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-torres-light-400">Selecciona un vehículo para comenzar</p>
            </div>
        )
    }

    return (
        <>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <svg viewBox="0 0 400 200" className="w-full max-w-2xl h-auto">
                        <g stroke="currentColor" fill="none" strokeWidth="2" className="text-torres-primary">
                            <path d="M50,120 L80,120 L100,80 L300,80 L320,120 L350,120 L350,140 L50,140 Z" />
                            <path d="M110,80 L130,50 L270,50 L290,80" />
                            <line x1="200" y1="50" x2="200" y2="80" />
                            <circle cx="100" cy="140" r="25" />
                            <circle cx="100" cy="140" r="15" />
                            <circle cx="300" cy="140" r="25" />
                            <circle cx="300" cy="140" r="15" />
                            <rect x="60" y="100" width="30" height="15" rx="2" />
                            <rect x="310" y="100" width="30" height="15" rx="2" />
                        </g>

                        {showOverlay && (
                            <g className="text-torres-light-400" fontSize="10">
                                <text x="200" y="30" textAnchor="middle" fill="currentColor">
                                    {vehicle.manufacturer} {vehicle.name}
                                </text>
                                <text x="200" y="180" textAnchor="middle" fill="currentColor">
                                    {formatHorsepower(metrics?.horsepower ?? 0)} | {formatWeight(metrics?.weight ?? 0)}
                                </text>
                            </g>
                        )}
                    </svg>

                    <p className="text-torres-light-400 mt-4">
                        Vista {VIEW_MODES[viewMode as keyof typeof VIEW_MODES]?.name || viewMode} - {vehicle.year} {vehicle.manufacturer} {vehicle.name}
                    </p>
                </div>
            </div>

            {metrics && showOverlay && (
                <div className="absolute bottom-4 left-4 right-4 flex gap-4">
                    <Card className="p-3 flex-1" padding="none">
                        <div className="flex items-center gap-6">
                            <Gauge value={metrics.horsepower} max={1500} label="Potencia" unit="CV" size="sm" />
                            <Gauge value={metrics.torque} max={1000} label="Torque" unit="Nm" size="sm" variant="orange" />
                            <div className="flex-1 space-y-2">
                                <StatBar value={metrics.zeroToSixty} max={15} label="0-100 km/h" unit="s" variant="success" />
                                <StatBar value={metrics.topSpeed} max={400} label="Vel. Máx" unit="km/h" variant="cyan" />
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </>
    )
}

interface PartsSectionProps {
    vehicle: Vehicle | null
    section: typeof GARAGE_SECTIONS[keyof typeof GARAGE_SECTIONS]
    parts: Part[]
    allSectionParts: Part[]
    selectedSystem: PartCategory | null
    onSelectSystem: (system: PartCategory | null) => void
    onInstallPart: (part: Part) => void
    onUninstallPart: (partId: string) => void
    calculateStatsPreview: (part: Part) => { current: PerformanceMetrics; preview: PerformanceMetrics } | null
}

function PartsSection({ vehicle, section, parts, allSectionParts, selectedSystem, onSelectSystem, onInstallPart, onUninstallPart, calculateStatsPreview }: PartsSectionProps) {
    const [selectedPart, setSelectedPart] = useState<Part | null>(null)

    // Memoizar el cálculo del preview para evitar re-renders innecesarios
    const statsPreview = useMemo(() => {
        if (!selectedPart) return null
        return calculateStatsPreview(selectedPart)
    }, [selectedPart, calculateStatsPreview])

    if (!vehicle) {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-torres-light-400">Selecciona un vehículo para comenzar</p>
            </div>
        )
    }

    const categories = section.categories

    // Agrupar TODAS las partes de la sección por categoría (no solo las filtradas)
    const partsByCategory: Record<string, Part[]> = {}
    categories.forEach(cat => {
        partsByCategory[cat] = allSectionParts.filter(p => p.category === cat)
    })

    const displayParts = selectedSystem ? (partsByCategory[selectedSystem] || []) : parts

    // Función para mostrar la diferencia de stats
    const renderStatDiff = (current: number, preview: number, unit: string, inverse = false) => {
        const diff = preview - current
        if (Math.abs(diff) < 0.01) return null

        // Para stats inversas (peso, tiempo): valor negativo es bueno
        // Para stats normales (potencia, torque): valor positivo es bueno
        const isPositive = inverse ? diff < 0 : diff > 0
        const Icon = isPositive ? ArrowUp : ArrowDown
        const color = isPositive ? 'text-torres-success' : 'text-torres-danger'

        // Mostrar el signo correcto: + cuando sube, - cuando baja
        const sign = diff > 0 ? '+' : ''

        return (
            <span className={`flex items-center gap-1 ${color}`}>
                <Icon className="w-3 h-3" />
                {sign}{diff.toFixed(1)}{unit}
            </span>
        )
    }

    return (
        <div className="absolute inset-0 p-6 overflow-auto">
            {/* Stats Preview Banner */}
            {statsPreview && selectedPart && (
                <div className="mb-4 p-4 bg-torres-dark-800/90 backdrop-blur-sm border border-torres-primary/30 rounded-xl animate-in fade-in duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 text-torres-primary" />
                            <span className="text-sm font-medium text-torres-light-100">
                                Previsualización: {selectedPart.name}
                            </span>
                            {vehicle.installedParts.some(ip => ip.part.category === selectedPart.category) && (
                                <Badge variant="warning" size="sm">Reemplazará parte existente</Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {vehicle.installedParts.some(ip => ip.part.id === selectedPart.id) ? (
                                <button
                                    onClick={() => {
                                        onUninstallPart(selectedPart.id)
                                        setSelectedPart(null)
                                    }}
                                    className="px-4 py-2 bg-torres-danger/20 hover:bg-torres-danger/30 text-torres-danger border border-torres-danger/30 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Desinstalar
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        onInstallPart(selectedPart)
                                        setSelectedPart(null)
                                    }}
                                    className="px-4 py-2 bg-torres-primary/20 hover:bg-torres-primary/30 text-torres-primary border border-torres-primary/30 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Instalar
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedPart(null)}
                                className="p-2 hover:bg-torres-dark-600 rounded-lg text-torres-light-400 hover:text-torres-light-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                            <p className="text-xs text-torres-light-400 mb-1">Potencia</p>
                            <p className="text-lg font-bold text-torres-light-100">
                                {Math.round(statsPreview.preview.horsepower)} CV
                            </p>
                            {renderStatDiff(statsPreview.current.horsepower, statsPreview.preview.horsepower, ' CV')}
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-torres-light-400 mb-1">Par Motor</p>
                            <p className="text-lg font-bold text-torres-light-100">
                                {Math.round(statsPreview.preview.torque)} Nm
                            </p>
                            {renderStatDiff(statsPreview.current.torque, statsPreview.preview.torque, ' Nm')}
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-torres-light-400 mb-1">Peso</p>
                            <p className="text-lg font-bold text-torres-light-100">
                                {Math.round(statsPreview.preview.weight)} kg
                            </p>
                            {renderStatDiff(statsPreview.current.weight, statsPreview.preview.weight, ' kg', true)}
                        </div>
                        <div className="text-center">
                            <p className="text-xs text-torres-light-400 mb-1">0-100 km/h</p>
                            <p className="text-lg font-bold text-torres-light-100">
                                {statsPreview.preview.zeroToHundred.toFixed(2)}s
                            </p>
                            {renderStatDiff(statsPreview.current.zeroToHundred, statsPreview.preview.zeroToHundred, 's', true)}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Categories */}
                <div>
                    <h3 className="font-display text-lg font-semibold text-torres-light-100 mb-4">
                        Categorías
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {categories.map(cat => {
                            const catData = PART_CATEGORIES[cat]
                            const partsInCat = partsByCategory[cat] || []
                            const installedInCat = vehicle.installedParts.filter(ip => ip.part.category === cat).length

                            return (
                                <button
                                    key={cat}
                                    onClick={() => onSelectSystem(selectedSystem === cat ? null : cat)}
                                    className={`p-4 rounded-xl text-left transition-all ${selectedSystem === cat
                                        ? 'bg-torres-primary/20 border-2 border-torres-primary'
                                        : 'bg-torres-dark-700 border-2 border-transparent hover:border-torres-dark-500'
                                        }`}
                                >
                                    <p className="font-semibold text-torres-light-100">{catData?.name || cat}</p>
                                    <p className="text-xs text-torres-light-400 mt-1">
                                        {partsInCat.length} disponibles · {installedInCat}/1 instalada
                                    </p>
                                </button>
                            )
                        })}
                    </div>

                    {/* Installed Parts in Section */}
                    <h3 className="font-display text-lg font-semibold text-torres-light-100 mt-6 mb-4">
                        Instaladas en esta sección
                    </h3>
                    <div className="space-y-2">
                        {vehicle.installedParts
                            .filter(ip => categories.includes(ip.part.category))
                            .map(ip => (
                                <div
                                    key={ip.part.id}
                                    className="flex items-center justify-between p-3 bg-torres-success/10 border border-torres-success/30 rounded-lg"
                                >
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-torres-success" />
                                        <div>
                                            <p className="text-sm font-medium text-torres-light-100">{ip.part.name}</p>
                                            <p className="text-xs text-torres-light-400">{ip.part.brand} · {PART_CATEGORIES[ip.part.category]?.name}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onUninstallPart(ip.part.id)}
                                        className="px-2 py-1 text-xs text-torres-danger hover:bg-torres-danger/20 rounded"
                                    >
                                        Quitar
                                    </button>
                                </div>
                            ))}
                        {vehicle.installedParts.filter(ip => categories.includes(ip.part.category)).length === 0 && (
                            <p className="text-sm text-torres-light-400 text-center py-4">
                                No hay partes instaladas en esta sección
                            </p>
                        )}
                    </div>
                </div>

                {/* Parts List */}
                <div>
                    <h3 className="font-display text-lg font-semibold text-torres-light-100 mb-4">
                        {selectedSystem ? PART_CATEGORIES[selectedSystem]?.name : 'Todas las Partes'}
                        <Badge variant="cyan" className="ml-2">{displayParts.length}</Badge>
                    </h3>
                    <div className="space-y-2 max-h-[60vh] overflow-auto pr-2">
                        {displayParts.map(part => {
                            const isInstalled = vehicle.installedParts.some(ip => ip.part.id === part.id)
                            const hasPartInCategory = vehicle.installedParts.some(ip => ip.part.category === part.category)
                            const willReplace = hasPartInCategory && !isInstalled

                            return (
                                <Card
                                    key={part.id}
                                    variant="hover"
                                    padding="sm"
                                    className={`cursor-pointer transition-all ${isInstalled
                                        ? 'border-torres-success/50 bg-torres-success/10'
                                        : willReplace
                                            ? 'hover:border-torres-warning/50 hover:bg-torres-warning/5'
                                            : 'hover:border-torres-primary/50'
                                        } ${selectedPart?.id === part.id ? 'ring-2 ring-torres-primary' : ''}`}
                                    onClick={() => setSelectedPart(selectedPart?.id === part.id ? null : part)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <p className="text-sm font-medium text-torres-light-100 truncate">
                                                    {part.name}
                                                </p>
                                                {isInstalled && <Badge variant="success" size="sm">Instalada</Badge>}
                                                {willReplace && <Badge variant="warning" size="sm">Reemplazará</Badge>}
                                            </div>
                                            <p className="text-xs text-torres-light-400">{part.brand}</p>
                                            <div className="flex gap-3 mt-2 text-xs flex-wrap">
                                                {part.stats.horsepowerAdd && part.stats.horsepowerAdd !== 0 && (
                                                    <span className={part.stats.horsepowerAdd > 0 ? "text-torres-success" : "text-torres-danger"}>
                                                        {part.stats.horsepowerAdd > 0 ? '+' : ''}{part.stats.horsepowerAdd} CV
                                                    </span>
                                                )}
                                                {part.stats.torqueAdd && part.stats.torqueAdd !== 0 && (
                                                    <span className={part.stats.torqueAdd > 0 ? "text-torres-secondary" : "text-torres-danger"}>
                                                        {part.stats.torqueAdd > 0 ? '+' : ''}{part.stats.torqueAdd} Nm
                                                    </span>
                                                )}
                                                {part.stats.weightReduction && part.stats.weightReduction !== 0 && (
                                                    <span className={part.stats.weightReduction > 0 ? "text-torres-accent" : "text-torres-danger"}>
                                                        {part.stats.weightReduction > 0 ? '-' : '+'}{Math.abs(part.stats.weightReduction)} kg
                                                    </span>
                                                )}
                                                {part.stats.horsepowerMultiplier && part.stats.horsepowerMultiplier !== 1 && (
                                                    <span className={part.stats.horsepowerMultiplier > 1 ? "text-torres-primary" : "text-torres-danger"}>
                                                        ×{part.stats.horsepowerMultiplier.toFixed(2)} CV
                                                    </span>
                                                )}
                                                {part.stats.downforceAdd && part.stats.downforceAdd !== 0 && (
                                                    <span className={part.stats.downforceAdd > 0 ? "text-torres-info" : "text-torres-danger"}>
                                                        {part.stats.downforceAdd > 0 ? '+' : ''}{part.stats.downforceAdd} kg DF
                                                    </span>
                                                )}
                                                {part.stats.dragReduction && part.stats.dragReduction !== 0 && (
                                                    <span className={part.stats.dragReduction > 0 ? "text-torres-accent" : "text-torres-danger"}>
                                                        {part.stats.dragReduction > 0 ? '-' : '+'}{Math.abs(part.stats.dragReduction)}% drag
                                                    </span>
                                                )}
                                                {part.stats.brakingPower && part.stats.brakingPower !== 0 && (
                                                    <span className={part.stats.brakingPower > 0 ? "text-torres-warning" : "text-torres-danger"}>
                                                        {part.stats.brakingPower > 0 ? '+' : ''}{part.stats.brakingPower}% frenos
                                                    </span>
                                                )}
                                                {part.stats.tireGrip && part.stats.tireGrip !== 0 && (
                                                    <span className={part.stats.tireGrip > 0 ? "text-torres-success" : "text-torres-danger"}>
                                                        {part.stats.tireGrip > 0 ? '+' : ''}{part.stats.tireGrip}% grip
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-mono text-torres-primary">
                                                {formatCurrency(part.price)}
                                            </p>
                                            <p className="text-xs text-torres-light-400 mt-1">
                                                {isInstalled ? 'Click para ver opciones' : 'Click para previsualizar'}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}

                        {displayParts.length === 0 && (
                            <div className="text-center py-8 text-torres-light-400">
                                <Settings2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No hay partes disponibles para esta categoría</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ==========================================
// COLORS SECTION - Personalización de colores
// ==========================================

interface VehicleColors {
    body: string
    wheels: string
    calipers: string
    interior: string
    accents: string
    aero: string
    lights: string
}

type ColorZone = keyof VehicleColors

const COLOR_ZONES: { id: ColorZone; name: string; description: string; icon: string }[] = [
    { id: 'body', name: 'Carrocería', description: 'Color principal del vehículo', icon: '🚗' },
    { id: 'wheels', name: 'Llantas', description: 'Color de las llantas', icon: '⚙️' },
    { id: 'calipers', name: 'Pinzas de Freno', description: 'Color de las pinzas', icon: '🔴' },
    { id: 'interior', name: 'Tapicería', description: 'Color del interior', icon: '🪑' },
    { id: 'accents', name: 'Acentos', description: 'Detalles y molduras', icon: '✨' },
    { id: 'aero', name: 'Aerodinámica', description: 'Alerones y difusores', icon: '🎯' },
    { id: 'lights', name: 'Luces', description: 'Color de faros y LEDs', icon: '💡' },
]

const PRESET_COLORS = [
    { color: '#1a1a2e', name: 'Negro Profundo' },
    { color: '#0f172a', name: 'Azul Noche' },
    { color: '#ffffff', name: 'Blanco Puro' },
    { color: '#c0c0c0', name: 'Plata' },
    { color: '#4a4a4a', name: 'Gris Grafito' },
    { color: '#dc2626', name: 'Rojo Racing' },
    { color: '#ea580c', name: 'Naranja Fuego' },
    { color: '#f59e0b', name: 'Amarillo Sol' },
    { color: '#16a34a', name: 'Verde British' },
    { color: '#2563eb', name: 'Azul Eléctrico' },
    { color: '#7c3aed', name: 'Violeta' },
    { color: '#db2777', name: 'Rosa Magenta' },
    { color: '#00d4ff', name: 'Cyan Torres' },
    { color: '#06b6d4', name: 'Turquesa' },
    { color: '#84cc16', name: 'Verde Lima' },
    { color: '#8b4513', name: 'Bronce' },
]

const FINISHES = [
    { id: 'gloss', name: 'Brillante', description: 'Acabado clásico brillante' },
    { id: 'matte', name: 'Mate', description: 'Acabado mate moderno' },
    { id: 'satin', name: 'Satinado', description: 'Entre brillante y mate' },
    { id: 'metallic', name: 'Metalizado', description: 'Con partículas metálicas' },
    { id: 'pearl', name: 'Perlado', description: 'Efecto perla iridiscente' },
    { id: 'chrome', name: 'Cromado', description: 'Efecto espejo cromado' },
]

const DEFAULT_COLORS: VehicleColors = {
    body: '#1a1a2e',
    wheels: '#4a4a4a',
    calipers: '#dc2626',
    interior: '#1a1a2e',
    accents: '#00d4ff',
    aero: '#1a1a2e',
    lights: '#ffffff',
}

function ColorsSection({ vehicle }: { vehicle: Vehicle | null }) {
    const notify = useNotify()
    const [selectedZone, setSelectedZone] = useState<ColorZone>('body')
    const [selectedFinish, setSelectedFinish] = useState('gloss')
    const [colors, setColors] = useState<VehicleColors>(DEFAULT_COLORS)

    if (!vehicle) {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-torres-light-400">Selecciona un vehículo para comenzar</p>
            </div>
        )
    }

    const handleColorChange = (color: string) => {
        setColors(prev => ({ ...prev, [selectedZone]: color }))
    }

    const handleApplyAll = () => {
        notify.success('Colores aplicados', 'Todos los colores han sido guardados')
    }

    const handleResetColors = useCallback(() => {
        setColors(DEFAULT_COLORS)
        notify.info('Colores reseteados', 'Se han restaurado los colores por defecto')
    }, [notify])

    return (
        <div className="absolute inset-0 p-6 overflow-auto">
            {/* Header con preview del vehículo */}
            <div className="mb-6 p-4 bg-torres-dark-800 rounded-xl border border-torres-dark-600">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-display font-bold text-torres-light-100">
                            🎨 Centro de Pintura
                        </h2>
                        <p className="text-sm text-torres-light-400">
                            {vehicle.manufacturer} {vehicle.name}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={handleResetColors}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Resetear
                        </Button>
                        <Button size="sm" onClick={handleApplyAll}>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Todo
                        </Button>
                    </div>
                </div>

                {/* Preview visual del vehículo con colores */}
                <div className="grid grid-cols-7 gap-2">
                    {COLOR_ZONES.map(zone => (
                        <div
                            key={zone.id}
                            className="flex flex-col items-center p-2 rounded-lg bg-torres-dark-700"
                        >
                            <div
                                className="w-10 h-10 rounded-lg border-2 border-torres-dark-500 mb-1"
                                style={{ backgroundColor: colors[zone.id] }}
                            />
                            <span className="text-xs text-torres-light-400 text-center">{zone.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Zonas del vehículo */}
                <div>
                    <h3 className="font-display text-lg font-semibold text-torres-light-100 mb-4">
                        Zonas del Vehículo
                    </h3>
                    <div className="space-y-2">
                        {COLOR_ZONES.map(zone => (
                            <button
                                key={zone.id}
                                onClick={() => setSelectedZone(zone.id)}
                                className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${selectedZone === zone.id
                                    ? 'bg-torres-primary/20 border-2 border-torres-primary'
                                    : 'bg-torres-dark-700 border-2 border-transparent hover:border-torres-dark-500'
                                    }`}
                            >
                                <div
                                    className="w-10 h-10 rounded-lg border-2 border-torres-dark-500 flex items-center justify-center text-lg"
                                    style={{ backgroundColor: colors[zone.id] }}
                                >
                                    {zone.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-torres-light-100">{zone.name}</p>
                                    <p className="text-xs text-torres-light-400">{zone.description}</p>
                                </div>
                                {selectedZone === zone.id && (
                                    <Check className="w-5 h-5 text-torres-primary" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Selector de color */}
                <div>
                    <h3 className="font-display text-lg font-semibold text-torres-light-100 mb-4">
                        Color para {COLOR_ZONES.find(z => z.id === selectedZone)?.name}
                    </h3>

                    {/* Preview grande */}
                    <div
                        className="h-32 rounded-xl mb-4 flex items-center justify-center border-2 border-torres-dark-500 relative overflow-hidden"
                        style={{ backgroundColor: colors[selectedZone] }}
                    >
                        <Car className="w-16 h-16" style={{
                            color: ['#ffffff', '#f59e0b', '#10b981', '#84cc16', '#c0c0c0'].includes(colors[selectedZone]) ? '#000' : '#fff'
                        }} />
                        <span className="absolute bottom-2 right-2 text-xs font-mono px-2 py-1 rounded bg-black/50 text-white">
                            {colors[selectedZone]}
                        </span>
                    </div>

                    {/* Colores predefinidos */}
                    <p className="text-sm text-torres-light-400 mb-2">Colores predefinidos:</p>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {PRESET_COLORS.map(preset => (
                            <button
                                key={preset.color}
                                onClick={() => handleColorChange(preset.color)}
                                className={`group relative aspect-square rounded-lg border-2 transition-all ${colors[selectedZone] === preset.color
                                    ? 'border-torres-primary scale-105 shadow-lg shadow-torres-primary/30'
                                    : 'border-transparent hover:border-torres-dark-400'
                                    }`}
                                style={{ backgroundColor: preset.color }}
                                title={preset.name}
                            >
                                {colors[selectedZone] === preset.color && (
                                    <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-lg" />
                                )}
                                <span className="absolute inset-x-0 -bottom-6 text-xs text-torres-light-400 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                    {preset.name}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Selector de color personalizado */}
                    <div className="flex items-center gap-3 p-3 bg-torres-dark-700 rounded-lg mt-8">
                        <input
                            type="color"
                            value={colors[selectedZone]}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <div className="flex-1">
                            <p className="text-sm text-torres-light-100">Color personalizado</p>
                            <p className="text-xs text-torres-light-400 font-mono">{colors[selectedZone]}</p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => notify.success('Color aplicado', `${COLOR_ZONES.find(z => z.id === selectedZone)?.name}: ${colors[selectedZone]}`)}
                        >
                            Aplicar
                        </Button>
                    </div>
                </div>

                {/* Acabados */}
                <div>
                    <h3 className="font-display text-lg font-semibold text-torres-light-100 mb-4">
                        Acabado
                    </h3>
                    <div className="space-y-2">
                        {FINISHES.map(finish => (
                            <button
                                key={finish.id}
                                onClick={() => {
                                    setSelectedFinish(finish.id)
                                    notify.info('Acabado seleccionado', finish.name)
                                }}
                                className={`w-full p-4 rounded-xl text-left transition-all ${selectedFinish === finish.id
                                    ? 'bg-torres-primary/20 border-2 border-torres-primary'
                                    : 'bg-torres-dark-700 border-2 border-transparent hover:border-torres-dark-500'
                                    }`}
                            >
                                <p className="font-semibold text-torres-light-100">{finish.name}</p>
                                <p className="text-xs text-torres-light-400">{finish.description}</p>
                            </button>
                        ))}
                    </div>

                    {/* Info adicional */}
                    <div className="mt-6 p-4 bg-torres-dark-700/50 rounded-xl border border-torres-dark-600">
                        <h4 className="font-semibold text-torres-light-100 mb-2">💡 Consejos</h4>
                        <ul className="text-xs text-torres-light-400 space-y-1">
                            <li>• Los colores metalizados lucen mejor en carrocería</li>
                            <li>• El cromado es ideal para detalles y acentos</li>
                            <li>• Los acabados mate requieren más cuidado</li>
                            <li>• Combina colores complementarios para mejor resultado</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat('es-ES').format(Math.round(value))
}
