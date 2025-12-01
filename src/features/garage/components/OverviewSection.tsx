import { memo } from 'react'
import { Car, FileImage } from 'lucide-react'
import { Card } from '@components/ui/Card'
import { Gauge } from '@components/ui/Gauge'
import { StatBar } from '@components/ui/ProgressBar'
import { BlueprintView, Vehicle3DView } from '@components/vehicle'
import { formatHorsepower, formatWeight } from '@utils/formatters'
import type { Vehicle, PerformanceMetrics } from '@/types'

interface OverviewSectionProps {
    vehicle: Vehicle | null
    metrics: PerformanceMetrics | undefined
    showOverlay: boolean
    viewMode: string
}

export const OverviewSection = memo(function OverviewSection({
    vehicle,
    metrics,
    showOverlay,
    viewMode
}: OverviewSectionProps) {
    if (!vehicle) {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-torres-light-400">Selecciona un vehículo para comenzar</p>
            </div>
        )
    }

    const renderViewContent = () => {
        switch (viewMode) {
            case '3d':
                return (
                    <Vehicle3DView
                        vehicle={vehicle}
                        className="w-full h-full"
                    />
                )

            case 'blueprint':
                return (
                    <BlueprintView
                        vehicle={vehicle}
                        className="w-full h-full"
                    />
                )

            case 'technical':
            default:
                return (
                    <div className="flex items-center justify-center h-full">
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
                                Vista Técnica - {vehicle.year} {vehicle.manufacturer} {vehicle.name}
                            </p>
                        </div>
                    </div>
                )
        }
    }

    return (
        <>
            <div className="absolute inset-0">
                {renderViewContent()}
            </div>

            {/* View mode indicator - solo para vistas no-3D */}
            {viewMode !== '3d' && (
                <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 ${viewMode === 'blueprint'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-torres-dark-700 text-torres-light-400'
                        }`}>
                        {viewMode === 'blueprint' && <FileImage className="w-3.5 h-3.5" />}
                        {viewMode === 'technical' && <Car className="w-3.5 h-3.5" />}
                        {viewMode === 'blueprint' ? 'Planos 2D' : 'Vista Técnica'}
                    </div>

                    {vehicle.installedParts.length > 0 && (
                        <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-torres-success/20 text-torres-success border border-torres-success/30">
                            {vehicle.installedParts.length} partes instaladas
                        </div>
                    )}
                </div>
            )}

            {/* Stats panel - solo para vistas no-3D */}
            {metrics && showOverlay && viewMode !== '3d' && (
                <div className="absolute bottom-4 left-4 right-4 flex gap-4 z-20">
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
})
