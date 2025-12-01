export { partsCatalog, default as parts } from './parts'
export { vehiclesDatabase, default as vehicles } from './vehicles'

// Índices optimizados para búsqueda rápida
export {
    getPartById,
    getPartsByCategory,
    getPartsByCategories,
    getPartsByBrand,
    getAllBrands,
    getAvailableCategories,
    getPartCountByCategory,
    searchPartsByName,
    getFilteredParts,
    catalogStats,
    type PartsFilterOptions,
} from './partsIndex'
