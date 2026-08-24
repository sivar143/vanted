[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $Root

if (-not (Test-Path '.env')) { Copy-Item '.env.example' '.env' }

docker compose up -d --build
if ($LASTEXITCODE -ne 0) { throw "Vanted startup failed. Inspect docker compose ps/logs. Exit code: $LASTEXITCODE" }
Write-Host "Vanted is running at http://localhost:8080" -ForegroundColor Green
Write-Host "RabbitMQ management: http://localhost:15672" -ForegroundColor Green
docker compose ps
