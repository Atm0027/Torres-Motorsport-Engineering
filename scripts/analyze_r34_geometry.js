// Script para analizar la geometría del R34 y encontrar las posiciones de las ruedas
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

async function analyzeModel() {
    const doc = await io.read('./public/models/vehicles/nissan-skyline-r34/base.glb');
    const root = doc.getRoot();

    console.log('\n=== ANÁLISIS DE GEOMETRÍA DEL R34 ===\n');

    // Buscar el mesh body_main
    for (const mesh of root.listMeshes()) {
        for (const prim of mesh.listPrimitives()) {
            const mat = prim.getMaterial();
            const matName = mat?.getName() || 'unnamed';

            if (matName.toLowerCase() === 'body_main') {
                console.log(`Mesh: ${mesh.getName()}`);
                console.log(`Material: ${matName}`);

                const position = prim.getAttribute('POSITION');
                if (!position) continue;

                const posArray = position.getArray();
                const vertexCount = position.getCount();

                console.log(`Vértices: ${vertexCount}\n`);

                // Analizar distribución de vértices por altura (Y)
                const yDistribution = {};
                const heightBuckets = [0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8];

                let minX = Infinity, maxX = -Infinity;
                let minY = Infinity, maxY = -Infinity;
                let minZ = Infinity, maxZ = -Infinity;

                // Encontrar vértices que podrían ser ruedas (altura típica de llanta)
                const potentialWheelVerts = [];

                for (let i = 0; i < vertexCount; i++) {
                    const x = posArray[i * 3];
                    const y = posArray[i * 3 + 1];
                    const z = posArray[i * 3 + 2];

                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                    minZ = Math.min(minZ, z);
                    maxZ = Math.max(maxZ, z);

                    // Altura típica de llanta (centro alrededor de 0.4-0.6)
                    if (y >= 0.3 && y <= 0.75) {
                        potentialWheelVerts.push({ x, y, z });
                    }
                }

                console.log('Bounding Box:');
                console.log(`  X: ${minX.toFixed(3)} a ${maxX.toFixed(3)} (largo: ${(maxX - minX).toFixed(3)})`);
                console.log(`  Y: ${minY.toFixed(3)} a ${maxY.toFixed(3)} (alto: ${(maxY - minY).toFixed(3)})`);
                console.log(`  Z: ${minZ.toFixed(3)} a ${maxZ.toFixed(3)} (ancho: ${(maxZ - minZ).toFixed(3)})`);

                console.log(`\nVértices en altura de rueda (Y: 0.3-0.75): ${potentialWheelVerts.length}`);

                // Agrupar por posición XZ para encontrar clusters (ruedas)
                // Las ruedas son circulares, así que deberían tener muchos vértices en posiciones XZ similares

                const clusters = [];
                const clusterRadius = 0.15;

                for (const vert of potentialWheelVerts) {
                    let foundCluster = false;
                    for (const cluster of clusters) {
                        const dx = vert.x - cluster.cx;
                        const dz = vert.z - cluster.cz;
                        if (dx * dx + dz * dz < clusterRadius * clusterRadius) {
                            cluster.verts.push(vert);
                            // Actualizar centro
                            cluster.cx = cluster.verts.reduce((s, v) => s + v.x, 0) / cluster.verts.length;
                            cluster.cz = cluster.verts.reduce((s, v) => s + v.z, 0) / cluster.verts.length;
                            foundCluster = true;
                            break;
                        }
                    }
                    if (!foundCluster) {
                        clusters.push({ cx: vert.x, cz: vert.z, verts: [vert] });
                    }
                }

                // Filtrar clusters con más de 50 vértices (probablemente ruedas)
                const wheelClusters = clusters.filter(c => c.verts.length > 50);

                console.log(`\nClusters potenciales de ruedas (>50 vértices):`);
                wheelClusters.sort((a, b) => b.verts.length - a.verts.length);

                for (let i = 0; i < Math.min(8, wheelClusters.length); i++) {
                    const c = wheelClusters[i];
                    const minY = Math.min(...c.verts.map(v => v.y));
                    const maxY = Math.max(...c.verts.map(v => v.y));
                    console.log(`  Cluster ${i + 1}: Centro (${c.cx.toFixed(3)}, ${c.cz.toFixed(3)}) - ${c.verts.length} vértices - Y: ${minY.toFixed(3)}-${maxY.toFixed(3)}`);
                }

                // También analizar las 4 esquinas del coche (donde estarían las ruedas)
                const corners = [
                    { name: 'Frontal Der', x: maxX - 0.3, z: maxZ - 0.3 },
                    { name: 'Frontal Izq', x: maxX - 0.3, z: minZ + 0.3 },
                    { name: 'Trasera Der', x: minX + 0.3, z: maxZ - 0.3 },
                    { name: 'Trasera Izq', x: minX + 0.3, z: minZ + 0.3 },
                ];

                console.log('\nAnálisis por esquinas del coche:');
                for (const corner of corners) {
                    const nearVerts = potentialWheelVerts.filter(v => {
                        const dx = v.x - corner.x;
                        const dz = v.z - corner.z;
                        return dx * dx + dz * dz < 0.5 * 0.5;
                    });
                    console.log(`  ${corner.name} (${corner.x.toFixed(2)}, ${corner.z.toFixed(2)}): ${nearVerts.length} vértices`);
                }
            }
        }
    }
}

analyzeModel().catch(console.error);
