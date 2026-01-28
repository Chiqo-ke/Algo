# Start Algo Frontend - Local Development Mode
# ==============================================
# This script starts the Vite development server with local settings

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  🚀 Starting Algo Frontend - LOCAL DEVELOPMENT MODE" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Environment: Local Development (.env.local)" -ForegroundColor Green
Write-Host "   API Backend: http://localhost:8000/api" -ForegroundColor Green
Write-Host "   Dev Server: http://localhost:8080" -ForegroundColor Green
Write-Host ""

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✅ Found .env.local file" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local not found, creating from template..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "✅ Created .env.local from .env.example" -ForegroundColor Green
        Write-Host "   Please update .env.local with your local configuration" -ForegroundColor Yellow
    } else {
        Write-Host "❌ No .env.example found. Please create .env.local manually" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔍 Checking dependencies..." -ForegroundColor Cyan

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  🌐 Starting Vite Development Server" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "   Local:   http://localhost:8080" -ForegroundColor Green
Write-Host "   Network: Use your local IP address" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start Vite dev server with local environment
npm run dev -- --mode development
