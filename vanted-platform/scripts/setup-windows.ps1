[CmdletBinding()]
param(
    [switch]$SkipLocalBuild
)

$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $Root

$NodeLts = '24.19.0'
$JavaMajor = '25'
$MavenVersion = '3.9.16'

function Write-Step([string]$Message) {
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Ensure-Command([string]$Name, [string]$WingetId) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
            throw "'$Name' is missing and winget is unavailable. Install Windows App Installer from Microsoft Store, then rerun this script."
        }
        Write-Step "Installing $Name via winget ($WingetId)"
        winget install --id $WingetId -e --accept-source-agreements --accept-package-agreements
    }
}

Write-Step 'Checking Windows 11'
if ([Environment]::OSVersion.Platform -ne 'Win32NT') { throw 'Run this script from Windows PowerShell/PowerShell 7 on Windows 11.' }

Ensure-Command 'git' 'Git.Git'
Ensure-Command 'node' 'OpenJS.NodeJS.LTS'
Ensure-Command 'java' 'EclipseAdoptium.Temurin.25.JDK'
Ensure-Command 'mvn' 'Apache.Maven'
Ensure-Command 'docker' 'Docker.DockerDesktop'

Write-Step 'Refreshing PATH after installs'
$machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$env:Path = "$userPath;$machinePath"

if (-not (Get-Command 'docker' -ErrorAction SilentlyContinue)) {
    throw 'Docker Desktop was installed but is not yet available in PATH. Start Docker Desktop, reopen PowerShell, and rerun this script.'
}

if (-not (Get-Command 'docker' -ErrorAction SilentlyContinue)) { throw 'Docker CLI not found.' }

Write-Step 'Verifying toolchain'
node --version
npm --version
java -version
mvn -version
docker --version
docker compose version

if (-not (Test-Path '.env')) {
    Copy-Item '.env.example' '.env'
    Write-Host 'Created .env from .env.example' -ForegroundColor Green
}

Write-Step 'Installing frontend packages'
Push-Location 'frontend'
npm install
Pop-Location

if (-not $SkipLocalBuild) {
    Write-Step 'Building and starting Vanted'
    docker compose pull
    docker compose up -d --build
}

Write-Step 'Completed'
Write-Host 'Open: http://localhost' -ForegroundColor Green
Write-Host 'Check services: docker compose ps' -ForegroundColor Green
