"""
Script de Blender para separar las llantas del Nissan Skyline R34
Ejecutar con: blender --background --python blender_separate_wheels.py
"""

import bpy
import bmesh
import os
from mathutils import Vector

# Rutas
INPUT_PATH = "/Users/ftorres/Desktop/App edicion de coches/public/models/vehicles/nissan-skyline-r34/base_original.glb"
OUTPUT_PATH = "/Users/ftorres/Desktop/App edicion de coches/public/models/vehicles/nissan-skyline-r34/base.glb"

def clear_scene():
    """Limpiar la escena"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    # Limpiar materiales huérfanos
    for material in bpy.data.materials:
        if not material.users:
            bpy.data.materials.remove(material)

def import_glb(filepath):
    """Importar modelo GLB"""
    bpy.ops.import_scene.gltf(filepath=filepath)
    print(f"✓ Modelo importado: {filepath}")

def create_wheel_material():
    """Crear material para las llantas"""
    mat = bpy.data.materials.new(name="wheel_alloy")
    mat.use_nodes = True
    
    # Configurar nodo Principled BSDF
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.7, 0.7, 0.75, 1.0)  # Gris metalizado
        bsdf.inputs["Metallic"].default_value = 0.85
        bsdf.inputs["Roughness"].default_value = 0.25
    
    print("✓ Material 'wheel_alloy' creado")
    return mat

def find_body_mesh():
    """Encontrar el mesh principal de la carrocería"""
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            # Buscar el mesh más grande o con nombre body_main
            for mat_slot in obj.material_slots:
                if mat_slot.material and 'body_main' in mat_slot.material.name.lower():
                    return obj
            # O el mesh con más vértices
            if len(obj.data.vertices) > 10000:
                return obj
    return None

def get_wheel_positions():
    """Definir las posiciones aproximadas de las 4 ruedas"""
    # Basado en el análisis previo del modelo
    # El R34 tiene coordenadas: X=ancho, Y=largo, Z=alto
    wheel_centers = [
        Vector((1.20, 0.65, 0.50)),   # Delantera izquierda
        Vector((2.32, 0.65, 0.50)),   # Delantera derecha
        Vector((1.20, -1.72, 0.50)),  # Trasera izquierda
        Vector((2.32, -1.72, 0.50)),  # Trasera derecha
    ]
    return wheel_centers

def is_wheel_vertex(vertex_co, wheel_centers, radius=0.35):
    """Verificar si un vértice está dentro de una zona de rueda"""
    for center in wheel_centers:
        # Distancia en el plano XY (ignorando Z parcialmente)
        dx = vertex_co.x - center.x
        dy = vertex_co.y - center.y
        dz = vertex_co.z - center.z
        
        # Usar un cilindro para detectar la zona de la rueda
        dist_xy = (dx**2 + dy**2)**0.5
        
        # La rueda es un cilindro aproximado
        if dist_xy < radius and abs(dz) < 0.35:
            return True
    return False

def separate_wheels_by_geometry(obj, wheel_material):
    """Separar las llantas basándose en la geometría circular"""
    if not obj or obj.type != 'MESH':
        print("⚠️ No se encontró mesh válido")
        return False
    
    print(f"Procesando mesh: {obj.name} ({len(obj.data.vertices)} vértices)")
    
    # Asegurar que el objeto está activo
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    
    # Entrar en modo edición
    bpy.ops.object.mode_set(mode='EDIT')
    
    # Obtener bmesh
    bm = bmesh.from_edit_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    bm.faces.ensure_lookup_table()
    
    # Obtener posiciones de ruedas
    wheel_centers = get_wheel_positions()
    
    # Encontrar o crear el slot de material para wheel_alloy
    wheel_mat_index = -1
    for i, slot in enumerate(obj.material_slots):
        if slot.material and slot.material.name == "wheel_alloy":
            wheel_mat_index = i
            break
    
    if wheel_mat_index == -1:
        # Añadir nuevo slot de material
        obj.data.materials.append(wheel_material)
        wheel_mat_index = len(obj.material_slots) - 1
    
    print(f"Material wheel_alloy en índice: {wheel_mat_index}")
    
    # Contar caras asignadas
    wheel_faces = 0
    
    # Iterar sobre las caras
    for face in bm.faces:
        # Calcular centro de la cara
        face_center = face.calc_center_median()
        
        # Transformar a coordenadas mundiales
        world_co = obj.matrix_world @ face_center
        
        # Verificar si está en zona de rueda
        if is_wheel_vertex(world_co, wheel_centers):
            face.material_index = wheel_mat_index
            wheel_faces += 1
    
    print(f"✓ Caras asignadas a wheel_alloy: {wheel_faces}")
    
    # Actualizar mesh
    bmesh.update_edit_mesh(obj.data)
    
    # Volver a modo objeto
    bpy.ops.object.mode_set(mode='OBJECT')
    
    return wheel_faces > 0

def separate_wheels_improved(obj, wheel_material):
    """Método mejorado: buscar geometría circular (radios de llanta)"""
    if not obj or obj.type != 'MESH':
        return False
    
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    
    # Entrar en modo edición
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    bm.faces.ensure_lookup_table()
    
    # Posiciones de las ruedas
    wheel_centers = get_wheel_positions()
    
    # Añadir material
    if wheel_material.name not in [slot.material.name for slot in obj.material_slots if slot.material]:
        obj.data.materials.append(wheel_material)
    
    wheel_mat_index = None
    for i, slot in enumerate(obj.material_slots):
        if slot.material and slot.material.name == "wheel_alloy":
            wheel_mat_index = i
            break
    
    if wheel_mat_index is None:
        bpy.ops.object.mode_set(mode='OBJECT')
        return False
    
    wheel_faces = 0
    
    # Para cada cara, verificar si sus vértices están en la zona de llanta
    for face in bm.faces:
        verts_in_wheel = 0
        total_verts = len(face.verts)
        
        for vert in face.verts:
            world_co = obj.matrix_world @ vert.co
            
            for center in wheel_centers:
                dx = world_co.x - center.x
                dy = world_co.y - center.y
                dz = world_co.z - center.z
                
                # Radio de la llanta (más pequeño, solo el rin)
                dist_xy = (dx**2 + dy**2)**0.5
                
                # Solo seleccionar geometría cercana al centro de la rueda
                # y dentro de un rango de altura específico
                if dist_xy < 0.32 and 0.30 < world_co.z < 0.70:
                    verts_in_wheel += 1
                    break
        
        # Si todos los vértices de la cara están en zona de rueda
        if verts_in_wheel == total_verts and total_verts >= 3:
            face.material_index = wheel_mat_index
            wheel_faces += 1
    
    bmesh.update_edit_mesh(obj.data)
    bpy.ops.object.mode_set(mode='OBJECT')
    
    print(f"✓ Caras de llantas encontradas: {wheel_faces}")
    return wheel_faces > 0

def export_glb(filepath):
    """Exportar modelo a GLB"""
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
        export_materials='EXPORT',
        export_colors=True
    )
    print(f"✓ Modelo exportado: {filepath}")

def main():
    print("\n" + "="*60)
    print("SEPARACIÓN DE LLANTAS - NISSAN SKYLINE R34")
    print("="*60 + "\n")
    
    # Paso 1: Limpiar escena
    clear_scene()
    
    # Paso 2: Importar modelo
    if not os.path.exists(INPUT_PATH):
        print(f"❌ Error: No se encontró el archivo: {INPUT_PATH}")
        return
    
    import_glb(INPUT_PATH)
    
    # Paso 3: Crear material para llantas
    wheel_mat = create_wheel_material()
    
    # Paso 4: Encontrar mesh principal
    body_mesh = find_body_mesh()
    
    if body_mesh:
        print(f"✓ Mesh encontrado: {body_mesh.name}")
        
        # Paso 5: Separar llantas
        success = separate_wheels_improved(body_mesh, wheel_mat)
        
        if not success:
            print("⚠️ Intentando método alternativo...")
            success = separate_wheels_by_geometry(body_mesh, wheel_mat)
    else:
        print("❌ No se encontró el mesh de la carrocería")
        # Intentar con todos los meshes
        for obj in bpy.context.scene.objects:
            if obj.type == 'MESH' and len(obj.data.vertices) > 1000:
                print(f"Intentando con: {obj.name}")
                separate_wheels_improved(obj, wheel_mat)
    
    # Paso 6: Exportar
    export_glb(OUTPUT_PATH)
    
    print("\n" + "="*60)
    print("✓ PROCESO COMPLETADO")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
