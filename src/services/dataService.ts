// ============================================
// TORRES MOTORSPORT ENGINEERING - DATA SERVICE
// Servicio centralizado de datos con Supabase y fallback local
// ============================================

import { vehiclesDatabase as localVehicles } from '@/data/vehicles'
import { partsCatalog as localParts } from '@/data/parts'
import type { Vehicle, Part, PartCategory, PerformanceMetrics, BaseVehicleSpecs, CompatibilityRules, PartStats } from '@/types'

// Verificar si Supabase está configurado via variables de entorno
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_KEY)

// Tipos de la base de datos
interface DbVehicle {
    id: string
    name: string
    manufacturer: string
    year: number
    body_style: string
    base_price: number
    engine_type: string
    engine_displacement: number
    engine_cylinders: number
    engine_naturally_aspirated: boolean
    engine_base_horsepower: number
    engine_base_torque: number
    engine_redline: number
    drivetrain: string
    engine_layout: string
    transmission_type: string
    transmission_gears: number
    weight: number
    wheelbase: number
    track_width: number
    engine_bay_size: number
    bolt_pattern: string
    fuel_capacity: number
    drag_coefficient: number
    image_url?: string
    model_url?: string
    default_primary_color?: string
    default_secondary_color?: string
    default_accent_color?: string
}

interface DbPart {
    id: string
    name: string
    brand: string
    category: string
    price: number
    weight: number
    description?: string
    image_url?: string
    model_url?: string
    compatibility: unknown
    stats: unknown
}

// ============================================
// CACHE PARA DATOS
// ============================================

interface DataCache {
    vehicles: Vehicle[] | null
    parts: Part[] | null
    vehiclesById: Map<string, Vehicle>
    partsByCategory: Map<PartCategory, Part[]>
    partsById: Map<string, Part>
    lastFetch: {
        vehicles: number
        parts: number
    }
}

const cache: DataCache = {
    vehicles: null,
    parts: null,
    vehiclesById: new Map(),
    partsByCategory: new Map(),
    partsById: new Map(),
    lastFetch: {
        vehicles: 0,
        parts: 0
    }
}

// Tiempo de expiración del cache (5 minutos)
const CACHE_EXPIRY = 5 * 60 * 1000

// ============================================
// TRANSFORMADORES DE DATOS
// ============================================

/**
 * Transforma un vehículo de la base de datos al formato de la app
 */
function transformDbVehicle(dbVehicle: DbVehicle): Vehicle {
    const baseSpecs: BaseVehicleSpecs = {
        engine: {
            type: dbVehicle.engine_type as BaseVehicleSpecs['engine']['type'],
            displacement: dbVehicle.engine_displacement,
            cylinders: dbVehicle.engine_cylinders,
            naturallyAspirated: dbVehicle.engine_naturally_aspirated ?? true,
            baseHorsepower: dbVehicle.engine_base_horsepower,
            baseTorque: dbVehicle.engine_base_torque,
            redline: dbVehicle.engine_redline,
        },
        drivetrain: dbVehicle.drivetrain as BaseVehicleSpecs['drivetrain'],
        engineLayout: dbVehicle.engine_layout as BaseVehicleSpecs['engineLayout'],
        transmission: {
            type: dbVehicle.transmission_type as BaseVehicleSpecs['transmission']['type'],
            gears: dbVehicle.transmission_gears,
        },
        weight: dbVehicle.weight,
        wheelbase: dbVehicle.wheelbase,
        trackWidth: dbVehicle.track_width,
        engineBaySize: dbVehicle.engine_bay_size,
        boltPattern: dbVehicle.bolt_pattern as BaseVehicleSpecs['boltPattern'],
        fuelCapacity: dbVehicle.fuel_capacity,
        dragCoefficient: dbVehicle.drag_coefficient,
    }

    // Calcular métricas base
    const currentMetrics: PerformanceMetrics = {
        horsepower: dbVehicle.engine_base_horsepower,
        torque: dbVehicle.engine_base_torque,
        weight: dbVehicle.weight,
        powerToWeight: (dbVehicle.engine_base_horsepower / dbVehicle.weight) * 1000,
        zeroToSixty: 0, // Se calculará
        zeroToHundred: 0, // Se calculará
        quarterMile: 0, // Se calculará
        topSpeed: 0, // Se calculará
        brakingDistance: 35, // metros base
        lateralG: 0.95, // g base
        downforce: 0,
        dragCoefficient: dbVehicle.drag_coefficient,
        fuelConsumption: 12, // L/100km base
        efficiency: 0.85,
    }

    return {
        id: dbVehicle.id,
        name: dbVehicle.name,
        manufacturer: dbVehicle.manufacturer,
        year: dbVehicle.year,
        bodyStyle: dbVehicle.body_style as Vehicle['bodyStyle'],
        basePrice: dbVehicle.base_price,
        baseSpecs,
        installedParts: [],
        currentMetrics,
        livery: {
            primaryColor: dbVehicle.default_primary_color || '#1a1a2e',
            secondaryColor: dbVehicle.default_secondary_color || '#16213e',
            accentColor: dbVehicle.default_accent_color || '#00d4ff',
            decals: [],
            paintFinish: 'gloss' as const,
        },
        imageUrl: dbVehicle.image_url || undefined,
        modelUrl: dbVehicle.model_url || undefined,
    }
}

/**
 * Transforma una pieza de la base de datos al formato de la app
 */
function transformDbPart(dbPart: DbPart): Part {
    // Parsear JSON fields con conversión segura
    const rawCompatibility = dbPart.compatibility as unknown
    const compatibility: CompatibilityRules = (rawCompatibility && typeof rawCompatibility === 'object' && !Array.isArray(rawCompatibility))
        ? rawCompatibility as CompatibilityRules
        : {
            mountTypes: [],
            drivetrains: [],
            engineLayouts: [],
        }

    const rawStats = dbPart.stats as unknown
    const stats: PartStats = (rawStats && typeof rawStats === 'object' && !Array.isArray(rawStats))
        ? rawStats as PartStats
        : {}

    return {
        id: dbPart.id,
        name: dbPart.name,
        brand: dbPart.brand,
        category: dbPart.category as PartCategory,
        price: dbPart.price,
        weight: dbPart.weight,
        compatibility,
        stats,
        description: dbPart.description || '',
        imageUrl: dbPart.image_url || undefined,
        modelUrl: dbPart.model_url || undefined,
    }
}

// ============================================
// FUNCIONES DE CARGA DE DATOS
// ============================================

/**
 * Carga todos los vehículos (desde Supabase o fallback local)
 */
export async function loadVehicles(): Promise<Vehicle[]> {
    const now = Date.now()

    // Retornar cache si es válido
    if (cache.vehicles && (now - cache.lastFetch.vehicles) < CACHE_EXPIRY) {
        return cache.vehicles
    }

    // Si Supabase no está configurado, usar datos locales directamente
    if (!isSupabaseConfigured) {
        console.log('📦 Usando vehículos locales (Supabase no configurado)')
        cache.vehicles = localVehicles
        cache.vehiclesById.clear()
        localVehicles.forEach(v => cache.vehiclesById.set(v.id, v))
        cache.lastFetch.vehicles = now
        return localVehicles
    }

    try {
        console.log('🚗 Cargando vehículos desde Supabase...')
        // Importar Supabase dinámicamente
        const { getVehicles } = await import('./supabase')
        const dbVehicles = await getVehicles()
        const vehicles = dbVehicles.map(v => transformDbVehicle(v as unknown as DbVehicle))

        // Actualizar cache
        cache.vehicles = vehicles
        cache.vehiclesById.clear()
        for (const vehicle of vehicles) {
            cache.vehiclesById.set(vehicle.id, vehicle)
        }
        cache.lastFetch.vehicles = now

        console.log(`✅ ${vehicles.length} vehículos cargados desde la base de datos`)
        return vehicles
    } catch (error) {
        console.warn('⚠️ Error cargando vehículos desde Supabase, usando datos locales:', error)
        // Fallback a datos locales
        cache.vehicles = localVehicles
        cache.vehiclesById.clear()
        localVehicles.forEach(v => cache.vehiclesById.set(v.id, v))
        return localVehicles
    }
}

/**
 * Carga todas las piezas (desde Supabase o fallback local)
 */
export async function loadParts(): Promise<Part[]> {
    const now = Date.now()

    // Retornar cache si es válido
    if (cache.parts && (now - cache.lastFetch.parts) < CACHE_EXPIRY) {
        return cache.parts
    }

    // Si Supabase no está configurado, usar datos locales directamente
    if (!isSupabaseConfigured) {
        console.log('📦 Usando piezas locales (Supabase no configurado)')
        indexLocalParts()
        cache.lastFetch.parts = now
        return localParts
    }

    try {
        console.log('🔧 Cargando piezas desde Supabase...')
        // Importar Supabase dinámicamente
        const { getParts } = await import('./supabase')
        const dbParts = await getParts()
        const parts = dbParts.map(p => transformDbPart(p as unknown as DbPart))

        // Actualizar cache e índices
        cache.parts = parts
        cache.partsById.clear()
        cache.partsByCategory.clear()

        for (const part of parts) {
            cache.partsById.set(part.id, part)

            const categoryParts = cache.partsByCategory.get(part.category) || []
            categoryParts.push(part)
            cache.partsByCategory.set(part.category, categoryParts)
        }

        cache.lastFetch.parts = now

        console.log(`✅ ${parts.length} piezas cargadas desde la base de datos`)
        return parts
    } catch (error) {
        console.warn('⚠️ Error cargando piezas desde Supabase, usando datos locales:', error)
        // Fallback a datos locales - indexar
        indexLocalParts()
        return localParts
    }
}

/**
 * Indexa las piezas locales en el cache
 */
function indexLocalParts(): void {
    cache.parts = localParts
    cache.partsById.clear()
    cache.partsByCategory.clear()

    for (const part of localParts) {
        cache.partsById.set(part.id, part)

        const categoryParts = cache.partsByCategory.get(part.category) || []
        categoryParts.push(part)
        cache.partsByCategory.set(part.category, categoryParts)
    }
}

// ============================================
// FUNCIONES DE ACCESO SINCRÓNICO (para compatibilidad)
// ============================================

/**
 * Obtiene los vehículos desde el cache (sincrónico)
 * NOTA: Debe llamarse loadVehicles() primero para poblar el cache
 */
export function getVehiclesSync(): Vehicle[] {
    return cache.vehicles || localVehicles
}

/**
 * Obtiene las piezas desde el cache (sincrónico)
 * NOTA: Debe llamarse loadParts() primero para poblar el cache
 */
export function getPartsSync(): Part[] {
    return cache.parts || localParts
}

/**
 * Obtiene un vehículo por ID desde el cache
 */
export function getVehicleByIdSync(id: string): Vehicle | undefined {
    return cache.vehiclesById.get(id) || localVehicles.find(v => v.id === id)
}

/**
 * Obtiene una pieza por ID desde el cache
 */
export function getPartByIdSync(id: string): Part | undefined {
    if (cache.partsById.has(id)) {
        return cache.partsById.get(id)
    }
    return localParts.find(p => p.id === id)
}

/**
 * Obtiene piezas por categoría desde el cache
 */
export function getPartsByCategorySync(category: PartCategory): Part[] {
    if (cache.partsByCategory.has(category)) {
        return cache.partsByCategory.get(category) || []
    }
    return localParts.filter(p => p.category === category)
}

/**
 * Obtiene piezas de múltiples categorías
 */
export function getPartsByCategoriesSync(categories: PartCategory[]): Part[] {
    if (categories.length === 0) return []

    const result: Part[] = []
    for (const category of categories) {
        const parts = getPartsByCategorySync(category)
        result.push(...parts)
    }
    return result
}

/**
 * Obtiene todas las marcas únicas
 */
export function getAllBrandsSync(): string[] {
    const parts = cache.parts || localParts
    const brands = new Set(parts.map(p => p.brand))
    return Array.from(brands).sort()
}

/**
 * Obtiene todas las categorías disponibles
 */
export function getAvailableCategoriesSync(): PartCategory[] {
    if (cache.partsByCategory.size > 0) {
        return Array.from(cache.partsByCategory.keys())
    }
    const categories = new Set(localParts.map(p => p.category))
    return Array.from(categories)
}

// ============================================
// INICIALIZACIÓN
// ============================================

let initialized = false

/**
 * Inicializa el servicio de datos cargando vehículos y piezas
 * Llamar esta función al inicio de la app
 */
export async function initializeDataService(): Promise<void> {
    if (initialized) return

    console.log('🚀 Inicializando servicio de datos...')

    // Timeout de 5 segundos para evitar que la app se quede cargando indefinidamente
    const timeout = new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: Carga de datos excedió 5 segundos')), 5000)
    })

    try {
        await Promise.race([
            Promise.all([
                loadVehicles(),
                loadParts()
            ]),
            timeout
        ])
        initialized = true
        console.log('✅ Servicio de datos inicializado correctamente')
    } catch (error) {
        console.warn('⚠️ Error o timeout inicializando servicio de datos:', error)
        // Usar datos locales como fallback
        console.log('📦 Usando datos locales como fallback')
        cache.vehicles = localVehicles
        cache.vehiclesById.clear()
        localVehicles.forEach(v => cache.vehiclesById.set(v.id, v))
        indexLocalParts()
        initialized = true
    }
}

/**
 * Fuerza una recarga de datos desde la base de datos
 */
export async function refreshData(): Promise<void> {
    cache.lastFetch.vehicles = 0
    cache.lastFetch.parts = 0
    await Promise.all([
        loadVehicles(),
        loadParts()
    ])
}

/**
 * Limpia el cache
 */
export function clearCache(): void {
    cache.vehicles = null
    cache.parts = null
    cache.vehiclesById.clear()
    cache.partsByCategory.clear()
    cache.partsById.clear()
    cache.lastFetch.vehicles = 0
    cache.lastFetch.parts = 0
    initialized = false
}

// ============================================
// EXPORTS PARA COMPATIBILIDAD
// ============================================

// Re-exportar con nombres compatibles para facilitar la migración
export {
    getVehiclesSync as vehiclesDatabase,
    getPartsSync as partsCatalog,
}
