import { useState, useEffect, useCallback } from 'react'
import type {
    Vehicle,
    VehicleRenderState,
    VehicleMaterials,
    PaintFinish,
    PartCategory
} from '@/types'
import {
    getVehicleModelConfig,
    getPartModelConfig,
    preloadVehicleModels,
    getVehicleSlots
} from '@/services/modelLoader'

interface UseVehicleRenderOptions {
    autoPreload?: boolean
}

interface UseVehicleRenderReturn {
    renderState: VehicleRenderState | null
    isLoading: boolean
    error: string | null

    // Material controls
    setBodyColor: (color: string) => void
    setBodyFinish: (finish: PaintFinish) => void
    setAccentColor: (color: string) => void
    setWheelColor: (color: string) => void
    setCaliperColor: (color: string) => void
    setGlassTint: (tint: number) => void

    // Part visibility
    highlightPart: (partId: string | null) => void
    highlightCategory: (category: PartCategory | null) => void

    // Preloading
    preloadModels: () => Promise<void>
}

export function useVehicleRender(
    vehicle: Vehicle | null,
    options: UseVehicleRenderOptions = {}
): UseVehicleRenderReturn {
    const { autoPreload = true } = options

    const [renderState, setRenderState] = useState<VehicleRenderState | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_highlightedPartId, setHighlightedPartId] = useState<string | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_highlightedCategory, setHighlightedCategory] = useState<PartCategory | null>(null)

    // Initialize render state when vehicle changes
    useEffect(() => {
        if (!vehicle) {
            setRenderState(null)
            return
        }

        const modelConfig = getVehicleModelConfig(vehicle.id)

        // Build loaded parts map from installed parts
        const loadedParts: VehicleRenderState['loadedParts'] = {}
        const slots = getVehicleSlots(vehicle.id)

        for (const slotName of slots) {
            // Find if there's an installed part for this slot
            const installedPart = vehicle.installedParts.find(ip => {
                // Check if this part goes in this slot based on category mapping
                const slotCategory = getSlotCategory(slotName)
                return ip.part.category === slotCategory
            })

            if (installedPart) {
                const partConfig = getPartModelConfig(installedPart.part.id)
                loadedParts[slotName] = {
                    slotName,
                    partId: installedPart.part.id,
                    modelUrl: partConfig?.modelUrl || null,
                    isLoaded: false
                }
            } else {
                loadedParts[slotName] = {
                    slotName,
                    partId: null,
                    modelUrl: null,
                    isLoaded: true // Stock part is always "loaded"
                }
            }
        }

        // Initialize materials from vehicle livery
        const materials: VehicleMaterials = {
            body: {
                color: vehicle.livery.primaryColor,
                finish: vehicle.livery.paintFinish as PaintFinish,
                roughness: getFinishRoughness(vehicle.livery.paintFinish as PaintFinish),
                metalness: getFinishMetalness(vehicle.livery.paintFinish as PaintFinish)
            },
            accents: {
                color: vehicle.livery.accentColor
            },
            wheels: {
                color: '#18181b',
                finish: 'metallic'
            },
            calipers: {
                color: '#dc2626'
            },
            glass: {
                tint: 0.3
            }
        }

        setRenderState({
            vehicleId: vehicle.id,
            modelConfig,
            loadedParts,
            materials,
            camera: {
                position: [4, 2, 4],
                target: [0, 0.5, 0],
                fov: 45,
                zoom: 1
            },
            environment: {
                preset: 'studio',
                ambientIntensity: 0.5,
                shadowIntensity: 0.5
            }
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vehicle?.id, vehicle?.installedParts?.length, vehicle?.livery?.primaryColor])

    // Auto-preload models
    useEffect(() => {
        if (autoPreload && vehicle && renderState) {
            preloadModels()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoPreload, vehicle?.id, renderState?.vehicleId])

    // Preload all models for current vehicle
    const preloadModels = useCallback(async () => {
        if (!vehicle) return

        setIsLoading(true)
        setError(null)

        try {
            await preloadVehicleModels(vehicle)

            // Update loaded status
            setRenderState(prev => {
                if (!prev) return prev

                const updatedParts = { ...prev.loadedParts }
                for (const slotName of Object.keys(updatedParts)) {
                    updatedParts[slotName] = {
                        ...updatedParts[slotName],
                        isLoaded: true
                    }
                }

                return {
                    ...prev,
                    loadedParts: updatedParts
                }
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load models')
        } finally {
            setIsLoading(false)
        }
    }, [vehicle])

    // Material setters
    const setBodyColor = useCallback((color: string) => {
        setRenderState(prev => {
            if (!prev) return prev
            return {
                ...prev,
                materials: {
                    ...prev.materials,
                    body: { ...prev.materials.body, color }
                }
            }
        })
    }, [])

    const setBodyFinish = useCallback((finish: PaintFinish) => {
        setRenderState(prev => {
            if (!prev) return prev
            return {
                ...prev,
                materials: {
                    ...prev.materials,
                    body: {
                        ...prev.materials.body,
                        finish,
                        roughness: getFinishRoughness(finish),
                        metalness: getFinishMetalness(finish)
                    }
                }
            }
        })
    }, [])

    const setAccentColor = useCallback((color: string) => {
        setRenderState(prev => {
            if (!prev) return prev
            return {
                ...prev,
                materials: {
                    ...prev.materials,
                    accents: { ...prev.materials.accents, color }
                }
            }
        })
    }, [])

    const setWheelColor = useCallback((color: string) => {
        setRenderState(prev => {
            if (!prev) return prev
            return {
                ...prev,
                materials: {
                    ...prev.materials,
                    wheels: { ...prev.materials.wheels, color }
                }
            }
        })
    }, [])

    const setCaliperColor = useCallback((color: string) => {
        setRenderState(prev => {
            if (!prev) return prev
            return {
                ...prev,
                materials: {
                    ...prev.materials,
                    calipers: { ...prev.materials.calipers, color }
                }
            }
        })
    }, [])

    const setGlassTint = useCallback((tint: number) => {
        setRenderState(prev => {
            if (!prev) return prev
            return {
                ...prev,
                materials: {
                    ...prev.materials,
                    glass: { ...prev.materials.glass, tint }
                }
            }
        })
    }, [])

    // Part highlighting
    const highlightPart = useCallback((partId: string | null) => {
        setHighlightedPartId(partId)
    }, [])

    const highlightCategoryFn = useCallback((category: PartCategory | null) => {
        setHighlightedCategory(category)
    }, [])

    return {
        renderState,
        isLoading,
        error,
        setBodyColor,
        setBodyFinish,
        setAccentColor,
        setWheelColor,
        setCaliperColor,
        setGlassTint,
        highlightPart,
        highlightCategory: highlightCategoryFn,
        preloadModels
    }
}

// Helper functions
function getSlotCategory(slotName: string): PartCategory | null {
    if (slotName.startsWith('body_')) return 'bodykit'
    if (slotName.startsWith('aero_')) return 'aero'
    if (slotName.startsWith('wheel_')) return 'wheels'
    if (slotName.startsWith('brake_')) return 'brakes'
    if (slotName.startsWith('exhaust_')) return 'exhaust'
    if (slotName.startsWith('lights_')) return 'lighting'
    return null
}

function getFinishRoughness(finish: PaintFinish): number {
    switch (finish) {
        case 'gloss': return 0.1
        case 'metallic': return 0.3
        case 'pearl': return 0.25
        case 'satin': return 0.4
        case 'matte': return 0.8
        case 'chrome': return 0.05
        case 'carbon': return 0.6
        default: return 0.3
    }
}

function getFinishMetalness(finish: PaintFinish): number {
    switch (finish) {
        case 'gloss': return 0.1
        case 'metallic': return 0.8
        case 'pearl': return 0.6
        case 'satin': return 0.3
        case 'matte': return 0.1
        case 'chrome': return 1.0
        case 'carbon': return 0.2
        default: return 0.5
    }
}

export default useVehicleRender
