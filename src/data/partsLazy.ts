// ============================================
// TORRES MOTORSPORT ENGINEERING - LAZY PARTS LOADER
// Sistema de carga diferida para el catálogo de partes
// ============================================

import type { Part, PartCategory } from '@/types'

// Estado del loader
let partsModule: typeof import('./partsIndex') | null = null
let loadingPromise: Promise<typeof import('./partsIndex')> | null = null

/**
 * Cargar el módulo de partes de forma diferida
 */
export async function loadPartsModule(): Promise<typeof import('./partsIndex')> {
    if (partsModule) {
        return partsModule
    }

    if (!loadingPromise) {
        loadingPromise = import('./partsIndex').then(module => {
            partsModule = module
            return module
        })
    }

    return loadingPromise
}

/**
 * Verificar si el módulo ya está cargado
 */
export function isPartsModuleLoaded(): boolean {
    return partsModule !== null
}

/**
 * Obtener partes por categorías (async)
 */
export async function getPartsByCategoriesAsync(categories: PartCategory[]): Promise<Part[]> {
    const module = await loadPartsModule()
    return module.getPartsByCategories(categories)
}

/**
 * Obtener una parte por ID (async)
 */
export async function getPartByIdAsync(id: string): Promise<Part | undefined> {
    const module = await loadPartsModule()
    return module.getPartById(id)
}

/**
 * Obtener partes por categoría (async)
 */
export async function getPartsByCategoryAsync(category: PartCategory): Promise<Part[]> {
    const module = await loadPartsModule()
    return module.getPartsByCategory(category)
}

/**
 * Buscar partes (async)
 */
export async function searchPartsAsync(query: string): Promise<Part[]> {
    const module = await loadPartsModule()
    return module.searchPartsByName(query)
}

/**
 * Obtener todas las marcas (async)
 */
export async function getAllBrandsAsync(): Promise<string[]> {
    const module = await loadPartsModule()
    return module.getAllBrands()
}

// Hook para precargar el módulo cuando el usuario esté por entrar al garage
export function preloadPartsModule(): void {
    if (!partsModule && !loadingPromise) {
        loadingPromise = import('./partsIndex').then(module => {
            partsModule = module
            return module
        })
    }
}
