// ============================================
// TORRES MOTORSPORT ENGINEERING - CUSTOM HOOKS
// Hooks optimizados para rendimiento
// ============================================

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

/**
 * Hook para virtualización simple de listas
 * Renderiza solo los elementos visibles para listas grandes
 */
export function useVirtualList<T>(
    items: T[],
    itemHeight: number,
    containerHeight: number,
    overscan = 3
) {
    const [scrollTop, setScrollTop] = useState(0)

    const { startIndex, endIndex, virtualItems, totalHeight } = useMemo(() => {
        const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
        const visibleCount = Math.ceil(containerHeight / itemHeight)
        const end = Math.min(items.length - 1, start + visibleCount + overscan * 2)

        const virtualItems = items.slice(start, end + 1).map((item, index) => ({
            item,
            index: start + index,
            offsetTop: (start + index) * itemHeight,
        }))

        return {
            startIndex: start,
            endIndex: end,
            virtualItems,
            totalHeight: items.length * itemHeight,
        }
    }, [items, itemHeight, containerHeight, scrollTop, overscan])

    const onScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
        setScrollTop(e.currentTarget.scrollTop)
    }, [])

    return {
        virtualItems,
        totalHeight,
        onScroll,
        startIndex,
        endIndex,
    }
}

/**
 * Hook para debounce de valores
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => clearTimeout(timer)
    }, [value, delay])

    return debouncedValue
}

/**
 * Hook para throttle de callbacks
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
    callback: T,
    delay: number
): T {
    const lastRun = useRef(Date.now())
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

    return useCallback(
        (...args: Parameters<T>) => {
            const now = Date.now()
            const timeSinceLastRun = now - lastRun.current

            if (timeSinceLastRun >= delay) {
                lastRun.current = now
                callback(...args)
            } else {
                // Schedule for when the delay has passed
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current)
                }
                timeoutRef.current = setTimeout(() => {
                    lastRun.current = Date.now()
                    callback(...args)
                }, delay - timeSinceLastRun)
            }
        },
        [callback, delay]
    ) as T
}

/**
 * Hook para detectar si el componente está en viewport
 */
export function useIntersectionObserver(
    options?: IntersectionObserverInit
): [React.RefObject<HTMLElement | null>, boolean] {
    const [isIntersecting, setIsIntersecting] = useState(false)
    const ref = useRef<HTMLElement>(null)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting)
        }, options)

        observer.observe(element)
        return () => observer.disconnect()
    }, [options])

    return [ref, isIntersecting]
}

/**
 * Hook para memoizar objetos complejos con comparación profunda
 */
export function useDeepMemo<T>(factory: () => T, deps: unknown[]): T {
    const ref = useRef<{ deps: unknown[]; value: T }>()

    if (!ref.current || !shallowEqual(ref.current.deps, deps)) {
        ref.current = { deps, value: factory() }
    }

    return ref.current.value
}

function shallowEqual(a: unknown[], b: unknown[]): boolean {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false
    }
    return true
}

/**
 * Hook para local storage con sincronización
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch {
            return initialValue
        }
    })

    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            setStoredValue(prev => {
                const valueToStore = value instanceof Function ? value(prev) : value
                try {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore))
                } catch (error) {
                    if (import.meta.env.DEV) {
                        console.warn(`Failed to save ${key} to localStorage`, error)
                    }
                }
                return valueToStore
            })
        },
        [key]
    )

    return [storedValue, setValue]
}

/**
 * Hook para medir el rendimiento de renderizado
 * Solo activo si DEBUG_RENDERS=true en dev
 */
export function useRenderCount(_componentName: string): void {
    const renderCount = useRef(0)
    renderCount.current++

    useEffect(() => {
        // Desactivado por defecto - descomentar para debug de renders
        // if (import.meta.env.DEV) {
        //     console.log(`[${_componentName}] Render #${renderCount.current}`)
        // }
    })
}

/**
 * Hook para obtener el valor previo
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T>()

    useEffect(() => {
        ref.current = value
    }, [value])

    return ref.current
}

/**
 * Hook para precargar recursos en idle time (optimizado para CDN)
 * Precarga imágenes, modelos 3D u otros recursos cuando el navegador está inactivo
 */
export function useIdlePreload(urls: string[], priority: 'high' | 'low' = 'low') {
    const preloadedRef = useRef<Set<string>>(new Set())

    useEffect(() => {
        if (typeof window === 'undefined') return

        const urlsToPreload = urls.filter(url => !preloadedRef.current.has(url))
        if (urlsToPreload.length === 0) return

        const preloadUrl = (url: string) => {
            if (preloadedRef.current.has(url)) return

            // Determinar tipo de recurso
            const ext = url.split('.').pop()?.toLowerCase()

            if (ext === 'glb' || ext === 'gltf') {
                // Precargar modelos 3D con fetch
                fetch(url, {
                    method: 'GET',
                    cache: 'force-cache',
                    priority: priority === 'high' ? 'high' : 'low'
                } as RequestInit).catch(() => { })
            } else if (['jpg', 'jpeg', 'png', 'webp', 'avif', 'svg'].includes(ext || '')) {
                // Precargar imágenes
                const img = new Image()
                img.src = url
            } else if (ext === 'hdr') {
                // Precargar HDR con fetch
                fetch(url, { cache: 'force-cache' }).catch(() => { })
            }

            preloadedRef.current.add(url)
        }

        // Usar requestIdleCallback si disponible, sino setTimeout
        if ('requestIdleCallback' in window) {
            const idleId = requestIdleCallback(() => {
                urlsToPreload.forEach(preloadUrl)
            }, { timeout: priority === 'high' ? 1000 : 5000 })

            return () => cancelIdleCallback(idleId)
        } else {
            const timeoutId = setTimeout(() => {
                urlsToPreload.forEach(preloadUrl)
            }, priority === 'high' ? 100 : 2000)

            return () => clearTimeout(timeoutId)
        }
    }, [urls, priority])
}

/**
 * Hook para network-aware loading
 * Reduce calidad/cantidad de recursos en conexiones lentas
 */
export function useNetworkAwareLoading() {
    const [connectionType, setConnectionType] = useState<'fast' | 'slow' | 'offline'>('fast')

    useEffect(() => {
        if (typeof navigator === 'undefined') return

        const updateConnectionType = () => {
            const connection = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection

            if (!navigator.onLine) {
                setConnectionType('offline')
            } else if (connection?.saveData || connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g') {
                setConnectionType('slow')
            } else {
                setConnectionType('fast')
            }
        }

        updateConnectionType()
        window.addEventListener('online', updateConnectionType)
        window.addEventListener('offline', updateConnectionType)

        const connection = (navigator as Navigator & { connection?: EventTarget }).connection
        connection?.addEventListener?.('change', updateConnectionType)

        return () => {
            window.removeEventListener('online', updateConnectionType)
            window.removeEventListener('offline', updateConnectionType)
            connection?.removeEventListener?.('change', updateConnectionType)
        }
    }, [])

    return connectionType
}

// Re-export the vehicle render hook
export { useVehicleRender } from './useVehicleRender'
