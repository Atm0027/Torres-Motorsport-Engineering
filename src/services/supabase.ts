// ============================================
// TORRES MOTORSPORT ENGINEERING - SUPABASE CLIENT
// ============================================

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './supabase.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Flag para saber si Supabase está disponible
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Crear cliente solo si hay configuración
let supabaseInstance: SupabaseClient<Database> | null = null

if (isSupabaseConfigured) {
    supabaseInstance = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    })
    console.log('✅ Supabase configurado correctamente')
} else {
    console.warn('⚠️ Variables de Supabase no configuradas. Usando datos locales.')
}

// Helper para obtener el cliente (lanza error si no está disponible)
function getSupabase(): SupabaseClient<Database> {
    if (!supabaseInstance) {
        throw new Error('Supabase not configured')
    }
    return supabaseInstance
}

// Exportar el cliente (puede ser null)
export const supabase = supabaseInstance

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Obtiene todos los vehículos de la base de datos
 */
export async function getVehicles() {
    const client = getSupabase()
    const { data, error } = await client
        .from('vehicles')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching vehicles:', error)
        throw error
    }

    return data
}

/**
 * Obtiene un vehículo por su ID
 */
export async function getVehicleById(id: string) {
    const client = getSupabase()
    const { data, error } = await client
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching vehicle:', error)
        throw error
    }

    return data
}

/**
 * Obtiene todas las piezas de la base de datos
 */
export async function getParts() {
    const client = getSupabase()
    const { data, error } = await client
        .from('parts')
        .select('*')
        .order('category, name')

    if (error) {
        console.error('Error fetching parts:', error)
        throw error
    }

    return data
}

/**
 * Obtiene piezas por categoría
 */
export async function getPartsByCategory(category: string) {
    const client = getSupabase()
    const { data, error } = await client
        .from('parts')
        .select('*')
        .eq('category', category)
        .order('price')

    if (error) {
        console.error('Error fetching parts by category:', error)
        throw error
    }

    return data
}

/**
 * Obtiene una pieza por su ID
 */
export async function getPartById(id: string) {
    const client = getSupabase()
    const { data, error } = await client
        .from('parts')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching part:', error)
        throw error
    }

    return data
}

/**
 * Obtiene todos los logros
 */
export async function getAchievements() {
    const client = getSupabase()
    const { data, error } = await client
        .from('achievements')
        .select('*')
        .order('category, name')

    if (error) {
        console.error('Error fetching achievements:', error)
        throw error
    }

    return data
}

// ============================================
// AUTH FUNCTIONS
// ============================================

/**
 * Registra un nuevo usuario
 */
export async function signUp(email: string, password: string, username: string) {
    const client = getSupabase()
    const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
            data: {
                username,
            },
        },
    })

    if (error) {
        console.error('Error signing up:', error)
        throw error
    }

    return data
}

/**
 * Inicia sesión con email y contraseña
 */
export async function signIn(email: string, password: string) {
    const client = getSupabase()
    const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Error signing in:', error)
        throw error
    }

    return data
}

/**
 * Cierra sesión
 */
export async function signOut() {
    const client = getSupabase()
    const { error } = await client.auth.signOut()

    if (error) {
        console.error('Error signing out:', error)
        throw error
    }
}

/**
 * Obtiene el usuario actual
 */
export async function getCurrentUser() {
    const client = getSupabase()
    const { data: { user }, error } = await client.auth.getUser()

    if (error) {
        console.error('Error getting current user:', error)
        return null
    }

    return user
}

/**
 * Escucha cambios en el estado de autenticación
 */
export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
    const client = getSupabase()
    return client.auth.onAuthStateChange(callback)
}

// ============================================
// USER DATA FUNCTIONS
// ============================================

/**
 * Obtiene los datos del usuario autenticado
 */
export async function getUserProfile(userId: string) {
    const client = getSupabase()
    const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching user profile:', error)
        throw error
    }

    return data
}

/**
 * Actualiza el perfil del usuario
 */
export async function updateUserProfile(userId: string, updates: {
    username?: string
    avatar_url?: string
    currency?: number
    experience?: number
    level?: number
}) {
    const client = getSupabase()
    const { data, error } = await client
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

    if (error) {
        console.error('Error updating user profile:', error)
        throw error
    }

    return data
}

/**
 * Obtiene los vehículos del usuario
 */
export async function getUserVehicles(userId: string) {
    const client = getSupabase()
    const { data, error } = await client
        .from('user_vehicles')
        .select(`
            *,
            vehicle:vehicles(*)
        `)
        .eq('user_id', userId)

    if (error) {
        console.error('Error fetching user vehicles:', error)
        throw error
    }

    return data
}

/**
 * Obtiene las piezas del usuario
 */
export async function getUserParts(userId: string) {
    const client = getSupabase()
    const { data, error } = await client
        .from('user_parts')
        .select(`
            *,
            part:parts(*)
        `)
        .eq('user_id', userId)

    if (error) {
        console.error('Error fetching user parts:', error)
        throw error
    }

    return data
}

/**
 * Obtiene los logros del usuario
 */
export async function getUserAchievements(userId: string) {
    const client = getSupabase()
    const { data, error } = await client
        .from('user_achievements')
        .select(`
            *,
            achievement:achievements(*)
        `)
        .eq('user_id', userId)

    if (error) {
        console.error('Error fetching user achievements:', error)
        throw error
    }

    return data
}

// ============================================
// BUILDS FUNCTIONS
// ============================================

/**
 * Guarda una configuración de vehículo
 */
export async function saveBuild(build: {
    user_id: string
    vehicle_id: string
    name: string
    description?: string
    installed_parts: string[]
    color: string
    is_public?: boolean
}) {
    const client = getSupabase()
    const { data, error } = await client
        .from('builds')
        .insert(build)
        .select()
        .single()

    if (error) {
        console.error('Error saving build:', error)
        throw error
    }

    return data
}

/**
 * Obtiene los builds del usuario
 */
export async function getUserBuilds(userId: string) {
    const client = getSupabase()
    const { data, error } = await client
        .from('builds')
        .select(`
            *,
            vehicle:vehicles(*)
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching user builds:', error)
        throw error
    }

    return data
}

/**
 * Obtiene builds públicos
 */
export async function getPublicBuilds(limit = 20) {
    const client = getSupabase()
    const { data, error } = await client
        .from('builds')
        .select(`
            *,
            vehicle:vehicles(*),
            user:users(username, avatar_url)
        `)
        .eq('is_public', true)
        .order('likes', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching public builds:', error)
        throw error
    }

    return data
}

/**
 * Da like a un build
 */
export async function likeBuild(buildId: string) {
    const client = getSupabase()

    // Primero obtener el valor actual de likes
    const { data: build, error: fetchError } = await client
        .from('builds')
        .select('likes')
        .eq('id', buildId)
        .single()

    if (fetchError) {
        console.error('Error fetching build likes:', fetchError)
        throw fetchError
    }

    // Incrementar likes
    const { data, error } = await client
        .from('builds')
        .update({ likes: (build?.likes || 0) + 1 })
        .eq('id', buildId)
        .select()
        .single()

    if (error) {
        console.error('Error liking build:', error)
        throw error
    }

    return data
}

// ============================================
// LEADERBOARD FUNCTIONS
// ============================================

/**
 * Obtiene el leaderboard por categoría
 */
export async function getLeaderboard(category: string, limit = 50) {
    const client = getSupabase()
    const { data, error } = await client
        .from('leaderboard_entries')
        .select(`
            *,
            user:users(username, avatar_url),
            vehicle:vehicles(name, manufacturer)
        `)
        .eq('category', category)
        .order('score', { ascending: category.includes('time') })
        .limit(limit)

    if (error) {
        console.error('Error fetching leaderboard:', error)
        throw error
    }

    return data
}

// Export type helpers
export type { Database }
