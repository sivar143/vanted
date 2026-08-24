# Vanted Microservices Architecture

## Technology baseline

- Angular 22.x for customer and admin web applications.
- Java 25 LTS for backend services.
- Spring Boot 4.0.8 GA for services.
- MySQL 8.4 LTS for transactional persistence.
- NGINX at the internet edge for TLS termination, security headers, rate limiting and routing.
- RabbitMQ 4.3.x for durable domain events and asynchronous workflows.
- Redis 8.8.x for cache, short-lived state, distributed idempotency and rate-limit support.
- Flyway for schema migrations.
- Micrometer + OpenTelemetry for metrics and traces when the observability feature is enabled.
- Docker Compose for local development.
- Kubernetes 1.36.x + Helm/Kustomize for production deployment.

## Environment model

The application has three explicit runtime environments:

- `local`: default developer workflow. `VANTED_LOCAL_MODE=true` and Kubernetes is disabled.
- `test`: automated/integration test environment. Local shortcuts are disabled.
- `production`: production deployment. Kubernetes and production-only infrastructure are enabled by deployment configuration.

Environment mode is deliberately separate from feature flags. This allows a developer to reproduce production-like behavior locally without making the whole local environment behave like production.

### Feature flags

Core flags include:

- `VANTED_KUBERNETES_ENABLED`
- `VANTED_PRODUCTION_FEATURES`
- `VANTED_DEBUG_FEATURES`
- `VANTED_OBSERVABILITY_ENABLED`
- `VANTED_REDIS_ENABLED`
- `VANTED_RABBITMQ_ENABLED`
- `VANTED_PAYMENT_MODE` (`mock`, `sandbox`, `live`)
- `VANTED_EXTERNAL_INTEGRATIONS_ENABLED`

Local debug may enable observability, Redis, RabbitMQ, distributed tracing, sandbox payments and other production-like behavior. It must never enable real production credentials or endpoints.

## Service boundaries

```text
                         Internet
                            |
                         NGINX / Ingress
                            |
                    Angular Web Application
                            |
                    API routing / HTTPS
                            |
       +------------+------+-----------+-------------+
       |            |                  |             |
   auth-service catalog-service  order-service  payment-service
       |            |                  |             |
    auth DB      catalog DB        order DB      payment DB
                                      |
                                  RabbitMQ
                                /     |      \
                         payment  notification  analytics/events

             Redis: cache + idempotency + rate limits

              Production deployment: Kubernetes
              Local development: Docker Compose
```

## Service responsibilities

- **auth-service** owns identity, credentials, refresh tokens, roles and authentication events.
- **catalog-service** owns categories, services, service metadata and discovery queries.
- **order-service** owns carts, orders, order items and the order state machine.
- **payment-service** owns payment intents, gateway integration, signature verification and payment events.
- **notification-service** consumes events and sends email/SMS without blocking customer requests.

We intentionally do not create a separate microservice for every small domain. A service boundary is justified only when it provides an independent scaling, ownership, security or failure boundary.

## Concurrency and multithreading

1. Java 25 virtual threads are enabled for suitable I/O-heavy workloads.
2. Explicit bounded executors are used for notifications, reconciliation, exports and other background work so bursts cannot exhaust JVM resources.
3. `CompletableFuture` is used only where independent operations genuinely benefit from parallel execution.
4. RabbitMQ consumers use controlled concurrency and idempotent handlers.
5. Database transactions remain short and never span remote HTTP or message-broker calls.
6. Optimistic locking protects hot order/payment rows.
7. Scheduled jobs use distributed locks in deployments with multiple replicas.

## Resilience

- Timeouts for outbound HTTP calls.
- Retry only transient/safe operations with exponential backoff and jitter.
- Circuit breakers around payment and notification providers.
- Bulkheads for expensive external operations.
- Dead-letter queues for events that cannot be processed.
- Transactional outbox for database changes that must publish events atomically after commit.
- Idempotent consumers and idempotency keys for order/payment commands.

## Security

- NGINX/Ingress is the public entry point; internal services are not exposed directly to the internet.
- JWT access tokens and refresh tokens are issued by auth-service.
- Every service validates JWT signatures and required roles/scopes.
- Secrets are supplied through environment variables, Docker secrets for local infrastructure, or Kubernetes Secrets/external secret managers in production.
- TLS terminates at the edge; internal mTLS can be enabled in production where required.
- CSP, HSTS, X-Content-Type-Options, Referrer-Policy and frame protections are enforced at the edge.
- Rate limiting exists at the edge and application level for sensitive workflows.

## Data ownership

Each service owns its schema and migration history. Cross-service relationships use identifiers and events rather than foreign keys between service databases. Cross-domain reporting is handled through read models or analytics pipelines.

## Observability

When `VANTED_OBSERVABILITY_ENABLED=true`, services expose metrics and tracing using Micrometer/OpenTelemetry. Requests and messages carry correlation/trace IDs. Logs are structured and never contain passwords, tokens or payment secrets.

## Deployment strategy

- **Local:** Docker Compose; no Kubernetes dependency.
- **Test:** isolated test infrastructure, suitable for CI and integration tests.
- **Production:** Kubernetes 1.36.x, with Helm/Kustomize overlays, HPA, readiness/liveness probes, PodDisruptionBudgets, NetworkPolicies and external secret management.

The existing `backend/` application is retained temporarily as a compatibility reference while the new microservices reach feature parity. New production functionality belongs in the service that owns the domain.
