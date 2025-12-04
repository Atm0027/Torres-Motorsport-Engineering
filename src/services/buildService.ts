// ============================================
// TORRES MOTORSPORT ENGINEERING - BUILD SERVICE
// Servicio para guardar y cargar builds desde Supabase
// ============================================

import { supabase, isSupabaseConfigured } from './supabase'
import type { SavedBuild } from '@/types'

export interface DbBuild {
    id: string
    user_id: string
    vehicle_id: string
    name: string
    description?: string | null
    installed_parts: unknown
    livery: unknown
    metrics: unknown
    is_public: boolean | null
    likes: number | null
    downloads: number | null
    screenshots: unknown
    tags: unknown
    created_at: string | null
    updated_at: string | null
}

/**
 * Convierte un build de la app al formato de la base de datos
 */
function buildToDb(build: SavedBuild, userId: string) {
    return {
        user_id: userId,
        vehicle_id: build.vehicleId,
        name: build.name,
        installed_parts: JSON.parse(JSON.stringify(build.installedParts.map(ip => ip.part.id))),
        livery: JSON.parse(JSON.stringify(build.livery || {})),
        metrics: JSON.parse(JSON.stringify(build.metrics || {})),
        is_public: false,
    }
}

/**
 * Guarda un build en Supabase
 */
export async function saveBuildToDb(build: SavedBuild, userId: string): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
        console.warn('⚠️ Supabase no configurado, build guardado solo localmente')
        return { success: false, error: 'Supabase no configurado' }
    }

    try {
        const dbBuild = buildToDb(build, userId)

        // Intentar actualizar si ya existe, si no, insertar
        const { data: existing } = await supabase
            .from('builds')
            .select('id')
            .eq('user_id', userId)
            .eq('vehicle_id', build.vehicleId)
            .single()

        let result
        if (existing) {
            // Actualizar build existente
            result = await supabase
                .from('builds')
                .update({
                    ...dbBuild,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)
                .select()
                .single()
        } else {
            // Crear nuevo build
            result = await supabase
                .from('builds')
                .insert(dbBuild)
                .select()
                .single()
        }

        if (result.error) {
            throw result.error
        }

        console.log('✅ Build guardado en Supabase:', result.data?.id)
        return { success: true, id: result.data?.id }
    } catch (error) {
        console.error('Error guardando build:', error)
        const message = error instanceof Error ? error.message : 'Error desconocido'
        return { success: false, error: message }
    }
}

/**
 * Obtiene los builds de un usuario desde Supabase
 */
export async function getUserBuildsFromDb(userId: string): Promise<DbBuild[]> {
    if (!isSupabaseConfigured || !supabase) {
        return []
    }

    try {
        const { data, error } = await supabase
            .from('builds')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })

        if (error) {
            throw error
        }

        return data || []
    } catch (error) {
        console.error('Error obteniendo builds:', error)
        return []
    }
}

/**
 * Elimina un build de Supabase
 */
export async function deleteBuildFromDb(buildId: string, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
        return false
    }

    try {
        const { error } = await supabase
            .from('builds')
            .delete()
            .eq('id', buildId)
            .eq('user_id', userId)

        if (error) {
            throw error
        }

        console.log('✅ Build eliminado de Supabase:', buildId)
        return true
    } catch (error) {
        console.error('Error eliminando build:', error)
        return false
    }
}

/**
 * Verifica si hay un usuario autenticado en Supabase
 */
export async function getCurrentUserId(): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) {
        return null
    }

    try {
        const { data: { user } } = await supabase.auth.getUser()
        return user?.id || null
    } catch {
        return null
    }
}
