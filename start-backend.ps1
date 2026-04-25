# ==============================================
# SCRIPT PARA INICIAR BACKEND SEGURO
# ==============================================
# Instala dependências e inicia o servidor Node.js

Write-Host "🚀 Iniciando setup do backend seguro..." -ForegroundColor Green

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Por favor, instale o Node.js em https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Verificar se npm está instalado
try {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm não encontrado." -ForegroundColor Red
    exit 1
}

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependências instaladas com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao instalar dependências." -ForegroundColor Red
    exit 1
}

# Criar arquivo .env se não existir
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "🔧 Criando arquivo .env..." -ForegroundColor Yellow
    $envContent = @"
# Configurações do Backend Seguro
PORT=3000
NODE_ENV=development

# Segurança - MUDAR EM PRODUÇÃO!
JWT_SECRET=jiujitsu-store-super-secret-key-change-in-production-2026
SESSION_SECRET=jiujitsu-store-session-secret-change-in-production-2026
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_LOGIN_MAX=5
"@
    $envContent | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "✅ Arquivo .env criado" -ForegroundColor Green
}

# Iniciar servidor
Write-Host "🚀 Iniciando servidor backend..." -ForegroundColor Green
Write-Host "📍 URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🛡️ Segurança: Ativada" -ForegroundColor Green
Write-Host "📋 Para parar: Pressione Ctrl+C" -ForegroundColor Yellow

try {
    node server.js
} catch {
    Write-Host "❌ Erro ao iniciar servidor." -ForegroundColor Red
    exit 1
}
