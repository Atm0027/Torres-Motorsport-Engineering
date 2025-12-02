/**
 * Script para renombrar materiales en modelos GLB
 * Esto facilita la identificación de zonas (carrocería, llantas, etc.)
 */

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import * as path from 'path';
import * as fs from 'fs';

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

// Directorio de modelos
const modelsDir = './public/models/vehicles';

// Configuración de renombrado por vehículo
// Basado en el análisis de materiales de cada modelo
const vehicleConfigs = {
    'nissan-skyline-r34': {
        // Materiales genéricos - renombrar basado en propiedades
        materialRenames: {
            // El material principal de carrocería suele ser el más grande y con color
            'Material': 'glass_main',           // Material con BLEND = cristal
            'Material.001': 'body_main',        // Material opaco principal = carrocería
            'Material.002': 'interior_main',    // Interior
            'Material.003': 'plastic_black',    // Plástico negro
            'Material.004': 'chrome_trim',      // Cromo
            'Material.005': 'wheel_rim',        // Llantas
            'Material.006': 'glass_lights',     // Cristales faros
            'Material.008': 'tire_rubber',      // Neumáticos
            'Material.009': 'lights_housing',   // Faros
            'Material.010': 'brake_disc',       // Discos de freno
            'Material.011': 'body_secondary',   // Carrocería secundaria
            'Material.012': 'body_paint',       // Pintura principal
            'Material.013': 'caliper_red',      // Pinzas de freno
            'Material.015': 'exhaust_metal',    // Escape
            'Material.032': 'badge_logo',       // Logos/badges
        }
    },
    'honda-nsx': {
        materialRenames: {
            'material_0': 'body_paint',         // Carrocería principal
            'Material.002': 'interior_main',    // Interior
            'Material.003': 'wheel_rim',        // Llantas
            'Material.004': 'glass_main',       // Cristales
            'Material.005': 'plastic_black',    // Plástico negro
            'Material.006': 'chrome_trim',      // Cromo
            'Material.007': 'glass_lights',     // Cristales faros
            'Material.008': 'brake_disc',       // Discos freno
            'Material.009': 'lights_housing',   // Faros
            'Material.010': 'body_secondary',   // Carrocería secundaria
            'Material.011': 'tire_rubber',      // Neumáticos
            'Material.013': 'exhaust_metal',    // Escape
            'Material.018': 'caliper_brake',    // Pinzas freno
        }
    },
    'mazda-rx7-fd': {
        materialRenames: {
            'Material': 'body_paint',           // Carrocería principal
            'Material.001': 'body_secondary',   // Carrocería secundaria
            'Material.002': 'glass_main',       // Cristales
            'Material.003': 'interior_main',    // Interior
            'Material.005': 'plastic_black',    // Plástico negro
            'Material.006': 'wheel_rim',        // Llantas
            'Material.007': 'chrome_trim',      // Cromo
            'Material.008': 'glass_lights',     // Cristales faros
            'Material.009': 'tire_rubber',      // Neumáticos
            'Material.016': 'lights_rear',      // Pilotos traseros
            'Material.017': 'exhaust_metal',    // Escape
            'Material.018': 'brake_disc',       // Discos freno
            'Material.019': 'lights_front',     // Faros delanteros
        }
    }
};

async function processModel(vehicleId) {
    const config = vehicleConfigs[vehicleId];
    if (!config) {
        console.log(`⏭️  ${vehicleId}: Sin configuración, saltando...`);
        return;
    }

    const modelPath = path.join(modelsDir, vehicleId, 'base.glb');
    const backupPath = path.join(modelsDir, vehicleId, 'base.original.glb');

    if (!fs.existsSync(modelPath)) {
        console.log(`❌ ${vehicleId}: Modelo no encontrado`);
        return;
    }

    // Crear backup si no existe
    if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(modelPath, backupPath);
        console.log(`📦 ${vehicleId}: Backup creado`);
    }

    try {
        // Cargar modelo
        const document = await io.read(modelPath);
        const root = document.getRoot();

        let renamed = 0;

        // Renombrar materiales
        for (const material of root.listMaterials()) {
            const oldName = material.getName();
            const newName = config.materialRenames[oldName];

            if (newName) {
                material.setName(newName);
                console.log(`   ✏️  "${oldName}" → "${newName}"`);
                renamed++;
            }
        }

        if (renamed > 0) {
            // Guardar modelo modificado
            await io.write(modelPath, document);
            console.log(`✅ ${vehicleId}: ${renamed} materiales renombrados`);
        } else {
            console.log(`⚠️  ${vehicleId}: Ningún material coincidió para renombrar`);
        }

    } catch (error) {
        console.error(`❌ ${vehicleId}: Error - ${error.message}`);
    }
}

async function main() {
    console.log('🔧 Iniciando renombrado de materiales en modelos GLB...\n');

    // Procesar solo los modelos con materiales genéricos
    const vehiclesToProcess = ['nissan-skyline-r34', 'honda-nsx', 'mazda-rx7-fd'];

    for (const vehicleId of vehiclesToProcess) {
        console.log(`\n📁 Procesando ${vehicleId}...`);
        await processModel(vehicleId);
    }

    console.log('\n✨ Proceso completado!');
}

main().catch(console.error);
