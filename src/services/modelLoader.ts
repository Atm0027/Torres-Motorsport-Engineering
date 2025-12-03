// ============================================
// VEHICLE MODEL LOADER SERVICE
// ============================================
// This service handles loading and caching of vehicle 3D models and blueprints

import type {
    VehicleModelConfig,
    PartModelConfig,
    PartSlotConfig,
    Vehicle
} from '@/types'

// Model configurations for each vehicle
// These will be populated when actual models are provided
const vehicleModelConfigs: Record<string, VehicleModelConfig> = {
    'nissan-skyline-r34': {
        id: 'nissan-skyline-r34',
        name: 'Skyline R34 GT-R',
        manufacturer: 'Nissan',
        year: 1999,
        dimensions: {
            length: 4600,
            width: 1785,
            height: 1360,
            wheelbase: 2665
        },
        modelUrl: '/models/vehicles/nissan-skyline-r34/base.glb',
        blueprints: {
            side: '/blueprints/nissan-skyline-r34/side.svg',
            front: '/blueprints/nissan-skyline-r34/front.svg',
            rear: '/blueprints/nissan-skyline-r34/rear.svg',
            top: '/blueprints/nissan-skyline-r34/top.svg'
        },
        slots: {
            'body_front_bumper': {
                position: [0, 0.15, 2.2],
                rotation: [0, 0, 0],
                compatible: ['bodykit-varis-bumper', 'bodykit-rocket-bunny', 'bodykit-liberty-walk']
            },
            'body_rear_bumper': {
                position: [0, 0.15, -2.1],
                rotation: [0, Math.PI, 0],
                compatible: ['bodykit-rocket-bunny', 'bodykit-liberty-walk']
            },
            'body_hood': {
                position: [0, 0.8, 1.5],
                rotation: [0, 0, 0],
                compatible: ['bodykit-seibon-hood']
            },
            'aero_wing': {
                position: [0, 1.36, -2.0],
                rotation: [0, 0, 0],
                compatible: ['aero-apr-gtc500', 'aero-voltex-gt-wing']
            },
            'aero_splitter': {
                position: [0, 0.1, 2.3],
                rotation: [0, 0, 0],
                compatible: ['aero-splitter-carbon']
            },
            'aero_diffuser': {
                position: [0, 0.1, -2.2],
                rotation: [0, Math.PI, 0],
                compatible: ['aero-diffuser-carbon']
            },
            'wheel_fl': {
                position: [-0.79, 0.33, 1.33],
                rotation: [0, 0, 0],
                boltPattern: '5x114.3',
                stockSize: 18
            },
            'wheel_fr': {
                position: [0.79, 0.33, 1.33],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x114.3',
                stockSize: 18
            },
            'wheel_rl': {
                position: [-0.79, 0.33, -1.33],
                rotation: [0, 0, 0],
                boltPattern: '5x114.3',
                stockSize: 18
            },
            'wheel_rr': {
                position: [0.79, 0.33, -1.33],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x114.3',
                stockSize: 18
            }
        },
        defaultColors: {
            body: '#1a365d',
            interior: '#1e293b',
            wheels: '#18181b',
            calipers: '#dc2626'
        }
    },
    'toyota-supra-a80': {
        id: 'toyota-supra-a80',
        name: 'Supra A80',
        manufacturer: 'Toyota',
        year: 1993,
        dimensions: {
            length: 4514,
            width: 1810,
            height: 1275,
            wheelbase: 2550
        },
        modelUrl: '/models/vehicles/toyota-supra-a80/base.glb',
        blueprints: {
            side: '/blueprints/toyota-supra-a80/side.svg',
            front: '/blueprints/toyota-supra-a80/front.svg',
            rear: '/blueprints/toyota-supra-a80/rear.svg',
            top: '/blueprints/toyota-supra-a80/top.svg'
        },
        slots: {
            'body_front_bumper': {
                position: [0, 0.15, 2.25],
                rotation: [0, 0, 0],
                compatible: ['bodykit-varis-bumper', 'bodykit-rocket-bunny', 'bodykit-liberty-walk']
            },
            'body_rear_bumper': {
                position: [0, 0.15, -2.1],
                rotation: [0, Math.PI, 0],
                compatible: ['bodykit-rocket-bunny', 'bodykit-liberty-walk']
            },
            'aero_wing': {
                position: [0, 1.28, -2.0],
                rotation: [0, 0, 0],
                compatible: ['aero-apr-gtc500', 'aero-voltex-gt-wing']
            },
            'wheel_fl': {
                position: [-0.81, 0.33, 1.28],
                rotation: [0, 0, 0],
                boltPattern: '5x114.3',
                stockSize: 17
            },
            'wheel_fr': {
                position: [0.81, 0.33, 1.28],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x114.3',
                stockSize: 17
            },
            'wheel_rl': {
                position: [-0.81, 0.33, -1.27],
                rotation: [0, 0, 0],
                boltPattern: '5x114.3',
                stockSize: 17
            },
            'wheel_rr': {
                position: [0.81, 0.33, -1.27],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x114.3',
                stockSize: 17
            }
        },
        defaultColors: {
            body: '#dc2626',
            interior: '#1e293b',
            wheels: '#18181b',
            calipers: '#dc2626'
        }
    },
    'mazda-rx7-fd': {
        id: 'mazda-rx7-fd',
        name: 'RX-7 FD',
        manufacturer: 'Mazda',
        year: 1992,
        dimensions: {
            length: 4295,
            width: 1760,
            height: 1230,
            wheelbase: 2425
        },
        modelUrl: '/models/vehicles/mazda-rx7-fd/base.glb',
        blueprints: {
            side: '/blueprints/mazda-rx7-fd/side.svg',
            front: '/blueprints/mazda-rx7-fd/front.svg',
            rear: '/blueprints/mazda-rx7-fd/rear.svg',
            top: '/blueprints/mazda-rx7-fd/top.svg'
        },
        slots: {
            'body_front_bumper': {
                position: [0, 0.14, 2.1],
                rotation: [0, 0, 0],
                compatible: ['bodykit-varis-bumper', 'bodykit-rocket-bunny']
            },
            'aero_wing': {
                position: [0, 1.23, -1.9],
                rotation: [0, 0, 0],
                compatible: ['aero-apr-gtc500', 'aero-voltex-gt-wing']
            },
            'wheel_fl': {
                position: [-0.73, 0.31, 1.21],
                rotation: [0, 0, 0],
                boltPattern: '5x114.3',
                stockSize: 17
            },
            'wheel_fr': {
                position: [0.73, 0.31, 1.21],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x114.3',
                stockSize: 17
            },
            'wheel_rl': {
                position: [-0.73, 0.31, -1.21],
                rotation: [0, 0, 0],
                boltPattern: '5x114.3',
                stockSize: 17
            },
            'wheel_rr': {
                position: [0.73, 0.31, -1.21],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x114.3',
                stockSize: 17
            }
        },
        defaultColors: {
            body: '#fbbf24',
            interior: '#1e293b',
            wheels: '#18181b',
            calipers: '#dc2626'
        }
    },
    'honda-nsx': {
        id: 'honda-nsx',
        name: 'NSX NA1',
        manufacturer: 'Honda',
        year: 1990,
        dimensions: {
            length: 4490,
            width: 1940,
            height: 1215,
            wheelbase: 2630
        },
        modelUrl: '/models/vehicles/honda-nsx/base.glb',
        blueprints: {
            side: '/blueprints/honda-nsx/side.svg',
            front: '/blueprints/honda-nsx/front.svg',
            rear: '/blueprints/honda-nsx/rear.svg',
            top: '/blueprints/honda-nsx/top.svg'
        },
        slots: {
            'wheel_fl': {
                position: [-0.85, 0.33, 1.32],
                rotation: [0, 0, 0],
                boltPattern: '5x120',
                stockSize: 19
            },
            'wheel_fr': {
                position: [0.85, 0.33, 1.32],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x120',
                stockSize: 19
            },
            'wheel_rl': {
                position: [-0.85, 0.33, -1.30],
                rotation: [0, 0, 0],
                boltPattern: '5x120',
                stockSize: 20
            },
            'wheel_rr': {
                position: [0.85, 0.33, -1.30],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x120',
                stockSize: 20
            }
        },
        defaultColors: {
            body: '#dc2626',
            interior: '#1e293b',
            wheels: '#18181b',
            calipers: '#dc2626'
        }
    },
    'mitsubishi-evo-ix': {
        id: 'mitsubishi-evo-ix',
        name: 'Lancer Evolution IX',
        manufacturer: 'Mitsubishi',
        year: 2005,
        dimensions: {
            length: 4490,
            width: 1770,
            height: 1450,
            wheelbase: 2625
        },
        modelUrl: '/models/vehicles/mitsubishi-evo-ix/base.glb',
        blueprints: {
            side: '/blueprints/mitsubishi-evo-ix/side.svg',
            front: '/blueprints/mitsubishi-evo-ix/front.svg',
            rear: '/blueprints/mitsubishi-evo-ix/rear.svg',
            top: '/blueprints/mitsubishi-evo-ix/top.svg'
        },
        slots: {
            'aero_wing': {
                position: [0, 1.45, -2.1],
                rotation: [0, 0, 0],
                compatible: ['aero-apr-gtc500', 'aero-voltex-gt-wing']
            },
            'wheel_fl': {
                position: [-0.76, 0.33, 1.31],
                rotation: [0, 0, 0],
                boltPattern: '5x114.3',
                stockSize: 17
            },
            'wheel_fr': {
                position: [0.76, 0.33, 1.31],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x114.3',
                stockSize: 17
            },
            'wheel_rl': {
                position: [-0.76, 0.33, -1.31],
                rotation: [0, 0, 0],
                boltPattern: '5x114.3',
                stockSize: 17
            },
            'wheel_rr': {
                position: [0.76, 0.33, -1.31],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x114.3',
                stockSize: 17
            }
        },
        defaultColors: {
            body: '#ffffff',
            interior: '#1e293b',
            wheels: '#18181b',
            calipers: '#dc2626'
        }
    },
    'subaru-impreza-sti': {
        id: 'subaru-impreza-sti',
        name: 'Impreza WRX STI',
        manufacturer: 'Subaru',
        year: 2004,
        dimensions: {
            length: 4465,
            width: 1740,
            height: 1425,
            wheelbase: 2540
        },
        modelUrl: '/models/vehicles/subaru-impreza-sti/base.glb',
        blueprints: {
            side: '/blueprints/subaru-impreza-sti/side.svg',
            front: '/blueprints/subaru-impreza-sti/front.svg',
            rear: '/blueprints/subaru-impreza-sti/rear.svg',
            top: '/blueprints/subaru-impreza-sti/top.svg'
        },
        slots: {
            'aero_wing': {
                position: [0, 1.43, -2.0],
                rotation: [0, 0, 0],
                compatible: ['aero-apr-gtc500', 'aero-voltex-gt-wing']
            },
            'wheel_fl': {
                position: [-0.74, 0.33, 1.27],
                rotation: [0, 0, 0],
                boltPattern: '5x114.3',
                stockSize: 17
            },
            'wheel_fr': {
                position: [0.74, 0.33, 1.27],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x114.3',
                stockSize: 17
            },
            'wheel_rl': {
                position: [-0.74, 0.33, -1.27],
                rotation: [0, 0, 0],
                boltPattern: '5x114.3',
                stockSize: 17
            },
            'wheel_rr': {
                position: [0.74, 0.33, -1.27],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x114.3',
                stockSize: 17
            }
        },
        defaultColors: {
            body: '#2563eb',
            interior: '#1e293b',
            wheels: '#fbbf24',
            calipers: '#dc2626'
        }
    },
    // === EUROPEAN PERFORMANCE ===
    'bmw-m3-e46': {
        id: 'bmw-m3-e46',
        name: 'M3 CSL',
        manufacturer: 'BMW',
        year: 2003,
        dimensions: {
            length: 4492,
            width: 1780,
            height: 1365,
            wheelbase: 2731
        },
        modelUrl: '/models/vehicles/bmw-m3-e46/model.glb',
        blueprints: {
            side: '/blueprints/bmw-m3-e46/side.svg',
            front: '/blueprints/bmw-m3-e46/front.svg',
            rear: '/blueprints/bmw-m3-e46/rear.svg',
            top: '/blueprints/bmw-m3-e46/top.svg'
        },
        slots: {
            'body_front_bumper': {
                position: [0, 0.15, 2.25],
                rotation: [0, 0, 0],
                compatible: ['bodykit-varis-bumper', 'bodykit-liberty-walk']
            },
            'aero_wing': {
                position: [0, 1.35, -2.0],
                rotation: [0, 0, 0],
                compatible: ['aero-apr-gtc500', 'aero-voltex-gt-wing']
            },
            'wheel_fl': {
                position: [-0.78, 0.33, 1.37],
                rotation: [0, 0, 0],
                boltPattern: '5x120',
                stockSize: 19
            },
            'wheel_fr': {
                position: [0.78, 0.33, 1.37],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x120',
                stockSize: 19
            },
            'wheel_rl': {
                position: [-0.78, 0.33, -1.37],
                rotation: [0, 0, 0],
                boltPattern: '5x120',
                stockSize: 19
            },
            'wheel_rr': {
                position: [0.78, 0.33, -1.37],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x120',
                stockSize: 19
            }
        },
        defaultColors: {
            body: '#ffffff',
            interior: '#1e293b',
            wheels: '#18181b',
            calipers: '#dc2626'
        }
    },
    'porsche-911-gt3-997': {
        id: 'porsche-911-gt3-997',
        name: '911 GT3 RS',
        manufacturer: 'Porsche',
        year: 2010,
        dimensions: {
            length: 4460,
            width: 1852,
            height: 1280,
            wheelbase: 2355
        },
        modelUrl: '/models/vehicles/porsche-911-gt3-997/model.glb',
        blueprints: {
            side: '/blueprints/porsche-911-gt3-997/side.svg',
            front: '/blueprints/porsche-911-gt3-997/front.svg',
            rear: '/blueprints/porsche-911-gt3-997/rear.svg',
            top: '/blueprints/porsche-911-gt3-997/top.svg'
        },
        slots: {
            'aero_wing': {
                position: [0, 1.28, -1.8],
                rotation: [0, 0, 0],
                compatible: ['aero-apr-gtc500', 'aero-voltex-gt-wing']
            },
            'wheel_fl': {
                position: [-0.80, 0.31, 1.18],
                rotation: [0, 0, 0],
                boltPattern: '5x130',
                stockSize: 19
            },
            'wheel_fr': {
                position: [0.80, 0.31, 1.18],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x130',
                stockSize: 19
            },
            'wheel_rl': {
                position: [-0.82, 0.32, -1.18],
                rotation: [0, 0, 0],
                boltPattern: '5x130',
                stockSize: 19
            },
            'wheel_rr': {
                position: [0.82, 0.32, -1.18],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x130',
                stockSize: 19
            }
        },
        defaultColors: {
            body: '#22c55e',
            interior: '#1e293b',
            wheels: '#18181b',
            calipers: '#fbbf24'
        }
    },
    'mercedes-amg-gtr': {
        id: 'mercedes-amg-gtr',
        name: 'AMG GT R',
        manufacturer: 'Mercedes-Benz',
        year: 2017,
        dimensions: {
            length: 4551,
            width: 1999,
            height: 1284,
            wheelbase: 2630
        },
        modelUrl: '/models/vehicles/mercedes-amg-gtr/model.glb',
        blueprints: {
            side: '/blueprints/mercedes-amg-gtr/side.svg',
            front: '/blueprints/mercedes-amg-gtr/front.svg',
            rear: '/blueprints/mercedes-amg-gtr/rear.svg',
            top: '/blueprints/mercedes-amg-gtr/top.svg'
        },
        slots: {
            'aero_wing': {
                position: [0, 1.28, -2.1],
                rotation: [0, 0, 0],
                compatible: ['aero-apr-gtc500', 'aero-voltex-gt-wing']
            },
            'aero_diffuser': {
                position: [0, 0.1, -2.3],
                rotation: [0, Math.PI, 0],
                compatible: ['aero-diffuser-carbon']
            },
            'wheel_fl': {
                position: [-0.86, 0.33, 1.32],
                rotation: [0, 0, 0],
                boltPattern: '5x112',
                stockSize: 19
            },
            'wheel_fr': {
                position: [0.86, 0.33, 1.32],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x112',
                stockSize: 19
            },
            'wheel_rl': {
                position: [-0.88, 0.34, -1.30],
                rotation: [0, 0, 0],
                boltPattern: '5x112',
                stockSize: 20
            },
            'wheel_rr': {
                position: [0.88, 0.34, -1.30],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x112',
                stockSize: 20
            }
        },
        defaultColors: {
            body: '#16a34a',
            interior: '#1e293b',
            wheels: '#18181b',
            calipers: '#fbbf24'
        }
    },
    // === AMERICAN MUSCLE ===
    'ford-mustang-gt500': {
        id: 'ford-mustang-gt500',
        name: 'Shelby GT500',
        manufacturer: 'Ford',
        year: 2020,
        dimensions: {
            length: 4808,
            width: 1916,
            height: 1381,
            wheelbase: 2720
        },
        modelUrl: '/models/vehicles/ford-mustang-gt500/model.glb',
        blueprints: {
            side: '/blueprints/ford-mustang-gt500/side.svg',
            front: '/blueprints/ford-mustang-gt500/front.svg',
            rear: '/blueprints/ford-mustang-gt500/rear.svg',
            top: '/blueprints/ford-mustang-gt500/top.svg'
        },
        slots: {
            'body_front_bumper': {
                position: [0, 0.15, 2.4],
                rotation: [0, 0, 0],
                compatible: ['bodykit-liberty-walk']
            },
            'aero_wing': {
                position: [0, 1.38, -2.2],
                rotation: [0, 0, 0],
                compatible: ['aero-apr-gtc500', 'aero-voltex-gt-wing']
            },
            'wheel_fl': {
                position: [-0.83, 0.34, 1.36],
                rotation: [0, 0, 0],
                boltPattern: '5x114.3',
                stockSize: 20
            },
            'wheel_fr': {
                position: [0.83, 0.34, 1.36],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x114.3',
                stockSize: 20
            },
            'wheel_rl': {
                position: [-0.85, 0.35, -1.36],
                rotation: [0, 0, 0],
                boltPattern: '5x114.3',
                stockSize: 20
            },
            'wheel_rr': {
                position: [0.85, 0.35, -1.36],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x114.3',
                stockSize: 20
            }
        },
        defaultColors: {
            body: '#3b82f6',
            interior: '#1e293b',
            wheels: '#18181b',
            calipers: '#dc2626'
        }
    },
    'chevrolet-camaro-zl1': {
        id: 'chevrolet-camaro-zl1',
        name: 'Camaro ZL1 1LE',
        manufacturer: 'Chevrolet',
        year: 2019,
        dimensions: {
            length: 4783,
            width: 1897,
            height: 1348,
            wheelbase: 2811
        },
        modelUrl: '/models/vehicles/chevrolet-camaro-zl1/model.glb',
        blueprints: {
            side: '/blueprints/chevrolet-camaro-zl1/side.svg',
            front: '/blueprints/chevrolet-camaro-zl1/front.svg',
            rear: '/blueprints/chevrolet-camaro-zl1/rear.svg',
            top: '/blueprints/chevrolet-camaro-zl1/top.svg'
        },
        slots: {
            'body_front_bumper': {
                position: [0, 0.15, 2.35],
                rotation: [0, 0, 0],
                compatible: ['bodykit-liberty-walk']
            },
            'aero_wing': {
                position: [0, 1.35, -2.15],
                rotation: [0, 0, 0],
                compatible: ['aero-apr-gtc500', 'aero-voltex-gt-wing']
            },
            'wheel_fl': {
                position: [-0.82, 0.34, 1.41],
                rotation: [0, 0, 0],
                boltPattern: '5x120',
                stockSize: 20
            },
            'wheel_fr': {
                position: [0.82, 0.34, 1.41],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x120',
                stockSize: 20
            },
            'wheel_rl': {
                position: [-0.84, 0.35, -1.41],
                rotation: [0, 0, 0],
                boltPattern: '5x120',
                stockSize: 20
            },
            'wheel_rr': {
                position: [0.84, 0.35, -1.41],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x120',
                stockSize: 20
            }
        },
        defaultColors: {
            body: '#18181b',
            interior: '#1e293b',
            wheels: '#18181b',
            calipers: '#dc2626'
        }
    },
    'dodge-challenger-hellcat': {
        id: 'dodge-challenger-hellcat',
        name: 'Challenger Hellcat',
        manufacturer: 'Dodge',
        year: 2019,
        dimensions: {
            length: 5022,
            width: 1923,
            height: 1448,
            wheelbase: 2946
        },
        modelUrl: '/models/vehicles/dodge-challenger-hellcat/model.glb',
        blueprints: {
            side: '/blueprints/dodge-challenger-hellcat/side.svg',
            front: '/blueprints/dodge-challenger-hellcat/front.svg',
            rear: '/blueprints/dodge-challenger-hellcat/rear.svg',
            top: '/blueprints/dodge-challenger-hellcat/top.svg'
        },
        slots: {
            'body_front_bumper': {
                position: [0, 0.15, 2.5],
                rotation: [0, 0, 0],
                compatible: ['bodykit-liberty-walk']
            },
            'aero_wing': {
                position: [0, 1.45, -2.3],
                rotation: [0, 0, 0],
                compatible: ['aero-apr-gtc500', 'aero-voltex-gt-wing']
            },
            'wheel_fl': {
                position: [-0.85, 0.36, 1.47],
                rotation: [0, 0, 0],
                boltPattern: '5x115',
                stockSize: 20
            },
            'wheel_fr': {
                position: [0.85, 0.36, 1.47],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x115',
                stockSize: 20
            },
            'wheel_rl': {
                position: [-0.87, 0.37, -1.47],
                rotation: [0, 0, 0],
                boltPattern: '5x115',
                stockSize: 20
            },
            'wheel_rr': {
                position: [0.87, 0.37, -1.47],
                rotation: [0, Math.PI, 0],
                boltPattern: '5x115',
                stockSize: 20
            }
        },
        defaultColors: {
            body: '#c2410c',
            interior: '#1e293b',
            wheels: '#18181b',
            calipers: '#dc2626'
        }
    }
}

// Part model configurations
const partModelConfigs: Record<string, PartModelConfig> = {
    'bodykit-rocket-bunny': {
        id: 'bodykit-rocket-bunny',
        name: 'Wide Body Kit',
        category: 'bodykit',
        modelUrl: '/models/parts/bodykits/rocket-bunny/widebody.glb',
        thumbnailUrl: '/models/parts/bodykits/rocket-bunny/thumbnail.png',
        materials: {
            paintable: true,
            colorSlots: ['body', 'accents']
        }
    },
    'bodykit-liberty-walk': {
        id: 'bodykit-liberty-walk',
        name: 'LB-Works Kit',
        category: 'bodykit',
        modelUrl: '/models/parts/bodykits/liberty-walk/lbworks.glb',
        thumbnailUrl: '/models/parts/bodykits/liberty-walk/thumbnail.png',
        materials: {
            paintable: true,
            colorSlots: ['body']
        }
    },
    'aero-apr-gtc500': {
        id: 'aero-apr-gtc500',
        name: 'GTC-500 Wing',
        category: 'aero',
        modelUrl: '/models/parts/aero/apr-gtc500/wing.glb',
        thumbnailUrl: '/models/parts/aero/apr-gtc500/thumbnail.png',
        materials: {
            paintable: false
        }
    },
    'aero-voltex-gt-wing': {
        id: 'aero-voltex-gt-wing',
        name: 'Type 5 GT Wing',
        category: 'aero',
        modelUrl: '/models/parts/aero/voltex-gt-wing/wing.glb',
        thumbnailUrl: '/models/parts/aero/voltex-gt-wing/thumbnail.png',
        materials: {
            paintable: false
        }
    },
    'wheels-volk-te37': {
        id: 'wheels-volk-te37',
        name: 'TE37',
        category: 'wheels',
        modelUrl: '/models/parts/wheels/volk-te37/wheel.glb',
        thumbnailUrl: '/models/parts/wheels/volk-te37/thumbnail.png',
        variants: [
            { id: 'te37-17', name: '17"', modelUrl: '/models/parts/wheels/volk-te37/17inch.glb', size: 17 },
            { id: 'te37-18', name: '18"', modelUrl: '/models/parts/wheels/volk-te37/18inch.glb', size: 18 },
            { id: 'te37-19', name: '19"', modelUrl: '/models/parts/wheels/volk-te37/19inch.glb', size: 19 }
        ],
        materials: {
            paintable: true,
            colorSlots: ['wheels']
        }
    },
    'wheels-bbs-lm': {
        id: 'wheels-bbs-lm',
        name: 'LM',
        category: 'wheels',
        modelUrl: '/models/parts/wheels/bbs-lm/wheel.glb',
        thumbnailUrl: '/models/parts/wheels/bbs-lm/thumbnail.png',
        variants: [
            { id: 'lm-18', name: '18"', modelUrl: '/models/parts/wheels/bbs-lm/18inch.glb', size: 18 },
            { id: 'lm-19', name: '19"', modelUrl: '/models/parts/wheels/bbs-lm/19inch.glb', size: 19 },
            { id: 'lm-20', name: '20"', modelUrl: '/models/parts/wheels/bbs-lm/20inch.glb', size: 20 }
        ],
        materials: {
            paintable: true,
            colorSlots: ['wheels']
        }
    }
}

// Cache for loaded models
const modelCache: Map<string, unknown> = new Map()

/**
 * Get model configuration for a vehicle
 */
export function getVehicleModelConfig(vehicleId: string): VehicleModelConfig | null {
    return vehicleModelConfigs[vehicleId] || null
}

/**
 * Get model configuration for a part
 */
export function getPartModelConfig(partId: string): PartModelConfig | null {
    return partModelConfigs[partId] || null
}

/**
 * Get compatible parts for a specific slot on a vehicle
 */
export function getCompatiblePartsForSlot(vehicleId: string, slotName: string): string[] {
    const config = vehicleModelConfigs[vehicleId]
    if (!config || !config.slots[slotName]) return []
    return config.slots[slotName].compatible || []
}

/**
 * Check if a part is compatible with a slot
 */
export function isPartCompatibleWithSlot(vehicleId: string, slotName: string, partId: string): boolean {
    const compatible = getCompatiblePartsForSlot(vehicleId, slotName)
    return compatible.includes(partId)
}

/**
 * Get slot configuration for a vehicle
 */
export function getSlotConfig(vehicleId: string, slotName: string): PartSlotConfig | null {
    const config = vehicleModelConfigs[vehicleId]
    if (!config) return null
    return config.slots[slotName] || null
}

/**
 * Get all slot names for a vehicle
 */
export function getVehicleSlots(vehicleId: string): string[] {
    const config = vehicleModelConfigs[vehicleId]
    if (!config) return []
    return Object.keys(config.slots)
}

/**
 * Load and cache a 3D model (placeholder for actual implementation)
 * In production, this would use Three.js GLTFLoader
 */
export async function loadModel(url: string): Promise<unknown> {
    // Check cache
    if (modelCache.has(url)) {
        return modelCache.get(url)
    }

    // Placeholder for actual model loading
    // In production:
    // const loader = new GLTFLoader()
    // const gltf = await loader.loadAsync(url)
    // modelCache.set(url, gltf)
    // return gltf

    // For now, just simulate loading
    await new Promise(resolve => setTimeout(resolve, 500))
    const placeholder = { url, loaded: true }
    modelCache.set(url, placeholder)
    return placeholder
}

/**
 * Preload models for a vehicle (base + installed parts)
 */
export async function preloadVehicleModels(vehicle: Vehicle): Promise<void> {
    const config = getVehicleModelConfig(vehicle.id)
    if (!config) return

    const modelsToLoad: string[] = []

    // Add base vehicle model
    if (config.modelUrl) {
        modelsToLoad.push(config.modelUrl)
    }

    // Add installed part models
    for (const installedPart of vehicle.installedParts) {
        const partConfig = getPartModelConfig(installedPart.part.id)
        if (partConfig?.modelUrl) {
            modelsToLoad.push(partConfig.modelUrl)
        }
    }

    // Load all models in parallel
    await Promise.all(modelsToLoad.map(loadModel))
}

/**
 * Clear model cache
 */
export function clearModelCache(): void {
    modelCache.clear()
}

/**
 * Get blueprint URLs for a vehicle
 */
export function getVehicleBlueprints(vehicleId: string): VehicleModelConfig['blueprints'] | null {
    const config = vehicleModelConfigs[vehicleId]
    return config?.blueprints || null
}

/**
 * Check if model files exist for a vehicle
 */
export function hasVehicleModels(vehicleId: string): boolean {
    const config = vehicleModelConfigs[vehicleId]
    return !!config?.modelUrl
}

/**
 * Get all available vehicle model configs
 */
export function getAllVehicleModelConfigs(): VehicleModelConfig[] {
    return Object.values(vehicleModelConfigs)
}

/**
 * Register a new vehicle model configuration
 */
export function registerVehicleModelConfig(config: VehicleModelConfig): void {
    vehicleModelConfigs[config.id] = config
}

/**
 * Register a new part model configuration
 */
export function registerPartModelConfig(config: PartModelConfig): void {
    partModelConfigs[config.id] = config
}

export default {
    getVehicleModelConfig,
    getPartModelConfig,
    getCompatiblePartsForSlot,
    isPartCompatibleWithSlot,
    getSlotConfig,
    getVehicleSlots,
    loadModel,
    preloadVehicleModels,
    clearModelCache,
    getVehicleBlueprints,
    hasVehicleModels,
    getAllVehicleModelConfigs,
    registerVehicleModelConfig,
    registerPartModelConfig
}
