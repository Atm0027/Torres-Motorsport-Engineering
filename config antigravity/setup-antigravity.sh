#!/bin/bash
# =============================================================================
# 🚀 Antigravity Setup - Configuración Automática Completa
# =============================================================================
# Este script configura automáticamente:
#   1. Las configuraciones de Antigravity IDE
#   2. Los MCPs (GitHub, Supabase, Cloudflare, Blender)
#   3. La sincronización entre dispositivos via GitHub Gist
#
# Autor: ftorres
# Gist ID: 15b565c9f82e87b08db51ab1bf79251c
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuración
GEMINI_DIR="$HOME/.gemini"
ANTIGRAVITY_DIR="$GEMINI_DIR/antigravity"
SYNC_DIR="$GEMINI_DIR/sync"
GIST_ID="e269d1f2e888c97d2791a715c75f0420"

echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║          🚀 ANTIGRAVITY CONFIGURACIÓN AUTOMÁTICA 🚀           ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║  Este script configurará todo tu entorno de Antigravity IDE   ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# =============================================================================
# PASO 1: Verificar requisitos
# =============================================================================
echo -e "\n${CYAN}[1/6] Verificando requisitos...${NC}"

# Verificar que Antigravity está instalado
if [ ! -d "$ANTIGRAVITY_DIR" ]; then
    echo -e "${RED}❌ Error: Antigravity no está instalado.${NC}"
    echo "   Por favor, instala Antigravity primero desde: https://antigravity.google"
    exit 1
fi
echo -e "${GREEN}  ✓ Antigravity detectado${NC}"

# Verificar Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Error: Python3 no está instalado.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ Python3 disponible${NC}"

# Verificar curl
if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ Error: curl no está instalado.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✓ curl disponible${NC}"

# =============================================================================
# PASO 2: Solicitar tokens si no existen
# =============================================================================
echo -e "\n${CYAN}[2/6] Configurando tokens de acceso...${NC}"

# Función para pedir token
ask_token() {
    local name=$1
    local current=$2
    local url=$3
    
    if [ -n "$current" ] && [ "$current" != '${'"$name"'}' ]; then
        echo -e "${GREEN}  ✓ $name ya configurado${NC}"
        echo "$current"
    else
        echo -e "${YELLOW}  ⚠ $name no configurado${NC}"
        echo -e "  Obtener en: ${BLUE}$url${NC}"
        read -p "  Introduce $name (o Enter para omitir): " token
        echo "$token"
    fi
}

# Verificar si ya hay configuración existente
if [ -f "$ANTIGRAVITY_DIR/mcp_config.json" ]; then
    EXISTING_GITHUB=$(grep -o '"GITHUB_PERSONAL_ACCESS_TOKEN": *"[^"]*"' "$ANTIGRAVITY_DIR/mcp_config.json" 2>/dev/null | cut -d'"' -f4 || echo "")
    EXISTING_SUPABASE=$(grep -o '"SUPABASE_ACCESS_TOKEN": *"[^"]*"' "$ANTIGRAVITY_DIR/mcp_config.json" 2>/dev/null | cut -d'"' -f4 || echo "")
    EXISTING_CF_TOKEN=$(grep -o '"CLOUDFLARE_API_TOKEN": *"[^"]*"' "$ANTIGRAVITY_DIR/mcp_config.json" 2>/dev/null | cut -d'"' -f4 || echo "")
    EXISTING_CF_ACCOUNT=$(grep -o '"CLOUDFLARE_ACCOUNT_ID": *"[^"]*"' "$ANTIGRAVITY_DIR/mcp_config.json" 2>/dev/null | cut -d'"' -f4 || echo "")
fi

echo ""
echo -e "${YELLOW}¿Quieres sincronizar desde la nube o configurar manualmente?${NC}"
echo "  1) Sincronizar desde GitHub Gist (recomendado si ya configuraste otro dispositivo)"
echo "  2) Configurar manualmente (primera vez)"
read -p "Opción [1/2]: " setup_option

if [ "$setup_option" = "1" ]; then
    # =============================================================================
    # OPCIÓN 1: Sincronizar desde Gist
    # =============================================================================
    echo -e "\n${CYAN}[3/6] Sincronizando desde GitHub Gist...${NC}"
    
    read -p "Introduce tu GITHUB_PERSONAL_ACCESS_TOKEN: " GITHUB_TOKEN
    
    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${RED}❌ Token de GitHub requerido para sincronizar${NC}"
        exit 1
    fi
    
    # Descargar configuraciones del Gist
    echo -e "${YELLOW}  Descargando configuraciones...${NC}"
    
    response=$(curl -s \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/gists/$GIST_ID")
    
    if ! echo "$response" | grep -q '"files"'; then
        echo -e "${RED}❌ Error al acceder al Gist. Verifica tu token.${NC}"
        echo "$response"
        exit 1
    fi
    
    # Extraer y guardar archivos
    for filename in "GEMINI.md" "mcp_config.json" "browserAllowlist.txt"; do
        content=$(echo "$response" | python3 -c "
import sys, json
data = json.load(sys.stdin)
files = data.get('files', {})
if '$filename' in files:
    print(files['$filename']['content'], end='')
")
        
        if [ -n "$content" ]; then
            if [ "$filename" = "GEMINI.md" ]; then
                echo "$content" > "$GEMINI_DIR/$filename"
            else
                echo "$content" > "$ANTIGRAVITY_DIR/$filename"
            fi
            echo -e "${GREEN}  ✓ $filename restaurado${NC}"
        fi
    done
    
    # Actualizar el token en el config descargado
    if [ -f "$ANTIGRAVITY_DIR/mcp_config.json" ]; then
        # Usar sed para actualizar el token de GitHub
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|\"GITHUB_PERSONAL_ACCESS_TOKEN\": *\"[^\"]*\"|\"GITHUB_PERSONAL_ACCESS_TOKEN\": \"$GITHUB_TOKEN\"|g" "$ANTIGRAVITY_DIR/mcp_config.json"
        else
            sed -i "s|\"GITHUB_PERSONAL_ACCESS_TOKEN\": *\"[^\"]*\"|\"GITHUB_PERSONAL_ACCESS_TOKEN\": \"$GITHUB_TOKEN\"|g" "$ANTIGRAVITY_DIR/mcp_config.json"
        fi
        echo -e "${GREEN}  ✓ Token de GitHub actualizado en config${NC}"
    fi

else
    # =============================================================================
    # OPCIÓN 2: Configuración manual
    # =============================================================================
    echo -e "\n${CYAN}[3/6] Configuración manual de tokens...${NC}"
    
    GITHUB_TOKEN=$(ask_token "GITHUB_TOKEN" "$EXISTING_GITHUB" "https://github.com/settings/tokens")
    SUPABASE_TOKEN=$(ask_token "SUPABASE_TOKEN" "$EXISTING_SUPABASE" "https://supabase.com/dashboard/account/tokens")
    CF_TOKEN=$(ask_token "CLOUDFLARE_TOKEN" "$EXISTING_CF_TOKEN" "https://dash.cloudflare.com/profile/api-tokens")
    CF_ACCOUNT=$(ask_token "CLOUDFLARE_ACCOUNT_ID" "$EXISTING_CF_ACCOUNT" "URL del dashboard de Cloudflare")
    
    # =============================================================================
    # PASO 4: Crear mcp_config.json
    # =============================================================================
    echo -e "\n${CYAN}[4/6] Generando configuración de MCPs...${NC}"
    
    # Detectar ruta de uvx
    UVX_PATH=$(which uvx 2>/dev/null || echo "$HOME/.local/bin/uvx")
    
    cat > "$ANTIGRAVITY_DIR/mcp_config.json" << EOF
{
  "mcpServers": {
    "blender": {
      "command": "$UVX_PATH",
      "args": [
        "blender-mcp"
      ],
      "env": {
        "PYTHONUNBUFFERED": "1",
        "BLENDER_PORT": "8080",
        "BLENDER_HOST": "127.0.0.1"
      }
    },
    "github": {
      "command": "$UVX_PATH",
      "args": [
        "mcp-server-github"
      ],
      "env": {
        "PYTHONUNBUFFERED": "1",
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN:-YOUR_GITHUB_TOKEN}"
      }
    },
    "supabase": {
      "command": "$UVX_PATH",
      "args": [
        "supabase-mcp-server",
        "--project-ref", "gldplzkjoadzgijzfoqx"
      ],
      "env": {
        "PYTHONUNBUFFERED": "1",
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_TOKEN:-YOUR_SUPABASE_TOKEN}"
      }
    },
    "cloudflare": {
      "command": "npx",
      "args": [
        "-y",
        "@cloudflare/mcp-server-cloudflare"
      ],
      "env": {
        "CLOUDFLARE_API_TOKEN": "${CF_TOKEN:-YOUR_CLOUDFLARE_TOKEN}",
        "CLOUDFLARE_ACCOUNT_ID": "${CF_ACCOUNT:-YOUR_CLOUDFLARE_ACCOUNT_ID}"
      }
    }
  }
}
EOF
    echo -e "${GREEN}  ✓ mcp_config.json creado${NC}"
fi

# =============================================================================
# PASO 5: Instalar script de sincronización
# =============================================================================
echo -e "\n${CYAN}[5/6] Instalando herramienta de sincronización...${NC}"

mkdir -p "$SYNC_DIR"

# Guardar Gist ID
echo "$GIST_ID" > "$SYNC_DIR/.gist_id"

# Copiar script de sync
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/antigravity-sync.sh" ]; then
    cp "$SCRIPT_DIR/antigravity-sync.sh" "$SYNC_DIR/antigravity-sync.sh"
    chmod +x "$SYNC_DIR/antigravity-sync.sh"
    echo -e "${GREEN}  ✓ Script de sincronización instalado${NC}"
else
    # Descargar desde el Gist si no existe localmente
    echo -e "${YELLOW}  Descargando script de sincronización...${NC}"
    # El script se incluirá embebido aquí como fallback
    cat > "$SYNC_DIR/antigravity-sync.sh" << 'SYNCSCRIPT'
#!/bin/bash
# Script de sincronización embebido - ver versión completa en ~/.gemini/sync/
GEMINI_DIR="$HOME/.gemini"
ANTIGRAVITY_DIR="$GEMINI_DIR/antigravity"
SYNC_DIR="$GEMINI_DIR/sync"
GIST_ID_FILE="$SYNC_DIR/.gist_id"

get_github_token() {
    if [ -f "$ANTIGRAVITY_DIR/mcp_config.json" ]; then
        grep -o '"GITHUB_PERSONAL_ACCESS_TOKEN": *"[^"]*"' "$ANTIGRAVITY_DIR/mcp_config.json" | cut -d'"' -f4
    fi
}

GITHUB_TOKEN=$(get_github_token)
GIST_ID=$(cat "$GIST_ID_FILE" 2>/dev/null)

case "$1" in
    push)
        echo "📤 Sincronizando..."
        files=$(python3 -c "
import json
files = {}
for f in ['$GEMINI_DIR/GEMINI.md', '$ANTIGRAVITY_DIR/mcp_config.json', '$ANTIGRAVITY_DIR/browserAllowlist.txt']:
    try:
        with open(f) as fp:
            files[f.split('/')[-1]] = {'content': fp.read()}
    except: pass
print(json.dumps(files))
")
        curl -s -X PATCH -H "Authorization: token $GITHUB_TOKEN" \
            "https://api.github.com/gists/$GIST_ID" \
            -d "{\"files\":$files}" > /dev/null && echo "✅ Sincronizado"
        ;;
    pull)
        echo "📥 Descargando..."
        curl -s -H "Authorization: token $GITHUB_TOKEN" \
            "https://api.github.com/gists/$GIST_ID" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for name, info in data.get('files', {}).items():
    path = '$GEMINI_DIR/' + name if name == 'GEMINI.md' else '$ANTIGRAVITY_DIR/' + name
    with open(path, 'w') as f:
        f.write(info['content'])
    print(f'✅ {name}')
"
        ;;
    status)
        echo "Gist ID: $GIST_ID"
        ;;
    *)
        echo "Uso: $0 {push|pull|status}"
        ;;
esac
SYNCSCRIPT
    chmod +x "$SYNC_DIR/antigravity-sync.sh"
    echo -e "${GREEN}  ✓ Script de sincronización creado${NC}"
fi

# =============================================================================
# PASO 6: Crear alias útiles
# =============================================================================
echo -e "\n${CYAN}[6/6] Configurando alias...${NC}"

# Detectar shell config
if [ -f "$HOME/.zshrc" ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
    SHELL_RC="$HOME/.bashrc"
else
    SHELL_RC=""
fi

if [ -n "$SHELL_RC" ]; then
    # Añadir alias si no existen
    if ! grep -q "antigravity-sync" "$SHELL_RC"; then
        echo "" >> "$SHELL_RC"
        echo "# Antigravity Sync" >> "$SHELL_RC"
        echo "alias agsync='$SYNC_DIR/antigravity-sync.sh'" >> "$SHELL_RC"
        echo "alias agpush='$SYNC_DIR/antigravity-sync.sh push'" >> "$SHELL_RC"
        echo "alias agpull='$SYNC_DIR/antigravity-sync.sh pull'" >> "$SHELL_RC"
        echo -e "${GREEN}  ✓ Alias añadidos a $SHELL_RC${NC}"
        echo -e "${YELLOW}    Ejecuta 'source $SHELL_RC' para activarlos${NC}"
    else
        echo -e "${GREEN}  ✓ Alias ya configurados${NC}"
    fi
fi

# =============================================================================
# RESUMEN FINAL
# =============================================================================
echo -e "\n${PURPLE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║              ✅ CONFIGURACIÓN COMPLETADA ✅                    ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║                                                               ║"
echo "║  📁 Configuración: ~/.gemini/antigravity/mcp_config.json      ║"
echo "║  🔄 Sync script:   ~/.gemini/sync/antigravity-sync.sh         ║"
echo "║  ☁️  Gist ID:       $GIST_ID            ║"
echo "║                                                               ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║  COMANDOS ÚTILES:                                             ║"
echo "║    agpush  → Subir cambios a la nube                          ║"
echo "║    agpull  → Descargar cambios de la nube                     ║"
echo "║    agsync status → Ver estado de sincronización               ║"
echo "║                                                               ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║  ⚠️  IMPORTANTE: Reinicia Antigravity para aplicar cambios    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
