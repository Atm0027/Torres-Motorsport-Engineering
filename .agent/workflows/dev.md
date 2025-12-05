---
description: Iniciar entorno de desarrollo local para Torres Motorsport Engineering
---

# Workflow de Desarrollo Local

// turbo-all

## 1. Verificar dependencias instaladas
```bash
npm install
```

## 2. Verificar archivo de entorno
```bash
test -f .env || cp .env.example .env
```

## 3. Iniciar servidor de desarrollo
```bash
npm run dev
```

## 4. Abrir en el navegador
El servidor estará disponible en `http://localhost:5173`
