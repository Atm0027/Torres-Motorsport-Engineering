/**
 * Script para analizar en profundidad los materiales de los modelos GLB
 * Muestra: nombre del material, color original, nombre del mesh, y área aproximada
 */

import { promises as fs } from 'fs'
import path from 'path'

// Función para leer archivo GLB y extraer información de materiales
async function analyzeGLB(filePath) {
    const buffer = await fs.readFile(filePath)
    const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)

    // GLB header
    const magic = dataView.getUint32(0, true)
    if (magic !== 0x46546C67) { // 'glTF'
        throw new Error('Not a valid GLB file')
    }

    const version = dataView.getUint32(4, true)
    const length = dataView.getUint32(8, true)

    // Chunk 0 (JSON)
    const chunk0Length = dataView.getUint32(12, true)
    const chunk0Type = dataView.getUint32(16, true)

    const jsonData = new TextDecoder().decode(
        buffer.slice(20, 20 + chunk0Length)
    )

    const gltf = JSON.parse(jsonData)

    return gltf
}

// Convertir color de factor [r,g,b,a] a hex
function colorToHex(colorFactor) {
    if (!colorFactor) return '#ffffff'
    const r = Math.round((colorFactor[0] || 1) * 255)
    const g = Math.round((colorFactor[1] || 1) * 255)
    const b = Math.round((colorFactor[2] || 1) * 255)
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Analizar un modelo
async function analyzeModel(vehicleId) {
    const modelsDir = path.join(process.cwd(), 'public', 'models', 'vehicles', vehicleId)
    const glbPath = path.join(modelsDir, 'base.glb')

    try {
        await fs.access(glbPath)
    } catch {
        console.log(`❌ No existe: ${glbPath}`)
        return null
    }

    console.log(`\n${'='.repeat(70)}`)
    console.log(`📦 ANÁLISIS DETALLADO: ${vehicleId.toUpperCase()}`)
    console.log(`${'='.repeat(70)}`)

    const gltf = await analyzeGLB(glbPath)

    // Mapear materiales
    const materials = gltf.materials || []
    const meshes = gltf.meshes || []
    const nodes = gltf.nodes || []
    const accessors = gltf.accessors || []
    const bufferViews = gltf.bufferViews || []

    // Crear mapa de material index -> info
    const materialInfo = materials.map((mat, idx) => {
        const pbr = mat.pbrMetallicRoughness || {}
        const baseColor = pbr.baseColorFactor || [1, 1, 1, 1]
        const hasTexture = !!pbr.baseColorTexture

        return {
            index: idx,
            name: mat.name || `Material_${idx}`,
            color: colorToHex(baseColor),
            colorRaw: baseColor,
            hasTexture,
            metallic: pbr.metallicFactor ?? 1,
            roughness: pbr.roughnessFactor ?? 1,
            meshes: [],
            totalVertices: 0
        }
    })

    // Encontrar qué meshes usan cada material
    nodes.forEach((node, nodeIdx) => {
        if (node.mesh !== undefined) {
            const mesh = meshes[node.mesh]
            if (mesh && mesh.primitives) {
                mesh.primitives.forEach(prim => {
                    const matIdx = prim.material
                    if (matIdx !== undefined && materialInfo[matIdx]) {
                        const meshName = mesh.name || node.name || `Node_${nodeIdx}`
                        materialInfo[matIdx].meshes.push(meshName)

                        // Contar vértices para estimar tamaño
                        if (prim.attributes && prim.attributes.POSITION !== undefined) {
                            const accessor = accessors[prim.attributes.POSITION]
                            if (accessor) {
                                materialInfo[matIdx].totalVertices += accessor.count || 0
                            }
                        }
                    }
                })
            }
        }
    })

    // Ordenar por cantidad de vértices (las partes más grandes primero)
    materialInfo.sort((a, b) => b.totalVertices - a.totalVertices)

    console.log(`\n📊 MATERIALES ORDENADOS POR TAMAÑO (vértices):`)
    console.log(`${'─'.repeat(70)}`)

    materialInfo.forEach((mat, i) => {
        const sizeIndicator = mat.totalVertices > 10000 ? '🔴 GRANDE' :
            mat.totalVertices > 1000 ? '🟡 MEDIO' : '🟢 PEQUEÑO'

        const textureIndicator = mat.hasTexture ? '📷 TEXTURA' : '🎨 COLOR'

        // Determinar si parece carrocería por el color
        const r = mat.colorRaw[0]
        const g = mat.colorRaw[1]
        const b = mat.colorRaw[2]
        const brightness = (r + g + b) / 3
        const isNotBlack = brightness > 0.05
        const isNotWhite = brightness < 0.95
        const hasColor = Math.max(r, g, b) - Math.min(r, g, b) > 0.1

        let typeGuess = ''
        if (mat.name.toLowerCase().includes('glass') || mat.name.toLowerCase().includes('window')) {
            typeGuess = '🪟 CRISTAL'
        } else if (mat.name.toLowerCase().includes('tire') || mat.name.toLowerCase().includes('rubber')) {
            typeGuess = '⚫ NEUMÁTICO'
        } else if (mat.name.toLowerCase().includes('wheel') || mat.name.toLowerCase().includes('rim')) {
            typeGuess = '🔘 LLANTA'
        } else if (mat.name.toLowerCase().includes('light') || mat.name.toLowerCase().includes('lamp')) {
            typeGuess = '💡 LUZ'
        } else if (mat.name.toLowerCase().includes('chrome') || mat.name.toLowerCase().includes('metal')) {
            typeGuess = '✨ CROMO/METAL'
        } else if (mat.name.toLowerCase().includes('interior') || mat.name.toLowerCase().includes('seat')) {
            typeGuess = '🪑 INTERIOR'
        } else if (mat.name.toLowerCase().includes('body') || mat.name.toLowerCase().includes('paint') || mat.name.toLowerCase().includes('carroceria')) {
            typeGuess = '🚗 CARROCERÍA?'
        } else if (mat.totalVertices > 5000 && isNotBlack && isNotWhite && !mat.hasTexture) {
            typeGuess = '🚗 POSIBLE CARROCERÍA'
        } else if (mat.name.toLowerCase().includes('plastic') || mat.name.toLowerCase().includes('black')) {
            typeGuess = '⬛ PLÁSTICO'
        }

        console.log(`\n${i + 1}. ${mat.name}`)
        console.log(`   Color: ${mat.color} | Metálico: ${mat.metallic.toFixed(2)} | Rugosidad: ${mat.roughness.toFixed(2)}`)
        console.log(`   ${textureIndicator} | ${sizeIndicator} (${mat.totalVertices} vértices)`)
        console.log(`   Meshes: ${mat.meshes.slice(0, 3).join(', ')}${mat.meshes.length > 3 ? ` (+${mat.meshes.length - 3} más)` : ''}`)
        if (typeGuess) console.log(`   Tipo estimado: ${typeGuess}`)
    })

    // Sugerencias de configuración
    console.log(`\n\n💡 SUGERENCIAS DE CONFIGURACIÓN PARA ${vehicleId}:`)
    console.log(`${'─'.repeat(70)}`)

    // Encontrar probable carrocería (grande, con color, sin textura)
    const probableBody = materialInfo.find(m =>
        m.totalVertices > 3000 &&
        !m.hasTexture &&
        !m.name.toLowerCase().includes('glass') &&
        !m.name.toLowerCase().includes('window') &&
        !m.name.toLowerCase().includes('tire') &&
        !m.name.toLowerCase().includes('wheel') &&
        !m.name.toLowerCase().includes('interior') &&
        !m.name.toLowerCase().includes('chrome') &&
        !m.name.toLowerCase().includes('light') &&
        !m.name.toLowerCase().includes('plastic') &&
        !m.name.toLowerCase().includes('secondary')
    )

    const probableWheels = materialInfo.find(m =>
        m.name.toLowerCase().includes('wheel') ||
        m.name.toLowerCase().includes('rim')
    )

    const probableCalipers = materialInfo.find(m =>
        m.name.toLowerCase().includes('caliper') ||
        m.name.toLowerCase().includes('brake')
    )

    const probableInterior = materialInfo.find(m =>
        m.name.toLowerCase().includes('interior') ||
        m.name.toLowerCase().includes('seat') ||
        m.name.toLowerCase().includes('dashboard')
    )

    console.log(`
'${vehicleId}': {
    body: [${probableBody ? `'${probableBody.name}'` : '// NO ENCONTRADO - revisar manualmente'}],
    wheels: [${probableWheels ? `'${probableWheels.name}'` : '// NO ENCONTRADO'}],
    calipers: [${probableCalipers ? `'${probableCalipers.name}'` : '// NO ENCONTRADO'}],
    interior: [${probableInterior ? `'${probableInterior.name}'` : '// NO ENCONTRADO'}],
    exclude: ['chrome', 'glass', 'light', 'tire', 'rubber', 'plastic', 'secondary']
}`)

    return materialInfo
}

// Analizar modelos problemáticos
async function main() {
    const problematicVehicles = [
        'mazda-rx7-fd',
        'nissan-skyline-r34',
        'honda-nsx'
    ]

    for (const vehicle of problematicVehicles) {
        await analyzeModel(vehicle)
    }
}

main().catch(console.error)
