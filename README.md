# 🚗 Torres Motorsport Engineering

**Simulador profesional de modificación de vehículos con visualización 3D interactiva, vistas técnicas estilo CAD y cálculos de rendimiento basados en física real.**

[![React](https://img.shields.io/badge/React-18.2-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple)](https://vitejs.dev)
[![Three.js](https://img.shields.io/badge/Three.js-0.159-green)](https://threejs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com)

## 🌐 Demo en Producción

**URL**: https://torres-motorsport-engineering.pages.dev

## 🎮 Características

- ✅ Visualización 3D interactiva de 12 vehículos
- ✅ Sistema de colores por zonas (carrocería, llantas, interiores)
- ✅ Acabados realistas (brillante, mate, metálico, cromado)
- ✅ Vistas técnicas de planos (blueprints)
- ✅ Cálculos de rendimiento en tiempo real
- ✅ Sistema de compatibilidad de piezas
- ✅ Backend con Supabase (PostgreSQL)
- ✅ Autenticación de usuarios

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- npm o pnpm

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/Atm0027/App-edicion-de-coches.git
cd "App edicion de coches"

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en **http://localhost:3001**

## 📦 Tech Stack

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 18.2 | Framework UI |
| TypeScript | 5.2 | Tipado estático |
| Vite | 6.0 | Bundler + HMR |
| Tailwind CSS | 3.3 | Estilos |
| Zustand | 4.4 | State management |
| Three.js | 0.159 | Renderizado 3D |
| @react-three/fiber | 8.x | React para Three.js |
| Supabase | Latest | Backend + Auth + DB |
| Cloudflare Pages | - | Hosting |

## 🚙 Vehículos Disponibles

### JDM Legends
- Nissan Skyline R34 GT-R (RB26DETT Twin-Turbo I6, AWD)
- Toyota Supra A80 (2JZ-GTE Twin-Turbo I6, RWD)
- Mazda RX-7 FD (13B-REW Twin-Turbo Rotary, RWD)
- Honda NSX NA1 (C30A V6 NA, RWD)
- Mitsubishi Lancer Evo IX (4G63T Turbo I4, AWD)
- Subaru Impreza WRX STI (EJ257 Turbo Flat-4, AWD)

### European Performance
- BMW M3 CSL (S54 I6 NA, RWD)
- Porsche 911 GT3 RS (Flat-6 NA, RWD)
- Mercedes-AMG GT R (V8 Biturbo, RWD)

### American Muscle
- Ford Shelby GT500 (V8 Supercharged, RWD)
- Chevy Camaro ZL1 (LT4 V8 Supercharged, RWD)
- Dodge Challenger Hellcat (HEMI V8 Supercharged, RWD)

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
├── services/            # APIs y carga de datos
├── hooks/               # Custom React hooks
├── types/               # Tipos TypeScript
└── utils/               # Utilidades

public/models/vehicles/  # Modelos GLB por vehículo
database/                # Scripts SQL para Supabase
```

## 📝 Comandos

```bash
npm run dev        # Desarrollo (localhost:3001)
npm run build      # Build producción
npm run preview    # Preview del build
npm run typecheck  # Verificar tipos
npm run lint       # ESLint
```

## 🔧 Configuración de Base de Datos

Ver [database/README.md](./database/README.md) para instrucciones de configuración de Supabase.

## 🎯 Estado del Proyecto

| Feature | Estado |
|---------|--------|
| Visualización 3D | ✅ Completo |
| Sistema de colores | ✅ Completo |
| Vistas de planos | ✅ Completo |
| Cálculos de rendimiento | ✅ Completo |
| 12 vehículos | ✅ Completo |
| Compatibilidad de piezas | ✅ Completo |
| Backend Supabase | ✅ Completo |
| Autenticación | ✅ Completo |
| Sistema de comunidad | ⏳ En desarrollo |

## 📄 Licencia

Este proyecto es de código cerrado.

## 👨‍💻 Autor

**Torres Motorsport Engineering** - 2025
