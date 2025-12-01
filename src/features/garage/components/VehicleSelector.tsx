import { memo } from 'react'
import { Badge } from '@components/ui/Badge'
import { vehiclesDatabase } from '@/data/vehicles'
import type { Vehicle } from '@/types'

interface VehicleSelectorProps {
    currentVehicle: Vehicle | null
    onSelectVehicle: (vehicle: Vehicle) => void
}

export const VehicleSelector = memo(function VehicleSelector({
    currentVehicle,
    onSelectVehicle
}: VehicleSelectorProps) {
    return (
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
    )
})
