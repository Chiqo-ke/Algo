# Demo Mode Quick Start Script
# This script helps you get started with demo mode quickly

Write-Host "🎬 AlgoAgent Demo Mode - Quick Start" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
$currentDir = Get-Location
$expectedDir = "c:\Users\nyaga\Documents\Algo"

if ($currentDir.Path -ne $expectedDir) {
    Write-Host "⚠️  Navigating to Algo directory..." -ForegroundColor Yellow
    Set-Location $expectedDir
}

Write-Host "✅ Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Once the server starts:" -ForegroundColor Yellow
Write-Host "   1. Navigate to: http://localhost:5173/demo" -ForegroundColor White
Write-Host "   2. Login to the platform" -ForegroundColor White
Write-Host "   3. Select a demo scenario" -ForegroundColor White
Write-Host "   4. Follow the step-by-step guide" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   - README_DEMO_SUMMARY.md (Start here!)" -ForegroundColor White
Write-Host "   - DEMO_QUICK_REFERENCE.md (Cheat sheet)" -ForegroundColor White
Write-Host "   - docs/guides/DEMO_VIDEO_GUIDE.md (Full guide)" -ForegroundColor White
Write-Host ""
Write-Host "⚡ Quick Templates Available:" -ForegroundColor Yellow
Write-Host "   Strategy: 7 templates (Beginner → Advanced)" -ForegroundColor White
Write-Host "   Backtest: 7 scenarios (Different markets)" -ForegroundColor White
Write-Host "   Scenarios: 4 guided workflows" -ForegroundColor White
Write-Host ""
Write-Host "🎥 Ready to create amazing demo videos!" -ForegroundColor Green
Write-Host ""
Write-Host "Starting server now..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

# Start the dev server
npm run dev
