# Deployment & Operations Guide (Frontend + Backend + MySQL + Android)

> **Maintenance policy:** This file is the deployment source-of-truth for this repository.
> Whenever deployment steps change in future development, update this file in the same PR/commit.

## 1) Target architecture

Recommended production topology:
- **Frontend:** Angular app served via Nginx (or CDN + object storage)
- **Backend:** Java Spring Boot microservices (containerized)
- **Database:** MySQL 8.x
- **Android:** APK/AAB built in CI and distributed via Play Console/internal testing

## 2) Prerequisites

Install on deployment host or CI runner:
- Docker 24+
- Docker Compose v2+
- JDK 17+ (backend builds)
- Node.js 20+ and npm 10+ (frontend builds)
- Android SDK + JDK 17 (Android release builds)
- Git

## 3) Environment variables

Create environment files (never commit secrets):

### Backend (`backend/.env`)
```env
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
DB_HOST=mysql
DB_PORT=3306
DB_NAME=vanted
DB_USER=vanted_app
DB_PASSWORD=change_me
JWT_SECRET=replace_with_long_random_secret
CORS_ALLOWED_ORIGINS=https://app.example.com
```

### Frontend (`frontend/webUI/.env`)
```env
API_BASE_URL=https://api.example.com
```

### MySQL (`mysql/.env`)
```env
MYSQL_ROOT_PASSWORD=change_root_password
MYSQL_DATABASE=vanted
MYSQL_USER=vanted_app
MYSQL_PASSWORD=change_me
```

## 4) Local/staging deployment with Docker Compose

Create `docker-compose.yml` in project root (or `docker/` folder) with services:
- `mysql`
- one or more backend service containers
- frontend container (Nginx)

Minimal example:
```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: vanted-mysql
    env_file:
      - ./mysql/.env
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 10

  backend:
    build: ./backend
    container_name: vanted-backend
    env_file:
      - ./backend/.env
    depends_on:
      mysql:
        condition: service_healthy
    ports:
      - "8080:8080"

  frontend:
    build: ./frontend/webUI/angular
    container_name: vanted-frontend
    depends_on:
      - backend
    ports:
      - "80:80"

volumes:
  mysql_data:
```

Bring up stack:
```bash
docker compose up -d --build
```

Check health:
```bash
docker compose ps
docker compose logs -f backend
```

## 5) MySQL deployment details

### Initialize schema
Choose one:
1. Flyway/Liquibase migrations inside backend startup (recommended)
2. Manual SQL scripts mounted into `/docker-entrypoint-initdb.d`

### Backup
Daily backup job example:
```bash
docker exec vanted-mysql sh -c 'mysqldump -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE' > backup.sql
```

### Restore
```bash
cat backup.sql | docker exec -i vanted-mysql sh -c 'mysql -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE'
```

## 6) Backend deployment (Spring Boot microservices)

### Build
```bash
cd backend
./gradlew clean build
```

### Containerize
Use multi-stage Dockerfile:
1. build jar
2. copy jar into lightweight JRE base image

### Run standalone (non-compose)
```bash
docker run -d --name vanted-backend \
  --env-file backend/.env \
  -p 8080:8080 vanted-backend:latest
```

### Production checks
- `/actuator/health` enabled and protected
- logs centralized (ELK/OpenSearch/Cloud logging)
- readiness/liveness probes configured
- DB pool limits tuned

## 7) Frontend deployment (Angular)

### Build
```bash
cd frontend/webUI/angular
npm ci
npm run build -- --configuration production
```

### Serve options
1. **Nginx container** (simplest)
2. **CDN + static hosting** (best global performance)

Nginx should route SPA paths to `index.html` and proxy `/api` to backend.

## 8) Android app deployment

### Debug build (local)
```bash
./gradlew assembleDebug
```
Output: `frontend/androidAPP/build/outputs/apk/debug/`

### Release bundle (Play Store)
```bash
./gradlew bundleRelease
```
Output: `frontend/androidAPP/build/outputs/bundle/release/app-release.aab`

### Signing
- Create/upload keystore securely
- Configure signing in Gradle or CI secrets
- Never commit keystore or passwords

### Distribution
- Internal testing track first
- Closed testing after sanity checks
- Promote to production in phased rollout

## 9) CI/CD recommended pipeline

1. Lint + unit tests (frontend/backend/android)
2. Build artifacts
3. Build/push Docker images (frontend/backend)
4. Deploy to staging
5. Smoke tests
6. Manual approval
7. Deploy to production
8. Post-deploy checks + rollback window

## 10) Security checklist

- Use HTTPS everywhere
- Store secrets in secret manager (not git)
- Restrict DB network access
- Rotate DB/JWT/API credentials
- Keep dependency updates regular
- Enable WAF/rate-limits at API edge

## 11) Rollback strategy

- Tag every release (`vX.Y.Z`)
- Keep previous Docker image tags
- DB migration strategy must support rollback or forward-fix
- Android rollback via staged rollout halt and hotfix release

## 12) Deployment update log

Add a dated line item each time deployment instructions change.

- 2026-03-10: Initial full-stack deployment guide added (frontend/backend/MySQL/android).

- 2026-03-10: Repository restructured to `frontend/webUI/angular` and `frontend/androidAPP`.
