// ============================================
// TORRES MOTORSPORT ENGINEERING - PARTS CATALOG
// ============================================

import type { Part } from '@/types'

export const partsCatalog: Part[] = [
    // ===============================
    // ENGINES
    // ===============================
    {
        id: 'engine-rb26dett-nismo',
        name: 'RB26DETT N1 Spec',
        brand: 'NISMO',
        category: 'engine',
        price: 45000,
        weight: 265,
        unlockLevel: 25,
        description: 'El legendario motor RB26DETT en especificación N1 con bloque reforzado, pistones forjados y cigüeñal balanceado.',
        compatibility: {
            mountTypes: ['inline6'],
            drivetrains: ['AWD', 'RWD'],
            engineLayouts: ['front'],
            minEngineBaySize: 45,
        },
        stats: {
            horsepowerAdd: 120,
            horsepowerMultiplier: 1.0,
            torqueAdd: 100,
            revLimit: 9000,
        },
    },
    {
        id: 'engine-2jz-gte-vvti',
        name: '2JZ-GTE VVT-i',
        brand: 'Toyota',
        category: 'engine',
        price: 25000,
        weight: 250,
        unlockLevel: 15,
        description: 'Motor 2JZ-GTE con VVT-i, conocido por su increíble potencial de modificación y fiabilidad legendaria.',
        compatibility: {
            mountTypes: ['inline6'],
            drivetrains: ['RWD', 'AWD'],
            engineLayouts: ['front'],
            minEngineBaySize: 42,
        },
        stats: {
            horsepowerAdd: 80,
            horsepowerMultiplier: 1.0,
            torqueAdd: 90,
            revLimit: 8200,
        },
    },
    {
        id: 'engine-ls3-crate',
        name: 'LS3 6.2L V8 Crate',
        brand: 'GM Performance',
        category: 'engine',
        price: 18000,
        weight: 210,
        unlockLevel: 10,
        description: 'Motor LS3 de caja completo con 430hp de fábrica. Base perfecta para builds de alto rendimiento.',
        compatibility: {
            mountTypes: ['v8'],
            drivetrains: ['RWD', 'AWD'],
            engineLayouts: ['front'],
            minEngineBaySize: 50,
        },
        stats: {
            horsepowerAdd: 130,
            torqueAdd: 150,
            revLimit: 6600,
        },
    },

    // ===============================
    // TURBOS
    // ===============================
    {
        id: 'turbo-garrett-gtx3582r',
        name: 'GTX3582R Gen II',
        brand: 'Garrett',
        category: 'turbo',
        price: 3500,
        weight: 12,
        unlockLevel: 12,
        description: 'Turbo de alta eficiencia con compresor de rueda de palas forjadas. Spool rápido y potencia sostenida.',
        compatibility: {
            mountTypes: ['inline4', 'inline6', 'v6'],
            drivetrains: ['FWD', 'RWD', 'AWD'],
            engineLayouts: ['front', 'mid'],
        },
        stats: {
            horsepowerAdd: 180,
            torqueAdd: 150,
            boostPressure: 1.2,
            boostEfficiency: 0.78,
        },
    },
    {
        id: 'turbo-precision-6266',
        name: 'PT6266 CEA',
        brand: 'Precision Turbo',
        category: 'turbo',
        price: 4200,
        weight: 14,
        unlockLevel: 20,
        description: 'Turbo de competición con tecnología CEA para máximo flujo de aire y respuesta.',
        compatibility: {
            mountTypes: ['inline6', 'v6', 'v8'],
            drivetrains: ['RWD', 'AWD'],
            engineLayouts: ['front', 'mid'],
            minEngineBaySize: 40,
        },
        stats: {
            horsepowerAdd: 280,
            torqueAdd: 220,
            boostPressure: 1.8,
            boostEfficiency: 0.82,
        },
    },
    {
        id: 'turbo-borg-s366',
        name: 'S366 SX-E',
        brand: 'BorgWarner',
        category: 'turbo',
        price: 2200,
        weight: 10,
        unlockLevel: 8,
        description: 'Turbo versátil ideal para builds de calle con buen spool y potencia lineal.',
        compatibility: {
            mountTypes: ['inline4', 'inline6', 'v6', 'flat4'],
            drivetrains: ['FWD', 'RWD', 'AWD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            horsepowerAdd: 120,
            torqueAdd: 100,
            boostPressure: 0.9,
            boostEfficiency: 0.72,
        },
    },

    // ===============================
    // EXHAUST SYSTEMS
    // ===============================
    {
        id: 'exhaust-tomei-expreme',
        name: 'Expreme Ti Full',
        brand: 'Tomei',
        category: 'exhaust',
        price: 3800,
        weight: -8,
        unlockLevel: 10,
        description: 'Sistema de escape completo en titanio. Máximo flujo y sonido de competición.',
        compatibility: {
            mountTypes: ['inline4', 'inline6', 'flat4', 'flat6'],
            drivetrains: ['FWD', 'RWD', 'AWD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            horsepowerAdd: 25,
            torqueAdd: 15,
            weightReduction: 15,
        },
    },
    {
        id: 'exhaust-akrapovic-evolution',
        name: 'Evolution Line Titanium',
        brand: 'Akrapovič',
        category: 'exhaust',
        price: 6500,
        weight: -12,
        unlockLevel: 18,
        description: 'Sistema de escape de competición en titanio con colectores optimizados por CFD.',
        compatibility: {
            mountTypes: ['inline4', 'inline6', 'v6', 'v8', 'flat6'],
            drivetrains: ['FWD', 'RWD', 'AWD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            horsepowerAdd: 35,
            torqueAdd: 25,
            weightReduction: 20,
        },
    },
    {
        id: 'exhaust-hks-hipower',
        name: 'Hi-Power Spec-L II',
        brand: 'HKS',
        category: 'exhaust',
        price: 1800,
        weight: -5,
        unlockLevel: 5,
        description: 'Sistema catback de acero inoxidable con silenciador de alto flujo.',
        compatibility: {
            mountTypes: ['inline4', 'inline6', 'v6', 'flat4'],
            drivetrains: ['FWD', 'RWD', 'AWD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            horsepowerAdd: 15,
            torqueAdd: 10,
            weightReduction: 8,
        },
    },

    // ===============================
    // INTAKE SYSTEMS
    // ===============================
    {
        id: 'intake-aem-cold',
        name: 'Cold Air Intake System',
        brand: 'AEM',
        category: 'intake',
        price: 450,
        weight: 2,
        unlockLevel: 2,
        description: 'Sistema de admisión de aire frío con filtro de alto flujo y tubo mandrel-bent.',
        compatibility: {
            mountTypes: ['inline4', 'inline6', 'v6', 'v8', 'flat4', 'flat6'],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            horsepowerAdd: 12,
            torqueAdd: 8,
        },
    },
    {
        id: 'intake-gruppe-m-carbon',
        name: 'Carbon Fiber Ram Air',
        brand: 'GruppeM',
        category: 'intake',
        price: 2200,
        weight: -2,
        unlockLevel: 12,
        description: 'Sistema de admisión en fibra de carbono con efecto ram air a alta velocidad.',
        compatibility: {
            mountTypes: ['inline6', 'v6', 'v8', 'flat6'],
            drivetrains: ['RWD', 'AWD'],
            engineLayouts: ['front', 'mid'],
        },
        stats: {
            horsepowerAdd: 22,
            torqueAdd: 15,
            weightReduction: 3,
        },
    },

    // ===============================
    // ECU / ELECTRONICS
    // ===============================
    {
        id: 'ecu-haltech-elite-2500',
        name: 'Elite 2500',
        brand: 'Haltech',
        category: 'ecu',
        price: 2800,
        weight: 1,
        unlockLevel: 15,
        description: 'ECU standalone de alto rendimiento con control completo del motor y data logging.',
        compatibility: {
            mountTypes: ['inline4', 'inline6', 'v6', 'v8', 'flat4', 'flat6', 'rotary'],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            horsepowerMultiplier: 1.08,
            torqueMultiplier: 1.05,
        },
    },
    {
        id: 'ecu-motec-m150',
        name: 'M150 GPR',
        brand: 'MoTeC',
        category: 'ecu',
        price: 8500,
        weight: 1,
        unlockLevel: 25,
        description: 'La ECU de competición definitiva. Usada en campeonatos mundiales de rally y circuito.',
        compatibility: {
            mountTypes: ['inline4', 'inline6', 'v6', 'v8', 'flat4', 'flat6', 'rotary'],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            horsepowerMultiplier: 1.12,
            torqueMultiplier: 1.08,
        },
    },

    // ===============================
    // TRANSMISSION
    // ===============================
    {
        id: 'trans-holinger-rd6',
        name: 'RD6 Sequential',
        brand: 'Holinger',
        category: 'transmission',
        price: 18000,
        weight: 45,
        unlockLevel: 30,
        description: 'Caja secuencial de 6 velocidades de competición. Cambios en 50ms.',
        compatibility: {
            mountTypes: ['inline4', 'inline6', 'v6', 'v8'],
            drivetrains: ['RWD'],
            engineLayouts: ['front', 'mid'],
        },
        stats: {
            gearRatios: [3.07, 2.13, 1.59, 1.24, 1.00, 0.85],
            clutchCapacity: 1200,
        },
    },
    {
        id: 'trans-getrag-dcl600',
        name: 'DCL600 Dual Clutch',
        brand: 'GETRAG',
        category: 'transmission',
        price: 12000,
        weight: 78,
        unlockLevel: 20,
        description: 'Transmisión de doble embrague de 6 velocidades. Perfecta para uso en calle y circuito.',
        compatibility: {
            mountTypes: ['inline4', 'inline6', 'v6', 'v8'],
            drivetrains: ['RWD', 'AWD'],
            engineLayouts: ['front'],
        },
        stats: {
            gearRatios: [3.92, 2.41, 1.58, 1.19, 0.94, 0.76],
            clutchCapacity: 800,
        },
    },

    // ===============================
    // SUSPENSION
    // ===============================
    {
        id: 'sus-ohlins-road-track',
        name: 'Road & Track DFV',
        brand: 'Öhlins',
        category: 'suspension',
        price: 4500,
        weight: 25,
        unlockLevel: 12,
        description: 'Suspensión coilover con tecnología DFV para máximo control y confort.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            springRate: 10,
            dampingRate: 12,
            rideHeight: -35,
        },
    },
    {
        id: 'sus-kw-clubsport',
        name: 'Clubsport 3-Way',
        brand: 'KW Suspensions',
        category: 'suspension',
        price: 7200,
        weight: 28,
        unlockLevel: 18,
        description: 'Coilovers de 3 vías con ajuste independiente de bump, rebound y compresión.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            springRate: 14,
            dampingRate: 16,
            rideHeight: -45,
            camber: -2.5,
        },
    },
    {
        id: 'sus-bc-br-series',
        name: 'BR Series Coilovers',
        brand: 'BC Racing',
        category: 'suspension',
        price: 1200,
        weight: 22,
        unlockLevel: 3,
        description: 'Coilovers de entrada con 30 niveles de ajuste de amortiguación.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            springRate: 8,
            dampingRate: 8,
            rideHeight: -25,
        },
    },

    // ===============================
    // BRAKES
    // ===============================
    {
        id: 'brakes-brembo-gt',
        name: 'GT Big Brake Kit',
        brand: 'Brembo',
        category: 'brakes',
        price: 5500,
        weight: 8,
        unlockLevel: 10,
        description: 'Kit de frenos grandes con pinzas de 6 pistones y discos de 380mm.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            brakingPower: 1.35,
            brakeBalance: 58,
            heatResistance: 1.4,
        },
    },
    {
        id: 'brakes-ap-racing-radi-cal',
        name: 'Radi-CAL Pro 5000+',
        brand: 'AP Racing',
        category: 'brakes',
        price: 9500,
        weight: -5,
        unlockLevel: 22,
        description: 'Sistema de frenos de competición con pinzas monobloque de aluminio forjado.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['RWD', 'AWD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            brakingPower: 1.55,
            brakeBalance: 60,
            heatResistance: 1.8,
            weightReduction: 12,
        },
    },

    // ===============================
    // WHEELS
    // ===============================
    {
        id: 'wheels-volk-te37',
        name: 'TE37 Saga SL',
        brand: 'RAYS Volk Racing',
        category: 'wheels',
        price: 4800,
        weight: -8,
        unlockLevel: 8,
        description: 'Las legendarias TE37 en versión Super Lap. Forjadas en una pieza.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
            boltPatterns: ['5x100', '5x108', '5x112', '5x114.3', '5x120'],
        },
        stats: {
            wheelSize: 18,
            wheelWidth: 9.5,
            weightReduction: 12,
        },
    },
    {
        id: 'wheels-bbs-fi-r',
        name: 'FI-R Forged',
        brand: 'BBS',
        category: 'wheels',
        price: 8500,
        weight: -12,
        unlockLevel: 15,
        description: 'Llantas forjadas de competición con diseño aerodinámico optimizado.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD'],
            engineLayouts: ['front', 'mid', 'rear'],
            boltPatterns: ['5x112', '5x114.3', '5x120', '5x130'],
        },
        stats: {
            wheelSize: 19,
            wheelWidth: 10,
            weightReduction: 18,
        },
    },
    {
        id: 'wheels-enkei-rpf1',
        name: 'RPF1',
        brand: 'Enkei',
        category: 'wheels',
        price: 1800,
        weight: -4,
        unlockLevel: 4,
        description: 'Llantas de flujo MAT ligeras y resistentes. Favoritas del time attack.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
            boltPatterns: ['4x100', '4x108', '5x100', '5x112', '5x114.3'],
        },
        stats: {
            wheelSize: 17,
            wheelWidth: 8,
            weightReduction: 8,
        },
    },

    // ===============================
    // TIRES
    // ===============================
    {
        id: 'tires-michelin-ps4s',
        name: 'Pilot Sport 4S',
        brand: 'Michelin',
        category: 'tires',
        price: 1200,
        weight: 0,
        unlockLevel: 5,
        description: 'Neumáticos de ultra alto rendimiento para uso en calle y circuito ocasional.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            tireGrip: 1.15,
            tireCompound: 'sport',
        },
    },
    {
        id: 'tires-toyo-r888r',
        name: 'Proxes R888R',
        brand: 'Toyo',
        category: 'tires',
        price: 1600,
        weight: 0,
        unlockLevel: 10,
        description: 'Semi-slick de competición DOT. Máximo agarre en seco.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            tireGrip: 1.35,
            tireCompound: 'semi-slick',
        },
    },
    {
        id: 'tires-pirelli-slick',
        name: 'P Zero Trofeo RS',
        brand: 'Pirelli',
        category: 'tires',
        price: 2400,
        weight: 0,
        unlockLevel: 18,
        description: 'El neumático de circuito definitivo. Desarrollado con tecnología de F1.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['RWD', 'AWD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            tireGrip: 1.50,
            tireCompound: 'semi-slick',
        },
    },

    // ===============================
    // AERO
    // ===============================
    {
        id: 'aero-apr-gtc500',
        name: 'GTC-500 71" Wing',
        brand: 'APR Performance',
        category: 'aero',
        price: 2800,
        weight: 8,
        unlockLevel: 12,
        description: 'Alerón de fibra de carbono con perfil alar de competición y soporte de aluminio.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            downforceAdd: 180,
            aeroBalance: 65,
        },
    },
    {
        id: 'aero-voltex-gt-wing',
        name: 'Type 5 GT Wing',
        brand: 'Voltex',
        category: 'aero',
        price: 5500,
        weight: 6,
        unlockLevel: 20,
        description: 'El alerón GT más icónico del time attack japonés. Fibra de carbono seca.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            downforceAdd: 280,
            aeroBalance: 62,
            weightReduction: 2,
        },
    },
    {
        id: 'aero-splitter-carbon',
        name: 'Racing Splitter Kit',
        brand: 'Seibon Carbon',
        category: 'aero',
        price: 1200,
        weight: 4,
        unlockLevel: 6,
        description: 'Kit de splitter frontal y canards en fibra de carbono.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            downforceAdd: 80,
            dragReduction: 5,
            aeroBalance: 42,
        },
    },
    {
        id: 'aero-diffuser-carbon',
        name: 'Rear Diffuser Pro',
        brand: 'APR Performance',
        category: 'aero',
        price: 1800,
        weight: 5,
        unlockLevel: 10,
        description: 'Difusor trasero de fibra de carbono con aletas aerodinámicas.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            downforceAdd: 120,
            dragReduction: 8,
            aeroBalance: 35,
        },
    },

    // ===============================
    // BODYKIT
    // ===============================
    {
        id: 'bodykit-rocket-bunny',
        name: 'Wide Body Kit',
        brand: 'Rocket Bunny',
        category: 'bodykit',
        price: 8500,
        weight: 25,
        unlockLevel: 15,
        description: 'Kit de ensanchamiento completo con guardabarros, faldones y paragolpes.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            downforceAdd: 50,
            dragReduction: -5,
        },
    },
    {
        id: 'bodykit-liberty-walk',
        name: 'LB-Works Kit',
        brand: 'Liberty Walk',
        category: 'bodykit',
        price: 15000,
        weight: 30,
        unlockLevel: 25,
        description: 'Kit de carrocería premium con acabados en fibra de carbono seca.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            downforceAdd: 80,
            weightReduction: -10,
        },
    },
    {
        id: 'bodykit-varis-bumper',
        name: 'Racing Front Bumper',
        brand: 'Varis',
        category: 'bodykit',
        price: 3200,
        weight: 8,
        unlockLevel: 8,
        description: 'Paragolpes delantero de competición con tomas de aire integradas.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            downforceAdd: 30,
            dragReduction: 3,
        },
    },
    {
        id: 'bodykit-seibon-hood',
        name: 'Carbon Fiber Hood',
        brand: 'Seibon',
        category: 'bodykit',
        price: 1800,
        weight: -8,
        unlockLevel: 5,
        description: 'Capó de fibra de carbono con ventilación integrada.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            weightReduction: 15,
            coolingEfficiency: 10,
        },
    },

    // ===============================
    // EXTERIOR ACCESSORIES
    // ===============================
    {
        id: 'exterior-mirrors-carbon',
        name: 'Carbon Mirror Covers',
        brand: 'AutoTecknic',
        category: 'exterior',
        price: 450,
        weight: 0,
        unlockLevel: 2,
        description: 'Cubiertas de espejo en fibra de carbono genuina.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            weightReduction: 1,
        },
    },
    {
        id: 'exterior-spoiler-lip',
        name: 'Trunk Lip Spoiler',
        brand: 'Maxton Design',
        category: 'exterior',
        price: 280,
        weight: 2,
        unlockLevel: 1,
        description: 'Spoiler de labio para maletero en ABS de alta calidad.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            downforceAdd: 15,
        },
    },
    {
        id: 'exterior-grille-mesh',
        name: 'Racing Mesh Grille',
        brand: 'GrillCraft',
        category: 'exterior',
        price: 350,
        weight: 1,
        unlockLevel: 3,
        description: 'Rejilla de malla de aluminio estilo racing.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            coolingEfficiency: 5,
        },
    },
    {
        id: 'exterior-tow-hook',
        name: 'Racing Tow Hook',
        brand: 'Cusco',
        category: 'exterior',
        price: 85,
        weight: 0.5,
        unlockLevel: 1,
        description: 'Gancho de remolque de competición en aluminio anodizado.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {},
    },

    // ===============================
    // LIGHTING
    // ===============================
    {
        id: 'lighting-headlights-led',
        name: 'LED Projector Headlights',
        brand: 'Spec-D',
        category: 'lighting',
        price: 650,
        weight: 3,
        unlockLevel: 4,
        description: 'Faros LED con proyector y DRL integrado.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {},
    },
    {
        id: 'lighting-taillights-sequential',
        name: 'Sequential LED Taillights',
        brand: 'Valenti',
        category: 'lighting',
        price: 890,
        weight: 2,
        unlockLevel: 6,
        description: 'Pilotos traseros LED con intermitente secuencial.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {},
    },
    {
        id: 'lighting-underglow-rgb',
        name: 'RGB Underglow Kit',
        brand: 'LEDGlow',
        category: 'lighting',
        price: 250,
        weight: 1,
        unlockLevel: 2,
        description: 'Kit de iluminación LED RGB con control por app.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {},
    },
    {
        id: 'lighting-foglights-yellow',
        name: 'JDM Yellow Fog Lights',
        brand: 'Morimoto',
        category: 'lighting',
        price: 320,
        weight: 1,
        unlockLevel: 3,
        description: 'Faros antiniebla amarillos estilo JDM con kit completo.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {},
    },

    // ===============================
    // INTERIOR GENERAL
    // ===============================
    {
        id: 'interior-steering-wheel',
        name: 'Deep Dish Steering Wheel',
        brand: 'Nardi',
        category: 'interior',
        price: 450,
        weight: 1,
        unlockLevel: 3,
        description: 'Volante deportivo de 350mm con plato hondo y gamuza.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            weightReduction: 2,
        },
    },
    {
        id: 'interior-shift-knob',
        name: 'Weighted Shift Knob',
        brand: 'Tomei',
        category: 'interior',
        price: 120,
        weight: 0.3,
        unlockLevel: 1,
        description: 'Pomo de cambio lastrado en aluminio con grabado.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {},
    },
    {
        id: 'interior-quick-release',
        name: 'Quick Release Hub',
        brand: 'NRG',
        category: 'interior',
        price: 180,
        weight: 0.5,
        unlockLevel: 4,
        description: 'Sistema de desconexión rápida del volante.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {},
    },
    {
        id: 'interior-floor-mats',
        name: 'Racing Floor Mats',
        brand: 'Bride',
        category: 'interior',
        price: 150,
        weight: 1,
        unlockLevel: 1,
        description: 'Alfombrillas de competición con talón de aluminio.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {},
    },

    // ===============================
    // SEATS
    // ===============================
    {
        id: 'seats-bride-zeta',
        name: 'ZETA III Bucket Seat',
        brand: 'Bride',
        category: 'seats',
        price: 1800,
        weight: 7,
        unlockLevel: 8,
        description: 'Asiento bucket de fibra de vidrio con certificación FIA.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            weightReduction: 8,
        },
    },
    {
        id: 'seats-recaro-sportster',
        name: 'Sportster GT',
        brand: 'Recaro',
        category: 'seats',
        price: 2200,
        weight: 10,
        unlockLevel: 10,
        description: 'Asiento deportivo reclinable con airbag lateral integrado.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            weightReduction: 5,
        },
    },
    {
        id: 'seats-sparco-rev',
        name: 'REV QRT Carbon',
        brand: 'Sparco',
        category: 'seats',
        price: 3500,
        weight: 5,
        unlockLevel: 18,
        description: 'Asiento de competición en fibra de carbono con homologación FIA 8862.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            weightReduction: 15,
        },
    },
    {
        id: 'seats-omp-prototipo',
        name: 'Prototipo Seat',
        brand: 'OMP',
        category: 'seats',
        price: 1200,
        weight: 9,
        unlockLevel: 5,
        description: 'Asiento semi-bucket económico con gran soporte lateral.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            weightReduction: 4,
        },
    },

    // ===============================
    // SAFETY
    // ===============================
    {
        id: 'safety-harness-takata',
        name: '6-Point Racing Harness',
        brand: 'Takata',
        category: 'safety',
        price: 650,
        weight: 2,
        unlockLevel: 6,
        description: 'Arnés de 6 puntos homologado FIA con cierre por leva.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {},
    },
    {
        id: 'safety-rollcage-cusco',
        name: 'Safety 21 Roll Cage',
        brand: 'Cusco',
        category: 'safety',
        price: 3200,
        weight: 45,
        unlockLevel: 15,
        description: 'Jaula antivuelco de 8 puntos en acero cromoly.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {
            weightReduction: -35,
        },
    },
    {
        id: 'safety-extinguisher',
        name: 'Fire Extinguisher System',
        brand: 'Lifeline',
        category: 'safety',
        price: 850,
        weight: 5,
        unlockLevel: 10,
        description: 'Sistema de extinción automático de 4L AFFF.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {},
    },
    {
        id: 'safety-harness-bar',
        name: 'Harness Bar',
        brand: 'Cipher Auto',
        category: 'safety',
        price: 280,
        weight: 8,
        unlockLevel: 4,
        description: 'Barra de anclaje para arneses de competición.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {},
    },

    // ===============================
    // GAUGES
    // ===============================
    {
        id: 'gauges-defi-advance',
        name: 'Advance BF Series',
        brand: 'Defi',
        category: 'gauges',
        price: 350,
        weight: 0.5,
        unlockLevel: 4,
        description: 'Set de 3 relojes: turbo, temperatura de aceite y presión.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {},
    },
    {
        id: 'gauges-aem-wideband',
        name: 'X-Series Wideband',
        brand: 'AEM',
        category: 'gauges',
        price: 280,
        weight: 0.3,
        unlockLevel: 6,
        description: 'Reloj de mezcla aire/combustible con sonda O2 wideband.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {},
    },
    {
        id: 'gauges-stack-dash',
        name: 'ST8100 Digital Dash',
        brand: 'Stack',
        category: 'gauges',
        price: 1800,
        weight: 1,
        unlockLevel: 15,
        description: 'Display digital de competición con datalogger integrado.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {},
    },
    {
        id: 'gauges-hks-turbo-timer',
        name: 'Turbo Timer Type-0',
        brand: 'HKS',
        category: 'gauges',
        price: 180,
        weight: 0.2,
        unlockLevel: 3,
        description: 'Temporizador de turbo con pantalla OLED.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid', 'rear'],
        },
        stats: {},
    },

    // ===============================
    // COOLING
    // ===============================
    {
        id: 'cooling-mishimoto-racing',
        name: 'Performance Radiator',
        brand: 'Mishimoto',
        category: 'cooling',
        price: 650,
        weight: 5,
        unlockLevel: 4,
        description: 'Radiador de aluminio de alto rendimiento con núcleo de 56mm.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD', '4WD'],
            engineLayouts: ['front', 'mid'],
        },
        stats: {
            coolingEfficiency: 1.3,
        },
    },
    {
        id: 'cooling-csf-racing',
        name: 'High Performance Racing',
        brand: 'CSF',
        category: 'cooling',
        price: 1200,
        weight: 6,
        unlockLevel: 10,
        description: 'Radiador de competición con diseño B-Tube para máxima eficiencia.',
        compatibility: {
            mountTypes: [],
            drivetrains: ['FWD', 'RWD', 'AWD'],
            engineLayouts: ['front', 'mid'],
        },
        stats: {
            coolingEfficiency: 1.5,
            horsepowerMultiplier: 1.02,
        },
    },

    // ===============================
    // NITROUS
    // ===============================
    {
        id: 'nitrous-nos-cheater',
        name: 'Cheater System 150hp',
        brand: 'NOS',
        category: 'nitrous',
        price: 1500,
        weight: 15,
        unlockLevel: 8,
        description: 'Sistema de óxido nitroso de 150hp con kit completo de instalación.',
        compatibility: {
            mountTypes: ['inline4', 'inline6', 'v6', 'v8'],
            drivetrains: ['FWD', 'RWD', 'AWD'],
            engineLayouts: ['front', 'mid'],
        },
        stats: {
            nitrousCapacity: 10,
            nitrousPower: 150,
        },
    },
    {
        id: 'nitrous-zex-blackout',
        name: 'Blackout 300hp',
        brand: 'ZEX',
        category: 'nitrous',
        price: 2800,
        weight: 20,
        unlockLevel: 15,
        description: 'Sistema de nitroso de alto rendimiento con inyección directa.',
        compatibility: {
            mountTypes: ['inline6', 'v6', 'v8'],
            drivetrains: ['RWD', 'AWD'],
            engineLayouts: ['front', 'mid'],
            requiredParts: ['ecu-haltech-elite-2500'],
        },
        stats: {
            nitrousCapacity: 15,
            nitrousPower: 300,
        },
    },
]

export default partsCatalog
