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

function Install-WingetPackage([string]$Id, [string]$Name, [string]$Version = $null) {
    Ensure-Winget
    Write-Step "Installing/updating $Name via winget ($Id)"

    $args = @('install', '--id', $Id, '-e', '--accept-source-agreements', '--accept-package-agreements')
    if ($Version) {
        $args += @('--version', $Version)
    }

    & winget @args
    if ($LASTEXITCODE -ne 0) {
        throw "winget failed while installing $Name (exit code $LASTEXITCODE)."
    }
}

function Get-NodeVersion {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) { return $null }
    return ((node --version) -replace '^v', '').Trim()
}

function Get-JavaVersionText {
    $output = & cmd.exe /d /c "java -version 2>&1"
    if ($LASTEXITCODE -ne 0) {
        throw "Java version check failed with exit code $LASTEXITCODE."
    }
    return ($output | Out-String).Trim()
}

function Invoke-NativeChecked([string]$Command, [string[]]$Arguments, [string]$FailureMessage) {
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$FailureMessage Exit code: $LASTEXITCODE"
    }
}

Write-Step 'Checking Windows'
if ([Environment]::OSVersion.Platform -ne 'Win32NT') {
    throw 'Run this script from Windows PowerShell/PowerShell 7 on Windows.'
}

Ensure-Winget

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Install-WingetPackage 'Git.Git' 'Git'
    Refresh-ProcessPath
}

Refresh-ProcessPath
$installedNode = Get-NodeVersion
if ($installedNode -ne $NodeLts) {
    if ($installedNode) {
        Write-Host "Found Node.js $installedNode; Vanted requires Node.js $NodeLts." -ForegroundColor Yellow
    }
    Install-WingetPackage 'OpenJS.NodeJS.LTS' 'Node.js LTS' $NodeLts
    Refresh-ProcessPath
}

$installedNode = Get-NodeVersion
if ($installedNode -ne $NodeLts) {
    throw "Node.js $NodeLts could not be made active. Detected: $installedNode. Close PowerShell, open a new PowerShell window, and rerun this script."
}

$javaVersion = $null
if (Get-Command java -ErrorAction SilentlyContinue) {
    $javaVersion = Get-JavaVersionText
}
if (-not $javaVersion -or $javaVersion -notmatch '"25\.') {
    Install-WingetPackage 'EclipseAdoptium.Temurin.25.JDK' 'Temurin JDK 25'
    Refresh-ProcessPath
    $javaVersion = Get-JavaVersionText
}
if (-not $javaVersion -or $javaVersion -notmatch '"25\.') {
    throw "Java 25 could not be made active. Detected: $javaVersion"
}

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
Write-Host "Java: $($javaVersion -split "`r?`n" | Select-Object -First 1)"
Write-Host 'Maven:'
mvn -version
Write-Host "Docker: $(docker --version)"
Write-Host "Compose: $(docker compose version)"

if ((Get-NodeVersion) -ne $NodeLts) {
    throw "Node.js version mismatch. Expected $NodeLts."
}
if ($javaVersion -notmatch '"25\.') {
    throw "Java version mismatch. Expected Java 25. Detected: $javaVersion"
}
$mavenCheck = (mvn -version 2>&1 | Select-Object -First 1).ToString()
if ($mavenCheck -notmatch [regex]::Escape("Apache Maven $MavenVersion")) {
    throw "Maven version mismatch. Expected $MavenVersion. Detected: $mavenCheck"
}

if (-not (Test-Path '.env')) {
    Copy-Item '.env.example' '.env'
    Write-Host 'Created .env from .env.example' -ForegroundColor Green
}

Write-Step 'Validating Docker Compose configuration'
Invoke-NativeChecked 'docker' @('compose', 'config', '--quiet') 'Docker Compose configuration validation failed.'

Write-Step 'Installing frontend packages'
Push-Location 'frontend'
try {
    Invoke-NativeChecked 'npm' @('install') 'Frontend dependency installation failed.'
} finally {
    Pop-Location
}

if (-not $SkipLocalBuild) {
    Write-Step 'Pulling required container images'
    Invoke-NativeChecked 'docker' @('compose', 'pull') 'Docker image pull failed. Check that every image tag exists and Docker Desktop has network access.'

    Write-Step 'Building and starting Vanted'
    Invoke-NativeChecked 'docker' @('compose', 'up', '-d', '--build') 'Vanted startup failed. Inspect `docker compose ps` and `docker compose logs` for the failing service.'
}

Write-Step 'Completed successfully'
Write-Host 'Open: http://localhost:8080' -ForegroundColor Green
Write-Host 'RabbitMQ management: http://localhost:15672' -ForegroundColor Green
Write-Host 'Check services: docker compose ps' -ForegroundColor Green
