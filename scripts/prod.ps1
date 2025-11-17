# Production deployment script for Acquisition App
# PowerShell version for Windows

Write-Host "🚀 Starting Acquisition App in Production Mode" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.production exists
if (-not (Test-Path .env.production)) {
    Write-Host "❌ Error: .env.production file not found!" -ForegroundColor Red
    Write-Host "   Please create .env.production with your production environment variables." -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Error: Docker is not running!" -ForegroundColor Red
    Write-Host "   Please start Docker and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Building and starting production container..." -ForegroundColor Yellow
Write-Host "   - Using Neon Cloud Database (no local proxy)" -ForegroundColor Gray
Write-Host "   - Running in optimized production mode" -ForegroundColor Gray
Write-Host ""

# Start production environment
Write-Host "🐳 Starting Docker containers..." -ForegroundColor Yellow
docker compose -f docker-compose.prod.yaml up --build -d

# Wait for app to be ready (basic health check)
Write-Host "⏳ Waiting for application to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Run migrations with Drizzle
Write-Host "📜 Applying latest schema with Drizzle..." -ForegroundColor Yellow
npm run db:migrate

Write-Host ""
Write-Host "🎉 Production environment started!" -ForegroundColor Green
Write-Host "   Application: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Logs: docker logs acquisition-app-prod" -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "   View logs: docker logs -f acquisition-app-prod" -ForegroundColor Gray
Write-Host "   Stop app: docker compose -f docker-compose.prod.yaml down" -ForegroundColor Gray

