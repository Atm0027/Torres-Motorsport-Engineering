import { memo } from 'react'
import { Zap, Gauge as GaugeIcon, Weight, Timer, Wrench, X } from 'lucide-react'
import { StatBar } from '@components/ui/ProgressBar'
import { formatCurrency } from '@utils/formatters'
import type { Vehicle, PerformanceMetrics } from '@/types'

interface PerformanceStatsProps {
    metrics: PerformanceMetrics | undefined
}

export const PerformanceStats = memo(function PerformanceStats({ metrics }: PerformanceStatsProps) {
    if (!metrics) return null

    return (
        <div className="p-4 border-b border-torres-dark-500">
            <h3 className="font-display text-sm font-semibold text-torres-light-100 uppercase tracking-wider mb-4">
                Rendimiento Actual
            </h3>

            <div className="grid grid-cols-2 gap-3">
                <StatCard icon={Zap} value={metrics.horsepower} unit="CV" color="torres-primary" />
                <StatCard icon={GaugeIcon} value={metrics.torque} unit="Nm" color="torres-secondary" />
                <StatCard icon={Weight} value={metrics.weight} unit="kg" color="torres-accent" />
                <StatCard icon={Timer} value={metrics.zeroToSixty} unit="s" label="0-100" color="torres-success" decimals={1} />
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
        </div>
    )
})

interface StatCardProps {
    icon: typeof Zap
    value: number
    unit: string
    color: string
    label?: string
    decimals?: number
}

const StatCard = memo(function StatCard({ icon: Icon, value, unit, color, label, decimals = 0 }: StatCardProps) {
    const formattedValue = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString('es-ES')

    return (
        <div className="bg-torres-dark-700 rounded-lg p-3">
            <Icon className={`w-4 h-4 text-${color} mb-1`} />
            <p className="text-lg font-display font-bold text-torres-light-100">
                {formattedValue}
            </p>
            <p className="text-xs text-torres-light-400">{label || unit}</p>
        </div>
    )
})

interface InstalledPartsListProps {
    vehicle: Vehicle | null
    onUninstallPart: (partId: string) => void
}

export const InstalledPartsList = memo(function InstalledPartsList({
    vehicle,
    onUninstallPart
}: InstalledPartsListProps) {
    if (!vehicle || vehicle.installedParts.length === 0) {
        return (
            <div className="flex-1 overflow-auto p-4">
                <h3 className="font-display text-sm font-semibold text-torres-light-100 uppercase tracking-wider mb-3">
                    Partes Instaladas
                </h3>
                <div className="text-center py-8 text-torres-light-400">
                    <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay partes instaladas</p>
                    <p className="text-xs mt-1">Selecciona una sección para comenzar</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-auto p-4">
            <h3 className="font-display text-sm font-semibold text-torres-light-100 uppercase tracking-wider mb-3">
                Partes Instaladas
            </h3>
            <div className="space-y-2">
                {vehicle.installedParts.map(ip => (
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
        </div>
    )
})

interface UserBalanceProps {
    email: string | undefined
    currency: number
}

export const UserBalance = memo(function UserBalance({ email, currency }: UserBalanceProps) {
    const isDemoUser = email?.toLowerCase() === 'demo@torres.com'

    return (
        <div className="p-4 border-t border-torres-dark-500 bg-torres-dark-800">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-torres-light-400">Tu saldo:</span>
                <span className="text-lg font-display font-bold text-torres-primary">
                    {isDemoUser ? '∞' : formatCurrency(currency)}
                </span>
            </div>
        </div>
    )
})
