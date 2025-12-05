---
description: Desplegar Torres Motorsport Engineering a Cloudflare Pages
---

# Workflow de Despliegue

## 1. Verificar que no hay errores de TypeScript
```bash
npm run type-check
```

## 2. Ejecutar linter
```bash
npm run lint
```

## 3. Build de producción
```bash
npm run build
```

## 4. Desplegar a Cloudflare Pages
```bash
wrangler pages deploy dist --project-name=torres-motorsport-engineering
```

## 5. Verificar despliegue
La aplicación estará disponible en: https://torres-motorsport-engineering.pages.dev/
