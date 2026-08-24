# Vanted local setup scripts

These scripts provide deterministic local development on Windows 11 and Debian/Ubuntu Linux.

The default runtime is **local development using Docker Compose**. Kubernetes is not required for normal local development.

## 1. First-time setup

### Windows 11

Prerequisites:

- Windows 11
- Git
- Docker Desktop installed and running
- PowerShell 7 or Windows PowerShell
- Internet access for the bootstrap script to install missing host tools

Clone the repository if it is not already present:

```powershell
git clone https://github.com/sivar143/vanted.git
cd vanted\vanted-platform
```

Allow the local PowerShell scripts to run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Run the first-time setup:

```powershell
cd scripts
.\setup-windows.ps1
```

The Windows bootstrap enforces the project's exact Node.js and Maven baselines. Node.js is installed from the official Node.js MSI when the detected version is wrong; Maven 3.9.16 is installed from the official Apache binary distribution because the Maven package is not consistently available through winget. The script refreshes the current process PATH after installation and also persists the Maven user PATH.

If Docker Desktop was installed by the script but the Docker command is not yet available, start Docker Desktop, close/reopen PowerShell, and rerun the setup script.

### Debian/Ubuntu Linux

Clone the repository if needed:

```bash
git clone https://github.com/sivar143/vanted.git
cd vanted/vanted-platform
```

Make the scripts executable:

```bash
chmod +x scripts/*.sh
```

Run the first-time setup:

```bash
./scripts/setup-linux.sh
```

The Linux bootstrap currently targets Debian/Ubuntu systems with `apt-get`.

## 2. Normal local development

### Windows 11

```powershell
cd vanted\vanted-platform\scripts
.\start-windows.ps1
```

### Linux

```bash
cd vanted/vanted-platform
./scripts/start-linux.sh
```

Open the application at:

```text
http://localhost
```

NGINX is the public entry point. The Spring Boot microservices are intentionally not exposed directly to the host.

## 3. Production-like local debugging

Use this mode when you need to reproduce issues involving infrastructure or operational behavior that is normally disabled in local mode.

### Windows 11

```powershell
cd vanted\vanted-platform\scripts
.\start-local-debug-windows.ps1
```

### Linux

```bash
cd vanted/vanted-platform
./scripts/start-local-debug-linux.sh
```

This mode remains **LOCAL**. It can enable observability, RabbitMQ, Redis, and sandbox external integrations while keeping Kubernetes and production features disabled. Live production credentials/endpoints must never be used.

The debug launcher creates an untracked `.env.debug` file so your personal debug configuration is not committed.

## 4. Stop the local environment

### Windows 11

```powershell
.\stop-windows.ps1
```

### Linux

```bash
./scripts/stop-linux.sh
```

## 5. Reset the local environment completely

Use this when you want to delete local containers and persistent development data and rebuild from scratch.

### Windows 11

```powershell
.\reset-local-windows.ps1
```

### Linux

```bash
./scripts/reset-local-linux.sh
```

The reset removes local Docker volumes, including MySQL, RabbitMQ and Redis data. Do not use it if you need to preserve your local data.

## 6. Useful Docker commands

From `vanted-platform`:

```powershell
# Show service status
docker compose ps

# Follow all service logs
docker compose logs -f

# Follow one service
docker compose logs -f auth-service

# Restart one service
docker compose restart auth-service

# Rebuild one service
docker compose build auth-service
```

The same commands work from Linux using `docker compose`.

## 7. What the setup scripts install/check

The bootstrap scripts check or install the host development toolchain:

- Git
- Node.js 24.19.0 LTS
- Angular 22.1 stable line
- Java 25 LTS
- Apache Maven 3.9.16
- Docker Engine/Desktop
- Docker Compose
- Project npm dependencies

The application infrastructure runs in containers, so MySQL, RabbitMQ, Redis and NGINX do **not** need to be installed directly on the host.

## 8. Environment behavior

Vanted supports explicit environment modes plus independent feature flags.

```text
local
  VANTED_LOCAL_MODE=true
  Kubernetes=false
  Production features=false

local debug
  VANTED_LOCAL_MODE=true
  Kubernetes=false
  Production features=false
  Debug/observability/infrastructure features selectively enabled
  Payment mode=sandbox

test
  VANTED_LOCAL_MODE=false
  VANTED_TEST_MODE=true

production
  VANTED_LOCAL_MODE=false
  VANTED_PRODUCTION_FEATURES=true
  Kubernetes=true
  Secrets come from the deployment platform
```

Environment flags are not treated as the sole security boundary. Authentication, authorization, network policy, secret management and the deployment platform remain authoritative security controls.

## 9. Local endpoints

- Application: `http://localhost`
- RabbitMQ management UI: `http://localhost:15672`
- Backend services: not published directly to the host
- NGINX: public entry point on port 80; HTTPS is used in production deployment

## 10. Common first-run problems

### `mvn` is not recognized

First update your local copy of the repository because the Windows bootstrap has been hardened to install Maven directly from Apache:

```powershell
git pull origin main
cd vanted-platform\scripts
.\setup-windows.ps1
```

The bootstrap installs Maven into `%LOCALAPPDATA%\Vanted\tools\apache-maven-3.9.16`, sets `MAVEN_HOME`, updates the user PATH and updates the current PowerShell process PATH.

### Node.js is an older version

The setup script checks the exact required Node.js version. For this project the baseline is Node.js `24.19.0`. If an older version such as Node.js 18 is installed, rerun the updated setup script; it will install the required Node.js MSI and re-check the active version.

### Java is already installed but the wrong major is active

The setup script checks for Java 25. If another Java major is active, install Temurin 25 through the setup script and reopen PowerShell if Windows PATH changes are not visible immediately.

### Docker is not running

Start Docker Desktop on Windows or ensure the Docker daemon is running on Linux, then rerun the start/setup script.

### PowerShell blocks scripts

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then run the script again.

### Port 80 is already in use

Stop the application using port 80 or change the local NGINX port mapping in `docker-compose.yml`.

### I need a completely clean environment

Use the platform-specific `reset-local-*` script from section 5.

## 11. Version policy

Use GA/stable releases only. Do not use milestone, release-candidate, nightly or preview versions in production. Container tags are pinned rather than `latest`.

See `../VERSIONS.md` for the project's supported dependency baseline and upgrade policy.

## 12. Production deployment documentation

Local setup is separate from production deployment.

Production Kubernetes manifests and deployment guidance are under:

```text
deploy/kubernetes/
```

The production deployment uses the same application container images with Kubernetes/Helm-style deployment and production-managed secrets.