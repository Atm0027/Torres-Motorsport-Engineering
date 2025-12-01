import { useMemo, useCallback } from 'react'
import { useGarageStore } from '@stores/garageStore'
import { useUserStore } from '@stores/userStore'
import { useNotify } from '@stores/uiStore'
import { getPartsByCategories } from '@/data/partsIndex'
import { checkCompatibility } from '@utils/compatibility'
import { calculatePerformance } from '@utils/physics'
import { formatCurrency } from '@utils/formatters'
import type { Vehicle, Part, PartCategory, PerformanceMetrics, User } from '@/types'

type ViewMode = 'technical' | '3d' | 'blueprint'

interface UseGarageActionsReturn {
    // State
    currentVehicle: Vehicle | null
    viewMode: ViewMode
    selectedSystem: PartCategory | null
    user: User | null

    // Actions
    handleInstallPart: (part: Part) => void
    handleUninstallPart: (partId: string) => void
    handleSelectVehicle: (vehicle: Vehicle) => void
    handleSaveBuild: () => void
    calculateStatsPreview: (part: Part) => { current: PerformanceMetrics; preview: PerformanceMetrics } | null

    // Setters
    setViewMode: (mode: ViewMode) => void
    selectSystem: (category: PartCategory | null) => void
    setCurrentVehicle: (vehicle: Vehicle | null) => void
}

export function useGarageActions(): UseGarageActionsReturn {
    // Store selectors - individual to avoid re-renders
    const currentVehicle = useGarageStore(state => state.currentVehicle)
    const setCurrentVehicle = useGarageStore(state => state.setCurrentVehicle)
    const viewMode = useGarageStore(state => state.viewMode)
    const setViewMode = useGarageStore(state => state.setViewMode)
    const selectedSystem = useGarageStore(state => state.selectedSystem)
    const selectSystem = useGarageStore(state => state.selectSystem)
    const installPart = useGarageStore(state => state.installPart)
    const uninstallPart = useGarageStore(state => state.uninstallPart)
    const saveBuild = useGarageStore(state => state.saveBuild)

    const user = useUserStore(state => state.user)
    const spendCurrency = useUserStore(state => state.spendCurrency)
    const addCurrency = useUserStore(state => state.addCurrency)

    const notify = useNotify()

    const handleInstallPart = useCallback((part: Part) => {
        if (!user) {
            notify.error('Error', 'Debes iniciar sesión para comprar partes')
            return
        }

        if (!currentVehicle) {
            notify.error('Error', 'Selecciona un vehículo primero')
            return
        }

        const existingPart = currentVehicle.installedParts.find(
            ip => ip.part.category === part.category
        )

        if (existingPart?.part.id === part.id) {
            notify.info('Ya instalada', 'Esta parte ya está instalada en el vehículo')
            return
        }

        if (existingPart) {
            uninstallPart(existingPart.part.id)
        }

        const isDemoUser = user.email?.toLowerCase() === 'demo@torres.com'
        if (!isDemoUser && user.currency < part.price) {
            notify.error('Fondos insuficientes', `Necesitas ${formatCurrency(part.price - user.currency)} más`)
            return
        }

        const result = installPart(part)
        if (result.success) {
            spendCurrency(part.price)
            notify.success(
                existingPart ? 'Parte reemplazada' : 'Parte instalada',
                existingPart ? `${existingPart.part.name} → ${part.name}` : `${part.name} instalado`
            )
        } else {
            notify.error('Error de compatibilidad', result.error || 'No se pudo instalar')
        }
    }, [user, currentVehicle, installPart, uninstallPart, spendCurrency, notify])

    const handleUninstallPart = useCallback((partId: string) => {
        const installedPart = currentVehicle?.installedParts.find(ip => ip.part.id === partId)
        if (installedPart) {
            uninstallPart(partId)
            addCurrency(installedPart.part.price)
            notify.success('Parte desinstalada', `Recuperaste ${formatCurrency(installedPart.part.price)}`)
        }
    }, [currentVehicle, uninstallPart, addCurrency, notify])

    const handleSelectVehicle = useCallback((vehicle: Vehicle) => {
        setCurrentVehicle(vehicle)
        notify.info('Vehículo cargado', `${vehicle.manufacturer} ${vehicle.name}`)
    }, [setCurrentVehicle, notify])

    const handleSaveBuild = useCallback(() => {
        const savedBuild = saveBuild()
        if (savedBuild) {
            notify.success('Guardado', `"${savedBuild.name}" guardado`)
        } else {
            notify.error('Error', 'No se pudo guardar')
        }
    }, [saveBuild, notify])

    const calculateStatsPreview = useCallback((part: Part): { current: PerformanceMetrics; preview: PerformanceMetrics } | null => {
        if (!currentVehicle) return null

        const currentMetrics = currentVehicle.currentMetrics
        const existingPartOfCategory = currentVehicle.installedParts.find(
            ip => ip.part.category === part.category
        )

        const simulatedParts = existingPartOfCategory
            ? currentVehicle.installedParts.map(ip =>
                ip.part.category === part.category ? { ...ip, part } : ip
            )
            : [...currentVehicle.installedParts, { part, installedAt: new Date() }]

        const simulatedVehicle: Vehicle = { ...currentVehicle, installedParts: simulatedParts }
        const previewMetrics = calculatePerformance(simulatedVehicle)

        return { current: currentMetrics, preview: previewMetrics }
    }, [currentVehicle])

    return {
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
    }
}

interface UsePartsFilterReturn {
    sectionParts: Part[]
    compatibleParts: Part[]
}

export function usePartsFilter(
    categories: PartCategory[],
    currentVehicle: Vehicle | null,
    selectedSystem: PartCategory | null
): UsePartsFilterReturn {
    // Usar índice optimizado en lugar de filtrar todo el catálogo
    const sectionParts = useMemo(() => {
        if (!categories.length || !currentVehicle) return []
        // Obtener partes por categoría usando índice O(n) donde n es categorías, no partes totales
        const categoryParts = getPartsByCategories(categories)
        // Filtrar solo por compatibilidad
        return categoryParts.filter(part => checkCompatibility(part, currentVehicle).compatible)
    }, [categories, currentVehicle])

    const compatibleParts = useMemo(() => {
        if (!selectedSystem || !currentVehicle) return sectionParts
        return sectionParts.filter(part => part.category === selectedSystem)
    }, [selectedSystem, currentVehicle, sectionParts])

    return { sectionParts, compatibleParts }
}
