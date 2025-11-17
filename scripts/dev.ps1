# Development startup script for Acquisition App with Neon Local
# PowerShell version for Windows

Write-Host "🚀 Starting Acquisition App in Development Mode" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.development exists
if (-not (Test-Path .env.development)) {
    Write-Host "❌ Error: .env.development file not found!" -ForegroundColor Red
    Write-Host "   Please copy .env.development from the template and update with your Neon credentials." -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Error: Docker is not running!" -ForegroundColor Red
    Write-Host "   Please start Docker Desktop and try again." -ForegroundColor Yellow
    exit 1
}

# Create .neon_local directory if it doesn't exist
if (-not (Test-Path .neon_local)) {
    New-Item -ItemType Directory -Path .neon_local | Out-Null
}

# Add .neon_local to .gitignore if not already present
$gitignoreContent = Get-Content .gitignore -ErrorAction SilentlyContinue
if ($gitignoreContent -notcontains ".neon_local/") {
    Add-Content -Path .gitignore -Value ".neon_local/"
    Write-Host "✅ Added .neon_local/ to .gitignore" -ForegroundColor Green
}

Write-Host "📦 Building and starting development containers..." -ForegroundColor Yellow
Write-Host "   - Neon Local proxy will create an ephemeral database branch" -ForegroundColor Gray
Write-Host "   - Application will run with hot reload enabled" -ForegroundColor Gray
Write-Host ""

# Run migrations with Drizzle
Write-Host "📜 Applying latest schema with Drizzle..." -ForegroundColor Yellow
npm run db:migrate

# Wait for the database to be ready
Write-Host "⏳ Waiting for the database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start development environment
Write-Host "🐳 Starting Docker containers..." -ForegroundColor Yellow
docker compose -f docker-compose.dev.yaml up --build

Write-Host ""
Write-Host "🎉 Development environment started!" -ForegroundColor Green
$port = if ($env:PORT) { $env:PORT } else { "3000" }
Write-Host "   Application: http://localhost:$port" -ForegroundColor Cyan
Write-Host "   Database: postgres://neon:npg@localhost:5432/neondb" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop the environment, press Ctrl+C or run: docker compose down" -ForegroundColor Yellow

