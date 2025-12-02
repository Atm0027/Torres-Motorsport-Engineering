/**
 * Script para analizar TODOS los materiales de modelos específicos
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const vehiclesDir = join(__dirname, '..', 'public', 'models', 'vehicles');

function analyzeGLB(filePath) {
    const buffer = readFileSync(filePath);
    const jsonChunkLength = buffer.readUInt32LE(12);
    const jsonData = buffer.toString('utf8', 20, 20 + jsonChunkLength);
    return JSON.parse(jsonData);
}

const problematicVehicles = ['nissan-skyline-r34', 'honda-nsx', 'mazda-rx7-fd'];

for (const vehicleId of problematicVehicles) {
    const glbPath = join(vehiclesDir, vehicleId, 'base.glb');
    const gltf = analyzeGLB(glbPath);

    console.log(`\n${'='.repeat(70)}`);
    console.log(`🚗 ${vehicleId.toUpperCase()} - TODOS LOS MATERIALES`);
    console.log(`${'='.repeat(70)}`);

    if (gltf.materials) {
        gltf.materials.forEach((mat, idx) => {
            const name = mat.name || `Material_${idx}`;
            const hasBaseColorTexture = mat.pbrMetallicRoughness?.baseColorTexture !== undefined;
            const baseColor = mat.pbrMetallicRoughness?.baseColorFactor;

            let colorStr = '';
            if (baseColor) {
                colorStr = `RGBA(${baseColor.map(c => (c * 255).toFixed(0)).join(', ')})`;
            }

            const textureIcon = hasBaseColorTexture ? '🖼️ TEXTURA' : '🎨 COLOR';
            console.log(`  [${idx.toString().padStart(2)}] ${name}`);
            console.log(`       ${textureIcon} ${colorStr}`);
        });
    }

    // También mostrar los meshes y sus materiales asociados
    console.log(`\n📐 MESHES Y SUS MATERIALES:`);
    if (gltf.meshes) {
        gltf.meshes.forEach((mesh, meshIdx) => {
            const meshName = mesh.name || `Mesh_${meshIdx}`;
            if (mesh.primitives) {
                mesh.primitives.forEach((prim, primIdx) => {
                    if (prim.material !== undefined) {
                        const matName = gltf.materials[prim.material]?.name || `Material_${prim.material}`;
                        console.log(`  ${meshName} → ${matName}`);
                    }
                });
            }
        });
    }
}

console.log(`\n${'='.repeat(70)}`);
console.log('ANÁLISIS COMPLETADO');
console.log(`${'='.repeat(70)}`);
