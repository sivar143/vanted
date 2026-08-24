# Vanted Platform

Production rebuild of Vanted using Angular 22, Java 25, Spring Boot 4.0.8, MySQL 8.4 LTS, RabbitMQ, Redis, NGINX, Docker and Kubernetes.

## Architecture

The application is a selective microservices platform:

- `auth-service` — identity, authentication, refresh tokens and roles.
- `catalog-service` — services, categories and discovery.
- `order-service` — carts, orders, order state transitions and order events.
- `payment-service` — payment intents, gateway integration, verification and payment events.
- `notification-service` — asynchronous email/SMS/push workflows.

RabbitMQ carries durable domain events. Redis is used for cache, short-lived state, idempotency and rate limiting. Each service owns its data schema and migrations.

## Environment modes

`local` is the default for development and runs through Docker Compose. `test` is explicit for automated/integration testing. `production` is explicit for production deployment and Kubernetes.

Production-like capabilities can be enabled individually in local debugging using feature flags. Local debugging must never be allowed to point at real production databases, payment gateways, mail systems, or other production resources.

## Local development

Windows 11:

```powershell
cd vanted-platform\scripts
.\setup-windows.ps1
```

Linux (Debian/Ubuntu):

```bash
cd vanted-platform
chmod +x scripts/*.sh
./scripts/setup-linux.sh
```

After setup, `start-*` and `stop-*` scripts manage the local Docker Compose environment. `reset-local-*` recreates the local database, message broker and cache volumes.

## Production

Production uses the same container images but deploys the stateless services with Kubernetes. Kubernetes manifests live under `deploy/kubernetes`, with environment-specific overlays. Production secrets are injected by the deployment platform; no production credentials belong in Git.

The existing React implementation remains in the repository while the new platform is migrated to feature parity. New production functionality belongs in the new platform under `vanted-platform/`.
