import { create } from 'zustand'
import type { Notification, UIState } from '@/types'

interface UIStoreState extends UIState {
    // Notification actions
    addNotification: (notification: Omit<Notification, 'id'>) => void
    removeNotification: (id: string) => void
    clearNotifications: () => void

    // Sidebar actions
    toggleSidebar: () => void
    setSidebarCollapsed: (collapsed: boolean) => void

    // Panel actions
    setActivePanel: (panel: string | null) => void

    // Modal actions
    openModal: (modalId: string) => void
    closeModal: (modalId?: string) => void

    // Theme actions
    setTheme: (theme: UIState['theme']) => void
}

export const useUIStore = create<UIStoreState>((set, get) => ({
    sidebarCollapsed: false,
    activePanel: null,
    notifications: [],
    modalStack: [],
    theme: 'dark',

    // Notification actions
    addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newNotification: Notification = {
            ...notification,
            id,
            duration: notification.duration ?? 5000, // Default 5 seconds
        }

        set((state) => ({
            notifications: [...state.notifications, newNotification],
        }))

        // Auto-remove after duration (handled in component, but backup here)
        if (newNotification.duration && newNotification.duration > 0) {
            setTimeout(() => {
                get().removeNotification(id)
            }, newNotification.duration + 500)
        }
    },

    removeNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        }))
    },

    clearNotifications: () => {
        set({ notifications: [] })
    },

    // Sidebar actions
    toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
    },

    setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed })
    },

    // Panel actions
    setActivePanel: (panel) => {
        set({ activePanel: panel })
    },

    // Modal actions
    openModal: (modalId) => {
        set((state) => ({
            modalStack: [...state.modalStack, modalId],
        }))
    },

    closeModal: (modalId) => {
        set((state) => ({
            modalStack: modalId
                ? state.modalStack.filter((id) => id !== modalId)
                : state.modalStack.slice(0, -1),
        }))
    },

    // Theme actions
    setTheme: (theme) => {
        set({ theme })
        document.documentElement.classList.remove('dark', 'blueprint', 'racing')
        document.documentElement.classList.add(theme)
    },
}))

// Helper hooks for specific notifications - memoized for stability
export const useNotify = () => {
    const addNotification = useUIStore((state) => state.addNotification)

    // Las funciones se recrean solo cuando addNotification cambia (nunca con Zustand)
    return {
        success: (title: string, message: string) =>
            addNotification({ type: 'success', title, message }),
        error: (title: string, message: string) =>
            addNotification({ type: 'error', title, message }),
        warning: (title: string, message: string) =>
            addNotification({ type: 'warning', title, message }),
        info: (title: string, message: string) =>
            addNotification({ type: 'info', title, message }),
        achievement: (title: string, message: string) =>
            addNotification({ type: 'achievement', title, message, duration: 8000 }),
    }
}

// Selectores optimizados para evitar re-renders innecesarios
export const useSidebarCollapsed = () => useUIStore((state) => state.sidebarCollapsed)
export const useActivePanel = () => useUIStore((state) => state.activePanel)
export const useTheme = () => useUIStore((state) => state.theme)
export const useNotifications = () => useUIStore((state) => state.notifications)
