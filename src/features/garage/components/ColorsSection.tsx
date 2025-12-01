import { useState, useCallback, memo } from 'react'
import { RotateCcw, Save, Check, Car } from 'lucide-react'
import { Button } from '@components/ui/Button'
import { useNotify } from '@stores/uiStore'
import type { Vehicle } from '@/types'

// Tipos
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

// Constantes
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

interface ColorsSectionProps {
    vehicle: Vehicle | null
}

export const ColorsSection = memo(function ColorsSection({ vehicle }: ColorsSectionProps) {
    const notify = useNotify()
    const [selectedZone, setSelectedZone] = useState<ColorZone>('body')
    const [selectedFinish, setSelectedFinish] = useState('gloss')
    const [colors, setColors] = useState<VehicleColors>(DEFAULT_COLORS)

    const handleColorChange = useCallback((color: string) => {
        setColors(prev => ({ ...prev, [selectedZone]: color }))
    }, [selectedZone])

    const handleApplyAll = useCallback(() => {
        notify.success('Colores aplicados', 'Todos los colores han sido guardados')
    }, [notify])

    const handleResetColors = useCallback(() => {
        setColors(DEFAULT_COLORS)
        notify.info('Colores reseteados', 'Se han restaurado los colores por defecto')
    }, [notify])

    const handleSelectFinish = useCallback((finishId: string, finishName: string) => {
        setSelectedFinish(finishId)
        notify.info('Acabado seleccionado', finishName)
    }, [notify])

    const handleApplyColor = useCallback(() => {
        const zoneName = COLOR_ZONES.find(z => z.id === selectedZone)?.name
        notify.success('Color aplicado', `${zoneName}: ${colors[selectedZone]}`)
    }, [notify, selectedZone, colors])

    if (!vehicle) {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-torres-light-400">Selecciona un vehículo para comenzar</p>
            </div>
        )
    }

    const selectedZoneData = COLOR_ZONES.find(z => z.id === selectedZone)

    return (
        <div className="absolute inset-0 p-6 overflow-auto">
            {/* Header con preview */}
            <ColorsSectionHeader
                vehicle={vehicle}
                colors={colors}
                onReset={handleResetColors}
                onApplyAll={handleApplyAll}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Zonas del vehículo */}
                <ZoneSelector
                    selectedZone={selectedZone}
                    colors={colors}
                    onSelectZone={setSelectedZone}
                />

                {/* Selector de color */}
                <ColorPicker
                    selectedZone={selectedZone}
                    zoneName={selectedZoneData?.name || ''}
                    currentColor={colors[selectedZone]}
                    onColorChange={handleColorChange}
                    onApply={handleApplyColor}
                />

                {/* Acabados */}
                <FinishSelector
                    selectedFinish={selectedFinish}
                    onSelectFinish={handleSelectFinish}
                />
            </div>
        </div>
    )
})

// Sub-componentes
interface ColorsSectionHeaderProps {
    vehicle: Vehicle
    colors: VehicleColors
    onReset: () => void
    onApplyAll: () => void
}

const ColorsSectionHeader = memo(function ColorsSectionHeader({
    vehicle,
    colors,
    onReset,
    onApplyAll
}: ColorsSectionHeaderProps) {
    return (
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
                    <Button variant="ghost" size="sm" onClick={onReset}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Resetear
                    </Button>
                    <Button size="sm" onClick={onApplyAll}>
                        <Save className="w-4 h-4 mr-2" />
                        Guardar Todo
                    </Button>
                </div>
            </div>

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
    )
})

interface ZoneSelectorProps {
    selectedZone: ColorZone
    colors: VehicleColors
    onSelectZone: (zone: ColorZone) => void
}

const ZoneSelector = memo(function ZoneSelector({
    selectedZone,
    colors,
    onSelectZone
}: ZoneSelectorProps) {
    return (
        <div>
            <h3 className="font-display text-lg font-semibold text-torres-light-100 mb-4">
                Zonas del Vehículo
            </h3>
            <div className="space-y-2">
                {COLOR_ZONES.map(zone => (
                    <button
                        key={zone.id}
                        onClick={() => onSelectZone(zone.id)}
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
    )
})

interface ColorPickerProps {
    selectedZone: ColorZone
    zoneName: string
    currentColor: string
    onColorChange: (color: string) => void
    onApply: () => void
}

const ColorPicker = memo(function ColorPicker({
    zoneName,
    currentColor,
    onColorChange,
    onApply
}: ColorPickerProps) {
    const isLightColor = ['#ffffff', '#f59e0b', '#10b981', '#84cc16', '#c0c0c0'].includes(currentColor)

    return (
        <div>
            <h3 className="font-display text-lg font-semibold text-torres-light-100 mb-4">
                Color para {zoneName}
            </h3>

            {/* Preview grande */}
            <div
                className="h-32 rounded-xl mb-4 flex items-center justify-center border-2 border-torres-dark-500 relative overflow-hidden"
                style={{ backgroundColor: currentColor }}
            >
                <Car className="w-16 h-16" style={{ color: isLightColor ? '#000' : '#fff' }} />
                <span className="absolute bottom-2 right-2 text-xs font-mono px-2 py-1 rounded bg-black/50 text-white">
                    {currentColor}
                </span>
            </div>

            {/* Colores predefinidos */}
            <p className="text-sm text-torres-light-400 mb-2">Colores predefinidos:</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
                {PRESET_COLORS.map(preset => (
                    <button
                        key={preset.color}
                        onClick={() => onColorChange(preset.color)}
                        className={`group relative aspect-square rounded-lg border-2 transition-all ${currentColor === preset.color
                                ? 'border-torres-primary scale-105 shadow-lg shadow-torres-primary/30'
                                : 'border-transparent hover:border-torres-dark-400'
                            }`}
                        style={{ backgroundColor: preset.color }}
                        title={preset.name}
                    >
                        {currentColor === preset.color && (
                            <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-lg" />
                        )}
                        <span className="absolute inset-x-0 -bottom-6 text-xs text-torres-light-400 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                            {preset.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Selector personalizado */}
            <div className="flex items-center gap-3 p-3 bg-torres-dark-700 rounded-lg mt-8">
                <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <div className="flex-1">
                    <p className="text-sm text-torres-light-100">Color personalizado</p>
                    <p className="text-xs text-torres-light-400 font-mono">{currentColor}</p>
                </div>
                <Button size="sm" onClick={onApply}>
                    Aplicar
                </Button>
            </div>
        </div>
    )
})

interface FinishSelectorProps {
    selectedFinish: string
    onSelectFinish: (finishId: string, finishName: string) => void
}

const FinishSelector = memo(function FinishSelector({
    selectedFinish,
    onSelectFinish
}: FinishSelectorProps) {
    return (
        <div>
            <h3 className="font-display text-lg font-semibold text-torres-light-100 mb-4">
                Acabado
            </h3>
            <div className="space-y-2">
                {FINISHES.map(finish => (
                    <button
                        key={finish.id}
                        onClick={() => onSelectFinish(finish.id, finish.name)}
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

            {/* Tips */}
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
    )
})
