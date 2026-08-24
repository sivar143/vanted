[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $Root

Write-Host 'WARNING: this removes local Vanted containers AND database/message/cache volumes.' -ForegroundColor Yellow
$confirmation = Read-Host 'Type RESET to continue'
if ($confirmation -ne 'RESET') { Write-Host 'Cancelled.'; exit 1 }

docker compose down -v --remove-orphans
if (Test-Path '.env') { Remove-Item '.env' -Force }
Copy-Item '.env.example' '.env'

docker compose pull
docker compose up -d --build

Write-Host 'Local Vanted environment reset and restarted.' -ForegroundColor Green
