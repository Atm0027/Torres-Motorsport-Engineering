---
description: Verificar estado y calidad del código del proyecto
---

# Workflow de Verificación

// turbo-all

## 1. Verificar tipos de TypeScript
```bash
npm run type-check
```

## 2. Ejecutar ESLint
```bash
npm run lint
```

## 3. Verificar build
```bash
npm run build
```

## 4. Resultado
Si todos los pasos pasan sin errores, el código está listo para desplegar.
