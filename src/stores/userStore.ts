import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserStats, Achievement } from '@/types'
import { CURRENCY, STORAGE_KEYS } from '@/constants'

interface UserState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    registeredUsers: Array<{ email: string; password: string; username: string }>

    // Actions
    setUser: (user: User | null) => void
    login: (email: string, password: string) => boolean
    register: (username: string, email: string, password: string) => boolean
    updateCurrency: (amount: number) => void
    spendCurrency: (amount: number) => boolean
    addCurrency: (amount: number) => void
    purchasePart: (partId: string, price: number) => boolean
    purchaseVehicle: (vehicleId: string, price: number) => boolean
    unlockAchievement: (achievement: Achievement) => void
    updateStats: (stats: Partial<UserStats>) => void
    logout: () => void
}

// Create default user
function createDefaultUser(username: string = 'Ingeniero', email: string = 'ingeniero@torres-mse.com'): User {
    return {
        id: `user-${Date.now()}`,
        username,
        email,
        createdAt: new Date(),
        currency: CURRENCY.STARTING_BALANCE,
        premiumCurrency: 0,
        ownedVehicles: ['nissan-skyline-r34'], // Starting vehicle
        ownedParts: [],
        achievements: [],
        stats: {
            totalBuilds: 0,
            racesWon: 0,
            racesLost: 0,
            challengesCompleted: 0,
            partsInstalled: 0,
            moneyEarned: 0,
            moneySpent: 0,
            playTime: 0,
            highestHorsepower: 0,
            fastestQuarterMile: Infinity,
            bestTopSpeed: 0,
        },
        friends: [],
    }
}

// Demo user for testing
const DEMO_USER = { email: 'demo@torres.com', password: 'demo123', username: 'DemoUser' }

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            registeredUsers: [DEMO_USER],

            setUser: (user) => set({ user, isAuthenticated: !!user }),

            login: (email, password) => {
                const { registeredUsers } = get()
                const foundUser = registeredUsers.find(
                    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
                )

                if (foundUser) {
                    const user = createDefaultUser(foundUser.username, foundUser.email)
                    set({ user, isAuthenticated: true })
                    return true
                }
                return false
            },

            register: (username, email, password) => {
                const { registeredUsers } = get()

                // Check if email already exists
                if (registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                    return false
                }

                // Add new user to registered users
                const newRegisteredUsers = [...registeredUsers, { email, password, username }]
                const user = createDefaultUser(username, email)

                set({
                    registeredUsers: newRegisteredUsers,
                    user,
                    isAuthenticated: true
                })
                return true
            },

            updateCurrency: (amount) => {
                const { user } = get()
                if (!user) return

                set({
                    user: {
                        ...user,
                        currency: Math.max(0, user.currency + amount),
                        stats: {
                            ...user.stats,
                            ...(amount > 0
                                ? { moneyEarned: user.stats.moneyEarned + amount }
                                : { moneySpent: user.stats.moneySpent + Math.abs(amount) }
                            ),
                        },
                    },
                })
            },

            spendCurrency: (amount) => {
                const { user } = get()
                if (!user) return false

                // Demo user (admin) has infinite money
                const isDemoUser = user.email.toLowerCase() === 'demo@torres.com'
                if (isDemoUser) return true

                if (user.currency < amount) return false

                set({
                    user: {
                        ...user,
                        currency: user.currency - amount,
                        stats: {
                            ...user.stats,
                            moneySpent: user.stats.moneySpent + amount,
                        },
                    },
                })
                return true
            },

            addCurrency: (amount) => {
                const { user } = get()
                if (!user || amount <= 0) return

                set({
                    user: {
                        ...user,
                        currency: user.currency + amount,
                        stats: {
                            ...user.stats,
                            moneyEarned: user.stats.moneyEarned + amount,
                        },
                    },
                })
            },

            purchasePart: (partId, price) => {
                const { user, updateCurrency } = get()
                if (!user || user.currency < price) return false
                if (user.ownedParts.includes(partId)) return false

                updateCurrency(-price)
                const currentUser = get().user
                if (!currentUser) return false

                set({
                    user: {
                        ...currentUser,
                        ownedParts: [...currentUser.ownedParts, partId],
                    },
                })
                return true
            },

            purchaseVehicle: (vehicleId, price) => {
                const { user, updateCurrency } = get()
                if (!user || user.currency < price) return false
                if (user.ownedVehicles.includes(vehicleId)) return false

                updateCurrency(-price)
                const currentUser = get().user
                if (!currentUser) return false

                set({
                    user: {
                        ...currentUser,
                        ownedVehicles: [...currentUser.ownedVehicles, vehicleId],
                    },
                })
                return true
            },

            unlockAchievement: (achievement) => {
                const { user, updateCurrency } = get()
                if (!user) return

                const existingIndex = user.achievements.findIndex(a => a.id === achievement.id)
                if (existingIndex !== -1 && user.achievements[existingIndex].unlockedAt) return

                const unlockedAchievement = {
                    ...achievement,
                    unlockedAt: new Date(),
                    progress: achievement.maxProgress,
                }

                const newAchievements = existingIndex !== -1
                    ? user.achievements.map((a, i) => i === existingIndex ? unlockedAchievement : a)
                    : [...user.achievements, unlockedAchievement]

                set({
                    user: {
                        ...user,
                        achievements: newAchievements,
                    },
                })

                // Apply currency reward
                if (achievement.reward.currency) {
                    updateCurrency(achievement.reward.currency)
                }
            },

            updateStats: (stats) => {
                const { user } = get()
                if (!user) return

                set({
                    user: {
                        ...user,
                        stats: { ...user.stats, ...stats },
                    },
                })
            },

            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: STORAGE_KEYS.USER,
            partialize: (state) => ({
                user: state.user,
                registeredUsers: state.registeredUsers,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
