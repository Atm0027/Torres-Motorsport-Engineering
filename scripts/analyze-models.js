/**
 * Script para analizar la orientación de los modelos GLB
 * Ejecutar con: node scripts/analyze-models.js
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Función simple para leer y analizar GLB
function analyzeGLB(filePath, vehicleName) {
    try {
        const buffer = readFileSync(filePath);

        // GLB header: magic (4 bytes) + version (4 bytes) + length (4 bytes)
        const magic = buffer.toString('ascii', 0, 4);
        if (magic !== 'glTF') {
            console.log(`${vehicleName}: No es un archivo GLB válido`);
            return;
        }

        // Leer el JSON chunk
        const jsonChunkLength = buffer.readUInt32LE(12);
        const jsonChunkType = buffer.readUInt32LE(16);

        if (jsonChunkType !== 0x4E4F534A) { // "JSON" en little-endian
            console.log(`${vehicleName}: Formato de chunk inválido`);
            return;
        }

        const jsonData = buffer.toString('utf8', 20, 20 + jsonChunkLength);
        const gltf = JSON.parse(jsonData);

        console.log(`\n========== ${vehicleName} ==========`);
        console.log(`Archivo: ${filePath}`);
        console.log(`Tamaño: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);

        // Analizar nodos principales
        if (gltf.nodes) {
            console.log(`\nNodos principales (${gltf.nodes.length} total):`);

            // Buscar nodos raíz (los que están en scene)
            const rootNodes = gltf.scenes?.[0]?.nodes || [];

            rootNodes.forEach(nodeIdx => {
                const node = gltf.nodes[nodeIdx];
                console.log(`  - "${node.name || 'Sin nombre'}":`);

                if (node.rotation) {
                    // Quaternion a Euler (aproximado)
                    const [x, y, z, w] = node.rotation;
                    const yaw = Math.atan2(2 * (w * y + x * z), 1 - 2 * (y * y + z * z));
                    console.log(`    Rotación Y (yaw): ${(yaw * 180 / Math.PI).toFixed(1)}°`);
                }

                if (node.translation) {
                    console.log(`    Posición: [${node.translation.map(v => v.toFixed(2)).join(', ')}]`);
                }

                if (node.scale) {
                    console.log(`    Escala: [${node.scale.map(v => v.toFixed(2)).join(', ')}]`);
                }
            });

            // Buscar nodos relacionados con partes del coche
            const carParts = ['front', 'rear', 'hood', 'trunk', 'bumper', 'headlight', 'taillight',
                'wheel', 'door', 'body', 'chassis', 'engine', 'windshield'];

            console.log(`\nPartes identificadas:`);
            gltf.nodes.forEach((node, idx) => {
                const name = (node.name || '').toLowerCase();
                const matchedPart = carParts.find(part => name.includes(part));
                if (matchedPart) {
                    let info = `  - [${idx}] "${node.name}"`;
                    if (node.translation) {
                        const [x, y, z] = node.translation;
                        // Z positivo = frente, Z negativo = atrás (convención común)
                        info += ` pos:[${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}]`;
                    }
                    console.log(info);
                }
            });
        }

        // Analizar meshes para entender la orientación
        if (gltf.meshes) {
            console.log(`\nMeshes: ${gltf.meshes.length}`);
        }

        // Buscar en accessors para encontrar las dimensiones del modelo
        if (gltf.accessors) {
            const positionAccessors = gltf.accessors.filter(a => a.type === 'VEC3' && a.max && a.min);
            if (positionAccessors.length > 0) {
                let globalMin = [Infinity, Infinity, Infinity];
                let globalMax = [-Infinity, -Infinity, -Infinity];

                positionAccessors.forEach(acc => {
                    for (let i = 0; i < 3; i++) {
                        globalMin[i] = Math.min(globalMin[i], acc.min[i]);
                        globalMax[i] = Math.max(globalMax[i], acc.max[i]);
                    }
                });

                const size = globalMax.map((max, i) => max - globalMin[i]);
                const center = globalMax.map((max, i) => (max + globalMin[i]) / 2);

                console.log(`\nDimensiones del modelo:`);
                console.log(`  Tamaño X (ancho): ${size[0].toFixed(2)}`);
                console.log(`  Tamaño Y (alto): ${size[1].toFixed(2)}`);
                console.log(`  Tamaño Z (largo): ${size[2].toFixed(2)}`);
                console.log(`  Centro: [${center.map(v => v.toFixed(2)).join(', ')}]`);

                // Determinar orientación probable
                console.log(`\nOrientación probable:`);
                if (size[2] > size[0]) {
                    console.log(`  El modelo es más largo en Z → Frente probablemente en +Z o -Z`);
                    if (center[2] > 0) {
                        console.log(`  Centro desplazado hacia +Z → Frente posiblemente en +Z`);
                    } else if (center[2] < 0) {
                        console.log(`  Centro desplazado hacia -Z → Frente posiblemente en -Z`);
                    }
                } else {
                    console.log(`  El modelo es más largo en X → Frente probablemente en +X o -X`);
                }
            }
        }

    } catch (err) {
        console.log(`${vehicleName}: Error al analizar - ${err.message}`);
    }
}

// Modelos a analizar
const modelsDir = join(__dirname, '..', 'public', 'models', 'vehicles');
const vehicles = [
    { id: 'mazda-rx7-fd', name: 'Mazda RX-7 FD' },
    { id: 'nissan-skyline-r34', name: 'Nissan Skyline R34' },
    { id: 'toyota-supra-a80', name: 'Toyota Supra A80' },
    { id: 'honda-nsx', name: 'Honda NSX' },
    { id: 'mitsubishi-evo-ix', name: 'Mitsubishi Evo IX' },
    { id: 'subaru-impreza-sti', name: 'Subaru Impreza STI' }
];

console.log('='.repeat(60));
console.log('ANÁLISIS DE ORIENTACIÓN DE MODELOS GLB');
console.log('='.repeat(60));

vehicles.forEach(vehicle => {
    const modelPath = join(modelsDir, vehicle.id, 'base.glb');
    analyzeGLB(modelPath, vehicle.name);
});

console.log('\n' + '='.repeat(60));
console.log('RECOMENDACIONES DE OFFSET:');
console.log('='.repeat(60));
console.log(`
Para determinar el offset correcto de cada modelo:

1. Si el frente del coche apunta hacia +Z (hacia la cámara): offset = 0°
2. Si el frente apunta hacia -Z (alejándose de la cámara): offset = 180°
3. Si el frente apunta hacia +X: offset = 270° (o -90°)
4. Si el frente apunta hacia -X: offset = 90°

La cámara en Three.js está en posición [0, 2, 6] mirando hacia el origen,
así que +Z es "hacia la cámara" y -Z es "alejándose".
`);
