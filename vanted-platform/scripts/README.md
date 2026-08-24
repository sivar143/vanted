# Vanted local setup scripts

These scripts are for deterministic local development on Windows 11 and Debian/Ubuntu Linux.

## Windows 11

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
cd vanted-platform\scripts
.\setup-windows.ps1
```

Normal local runtime:

```powershell
.\start-windows.ps1
```

Production-like local debugging with sandbox integrations:

```powershell
.\start-local-debug-windows.ps1
```

Stop/reset local infrastructure:

```powershell
.\stop-windows.ps1
.\reset-local-windows.ps1
```

## Linux

```bash
cd vanted-platform
chmod +x scripts/*.sh
./scripts/setup-linux.sh
```

Normal local runtime:

```bash
./scripts/start-linux.sh
```

Production-like local debugging with sandbox integrations:

```bash
./scripts/start-local-debug-linux.sh
```

Stop/reset local infrastructure:

```bash
./scripts/stop-linux.sh
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

MySQL, RabbitMQ, Redis and NGINX run in containers; they do not need to be installed directly on the host.

## Environment behavior

Normal local mode is the default and uses mock/disabled external integrations. The debug launcher creates an untracked `.env.debug` file and enables operational features such as observability and sandbox integrations while keeping Kubernetes disabled and production features false.

## Local endpoints

- Application: http://localhost
- RabbitMQ management UI: http://localhost:15672
- Backend services are not published directly; NGINX is the public entry point.

## Version policy

Use GA/stable releases only. Do not use milestone, release-candidate, nightly or preview versions in production. Container tags are pinned rather than `latest`.
