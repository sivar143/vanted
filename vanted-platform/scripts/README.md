# Vanted local setup scripts

These scripts are intended for a clean developer workstation.

## Windows 11

Use PowerShell 7 or Windows PowerShell as Administrator for the first run if winget needs elevated installation permissions.

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
cd vanted-platform\scripts
.\setup-windows.ps1
```

After the initial setup, start the stack with:

```powershell
.\start-windows.ps1
```

Stop it with:

```powershell
.\stop-windows.ps1
```

To destroy local containers and volumes and rebuild from scratch:

```powershell
.\reset-local-windows.ps1
```

Docker Desktop must be running before `docker compose` commands can complete.

## Linux

The current bootstrap targets Debian/Ubuntu Linux.

```bash
cd vanted-platform
chmod +x scripts/*.sh
./scripts/setup-linux.sh
```

After the initial setup:

```bash
./scripts/start-linux.sh
./scripts/stop-linux.sh
```

To destroy local containers and database/message/cache volumes and rebuild:

```bash
./scripts/reset-local-linux.sh
```

## What setup installs/checks

- Git
- Node.js 24.19.0 LTS
- Angular 22.1 stable line
- Java 25 LTS
- Apache Maven 3.9.16
- Docker Engine/Desktop
- Docker Compose
- Project npm dependencies
- Project environment file from `.env.example`

The application dependencies themselves run in containers, so a developer does not need to install MySQL, RabbitMQ, Redis, or NGINX directly on the host.

## Local endpoints

- Application: http://localhost
- RabbitMQ management UI: http://localhost:15672
- Backend services are intentionally not published directly; NGINX is the public entry point.

## Version policy

Use GA/stable releases only. Do not use milestone, release-candidate, nightly, or preview versions in the application unless a documented exception is approved.

The repository currently pins the major/minor baselines in source files and pins container image versions in Docker Compose. Re-run the version verification before planned dependency upgrades.
