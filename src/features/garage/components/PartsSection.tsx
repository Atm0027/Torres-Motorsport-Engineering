import { useState, useMemo, memo, useCallback } from 'react'
import {
    Settings2,
    Check,
    X,
    ArrowUp,
    ArrowDown,
    RefreshCw,
} from 'lucide-react'
import { Card } from '@components/ui/Card'
import { Badge } from '@components/ui/Badge'
import { PART_CATEGORIES } from '@/constants'
import { formatCurrency } from '@utils/formatters'
import type { Part, PartCategory, Vehicle, PerformanceMetrics } from '@/types'

interface PartsSectionProps {
    vehicle: Vehicle | null
    section: {
        id: string
        name: string
        description: string
        color: string
        categories: PartCategory[]
    }
    parts: Part[]
    allSectionParts: Part[]
    selectedSystem: PartCategory | null
    onSelectSystem: (system: PartCategory | null) => void
    onInstallPart: (part: Part) => void
    onUninstallPart: (partId: string) => void
    calculateStatsPreview: (part: Part) => { current: PerformanceMetrics; preview: PerformanceMetrics } | null
}

export const PartsSection = memo(function PartsSection({
    vehicle,
    section,
    parts,
    allSectionParts,
    selectedSystem,
    onSelectSystem,
    onInstallPart,
    onUninstallPart,
    calculateStatsPreview
}: PartsSectionProps) {
    const [selectedPart, setSelectedPart] = useState<Part | null>(null)

    const statsPreview = useMemo(() => {
        if (!selectedPart) return null
        return calculateStatsPreview(selectedPart)
    }, [selectedPart, calculateStatsPreview])

    const handleInstall = useCallback(() => {
        if (selectedPart) {
            onInstallPart(selectedPart)
            setSelectedPart(null)
        }
    }, [selectedPart, onInstallPart])

    const handleUninstall = useCallback(() => {
        if (selectedPart) {
            onUninstallPart(selectedPart.id)
            setSelectedPart(null)
        }
    }, [selectedPart, onUninstallPart])

    const handleSelectPart = useCallback((part: Part) => {
        setSelectedPart(prev => prev?.id === part.id ? null : part)
    }, [])

    if (!vehicle) {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-torres-light-400">Selecciona un vehículo para comenzar</p>
            </div>
        )
    }

    const categories = section.categories

    const partsByCategory: Record<string, Part[]> = {}
    categories.forEach(cat => {
        partsByCategory[cat] = allSectionParts.filter(p => p.category === cat)
    })

    const displayParts = selectedSystem ? (partsByCategory[selectedSystem] || []) : parts

    const renderStatDiff = (current: number, preview: number, unit: string, inverse = false) => {
        const diff = preview - current
        if (Math.abs(diff) < 0.01) return null

        const isPositive = inverse ? diff < 0 : diff > 0
        const Icon = isPositive ? ArrowUp : ArrowDown
        const color = isPositive ? 'text-torres-success' : 'text-torres-danger'
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
                <StatsPreviewBanner
                    selectedPart={selectedPart}
                    statsPreview={statsPreview}
                    vehicle={vehicle}
                    onInstall={handleInstall}
                    onUninstall={handleUninstall}
                    onClose={() => setSelectedPart(null)}
                    renderStatDiff={renderStatDiff}
                />
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
                    <InstalledPartsInSection
                        vehicle={vehicle}
                        categories={categories}
                        onUninstallPart={onUninstallPart}
                    />
                </div>

                {/* Parts List */}
                <div>
                    <h3 className="font-display text-lg font-semibold text-torres-light-100 mb-4">
                        {selectedSystem ? PART_CATEGORIES[selectedSystem]?.name : 'Todas las Partes'}
                        <Badge variant="cyan" className="ml-2">{displayParts.length}</Badge>
                    </h3>
                    <PartsList
                        parts={displayParts}
                        vehicle={vehicle}
                        selectedPart={selectedPart}
                        onSelectPart={handleSelectPart}
                    />
                </div>
            </div>
        </div>
    )
})

// Sub-componentes optimizados
interface StatsPreviewBannerProps {
    selectedPart: Part
    statsPreview: { current: PerformanceMetrics; preview: PerformanceMetrics }
    vehicle: Vehicle
    onInstall: () => void
    onUninstall: () => void
    onClose: () => void
    renderStatDiff: (current: number, preview: number, unit: string, inverse?: boolean) => JSX.Element | null
}

const StatsPreviewBanner = memo(function StatsPreviewBanner({
    selectedPart,
    statsPreview,
    vehicle,
    onInstall,
    onUninstall,
    onClose,
    renderStatDiff
}: StatsPreviewBannerProps) {
    const isInstalled = vehicle.installedParts.some(ip => ip.part.id === selectedPart.id)
    const willReplace = vehicle.installedParts.some(ip => ip.part.category === selectedPart.category)

    return (
        <div className="mb-4 p-4 bg-torres-dark-800/90 backdrop-blur-sm border border-torres-primary/30 rounded-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-torres-primary" />
                    <span className="text-sm font-medium text-torres-light-100">
                        Previsualización: {selectedPart.name}
                    </span>
                    {willReplace && !isInstalled && (
                        <Badge variant="warning" size="sm">Reemplazará parte existente</Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {isInstalled ? (
                        <button
                            onClick={onUninstall}
                            className="px-4 py-2 bg-torres-danger/20 hover:bg-torres-danger/30 text-torres-danger border border-torres-danger/30 rounded-lg text-sm font-medium transition-colors"
                        >
                            Desinstalar
                        </button>
                    ) : (
                        <button
                            onClick={onInstall}
                            className="px-4 py-2 bg-torres-primary/20 hover:bg-torres-primary/30 text-torres-primary border border-torres-primary/30 rounded-lg text-sm font-medium transition-colors"
                        >
                            Instalar
                        </button>
                    )}
                    <button
                        onClick={onClose}
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
    )
})

interface InstalledPartsInSectionProps {
    vehicle: Vehicle
    categories: PartCategory[]
    onUninstallPart: (partId: string) => void
}

const InstalledPartsInSection = memo(function InstalledPartsInSection({
    vehicle,
    categories,
    onUninstallPart
}: InstalledPartsInSectionProps) {
    const installedParts = vehicle.installedParts.filter(ip => categories.includes(ip.part.category))

    if (installedParts.length === 0) {
        return (
            <p className="text-sm text-torres-light-400 text-center py-4">
                No hay partes instaladas en esta sección
            </p>
        )
    }

    return (
        <div className="space-y-2">
            {installedParts.map(ip => (
                <div
                    key={ip.part.id}
                    className="flex items-center justify-between p-3 bg-torres-success/10 border border-torres-success/30 rounded-lg"
                >
                    <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-torres-success" />
                        <div>
                            <p className="text-sm font-medium text-torres-light-100">{ip.part.name}</p>
                            <p className="text-xs text-torres-light-400">
                                {ip.part.brand} · {PART_CATEGORIES[ip.part.category]?.name}
                            </p>
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
        </div>
    )
})

interface PartsListProps {
    parts: Part[]
    vehicle: Vehicle
    selectedPart: Part | null
    onSelectPart: (part: Part) => void
}

const PartsList = memo(function PartsList({
    parts,
    vehicle,
    selectedPart,
    onSelectPart
}: PartsListProps) {
    if (parts.length === 0) {
        return (
            <div className="text-center py-8 text-torres-light-400">
                <Settings2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No hay partes disponibles para esta categoría</p>
            </div>
        )
    }

    return (
        <div className="space-y-2 max-h-[60vh] overflow-auto pr-2">
            {parts.map(part => (
                <PartCard
                    key={part.id}
                    part={part}
                    vehicle={vehicle}
                    isSelected={selectedPart?.id === part.id}
                    onClick={() => onSelectPart(part)}
                />
            ))}
        </div>
    )
})

interface PartCardProps {
    part: Part
    vehicle: Vehicle
    isSelected: boolean
    onClick: () => void
}

const PartCard = memo(function PartCard({ part, vehicle, isSelected, onClick }: PartCardProps) {
    const isInstalled = vehicle.installedParts.some(ip => ip.part.id === part.id)
    const hasPartInCategory = vehicle.installedParts.some(ip => ip.part.category === part.category)
    const willReplace = hasPartInCategory && !isInstalled

    return (
        <Card
            variant="hover"
            padding="sm"
            className={`cursor-pointer transition-all ${isInstalled
                ? 'border-torres-success/50 bg-torres-success/10'
                : willReplace
                    ? 'hover:border-torres-warning/50 hover:bg-torres-warning/5'
                    : 'hover:border-torres-primary/50'
                } ${isSelected ? 'ring-2 ring-torres-primary' : ''}`}
            onClick={onClick}
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
                    <PartStats stats={part.stats} />
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
})

interface PartStatsProps {
    stats: Part['stats']
}

const PartStats = memo(function PartStats({ stats }: PartStatsProps) {
    return (
        <div className="flex gap-3 mt-2 text-xs flex-wrap">
            {stats.horsepowerAdd !== 0 && stats.horsepowerAdd !== undefined && (
                <span className={stats.horsepowerAdd > 0 ? "text-torres-success" : "text-torres-danger"}>
                    {stats.horsepowerAdd > 0 ? '+' : ''}{stats.horsepowerAdd} CV
                </span>
            )}
            {stats.torqueAdd !== 0 && stats.torqueAdd !== undefined && (
                <span className={stats.torqueAdd > 0 ? "text-torres-secondary" : "text-torres-danger"}>
                    {stats.torqueAdd > 0 ? '+' : ''}{stats.torqueAdd} Nm
                </span>
            )}
            {stats.weightReduction !== 0 && stats.weightReduction !== undefined && (
                <span className={stats.weightReduction > 0 ? "text-torres-accent" : "text-torres-danger"}>
                    {stats.weightReduction > 0 ? '-' : '+'}{Math.abs(stats.weightReduction)} kg
                </span>
            )}
            {stats.horsepowerMultiplier !== 1 && stats.horsepowerMultiplier !== undefined && (
                <span className={stats.horsepowerMultiplier > 1 ? "text-torres-primary" : "text-torres-danger"}>
                    ×{stats.horsepowerMultiplier.toFixed(2)} CV
                </span>
            )}
            {stats.downforceAdd !== 0 && stats.downforceAdd !== undefined && (
                <span className={stats.downforceAdd > 0 ? "text-torres-info" : "text-torres-danger"}>
                    {stats.downforceAdd > 0 ? '+' : ''}{stats.downforceAdd} kg DF
                </span>
            )}
            {stats.dragReduction !== 0 && stats.dragReduction !== undefined && (
                <span className={stats.dragReduction > 0 ? "text-torres-accent" : "text-torres-danger"}>
                    {stats.dragReduction > 0 ? '-' : '+'}{Math.abs(stats.dragReduction)}% drag
                </span>
            )}
            {stats.brakingPower !== undefined && stats.brakingPower !== 1 && (
                <span className={stats.brakingPower > 1 ? "text-torres-warning" : "text-torres-danger"}>
                    {stats.brakingPower > 1 ? '+' : ''}{Math.round((stats.brakingPower - 1) * 100)}% frenos
                </span>
            )}
            {stats.tireGrip !== undefined && stats.tireGrip !== 1 && (
                <span className={stats.tireGrip > 1 ? "text-torres-success" : "text-torres-danger"}>
                    {stats.tireGrip > 1 ? '+' : ''}{Math.round((stats.tireGrip - 1) * 100)}% grip
                </span>
            )}
        </div>
    )
})
