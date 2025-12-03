-- ============================================
-- TORRES MOTORSPORT ENGINEERING - DATABASE SCHEMA
-- Base de datos: Supabase (PostgreSQL)
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: vehicles (Vehículos base del catálogo)
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    body_style VARCHAR(50) NOT NULL,
    base_price INTEGER NOT NULL,
    
    -- Especificaciones del motor
    engine_type VARCHAR(50) NOT NULL,
    engine_displacement DECIMAL(4,2) NOT NULL,
    engine_cylinders INTEGER NOT NULL,
    engine_naturally_aspirated BOOLEAN DEFAULT true,
    engine_base_horsepower INTEGER NOT NULL,
    engine_base_torque INTEGER NOT NULL,
    engine_redline INTEGER NOT NULL,
    
    -- Especificaciones del chasis
    drivetrain VARCHAR(10) NOT NULL,
    engine_layout VARCHAR(20) NOT NULL,
    transmission_type VARCHAR(20) NOT NULL,
    transmission_gears INTEGER NOT NULL,
    weight INTEGER NOT NULL,
    wheelbase INTEGER NOT NULL,
    track_width INTEGER NOT NULL,
    engine_bay_size INTEGER NOT NULL,
    bolt_pattern VARCHAR(20) NOT NULL,
    fuel_capacity INTEGER NOT NULL,
    drag_coefficient DECIMAL(4,3) NOT NULL,
    
    -- URLs de assets
    image_url VARCHAR(500),
    model_url VARCHAR(500),
    
    -- Colores por defecto
    default_primary_color VARCHAR(20) DEFAULT '#1e293b',
    default_secondary_color VARCHAR(20) DEFAULT '#334155',
    default_accent_color VARCHAR(20) DEFAULT '#00d4ff',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: parts (Catálogo de piezas)
-- ============================================
CREATE TABLE IF NOT EXISTS parts (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price INTEGER NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    model_url VARCHAR(500),
    
    -- Compatibilidad (almacenado como JSONB para flexibilidad)
    compatibility JSONB NOT NULL DEFAULT '{}',
    
    -- Stats de rendimiento (JSONB para flexibilidad)
    stats JSONB NOT NULL DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: users (Usuarios)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url VARCHAR(500),
    
    -- Moneda del juego
    currency INTEGER DEFAULT 50000,
    premium_currency INTEGER DEFAULT 0,
    
    -- Estadísticas del usuario (JSONB)
    stats JSONB DEFAULT '{
        "totalBuilds": 0,
        "racesWon": 0,
        "racesLost": 0,
        "challengesCompleted": 0,
        "partsInstalled": 0,
        "moneyEarned": 0,
        "moneySpent": 0,
        "playTime": 0,
        "highestHorsepower": 0,
        "fastestQuarterMile": 999,
        "bestTopSpeed": 0
    }',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: user_vehicles (Vehículos que posee el usuario)
-- ============================================
CREATE TABLE IF NOT EXISTS user_vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id VARCHAR(100) NOT NULL REFERENCES vehicles(id),
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, vehicle_id)
);

-- ============================================
-- TABLA: user_parts (Piezas que posee el usuario)
-- ============================================
CREATE TABLE IF NOT EXISTS user_parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    part_id VARCHAR(100) NOT NULL REFERENCES parts(id),
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, part_id)
);

-- ============================================
-- TABLA: builds (Configuraciones guardadas)
-- ============================================
CREATE TABLE IF NOT EXISTS builds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id VARCHAR(100) NOT NULL REFERENCES vehicles(id),
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Piezas instaladas con configuración de tuning
    installed_parts JSONB DEFAULT '[]',
    
    -- Configuración de livery/colores
    livery JSONB DEFAULT '{
        "primaryColor": "#1e293b",
        "secondaryColor": "#334155",
        "accentColor": "#00d4ff",
        "decals": [],
        "paintFinish": "metallic"
    }',
    
    -- Métricas calculadas
    metrics JSONB DEFAULT '{}',
    
    -- Visibilidad y social
    is_public BOOLEAN DEFAULT false,
    likes INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    
    -- Screenshots
    screenshots JSONB DEFAULT '[]',
    
    -- Tags para búsqueda
    tags JSONB DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: build_comments (Comentarios en builds)
-- ============================================
CREATE TABLE IF NOT EXISTS build_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: achievements (Definición de logros)
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    category VARCHAR(20) NOT NULL, -- bronze, silver, gold, platinum
    max_progress INTEGER DEFAULT 1,
    
    -- Recompensas
    reward_experience INTEGER DEFAULT 0,
    reward_currency INTEGER DEFAULT 0,
    reward_part_id VARCHAR(100) REFERENCES parts(id),
    reward_vehicle_id VARCHAR(100) REFERENCES vehicles(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: user_achievements (Logros desbloqueados)
-- ============================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(100) NOT NULL REFERENCES achievements(id),
    progress INTEGER DEFAULT 0,
    unlocked_at TIMESTAMPTZ,
    
    UNIQUE(user_id, achievement_id)
);

-- ============================================
-- TABLA: leaderboards (Clasificaciones)
-- ============================================
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leaderboard_type VARCHAR(50) NOT NULL, -- horsepower, quarter_mile, top_speed, etc.
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    build_id UUID REFERENCES builds(id) ON DELETE SET NULL,
    
    value DECIMAL(15,3) NOT NULL,
    vehicle_name VARCHAR(255),
    
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Índice único para evitar duplicados por usuario/tipo
    UNIQUE(leaderboard_type, user_id)
);

-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices para parts
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category);
CREATE INDEX IF NOT EXISTS idx_parts_brand ON parts(brand);
CREATE INDEX IF NOT EXISTS idx_parts_price ON parts(price);

-- Índices para builds
CREATE INDEX IF NOT EXISTS idx_builds_user_id ON builds(user_id);
CREATE INDEX IF NOT EXISTS idx_builds_vehicle_id ON builds(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_builds_is_public ON builds(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_builds_likes ON builds(likes DESC) WHERE is_public = true;

-- Índices para leaderboards
CREATE INDEX IF NOT EXISTS idx_leaderboard_type_value ON leaderboard_entries(leaderboard_type, value DESC);

-- Índices para búsqueda de usuarios
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parts_updated_at
    BEFORE UPDATE ON parts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_builds_updated_at
    BEFORE UPDATE ON builds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en tablas sensibles
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Políticas para users (solo ver/editar tu propio perfil)
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- Políticas para builds
CREATE POLICY "Anyone can view public builds"
    ON builds FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own builds"
    ON builds FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own builds"
    ON builds FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own builds"
    ON builds FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para inventario de vehículos
CREATE POLICY "Users can view their own vehicles"
    ON user_vehicles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add vehicles to inventory"
    ON user_vehicles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Políticas para inventario de piezas
CREATE POLICY "Users can view their own parts"
    ON user_parts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add parts to inventory"
    ON user_parts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Políticas para logros
CREATE POLICY "Users can view their own achievements"
    ON user_achievements FOR SELECT
    USING (auth.uid() = user_id);

-- Tablas públicas (catálogos) - sin RLS
-- vehicles y parts son públicos para lectura
