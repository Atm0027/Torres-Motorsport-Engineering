# Torres Motorsport Engineering - Copilot Instructions

## Project Overview

Torres Motorsport Engineering is a professional vehicle modification simulator built with React, TypeScript, Vite, and Tailwind CSS. The application provides a realistic CAD-style technical view for customizing vehicles with physics-based performance calculations.

## Tech Stack

- **Framework**: React 18.2 with TypeScript 5.2
- **Bundler**: Vite 5.0 with PWA support
- **Styling**: Tailwind CSS 3.3 with custom theme
- **State Management**: Zustand 4.4 with persistence
- **3D Rendering**: Three.js with @react-three/fiber (planned)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Backend**: Firebase (planned)

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── layout/          # Layout components (MainLayout, Sidebar, TopBar)
│   └── ui/              # Base UI components (Button, Card, Badge, etc.)
├── features/            # Feature modules (domain-based organization)
│   ├── auth/           # Authentication (Login, Register)
│   ├── home/           # Dashboard/Home feature
│   ├── garage/         # Vehicle customization feature
│   ├── catalog/        # Parts catalog feature
│   ├── community/      # Community features
│   └── settings/       # User settings
├── stores/             # Zustand state stores
│   ├── userStore.ts    # User data, currency, progression
│   ├── uiStore.ts      # UI state, notifications, theme
│   └── garageStore.ts  # Current vehicle, installed parts
├── utils/              # Utility functions
│   ├── physics.ts      # Performance calculations
│   ├── compatibility.ts # Part compatibility checker
│   ├── formatters.ts   # Number/currency formatters
│   └── helpers.ts      # General helpers
├── data/               # Static data
│   ├── parts.ts        # Parts catalog
│   └── vehicles.ts     # Vehicle database
├── types/              # TypeScript type definitions
├── constants/          # Application constants
└── styles/             # Global styles
```

## Coding Standards

### TypeScript

- Always use strict TypeScript with explicit types
- Define interfaces in `/src/types/index.ts`
- Use type inference where appropriate, but be explicit for function returns
- Prefer `interface` over `type` for object shapes

### React

- Use functional components with hooks
- Keep components small and focused
- Use custom hooks for shared logic
- Follow the container/presentation pattern when appropriate

### Naming Conventions

- **Components**: PascalCase (e.g., `PartCard.tsx`)
- **Files**: kebab-case for utilities, PascalCase for components
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase

### State Management

- Use Zustand stores for global state
- Keep stores focused on specific domains
- Use the `persist` middleware for data that should survive refresh
- Access stores via exported hooks (e.g., `useUserStore`)

### Styling

- Use Tailwind CSS utility classes
- Custom colors use the `torres-` prefix
- Use semantic color names (primary, secondary, success, danger, warning)
- Follow mobile-first responsive design

## Key Concepts

### Physics System

The physics system in `/src/utils/physics.ts` calculates real performance metrics:

- **Horsepower/Torque**: Based on modifications and forced induction
- **Weight**: Base weight minus reductions from parts
- **0-100 km/h**: Uses power-to-weight ratio
- **Top Speed**: Limited by drag and power
- **1/4 Mile**: Calculated from trap speed and ET formulas

### Part Compatibility

Parts have compatibility rules defined in `/src/utils/compatibility.ts`:

- Platform compatibility (make, model, platform codes)
- Engine requirements (displacement, configuration)
- Pre-requisite parts
- Conflict detection

### Vehicle Systems

Vehicles are organized into systems:
- Engine
- Forced Induction
- Exhaust
- Drivetrain
- Suspension
- Brakes
- Wheels/Tires
- Exterior/Aero
- Interior

### Currency & Progression

- Primary currency: Credits (formateado como $XX.XXX)
- Experience points (XP) for leveling
- Parts unlock at specific levels

## Important Patterns

### Adding a New Part

```typescript
// In /src/data/parts.ts
{
  id: 'unique-part-id',
  name: 'Part Name',
  brand: 'Brand',
  category: 'engine', // Must match PartCategory type
  price: 15000,
  weight: 10, // kg
  description: 'Description here',
  stats: {
    horsepowerAdd: 50,
    torqueAdd: 40,
    // ... other stats
  },
  compatibility: {
    mountTypes: ['inline6'],
    drivetrains: ['RWD', 'AWD'],
    engineLayouts: ['front'],
  },
}
```

### Adding a New Vehicle

```typescript
// In /src/data/vehicles.ts
{
  id: 'unique-vehicle-id',
  name: 'Display Name',
  make: 'Make',
  model: 'Model',
  year: 2002,
  category: 'jdm', // jdm, european, american
  baseStats: {
    horsepower: 280,
    torque: 400,
    weight: 1560,
    // ... other stats
  },
  engineConfig: {
    displacement: 2.6,
    cylinders: 6,
    configuration: 'inline',
    code: 'RB26DETT',
    // ... other config
  },
  // ... other properties
}
```

### Creating New Features

1. Create folder under `/src/features/[feature-name]/`
2. Add `pages/` subdirectory for page components
3. Create `index.ts` for exports
4. Add route to `/src/App.tsx`
5. Add navigation link to `/src/components/layout/Sidebar.tsx`

## Testing

When implementing tests:
- Use Vitest for unit tests
- Use React Testing Library for component tests
- Mock Zustand stores using the store's `getState()` and `setState()`

## Performance Considerations

- Use `useMemo` for expensive calculations (especially physics)
- Lazy load feature pages with `React.lazy()`
- Keep 3D models optimized (when implemented)
- Use `useCallback` for event handlers passed to child components

## Accessibility

- All interactive elements must be keyboard accessible
- Use semantic HTML elements
- Include ARIA labels where appropriate
- Maintain proper heading hierarchy

## Common Tasks

### Running the Project

```bash
npm install
npm run dev
```

### Building for Production

```bash
npm run build
npm run preview
```

### Type Checking

```bash
npm run typecheck
```

## Notes for Copilot

When generating code for this project:

1. **Use Spanish for UI text** - The app is localized in Spanish
2. **Follow the established patterns** - Check existing code before creating new patterns
3. **Use the custom UI components** - Don't recreate Button, Card, Badge, etc.
4. **Apply physics calculations** - Use the physics utilities for any performance-related features
5. **Check compatibility** - Use the compatibility checker when dealing with parts/vehicles
6. **Use formatters** - Use `formatCurrency`, `formatNumber` from utils
7. **Store access** - Use the exported hooks (`useUserStore`, etc.)
8. **Type everything** - Import and use types from `/src/types`
