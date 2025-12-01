// ============================================
// TORRES MOTORSPORT ENGINEERING - CONSTANTS
// Simulador de Creación y Personalización de Vehículos
// ============================================

import type { PartCategory } from '@/types'

// Application Info
export const APP_NAME = 'Torres Motorsport Engineering'
export const APP_SHORT_NAME = 'Torres MSE'
export const APP_VERSION = '1.0.0'
export const APP_TAGLINE = 'Crea el coche de tus sueños'
export const APP_DESCRIPTION = 'Simulador de creación y personalización de vehículos con física realista'

// Physics Constants
export const PHYSICS = {
    AIR_DENSITY: 1.225, // kg/m³ at sea level
    GRAVITY: 9.81, // m/s²
    ROLLING_RESISTANCE_COEFFICIENT: 0.015,

    // Drivetrain losses (percentage)
    DRIVETRAIN_LOSS: {
        FWD: 0.15,
        RWD: 0.15,
        AWD: 0.20,
        '4WD': 0.22,
    },

    // Tire grip coefficients
    TIRE_GRIP: {
        street: 0.85,
        sport: 0.95,
        'semi-slick': 1.05,
        slick: 1.15,
        rain: 0.75,
    },
} as const

// Experience & Leveling
export const LEVELING = {
    BASE_XP: 1000,
    XP_MULTIPLIER: 1.15,
    MAX_LEVEL: 100,

    // XP rewards
    REWARDS: {
        PART_INSTALLED: 50,
        BUILD_COMPLETED: 200,
        MISSION_COMPLETED: 500,
        ACHIEVEMENT_UNLOCKED: 100,
        RACE_WON: 300,
        CHALLENGE_COMPLETED: 400,
    },
} as const

// Currency
export const CURRENCY = {
    STARTING_BALANCE: 50000,
    DAILY_BONUS: 1000,
    RACE_WIN_BASE: 5000,
    CHALLENGE_COMPLETION_BASE: 3000,
    PART_SELL_PERCENTAGE: 0.6, // 60% of original price
} as const

// Part Categories with metadata
export const PART_CATEGORIES: Record<PartCategory, {
    name: string
    icon: string
    description: string
    order: number
}> = {
    engine: {
        name: 'Motor',
        icon: 'Engine',
        description: 'Bloque motor y componentes internos',
        order: 1,
    },
    turbo: {
        name: 'Turbo',
        icon: 'Wind',
        description: 'Turbocompresores y sistemas de sobrealimentación',
        order: 2,
    },
    supercharger: {
        name: 'Supercargador',
        icon: 'Zap',
        description: 'Compresores mecánicos',
        order: 3,
    },
    exhaust: {
        name: 'Escape',
        icon: 'Flame',
        description: 'Sistemas de escape y catalizadores',
        order: 4,
    },
    intake: {
        name: 'Admisión',
        icon: 'ArrowDownToLine',
        description: 'Sistemas de admisión de aire',
        order: 5,
    },
    ecu: {
        name: 'ECU',
        icon: 'Cpu',
        description: 'Unidades de control electrónico',
        order: 6,
    },
    electronics: {
        name: 'Electrónica',
        icon: 'Cpu',
        description: 'Sensores, sistemas y módulos electrónicos',
        order: 7,
    },
    transmission: {
        name: 'Transmisión',
        icon: 'Cog',
        description: 'Cajas de cambios y componentes',
        order: 8,
    },
    clutch: {
        name: 'Embrague',
        icon: 'Circle',
        description: 'Embragues y volantes de inercia',
        order: 9,
    },
    differential: {
        name: 'Diferencial',
        icon: 'GitBranch',
        description: 'Diferenciales y sistemas LSD',
        order: 10,
    },
    driveshaft: {
        name: 'Eje de Transmisión',
        icon: 'Cog',
        description: 'Ejes, cardanes y componentes de transmisión',
        order: 11,
    },
    suspension: {
        name: 'Suspensión',
        icon: 'ArrowUpDown',
        description: 'Amortiguadores, muelles y componentes',
        order: 12,
    },
    chassis: {
        name: 'Chasis',
        icon: 'Car',
        description: 'Barras estabilizadoras y refuerzos',
        order: 13,
    },
    brakes: {
        name: 'Frenos',
        icon: 'Disc',
        description: 'Discos, pinzas y sistemas de frenado',
        order: 14,
    },
    wheels: {
        name: 'Llantas',
        icon: 'CircleDot',
        description: 'Llantas de aleación y forjadas',
        order: 15,
    },
    tires: {
        name: 'Neumáticos',
        icon: 'Circle',
        description: 'Neumáticos de diferentes compuestos',
        order: 16,
    },
    bodykit: {
        name: 'Body Kits',
        icon: 'Car',
        description: 'Kits de carrocería, paragolpes y faldones',
        order: 17,
    },
    aero: {
        name: 'Alerones & Aero',
        icon: 'Wind',
        description: 'Alerones, difusores, splitters y canards',
        order: 18,
    },
    exterior: {
        name: 'Accesorios Exterior',
        icon: 'Sparkles',
        description: 'Espejos, manillas, emblemas y vinilos',
        order: 19,
    },
    lighting: {
        name: 'Iluminación',
        icon: 'Lightbulb',
        description: 'Faros, luces LED y neones',
        order: 20,
    },
    interior: {
        name: 'Interior General',
        icon: 'Armchair',
        description: 'Volantes, pomos y accesorios interiores',
        order: 21,
    },
    seats: {
        name: 'Asientos',
        icon: 'Armchair',
        description: 'Asientos deportivos, bucket seats y recaro',
        order: 22,
    },
    safety: {
        name: 'Seguridad',
        icon: 'Shield',
        description: 'Arneses, jaulas antivuelco y extintores',
        order: 23,
    },
    gauges: {
        name: 'Instrumentación',
        icon: 'Gauge',
        description: 'Relojes, manómetros y displays digitales',
        order: 24,
    },
    fuel: {
        name: 'Combustible',
        icon: 'Fuel',
        description: 'Tanques, bombas e inyectores',
        order: 25,
    },
    cooling: {
        name: 'Refrigeración',
        icon: 'Thermometer',
        description: 'Radiadores e intercoolers',
        order: 26,
    },
    nitrous: {
        name: 'Nitroso',
        icon: 'Sparkles',
        description: 'Sistemas de óxido nitroso',
        order: 27,
    },
}

// Performance Thresholds (for achievements/rankings)
export const PERFORMANCE_THRESHOLDS = {
    HORSEPOWER: {
        amateur: 200,
        intermediate: 400,
        advanced: 600,
        expert: 800,
        master: 1000,
        legendary: 1500,
    },
    ZERO_TO_SIXTY: {
        street: 8.0,
        sport: 5.5,
        performance: 4.0,
        supercar: 3.0,
        hypercar: 2.5,
    },
    TOP_SPEED: {
        street: 200,
        sport: 250,
        performance: 300,
        supercar: 350,
        hypercar: 400,
    },
    QUARTER_MILE: {
        street: 15.0,
        sport: 13.0,
        performance: 11.0,
        supercar: 10.0,
        hypercar: 9.0,
    },
} as const

// View Modes
export const VIEW_MODES = {
    '2d': {
        name: 'Vista 2D',
        icon: 'Square',
        description: 'Vista técnica bidimensional',
    },
    '3d': {
        name: 'Vista 3D',
        icon: 'Box',
        description: 'Modelo 3D interactivo',
    },
    blueprint: {
        name: 'Plano',
        icon: 'FileText',
        description: 'Vista estilo blueprint',
    },
    exploded: {
        name: 'Explosionada',
        icon: 'Layers',
        description: 'Vista de componentes separados',
    },
} as const

// Navigation Items
export const NAV_ITEMS = [
    { path: '/', label: 'Inicio', icon: 'Home' },
    { path: '/garage', label: 'Garage', icon: 'Warehouse' },
    { path: '/catalog', label: 'Catálogo', icon: 'Package' },
    { path: '/community', label: 'Comunidad', icon: 'Users' },
    { path: '/settings', label: 'Ajustes', icon: 'Settings' },
] as const

// Local Storage Keys
export const STORAGE_KEYS = {
    USER: 'torres_mse_user',
    SETTINGS: 'torres_mse_settings',
    GARAGE_STATE: 'torres_mse_garage',
    CURRENT_BUILD: 'torres_mse_build',
    THEME: 'torres_mse_theme',
} as const
