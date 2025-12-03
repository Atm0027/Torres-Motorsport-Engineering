// ============================================
// TORRES MOTORSPORT ENGINEERING - CORE TYPES
// ============================================

// Vehicle Types
export type DrivetrainType = 'FWD' | 'RWD' | 'AWD' | '4WD'
export type EngineLayout = 'front' | 'mid' | 'rear'
export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'hydrogen'
export type TransmissionType = 'manual' | 'automatic' | 'dct' | 'cvt' | 'sequential'
export type BodyStyle = 'sedan' | 'coupe' | 'hatchback' | 'wagon' | 'suv' | 'truck' | 'convertible' | 'supercar'

// Part Categories
export type PartCategory =
    | 'engine'
    | 'turbo'
    | 'supercharger'
    | 'exhaust'
    | 'intake'
    | 'ecu'
    | 'electronics'
    | 'transmission'
    | 'clutch'
    | 'differential'
    | 'driveshaft'
    | 'suspension'
    | 'chassis'
    | 'brakes'
    | 'wheels'
    | 'tires'
    | 'bodykit'
    | 'aero'
    | 'exterior'
    | 'lighting'
    | 'interior'
    | 'seats'
    | 'safety'
    | 'gauges'
    | 'fuel'
    | 'cooling'
    | 'nitrous'

// Compatibility Types
export type MountType = 'inline4' | 'inline6' | 'v6' | 'v8' | 'v10' | 'v12' | 'flat4' | 'flat6' | 'rotary' | 'electric'
export type BoltPattern = '4x100' | '4x108' | '4x114.3' | '5x100' | '5x108' | '5x112' | '5x114.3' | '5x115' | '5x120' | '5x130'

export interface CompatibilityRules {
    mountTypes: MountType[]
    drivetrains: DrivetrainType[]
    engineLayouts: EngineLayout[]
    minEngineBaySize?: number // in liters
    requiredClearance?: number // in mm
    maxWeight?: number // in kg
    boltPatterns?: BoltPattern[]
    requiredParts?: string[] // part IDs that must be installed
    conflictingParts?: string[] // part IDs that cannot coexist
}

// Performance Metrics
export interface PerformanceMetrics {
    horsepower: number
    torque: number // Nm
    weight: number // kg
    powerToWeight: number // hp/ton
    zeroToSixty: number // seconds
    zeroToHundred: number // seconds (0-100 km/h)
    quarterMile: number // seconds
    topSpeed: number // km/h
    brakingDistance: number // meters (100-0 km/h)
    lateralG: number // g-forces in cornering
    downforce: number // kg at top speed
    dragCoefficient: number
    fuelConsumption: number // L/100km
    efficiency: number // percentage
}

// Physics Calculations
export interface PhysicsConfig {
    airDensity: number // kg/m³
    rollingResistance: number
    drivetrainLoss: number // percentage
    mechanicalGrip: number
    aeroBalance: number // front/rear percentage
}

// Part Definition
export interface Part {
    id: string
    name: string
    brand: string
    category: PartCategory
    price: number
    weight: number // kg
    compatibility: CompatibilityRules
    stats: PartStats
    description: string
    imageUrl?: string
    modelUrl?: string // 3D model URL
}

export interface PartStats {
    // Engine stats
    horsepowerAdd?: number
    horsepowerMultiplier?: number
    torqueAdd?: number
    torqueMultiplier?: number
    revLimit?: number

    // Forced induction
    boostPressure?: number // bar
    boostEfficiency?: number

    // Drivetrain stats
    gearRatios?: number[]
    finalDrive?: number
    clutchCapacity?: number
    limitedSlipRatio?: number

    // Suspension stats
    springRate?: number
    dampingRate?: number
    rideHeight?: number
    camber?: number
    toe?: number
    antiRollBar?: number

    // Brakes stats
    brakingPower?: number
    brakeBalance?: number // front percentage
    heatResistance?: number

    // Wheel/Tire stats
    wheelSize?: number
    wheelWidth?: number
    tireGrip?: number
    tireCompound?: 'street' | 'sport' | 'semi-slick' | 'slick' | 'rain'

    // Aero stats
    downforceAdd?: number
    dragReduction?: number
    aeroBalance?: number

    // Other modifiers
    weightReduction?: number
    fuelCapacity?: number
    coolingEfficiency?: number
    nitrousCapacity?: number
    nitrousPower?: number
}

// Vehicle Definition
export interface Vehicle {
    id: string
    name: string
    manufacturer: string
    year: number
    bodyStyle: BodyStyle
    basePrice: number

    // Base specifications
    baseSpecs: BaseVehicleSpecs

    // Current installed parts
    installedParts: InstalledPart[]

    // Calculated current metrics
    currentMetrics: PerformanceMetrics

    // Visual customization
    livery: LiveryConfig

    // Metadata
    imageUrl?: string
    modelUrl?: string
}

export interface BaseVehicleSpecs {
    engine: {
        type: MountType
        displacement: number // liters
        cylinders: number
        naturallyAspirated: boolean
        baseHorsepower: number
        baseTorque: number
        redline: number
    }
    drivetrain: DrivetrainType
    engineLayout: EngineLayout
    transmission: {
        type: TransmissionType
        gears: number
    }
    weight: number
    wheelbase: number // mm
    trackWidth: number // mm
    engineBaySize: number // liters
    boltPattern: BoltPattern
    fuelCapacity: number // liters
    dragCoefficient: number
}

export interface InstalledPart {
    part: Part
    installedAt: Date
    tuningSettings?: TuningSettings
}

export interface TuningSettings {
    // ECU tuning
    fuelMap?: number // percentage adjustment
    ignitionTiming?: number // degrees
    boostTarget?: number // bar
    revLimiter?: number
    launchControl?: number

    // Suspension tuning
    frontSpringRate?: number
    rearSpringRate?: number
    frontDamping?: number
    rearDamping?: number
    frontRideHeight?: number
    rearRideHeight?: number
    frontCamber?: number
    rearCamber?: number
    frontToe?: number
    rearToe?: number

    // Differential tuning
    accelLock?: number
    decelLock?: number

    // Brake tuning
    brakeBias?: number
    brakePressure?: number

    // Aero tuning
    frontDownforce?: number
    rearDownforce?: number

    // Gear ratios (if adjustable)
    gearRatios?: number[]
    finalDrive?: number
}

export interface LiveryConfig {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    decals: Decal[]
    paintFinish: 'matte' | 'gloss' | 'metallic' | 'pearl' | 'chrome' | 'carbon'
    patternId?: string
}

export interface Decal {
    id: string
    imageUrl: string
    position: { x: number; y: number; z: number }
    rotation: { x: number; y: number; z: number }
    scale: { x: number; y: number }
    layer: number
}

// User/Player Types
export interface User {
    id: string
    username: string
    email: string
    avatar?: string
    createdAt: Date

    // Currency
    currency: number
    premiumCurrency: number

    // Inventory
    ownedVehicles: string[] // Vehicle IDs
    ownedParts: string[] // Part IDs

    // Achievements
    achievements: Achievement[]

    // Statistics
    stats: UserStats

    // Social
    friends: string[] // User IDs
    teamId?: string
}

export interface UserStats {
    totalBuilds: number
    racesWon: number
    racesLost: number
    challengesCompleted: number
    partsInstalled: number
    moneyEarned: number
    moneySpent: number
    playTime: number // minutes
    highestHorsepower: number
    fastestQuarterMile: number
    bestTopSpeed: number
}

export interface Achievement {
    id: string
    name: string
    description: string
    icon: string
    category: 'bronze' | 'silver' | 'gold' | 'platinum'
    unlockedAt?: Date
    progress: number
    maxProgress: number
    reward: {
        experience?: number
        currency?: number
        partId?: string
        vehicleId?: string
        cosmeticId?: string
    }
}

// Community Types

// Vehicle restrictions for events and leaderboards
export interface VehicleRestrictions {
    maxHorsepower?: number
    maxWeight?: number
    minWeight?: number
    allowedDrivetrains?: DrivetrainType[]
    allowedBodyStyles?: BodyStyle[]
    maxBudget?: number
    requiredParts?: string[]
    bannedParts?: string[]
}

export interface Build {
    id: string
    userId: string
    username: string
    vehicleId: string
    name: string
    description: string
    parts: string[] // Part IDs
    tuning: TuningSettings
    livery: LiveryConfig
    metrics: PerformanceMetrics
    screenshots: string[]
    createdAt: Date
    updatedAt: Date
    likes: number
    downloads: number
    comments: Comment[]
    tags: string[]
    featured: boolean
}

export interface Comment {
    id: string
    userId: string
    username: string
    content: string
    createdAt: Date
    likes: number
}

export interface Leaderboard {
    id: string
    name: string
    type: 'horsepower' | 'acceleration' | 'topSpeed' | 'efficiency' | 'quarterMile' | 'custom'
    entries: LeaderboardEntry[]
    restrictions?: VehicleRestrictions
    resetPeriod?: 'daily' | 'weekly' | 'monthly' | 'never'
}

export interface LeaderboardEntry {
    rank: number
    userId: string
    username: string
    value: number
    vehicleName: string
    buildId: string
    achievedAt: Date
}

// Event Types
export interface CommunityEvent {
    id: string
    name: string
    description: string
    type: 'competition' | 'challenge' | 'showcase'
    startDate: Date
    endDate: Date
    rules: string[]
    restrictions: VehicleRestrictions
    prizes: EventPrize[]
    participants: string[] // User IDs
    leaderboardId: string
}

export interface EventPrize {
    rank: number | [number, number] // Single rank or range
    currency?: number
    premiumCurrency?: number
    partIds?: string[]
    vehicleId?: string
    cosmeticIds?: string[]
    title?: string
}

// Tipos de acabado para la pintura
export type FinishType = 'gloss' | 'matte' | 'satin' | 'metallic' | 'pearl' | 'chrome'

// Vehicle Colors for 3D Model
export interface VehicleColors {
    body: string
    wheels: string
    calipers: string
    interior: string
    accents: string
    aero: string
    lights: string
}

// Acabados por zona
export interface VehicleFinishes {
    body: FinishType
    wheels: FinishType
    calipers: FinishType
    interior: FinishType
    accents: FinishType
    aero: FinishType
    lights: FinishType
}

export const DEFAULT_VEHICLE_COLORS: VehicleColors = {
    body: '#1a1a2e',
    wheels: '#4a4a4a',
    calipers: '#dc2626',
    interior: '#1a1a2e',
    accents: '#00d4ff',
    aero: '#1a1a2e',
    lights: '#ffffff',
}

export const DEFAULT_VEHICLE_FINISHES: VehicleFinishes = {
    body: 'gloss',
    wheels: 'gloss',
    calipers: 'gloss',
    interior: 'matte',
    accents: 'metallic',
    aero: 'matte',
    lights: 'gloss',
}

// UI State Types
export interface GarageState {
    currentVehicle: Vehicle | null
    selectedPart: Part | null
    viewMode: 'technical' | '3d' | 'blueprint'
    selectedSystem: PartCategory | null
    compareMode: boolean
    compareVehicle: Vehicle | null
    savedBuilds: SavedBuild[]
    vehicleColors: VehicleColors
    vehicleFinishes: VehicleFinishes
}

// Saved Build for user's creations
export interface SavedBuild {
    id: string
    name: string
    vehicleId: string
    vehicleName: string
    manufacturer: string
    year: number
    imageUrl?: string
    installedParts: InstalledPart[]
    metrics: PerformanceMetrics
    livery?: LiveryConfig
    savedAt: Date
}

export interface UIState {
    sidebarCollapsed: boolean
    activePanel: string | null
    notifications: Notification[]
    modalStack: string[]
    theme: 'dark' | 'blueprint' | 'racing'
}

export interface Notification {
    id: string
    type: 'success' | 'error' | 'warning' | 'info' | 'achievement'
    title: string
    message: string
    duration?: number
    action?: {
        label: string
        onClick: () => void
    }
}

// ============================================
// 3D/2D RENDERING TYPES
// ============================================

export type PaintFinish = 'metallic' | 'matte' | 'gloss' | 'pearl' | 'chrome' | 'carbon' | 'satin'

export interface VehicleModelConfig {
    id: string
    name: string
    manufacturer: string
    year: number
    dimensions: {
        length: number  // mm
        width: number   // mm
        height: number  // mm
        wheelbase: number // mm
    }
    modelUrl?: string  // URL to .glb base model
    blueprints?: {
        full?: string   // Complete blueprint with all views
        side?: string
        front?: string
        rear?: string
        top?: string
    }
    slots: Record<string, PartSlotConfig>
    defaultColors: {
        body: string
        interior: string
        wheels: string
        calipers: string
    }
}

export interface PartSlotConfig {
    position: [number, number, number]  // x, y, z
    rotation: [number, number, number]  // x, y, z in radians
    scale?: [number, number, number]
    compatible?: string[]  // Part IDs that fit this slot
    boltPattern?: BoltPattern
    stockSize?: number  // For wheels
}

export interface PartModelConfig {
    id: string
    name: string
    category: PartCategory
    modelUrl: string  // URL to .glb model
    thumbnailUrl?: string
    variants?: PartModelVariant[]
    materials?: {
        paintable?: boolean
        colorSlots?: string[]  // Which parts accept color changes
    }
}

export interface PartModelVariant {
    id: string
    name: string
    modelUrl: string
    size?: number  // For wheels: 17, 18, 19, etc.
}

export interface VehicleRenderState {
    vehicleId: string
    modelConfig: VehicleModelConfig | null
    loadedParts: Record<string, LoadedPartInfo>
    materials: VehicleMaterials
    camera: CameraState
    environment: EnvironmentConfig
}

export interface LoadedPartInfo {
    slotName: string
    partId: string | null  // null = stock
    modelUrl: string | null
    isLoaded: boolean
}

export interface VehicleMaterials {
    body: {
        color: string
        finish: PaintFinish
        roughness: number
        metalness: number
    }
    accents: {
        color: string
    }
    wheels: {
        color: string
        finish: PaintFinish
    }
    calipers: {
        color: string
    }
    glass: {
        tint: number  // 0-1 opacity
    }
}

export interface CameraState {
    position: [number, number, number]
    target: [number, number, number]
    fov: number
    zoom: number
}

export interface EnvironmentConfig {
    preset: 'studio' | 'garage' | 'outdoor' | 'showroom'
    hdriUrl?: string
    ambientIntensity: number
    shadowIntensity: number
}

// Blueprint View Types
export interface BlueprintViewState {
    activeView: 'side' | 'front' | 'rear' | 'top'
    zoom: number
    panOffset: { x: number; y: number }
    showGrid: boolean
    showDimensions: boolean
    showAnnotations: boolean
    highlightedParts: string[]
}

export interface BlueprintAnnotation {
    id: string
    partId?: string
    position: { x: number; y: number }
    label: string
    description?: string
    type: 'dimension' | 'part' | 'note'
}

// Types are already exported inline above
