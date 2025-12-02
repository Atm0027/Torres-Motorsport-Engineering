import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

// Parámetros de detección (deben coincidir con el código TS)
const R34_WHEEL_CENTERS = [
    // Ruedas del lado derecho (Y positivo)
    { x: 2.30, y: 0.80, radius: 0.25 },   // Delantera derecha
    { x: 1.26, y: 0.80, radius: 0.25 },   // Trasera derecha
    // Ruedas del lado izquierdo (Y negativo)
    { x: 2.30, y: -2.30, radius: 0.25 },  // Delantera izquierda
    { x: 1.26, y: -2.30, radius: 0.25 }   // Trasera izquierda
];
const R34_WHEEL_Z_MIN = 0.32;
const R34_WHEEL_Z_MAX = 0.75;

function isPointInWheel(x, y, z) {
    if (z < R34_WHEEL_Z_MIN || z > R34_WHEEL_Z_MAX) return false;
    for (const wheel of R34_WHEEL_CENTERS) {
        const dx = x - wheel.x;
        const dy = y - wheel.y;
        const distSq = dx * dx + dy * dy;
        if (distSq <= wheel.radius * wheel.radius) return true;
    }
    return false;
}

async function test() {
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
    const doc = await io.read('./public/models/vehicles/nissan-skyline-r34/base.glb');

    let wheelTriangles = 0;
    let bodyTriangles = 0;

    // Muestras de triángulos de rueda para verificar
    const wheelSamples = [];

    for (const mesh of doc.getRoot().listMeshes()) {
        for (const prim of mesh.listPrimitives()) {
            const mat = prim.getMaterial();
            if (mat?.getName()?.toLowerCase() !== 'body_main') continue;

            const pos = prim.getAttribute('POSITION');
            const idx = prim.getIndices();
            if (!pos || !idx) continue;

            const posArr = pos.getArray();
            const idxArr = idx.getArray();

            for (let i = 0; i < idxArr.length; i += 3) {
                const i0 = idxArr[i], i1 = idxArr[i + 1], i2 = idxArr[i + 2];
                const cx = (posArr[i0 * 3] + posArr[i1 * 3] + posArr[i2 * 3]) / 3;
                const cy = (posArr[i0 * 3 + 1] + posArr[i1 * 3 + 1] + posArr[i2 * 3 + 1]) / 3;
                const cz = (posArr[i0 * 3 + 2] + posArr[i1 * 3 + 2] + posArr[i2 * 3 + 2]) / 3;

                if (isPointInWheel(cx, cy, cz)) {
                    wheelTriangles++;
                    if (wheelSamples.length < 5) {
                        wheelSamples.push({ x: cx.toFixed(3), y: cy.toFixed(3), z: cz.toFixed(3) });
                    }
                } else {
                    bodyTriangles++;
                }
            }
        }
    }

    console.log('\n=== RESULTADO DE DETECCIÓN ===\n');
    console.log('Triángulos de RUEDA:', wheelTriangles);
    console.log('Triángulos de BODY:', bodyTriangles);
    console.log('Total:', wheelTriangles + bodyTriangles);
    console.log('\nMuestras de triángulos detectados como rueda:');
    wheelSamples.forEach((s, i) => console.log(`  ${i + 1}. (${s.x}, ${s.y}, ${s.z})`));
}
test();
