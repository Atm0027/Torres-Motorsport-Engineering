// ============================================
// TORRES MOTORSPORT ENGINEERING - PARTS INDEX
// Índices optimizados para búsqueda rápida de partes
// Ahora usa el dataService que carga desde Supabase
// ============================================

import {
    getPartByIdSync,
    getPartsByCategorySync,
    getPartsByCategoriesSync,
    getAllBrandsSync,
    getAvailableCategoriesSync,
    getPartsSync
} from '@/services/dataService'
import { partsCatalog as localPartsCatalog } from './parts'
import type { Part, PartCategory } from '@/types'

/**
 * Obtener una parte por su ID - O(1)
 */
export function getPartById(id: string): Part | undefined {
    return getPartByIdSync(id)
}

/**
 * Obtener todas las partes de una categoría - O(1)
 */
export function getPartsByCategory(category: PartCategory): Part[] {
    return getPartsByCategorySync(category)
}

/**
 * Obtener partes de múltiples categorías - O(n) donde n es número de categorías
 */
export function getPartsByCategories(categories: PartCategory[]): Part[] {
    return getPartsByCategoriesSync(categories)
}

/**
 * Obtener todas las partes de una marca - O(1)
 */
export function getPartsByBrand(brand: string): Part[] {
    const parts = getPartsSync()
    return parts.filter(p => p.brand === brand)
}

/**
 * Obtener todas las marcas únicas
 */
export function getAllBrands(): string[] {
    return getAllBrandsSync()
}

/**
 * Obtener todas las categorías que tienen partes
 */
export function getAvailableCategories(): PartCategory[] {
    return getAvailableCategoriesSync()
}

/**
 * Obtener el conteo de partes por categoría
 */
export function getPartCountByCategory(): Map<PartCategory, number> {
    const counts = new Map<PartCategory, number>()
    const categories = getAvailableCategoriesSync()
    for (const category of categories) {
        const parts = getPartsByCategorySync(category)
        counts.set(category, parts.length)
    }
    return counts
}

/**
 * Buscar partes por nombre (case-insensitive)
 */
export function searchPartsByName(query: string): Part[] {
    if (!query.trim()) return []
    const lowerQuery = query.toLowerCase()
    const parts = getPartsSync()
    return parts.filter(part =>
        part.name.toLowerCase().includes(lowerQuery) ||
        part.brand.toLowerCase().includes(lowerQuery) ||
        part.description.toLowerCase().includes(lowerQuery)
    )
}

/**
 * Obtener partes filtradas con múltiples criterios
 */
export interface PartsFilterOptions {
    categories?: PartCategory[]
    brands?: string[]
    minPrice?: number
    maxPrice?: number
    maxWeight?: number
    searchQuery?: string
}

export function getFilteredParts(options: PartsFilterOptions): Part[] {
    let result = getPartsSync()

    // Filtrar por categorías
    if (options.categories && options.categories.length > 0) {
        const categorySet = new Set(options.categories)
        result = result.filter(part => categorySet.has(part.category))
    }

    // Filtrar por marcas
    if (options.brands && options.brands.length > 0) {
        const brandSet = new Set(options.brands)
        result = result.filter(part => brandSet.has(part.brand))
    }

    // Filtrar por precio
    if (options.minPrice !== undefined) {
        result = result.filter(part => part.price >= options.minPrice!)
    }
    if (options.maxPrice !== undefined) {
        result = result.filter(part => part.price <= options.maxPrice!)
    }

    // Filtrar por peso
    if (options.maxWeight !== undefined) {
        result = result.filter(part => part.weight <= options.maxWeight!)
    }

    // Buscar por query
    if (options.searchQuery && options.searchQuery.trim()) {
        const lowerQuery = options.searchQuery.toLowerCase()
        result = result.filter(part =>
            part.name.toLowerCase().includes(lowerQuery) ||
            part.brand.toLowerCase().includes(lowerQuery) ||
            part.description.toLowerCase().includes(lowerQuery)
        )
    }

    return result
}

/**
 * Estadísticas del catálogo (se calculan dinámicamente)
 */
export function getCatalogStats() {
    const parts = getPartsSync()
    const brands = new Set(parts.map(p => p.brand))
    const categories = new Set(parts.map(p => p.category))

    return {
        totalParts: parts.length,
        totalCategories: categories.size,
        totalBrands: brands.size,
    }
}

// Para compatibilidad, mantener catalogStats como getter
export const catalogStats = {
    get totalParts() { return getPartsSync().length },
    get totalCategories() { return getAvailableCategoriesSync().length },
    get totalBrands() { return getAllBrandsSync().length },
} as const

// Re-exportar el catálogo para compatibilidad (ahora desde dataService)
export { localPartsCatalog as partsCatalog }
