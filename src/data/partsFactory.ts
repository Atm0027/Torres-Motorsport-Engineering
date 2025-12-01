// ============================================
// TORRES MOTORSPORT - PARTS FACTORY UTILS
// ============================================

import type { Part, PartCategory, CompatibilityRules, PartStats } from '@/types'

// Universal compatibility for most parts
const UNIVERSAL_COMPAT: CompatibilityRules = {
    mountTypes: [],
    drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
    engineLayouts: ['front', 'mid', 'rear'],
}

// Factory function to create parts with defaults
export function createPart(
    category: PartCategory,
    id: string,
    name: string,
    brand: string,
    price: number,
    stats: PartStats,
    options: {
        weight?: number
        description?: string
        compatibility?: Partial<CompatibilityRules>
    } = {}
): Part {
    return {
        id: `${category}-${id}`,
        name,
        brand,
        category,
        price,
        weight: options.weight ?? 0,
        description: options.description ?? '',
        compatibility: { ...UNIVERSAL_COMPAT, ...options.compatibility },
        stats,
    }
}

// Batch create similar parts
export function createPartVariants(
    category: PartCategory,
    baseId: string,
    baseName: string,
    brand: string,
    variants: Array<{
        suffix: string
        nameSuffix: string
        price: number
        stats: PartStats
    }>,
    baseOptions: {
        weight?: number
        description?: string
        compatibility?: Partial<CompatibilityRules>
    } = {}
): Part[] {
    return variants.map(v => createPart(
        category,
        `${baseId}-${v.suffix}`,
        `${baseName} ${v.nameSuffix}`,
        brand,
        v.price,
        v.stats,
        baseOptions
    ))
}

// Turbo presets
export const TURBO_CONFIGS = {
    small: { horsepowerAdd: 80, torqueAdd: 70, boostPressure: 0.6 },
    medium: { horsepowerAdd: 150, torqueAdd: 130, boostPressure: 1.0 },
    large: { horsepowerAdd: 250, torqueAdd: 200, boostPressure: 1.4 },
    monster: { horsepowerAdd: 400, torqueAdd: 350, boostPressure: 2.0 },
} as const

// Exhaust presets
export const EXHAUST_CONFIGS = {
    catback: { horsepowerAdd: 10, torqueAdd: 8, weightReduction: 5 },
    headers: { horsepowerAdd: 20, torqueAdd: 15, weightReduction: 3 },
    full: { horsepowerAdd: 35, torqueAdd: 25, weightReduction: 15 },
    race: { horsepowerAdd: 50, torqueAdd: 40, weightReduction: 20 },
} as const

// Suspension presets
export const SUSPENSION_CONFIGS = {
    street: { springRate: 6, dampingRate: 6, rideHeight: -20 },
    sport: { springRate: 10, dampingRate: 10, rideHeight: -35 },
    track: { springRate: 14, dampingRate: 14, rideHeight: -45 },
    race: { springRate: 18, dampingRate: 18, rideHeight: -55 },
} as const

// Brake presets
export const BRAKE_CONFIGS = {
    sport: { brakingPower: 15, heatResistance: 1.2 },
    track: { brakingPower: 30, heatResistance: 1.5 },
    race: { brakingPower: 50, heatResistance: 2.0 },
} as const
