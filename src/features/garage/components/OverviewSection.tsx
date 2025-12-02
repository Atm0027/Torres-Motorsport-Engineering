import { memo } from 'react'
import { FileImage, Gauge as GaugeIcon, Zap, Settings, Cog } from 'lucide-react'
import { Card } from '@components/ui/Card'
import { Gauge } from '@components/ui/Gauge'
import { StatBar } from '@components/ui/ProgressBar'
import { BlueprintView, Vehicle3DView } from '@components/vehicle'
import { formatNumber } from '@utils/formatters'
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
                    <div className="w-full h-full p-6 overflow-auto">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-display font-bold text-torres-primary">
                                FICHA TÉCNICA
                            </h2>
                            <p className="text-torres-light-300 text-lg">
                                {vehicle.year} {vehicle.manufacturer} {vehicle.name}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {/* Columna Izquierda - Motor */}
                            <Card className="p-4 bg-torres-dark-800/80 border-torres-primary/30">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-torres-dark-600">
                                    <Zap className="w-5 h-5 text-torres-primary" />
                                    <h3 className="font-semibold text-torres-light-100">MOTOR</h3>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-torres-light-400">Tipo</span>
                                        <span className="text-torres-light-100 font-mono">{vehicle.baseSpecs?.engine?.type?.toUpperCase() || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-torres-light-400">Configuración</span>
                                        <span className="text-torres-light-100">
                                            {vehicle.baseSpecs?.engine?.cylinders || ''} Cilindros
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-torres-light-400">Cilindrada</span>
                                        <span className="text-torres-light-100">{vehicle.baseSpecs?.engine?.displacement || 0}L</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-torres-light-400">Aspiración</span>
                                        <span className="text-torres-light-100 capitalize">{vehicle.baseSpecs?.engine?.naturallyAspirated ? 'Atmosférico' : 'Turbo'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-torres-light-400">Potencia Base</span>
                                        <span className="text-torres-primary font-bold">{formatNumber(vehicle.baseSpecs?.engine?.baseHorsepower || 0)} CV</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-torres-light-400">Par Motor Base</span>
                                        <span className="text-torres-secondary font-bold">{formatNumber(vehicle.baseSpecs?.engine?.baseTorque || 0)} Nm</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Columna Central - Rendimiento Actual */}
                            <Card className="p-4 bg-torres-dark-800/80 border-torres-success/30">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-torres-dark-600">
                                    <GaugeIcon className="w-5 h-5 text-torres-success" />
                                    <h3 className="font-semibold text-torres-light-100">RENDIMIENTO ACTUAL</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="text-center p-3 bg-torres-dark-900/50 rounded-lg">
                                        <div className="text-3xl font-bold text-torres-primary">
                                            {formatNumber(metrics?.horsepower || 0)}
                                        </div>
                                        <div className="text-xs text-torres-light-400">CV</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="text-center p-2 bg-torres-dark-900/30 rounded">
                                            <div className="text-lg font-bold text-torres-secondary">{formatNumber(metrics?.torque || 0)}</div>
                                            <div className="text-xs text-torres-light-400">Nm</div>
                                        </div>
                                        <div className="text-center p-2 bg-torres-dark-900/30 rounded">
                                            <div className="text-lg font-bold text-torres-light-100">{formatNumber(metrics?.weight || 0)}</div>
                                            <div className="text-xs text-torres-light-400">kg</div>
                                        </div>
                                        <div className="text-center p-2 bg-torres-dark-900/30 rounded">
                                            <div className="text-lg font-bold text-green-400">{metrics?.zeroToSixty?.toFixed(1) || '0.0'}s</div>
                                            <div className="text-xs text-torres-light-400">0-100 km/h</div>
                                        </div>
                                        <div className="text-center p-2 bg-torres-dark-900/30 rounded">
                                            <div className="text-lg font-bold text-cyan-400">{formatNumber(metrics?.topSpeed || 0)}</div>
                                            <div className="text-xs text-torres-light-400">km/h máx</div>
                                        </div>
                                    </div>
                                    <div className="text-center p-2 bg-torres-dark-900/30 rounded">
                                        <div className="text-sm font-bold text-yellow-400">
                                            {((metrics?.horsepower || 0) / ((metrics?.weight || 1) / 1000)).toFixed(1)} CV/ton
                                        </div>
                                        <div className="text-xs text-torres-light-400">Relación Peso/Potencia</div>
                                    </div>
                                </div>
                            </Card>

                            {/* Columna Derecha - Chasis y Transmisión */}
                            <Card className="p-4 bg-torres-dark-800/80 border-torres-secondary/30">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-torres-dark-600">
                                    <Cog className="w-5 h-5 text-torres-secondary" />
                                    <h3 className="font-semibold text-torres-light-100">CHASIS</h3>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-torres-light-400">Tracción</span>
                                        <span className="text-torres-light-100">{vehicle.baseSpecs?.drivetrain || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-torres-light-400">Transmisión</span>
                                        <span className="text-torres-light-100 capitalize">{vehicle.baseSpecs?.transmission?.type || 'Manual'} {vehicle.baseSpecs?.transmission?.gears || 6}V</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-torres-light-400">Peso Base</span>
                                        <span className="text-torres-light-100">{formatNumber(vehicle.baseSpecs?.weight || 0)} kg</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-torres-light-400">Batalla</span>
                                        <span className="text-torres-light-100">{vehicle.baseSpecs?.wheelbase || 0} mm</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-torres-light-400">Motor</span>
                                        <span className="text-torres-light-100 font-mono capitalize">{vehicle.baseSpecs?.engineLayout || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-torres-light-400">Carrocería</span>
                                        <span className="text-torres-light-100 capitalize">{vehicle.bodyStyle || 'Coupe'}</span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Partes Instaladas */}
                        {vehicle.installedParts && vehicle.installedParts.length > 0 && (
                            <Card className="mt-6 p-4 bg-torres-dark-800/80 max-w-6xl mx-auto">
                                <div className="flex items-center gap-2 mb-3">
                                    <Settings className="w-5 h-5 text-torres-primary" />
                                    <h3 className="font-semibold text-torres-light-100">
                                        MODIFICACIONES ({vehicle.installedParts.length})
                                    </h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {vehicle.installedParts.slice(0, 10).map((installedPart, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 text-xs bg-torres-primary/20 text-torres-primary rounded border border-torres-primary/30"
                                        >
                                            {installedPart.part?.name || installedPart.part?.id || 'Parte'}
                                        </span>
                                    ))}
                                    {vehicle.installedParts.length > 10 && (
                                        <span className="px-2 py-1 text-xs bg-torres-dark-600 text-torres-light-400 rounded">
                                            +{vehicle.installedParts.length - 10} más
                                        </span>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>
                )
        }
    }

    return (
        <>
            <div className="absolute inset-0">
                {renderViewContent()}
            </div>

            {/* View mode indicator - solo para blueprint */}
            {viewMode === 'blueprint' && (
                <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
                    <div className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <FileImage className="w-3.5 h-3.5" />
                        Planos 2D
                    </div>

                    {vehicle.installedParts.length > 0 && (
                        <div className="px-3 py-1.5 rounded-lg text-xs font-medium bg-torres-success/20 text-torres-success border border-torres-success/30">
                            {vehicle.installedParts.length} partes instaladas
                        </div>
                    )}
                </div>
            )}

            {/* Stats panel - solo para blueprint */}
            {metrics && showOverlay && viewMode === 'blueprint' && (
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
