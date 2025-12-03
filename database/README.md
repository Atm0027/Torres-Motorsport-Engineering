# 🗄️ Torres Motorsport Engineering - Base de Datos

## Estructura de la Base de Datos

Esta carpeta contiene todos los scripts SQL necesarios para configurar la base de datos en **Supabase** (PostgreSQL).

## 📁 Archivos

| Archivo | Descripción |
|---------|-------------|
| `schema.sql` | Esquema completo de la base de datos (tablas, índices, RLS) |
| `seed_vehicles.sql` | Datos de los 12 vehículos del catálogo |
| `seed_parts.sql` | Datos de las 126+ piezas del catálogo (generado automáticamente) |
| `seed_achievements.sql` | Logros predefinidos del juego |
| `generate-parts-seed.mjs` | Script para regenerar `seed_parts.sql` |

## 🚀 Configuración en Supabase

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto
3. Anota la **URL** y **anon key** del proyecto

### 2. Ejecutar los scripts SQL

En el SQL Editor de Supabase, ejecuta los scripts en este orden:

```sql
-- 1. Primero el esquema
-- Copiar y pegar contenido de schema.sql

-- 2. Luego los datos semilla
-- Copiar y pegar contenido de seed_vehicles.sql
-- Copiar y pegar contenido de seed_parts.sql
-- Copiar y pegar contenido de seed_achievements.sql
```

### 3. Configurar variables de entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## 📊 Diagrama de Relaciones

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  vehicles   │     │    parts    │     │achievements │
│  (catálogo) │     │  (catálogo) │     │ (catálogo)  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │ 1:N               │ 1:N               │ 1:N
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│user_vehicles│     │ user_parts  │     │user_achievements│
└──────┬──────┘     └──────┬──────┘     └────────┬────────┘
       │                   │                     │
       └───────────────────┴─────────────────────┘
                           │
                           │ N:1
                           ▼
                    ┌─────────────┐
                    │    users    │
                    └──────┬──────┘
                           │
                           │ 1:N
                           ▼
                    ┌─────────────┐
                    │   builds    │──────► build_comments
                    └──────┬──────┘
                           │
                           │ 1:N
                           ▼
                    ┌──────────────────┐
                    │leaderboard_entries│
                    └──────────────────┘
```

## 🔒 Seguridad (RLS)

Las siguientes tablas tienen Row Level Security habilitado:

- **users**: Solo puedes ver/editar tu propio perfil
- **builds**: Builds públicos visibles para todos, privados solo para el dueño
- **user_vehicles**: Solo visible para el propietario
- **user_parts**: Solo visible para el propietario
- **user_achievements**: Solo visible para el propietario

Las tablas de catálogo (`vehicles`, `parts`, `achievements`) son públicas para lectura.

## 🔄 Regenerar seed de piezas

Si modificas `src/data/parts.ts`, regenera el SQL:

```bash
node database/generate-parts-seed.mjs
```

## 📈 Estadísticas

- **Vehículos**: 12 (JDM, Europeos, Americanos)
- **Piezas**: 126+ (motores, turbos, escapes, suspensión, etc.)
- **Logros**: 18 (bronce, plata, oro, platino)

## 🔗 Próximos pasos

1. Instalar cliente de Supabase en el proyecto
2. Crear servicios de API
3. Migrar stores de Zustand para usar Supabase
4. Implementar autenticación real
