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
$MavenHome = Join-Path $env:LOCALAPPDATA "Vanted\tools\apache-maven-$MavenVersion"

function Write-Step([string]$Message) {
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Refresh-ProcessPath {
    $machinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    $env:Path = "$userPath;$machinePath"
}

function Ensure-Winget {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        throw "winget is required to install Windows packages. Install Microsoft App Installer/winget, then reopen PowerShell and rerun this script."
    }
}

function Install-WingetPackage([string]$Id, [string]$Name) {
    Ensure-Winget
    Write-Step "Installing $Name via winget ($Id)"
    & winget install --id $Id -e --accept-source-agreements --accept-package-agreements
    if ($LASTEXITCODE -ne 0) {
        throw "winget failed while installing $Name (exit code $LASTEXITCODE)."
    }
}

function Get-NodeVersion {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) { return $null }
    return ((node --version) -replace '^v', '').Trim()
}

function Install-ExactNode {
    Write-Step "Installing Node.js $NodeLts from the official Node.js MSI"
    $nodeMsi = Join-Path $env:TEMP "node-v$NodeLts-x64.msi"
    $nodeUrl = "https://nodejs.org/dist/v$NodeLts/node-v$NodeLts-x64.msi"

    Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeMsi -UseBasicParsing
    if (-not (Test-Path $nodeMsi)) {
        throw "Node.js installer was not downloaded: $nodeMsi"
    }

    $process = Start-Process -FilePath 'msiexec.exe' -ArgumentList @('/i', $nodeMsi, '/qn', '/norestart') -Wait -PassThru -Verb RunAs
    if ($process.ExitCode -notin @(0, 3010)) {
        throw "Node.js MSI installation failed with exit code $($process.ExitCode)."
    }

    Remove-Item $nodeMsi -Force -ErrorAction SilentlyContinue
    Refresh-ProcessPath
}

Write-Step 'Checking Windows'
if ([Environment]::OSVersion.Platform -ne 'Win32NT') {
    throw 'Run this script from Windows PowerShell/PowerShell 7 on Windows.'
}

Ensure-Winget

# Basic host tools.
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Install-WingetPackage 'Git.Git' 'Git'
    Refresh-ProcessPath
}

# Angular 22 uses the Node 24 LTS line. We require the exact project baseline rather than
# accepting an older installed Node version. winget package catalogs can lag, so the exact
# Node.js MSI from nodejs.org is used for deterministic installation.
Refresh-ProcessPath
$installedNode = Get-NodeVersion
if ($installedNode -ne $NodeLts) {
    if ($installedNode) {
        Write-Host "Found Node.js $installedNode; Vanted requires Node.js $NodeLts." -ForegroundColor Yellow
    }
    Install-ExactNode
}

$installedNode = Get-NodeVersion
if ($installedNode -ne $NodeLts) {
    throw "Node.js $NodeLts could not be made active. Detected: $installedNode. Close PowerShell, open a new PowerShell window, and rerun this script."
}

# Java 25 LTS.
$javaVersion = $null
if (Get-Command java -ErrorAction SilentlyContinue) {
    $javaVersion = (java -version 2>&1 | Select-Object -First 1).ToString()
}
if (-not $javaVersion -or $javaVersion -notmatch '"25\.') {
    Install-WingetPackage 'EclipseAdoptium.Temurin.25.JDK' 'Temurin JDK 25'
    Refresh-ProcessPath
}

# Maven 3.9.16 is installed from the official Apache binary distribution because the
# Apache Maven package identifier is not consistently available in winget sources.
Refresh-ProcessPath
$mvnCommand = Get-Command mvn -ErrorAction SilentlyContinue
$mavenIsCorrect = $false
if ($mvnCommand) {
    $mavenVersionLine = (& mvn -version 2>$null | Select-Object -First 1)
    $mavenIsCorrect = $mavenVersionLine -match [regex]::Escape("Apache Maven $MavenVersion")
}

if (-not $mavenIsCorrect) {
    Write-Step "Installing Apache Maven $MavenVersion from the official Apache distribution"

    $toolsRoot = Split-Path -Parent $MavenHome
    New-Item -ItemType Directory -Path $toolsRoot -Force | Out-Null

    $mavenZip = Join-Path $env:TEMP "apache-maven-$MavenVersion-bin.zip"
    $mavenUrl = "https://dlcdn.apache.org/maven/maven-3/$MavenVersion/binaries/apache-maven-$MavenVersion-bin.zip"

    if (-not (Test-Path $MavenHome)) {
        Invoke-WebRequest -Uri $mavenUrl -OutFile $mavenZip -UseBasicParsing
        if (-not (Test-Path $mavenZip)) {
            throw "Maven archive was not downloaded: $mavenZip"
        }

        Expand-Archive -Path $mavenZip -DestinationPath $toolsRoot -Force
        Remove-Item $mavenZip -Force -ErrorAction SilentlyContinue
    }

    if (-not (Test-Path (Join-Path $MavenHome 'bin\mvn.cmd'))) {
        throw "Maven installation is incomplete. Expected: $(Join-Path $MavenHome 'bin\mvn.cmd')"
    }

    [Environment]::SetEnvironmentVariable('MAVEN_HOME', $MavenHome, 'User')

    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    $mavenBin = Join-Path $MavenHome 'bin'
    $pathEntries = @($userPath -split ';' | Where-Object { $_ -and $_.Trim() })
    if ($pathEntries -notcontains $mavenBin) {
        [Environment]::SetEnvironmentVariable('Path', (($pathEntries + $mavenBin) -join ';'), 'User')
    }

    $env:MAVEN_HOME = $MavenHome
    Refresh-ProcessPath
    $env:Path = "$mavenBin;$env:Path"
}

# Docker Desktop.
Refresh-ProcessPath
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Install-WingetPackage 'Docker.DockerDesktop' 'Docker Desktop'
    Refresh-ProcessPath
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'Docker CLI is not available. Start Docker Desktop, close PowerShell, open a new PowerShell window, and rerun this script.'
}

Write-Step 'Verifying toolchain'
Write-Host "Node: $(node --version)"
Write-Host "npm:  $(npm --version)"
Write-Host 'Java:'
java -version
Write-Host 'Maven:'
mvn -version
Write-Host "Docker: $(docker --version)"
Write-Host "Compose: $(docker compose version)"

if ((Get-NodeVersion) -ne $NodeLts) {
    throw "Node.js version mismatch. Expected $NodeLts."
}

$mavenCheck = (mvn -version 2>&1 | Select-Object -First 1).ToString()
if ($mavenCheck -notmatch [regex]::Escape("Apache Maven $MavenVersion")) {
    throw "Maven version mismatch. Expected $MavenVersion. Detected: $mavenCheck"
}

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
