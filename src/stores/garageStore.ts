import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import type { Vehicle, Part, PartCategory, GarageState, InstalledPart, TuningSettings, SavedBuild, VehicleColors, VehicleFinishes, FinishType } from '@/types'
import { DEFAULT_VEHICLE_COLORS, DEFAULT_VEHICLE_FINISHES } from '@/types'
import { STORAGE_KEYS } from '@/constants'
import { calculatePerformance } from '@utils/physics'
import { checkCompatibility } from '@utils/compatibility'
import { saveBuildToDb, deleteBuildFromDb, getCurrentUserId } from '@/services/buildService'

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

    // Color actions
    setVehicleColor: (zone: keyof VehicleColors, color: string) => void
    setVehicleColors: (colors: Partial<VehicleColors>) => void
    resetVehicleColors: () => void

    // Finish actions
    setVehicleFinish: (zone: keyof VehicleFinishes, finish: FinishType) => void
    setVehicleFinishes: (finishes: Partial<VehicleFinishes>) => void
    resetVehicleFinishes: () => void

    // Utility
    recalculateMetrics: () => void
}

export const useGarageStore = create<GarageStoreState>()(
    persist(
        (set, get) => ({
            currentVehicle: null,
            selectedPart: null,
            viewMode: 'technical',
            selectedSystem: null,
            compareMode: false,
            compareVehicle: null,
            savedBuilds: [],
            vehicleColors: { ...DEFAULT_VEHICLE_COLORS },
            vehicleFinishes: { ...DEFAULT_VEHICLE_FINISHES },

            // Vehicle actions
            setCurrentVehicle: (vehicle) => {
                // Resetear colores a valores por defecto al cambiar de vehículo
                set({
                    currentVehicle: vehicle,
                    vehicleColors: { ...DEFAULT_VEHICLE_COLORS },
                    vehicleFinishes: { ...DEFAULT_VEHICLE_FINISHES }
                })
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

            // Build actions
            saveBuild: (name) => {
                const { currentVehicle, savedBuilds } = get()
                if (!currentVehicle) return null

                const buildName = name || `${currentVehicle.name} Build`

                // Check if this vehicle already has a saved build and update it
                const existingBuildIndex = savedBuilds.findIndex(
                    b => b.vehicleId === currentVehicle.id
                )

                const newBuild: SavedBuild = {
                    id: existingBuildIndex >= 0
                        ? savedBuilds[existingBuildIndex].id
                        : `build-${Date.now()}`,
                    name: buildName,
                    vehicleId: currentVehicle.id,
                    vehicleName: currentVehicle.name,
                    manufacturer: currentVehicle.manufacturer,
                    year: currentVehicle.year,
                    imageUrl: currentVehicle.imageUrl,
                    installedParts: currentVehicle.installedParts,
                    metrics: currentVehicle.currentMetrics,
                    livery: currentVehicle.livery,
                    savedAt: new Date(),
                }

                let updatedBuilds: SavedBuild[]

                if (existingBuildIndex >= 0) {
                    // Update existing build
                    updatedBuilds = [...savedBuilds]
                    updatedBuilds[existingBuildIndex] = newBuild
                } else {
                    // Add new build (max 10 builds, remove oldest if needed)
                    updatedBuilds = [newBuild, ...savedBuilds].slice(0, 10)
                }

                // Sort by savedAt (most recent first)
                updatedBuilds.sort((a, b) =>
                    new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
                )

                set({ savedBuilds: updatedBuilds })

                // Guardar en Supabase de forma asíncrona
                getCurrentUserId().then(userId => {
                    if (userId) {
                        saveBuildToDb(newBuild, userId).then(result => {
                            if (result.success && result.id) {
                                // Actualizar el ID del build con el de Supabase
                                const builds = get().savedBuilds.map(b =>
                                    b.vehicleId === newBuild.vehicleId ? { ...b, id: result.id! } : b
                                )
                                set({ savedBuilds: builds })
                            }
                        })
                    }
                })

                return newBuild
            },

            deleteBuild: (buildId) => {
                const { savedBuilds } = get()
                set({
                    savedBuilds: savedBuilds.filter(b => b.id !== buildId)
                })

                // Eliminar de Supabase de forma asíncrona
                getCurrentUserId().then(userId => {
                    if (userId) {
                        deleteBuildFromDb(buildId, userId)
                    }
                })
            },

            loadBuild: (buildId) => {
                const { savedBuilds } = get()
                const build = savedBuilds.find(b => b.id === buildId)
                if (!build) return

                // Reconstruct vehicle from build
                // This would need to fetch the base vehicle and apply parts
                // For now, we just update the current vehicle's parts if it matches
                const { currentVehicle } = get()
                if (currentVehicle && currentVehicle.id === build.vehicleId) {
                    set({
                        currentVehicle: {
                            ...currentVehicle,
                            installedParts: build.installedParts,
                            // Use saved livery if available, otherwise keep current
                            ...(build.livery && { livery: build.livery }),
                        }
                    })
                    get().recalculateMetrics()
                }
            },

            // Color actions
            setVehicleColor: (zone, color) => {
                set((state) => ({
                    vehicleColors: {
                        ...state.vehicleColors,
                        [zone]: color
                    }
                }))
            },

            setVehicleColors: (colors) => {
                set((state) => ({
                    vehicleColors: {
                        ...state.vehicleColors,
                        ...colors
                    }
                }))
            },

            resetVehicleColors: () => {
                set({ vehicleColors: { ...DEFAULT_VEHICLE_COLORS } })
            },

            // Finish actions
            setVehicleFinish: (zone, finish) => {
                set((state) => ({
                    vehicleFinishes: {
                        ...state.vehicleFinishes,
                        [zone]: finish
                    }
                }))
            },

            setVehicleFinishes: (finishes) => {
                set((state) => ({
                    vehicleFinishes: {
                        ...state.vehicleFinishes,
                        ...finishes
                    }
                }))
            },

            resetVehicleFinishes: () => {
                set({ vehicleFinishes: { ...DEFAULT_VEHICLE_FINISHES } })
            },

            // Utility
            recalculateMetrics: () => {
                const { currentVehicle } = get()
                if (!currentVehicle) return

                const newMetrics = calculatePerformance(currentVehicle)

                // Solo actualizar si las métricas han cambiado significativamente
                const current = currentVehicle.currentMetrics
                const hasChanged = !current ||
                    Math.abs(current.horsepower - newMetrics.horsepower) > 0.1 ||
                    Math.abs(current.torque - newMetrics.torque) > 0.1 ||
                    Math.abs(current.weight - newMetrics.weight) > 0.1

                if (hasChanged) {
                    set({
                        currentVehicle: {
                            ...currentVehicle,
                            currentMetrics: newMetrics,
                        },
                    })
                }
            },
        }),
        {
            name: STORAGE_KEYS.GARAGE_STATE,
            partialize: (state) => ({
                currentVehicle: state.currentVehicle,
                viewMode: state.viewMode,
                savedBuilds: state.savedBuilds,
                vehicleColors: state.vehicleColors,
                vehicleFinishes: state.vehicleFinishes,
            }),
        }
    )
)

// =============================================================================
// SELECTORES OPTIMIZADOS - Evitan re-renders innecesarios
// =============================================================================

// Selector para solo el vehículo actual
export const useCurrentVehicle = () => useGarageStore((state) => state.currentVehicle)

// Selector para el modo de vista
export const useViewMode = () => useGarageStore((state) => state.viewMode)

// Selector para sistema seleccionado
export const useSelectedSystem = () => useGarageStore((state) => state.selectedSystem)

// Selector para la pieza seleccionada
export const useSelectedPart = () => useGarageStore((state) => state.selectedPart)

// Selector para builds guardados
export const useSavedBuilds = () => useGarageStore((state) => state.savedBuilds)

// Selector para colores del vehículo
export const useVehicleColors = () => useGarageStore((state) => state.vehicleColors)

// Selector para acabados del vehículo
export const useVehicleFinishes = () => useGarageStore((state) => state.vehicleFinishes)

// Selector para métricas actuales (con comparación superficial)
export const useCurrentMetrics = () => useGarageStore(
    useShallow((state) => state.currentVehicle?.currentMetrics)
)

// Selector para piezas instaladas
export const useInstalledParts = () => useGarageStore(
    useShallow((state) => state.currentVehicle?.installedParts ?? [])
)

// Selector para acciones de colores
export const useVehicleColorActions = () => useGarageStore(
    useShallow((state) => ({
        setVehicleColor: state.setVehicleColor,
        setVehicleColors: state.setVehicleColors,
        resetVehicleColors: state.resetVehicleColors,
    }))
)

// Selector para acciones de acabados
export const useVehicleFinishActions = () => useGarageStore(
    useShallow((state) => ({
        setVehicleFinish: state.setVehicleFinish,
        setVehicleFinishes: state.setVehicleFinishes,
        resetVehicleFinishes: state.resetVehicleFinishes,
    }))
)

// Selector para acciones (nunca cambian)
export const useGarageActions = () => useGarageStore(
    useShallow((state) => ({
        setCurrentVehicle: state.setCurrentVehicle,
        selectPart: state.selectPart,
        installPart: state.installPart,
        uninstallPart: state.uninstallPart,
        setViewMode: state.setViewMode,
        selectSystem: state.selectSystem,
        saveBuild: state.saveBuild,
        deleteBuild: state.deleteBuild,
        loadBuild: state.loadBuild,
        recalculateMetrics: state.recalculateMetrics,
    }))
)
