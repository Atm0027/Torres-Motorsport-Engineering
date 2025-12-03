import { useState, useMemo, useCallback, useEffect } from 'react'
import {
    Search,
    Filter,
    Grid3X3,
    List,
    ShoppingCart,
} from 'lucide-react'
import { Card } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { useUserStore } from '@stores/userStore'
import { useNotify } from '@stores/uiStore'
import { getPartsSync, initializeDataService } from '@/services/dataService'
import { PART_CATEGORIES } from '@/constants'
import { formatCurrency } from '@utils/formatters'
import type { PartCategory, Part } from '@/types'

export function CatalogPage() {
    // Selectores optimizados para evitar re-renders
    const ownedParts = useUserStore((state) => state.user?.ownedParts ?? [])
    const userCurrency = useUserStore((state) => state.user?.currency ?? 0)
    const userEmail = useUserStore((state) => state.user?.email)
    const purchasePart = useUserStore((state) => state.purchasePart)
    const notify = useNotify()

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<PartCategory | 'all'>('all')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [sortBy, setSortBy] = useState<'price' | 'name'>('price')
    const [dataLoaded, setDataLoaded] = useState(false)

    // Inicializar servicio de datos
    useEffect(() => {
        initializeDataService().then(() => setDataLoaded(true))
    }, [])

    // Obtener catálogo de partes
    const partsCatalog = getPartsSync()

    // Filter and sort parts
    const filteredParts = useMemo(() => {
        let parts = [...partsCatalog]

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            parts = parts.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.brand.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            )
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            parts = parts.filter(p => p.category === selectedCategory)
        }

        // Sort
        parts.sort((a, b) => {
            switch (sortBy) {
                case 'price':
                    return a.price - b.price
                case 'name':
                    return a.name.localeCompare(b.name)
                default:
                    return 0
            }
        })

        return parts
    }, [searchQuery, selectedCategory, sortBy])

    const isDemoUser = userEmail?.toLowerCase() === 'demo@torres.com'

    const handlePurchase = useCallback((part: Part) => {
        if (ownedParts.includes(part.id)) {
            notify.warning('Ya tienes esta parte', 'Esta parte ya está en tu inventario')
            return
        }

        // Demo user has infinite money
        if (!isDemoUser && userCurrency < part.price) {
            notify.error('Fondos insuficientes', 'No tienes suficiente dinero para esta compra')
            return
        }

        const success = purchasePart(part.id, part.price)
        if (success) {
            notify.success('¡Compra exitosa!', `${part.name} añadido a tu inventario`)
        }
    }, [ownedParts, userCurrency, isDemoUser, purchasePart, notify])

    const isOwned = useCallback((partId: string) => ownedParts.includes(partId), [ownedParts])

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-torres-dark-500 bg-torres-dark-800/50">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="font-display text-2xl font-bold text-torres-light-100">
                            Catálogo de Partes
                        </h1>
                        <p className="text-torres-light-400">
                            {filteredParts.length} partes disponibles
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid3X3 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    {/* Search */}
                    <div className="relative flex-1 min-w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-torres-light-400" />
                        <input
                            type="text"
                            placeholder="Buscar partes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value as PartCategory | 'all')}
                        className="input w-48"
                    >
                        <option value="all">Todas las categorías</option>
                        {Object.entries(PART_CATEGORIES)
                            .sort((a, b) => a[1].order - b[1].order)
                            .map(([key, cat]) => (
                                <option key={key} value={key}>{cat.name}</option>
                            ))
                        }
                    </select>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                        className="input w-40"
                    >
                        <option value="price">Por Precio</option>
                        <option value="name">Por Nombre</option>
                    </select>
                </div>
            </div>

            {/* Parts Grid/List */}
            <div className="flex-1 overflow-auto p-6">
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredParts.map(part => (
                            <PartCard
                                key={part.id}
                                part={part}
                                onPurchase={handlePurchase}
                                isOwned={isOwned(part.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredParts.map(part => (
                            <PartListItem
                                key={part.id}
                                part={part}
                                onPurchase={handlePurchase}
                                isOwned={isOwned(part.id)}
                            />
                        ))}
                    </div>
                )}

                {filteredParts.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <Filter className="w-12 h-12 text-torres-dark-500 mb-3" />
                        <p className="text-torres-light-400">
                            No se encontraron partes con los filtros seleccionados
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

function PartCard({
    part,
    onPurchase,
    isOwned,
}: {
    part: Part
    onPurchase: (part: Part) => void
    isOwned: boolean
}) {
    return (
        <Card
            variant="hover"
            padding="none"
            className="overflow-hidden"
        >
            {/* Image Placeholder */}
            <div
                className="h-32 bg-torres-dark-600 flex items-center justify-center relative border-b border-torres-primary/30"
            >
                <span className="text-4xl opacity-30">{PART_CATEGORIES[part.category].icon}</span>
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-torres-light-100 truncate">{part.name}</p>
                        <p className="text-sm text-torres-light-400">{part.brand}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <Badge variant="cyan" size="sm">
                        {PART_CATEGORIES[part.category].name}
                    </Badge>
                </div>

                {/* Stats Preview */}
                <div className="text-xs text-torres-light-400 space-y-1 mb-3">
                    {part.stats.horsepowerAdd && part.stats.horsepowerAdd !== 0 && (
                        <p className={part.stats.horsepowerAdd > 0 ? "text-torres-success" : "text-torres-danger"}>
                            {part.stats.horsepowerAdd > 0 ? '+' : ''}{part.stats.horsepowerAdd} CV
                        </p>
                    )}
                    {part.stats.torqueAdd && part.stats.torqueAdd !== 0 && (
                        <p className={part.stats.torqueAdd > 0 ? "text-torres-secondary" : "text-torres-danger"}>
                            {part.stats.torqueAdd > 0 ? '+' : ''}{part.stats.torqueAdd} Nm
                        </p>
                    )}
                    {part.stats.weightReduction && part.stats.weightReduction !== 0 && (
                        <p className={part.stats.weightReduction > 0 ? "text-torres-primary" : "text-torres-danger"}>
                            {part.stats.weightReduction > 0 ? '-' : '+'}{Math.abs(part.stats.weightReduction)} kg
                        </p>
                    )}
                    {part.stats.horsepowerMultiplier && part.stats.horsepowerMultiplier !== 1 && (
                        <p className={part.stats.horsepowerMultiplier > 1 ? "text-torres-accent" : "text-torres-danger"}>
                            ×{part.stats.horsepowerMultiplier.toFixed(2)} CV
                        </p>
                    )}
                    {part.stats.downforceAdd && part.stats.downforceAdd !== 0 && (
                        <p className={part.stats.downforceAdd > 0 ? "text-torres-info" : "text-torres-danger"}>
                            {part.stats.downforceAdd > 0 ? '+' : ''}{part.stats.downforceAdd} kg DF
                        </p>
                    )}
                    {part.stats.brakingPower && part.stats.brakingPower !== 1 && (
                        <p className={part.stats.brakingPower > 1 ? "text-torres-warning" : "text-torres-danger"}>
                            {part.stats.brakingPower > 1 ? '+' : ''}{Math.round((part.stats.brakingPower - 1) * 100)}% frenos
                        </p>
                    )}
                    {part.stats.tireGrip && part.stats.tireGrip !== 1 && (
                        <p className={part.stats.tireGrip > 1 ? "text-torres-success" : "text-torres-danger"}>
                            {part.stats.tireGrip > 1 ? '+' : ''}{Math.round((part.stats.tireGrip - 1) * 100)}% grip
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    <span className="font-mono text-lg text-torres-primary">
                        {formatCurrency(part.price)}
                    </span>

                    {isOwned ? (
                        <Badge variant="success">Adquirido</Badge>
                    ) : (
                        <Button
                            size="sm"
                            onClick={() => onPurchase(part)}
                            leftIcon={<ShoppingCart className="w-3 h-3" />}
                        >
                            Comprar
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    )
}

function PartListItem({
    part,
    onPurchase,
    isOwned,
}: {
    part: Part
    onPurchase: (part: Part) => void
    isOwned: boolean
}) {
    return (
        <Card
            variant="hover"
            className="flex items-center gap-4 p-4"
        >
            {/* Icon */}
            <div
                className="w-12 h-12 rounded-lg bg-torres-dark-600 flex items-center justify-center flex-shrink-0 border-l-2 border-torres-primary"
            >
                <span className="text-xl opacity-50">⚙️</span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-medium text-torres-light-100">{part.name}</p>
                    <Badge variant="cyan" size="sm">{PART_CATEGORIES[part.category].name}</Badge>
                </div>
                <p className="text-sm text-torres-light-400">{part.brand}</p>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-4 text-sm">
                {part.stats.horsepowerAdd && part.stats.horsepowerAdd !== 0 && (
                    <span className={part.stats.horsepowerAdd > 0 ? "text-torres-success" : "text-torres-danger"}>
                        {part.stats.horsepowerAdd > 0 ? '+' : ''}{part.stats.horsepowerAdd} CV
                    </span>
                )}
                {part.stats.torqueAdd && part.stats.torqueAdd !== 0 && (
                    <span className={part.stats.torqueAdd > 0 ? "text-torres-secondary" : "text-torres-danger"}>
                        {part.stats.torqueAdd > 0 ? '+' : ''}{part.stats.torqueAdd} Nm
                    </span>
                )}
                {part.stats.weightReduction && part.stats.weightReduction !== 0 && (
                    <span className={part.stats.weightReduction > 0 ? "text-torres-accent" : "text-torres-danger"}>
                        {part.stats.weightReduction > 0 ? '-' : '+'}{Math.abs(part.stats.weightReduction)} kg
                    </span>
                )}
            </div>

            {/* Price & Action */}
            <div className="flex items-center gap-4">
                <span className="font-mono text-torres-primary">
                    {formatCurrency(part.price)}
                </span>

                {isOwned ? (
                    <Badge variant="success">Adquirido</Badge>
                ) : (
                    <Button
                        size="sm"
                        onClick={() => onPurchase(part)}
                    >
                        Comprar
                    </Button>
                )}
            </div>
        </Card>
    )
}
