/**
 * TORRES MOTORSPORT ENGINEERING
 * Script para generar el SQL de migración de piezas
 * 
 * Ejecutar: node database/generate-parts-seed.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Leer el archivo de piezas
const partsPath = join(__dirname, '..', 'src', 'data', 'parts.ts')
const partsContent = readFileSync(partsPath, 'utf-8')

// Extraer el array de piezas usando regex
// Buscar desde "export const partsCatalog: Part[] = [" hasta el último "]"
const partsMatch = partsContent.match(/export const partsCatalog:\s*Part\[\]\s*=\s*\[([\s\S]*?)\n\]\s*$/m)

if (!partsMatch) {
    console.error('No se pudo encontrar el array de piezas')
    process.exit(1)
}

// Función para escapar strings SQL
function escapeSql(str) {
    if (str === null || str === undefined) return 'NULL'
    return `'${String(str).replace(/'/g, "''")}'`
}

// Función para convertir objeto a JSONB
function toJsonb(obj) {
    if (!obj || Object.keys(obj).length === 0) return "'{}'"
    return `'${JSON.stringify(obj).replace(/'/g, "''")}'`
}

// Parsear cada pieza del archivo TypeScript
// Usamos una aproximación: evaluar cada objeto como JSON
const partsArrayStr = partsMatch[1]

// Dividir por objetos (cada uno empieza con '{' y termina con '},')
const partBlocks = []
let depth = 0
let currentBlock = ''
let inString = false
let escapeNext = false

for (let i = 0; i < partsArrayStr.length; i++) {
    const char = partsArrayStr[i]

    if (escapeNext) {
        currentBlock += char
        escapeNext = false
        continue
    }

    if (char === '\\') {
        currentBlock += char
        escapeNext = true
        continue
    }

    if (char === "'" || char === '"' || char === '`') {
        inString = !inString
    }

    if (!inString) {
        if (char === '{') {
            if (depth === 0) {
                currentBlock = ''
            }
            depth++
        }
        if (char === '}') {
            depth--
            if (depth === 0) {
                currentBlock += char
                partBlocks.push(currentBlock)
                currentBlock = ''
                continue
            }
        }
    }

    if (depth > 0) {
        currentBlock += char
    }
}

console.log(`Encontradas ${partBlocks.length} piezas`)

// Generar SQL para cada pieza
let sql = `-- ============================================
-- TORRES MOTORSPORT ENGINEERING - PARTS SEED DATA
-- Generado automáticamente desde parts.ts
-- Total de piezas: ${partBlocks.length}
-- ============================================

INSERT INTO parts (id, name, brand, category, price, weight, description, compatibility, stats)
VALUES
`

const values = []

for (const block of partBlocks) {
    try {
        // Convertir TypeScript a JSON válido
        let jsonStr = block
            // Quitar comentarios de línea
            .replace(/\/\/.*$/gm, '')
            // Quitar comentarios de bloque
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Añadir comillas a las keys
            .replace(/(\s*)(\w+)(\s*:)/g, '$1"$2"$3')
            // Convertir comillas simples a dobles
            .replace(/'/g, '"')
            // Quitar comas finales antes de }
            .replace(/,(\s*[}\]])/g, '$1')

        // Intentar parsear
        const part = JSON.parse(jsonStr)

        const value = `(
    ${escapeSql(part.id)},
    ${escapeSql(part.name)},
    ${escapeSql(part.brand)},
    ${escapeSql(part.category)},
    ${part.price || 0},
    ${part.weight || 0},
    ${escapeSql(part.description)},
    ${toJsonb(part.compatibility)},
    ${toJsonb(part.stats)}
)`
        values.push(value)
    } catch (e) {
        // Intentar extraer datos manualmente con regex
        const idMatch = block.match(/id:\s*['"]([^'"]+)['"]/)
        const nameMatch = block.match(/name:\s*['"]([^'"]+)['"]/)
        const brandMatch = block.match(/brand:\s*['"]([^'"]+)['"]/)
        const categoryMatch = block.match(/category:\s*['"]([^'"]+)['"]/)
        const priceMatch = block.match(/price:\s*(\d+)/)
        const weightMatch = block.match(/weight:\s*([\d.]+)/)
        const descMatch = block.match(/description:\s*['"]([^'"]+)['"]/)

        if (idMatch && nameMatch) {
            // Extraer compatibility
            const compatMatch = block.match(/compatibility:\s*\{([^}]+)\}/)
            let compatibility = {}
            if (compatMatch) {
                const mountTypesMatch = compatMatch[1].match(/mountTypes:\s*\[([^\]]+)\]/)
                const drivetrainsMatch = compatMatch[1].match(/drivetrains:\s*\[([^\]]+)\]/)
                const layoutsMatch = compatMatch[1].match(/engineLayouts:\s*\[([^\]]+)\]/)
                const minBaySizeMatch = compatMatch[1].match(/minEngineBaySize:\s*(\d+)/)

                if (mountTypesMatch) {
                    compatibility.mountTypes = mountTypesMatch[1].match(/'([^']+)'/g)?.map(s => s.replace(/'/g, '')) || []
                }
                if (drivetrainsMatch) {
                    compatibility.drivetrains = drivetrainsMatch[1].match(/'([^']+)'/g)?.map(s => s.replace(/'/g, '')) || []
                }
                if (layoutsMatch) {
                    compatibility.engineLayouts = layoutsMatch[1].match(/'([^']+)'/g)?.map(s => s.replace(/'/g, '')) || []
                }
                if (minBaySizeMatch) {
                    compatibility.minEngineBaySize = parseInt(minBaySizeMatch[1])
                }
            }

            // Extraer stats
            const statsMatch = block.match(/stats:\s*\{([^}]+)\}/)
            let stats = {}
            if (statsMatch) {
                const hpAddMatch = statsMatch[1].match(/horsepowerAdd:\s*([\d.-]+)/)
                const hpMultMatch = statsMatch[1].match(/horsepowerMultiplier:\s*([\d.]+)/)
                const torqueAddMatch = statsMatch[1].match(/torqueAdd:\s*([\d.-]+)/)
                const revLimitMatch = statsMatch[1].match(/revLimit:\s*(\d+)/)
                const boostMatch = statsMatch[1].match(/boostPressure:\s*([\d.]+)/)
                const weightRedMatch = statsMatch[1].match(/weightReduction:\s*([\d.-]+)/)

                if (hpAddMatch) stats.horsepowerAdd = parseFloat(hpAddMatch[1])
                if (hpMultMatch) stats.horsepowerMultiplier = parseFloat(hpMultMatch[1])
                if (torqueAddMatch) stats.torqueAdd = parseFloat(torqueAddMatch[1])
                if (revLimitMatch) stats.revLimit = parseInt(revLimitMatch[1])
                if (boostMatch) stats.boostPressure = parseFloat(boostMatch[1])
                if (weightRedMatch) stats.weightReduction = parseFloat(weightRedMatch[1])
            }

            const value = `(
    ${escapeSql(idMatch[1])},
    ${escapeSql(nameMatch[1])},
    ${escapeSql(brandMatch ? brandMatch[1] : 'Torres Motorsport')},
    ${escapeSql(categoryMatch ? categoryMatch[1] : 'other')},
    ${priceMatch ? priceMatch[1] : 0},
    ${weightMatch ? weightMatch[1] : 0},
    ${escapeSql(descMatch ? descMatch[1] : '')},
    ${toJsonb(compatibility)},
    ${toJsonb(stats)}
)`
            values.push(value)
        } else {
            console.warn('No se pudo parsear bloque:', block.substring(0, 100))
        }
    }
}

sql += values.join(',\n')
sql += `

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    brand = EXCLUDED.brand,
    price = EXCLUDED.price,
    weight = EXCLUDED.weight,
    description = EXCLUDED.description,
    compatibility = EXCLUDED.compatibility,
    stats = EXCLUDED.stats,
    updated_at = NOW();
`

// Guardar el archivo SQL
const outputPath = join(__dirname, 'seed_parts.sql')
writeFileSync(outputPath, sql)

console.log(`✅ Archivo generado: ${outputPath}`)
console.log(`   Total de piezas insertadas: ${values.length}`)
