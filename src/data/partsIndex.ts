// ============================================
// TORRES MOTORSPORT ENGINEERING - PARTS INDEX
// Índices optimizados para búsqueda rápida de partes
// ============================================

import { partsCatalog } from './parts'
import type { Part, PartCategory } from '@/types'

// Crear índices una sola vez al cargar el módulo
const partsById = new Map<string, Part>()
const partsByCategory = new Map<PartCategory, Part[]>()
const partsByBrand = new Map<string, Part[]>()

// Inicializar índices
for (const part of partsCatalog) {
    // Índice por ID
    partsById.set(part.id, part)

    // Índice por categoría
    const categoryParts = partsByCategory.get(part.category) || []
    categoryParts.push(part)
    partsByCategory.set(part.category, categoryParts)

    // Índice por marca
    const brandParts = partsByBrand.get(part.brand) || []
    brandParts.push(part)
    partsByBrand.set(part.brand, brandParts)
}

/**
 * Obtener una parte por su ID - O(1)
 */
export function getPartById(id: string): Part | undefined {
    return partsById.get(id)
}

/**
 * Obtener todas las partes de una categoría - O(1)
 */
export function getPartsByCategory(category: PartCategory): Part[] {
    return partsByCategory.get(category) || []
}

/**
 * Obtener partes de múltiples categorías - O(n) donde n es número de categorías
 */
export function getPartsByCategories(categories: PartCategory[]): Part[] {
    if (categories.length === 0) return []
    if (categories.length === 1) return getPartsByCategory(categories[0])

    const result: Part[] = []
    for (const category of categories) {
        const parts = partsByCategory.get(category)
        if (parts) result.push(...parts)
    }
    return result
}

/**
 * Obtener todas las partes de una marca - O(1)
 */
export function getPartsByBrand(brand: string): Part[] {
    return partsByBrand.get(brand) || []
}

/**
 * Obtener todas las marcas únicas
 */
export function getAllBrands(): string[] {
    return Array.from(partsByBrand.keys()).sort()
}

/**
 * Obtener todas las categorías que tienen partes
 */
export function getAvailableCategories(): PartCategory[] {
    return Array.from(partsByCategory.keys())
}

/**
 * Obtener el conteo de partes por categoría
 */
export function getPartCountByCategory(): Map<PartCategory, number> {
    const counts = new Map<PartCategory, number>()
    for (const [category, parts] of partsByCategory) {
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
    return partsCatalog.filter(part =>
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
    let result = partsCatalog

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

// Estadísticas del catálogo
export const catalogStats = {
    totalParts: partsCatalog.length,
    totalCategories: partsByCategory.size,
    totalBrands: partsByBrand.size,
} as const

// Re-exportar el catálogo original para casos donde se necesite
export { partsCatalog }
