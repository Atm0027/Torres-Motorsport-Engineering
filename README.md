# 🚗 Torres Motorsport Engineering

**Simulador profesional de modificación de vehículos con visualización 3D interactiva, vistas técnicas estilo CAD y cálculos de rendimiento basados en física real.**

[![React](https://img.shields.io/badge/React-18.2-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple)](https://vitejs.dev)
[![Three.js](https://img.shields.io/badge/Three.js-Latest-green)](https://threejs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3-blue)](https://tailwindcss.com)

## 🎮 Demo

Aplicación completamente en **español** con:
- ✅ Visualización 3D interactiva de 12 vehículos
- ✅ Sistema de colores por zonas (carrocería, llantas, interiores, etc.)
- ✅ Acabados realistas (brillante, mate, metálico, cromado, etc.)
- ✅ Vistas técnicas de planos (blueprints)
- ✅ Cálculos de rendimiento en tiempo real
- ✅ Sistema de compatibilidad de piezas

## 🚀 Inicio Rápido

### Requisitos
- Node.js 16+
- npm o yarn

### Instalación
```bash
git clone https://github.com/Atm0027/App-edicion-de-coches.git
cd "App edicion de coches"
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📦 Tech Stack

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 18.2 | Framework UI |
| TypeScript | 5.2 | Tipado estático |
| Vite | 5.0 | Bundler + HMR |
| Tailwind CSS | 3.3 | Estilos |
| Zustand | 4.4 | State management |
| Three.js | Latest | Renderizado 3D |
| @react-three/fiber | Latest | React para Three.js |
| Framer Motion | Latest | Animaciones |

## 🚙 Vehículos Disponibles

### JDM Legends
- 🏎️ **Nissan Skyline R34 GT-R** - RB26DETT Twin-Turbo I6 (AWD)
- 🏎️ **Toyota Supra A80** - 2JZ-GTE Twin-Turbo I6 (RWD)
- 🏎️ **Mazda RX-7 FD** - 13B-REW Twin-Turbo Rotary (RWD)
- 🏎️ **Honda NSX NA1** - C30A V6 NA (RWD)
- 🏎️ **Mitsubishi Lancer Evo IX** - 4G63T Turbo I4 (AWD)
- 🏎️ **Subaru Impreza WRX STI** - EJ257 Turbo Flat-4 (AWD)

### European Performance
- 🏁 **BMW M3 CSL** - S54 I6 NA (RWD)
- 🏁 **Porsche 911 GT3 RS** - Flat-6 NA (RWD)
- 🏁 **Mercedes-AMG GT R** - V8 Biturbo (RWD)

### American Muscle
- 💪 **Ford Shelby GT500** - V8 Supercharged (RWD)
- 💪 **Chevy Camaro ZL1** - LT4 V8 Supercharged (RWD)
- 💪 **Dodge Challenger Hellcat** - HEMI V8 Supercharged (RWD)

## 🎨 Características

### Sistema 3D Avanzado
- Renderizado con Three.js + React Three Fiber
- Modelos GLB optimizados
- OrbitControls para navegación suave
- Sombras dinámicas y lighting realista
- Environment mapping automático

### Sistema de Colores por Zonas
- **Carrocería** - Color principal con acabados
- **Llantas** - Independientes de carrocería (sistema especial para R34)
- **Pinzas de freno** - Detalles técnicos
- **Interior** - Personalizables
- **Acentos** - Detalles decorativos
- **Aerodinámica** - Componentes adicionales
- **Luces** - Faros y pilotos

### Acabados Realistas
```typescript
gloss       // Pintura de fábrica (brillante)
matte       // Sin brillo (aterciopelado)
satin       // Semi-brillo elegante
metallic    // Con partículas metálicas
pearl       // Efecto iridiscente
chrome      // Espejo perfecto
```

### Vistas Técnicas
- Vista frontal
- Vista trasera
- Vista lateral (ambos lados)
- Vista superior
- Vista isométrica 3/4

### Cálculos de Rendimiento
- Potencia (HP)
- Torque (Nm)
- Peso del vehículo
- Aceleración 0-100 km/h
- Velocidad máxima
- Cuarto de milla

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── layout/          # Layout y navegación
│   ├── ui/              # Componentes reutilizables
│   └── vehicle/         # Visualización 3D
├── features/
│   ├── auth/           # Autenticación
│   ├── home/           # Dashboard
│   ├── garage/         # Customización (PRINCIPAL)
│   ├── catalog/        # Catálogo de piezas
│   └── community/      # Funciones sociales
├── stores/              # Estado global (Zustand)
├── services/            # Carga de modelos y APIs
├── hooks/               # Custom React hooks
├── types/               # Tipos TypeScript
├── utils/               # Utilidades
└── styles/              # Estilos globales

public/
├── models/vehicles/     # Modelos GLB
└── blueprints/          # Vistas técnicas SVG
```

## 🔧 Características Técnicas Avanzadas

### Separación Dinámica de Llantas (R34)
El Nissan Skyline R34 tiene un sistema especial donde las llantas están fusionadas con la carrocería. Se detectan dinámicamente:
```typescript
// Detección por posición geométrica
- X: Delantera (2.30) vs Trasera (1.26)
- Y: Derecha (0.80) vs Izquierda (-2.30)
- Z: Altura de llanta (0.32-0.75)
```

Esto permite colorear las llantas independientemente sin modificar el archivo GLB.

### Optimizaciones
- Model caching en memoria
- Lazy loading de modelos 3D
- Material cloning automático
- Geometría optimizada (sin UV2)
- Frustum culling habilitado

### Estado Global Eficiente
- Zustand para gestión de estado
- Selectores específicos para optimización
- Persistencia local (localStorage)

## 📝 Comandos

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Preview del build
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
```

## 🎯 Estado del Proyecto

| Feature | Estado |
|---------|--------|
| Visualización 3D | ✅ Completo |
| Sistema de colores | ✅ Completo |
| Vistas de planos | ✅ Completo |
| Cálculos de rendimiento | ✅ Completo |
| 12 vehículos | ✅ Completo |
| Compatibilidad de piezas | ✅ Funcional |
| Backend Firebase | ⏳ Planificado |
| Sistema de comunidad | ⏳ Planificado |
| Guardar configuraciones | ⏳ Planificado |
| Compartir builds | ⏳ Planificado |

## 📚 Documentación

- [SETUP.md](./SETUP.md) - Guía completa de configuración
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Instrucciones para Copilot

## 🔐 Seguridad

- ✅ TypeScript strict mode
- ✅ No se incluye credenciales en el repo
- ✅ .gitignore configurado correctamente
- ✅ Dependencias actualizadas

## 📄 Licencia

Este proyecto es de código cerrado.

## 👨‍💻 Autor

**Torres Motorsport Engineering**

---

**Última actualización**: 2 de diciembre de 2025

*Aplicación profesional de simulación de modificación de vehículos con tecnología 3D moderna.*
