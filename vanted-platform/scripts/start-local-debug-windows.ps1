[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $Root

if (-not (Test-Path '.env')) { Copy-Item '.env.example' '.env' }
Copy-Item '.env' '.env.debug' -Force

$content = Get-Content '.env.debug'
$replacements = @{
  'VANTED_DEBUG_FEATURES' = 'true'
  'VANTED_OBSERVABILITY_ENABLED' = 'true'
  'VANTED_EXTERNAL_INTEGRATIONS_ENABLED' = 'true'
  'VANTED_PAYMENT_MODE' = 'sandbox'
  'VANTED_KUBERNETES_ENABLED' = 'false'
  'VANTED_PRODUCTION_FEATURES' = 'false'
}
foreach ($key in $replacements.Keys) {
  $value = $replacements[$key]
  if ($content -match "^$key=") {
    $content = $content -replace "^$key=.*$", "$key=$value"
  } else {
    $content += "$key=$value"
  }
}
Set-Content '.env.debug' $content

docker compose --env-file .env.debug up -d --build
if ($LASTEXITCODE -ne 0) { throw "Vanted local debug startup failed. Exit code: $LASTEXITCODE" }
Write-Host 'Vanted local debug environment is running at http://localhost:8080' -ForegroundColor Green
Write-Host 'RabbitMQ management: http://localhost:15672' -ForegroundColor Green
Write-Host 'Production-like features are enabled with sandbox integrations only.' -ForegroundColor Yellow
docker compose --env-file .env.debug ps
