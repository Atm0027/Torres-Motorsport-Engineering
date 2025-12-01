import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Vehicle, Part, PartCategory, GarageState, InstalledPart, TuningSettings, SavedBuild } from '@/types'
import { STORAGE_KEYS } from '@/constants'
import { calculatePerformance } from '@utils/physics'
import { checkCompatibility } from '@utils/compatibility'

interface GarageStoreState extends GarageState {
    // Vehicle actions
    setCurrentVehicle: (vehicle: Vehicle | null) => void
    loadVehicle: (vehicleId: string) => void

    // Part actions
    selectPart: (part: Part | null) => void
    installPart: (part: Part) => { success: boolean; error?: string }
    uninstallPart: (partId: string) => void

    // View actions
    setViewMode: (mode: GarageState['viewMode']) => void
    selectSystem: (category: PartCategory | null) => void

    // Compare actions
    toggleCompareMode: () => void
    setCompareVehicle: (vehicle: Vehicle | null) => void

    // Tuning actions
    updateTuning: (partId: string, settings: Partial<TuningSettings>) => void
    resetTuning: (partId: string) => void

    // Build actions
    saveBuild: (name?: string) => SavedBuild | null
    deleteBuild: (buildId: string) => void
    loadBuild: (buildId: string) => void

    // Utility
    recalculateMetrics: () => void
}

export const useGarageStore = create<GarageStoreState>()(
    persist(
        (set, get) => ({
            currentVehicle: null,
            selectedPart: null,
            viewMode: '2d',
            selectedSystem: null,
            compareMode: false,
            compareVehicle: null,

            // Vehicle actions
            setCurrentVehicle: (vehicle) => {
                set({ currentVehicle: vehicle })
                if (vehicle) {
                    get().recalculateMetrics()
                }
            },

            loadVehicle: (_vehicleId) => {
                // TODO: Load vehicle from database/storage
                // For now, use mock data
            },

            // Part actions
            selectPart: (part) => {
                set({ selectedPart: part })
            },

            installPart: (part) => {
                const { currentVehicle } = get()
                if (!currentVehicle) {
                    return { success: false, error: 'No hay vehículo seleccionado' }
                }

                // Check compatibility
                const compatibilityResult = checkCompatibility(part, currentVehicle)
                if (!compatibilityResult.compatible) {
                    return { success: false, error: compatibilityResult.reason }
                }

                // Remove existing part of same category if single-slot
                const singleSlotCategories: PartCategory[] = [
                    'engine', 'turbo', 'supercharger', 'transmission', 'clutch', 'differential', 'ecu'
                ]

                let installedParts = [...currentVehicle.installedParts]

                if (singleSlotCategories.includes(part.category)) {
                    installedParts = installedParts.filter(ip => ip.part.category !== part.category)
                }

                // Add new part
                const newInstalledPart: InstalledPart = {
                    part,
                    installedAt: new Date(),
                }
                installedParts.push(newInstalledPart)

                // Update vehicle
                const updatedVehicle: Vehicle = {
                    ...currentVehicle,
                    installedParts,
                }

                set({ currentVehicle: updatedVehicle })
                get().recalculateMetrics()

                return { success: true }
            },

            uninstallPart: (partId) => {
                const { currentVehicle } = get()
                if (!currentVehicle) return

                const updatedVehicle: Vehicle = {
                    ...currentVehicle,
                    installedParts: currentVehicle.installedParts.filter(
                        ip => ip.part.id !== partId
                    ),
                }

                set({ currentVehicle: updatedVehicle })
                get().recalculateMetrics()
            },

            // View actions
            setViewMode: (viewMode) => {
                set({ viewMode })
            },

            selectSystem: (category) => {
                set({ selectedSystem: category })
            },

            // Compare actions
            toggleCompareMode: () => {
                set((state) => ({
                    compareMode: !state.compareMode,
                    compareVehicle: state.compareMode ? null : state.compareVehicle,
                }))
            },

            setCompareVehicle: (vehicle) => {
                set({ compareVehicle: vehicle })
            },

            // Tuning actions
            updateTuning: (partId, settings) => {
                const { currentVehicle } = get()
                if (!currentVehicle) return

                const updatedParts = currentVehicle.installedParts.map(ip => {
                    if (ip.part.id === partId) {
                        return {
                            ...ip,
                            tuningSettings: { ...ip.tuningSettings, ...settings },
                        }
                    }
                    return ip
                })

                set({
                    currentVehicle: {
                        ...currentVehicle,
                        installedParts: updatedParts,
                    },
                })
                get().recalculateMetrics()
            },

            resetTuning: (partId) => {
                const { currentVehicle } = get()
                if (!currentVehicle) return

                const updatedParts = currentVehicle.installedParts.map(ip => {
                    if (ip.part.id === partId) {
                        return { ...ip, tuningSettings: undefined }
                    }
                    return ip
                })

                set({
                    currentVehicle: {
                        ...currentVehicle,
                        installedParts: updatedParts,
                    },
                })
                get().recalculateMetrics()
            },

            // Utility
            recalculateMetrics: () => {
                const { currentVehicle } = get()
                if (!currentVehicle) return

                const newMetrics = calculatePerformance(currentVehicle)

                set({
                    currentVehicle: {
                        ...currentVehicle,
                        currentMetrics: newMetrics,
                    },
                })
            },
        }),
        {
            name: STORAGE_KEYS.GARAGE_STATE,
            partialize: (state) => ({
                currentVehicle: state.currentVehicle,
                viewMode: state.viewMode,
            }),
        }
    )
)
