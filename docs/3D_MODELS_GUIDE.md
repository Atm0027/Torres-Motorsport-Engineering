# Guía de Modelos 3D para Torres Motorsport Engineering

## 📥 Fuentes Gratuitas de Modelos 3D

### 1. Sketchfab (Recomendado)
**URL**: https://sketchfab.com/search?features=downloadable&q=car&type=models

**Modelos JDM disponibles gratuitamente:**
- Nissan Skyline R34: https://sketchfab.com/search?q=nissan+skyline+r34&features=downloadable
- Toyota Supra A80: https://sketchfab.com/search?q=toyota+supra+mk4&features=downloadable
- Mazda RX-7: https://sketchfab.com/search?q=mazda+rx7&features=downloadable
- Honda NSX: https://sketchfab.com/search?q=honda+nsx&features=downloadable

**Instrucciones:**
1. Crear cuenta gratuita en Sketchfab
2. Buscar el modelo con filtro "Downloadable"
3. Descargar en formato **GLTF/GLB**
4. Colocar en `/public/models/vehicles/{vehicle-id}/`

### 2. Poly.Pizza
**URL**: https://poly.pizza/search/car

**Modelos disponibles:**
- Mazda RX-7: https://poly.pizza/m/SnIoWlh7S2
- Sports Car genéricos

**Nota**: Modelos low-poly, ideales para rendimiento web.

### 3. CGTrader (Free Section)
**URL**: https://www.cgtrader.com/free-3d-models/car?file_types[]=130

Filtrar por formato GLTF (.glb)

### 4. TurboSquid (Free Section)
**URL**: https://www.turbosquid.com/Search/3D-Models/free/car/gltf

### 5. Free3D
**URL**: https://free3d.com/3d-models/gltf-car

---

## 📁 Estructura de Archivos

```
public/
└── models/
    └── vehicles/
        ├── nissan-skyline-r34/
        │   └── base.glb
        ├── toyota-supra-a80/
        │   └── base.glb
        ├── mazda-rx7-fd/
        │   └── base.glb
        ├── honda-nsx/
        │   └── base.glb
        ├── mitsubishi-evo-ix/
        │   └── base.glb
        └── subaru-impreza-sti/
            └── base.glb
```

---

## ⚙️ Requisitos del Modelo

### Formato
- **Preferido**: GLB (binario, un solo archivo)
- **Alternativo**: GLTF + archivos de textura

### Tamaño recomendado
- **Máximo**: 10-15 MB por modelo
- **Ideal**: 3-5 MB (optimizado para web)

### Orientación
- El frente del coche debe apuntar hacia +Z
- Las ruedas deben estar en el plano Y=0

### Materiales
- PBR (Physically Based Rendering) preferido
- Texturas no mayores a 2048x2048

---

## 🛠️ Optimización de Modelos

Si el modelo es muy pesado, usa estas herramientas:

### gltf-transform (CLI)
```bash
npm install -g @gltf-transform/cli
gltf-transform optimize input.glb output.glb --compress draco
```

### gltf-pipeline (CLI)
```bash
npm install -g gltf-pipeline
gltf-pipeline -i input.glb -o output.glb -d
```

### Online
- **gltf.report**: https://gltf.report/ (analizar modelo)
- **glTF Viewer**: https://gltf-viewer.donmccurdy.com/ (previsualizar)

---

## 🎨 Preparación del Modelo

### Separar componentes (opcional pero recomendado)
Para permitir personalización, el modelo debería tener nodos separados:
- `Body` - Carrocería principal
- `Wheel_FL`, `Wheel_FR`, `Wheel_RL`, `Wheel_RR` - Ruedas
- `Hood` - Capó
- `Trunk` - Maletero
- `Spoiler` - Alerón (si aplica)
- `Bumper_Front`, `Bumper_Rear` - Parachoques

### Aplicar transformaciones
En Blender antes de exportar:
1. Seleccionar todos los objetos
2. `Ctrl+A` → Apply All Transforms

---

## 📝 Configuración en el Código

Una vez descargado el modelo, actualizar `src/services/modelLoader.ts`:

```typescript
const vehicleModelConfigs: Record<string, VehicleModelConfig> = {
    'nissan-skyline-r34': {
        // ... otras propiedades
        modelUrl: '/models/vehicles/nissan-skyline-r34/base.glb',
        // ...
    }
}
```

---

## 🔗 Recursos Adicionales

- **Documentación Three.js**: https://threejs.org/docs/#examples/en/loaders/GLTFLoader
- **glTF Spec**: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber

---

## ⚠️ Notas sobre Licencias

Siempre verificar la licencia del modelo antes de usarlo:
- **CC0**: Uso libre, sin atribución
- **CC BY**: Requiere atribución
- **CC BY-NC**: No uso comercial
- **Royalty Free**: Verificar términos específicos

Para este proyecto (uso educativo/personal), la mayoría de licencias son aceptables.
