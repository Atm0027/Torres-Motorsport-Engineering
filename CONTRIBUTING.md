# 🛠️ Guía de Configuración del Proyecto

Esta guía explica cómo configurar el entorno de desarrollo para **Torres Motorsport Engineering** en cualquier IDE (VS Code, Antigravity, Cursor, etc.).

## 📋 Requisitos del Sistema

### Software Necesario
- **Node.js**: v18.0.0 o superior
- **npm**: v9.0.0 o superior (incluido con Node.js)
- **Git**: Para clonar el repositorio

### Verificar instalación
```bash
node --version   # Debe ser >= 18.0.0
npm --version    # Debe ser >= 9.0.0
git --version    # Cualquier versión reciente
```

---

## 🚀 Instalación Paso a Paso

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Atm0027/App-edicion-de-coches.git
cd "App edicion de coches"
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
# Supabase (Backend)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

> **Nota**: Contactar al administrador del proyecto para obtener las credenciales.

### 4. Iniciar Servidor de Desarrollo
```bash
npm run dev
```

La aplicación estará en: **http://localhost:3001**

---

## 📦 Dependencias del Proyecto

### Dependencias de Producción
| Paquete | Versión | Uso |
|---------|---------|-----|
| react | 18.2.x | Framework UI |
| react-dom | 18.2.x | Renderizado DOM |
| react-router-dom | 6.20.x | Enrutamiento SPA |
| three | 0.159.x | Motor 3D |
| @react-three/fiber | 8.15.x | React + Three.js |
| @react-three/drei | 9.88.x | Helpers para R3F |
| @supabase/supabase-js | 2.86.x | Cliente de Supabase |
| zustand | 4.5.x | Estado global |
| framer-motion | 11.18.x | Animaciones |
| lucide-react | 0.555.x | Iconos |
| tailwind-merge | 2.6.x | Merge de clases Tailwind |
| clsx | 2.0.x | Classnames condicionales |

### Dependencias de Desarrollo
| Paquete | Versión | Uso |
|---------|---------|-----|
| typescript | 5.2.x | Tipado estático |
| vite | 6.4.x | Bundler + HMR |
| @vitejs/plugin-react | 4.7.x | Plugin de React |
| tailwindcss | 3.3.x | CSS utility-first |
| postcss | 8.4.x | Procesamiento CSS |
| autoprefixer | 10.4.x | Prefijos CSS automáticos |
| eslint | 8.53.x | Linting |
| @typescript-eslint/* | 6.10.x | ESLint para TS |
| wrangler | 4.52.x | CLI de Cloudflare |

---

## 🔧 Configuración del IDE

### VS Code / Cursor

#### Extensiones Recomendadas
Instalar estas extensiones para mejor experiencia de desarrollo:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",
    "formulahendry.auto-close-tag",
    "ChakrounAnas.turbo-console-log",
    "streetsidesoftware.code-spell-checker",
    "streetsidesoftware.code-spell-checker-spanish",
    "yoavbls.pretty-ts-errors",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

Para instalar todas:
```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension formulahendry.auto-rename-tag
code --install-extension formulahendry.auto-close-tag
code --install-extension yoavbls.pretty-ts-errors
```

#### Configuración de Settings
El archivo `.vscode/settings.json` ya está configurado con:
- Asociaciones de archivos
- Servidores MCP (Model Context Protocol)

---

## 🤖 Servidores MCP Utilizados

El proyecto utiliza estos servidores MCP para AI-assisted development:

### 1. Supabase MCP
- **URL**: `https://mcp.supabase.com/mcp`
- **Uso**: Gestión de base de datos, queries SQL, migraciones
- **Proyecto**: Torres Motorsport Engineering DB

### 2. Cloudflare MCP (Opcional)
- **Bindings**: `https://bindings.mcp.cloudflare.com/mcp`
- **Observability**: `https://observability.mcp.cloudflare.com/mcp`
- **Docs**: `https://docs.mcp.cloudflare.com/mcp`
- **Uso**: Despliegue y monitoreo en Cloudflare Pages

### Configuración MCP en tu IDE
Si tu IDE soporta MCP, añade en configuración:

```json
{
  "mcp": {
    "servers": {
      "supabase": {
        "type": "http",
        "url": "https://mcp.supabase.com/mcp?project_ref=TU_PROJECT_REF"
      }
    }
  }
}
```

---

## 📝 Scripts Disponibles

```bash
# Desarrollo con Hot Module Reload
npm run dev

# Build de producción
npm run build

# Preview del build localmente
npm run preview

# Verificación de tipos TypeScript
npm run typecheck

# Linting con ESLint
npm run lint

# Desplegar a Cloudflare Pages
npm run deploy

# Limpiar cache
npm run clean
```

---

## 🗂️ Estructura de Carpetas

```
/
├── .github/
│   └── copilot-instructions.md  # Instrucciones para GitHub Copilot
├── .vscode/
│   └── settings.json            # Configuración de VS Code
├── database/
│   ├── schema.sql               # Esquema de Supabase
│   └── seed_*.sql               # Datos iniciales
├── public/
│   └── models/vehicles/         # Modelos 3D GLB
├── src/
│   ├── components/              # Componentes React
│   ├── features/                # Módulos por funcionalidad
│   ├── hooks/                   # Custom hooks
│   ├── services/                # APIs y servicios
│   ├── stores/                  # Estado global (Zustand)
│   ├── types/                   # Tipos TypeScript
│   └── utils/                   # Utilidades
├── .env.example                 # Ejemplo de variables de entorno
├── .env.local                   # Variables de entorno (no en git)
├── package.json                 # Dependencias y scripts
├── tsconfig.json                # Configuración TypeScript
├── vite.config.ts               # Configuración Vite
└── tailwind.config.js           # Configuración Tailwind CSS
```

---

## 🔐 Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Clave pública de Supabase | ✅ |

---

## 🚨 Solución de Problemas

### Error: "Cannot find module"
```bash
npm install
```

### Error: Puerto 3001 ocupado
```bash
# Cambiar puerto en vite.config.ts o usar:
npm run dev -- --port 3002
```

### Error: Modelos 3D no cargan
Verificar que los archivos `.glb` están en `public/models/vehicles/`

### Error: Supabase no conecta
Verificar variables en `.env.local`

### Error: TypeScript types
```bash
npm run typecheck
```

---

## 🌐 Despliegue

### Cloudflare Pages (Producción)
```bash
npm run deploy
```

Requiere:
1. Cuenta de Cloudflare
2. Wrangler autenticado: `npx wrangler login`

---

## 📚 Recursos Adicionales

- [Documentación de React](https://react.dev)
- [Documentación de Three.js](https://threejs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Vite](https://vitejs.dev)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)

---

**Última actualización**: Diciembre 2025
