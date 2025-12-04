// ============================================
// TORRES MOTORSPORT ENGINEERING - AUTH SERVICE
// Servicio de autenticación con Supabase
// ============================================

import { supabase, isSupabaseConfigured } from './supabase'

export interface AuthResult {
    success: boolean
    error?: string
    user?: {
        id: string
        email: string
        username: string
    }
}

/**
 * Registra un nuevo usuario en Supabase Auth y crea su perfil en public.users
 */
export async function registerUser(username: string, email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseConfigured || !supabase) {
        console.warn('⚠️ Supabase no configurado, usando registro local')
        return { success: false, error: 'Supabase no configurado' }
    }

    try {
        // 1. Registrar en Supabase Auth
        const { data, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { username }
            }
        })

        if (authError) {
            throw authError
        }

        const user = data.user
        if (!user) {
            return { success: false, error: 'No se pudo crear el usuario' }
        }

        // 2. Crear perfil en public.users
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: user.id,
                username,
                email,
                currency: 50000,
                premium_currency: 0,
                stats: {
                    playTime: 0,
                    racesWon: 0,
                    racesLost: 0,
                    moneySpent: 0,
                    moneyEarned: 0,
                    totalBuilds: 0,
                    bestTopSpeed: 0,
                    partsInstalled: 0,
                    highestHorsepower: 0,
                    fastestQuarterMile: 999,
                    challengesCompleted: 0
                }
            })

        if (profileError) {
            console.error('Error creando perfil de usuario:', profileError)
            // El usuario se creó en auth pero no en public.users
            // Esto se puede manejar con un trigger en Supabase
        }

        // 3. Dar vehículo inicial al usuario
        await supabase
            .from('user_vehicles')
            .insert({
                user_id: user.id,
                vehicle_id: 'nissan-skyline-r34'
            })

        console.log('✅ Usuario registrado correctamente:', user.email)

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email || email,
                username
            }
        }
    } catch (error) {
        console.error('Error en registro:', error)
        const message = error instanceof Error ? error.message : 'Error desconocido'

        // Traducir mensajes comunes
        if (message.includes('User already registered')) {
            return { success: false, error: 'Este email ya está registrado' }
        }
        if (message.includes('Password should be at least')) {
            return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' }
        }
        if (message.includes('Invalid email')) {
            return { success: false, error: 'Email inválido' }
        }

        return { success: false, error: message }
    }
}

/**
 * Inicia sesión con email y contraseña
 */
export async function loginUser(email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseConfigured || !supabase) {
        console.warn('⚠️ Supabase no configurado, usando login local')
        return { success: false, error: 'Supabase no configurado' }
    }

    try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (authError) {
            throw authError
        }

        const user = data.user
        if (!user) {
            return { success: false, error: 'Credenciales inválidas' }
        }

        // Obtener perfil del usuario
        let username = user.user_metadata?.username || email.split('@')[0]

        try {
            const { data: profile } = await supabase
                .from('users')
                .select('username')
                .eq('id', user.id)
                .single()

            if (profile) {
                username = profile.username
            }
        } catch {
            // Si no existe el perfil, crearlo
            console.log('Creando perfil para usuario existente...')
            await supabase
                .from('users')
                .insert({
                    id: user.id,
                    username,
                    email,
                    currency: 50000,
                    premium_currency: 0,
                })
                .select()
                .single()
        }

        console.log('✅ Usuario autenticado:', user.email)

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email || email,
                username
            }
        }
    } catch (error) {
        console.error('Error en login:', error)
        const message = error instanceof Error ? error.message : 'Error desconocido'

        if (message.includes('Invalid login credentials')) {
            return { success: false, error: 'Email o contraseña incorrectos' }
        }

        return { success: false, error: message }
    }
}

/**
 * Cierra sesión
 */
export async function logoutUser(): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return

    try {
        await supabase.auth.signOut()
        console.log('✅ Sesión cerrada')
    } catch (error) {
        console.error('Error cerrando sesión:', error)
    }
}

/**
 * Obtiene el usuario actual de Supabase
 */
export async function getAuthUser() {
    if (!isSupabaseConfigured || !supabase) return null

    try {
        const { data: { user } } = await supabase.auth.getUser()
        return user
    } catch {
        return null
    }
}

/**
 * Verifica si Supabase está disponible
 */
export function isAuthAvailable(): boolean {
    return isSupabaseConfigured
}
