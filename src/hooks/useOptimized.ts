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
 */
export function useRenderCount(componentName: string): void {
    const renderCount = useRef(0)
    renderCount.current++

    useEffect(() => {
        if (import.meta.env.DEV) {
            console.log(`[${componentName}] Render #${renderCount.current}`)
        }
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

// Re-export the vehicle render hook
export { useVehicleRender } from './useVehicleRender'
