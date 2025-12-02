#!/usr/bin/env python3
"""
Script para separar las llantas del Nissan Skyline R34
Usa pygltflib para manipular el modelo GLB directamente
"""

import struct
import json
import copy
import numpy as np
from pathlib import Path

# Rutas
BASE_DIR = Path("/Users/ftorres/Desktop/App edicion de coches/public/models/vehicles/nissan-skyline-r34")
INPUT_PATH = BASE_DIR / "base_original.glb"
OUTPUT_PATH = BASE_DIR / "base.glb"

def read_glb(filepath):
    """Leer archivo GLB y extraer JSON y datos binarios"""
    with open(filepath, 'rb') as f:
        # Header GLB
        magic = f.read(4)
        if magic != b'glTF':
            raise ValueError("No es un archivo GLB válido")
        
        version = struct.unpack('<I', f.read(4))[0]
        total_length = struct.unpack('<I', f.read(4))[0]
        
        # JSON chunk
        json_length = struct.unpack('<I', f.read(4))[0]
        json_type = f.read(4)
        json_data = json.loads(f.read(json_length).decode('utf-8'))
        
        # BIN chunk
        bin_length = struct.unpack('<I', f.read(4))[0]
        bin_type = f.read(4)
        bin_data = bytearray(f.read(bin_length))
        
    return json_data, bin_data

def write_glb(filepath, json_data, bin_data):
    """Escribir archivo GLB"""
    json_bytes = json.dumps(json_data, separators=(',', ':')).encode('utf-8')
    # Padding para alinear a 4 bytes
    json_padding = (4 - (len(json_bytes) % 4)) % 4
    json_bytes += b' ' * json_padding
    
    bin_padding = (4 - (len(bin_data) % 4)) % 4
    bin_data_padded = bytes(bin_data) + b'\x00' * bin_padding
    
    total_length = 12 + 8 + len(json_bytes) + 8 + len(bin_data_padded)
    
    with open(filepath, 'wb') as f:
        # Header
        f.write(b'glTF')
        f.write(struct.pack('<I', 2))  # version
        f.write(struct.pack('<I', total_length))
        
        # JSON chunk
        f.write(struct.pack('<I', len(json_bytes)))
        f.write(b'JSON')
        f.write(json_bytes)
        
        # BIN chunk
        f.write(struct.pack('<I', len(bin_data_padded)))
        f.write(b'BIN\x00')
        f.write(bin_data_padded)

def read_accessor_data(gltf, bin_data, accessor_idx):
    """Leer datos de un accessor"""
    accessor = gltf['accessors'][accessor_idx]
    buffer_view = gltf['bufferViews'][accessor['bufferView']]
    
    offset = buffer_view.get('byteOffset', 0) + accessor.get('byteOffset', 0)
    count = accessor['count']
    
    # Determinar tipo de componente
    component_types = {
        5120: ('b', 1),  # BYTE
        5121: ('B', 1),  # UNSIGNED_BYTE
        5122: ('h', 2),  # SHORT
        5123: ('H', 2),  # UNSIGNED_SHORT
        5125: ('I', 4),  # UNSIGNED_INT
        5126: ('f', 4),  # FLOAT
    }
    
    type_sizes = {
        'SCALAR': 1,
        'VEC2': 2,
        'VEC3': 3,
        'VEC4': 4,
        'MAT2': 4,
        'MAT3': 9,
        'MAT4': 16,
    }
    
    fmt, size = component_types[accessor['componentType']]
    num_components = type_sizes[accessor['type']]
    stride = buffer_view.get('byteStride', size * num_components)
    
    data = []
    for i in range(count):
        pos = offset + i * stride
        values = []
        for j in range(num_components):
            value = struct.unpack_from('<' + fmt, bin_data, pos + j * size)[0]
            values.append(value)
        data.append(values if num_components > 1 else values[0])
    
    return data

def write_indices_to_buffer(bin_data, indices):
    """Añadir nuevos índices al buffer y devolver offset y longitud"""
    offset = len(bin_data)
    for idx in indices:
        bin_data.extend(struct.pack('<I', idx))
    return offset, len(indices) * 4

def is_wheel_face(v0, v1, v2, wheel_centers, wheel_radius=0.30, height_range=(0.28, 0.72)):
    """
    Determinar si un triángulo pertenece a una llanta
    Basado en la distancia al centro de cada rueda
    """
    # Calcular centro del triángulo
    cx = (v0[0] + v1[0] + v2[0]) / 3
    cy = (v0[1] + v1[1] + v2[1]) / 3
    cz = (v0[2] + v1[2] + v2[2]) / 3
    
    # Verificar si está en rango de altura de las ruedas
    if not (height_range[0] < cz < height_range[1]):
        return False
    
    # Verificar si está cerca de algún centro de rueda
    for wc in wheel_centers:
        dx = cx - wc[0]
        dy = cy - wc[1]
        dist = (dx**2 + dy**2)**0.5
        
        if dist < wheel_radius:
            return True
    
    return False

def analyze_circular_geometry(vertices, indices, wheel_centers):
    """
    Analizar geometría para encontrar formas circulares (llantas)
    Las llantas tienen normales que apuntan radialmente desde el centro
    """
    wheel_faces = []
    body_faces = []
    
    # Parámetros ajustados para el R34
    wheel_radius = 0.28  # Radio más pequeño para ser más preciso
    
    for i in range(0, len(indices), 3):
        i0, i1, i2 = indices[i], indices[i+1], indices[i+2]
        v0, v1, v2 = vertices[i0], vertices[i1], vertices[i2]
        
        if is_wheel_face(v0, v1, v2, wheel_centers, wheel_radius):
            wheel_faces.extend([i0, i1, i2])
        else:
            body_faces.extend([i0, i1, i2])
    
    return wheel_faces, body_faces

def main():
    print("="*60)
    print("SEPARACIÓN DE LLANTAS - NISSAN SKYLINE R34")
    print("="*60)
    
    # Leer modelo
    print(f"\n1. Leyendo modelo: {INPUT_PATH}")
    gltf, bin_data = read_glb(INPUT_PATH)
    
    print(f"   Materiales: {len(gltf['materials'])}")
    print(f"   Meshes: {len(gltf['meshes'])}")
    
    # Encontrar el mesh body_main (mesh 0, material 1)
    # Basado en el análisis previo: body_main tiene ~18957 vértices
    body_mesh_idx = 0
    body_prim = gltf['meshes'][body_mesh_idx]['primitives'][0]
    
    print(f"\n2. Analizando mesh principal (body_main)")
    
    # Leer vértices e índices
    vertices = read_accessor_data(gltf, bin_data, body_prim['attributes']['POSITION'])
    indices = read_accessor_data(gltf, bin_data, body_prim['indices'])
    
    print(f"   Vértices: {len(vertices)}")
    print(f"   Índices: {len(indices)} ({len(indices)//3} triángulos)")
    
    # Definir centros de las ruedas (basado en análisis del modelo)
    # X: ancho del coche (1.08 - 2.45)
    # Y: largo del coche (-2.42 - 0.92)  
    # Z: altura (0.39 - 1.24)
    wheel_centers = [
        (1.21, 0.55, 0.50),   # Delantera izquierda
        (2.31, 0.55, 0.50),   # Delantera derecha  
        (1.21, -1.65, 0.50),  # Trasera izquierda
        (2.31, -1.65, 0.50),  # Trasera derecha
    ]
    
    print(f"\n3. Identificando geometría de llantas...")
    wheel_indices, body_indices = analyze_circular_geometry(vertices, indices, wheel_centers)
    
    print(f"   Triángulos de llantas: {len(wheel_indices)//3}")
    print(f"   Triángulos de carrocería: {len(body_indices)//3}")
    
    if len(wheel_indices) < 100:
        print("\n   ⚠️ Pocos triángulos de llantas encontrados.")
        print("   Ajustando parámetros y reintentando...")
        
        # Intentar con radio más grande
        wheel_centers_adjusted = [
            (1.21, 0.55, 0.50),
            (2.31, 0.55, 0.50),
            (1.21, -1.65, 0.50),
            (2.31, -1.65, 0.50),
        ]
        
        wheel_indices = []
        body_indices = []
        
        for i in range(0, len(indices), 3):
            i0, i1, i2 = indices[i], indices[i+1], indices[i+2]
            v0, v1, v2 = vertices[i0], vertices[i1], vertices[i2]
            
            is_wheel = False
            for wc in wheel_centers_adjusted:
                # Verificar cada vértice
                verts_in_wheel = 0
                for v in [v0, v1, v2]:
                    dx = v[0] - wc[0]
                    dy = v[1] - wc[1]
                    dz = v[2] - wc[2]
                    dist_xy = (dx**2 + dy**2)**0.5
                    
                    # Llanta: dentro de un cilindro vertical
                    if dist_xy < 0.32 and abs(dz) < 0.25:
                        verts_in_wheel += 1
                
                if verts_in_wheel == 3:
                    is_wheel = True
                    break
            
            if is_wheel:
                wheel_indices.extend([i0, i1, i2])
            else:
                body_indices.extend([i0, i1, i2])
        
        print(f"   Triángulos de llantas (ajustado): {len(wheel_indices)//3}")
    
    if len(wheel_indices) == 0:
        print("\n❌ No se encontraron triángulos de llantas")
        print("   El modelo puede tener las llantas en un mesh separado")
        return
    
    print(f"\n4. Creando nuevo material 'wheel_alloy'...")
    
    # Crear material wheel_alloy
    wheel_material = {
        "name": "wheel_alloy",
        "pbrMetallicRoughness": {
            "baseColorFactor": [0.75, 0.75, 0.78, 1.0],
            "metallicFactor": 0.85,
            "roughnessFactor": 0.25
        },
        "doubleSided": True
    }
    
    wheel_mat_idx = len(gltf['materials'])
    gltf['materials'].append(wheel_material)
    
    print(f"   Material añadido con índice: {wheel_mat_idx}")
    
    print(f"\n5. Creando nuevos buffers para índices separados...")
    
    # Añadir índices de carrocería al buffer
    body_offset, body_length = write_indices_to_buffer(bin_data, body_indices)
    
    # Añadir índices de llantas al buffer  
    wheel_offset, wheel_length = write_indices_to_buffer(bin_data, wheel_indices)
    
    # Crear bufferViews
    body_bv_idx = len(gltf['bufferViews'])
    gltf['bufferViews'].append({
        "buffer": 0,
        "byteOffset": body_offset,
        "byteLength": body_length,
        "target": 34963
    })
    
    wheel_bv_idx = len(gltf['bufferViews'])
    gltf['bufferViews'].append({
        "buffer": 0,
        "byteOffset": wheel_offset,
        "byteLength": wheel_length,
        "target": 34963
    })
    
    # Crear accessors
    body_acc_idx = len(gltf['accessors'])
    gltf['accessors'].append({
        "bufferView": body_bv_idx,
        "componentType": 5125,
        "count": len(body_indices),
        "type": "SCALAR"
    })
    
    wheel_acc_idx = len(gltf['accessors'])
    gltf['accessors'].append({
        "bufferView": wheel_bv_idx,
        "componentType": 5125,
        "count": len(wheel_indices),
        "type": "SCALAR"
    })
    
    print(f"\n6. Actualizando mesh con primitivos separados...")
    
    # Actualizar primitivo de carrocería
    body_prim['indices'] = body_acc_idx
    
    # Crear primitivo para llantas
    wheel_prim = {
        "attributes": copy.deepcopy(body_prim['attributes']),
        "indices": wheel_acc_idx,
        "material": wheel_mat_idx
    }
    
    # Añadir primitivo de llantas al mesh
    gltf['meshes'][body_mesh_idx]['primitives'].append(wheel_prim)
    
    # Actualizar tamaño del buffer
    gltf['buffers'][0]['byteLength'] = len(bin_data)
    
    print(f"\n7. Guardando modelo modificado: {OUTPUT_PATH}")
    write_glb(OUTPUT_PATH, gltf, bin_data)
    
    print("\n" + "="*60)
    print("✓ PROCESO COMPLETADO")
    print(f"  - Material wheel_alloy creado (índice {wheel_mat_idx})")
    print(f"  - {len(wheel_indices)//3} triángulos de llantas separados")
    print(f"  - {len(body_indices)//3} triángulos de carrocería")
    print("="*60)

if __name__ == "__main__":
    main()
