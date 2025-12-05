# 🚀 Antigravity Config Sync

Herramientas para configurar y sincronizar Antigravity IDE entre dispositivos.

## 📦 Contenido

| Archivo | Descripción |
|---------|-------------|
| `setup-antigravity.sh` | Script de configuración automática completa |
| `antigravity-sync.sh` | Script de sincronización push/pull |

## 🔧 Uso

### En un nuevo dispositivo:

```bash
# 1. Clona este repositorio o copia esta carpeta
# 2. Ejecuta el setup:
./setup-antigravity.sh
```

El script te preguntará:
- **Opción 1**: Sincronizar desde la nube (si ya configuraste otro dispositivo)
- **Opción 2**: Configurar manualmente (primera vez)

### Comandos de sincronización:

```bash
# Subir cambios locales a la nube
agpush   # o: ~/.gemini/sync/antigravity-sync.sh push

# Descargar cambios de la nube
agpull   # o: ~/.gemini/sync/antigravity-sync.sh pull

# Ver estado
agsync status
```

## ☁️ Información de Sync

- **Gist ID**: `15b565c9f82e87b08db51ab1bf79251c`
- **Archivos sincronizados**:
  - `GEMINI.md` - Reglas globales del IDE
  - `mcp_config.json` - Configuración de MCPs
  - `browserAllowlist.txt` - Lista de sitios permitidos

## 🔑 Tokens Requeridos

| Token | Dónde obtenerlo |
|-------|-----------------|
| GitHub | [github.com/settings/tokens](https://github.com/settings/tokens) (scopes: repo, gist) |
| Supabase | [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) |
| Cloudflare | [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) |
