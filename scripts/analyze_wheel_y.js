import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

async function analyzeWheelPositions() {
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
    const doc = await io.read('./public/models/vehicles/nissan-skyline-r34/base.glb');

    console.log('\n=== ANÁLISIS DETALLADO DE POSICIONES DE RUEDA ===\n');

    for (const mesh of doc.getRoot().listMeshes()) {
        for (const prim of mesh.listPrimitives()) {
            const mat = prim.getMaterial();
            if (mat?.getName()?.toLowerCase() !== 'body_main') continue;

            const pos = prim.getAttribute('POSITION');
            if (!pos) continue;

            const posArr = pos.getArray();
            const vertCount = pos.getCount();

            // Agrupar vértices por posición X (delantera vs trasera)
            const frontWheelVerts = []; // X > 2.0
            const rearWheelVerts = [];  // X < 1.5

            // Filtrar por altura Z típica de llanta
            const Z_MIN = 0.30;
            const Z_MAX = 0.80;

            for (let i = 0; i < vertCount; i++) {
                const x = posArr[i * 3];
                const y = posArr[i * 3 + 1];
                const z = posArr[i * 3 + 2];

                if (z >= Z_MIN && z <= Z_MAX) {
                    if (x > 2.0 && x < 2.5) {
                        frontWheelVerts.push({ x, y, z });
                    } else if (x > 1.0 && x < 1.5) {
                        rearWheelVerts.push({ x, y, z });
                    }
                }
            }

            console.log('RUEDAS DELANTERAS (X > 2.0):');
            console.log(`  Total vértices: ${frontWheelVerts.length}`);
            if (frontWheelVerts.length > 0) {
                const yValues = frontWheelVerts.map(v => v.y);
                const minY = Math.min(...yValues);
                const maxY = Math.max(...yValues);
                console.log(`  Rango Y: ${minY.toFixed(3)} a ${maxY.toFixed(3)}`);

                // Histograma de Y
                const buckets = {};
                for (const v of frontWheelVerts) {
                    const bucket = Math.floor(v.y * 10) / 10; // Redondear a 0.1
                    buckets[bucket] = (buckets[bucket] || 0) + 1;
                }
                console.log('  Distribución Y:');
                Object.keys(buckets).sort((a, b) => parseFloat(a) - parseFloat(b)).forEach(k => {
                    console.log(`    Y=${k}: ${buckets[k]} vértices`);
                });
            }

            console.log('\nRUEDAS TRASERAS (X < 1.5):');
            console.log(`  Total vértices: ${rearWheelVerts.length}`);
            if (rearWheelVerts.length > 0) {
                const yValues = rearWheelVerts.map(v => v.y);
                const minY = Math.min(...yValues);
                const maxY = Math.max(...yValues);
                console.log(`  Rango Y: ${minY.toFixed(3)} a ${maxY.toFixed(3)}`);

                // Histograma de Y
                const buckets = {};
                for (const v of rearWheelVerts) {
                    const bucket = Math.floor(v.y * 10) / 10;
                    buckets[bucket] = (buckets[bucket] || 0) + 1;
                }
                console.log('  Distribución Y:');
                Object.keys(buckets).sort((a, b) => parseFloat(a) - parseFloat(b)).forEach(k => {
                    console.log(`    Y=${k}: ${buckets[k]} vértices`);
                });
            }
        }
    }
}

analyzeWheelPositions();
