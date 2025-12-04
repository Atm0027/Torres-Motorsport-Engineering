# Torres Motorsport Engineering - Copilot Instructions

## 🚗 Project Overview

Torres Motorsport Engineering es un simulador profesional de modificación de vehículos con visualización 3D interactiva, vistas técnicas estilo CAD y cálculos de rendimiento basados en física real. La aplicación está completamente en **español**.

### Estado Actual del Proyecto
- ✅ Sistema de visualización 3D con modelos GLB funcional
- ✅ Vistas de blueprints técnicos SVG por vehículo
- ✅ Sistema de piezas y compatibilidad
- ✅ Cálculos de rendimiento en tiempo real
- ✅ 12 vehículos disponibles (JDM, Europeos, Americanos)
- ✅ Selector de colores/livery
- ✅ Backend Supabase (PostgreSQL)
- ✅ Autenticación de usuarios
- ✅ Deploy en Cloudflare Pages
- ⏳ Sistema de comunidad (planificado)

---

## 🛠️ Tech Stack

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18.2 | Framework UI |
| TypeScript | 5.2 | Tipado estático |
| Vite | 6.0 | Bundler + HMR |
| Tailwind CSS | 3.3 | Estilos utility-first |
| Zustand | 4.4 | State management |
| Three.js | 0.159 | Renderizado 3D |
| @react-three/fiber | 8.x | React renderer para Three.js |
| @react-three/drei | 9.x | Helpers para R3F (OrbitControls, useGLTF) |
| Supabase | Latest | Backend + Auth + PostgreSQL |
| Lucide React | - | Iconos |
| Framer Motion | - | Animaciones |

### Servidor de Desarrollo
```bash
npm run dev  # Inicia en http://localhost:3001
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/              # MainLayout, Sidebar, TopBar
│   ├── ui/                  # Button, Card, Badge, Modal, etc.
│   └── vehicle/             # Componentes de visualización de vehículos
│       ├── Vehicle3DCanvas.tsx   # Canvas 3D con Three.js
│       ├── Vehicle3DView.tsx     # Wrapper con controles de vista
│       └── BlueprintView.tsx     # Vistas técnicas SVG
│
├── features/                # Módulos por dominio
│   ├── auth/               # Login, Register
│   ├── home/               # Dashboard principal
│   ├── garage/             # Customización de vehículos (PRINCIPAL)
│   │   ├── pages/
│   │   │   └── GaragePage.tsx
│   │   └── components/
│   │       ├── OverviewSection.tsx    # Vista técnica/planos/3D
│   │       ├── PartsSection.tsx       # Catálogo de piezas
│   │       ├── ColorsSection.tsx      # Selector de colores
│   │       ├── PerformancePanel.tsx   # Panel de stats
│   │       ├── VehicleSelector.tsx    # Selector de vehículo
│   │       └── SectionNav.tsx         # Navegación de secciones
│   ├── catalog/            # Catálogo de piezas completo
│   ├── community/          # Funciones sociales
│   └── settings/           # Configuración de usuario
│
├── stores/                  # Zustand stores
│   ├── userStore.ts        # Usuario, créditos, XP, nivel
│   ├── uiStore.ts          # Tema, notificaciones, modales
│   └── garageStore.ts      # Vehículo actual, piezas instaladas
│
├── services/
│   └── modelLoader.ts      # Carga de modelos 3D y configuración
│
├── hooks/
│   ├── useOptimized.ts     # Hooks de optimización (useMemo, etc.)
│   └── useVehicleRender.ts # Hook para renderizado de vehículos
│
├── data/
│   ├── vehicles.ts         # Base de datos de 12 vehículos
│   └── parts.ts            # Catálogo de piezas
│
├── utils/
│   ├── physics.ts          # Cálculos de rendimiento
│   ├── compatibility.ts    # Verificador de compatibilidad
│   ├── formatters.ts       # formatCurrency, formatNumber
│   └── helpers.ts          # Utilidades generales
│
├── types/
│   └── index.ts            # Todas las interfaces TypeScript
│
└── constants/              # Constantes de la aplicación

public/
├── models/
│   └── vehicles/           # Modelos GLB por vehículo
│       ├── nissan-skyline-r34/
│       ├── toyota-supra-a80/
│       ├── mazda-rx7-fd/
│       ├── honda-nsx/
│       ├── mitsubishi-evo-ix/
│       └── subaru-impreza-sti/
└── blueprints/             # Imágenes de blueprints (opcional)
```

---

## 🚙 Vehículos Disponibles

### JDM Legends
| ID | Nombre | Motor | Tracción |
|----|--------|-------|----------|
| `nissan-skyline-r34` | Skyline R34 GT-R | RB26DETT I6 Twin-Turbo | AWD |
| `toyota-supra-a80` | Supra A80 | 2JZ-GTE I6 Twin-Turbo | RWD |
| `mazda-rx7-fd` | RX-7 FD | 13B-REW Rotary Twin-Turbo | RWD |
| `honda-nsx` | NSX NA1 | C30A V6 NA | RWD |
| `mitsubishi-evo-ix` | Lancer Evolution IX | 4G63T I4 Turbo | AWD |
| `subaru-impreza-sti` | Impreza WRX STI | EJ257 Flat-4 Turbo | AWD |

### European Performance
| ID | Nombre | Motor | Tracción |
|----|--------|-------|----------|
| `bmw-m3-e46` | M3 CSL | S54 I6 NA | RWD |
| `porsche-911-gt3-997` | 911 GT3 RS | Flat-6 NA | RWD |
| `mercedes-amg-gtr` | AMG GT R | V8 Biturbo | RWD |

### American Muscle
| ID | Nombre | Motor | Tracción |
|----|--------|-------|----------|
| `ford-mustang-gt500` | Shelby GT500 | V8 Supercharged | RWD |
| `chevrolet-camaro-zl1` | Camaro ZL1 1LE | LT4 V8 Supercharged | RWD |
| `dodge-challenger-hellcat` | Challenger Hellcat | HEMI V8 Supercharged | RWD |

---

## 🎮 Sistema 3D - Vehicle3DCanvas

### Configuraciones Clave

```typescript
// Archivo: src/components/vehicle/Vehicle3DCanvas.tsx

// Corrección de vistas de cámara por vehículo (algunos modelos vienen rotados)
const CAMERA_VIEW_SWAP: Record<string, Record<string, string>> = {
    'nissan-skyline-r34': { 'side-left': 'side-right', 'side-right': 'side-left' },
    'toyota-supra-a80': { 'front': 'side-left', 'rear': 'side-right', 'side-left': 'front', 'side-right': 'rear' },
    'mazda-rx7-fd': { 'front': 'side-left', 'rear': 'side-right', 'side-left': 'front', 'side-right': 'rear' },
    'honda-nsx': { 'side-left': 'side-right', 'side-right': 'side-left' },
    'mitsubishi-evo-ix': { 'side-left': 'side-right', 'side-right': 'side-left' },
    'subaru-impreza-sti': { 'front': 'side-right', 'rear': 'side-left', 'side-left': 'rear', 'side-right': 'front' }
}

// Offset de posición del modelo (para centrar modelos desalineados)
const MODEL_POSITION_OFFSET: Record<string, { x: number; y: number; z: number }> = {
    'mazda-rx7-fd': { x: 0, y: -0.15, z: 0 }
}

// Rotación inicial del modelo
const MODEL_INITIAL_ROTATION: Record<string, [number, number, number]> = {
    'nissan-skyline-r34': [0, Math.PI, 0],
    // ... otros vehículos
}
```

### Posiciones de Cámara

```typescript
const CAMERA_POSITIONS = {
    'three-quarter': { position: [4, 2, 4], target: [0, 0, 0] },      // Vista 3/4 (default)
    'front': { position: [0, 1, 5], target: [0, 0.5, 0] },            // Vista frontal
    'rear': { position: [0, 1, -5], target: [0, 0.5, 0] },            // Vista trasera
    'side-left': { position: [-5, 1, 0], target: [0, 0.5, 0] },       // Lateral izquierdo
    'side-right': { position: [5, 1, 0], target: [0, 0.5, 0] },       // Lateral derecho
    'top': { position: [0, 6, 0], target: [0, 0, 0] }                 // Vista superior
}
```

### Añadir Modelo 3D para Nuevo Vehículo

1. Colocar archivo `.glb` en `public/models/vehicles/{vehicle-id}/model.glb`
2. Si necesita corrección de vistas, añadir a `CAMERA_VIEW_SWAP`
3. Si está descentrado, añadir a `MODEL_POSITION_OFFSET`
4. El modelo se detecta automáticamente por `modelLoader.ts`

---

## 📐 Sistema de Blueprints - BlueprintView

### Archivo: `src/components/vehicle/BlueprintView.tsx`

Los blueprints son SVGs vectoriales que muestran vistas técnicas del vehículo. Cada vehículo tiene planos personalizados con características únicas.

### Estructura de un Blueprint SVG

```typescript
const getVehicleBlueprint = (vehicleId: string, view: ViewType) => {
    // Colores estándar
    const strokeColor = "#00d4ff"    // Líneas principales
    const dimColor = "#0891b2"       // Cotas y dimensiones
    const detailColor = "#06b6d4"    // Detalles secundarios
    
    // Retorna JSX del SVG específico para el vehículo y vista
}
```

### Vistas Disponibles
- `side` - Vista lateral (muestra batalla, altura, silueta)
- `front` - Vista frontal (muestra ancho de vías, faros)
- `rear` - Vista trasera (muestra pilotos, escapes)
- `top` - Vista superior (muestra dimensiones generales)

### Elementos Típicos de un Blueprint
- Carrocería principal (path con silueta)
- Ventanas y cristales (con fillOpacity para transparencia)
- Ruedas con detalles de radios y discos de freno
- Faros/Pilotos con detalles internos
- Retrovisores
- Spoilers/Alerones
- Cotas dimensionales (batalla, ancho, altura)
- Líneas de referencia (CL = centerline)

---

## 📊 Sistema de Física - physics.ts

```typescript
// Cálculos principales
calculateHorsepower(baseHP, modifications) → number
calculateTorque(baseTorque, modifications) → number
calculateWeight(baseWeight, parts) → number
calculate0to100(hp, weight, drivetrain) → number  // segundos
calculateTopSpeed(hp, dragCoef, frontalArea) → number  // km/h
calculateQuarterMile(hp, weight) → { time: number, speed: number }
```

---

## 🎨 Sistema de Estilos

### Colores Personalizados (Tailwind)

```css
/* Prefijo: torres- */
torres-primary     /* #00d4ff - Cyan principal */
torres-secondary   /* Variantes de gris oscuro */
torres-dark-600    /* Bordes */
torres-dark-700    /* Fondos secundarios */
torres-dark-800    /* Fondos principales */
torres-dark-900    /* Fondo más oscuro */
torres-light-400   /* Texto secundario */
```

### Componentes UI Disponibles

```typescript
import { Button } from '@components/ui/Button'
import { Card } from '@components/ui/Card'
import { Badge } from '@components/ui/Badge'
import { Modal } from '@components/ui/Modal'
// ... etc
```

**⚠️ NUNCA recrear estos componentes. Siempre importar desde `@components/ui/`**

---

## 📝 Convenciones de Código

### TypeScript
```typescript
// ✅ Correcto - tipos explícitos
interface VehicleProps {
    vehicle: Vehicle
    onSelect: (id: string) => void
}

// ❌ Incorrecto - any o tipos implícitos
const handleClick = (data: any) => { ... }
```

### React Components
```typescript
// ✅ Correcto - functional component con tipos
export function VehicleCard({ vehicle, onSelect }: VehicleProps) {
    const [isHovered, setIsHovered] = useState(false)
    
    return (
        <Card className="...">
            {/* contenido */}
        </Card>
    )
}

// ❌ Incorrecto - class components o sin tipos
```

### Imports con Alias
```typescript
import { Button } from '@components/ui/Button'     // @components = src/components
import { useUserStore } from '@/stores/userStore'  // @ = src
import type { Vehicle } from '@/types'
```

### Nombres
- **Componentes**: `PascalCase.tsx` → `VehicleSelector.tsx`
- **Hooks**: `camelCase.ts` con prefijo `use` → `useVehicleRender.ts`
- **Utilities**: `camelCase.ts` → `formatters.ts`
- **Constantes**: `UPPER_SNAKE_CASE` → `CAMERA_POSITIONS`
- **Interfaces**: `PascalCase` → `Vehicle`, `Part`, `BlueprintViewState`

---

## 🔧 Patrones Comunes

### Acceso a Stores (Zustand)

```typescript
// ✅ Correcto
import { useUserStore } from '@/stores/userStore'
import { useGarageStore } from '@/stores/garageStore'

function MyComponent() {
    const { credits, addCredits } = useUserStore()
    const { currentVehicle, setCurrentVehicle } = useGarageStore()
}

// Con selector para optimización
const credits = useUserStore(state => state.credits)
```

### Formateo de Valores

```typescript
import { formatCurrency, formatNumber } from '@/utils/formatters'

formatCurrency(15000)  // → "$15.000"
formatNumber(1234.5)   // → "1.234,5"
```

### Verificar Compatibilidad de Piezas

```typescript
import { checkPartCompatibility } from '@/utils/compatibility'

const result = checkPartCompatibility(part, vehicle)
if (result.compatible) {
    // Puede instalarse
} else {
    console.log(result.reasons) // Array de razones
}
```

---

## ⚠️ Notas Importantes para Copilot

1. **Idioma**: Todo el texto de UI debe estar en **español**

2. **No recrear componentes UI**: Usar siempre los de `@components/ui/`

3. **Tipos obligatorios**: Importar desde `@/types` - nunca usar `any`

4. **Formateo**: Usar `formatCurrency` y `formatNumber` de utils

5. **3D Models**: 
   - Formato: GLB
   - Ubicación: `public/models/vehicles/{vehicle-id}/model.glb`
   - Si el modelo tiene orientación incorrecta, añadir a `CAMERA_VIEW_SWAP`

6. **Blueprints SVG**:
   - Cada vehículo tiene sus propios planos
   - Usar colores estándar: `#00d4ff`, `#0891b2`, `#06b6d4`
   - Incluir cotas dimensionales reales del vehículo

7. **Performance**:
   - Usar `useMemo` para cálculos costosos
   - Usar `useCallback` para handlers pasados a children
   - Los modelos 3D se cargan lazy

8. **Estado**:
   - Global: Zustand stores
   - Local: useState
   - No mezclar - elegir según el scope

---

## 🚀 Comandos Útiles

```bash
npm run dev        # Desarrollo (localhost:3001)
npm run build      # Build producción
npm run preview    # Preview del build
npm run typecheck  # Verificar tipos
npm run lint       # ESLint
```
