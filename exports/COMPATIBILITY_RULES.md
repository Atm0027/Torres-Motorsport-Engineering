# Reglas de Compatibilidad - Torres Motorsport Engineering

## Descripción General

Este documento describe las reglas y criterios utilizados para determinar la compatibilidad entre vehículos y modificaciones en el archivo `vehicle_compatibility_merged.json`.

## Criterios de Compatibilidad

### 1. Tipo de Motor (mountTypes)
**Restricción:** La pieza debe ser compatible con el tipo/configuración del motor del vehículo.

**Tipos válidos:**
- `inline4` - Motor 4 cilindros en línea
- `inline6` - Motor 6 cilindros en línea
- `v6` - Motor V6
- `v8` - Motor V8
- `v10` - Motor V10
- `flat4` - Motor boxer 4 cilindros
- `flat6` - Motor boxer 6 cilindros
- `rotary` - Motor rotativo (Wankel)

**Ejemplo de incompatibilidad:**
- Un motor RB26DETT (inline6) no se puede instalar en un Porsche 911 (flat6)

---

### 2. Tracción (drivetrains)
**Restricción:** La pieza debe ser compatible con el tipo de tracción del vehículo.

**Tipos válidos:**
- `FWD` - Tracción delantera
- `RWD` - Tracción trasera
- `AWD` - Tracción total/4WD

**Ejemplo de incompatibilidad:**
- Un diferencial trasero específico para RWD no se puede instalar en un vehículo FWD

---

### 3. Disposición del Motor (engineLayouts)
**Restricción:** La pieza debe ser compatible con la posición del motor en el vehículo.

**Tipos válidos:**
- `front` - Motor delantero
- `mid` - Motor central
- `rear` - Motor trasero

**Ejemplo de incompatibilidad:**
- Un colector de escape diseñado para motor delantero no funciona en un motor central

---

### 4. Tamaño del Compartimento del Motor (minEngineBaySize)
**Restricción:** El vehículo debe tener suficiente espacio en el compartimento del motor.

**Medida:** Litros (L)

**Ejemplo de incompatibilidad:**
- Un motor que requiere 50L de espacio no cabe en un vehículo con engineBaySize de 45L

---

### 5. Patrón de Pernos de Ruedas (boltPatterns)
**Restricción:** Las ruedas deben coincidir con el patrón de pernos del vehículo.

**Patrones comunes:**
- `5x114.3` - JDM estándar (Nissan, Toyota, Mazda, Honda, Mitsubishi, Subaru)
- `5x120` - BMW, algunos europeos
- `5x130` - Porsche
- `5x112` - Mercedes, Audi, VW
- `5x4.5` (equivalente a 5x114.3 en pulgadas) - Americanos modernos

**Ejemplo de incompatibilidad:**
- Ruedas 5x120 (BMW) no se pueden instalar en un Skyline GT-R (5x114.3)

---

### 6. Peso Máximo (maxWeight)
**Restricción:** El peso total del vehículo + pieza no debe exceder el límite recomendado.

**Medida:** Kilogramos (kg)

**Tipo:** Advertencia (warning), no incompatibilidad total

---

### 7. Partes Requeridas (requiredParts)
**Restricción:** La pieza requiere que otras piezas específicas estén ya instaladas.

**Ejemplo de incompatibilidad:**
- Un turbo de alta presión puede requerir pistones forjados instalados previamente
- Un sistema de inyección requiere una ECU específica

**Nota:** En el archivo JSON actual, `vehicle.installedParts` está vacío por defecto, por lo que estas dependencias generan incompatibilidad inicial.

---

### 8. Partes Conflictivas (conflictingParts)
**Restricción:** La pieza no puede coexistir con otras piezas específicas ya instaladas.

**Ejemplo de incompatibilidad:**
- Un sistema de admisión específico puede ser incompatible con ciertos colectores

---

### 9. Turbo + Supercargador (Advertencia Especial)
**Restricción:** Advertencia al intentar instalar turbo y supercargador simultáneamente.

**Tipo:** Advertencia (warning), no incompatibilidad total

**Razón:** Configuración twin-charged es técnicamente posible pero compleja y poco común.

---

### 10. Motor Atmosférico + Inducción Forzada (Advertencia)
**Restricción:** Advertencia al instalar turbo/supercargador en motor naturalmente aspirado.

**Campo del vehículo:** `baseSpecs.engine.naturallyAspirated: true`

**Tipo:** Advertencia (warning)

**Razón:** Requiere refuerzos internos del motor (pistones, bielas, etc.)

---

## Estructura del Archivo JSON

### Por cada vehículo:
```json
{
  "vehicleId": "identificador-unico",
  "name": "Nombre del vehículo",
  "manufacturer": "Marca",
  "year": 2002,
  "baseSpecs": {
    "engine": {
      "type": "inline6",           // mountType del motor
      "naturallyAspirated": false  // Motor NA o turbo de fábrica
    },
    "drivetrain": "AWD",            // FWD/RWD/AWD
    "engineLayout": "front",        // front/mid/rear
    "engineBaySize": 48,            // Espacio en litros
    "boltPattern": "5x114.3",       // Patrón de pernos
    "weight": 1560                  // Peso base en kg
  },
  "compatiblePartsCount": 231,
  "incompatiblePartsCount": 43,
  "compatibleParts": [...],         // Array de piezas compatibles
  "incompatibleParts": [...]        // Array de piezas incompatibles con razones
}
```

### Por cada pieza:
```json
{
  "id": "part-id",
  "name": "Nombre de la pieza",
  "category": "engine",              // Categoría
  "brand": "Marca",
  "price": 45000,                    // Precio en créditos
  "weight": 265,                     // Peso en kg
  "reasons": [],                     // Array de razones de incompatibilidad
  "warnings": []                     // Array de advertencias
}
```

---

## Categorías de Piezas

1. **engine** - Motores completos
2. **turbo** - Turbocargadores
3. **supercharger** - Supercargadores
4. **exhaust** - Sistemas de escape
5. **intake** - Sistemas de admisión
6. **intercooler** - Intercoolers
7. **ecu** - Unidades de control electrónico
8. **transmission** - Transmisiones
9. **clutch** - Embragues
10. **differential** - Diferenciales
11. **suspension** - Suspensión
12. **brakes** - Frenos
13. **wheels** - Ruedas
14. **tires** - Neumáticos
15. **aero** - Aerodinámica
16. **interior** - Interior
17. **fuel** - Sistema de combustible
18. **cooling** - Sistema de refrigeración
19. **nos** - Sistemas de óxido nitroso

---

## Vehículos en el Catálogo

### JDM (Japoneses)
1. **Nissan Skyline GT-R V-Spec II (R34)** - 2002
   - Motor: RB26DETT (inline6, turbo)
   - Tracción: AWD
   - Patrón: 5x114.3

2. **Toyota Supra RZ (A80)** - 1997
   - Motor: 2JZ-GTE (inline6, turbo)
   - Tracción: RWD
   - Patrón: 5x114.3

3. **Mazda RX-7 Spirit R (FD)** - 2002
   - Motor: 13B-REW (rotary, turbo)
   - Tracción: RWD
   - Patrón: 5x114.3

4. **Honda NSX Type R (NA1)** - 1992
   - Motor: C30A (v6, NA)
   - Tracción: RWD
   - Patrón: 5x114.3

5. **Mitsubishi Lancer Evolution IX MR** - 2006
   - Motor: 4G63 (inline4, turbo)
   - Tracción: AWD
   - Patrón: 5x114.3

6. **Subaru Impreza WRX STI** - 2004
   - Motor: EJ257 (flat4, turbo)
   - Tracción: AWD
   - Patrón: 5x114.3

### Europeos
7. **BMW M3 CSL (E46)** - 2003
   - Motor: S54B32 (inline6, NA)
   - Tracción: RWD
   - Patrón: 5x120

8. **Porsche 911 GT3 RS (997)** - 2007
   - Motor: Flat-6 (flat6, NA)
   - Tracción: RWD
   - Patrón: 5x130

9. **Mercedes-AMG GT R** - 2017
   - Motor: M178 (v8, turbo)
   - Tracción: RWD
   - Patrón: 5x112

### Americanos
10. **Ford Mustang Shelby GT500** - 2020
    - Motor: Predator V8 (v8, supercharged)
    - Tracción: RWD
    - Patrón: 5x4.5

11. **Chevrolet Camaro ZL1 1LE** - 2018
    - Motor: LT4 (v8, supercharged)
    - Tracción: RWD
    - Patrón: 5x4.5

12. **Dodge Challenger SRT Hellcat** - 2019
    - Motor: Supercharged HEMI (v8, supercharged)
    - Tracción: RWD
    - Patrón: 5x4.5

---

## Verificaciones Sugeridas

### 1. Validación de Estructura
- ✓ Cada vehículo tiene exactamente 274 piezas evaluadas (compatibles + incompatibles)
- ✓ No hay IDs de piezas duplicados
- ✓ Todos los campos requeridos están presentes

### 2. Validación de Lógica de Compatibilidad

**mountTypes:**
- Motores inline6 solo en vehículos con motor inline6 de base (a menos que sea swap de motor)
- Motores v8 solo en vehículos con espacio suficiente
- Motores rotary solo en RX-7

**drivetrains:**
- Piezas específicas de AWD no en vehículos RWD/FWD
- Diferenciales traseros no en vehículos FWD

**boltPatterns:**
- Ruedas 5x114.3 para todos los JDM
- Ruedas 5x120 solo para BMW
- Ruedas 5x130 solo para Porsche
- Ruedas 5x112 solo para Mercedes
- Ruedas 5x4.5 solo para americanos

### 3. Validación de Coherencia
- Si una pieza es compatible con vehículo A, debería serlo con vehículos similares
- Si una pieza es incompatible, debe tener al menos una razón especificada
- Las advertencias deben ser apropiadas al contexto

### 4. Casos Especiales a Verificar

**Motores de intercambio populares:**
- RB26DETT (Nissan) → Compatible con otros inline6
- 2JZ-GTE (Toyota) → Compatible con otros inline6
- LS-series V8 → Compatible con vehículos con espacio suficiente

**Turbos:**
- Deben ser compatibles con cualquier motor que acepte turbo
- Incompatibles con motores rotary específicos (requieren turbos especiales)

**Ruedas:**
- La compatibilidad depende ÚNICAMENTE del boltPattern
- No debe haber otras restricciones

---

## Notas Importantes

1. **No hay restricciones por año:** Las piezas no están limitadas por el año del vehículo.

2. **No hay restricciones por marca (excepto casos específicos):** La mayoría de piezas aftermarket son universales o tienen adaptaciones.

3. **installedParts está vacío:** El sistema evalúa compatibilidad inicial sin considerar configuración previa del vehículo.

4. **Sistema de swaps de motor:** Motores de diferentes configuraciones pueden ser "swapeados" si hay espacio físico, pero generan incompatibilidad si no coincide el tipo.

5. **Warnings vs Incompatibilidad:** 
   - `reasons` = Incompatibilidad física/técnica (NO se puede instalar)
   - `warnings` = Advertencias (se puede instalar pero con precauciones)

---

## Fuentes de Datos

- **Especificaciones de vehículos:** Datos reales de fabricantes
- **Compatibilidad de piezas:** Basada en especificaciones técnicas de fabricantes aftermarket (Garrett, Precision Turbo, HKS, etc.)
- **Patrones de pernos:** Estándares de la industria automotriz
- **Espacios de motor:** Estimaciones basadas en dimensiones reales

---

## Contacto para Dudas

Si encuentras inconsistencias o tienes dudas sobre casos específicos, por favor documéntalos con:
1. ID del vehículo
2. ID de la pieza
3. Razón de incompatibilidad indicada
4. Tu análisis de por qué podría ser incorrecto

---

**Fecha de generación:** 1 de diciembre de 2025
**Versión del catálogo:** 274 piezas, 12 vehículos
**Total de evaluaciones:** 3,288
