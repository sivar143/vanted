[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $Root

if (-not (Test-Path '.env')) { Copy-Item '.env.example' '.env' }

docker compose up -d --build
Write-Host "Vanted is running at http://localhost" -ForegroundColor Green
docker compose ps
