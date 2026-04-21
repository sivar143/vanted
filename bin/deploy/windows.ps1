###############################################################################
#  Vanted — One-shot deploy script for Windows 10 / 11 (PowerShell)
#
#  Installs Node.js 22, pnpm, PostgreSQL 16 (via Chocolatey), Git, clones the
#  repo, sets up the database, and prepares the app to run.
#
#  REQUIREMENTS:
#    Run PowerShell AS ADMINISTRATOR.
#
#  Usage (paste into Admin PowerShell):
#    Set-ExecutionPolicy Bypass -Scope Process -Force
#    iwr -useb https://raw.githubusercontent.com/sivar143/vanted/production/bin/deploy/windows.ps1 | iex
#
#  Or download then run:
#    .\windows.ps1
#
#  Optional environment variables (set before running):
#    $env:REPO_URL    — git repo URL (default: https://github.com/sivar143/vanted.git)
#    $env:BRANCH      — git branch (default: production)
#    $env:INSTALL_DIR — install directory (default: C:\vanted)
#    $env:DB_NAME     — database name (default: vanted)
#    $env:DB_USER     — db user (default: postgres)
#    $env:DB_PASS     — db password (default: vanted-postgres-2024)
#    $env:PORT        — API port (default: 8080)
###############################################################################

$ErrorActionPreference = "Stop"

# Defaults
if (-not $env:REPO_URL)    { $env:REPO_URL    = "https://github.com/sivar143/vanted.git" }
if (-not $env:BRANCH)      { $env:BRANCH      = "production" }
if (-not $env:INSTALL_DIR) { $env:INSTALL_DIR = "C:\vanted" }
if (-not $env:DB_NAME)     { $env:DB_NAME     = "vanted" }
if (-not $env:DB_USER)     { $env:DB_USER     = "postgres" }
if (-not $env:DB_PASS)     { $env:DB_PASS     = "vanted-postgres-2024" }
if (-not $env:PORT)        { $env:PORT        = "8080" }

function Log   ($m) { Write-Host "[vanted] $m" -ForegroundColor Green }
function Warn  ($m) { Write-Host "[vanted] $m" -ForegroundColor Yellow }
function Fail  ($m) { Write-Host "[vanted] $m" -ForegroundColor Red; exit 1 }

# --- Admin check ---------------------------------------------------------
$isAdmin = ([Security.Principal.WindowsPrincipal] `
  [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Fail "This script must be run as Administrator. Right-click PowerShell → 'Run as Administrator'."
}

Log "==========================================================="
Log "  Vanted Deploy — Windows"
Log "==========================================================="

# --- 1. Chocolatey -------------------------------------------------------
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
  Log "[1/7] Installing Chocolatey package manager..."
  Set-ExecutionPolicy Bypass -Scope Process -Force
  [System.Net.ServicePointManager]::SecurityProtocol = `
    [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
  iex ((New-Object System.Net.WebClient).DownloadString(
    "https://chocolatey.org/install.ps1"))
  $env:Path = "$env:Path;$env:ALLUSERSPROFILE\chocolatey\bin"
} else {
  Log "[1/7] Chocolatey already installed."
}

# --- 2. Git --------------------------------------------------------------
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Log "[2/7] Installing Git..."
  choco install -y git
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
} else {
  Log "[2/7] Git already installed."
}

# --- 3. Node.js 22 -------------------------------------------------------
$needNode = $true
if (Get-Command node -ErrorAction SilentlyContinue) {
  $v = (node -v) -replace 'v', '' -split '\.'
  if ([int]$v[0] -ge 20) { $needNode = $false }
}
if ($needNode) {
  Log "[3/7] Installing Node.js 22..."
  choco install -y nodejs-lts --version=22.11.0
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
} else {
  Log "[3/7] Node.js $(node -v) already installed."
}

# --- 4. pnpm -------------------------------------------------------------
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Log "[4/7] Installing pnpm..."
  npm install -g pnpm
} else {
  Log "[4/7] pnpm $(pnpm -v) already installed."
}

# --- 5. PostgreSQL -------------------------------------------------------
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
  Log "[5/7] Installing PostgreSQL 16 (password: $env:DB_PASS)..."
  choco install -y postgresql16 --params "/Password:$env:DB_PASS"
  # Refresh PATH to find psql
  $pgPath = "C:\Program Files\PostgreSQL\16\bin"
  if (Test-Path $pgPath) {
    $env:Path = "$env:Path;$pgPath"
  }
  $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
} else {
  Log "[5/7] PostgreSQL already installed."
}

# Ensure service is running
$pgSvc = Get-Service | Where-Object { $_.Name -like "postgresql*" } | Select-Object -First 1
if ($pgSvc -and $pgSvc.Status -ne 'Running') {
  Start-Service $pgSvc.Name
  Start-Sleep -Seconds 3
}

# --- 6. Database creation -----------------------------------------------
Log "[6/7] Creating database '$env:DB_NAME'..."
$env:PGPASSWORD = $env:DB_PASS
$dbExists = & psql -U $env:DB_USER -h localhost -tAc `
  "SELECT 1 FROM pg_database WHERE datname='$env:DB_NAME'" 2>$null
if ($dbExists -ne "1") {
  & psql -U $env:DB_USER -h localhost -c "CREATE DATABASE $env:DB_NAME;" | Out-Null
  Log "  Database '$env:DB_NAME' created."
} else {
  Log "  Database '$env:DB_NAME' already exists."
}

$DB_URL = "postgresql://$env:DB_USER`:$env:DB_PASS@localhost:5432/$env:DB_NAME"

# --- 7. Clone & install --------------------------------------------------
Log "[7/7] Cloning $env:REPO_URL ($env:BRANCH) → $env:INSTALL_DIR..."
if (Test-Path "$env:INSTALL_DIR\.git") {
  Push-Location $env:INSTALL_DIR
  git fetch origin
  git checkout $env:BRANCH
  git pull origin $env:BRANCH
  Pop-Location
} else {
  git clone --branch $env:BRANCH --depth 1 $env:REPO_URL $env:INSTALL_DIR
}

# Generate session secret
Add-Type -AssemblyName System.Security
$bytes = New-Object byte[] 32
([Security.Cryptography.RandomNumberGenerator]::Create()).GetBytes($bytes)
$sessionSecret = -join ($bytes | ForEach-Object { "{0:x2}" -f $_ })

# Write .env
@"
DATABASE_URL=$DB_URL
PORT=$env:PORT
NODE_ENV=production
SESSION_SECRET=$sessionSecret
"@ | Out-File -FilePath "$env:INSTALL_DIR\.env" -Encoding ascii -Force

Push-Location $env:INSTALL_DIR

Log "Installing project dependencies (this may take several minutes)..."
pnpm install --frozen-lockfile
if ($LASTEXITCODE -ne 0) { pnpm install }

Log "Pushing database schema..."
$env:DATABASE_URL = $DB_URL
pnpm --filter @workspace/db run push-force

Log "Seeding services..."
pnpm --filter @workspace/scripts run tsx src/seed-vanted.ts 2>$null
if ($LASTEXITCODE -ne 0) {
  Warn "Seed script unavailable — services can be added via the admin panel."
}

Pop-Location

Log ""
Log "==========================================================="
Log "  Vanted is installed at: $env:INSTALL_DIR"
Log "==========================================================="
Log "  Database URL: $DB_URL"
Log "  API port:     $env:PORT"
Log ""
Log "  To start in DEV mode (in a NEW PowerShell window):"
Log "    cd $env:INSTALL_DIR"
Log "    pnpm run dev"
Log ""
Log "  Admin login: admin / vanted-admin-2024"
Log "==========================================================="
