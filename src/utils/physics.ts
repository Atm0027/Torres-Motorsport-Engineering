// ============================================
// TORRES MOTORSPORT ENGINEERING - PHYSICS ENGINE
// Optimizado con caché de cálculos
// ============================================

import type { Vehicle, PerformanceMetrics, PhysicsConfig } from '@/types'
import { PHYSICS } from '@/constants'

// Caché de métricas calculadas para evitar recálculos innecesarios
const metricsCache = new WeakMap<Vehicle, { hash: string; metrics: PerformanceMetrics }>()

// Generar hash de las partes instaladas para invalidar caché
function generatePartsHash(vehicle: Vehicle): string {
    const parts = vehicle.installedParts
        .map(ip => `${ip.part.id}:${ip.tuningSettings?.boostTarget ?? 0}`)
        .sort()
        .join('|')
    return `${vehicle.id}:${parts}`
}

// Default physics configuration (exported for potential future use)
export const DEFAULT_PHYSICS: PhysicsConfig = {
    airDensity: PHYSICS.AIR_DENSITY,
    rollingResistance: PHYSICS.ROLLING_RESISTANCE_COEFFICIENT,
    drivetrainLoss: 0.15,
    mechanicalGrip: 1.0,
    aeroBalance: 0.5,
}

/**
 * Calculate all performance metrics for a vehicle with its installed parts
 * Utiliza caché para evitar recálculos si las partes no han cambiado
 */
export function calculatePerformance(vehicle: Vehicle): PerformanceMetrics {
    // Verificar caché
    const currentHash = generatePartsHash(vehicle)
    const cached = metricsCache.get(vehicle)
    if (cached && cached.hash === currentHash) {
        return cached.metrics
    }

    const { baseSpecs, installedParts } = vehicle

    // Calculate base values
    let horsepower = baseSpecs.engine.baseHorsepower
    let torque = baseSpecs.engine.baseTorque
    let weight = baseSpecs.weight
    let dragCoefficient = baseSpecs.dragCoefficient
    let downforce = 0
    let brakingPower = 1.0
    let gripMultiplier = 1.0

    // Apply part modifications - optimizado con for...of
    for (const installedPart of installedParts) {
        const { stats } = installedPart.part

        // Engine power modifications
        if (stats.horsepowerAdd) horsepower += stats.horsepowerAdd
        if (stats.horsepowerMultiplier) horsepower *= stats.horsepowerMultiplier
        if (stats.torqueAdd) torque += stats.torqueAdd
        if (stats.torqueMultiplier) torque *= stats.torqueMultiplier

        // Weight modifications
        weight += installedPart.part.weight
        if (stats.weightReduction) weight -= stats.weightReduction

        // Aero modifications
        if (stats.downforceAdd) downforce += stats.downforceAdd
        if (stats.dragReduction) dragCoefficient *= (1 - stats.dragReduction / 100)

        // Braking modifications
        if (stats.brakingPower) brakingPower *= stats.brakingPower

        // Grip modifications (tires)
        if (stats.tireGrip) gripMultiplier *= stats.tireGrip

        // Apply tuning if present
        const tuning = installedPart.tuningSettings
        if (tuning?.boostTarget && stats.boostPressure) {
            const boostDelta = tuning.boostTarget - stats.boostPressure
            horsepower += boostDelta * 15 // ~15hp per 0.1 bar
        }
    }

    // Calculate drivetrain loss
    const drivetrainLoss = PHYSICS.DRIVETRAIN_LOSS[baseSpecs.drivetrain]
    const wheelHorsepower = horsepower * (1 - drivetrainLoss)

    // Calculate power-to-weight ratio (hp per metric ton)
    const powerToWeight = (wheelHorsepower / weight) * 1000

    // Calculate acceleration times using physics formulas
    const zeroToSixty = calculateAccelerationTime(wheelHorsepower, weight, 0, 96.56, gripMultiplier)
    const zeroToHundred = calculateAccelerationTime(wheelHorsepower, weight, 0, 100, gripMultiplier)
    const quarterMile = calculateQuarterMile(wheelHorsepower, weight)

    // Calculate top speed (drag-limited)
    const topSpeed = calculateTopSpeed(wheelHorsepower, dragCoefficient, weight)

    // Calculate braking distance (100-0 km/h)
    const brakingDistance = calculateBrakingDistance(100, brakingPower, gripMultiplier, weight)

    // Calculate lateral G (cornering)
    const lateralG = calculateLateralG(gripMultiplier, downforce, weight)

    // Calculate fuel consumption (estimated)
    const fuelConsumption = calculateFuelConsumption(horsepower, weight, baseSpecs.engine.displacement)

    // Calculate efficiency score
    const efficiency = calculateEfficiency(horsepower, weight, fuelConsumption)

    const metrics: PerformanceMetrics = {
        horsepower: Math.round(horsepower),
        torque: Math.round(torque),
        weight: Math.round(weight),
        powerToWeight: Math.round(powerToWeight * 10) / 10,
        zeroToSixty: Math.round(zeroToSixty * 100) / 100,
        zeroToHundred: Math.round(zeroToHundred * 100) / 100,
        quarterMile: Math.round(quarterMile * 100) / 100,
        topSpeed: Math.round(topSpeed),
        brakingDistance: Math.round(brakingDistance * 10) / 10,
        lateralG: Math.round(lateralG * 100) / 100,
        downforce: Math.round(downforce),
        dragCoefficient: Math.round(dragCoefficient * 1000) / 1000,
        fuelConsumption: Math.round(fuelConsumption * 10) / 10,
        efficiency: Math.round(efficiency),
    }

    // Guardar en caché
    metricsCache.set(vehicle, { hash: currentHash, metrics })

    return metrics
}

/**
 * Calculate acceleration time from v1 to v2 (km/h)
 */
function calculateAccelerationTime(
    horsepower: number,
    weight: number,
    v1: number,
    v2: number,
    gripMultiplier: number
): number {
    // Simplified acceleration model
    // F = P / v, but we need to account for traction limits
    const powerWatts = horsepower * 745.7 // Convert hp to watts
    const massKg = weight

    // Average velocity for power calculation
    const avgVelocity = ((v1 + v2) / 2) / 3.6 // Convert to m/s

    // Maximum force from power at average velocity
    const maxForce = avgVelocity > 0 ? powerWatts / avgVelocity : powerWatts / 10

    // Traction-limited force
    const tractionForce = massKg * PHYSICS.GRAVITY * gripMultiplier * 0.8

    // Actual force (limited by traction)
    const actualForce = Math.min(maxForce, tractionForce)

    // Acceleration
    const acceleration = actualForce / massKg

    // Time = Δv / a
    const deltaV = (v2 - v1) / 3.6 // Convert to m/s
    const time = deltaV / acceleration

    // Add launch time penalty for from-stop acceleration
    const launchPenalty = v1 === 0 ? 0.3 : 0

    return Math.max(time + launchPenalty, 1.5)
}

/**
 * Calculate quarter mile time using Hale formula
 */
function calculateQuarterMile(horsepower: number, weight: number): number {
    // Hale formula: ET = 5.825 * (W/P)^(1/3)
    // W in lbs, P in hp
    const weightLbs = weight * 2.205
    const wpRatio = weightLbs / horsepower

    return 5.825 * Math.pow(wpRatio, 1 / 3)
}

/**
 * Calculate drag-limited top speed
 */
function calculateTopSpeed(horsepower: number, dragCoeff: number, _weight: number): number {
    // P = 0.5 * ρ * Cd * A * v³
    // Solving for v: v = (2P / (ρ * Cd * A))^(1/3)

    const powerWatts = horsepower * 745.7
    const frontalArea = 2.0 // Estimated frontal area in m²

    const vCubed = (2 * powerWatts) / (PHYSICS.AIR_DENSITY * dragCoeff * frontalArea)
    const vMs = Math.pow(vCubed, 1 / 3)

    return vMs * 3.6 // Convert to km/h
}

/**
 * Calculate braking distance from given speed to 0
 */
function calculateBrakingDistance(
    speedKmh: number,
    brakingPower: number,
    gripMultiplier: number,
    _weight: number
): number {
    const speedMs = speedKmh / 3.6

    // Deceleration = μ * g * brakingPower
    const baseMu = 0.9 // Dry asphalt
    const deceleration = baseMu * gripMultiplier * PHYSICS.GRAVITY * brakingPower

    // d = v² / (2 * a)
    return (speedMs * speedMs) / (2 * deceleration)
}

/**
 * Calculate maximum lateral G in cornering
 */
function calculateLateralG(
    gripMultiplier: number,
    downforce: number,
    weight: number
): number {
    // Base lateral G from tire grip
    const baseG = 0.85 * gripMultiplier

    // Downforce contribution at reference speed (200 km/h)
    const downforceContribution = (downforce / weight) * 0.1

    return Math.min(baseG + downforceContribution, 2.5) // Cap at 2.5G
}

/**
 * Estimate fuel consumption (L/100km)
 */
function calculateFuelConsumption(
    horsepower: number,
    weight: number,
    displacement: number
): number {
    // Base consumption from displacement
    const baseConsumption = displacement * 2.5 // L/100km per liter of displacement

    // Power factor
    const powerFactor = 1 + (horsepower - 150) * 0.002

    // Weight factor
    const weightFactor = 1 + (weight - 1500) * 0.0002

    return baseConsumption * powerFactor * weightFactor
}

/**
 * Calculate efficiency score (0-100)
 */
function calculateEfficiency(
    horsepower: number,
    weight: number,
    fuelConsumption: number
): number {
    // Power efficiency (hp per L/100km)
    const powerEfficiency = horsepower / fuelConsumption

    // Weight efficiency
    const weightEfficiency = 1500 / weight

    // Combined score
    const score = (powerEfficiency * 3 + weightEfficiency * 50) / 2

    return Math.min(Math.max(score, 0), 100)
}

/**
 * Compare two vehicles and return the difference in metrics
 */
export function compareVehicles(
    vehicle1: Vehicle,
    vehicle2: Vehicle
): Record<keyof PerformanceMetrics, number> {
    const metrics1 = vehicle1.currentMetrics
    const metrics2 = vehicle2.currentMetrics

    const diff: Record<string, number> = {}

    for (const key of Object.keys(metrics1) as (keyof PerformanceMetrics)[]) {
        diff[key] = metrics1[key] - metrics2[key]
    }

    return diff as Record<keyof PerformanceMetrics, number>
}

/**
 * Get performance rating (1-5 stars) for a category
 */
export function getPerformanceRating(
    metrics: PerformanceMetrics,
    category: 'power' | 'speed' | 'handling' | 'efficiency'
): number {
    switch (category) {
        case 'power':
            if (metrics.horsepower >= 1000) return 5
            if (metrics.horsepower >= 600) return 4
            if (metrics.horsepower >= 400) return 3
            if (metrics.horsepower >= 250) return 2
            return 1

        case 'speed':
            if (metrics.zeroToSixty <= 3.0) return 5
            if (metrics.zeroToSixty <= 4.5) return 4
            if (metrics.zeroToSixty <= 6.0) return 3
            if (metrics.zeroToSixty <= 8.0) return 2
            return 1

        case 'handling':
            if (metrics.lateralG >= 1.5) return 5
            if (metrics.lateralG >= 1.2) return 4
            if (metrics.lateralG >= 1.0) return 3
            if (metrics.lateralG >= 0.85) return 2
            return 1

        case 'efficiency':
            if (metrics.efficiency >= 80) return 5
            if (metrics.efficiency >= 60) return 4
            if (metrics.efficiency >= 40) return 3
            if (metrics.efficiency >= 20) return 2
            return 1

        default:
            return 1
    }
}
