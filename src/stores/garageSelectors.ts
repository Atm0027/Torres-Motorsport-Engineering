// ============================================
// GARAGE STORE SELECTORS - Optimized for performance
// ============================================

import { useGarageStore } from './garageStore'
import { shallow } from 'zustand/shallow'

// Individual selectors - no re-render on other state changes
export const useCurrentVehicle = () => useGarageStore(state => state.currentVehicle)
export const useViewMode = () => useGarageStore(state => state.viewMode)
export const useSelectedSystem = () => useGarageStore(state => state.selectedSystem)
export const useSavedBuilds = () => useGarageStore(state => state.savedBuilds)
export const useCompareMode = () => useGarageStore(state => state.compareMode)
export const useCompareVehicle = () => useGarageStore(state => state.compareVehicle)

// Action selectors - these never cause re-renders
export const useGarageActions = () => useGarageStore(state => ({
    setCurrentVehicle: state.setCurrentVehicle,
    setViewMode: state.setViewMode,
    selectSystem: state.selectSystem,
    installPart: state.installPart,
    uninstallPart: state.uninstallPart,
    saveBuild: state.saveBuild,
    deleteBuild: state.deleteBuild,
    loadBuild: state.loadBuild,
    toggleCompareMode: state.toggleCompareMode,
    setCompareVehicle: state.setCompareVehicle,
    recalculateMetrics: state.recalculateMetrics,
}), shallow)

// Derived selectors
export const useInstalledPartsCount = () => useGarageStore(
    state => state.currentVehicle?.installedParts.length ?? 0
)

export const useCurrentMetrics = () => useGarageStore(
    state => state.currentVehicle?.currentMetrics
)

export const useVehicleInfo = () => useGarageStore(state => {
    const v = state.currentVehicle
    if (!v) return null
    return {
        id: v.id,
        name: v.name,
        manufacturer: v.manufacturer,
        year: v.year,
    }
}, shallow)

// Latest build selector
export const useLatestBuild = () => useGarageStore(
    state => state.savedBuilds[0] ?? null
)

// Last N builds selector
export const useLastBuilds = (count: number) => useGarageStore(
    state => state.savedBuilds.slice(0, count),
    shallow
)
