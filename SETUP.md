# Torres Motorsport Engineering - Guía de Configuración

## 🚀 Instalación Inicial en Nuevo Ordenador

### 1. Clonar el repositorio
```bash
git clone https://github.com/Atm0027/App-edicion-de-coches.git
cd "App edicion de coches"
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar la consola de Python (opcional)
Si necesitas usar scripts de análisis con Node.js:
```bash
npm exec -- python3 --version  # Verificar Python
```

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

---

## 📋 Estructura del Proyecto

```
src/
├── components/          # Componentes React
│   ├── layout/         # Layout principal
│   ├── ui/             # Componentes UI reutilizables
│   └── vehicle/        # Visualización de vehículos 3D
├── features/           # Módulos por funcionalidad
│   ├── auth/          # Autenticación
│   ├── home/          # Dashboard
│   ├── garage/        # Principal - Customización de vehículos
│   ├── catalog/       # Catálogo de piezas
│   └── community/     # Funciones sociales
├── stores/             # Estado global (Zustand)
├── services/           # Servicios (carga de modelos, APIs)
├── hooks/              # Custom React hooks
├── types/              # Tipos TypeScript
├── utils/              # Utilidades (formateo, física, compatibilidad)
└── styles/             # Estilos globales

public/
├── models/vehicles/    # Modelos 3D GLB
└── blueprints/         # Vistas técnicas SVG por vehículo

scripts/
├── analyze-models.js   # Análisis de modelos GLB
└── fix-model-materials.mjs # Corrección de materiales
```

---

## 🛠️ Comandos Disponibles

```bash
# Desarrollo con Hot Module Reload
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Verificación de tipos TypeScript
npm run typecheck

# Linting (ESLint)
npm run lint
```

---

## 🎮 Características Principales

### R34 (Nissan Skyline R34) - Sistema de Separación de Llantas
El modelo R34 tiene un sistema especial de detección dinámica de llantas:
- **Archivo principal**: `src/components/vehicle/Vehicle3DCanvas.tsx`
- **Función**: `separateR34Wheels()` - Separa llantas del mesh `body_main` en tiempo de ejecución
- **Material**: `wheel_separated` - Material independiente para las llantas

Esto permite colorear las llantas por separado de la carrocería sin modificar el archivo GLB.

### Sistema de Colores por Zonas
Cada vehículo tiene zonas editables:
- **Carrocería** (`body`)
- **Llantas** (`wheels`)
- **Pinzas de freno** (`calipers`)
- **Interior** (`interior`)
- **Acentos** (`accents`)
- **Aerodinámica** (`aero`)
- **Luces** (`lights`)

### Acabados Disponibles
- **Brillante** (Gloss) - Pintura de fábrica
- **Mate** (Matte) - Sin brillo
- **Satinado** (Satin) - Semi-brillo
- **Metálico** (Metallic) - Con partículas
- **Perlado** (Pearl) - Efecto iridiscente
- **Cromado** (Chrome) - Espejo perfecto

---

## 🚙 Vehículos Disponibles (12 modelos)

### JDM Legends
- `nissan-skyline-r34` - Skyline R34 GT-R (con separación de llantas)
- `toyota-supra-a80` - Supra A80
- `mazda-rx7-fd` - RX-7 FD
- `honda-nsx` - NSX NA1
- `mitsubishi-evo-ix` - Lancer Evolution IX
- `subaru-impreza-sti` - Impreza WRX STI

### European Performance
- `bmw-m3-e46` - M3 CSL
- `porsche-911-gt3-997` - 911 GT3 RS
- `mercedes-amg-gtr` - AMG GT R

### American Muscle
- `ford-mustang-gt500` - Shelby GT500
- `chevrolet-camaro-zl1` - Camaro ZL1 1LE
- `dodge-challenger-hellcat` - Challenger Hellcat

---

## 🔧 Configuración Importante

### Variables de Entorno
Crear archivo `.env.local` (si es necesario para Firebase):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
```

### TypeScript
- Versión: 5.2
- Modo estricto: Activado
- Alias de ruta: `@` → `src/`, `@components` → `src/components/`

### Build
- Bundler: Vite 5.0
- Formato de salida: ES2020
- Compresión: Brotli automático

---

## 📦 Dependencias Principales

- **React 18.2** - UI Framework
- **TypeScript 5.2** - Tipado estático
- **Tailwind CSS 3.3** - Estilos
- **Zustand 4.4** - State management
- **Three.js** - Renderizado 3D
- **@react-three/fiber** - React renderer para Three.js
- **@react-three/drei** - Helpers 3D
- **Framer Motion** - Animaciones
- **Lucide React** - Iconos

---

## 🎨 Sistema de Estilos

**Colores personalizados** (prefijo `torres-`):
- `torres-primary` (#00d4ff) - Cyan principal
- `torres-dark-600` a `torres-dark-900` - Escala de grises oscuros
- `torres-light-400` - Texto secundario

**Componentes reutilizables**: Importar desde `@components/ui/`

---

## 📝 Notas Importantes

1. **Desarrollo local**: El servidor HMR está configurado en puerto 3000
2. **Modelos 3D**: Se cargan bajo demanda desde `public/models/`
3. **Estado Global**: Usa Zustand (simpler que Redux)
4. **TypeScript obligatorio**: Todos los componentes deben tener tipos explícitos
5. **No hay `any`**: Usar tipos correctos o `unknown` si es necesario

---

## 🚀 Próximas Funcionalidades Planificadas

- ⏳ Backend Firebase
- ⏳ Sistema de comunidad
- ⏳ Guardar configuraciones
- ⏳ Compartir builds

---

## ❓ Solución de Problemas

### El servidor no inicia
```bash
# Limpiar caché
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Errores de TypeScript
```bash
npm run typecheck
```

### Modelos 3D no cargan
- Verificar que los archivos `.glb` existan en `public/models/vehicles/`
- Revisar la consola del navegador para errores

---

## 📞 Información de Contacto

**Repositorio**: https://github.com/Atm0027/App-edicion-de-coches

---

*Última actualización: 2 de diciembre de 2025*
