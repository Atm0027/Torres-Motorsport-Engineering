/**
 * Script para analizar los materiales de los modelos GLB
 * Ejecutar con: node scripts/analyze-materials.mjs
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const vehiclesDir = join(__dirname, '..', 'public', 'models', 'vehicles');

// Función para parsear GLB y extraer materiales
function analyzeGLB(filePath, vehicleName) {
    try {
        const buffer = readFileSync(filePath);

        // GLB header: magic (4 bytes) + version (4 bytes) + length (4 bytes)
        const magic = buffer.toString('ascii', 0, 4);
        if (magic !== 'glTF') {
            console.log(`${vehicleName}: No es un archivo GLB válido`);
            return null;
        }

        // Leer el JSON chunk
        const jsonChunkLength = buffer.readUInt32LE(12);
        const jsonChunkType = buffer.readUInt32LE(16);

        if (jsonChunkType !== 0x4E4F534A) {
            console.log(`${vehicleName}: Formato de chunk inválido`);
            return null;
        }

        const jsonData = buffer.toString('utf8', 20, 20 + jsonChunkLength);
        const gltf = JSON.parse(jsonData);

        return gltf.materials || [];
    } catch (error) {
        console.error(`Error leyendo ${filePath}:`, error.message);
        return null;
    }
}

// Clasificar material por nombre
function classifyMaterial(name) {
    const lower = name.toLowerCase();

    // Pintura de carrocería
    if (lower.includes('carpaint') || lower.includes('car_paint') || lower.includes('body_paint') || lower.includes('paint_max')) {
        return 'CARROCERÍA';
    }

    // Llantas/Rims
    if (lower.includes('rim') || lower.includes('wheel')) {
        if (lower.includes('badge')) return 'BADGE LLANTA';
        if (lower.includes('notint') || lower.includes('no_tint')) return 'LLANTA (sin tinte)';
        return 'LLANTA';
    }

    // Pinzas de freno
    if (lower.includes('caliper') || lower.includes('calliper') || lower.includes('brake')) {
        if (lower.includes('disc') || lower.includes('rotor')) return 'DISCO FRENO';
        return 'PINZA FRENO';
    }

    // Interior
    if (lower.includes('interior') || lower.includes('seat') || lower.includes('steering') || lower.includes('dashboard')) {
        return 'INTERIOR';
    }

    // Vidrios
    if (lower.includes('glass') || lower.includes('window')) {
        return 'VIDRIO';
    }

    // Luces
    if (lower.includes('light') || lower.includes('lamp') || lower.includes('bucket')) {
        return 'LUCES';
    }

    // Plásticos
    if (lower.includes('plastic') || lower.includes('rubber') || lower.includes('grill')) {
        return 'PLÁSTICO';
    }

    // Chasis/estructura
    if (lower.includes('chassis') || lower.includes('engine') || lower.includes('exhaust')) {
        return 'ESTRUCTURA';
    }

    // Chrome/metal
    if (lower.includes('chrome') || lower.includes('nickel') || lower.includes('aluminum') || lower.includes('metal')) {
        return 'METAL';
    }

    // Badges
    if (lower.includes('badge') || lower.includes('emblem') || lower.includes('logo')) {
        return 'BADGE';
    }

    // Neumáticos
    if (lower.includes('tire') || lower.includes('tyre')) {
        return 'NEUMÁTICO';
    }

    return 'OTROS';
}

console.log('='.repeat(80));
console.log('ANÁLISIS DE MATERIALES DE MODELOS GLB');
console.log('='.repeat(80));

// Obtener todos los vehículos
const vehicles = readdirSync(vehiclesDir).filter(name => {
    const fullPath = join(vehiclesDir, name);
    return existsSync(join(fullPath, 'base.glb'));
});

const materialConfigs = {};

for (const vehicleId of vehicles) {
    const glbPath = join(vehiclesDir, vehicleId, 'base.glb');
    const materials = analyzeGLB(glbPath, vehicleId);

    if (!materials || materials.length === 0) {
        console.log(`\n⚠️ ${vehicleId}: Sin materiales encontrados`);
        continue;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚗 ${vehicleId.toUpperCase()}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total materiales: ${materials.length}`);

    // Clasificar materiales
    const classified = {
        'CARROCERÍA': [],
        'LLANTA': [],
        'LLANTA (sin tinte)': [],
        'BADGE LLANTA': [],
        'PINZA FRENO': [],
        'DISCO FRENO': [],
        'INTERIOR': [],
        'VIDRIO': [],
        'LUCES': [],
        'PLÁSTICO': [],
        'ESTRUCTURA': [],
        'METAL': [],
        'BADGE': [],
        'NEUMÁTICO': [],
        'OTROS': []
    };

    materials.forEach((mat, idx) => {
        const name = mat.name || `Material_${idx}`;
        const category = classifyMaterial(name);

        // Verificar si tiene texturas
        const hasTexture = mat.pbrMetallicRoughness?.baseColorTexture !== undefined;

        classified[category].push({
            name,
            hasTexture,
            color: mat.pbrMetallicRoughness?.baseColorFactor
        });
    });

    // Mostrar solo las categorías relevantes
    const relevantCategories = ['CARROCERÍA', 'LLANTA', 'LLANTA (sin tinte)', 'PINZA FRENO', 'INTERIOR'];

    for (const category of relevantCategories) {
        if (classified[category].length > 0) {
            console.log(`\n📦 ${category}:`);
            classified[category].forEach(mat => {
                const textureIcon = mat.hasTexture ? '🖼️' : '🎨';
                console.log(`   ${textureIcon} ${mat.name}`);
            });
        }
    }

    // Generar configuración sugerida
    materialConfigs[vehicleId] = {
        body: classified['CARROCERÍA']
            .filter(m => !m.hasTexture)  // Solo los que NO tienen textura
            .map(m => m.name.toLowerCase()),
        wheels: [...classified['LLANTA'], ...classified['LLANTA (sin tinte)']]
            .filter(m => !m.hasTexture)
            .map(m => m.name.toLowerCase()),
        calipers: classified['PINZA FRENO']
            .filter(m => !m.hasTexture)
            .map(m => m.name.toLowerCase()),
        interior: classified['INTERIOR']
            .filter(m => !m.hasTexture)
            .map(m => m.name.toLowerCase())
    };
}

console.log(`\n${'='.repeat(80)}`);
console.log('📋 CONFIGURACIÓN SUGERIDA PARA Vehicle3DCanvas.tsx');
console.log('='.repeat(80));
console.log('\nconst vehicleMaterialConfig = {');

for (const [vehicleId, config] of Object.entries(materialConfigs)) {
    console.log(`    '${vehicleId}': {`);
    console.log(`        body: [${config.body.map(n => `'${n}'`).join(', ')}],`);
    console.log(`        wheels: [${config.wheels.map(n => `'${n}'`).join(', ')}],`);
    console.log(`        calipers: [${config.calipers.map(n => `'${n}'`).join(', ')}],`);
    console.log(`        interior: [${config.interior.map(n => `'${n}'`).join(', ')}]`);
    console.log(`    },`);
}

console.log('};');
