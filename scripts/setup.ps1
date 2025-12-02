# Script de configuración para Torres Motorsport Engineering en Windows
# Ejecutar: .\scripts\setup.ps1

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Torres Motorsport Engineering Setup  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Node.js
Write-Info "Verificando Node.js..."
$node = Get-Command node -ErrorAction SilentlyContinue

if (-not $node) {
    Write-Err "Node.js no está instalado."
    Write-Host ""
    Write-Host "Opciones para instalar Node.js:" -ForegroundColor Yellow
    Write-Host "  1) Descargar desde: https://nodejs.org/" -ForegroundColor White
    Write-Host "  2) Usando winget: winget install OpenJS.NodeJS.LTS" -ForegroundColor White
    Write-Host "  3) Usando chocolatey: choco install nodejs-lts" -ForegroundColor White
    Write-Host ""
    exit 1
}

$nodeVersion = (& node --version) -join ""
Write-Success "Node.js instalado: $nodeVersion"

# 2. Verificar npm
$npm = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npm) {
    Write-Err "npm no está disponible. Reinstala Node.js."
    exit 1
}

$npmVersion = (& npm --version) -join ""
Write-Success "npm instalado: $npmVersion"

# 3. Limpiar instalación anterior si existe
if (Test-Path "node_modules") {
    Write-Info "Limpiando node_modules anterior..."
    Remove-Item -Recurse -Force "node_modules"
}

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json"
}

# 4. Instalar dependencias
Write-Host ""
Write-Info "Instalando dependencias..."
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Err "Error al instalar dependencias."
    exit 1
}

Write-Success "Dependencias instaladas correctamente."

# 5. Verificar TypeScript
Write-Host ""
Write-Info "Verificando tipos TypeScript..."
npm run typecheck

if ($LASTEXITCODE -ne 0) {
    Write-Warn "Hay errores de TypeScript, pero el proyecto puede funcionar."
}
else {
    Write-Success "Sin errores de TypeScript."
}

# 6. Mostrar instrucciones finales
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ¡Configuración completada!          " -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Comandos disponibles:" -ForegroundColor Cyan
Write-Host "  npm run dev      - Iniciar servidor de desarrollo (http://localhost:3001)" -ForegroundColor White
Write-Host "  npm run build    - Compilar para producción" -ForegroundColor White
Write-Host "  npm run preview  - Vista previa del build" -ForegroundColor White
Write-Host "  npm run lint     - Ejecutar ESLint" -ForegroundColor White
Write-Host ""
Write-Host "Para iniciar ahora, ejecuta:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
