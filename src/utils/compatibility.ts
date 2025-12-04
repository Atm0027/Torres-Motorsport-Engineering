// ============================================
// TORRES MOTORSPORT ENGINEERING - COMPATIBILITY CHECKER
// ============================================

import type { Part, Vehicle } from '@/types'

export interface CompatibilityResult {
    compatible: boolean
    reason?: string
    warnings?: string[]
}

/**
 * Check if a part is compatible with a vehicle
 */
export function checkCompatibility(part: Part, vehicle: Vehicle): CompatibilityResult {
    const { compatibility } = part
    const { baseSpecs, installedParts } = vehicle
    const warnings: string[] = []

    // Validar que la parte tiene datos de compatibilidad válidos
    if (!compatibility) {
        console.warn('[Compatibility] Parte sin datos de compatibilidad:', part.id)
        // Permitir la parte si no hay reglas de compatibilidad
        return { compatible: true }
    }

    // Validar que el vehículo tiene baseSpecs válidos
    if (!baseSpecs || !baseSpecs.engine) {
        console.warn('[Compatibility] Vehículo sin baseSpecs válidos:', vehicle.id, baseSpecs)
        // Permitir la parte si no hay specs para validar (mejor que bloquear todo)
        return { compatible: true, warnings: ['No se pudo verificar compatibilidad completa'] }
    }

    // Debug: mostrar valores que se comparan
    if (compatibility.mountTypes && compatibility.mountTypes.length > 0) {
        console.log('[Compatibility] Checking mountTypes:', {
            partId: part.id,
            requiredTypes: compatibility.mountTypes,
            vehicleType: baseSpecs.engine.type,
            matches: compatibility.mountTypes.includes(baseSpecs.engine.type)
        })
    }

    // Check mount type compatibility (for engine-related parts)
    // Nota: supercargadores pueden instalarse en motores turbo (con advertencia), no aplicar restricción mountTypes
    if (compatibility.mountTypes && compatibility.mountTypes.length > 0) {
        if (!compatibility.mountTypes.includes(baseSpecs.engine.type)) {
            // Excepción: superchargers en motores turbo generan advertencia, no incompatibilidad
            if (part.category === 'supercharger' && !baseSpecs.engine.naturallyAspirated) {
                warnings.push('Motor turbo de fábrica. Twin-charging (turbo + supercharger) es técnicamente posible pero complejo')
            } else {
                return {
                    compatible: false,
                    reason: `Este componente no es compatible con motores ${baseSpecs.engine.type}. Compatible con: ${compatibility.mountTypes.join(', ')}`,
                }
            }
        }
    }

    // Check drivetrain compatibility
    if (compatibility.drivetrains && compatibility.drivetrains.length > 0) {
        if (!compatibility.drivetrains.includes(baseSpecs.drivetrain)) {
            return {
                compatible: false,
                reason: `Este componente requiere tracción ${compatibility.drivetrains.join(' o ')}. Tu vehículo es ${baseSpecs.drivetrain}`,
            }
        }
    }

    // Check engine layout compatibility
    if (compatibility.engineLayouts && compatibility.engineLayouts.length > 0) {
        if (!compatibility.engineLayouts.includes(baseSpecs.engineLayout)) {
            return {
                compatible: false,
                reason: `Este componente requiere motor ${compatibility.engineLayouts.join(' o ')}. Tu vehículo tiene motor ${baseSpecs.engineLayout}`,
            }
        }
    }

    // Check engine bay size
    if (compatibility.minEngineBaySize && baseSpecs.engineBaySize < compatibility.minEngineBaySize) {
        return {
            compatible: false,
            reason: `El compartimento del motor es demasiado pequeño. Requiere ${compatibility.minEngineBaySize}L, disponible: ${baseSpecs.engineBaySize}L`,
        }
    }

    // Check bolt pattern (for wheels)
    if (compatibility.boltPatterns && compatibility.boltPatterns.length > 0) {
        if (!compatibility.boltPatterns.includes(baseSpecs.boltPattern)) {
            return {
                compatible: false,
                reason: `Patrón de pernos incompatible. Requiere ${compatibility.boltPatterns.join(' o ')}, vehículo: ${baseSpecs.boltPattern}`,
            }
        }
    }

    // Check required parts
    if (compatibility.requiredParts && compatibility.requiredParts.length > 0) {
        const installedPartIds = installedParts.map(ip => ip.part.id)
        const missingParts = compatibility.requiredParts.filter(
            reqId => !installedPartIds.includes(reqId)
        )

        if (missingParts.length > 0) {
            return {
                compatible: false,
                reason: `Requiere los siguientes componentes instalados: ${missingParts.join(', ')}`,
            }
        }
    }

    // Check conflicting parts
    if (compatibility.conflictingParts && compatibility.conflictingParts.length > 0) {
        const installedPartIds = installedParts.map(ip => ip.part.id)
        const conflicts = compatibility.conflictingParts.filter(
            conflictId => installedPartIds.includes(conflictId)
        )

        if (conflicts.length > 0) {
            const conflictingNames = installedParts
                .filter(ip => conflicts.includes(ip.part.id))
                .map(ip => ip.part.name)

            return {
                compatible: false,
                reason: `Incompatible con: ${conflictingNames.join(', ')}`,
            }
        }
    }

    // Check weight constraints
    if (compatibility.maxWeight) {
        const totalWeight = vehicle.currentMetrics.weight + part.weight
        if (totalWeight > compatibility.maxWeight) {
            warnings.push(`El peso total (${totalWeight}kg) excede el límite recomendado (${compatibility.maxWeight}kg)`)
        }
    }

    // Check for turbo + supercharger twin-charging (advertencia, no incompatibilidad)
    if (part.category === 'turbo') {
        const hasSupercharger = installedParts.some(ip => ip.part.category === 'supercharger')
        if (hasSupercharger) {
            warnings.push('Ya tienes un supercargador instalado. Twin-charging (turbo + supercharger) es técnicamente posible pero complejo y poco común')
        }
    }

    if (part.category === 'supercharger') {
        const hasTurbo = installedParts.some(ip => ip.part.category === 'turbo')
        if (hasTurbo) {
            warnings.push('Ya tienes un turbo instalado. Twin-charging (turbo + supercharger) es técnicamente posible pero complejo y poco común')
        }
        // Si es motor turbo de fábrica (no instalado por usuario), también advertir
        if (!baseSpecs.engine.naturallyAspirated && !hasTurbo) {
            warnings.push('Motor turbo de fábrica. Twin-charging (turbo + supercharger) es técnicamente posible pero complejo')
        }
    }

    // Check if NA engine getting forced induction
    if ((part.category === 'turbo' || part.category === 'supercharger') && baseSpecs.engine.naturallyAspirated) {
        warnings.push('Este motor es atmosférico de fábrica. La instalación de sobrealimentación requiere refuerzos adicionales')
    }

    return {
        compatible: true,
        warnings: warnings.length > 0 ? warnings : undefined,
    }
}

/**
 * Get all compatible parts for a vehicle from a catalog
 * Optimizado para usar Sets donde sea posible
 */
export function filterCompatibleParts(parts: Part[], vehicle: Vehicle): Part[] {
    // Pre-calcular valores del vehículo para evitar accesos repetidos
    const { baseSpecs } = vehicle

    return parts.filter(part => {
        // Verificación rápida de compatibilidad básica
        const { compatibility } = part

        // Check mount type (más común)
        if (compatibility.mountTypes.length > 0 &&
            !compatibility.mountTypes.includes(baseSpecs.engine.type)) {
            return false
        }

        // Check drivetrain
        if (compatibility.drivetrains.length > 0 &&
            !compatibility.drivetrains.includes(baseSpecs.drivetrain)) {
            return false
        }

        // Check engine layout
        if (compatibility.engineLayouts.length > 0 &&
            !compatibility.engineLayouts.includes(baseSpecs.engineLayout)) {
            return false
        }

        // Full compatibility check for complex cases
        return checkCompatibility(part, vehicle).compatible
    })
}/**
 * Get parts that would become incompatible if a specific part is removed
 */
export function getDependentParts(partId: string, vehicle: Vehicle): Part[] {
    return vehicle.installedParts
        .filter(ip => ip.part.compatibility.requiredParts?.includes(partId))
        .map(ip => ip.part)
}

/**
 * Check if removing a part would cause other parts to become invalid
 */
export function canRemovePart(partId: string, vehicle: Vehicle): {
    canRemove: boolean
    dependentParts: Part[]
} {
    const dependentParts = getDependentParts(partId, vehicle)

    return {
        canRemove: dependentParts.length === 0,
        dependentParts,
    }
}

/**
 * Get a list of suggested parts based on current build
 */
export function getSuggestedParts(vehicle: Vehicle, allParts: Part[]): Part[] {
    const compatibleParts = filterCompatibleParts(allParts, vehicle)
    const installedCategories = new Set(vehicle.installedParts.map(ip => ip.part.category))

    // Prioritize parts for categories that haven't been upgraded
    const suggestions = compatibleParts
        .filter(part => !installedCategories.has(part.category))
        .sort((a, b) => {
            // Sort by potential horsepower gain
            const aGain = (a.stats.horsepowerAdd || 0) + (a.stats.horsepowerMultiplier || 1) * 10
            const bGain = (b.stats.horsepowerAdd || 0) + (b.stats.horsepowerMultiplier || 1) * 10
            return bGain - aGain
        })

    return suggestions.slice(0, 10)
}

/**
 * Calculate compatibility score (0-100) for a part with a vehicle
 */
export function getCompatibilityScore(part: Part, vehicle: Vehicle): number {
    const result = checkCompatibility(part, vehicle)

    if (!result.compatible) return 0

    let score = 100

    // Reduce score for warnings
    if (result.warnings) {
        score -= result.warnings.length * 15
    }

    // Bonus for same mount type
    if (part.compatibility.mountTypes.includes(vehicle.baseSpecs.engine.type)) {
        score += 5
    }

    return Math.max(Math.min(score, 100), 0)
}
