// ============================================
// TORRES MOTORSPORT ENGINEERING - FORMATTERS
// Optimizado con caché de formatters para mejor rendimiento
// ============================================

// Caché de formatters Intl para evitar crear instancias repetidas
const formatterCache = new Map<string, Intl.NumberFormat>()

function getFormatter(key: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
    let formatter = formatterCache.get(key)
    if (!formatter) {
        formatter = new Intl.NumberFormat('es-ES', options)
        formatterCache.set(key, formatter)
    }
    return formatter
}

// Pre-crear formatters más usados
const currencyFormatter = getFormatter('currency-USD', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
})

const numberFormatter = getFormatter('number-0', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
})

/**
 * Format currency with proper locale and symbol
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
    if (currency === 'USD') {
        return currencyFormatter.format(amount)
    }
    const key = `currency-${currency}`
    return getFormatter(key, {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}

/**
 * Format a number with thousands separators
 */
export function formatNumber(value: number, decimals = 0): string {
    if (decimals === 0) {
        return numberFormatter.format(value)
    }
    const key = `number-${decimals}`
    return getFormatter(key, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value)
}

/**
 * Format horsepower value
 */
export function formatHorsepower(hp: number): string {
    return `${formatNumber(hp)} CV`
}

/**
 * Format torque value
 */
export function formatTorque(nm: number): string {
    return `${formatNumber(nm)} Nm`
}

/**
 * Format weight value
 */
export function formatWeight(kg: number): string {
    return `${formatNumber(kg)} kg`
}

/**
 * Format speed value
 */
export function formatSpeed(kmh: number): string {
    return `${formatNumber(kmh)} km/h`
}

/**
 * Format time in seconds
 */
export function formatTime(seconds: number, decimals = 2): string {
    return `${seconds.toFixed(decimals)}s`
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 0): string {
    return `${value.toFixed(decimals)}%`
}

/**
 * Format relative time (e.g., "hace 5 minutos")
 */
export function formatRelativeTime(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSeconds < 60) {
        return 'hace un momento'
    } else if (diffMinutes < 60) {
        return `hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`
    } else if (diffHours < 24) {
        return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
    } else if (diffDays < 7) {
        return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
    } else {
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }
}

/**
 * Format a large number with abbreviation (e.g., 1.5K, 2.3M)
 */
export function formatCompactNumber(value: number): string {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`
    }
    return formatNumber(value)
}

/**
 * Format engine displacement
 */
export function formatDisplacement(liters: number): string {
    return `${liters.toFixed(1)}L`
}

/**
 * Format boost pressure
 */
export function formatBoostPressure(bar: number): string {
    return `${bar.toFixed(2)} bar`
}

/**
 * Get color based on performance change (positive = green, negative = red)
 */
export function getChangeColor(value: number, inverse = false): string {
    const positive = inverse ? value < 0 : value > 0
    const negative = inverse ? value > 0 : value < 0

    if (positive) return 'text-torres-success'
    if (negative) return 'text-torres-danger'
    return 'text-torres-light-400'
}

/**
 * Format a change value with + or - prefix
 */
export function formatChange(value: number, decimals = 0, unit = ''): string {
    const prefix = value > 0 ? '+' : ''
    return `${prefix}${value.toFixed(decimals)}${unit}`
}
