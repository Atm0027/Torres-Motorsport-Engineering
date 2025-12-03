// ============================================
// TORRES MOTORSPORT ENGINEERING - SUPABASE TYPES
// Generated from database schema
// ============================================

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            achievements: {
                Row: {
                    category: string
                    created_at: string | null
                    description: string | null
                    icon: string | null
                    id: string
                    max_progress: number | null
                    name: string
                    reward_currency: number | null
                    reward_experience: number | null
                    reward_part_id: string | null
                    reward_vehicle_id: string | null
                }
                Insert: {
                    category: string
                    created_at?: string | null
                    description?: string | null
                    icon?: string | null
                    id: string
                    max_progress?: number | null
                    name: string
                    reward_currency?: number | null
                    reward_experience?: number | null
                    reward_part_id?: string | null
                    reward_vehicle_id?: string | null
                }
                Update: {
                    category?: string
                    created_at?: string | null
                    description?: string | null
                    icon?: string | null
                    id?: string
                    max_progress?: number | null
                    name?: string
                    reward_currency?: number | null
                    reward_experience?: number | null
                    reward_part_id?: string | null
                    reward_vehicle_id?: string | null
                }
                Relationships: []
            }
            build_comments: {
                Row: {
                    build_id: string
                    content: string
                    created_at: string | null
                    id: string
                    likes: number | null
                    user_id: string
                }
                Insert: {
                    build_id: string
                    content: string
                    created_at?: string | null
                    id?: string
                    likes?: number | null
                    user_id: string
                }
                Update: {
                    build_id?: string
                    content?: string
                    created_at?: string | null
                    id?: string
                    likes?: number | null
                    user_id?: string
                }
                Relationships: []
            }
            builds: {
                Row: {
                    created_at: string | null
                    description: string | null
                    downloads: number | null
                    id: string
                    installed_parts: Json | null
                    is_public: boolean | null
                    likes: number | null
                    livery: Json | null
                    metrics: Json | null
                    name: string
                    screenshots: Json | null
                    tags: Json | null
                    updated_at: string | null
                    user_id: string
                    vehicle_id: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    downloads?: number | null
                    id?: string
                    installed_parts?: Json | null
                    is_public?: boolean | null
                    likes?: number | null
                    livery?: Json | null
                    metrics?: Json | null
                    name: string
                    screenshots?: Json | null
                    tags?: Json | null
                    updated_at?: string | null
                    user_id: string
                    vehicle_id: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    downloads?: number | null
                    id?: string
                    installed_parts?: Json | null
                    is_public?: boolean | null
                    likes?: number | null
                    livery?: Json | null
                    metrics?: Json | null
                    name?: string
                    screenshots?: Json | null
                    tags?: Json | null
                    updated_at?: string | null
                    user_id?: string
                    vehicle_id?: string
                }
                Relationships: []
            }
            leaderboard_entries: {
                Row: {
                    achieved_at: string | null
                    build_id: string | null
                    id: string
                    leaderboard_type: string
                    user_id: string
                    value: number
                    vehicle_name: string | null
                }
                Insert: {
                    achieved_at?: string | null
                    build_id?: string | null
                    id?: string
                    leaderboard_type: string
                    user_id: string
                    value: number
                    vehicle_name?: string | null
                }
                Update: {
                    achieved_at?: string | null
                    build_id?: string | null
                    id?: string
                    leaderboard_type?: string
                    user_id?: string
                    value?: number
                    vehicle_name?: string | null
                }
                Relationships: []
            }
            parts: {
                Row: {
                    brand: string
                    category: string
                    compatibility: Json
                    created_at: string | null
                    description: string | null
                    id: string
                    image_url: string | null
                    model_url: string | null
                    name: string
                    price: number
                    stats: Json
                    updated_at: string | null
                    weight: number
                }
                Insert: {
                    brand: string
                    category: string
                    compatibility?: Json
                    created_at?: string | null
                    description?: string | null
                    id: string
                    image_url?: string | null
                    model_url?: string | null
                    name: string
                    price: number
                    stats?: Json
                    updated_at?: string | null
                    weight: number
                }
                Update: {
                    brand?: string
                    category?: string
                    compatibility?: Json
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    image_url?: string | null
                    model_url?: string | null
                    name?: string
                    price?: number
                    stats?: Json
                    updated_at?: string | null
                    weight?: number
                }
                Relationships: []
            }
            user_achievements: {
                Row: {
                    achievement_id: string
                    id: string
                    progress: number | null
                    unlocked_at: string | null
                    user_id: string
                }
                Insert: {
                    achievement_id: string
                    id?: string
                    progress?: number | null
                    unlocked_at?: string | null
                    user_id: string
                }
                Update: {
                    achievement_id?: string
                    id?: string
                    progress?: number | null
                    unlocked_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            user_parts: {
                Row: {
                    id: string
                    part_id: string
                    purchased_at: string | null
                    user_id: string
                }
                Insert: {
                    id?: string
                    part_id: string
                    purchased_at?: string | null
                    user_id: string
                }
                Update: {
                    id?: string
                    part_id?: string
                    purchased_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            user_vehicles: {
                Row: {
                    id: string
                    purchased_at: string | null
                    user_id: string
                    vehicle_id: string
                }
                Insert: {
                    id?: string
                    purchased_at?: string | null
                    user_id: string
                    vehicle_id: string
                }
                Update: {
                    id?: string
                    purchased_at?: string | null
                    user_id?: string
                    vehicle_id?: string
                }
                Relationships: []
            }
            users: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    currency: number | null
                    email: string
                    id: string
                    premium_currency: number | null
                    stats: Json | null
                    updated_at: string | null
                    username: string
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    currency?: number | null
                    email: string
                    id?: string
                    premium_currency?: number | null
                    stats?: Json | null
                    updated_at?: string | null
                    username: string
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    currency?: number | null
                    email?: string
                    id?: string
                    premium_currency?: number | null
                    stats?: Json | null
                    updated_at?: string | null
                    username?: string
                }
                Relationships: []
            }
            vehicles: {
                Row: {
                    base_price: number
                    body_style: string
                    bolt_pattern: string
                    created_at: string | null
                    default_accent_color: string | null
                    default_primary_color: string | null
                    default_secondary_color: string | null
                    drag_coefficient: number
                    drivetrain: string
                    engine_base_horsepower: number
                    engine_base_torque: number
                    engine_bay_size: number
                    engine_cylinders: number
                    engine_displacement: number
                    engine_layout: string
                    engine_naturally_aspirated: boolean | null
                    engine_redline: number
                    engine_type: string
                    fuel_capacity: number
                    id: string
                    image_url: string | null
                    manufacturer: string
                    model_url: string | null
                    name: string
                    track_width: number
                    transmission_gears: number
                    transmission_type: string
                    updated_at: string | null
                    weight: number
                    wheelbase: number
                    year: number
                }
                Insert: {
                    base_price: number
                    body_style: string
                    bolt_pattern: string
                    created_at?: string | null
                    default_accent_color?: string | null
                    default_primary_color?: string | null
                    default_secondary_color?: string | null
                    drag_coefficient: number
                    drivetrain: string
                    engine_base_horsepower: number
                    engine_base_torque: number
                    engine_bay_size: number
                    engine_cylinders: number
                    engine_displacement: number
                    engine_layout: string
                    engine_naturally_aspirated?: boolean | null
                    engine_redline: number
                    engine_type: string
                    fuel_capacity: number
                    id: string
                    image_url?: string | null
                    manufacturer: string
                    model_url?: string | null
                    name: string
                    track_width: number
                    transmission_gears: number
                    transmission_type: string
                    updated_at?: string | null
                    weight: number
                    wheelbase: number
                    year: number
                }
                Update: {
                    base_price?: number
                    body_style?: string
                    bolt_pattern?: string
                    created_at?: string | null
                    default_accent_color?: string | null
                    default_primary_color?: string | null
                    default_secondary_color?: string | null
                    drag_coefficient?: number
                    drivetrain?: string
                    engine_base_horsepower?: number
                    engine_base_torque?: number
                    engine_bay_size?: number
                    engine_cylinders?: number
                    engine_displacement?: number
                    engine_layout?: string
                    engine_naturally_aspirated?: boolean | null
                    engine_redline?: number
                    engine_type?: string
                    fuel_capacity?: number
                    id?: string
                    image_url?: string | null
                    manufacturer?: string
                    model_url?: string | null
                    name?: string
                    track_width?: number
                    transmission_gears?: number
                    transmission_type?: string
                    updated_at?: string | null
                    weight?: number
                    wheelbase?: number
                    year?: number
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience type aliases
export type Vehicle = Tables<'vehicles'>
export type Part = Tables<'parts'>
export type User = Tables<'users'>
export type Build = Tables<'builds'>
export type Achievement = Tables<'achievements'>
export type UserVehicle = Tables<'user_vehicles'>
export type UserPart = Tables<'user_parts'>
export type UserAchievement = Tables<'user_achievements'>
export type LeaderboardEntry = Tables<'leaderboard_entries'>
export type BuildComment = Tables<'build_comments'>
