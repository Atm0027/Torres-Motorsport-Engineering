#!/bin/bash
# =============================================================================
# Antigravity Settings Sync - Sincroniza configuraciones entre dispositivos
# Autor: ftorres
# Requiere: GITHUB_PERSONAL_ACCESS_TOKEN en mcp_config.json o variable de entorno
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
GEMINI_DIR="$HOME/.gemini"
ANTIGRAVITY_DIR="$GEMINI_DIR/antigravity"
SYNC_DIR="$GEMINI_DIR/sync"
GIST_ID_FILE="$SYNC_DIR/.gist_id"
LAST_SYNC_FILE="$SYNC_DIR/.last_sync"

# Archivos a sincronizar (configuraciones importantes)
SYNC_FILES=(
    "$GEMINI_DIR/GEMINI.md"
    "$ANTIGRAVITY_DIR/mcp_config.json"
    "$ANTIGRAVITY_DIR/browserAllowlist.txt"
)

# Obtener token de GitHub
get_github_token() {
    # Primero intentar de variable de entorno
    if [ -n "$GITHUB_PERSONAL_ACCESS_TOKEN" ]; then
        echo "$GITHUB_PERSONAL_ACCESS_TOKEN"
        return
    fi
    
    # Luego intentar de mcp_config.json
    if [ -f "$ANTIGRAVITY_DIR/mcp_config.json" ]; then
        token=$(grep -o '"GITHUB_PERSONAL_ACCESS_TOKEN": *"[^"]*"' "$ANTIGRAVITY_DIR/mcp_config.json" | cut -d'"' -f4)
        if [ -n "$token" ] && [ "$token" != '${GITHUB_TOKEN}' ]; then
            echo "$token"
            return
        fi
    fi
    
    echo ""
}

GITHUB_TOKEN=$(get_github_token)

# Verificar token
check_token() {
    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${RED}Error: No se encontró GITHUB_PERSONAL_ACCESS_TOKEN${NC}"
        echo "Configúralo en ~/.gemini/antigravity/mcp_config.json o como variable de entorno"
        exit 1
    fi
}

# Crear contenido del Gist
create_gist_content() {
    local files_json="{"
    local first=true
    
    for file in "${SYNC_FILES[@]}"; do
        if [ -f "$file" ]; then
            filename=$(basename "$file")
            # Escapar contenido para JSON
            content=$(cat "$file" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
            
            if [ "$first" = true ]; then
                first=false
            else
                files_json+=","
            fi
            
            files_json+="\"$filename\":{\"content\":$content}"
        fi
    done
    
    files_json+="}"
    echo "$files_json"
}

# Subir configuraciones (push)
push_config() {
    check_token
    echo -e "${BLUE}📤 Subiendo configuraciones a GitHub Gist...${NC}"
    
    files_content=$(create_gist_content)
    
    # Verificar si ya existe un Gist
    if [ -f "$GIST_ID_FILE" ]; then
        GIST_ID=$(cat "$GIST_ID_FILE")
        echo -e "${YELLOW}Actualizando Gist existente: $GIST_ID${NC}"
        
        response=$(curl -s -X PATCH \
            -H "Authorization: token $GITHUB_TOKEN" \
            -H "Accept: application/vnd.github.v3+json" \
            "https://api.github.com/gists/$GIST_ID" \
            -d "{\"description\":\"Antigravity IDE Settings Sync - $(date '+%Y-%m-%d %H:%M:%S')\",\"files\":$files_content}")
    else
        echo -e "${YELLOW}Creando nuevo Gist privado...${NC}"
        
        response=$(curl -s -X POST \
            -H "Authorization: token $GITHUB_TOKEN" \
            -H "Accept: application/vnd.github.v3+json" \
            "https://api.github.com/gists" \
            -d "{\"description\":\"Antigravity IDE Settings Sync\",\"public\":false,\"files\":$files_content}")
        
        # Guardar ID del nuevo Gist
        GIST_ID=$(echo "$response" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
        if [ -n "$GIST_ID" ] && [ "$GIST_ID" != "None" ]; then
            echo "$GIST_ID" > "$GIST_ID_FILE"
            echo -e "${GREEN}✅ Gist creado con ID: $GIST_ID${NC}"
        else
            echo -e "${RED}Error al crear Gist:${NC}"
            echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
            exit 1
        fi
    fi
    
    # Verificar éxito
    if echo "$response" | grep -q '"id"'; then
        echo -e "${GREEN}✅ Configuraciones sincronizadas correctamente${NC}"
        date '+%Y-%m-%d %H:%M:%S' > "$LAST_SYNC_FILE"
    else
        echo -e "${RED}Error en la sincronización:${NC}"
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
        exit 1
    fi
}

# Descargar configuraciones (pull)
pull_config() {
    check_token
    echo -e "${BLUE}📥 Descargando configuraciones desde GitHub Gist...${NC}"
    
    if [ ! -f "$GIST_ID_FILE" ]; then
        echo -e "${RED}Error: No hay Gist configurado. Ejecuta 'push' primero en otro dispositivo.${NC}"
        echo -e "${YELLOW}Si tienes el Gist ID, créalo manualmente:${NC}"
        echo "  echo 'TU_GIST_ID' > $GIST_ID_FILE"
        exit 1
    fi
    
    GIST_ID=$(cat "$GIST_ID_FILE")
    echo -e "${YELLOW}Descargando desde Gist: $GIST_ID${NC}"
    
    response=$(curl -s \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/gists/$GIST_ID")
    
    # Verificar respuesta
    if ! echo "$response" | grep -q '"files"'; then
        echo -e "${RED}Error al obtener Gist:${NC}"
        echo "$response"
        exit 1
    fi
    
    # Extraer y guardar cada archivo
    for file in "${SYNC_FILES[@]}"; do
        filename=$(basename "$file")
        content=$(echo "$response" | python3 -c "
import sys, json
data = json.load(sys.stdin)
files = data.get('files', {})
if '$filename' in files:
    print(files['$filename']['content'], end='')
")
        
        if [ -n "$content" ]; then
            # Backup antes de sobrescribir
            if [ -f "$file" ]; then
                cp "$file" "${file}.backup"
            fi
            echo "$content" > "$file"
            echo -e "${GREEN}  ✅ $filename actualizado${NC}"
        else
            echo -e "${YELLOW}  ⚠️  $filename no encontrado en Gist${NC}"
        fi
    done
    
    echo -e "${GREEN}✅ Configuraciones descargadas correctamente${NC}"
    date '+%Y-%m-%d %H:%M:%S' > "$LAST_SYNC_FILE"
}

# Estado de sincronización
status() {
    echo -e "${BLUE}📊 Estado de sincronización de Antigravity${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ -f "$GIST_ID_FILE" ]; then
        echo -e "Gist ID: ${GREEN}$(cat $GIST_ID_FILE)${NC}"
    else
        echo -e "Gist ID: ${RED}No configurado${NC}"
    fi
    
    if [ -f "$LAST_SYNC_FILE" ]; then
        echo -e "Última sync: ${GREEN}$(cat $LAST_SYNC_FILE)${NC}"
    else
        echo -e "Última sync: ${RED}Nunca${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}Archivos sincronizados:${NC}"
    for file in "${SYNC_FILES[@]}"; do
        if [ -f "$file" ]; then
            size=$(ls -lh "$file" | awk '{print $5}')
            mod=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$file" 2>/dev/null || stat -c "%y" "$file" 2>/dev/null | cut -d'.' -f1)
            echo -e "  ${GREEN}✓${NC} $(basename $file) ($size, modificado: $mod)"
        else
            echo -e "  ${RED}✗${NC} $(basename $file) - No existe"
        fi
    done
}

# Configurar Gist ID manualmente
set_gist() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: Proporciona el Gist ID${NC}"
        echo "Uso: $0 set-gist <GIST_ID>"
        exit 1
    fi
    
    echo "$1" > "$GIST_ID_FILE"
    echo -e "${GREEN}✅ Gist ID configurado: $1${NC}"
}

# Ayuda
show_help() {
    echo -e "${BLUE}Antigravity Settings Sync${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Uso: $(basename $0) <comando>"
    echo ""
    echo "Comandos:"
    echo "  push      Subir configuraciones locales al Gist"
    echo "  pull      Descargar configuraciones del Gist"
    echo "  status    Mostrar estado de sincronización"
    echo "  set-gist  Configurar Gist ID manualmente"
    echo "  help      Mostrar esta ayuda"
    echo ""
    echo "Archivos sincronizados:"
    for file in "${SYNC_FILES[@]}"; do
        echo "  - $(basename $file)"
    done
}

# Crear directorio de sync si no existe
mkdir -p "$SYNC_DIR"

# Procesar comando
case "${1:-help}" in
    push)
        push_config
        ;;
    pull)
        pull_config
        ;;
    status)
        status
        ;;
    set-gist)
        set_gist "$2"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Comando desconocido: $1${NC}"
        show_help
        exit 1
        ;;
esac
