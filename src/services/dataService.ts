// ============================================
// TORRES MOTORSPORT ENGINEERING - DATA SERVICE
// Servicio centralizado de datos - Supabase primero, fallback local solo si falla
// Optimizado para Cloudflare Pages
// ============================================

import { supabase, isSupabaseConfigured } from './supabase'
import type { Vehicle, Part, PartCategory, PerformanceMetrics, BaseVehicleSpecs, CompatibilityRules, PartStats } from '@/types'

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
// CACHE PARA DATOS - Optimizado
// ============================================

interface DataCache {
    vehicles: Vehicle[]
    parts: Part[]
    vehiclesById: Map<string, Vehicle>
    partsByCategory: Map<PartCategory, Part[]>
    partsById: Map<string, Part>
    initialized: boolean
    loading: boolean
    error: string | null
}

const cache: DataCache = {
    vehicles: [],
    parts: [],
    vehiclesById: new Map(),
    partsByCategory: new Map(),
    partsById: new Map(),
    initialized: false,
    loading: false,
    error: null
}

// Promise para evitar múltiples inicializaciones simultáneas
let initPromise: Promise<void> | null = null

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
// FUNCIONES INTERNAS DE CARGA
// ============================================

async function fetchVehiclesFromDb(): Promise<Vehicle[]> {
    if (!supabase) {
        throw new Error('Supabase no está configurado')
    }

    const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('manufacturer, name')

    if (error) {
        throw new Error(`Error cargando vehículos: ${error.message}`)
    }

    return (data || []).map(v => transformDbVehicle(v as unknown as DbVehicle))
}

async function fetchPartsFromDb(): Promise<Part[]> {
    if (!supabase) {
        throw new Error('Supabase no está configurado')
    }

    const { data, error } = await supabase
        .from('parts')
        .select('*')
        .order('category, name')

    if (error) {
        throw new Error(`Error cargando piezas: ${error.message}`)
    }

    return (data || []).map(p => transformDbPart(p as unknown as DbPart))
}

function indexParts(parts: Part[]): void {
    cache.partsById.clear()
    cache.partsByCategory.clear()

    for (const part of parts) {
        cache.partsById.set(part.id, part)
        const categoryParts = cache.partsByCategory.get(part.category) || []
        categoryParts.push(part)
        cache.partsByCategory.set(part.category, categoryParts)
    }
}

function indexVehicles(vehicles: Vehicle[]): void {
    cache.vehiclesById.clear()
    for (const vehicle of vehicles) {
        cache.vehiclesById.set(vehicle.id, vehicle)
    }
}

// Fallback a datos locales solo si la DB falla
async function loadLocalDataFallback(): Promise<void> {
    console.warn('⚠️ Cargando datos locales como fallback...')

    try {
        const [{ vehiclesDatabase }, { partsCatalog }] = await Promise.all([
            import('@/data/vehicles'),
            import('@/data/parts')
        ])

        cache.vehicles = vehiclesDatabase
        cache.parts = partsCatalog
        indexVehicles(vehiclesDatabase)
        indexParts(partsCatalog)
        cache.initialized = true

        console.log(`📦 Datos locales cargados: ${vehiclesDatabase.length} vehículos, ${partsCatalog.length} piezas`)
    } catch (e) {
        console.error('❌ Error cargando datos locales:', e)
        cache.error = 'No se pudieron cargar los datos'
    }
}

// ============================================
// INICIALIZACIÓN PRINCIPAL
// ============================================

export async function initializeDataService(): Promise<void> {
    // Si ya está inicializado, retornar
    if (cache.initialized) {
        return
    }

    // Si ya hay una inicialización en curso, esperar a que termine
    if (initPromise) {
        return initPromise
    }

    // Verificar que Supabase esté configurado
    if (!isSupabaseConfigured) {
        console.warn('⚠️ Supabase no está configurado. Usando datos locales.')
        await loadLocalDataFallback()
        return
    }

    cache.loading = true
    cache.error = null

    initPromise = (async () => {
        const startTime = performance.now()
        console.log('🚀 Inicializando servicio de datos desde Supabase...')

        try {
            // Cargar vehículos y piezas en paralelo
            const [vehicles, parts] = await Promise.all([
                fetchVehiclesFromDb(),
                fetchPartsFromDb()
            ])

            // Guardar en cache
            cache.vehicles = vehicles
            cache.parts = parts

            // Crear índices
            indexVehicles(vehicles)
            indexParts(parts)

            cache.initialized = true
            cache.loading = false

            const elapsed = Math.round(performance.now() - startTime)
            console.log(`✅ Datos cargados: ${vehicles.length} vehículos, ${parts.length} piezas (${elapsed}ms)`)

        } catch (error) {
            console.error('❌ Error inicializando desde Supabase:', error)
            cache.error = error instanceof Error ? error.message : 'Error desconocido'
            cache.loading = false

            // Intentar cargar datos locales como fallback
            await loadLocalDataFallback()
        }
    })()

    return initPromise
}

// ============================================
// CARGA ASYNC (para componentes que lo necesiten)
// ============================================

export async function loadVehicles(): Promise<Vehicle[]> {
    if (!cache.initialized) {
        await initializeDataService()
    }
    return cache.vehicles
}

export async function loadParts(): Promise<Part[]> {
    if (!cache.initialized) {
        await initializeDataService()
    }
    return cache.parts
}

// ============================================
// FUNCIONES DE ACCESO SINCRÓNICO
// ============================================

export function getVehiclesSync(): Vehicle[] {
    return cache.vehicles
}

export function getPartsSync(): Part[] {
    return cache.parts
}

export function getVehicleByIdSync(id: string): Vehicle | undefined {
    return cache.vehiclesById.get(id)
}

export function getPartByIdSync(id: string): Part | undefined {
    return cache.partsById.get(id)
}

/**
 * Obtiene piezas por categoría desde el cache
 */
export function getPartsByCategorySync(category: PartCategory): Part[] {
    return cache.partsByCategory.get(category) || []
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
    const brands = new Set(cache.parts.map(p => p.brand))
    return Array.from(brands).sort()
}

/**
 * Obtiene todas las categorías disponibles
 */
export function getAvailableCategoriesSync(): PartCategory[] {
    return Array.from(cache.partsByCategory.keys())
}

// ============================================
// ESTADO Y UTILIDADES
// ============================================

export function isDataLoaded(): boolean {
    return cache.initialized
}

export function isDataLoading(): boolean {
    return cache.loading
}

export function getDataError(): string | null {
    return cache.error
}

export async function refreshData(): Promise<void> {
    cache.initialized = false
    initPromise = null
    await initializeDataService()
}

export function clearCache(): void {
    cache.vehicles = []
    cache.parts = []
    cache.vehiclesById.clear()
    cache.partsByCategory.clear()
    cache.partsById.clear()
    cache.initialized = false
    cache.loading = false
    cache.error = null
    initPromise = null
}

// ============================================
// EXPORTS PARA COMPATIBILIDAD
// ============================================

export {
    getVehiclesSync as vehiclesDatabase,
    getPartsSync as partsCatalog,
}
