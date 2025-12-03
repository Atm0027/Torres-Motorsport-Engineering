// Vehicle rendering components
export { BlueprintView } from './BlueprintView'

// Vehicle3DView - Solo disponible via lazy loading para code splitting
// Esto reduce el bundle inicial separando Three.js del código principal
import { lazy } from 'react'
export const Vehicle3DViewLazy = lazy(() => import('./Vehicle3DView').then(m => ({ default: m.Vehicle3DView })))

// Export tipo para TypeScript
export type { default as Vehicle3DView } from './Vehicle3DView'
