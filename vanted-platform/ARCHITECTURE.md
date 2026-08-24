# Vanted Microservices Architecture

## Technology baseline

- Angular 22.x for the customer and admin web applications.
- Java 25 LTS for backend services.
- Spring Boot 4.1.1 for services.
- MySQL 8.4 LTS for transactional persistence.
- NGINX at the internet edge for TLS termination, security headers, rate limiting and routing.
- RabbitMQ for durable domain events and asynchronous workflows.
- Redis for caching, short-lived state, distributed idempotency and rate-limit support.
- Flyway for schema migrations.
- Micrometer + OpenTelemetry for metrics and traces.
- Docker for local and production packaging.

Angular 22 is the currently active Angular major in August 2026. Spring Boot 4.1.1 is the current 4.1 production release line. Java 25 is the current LTS release and MySQL 8.4 is an LTS series.

## Service boundaries

```text
                         Internet
                            |
                         NGINX
                            |
                    Angular Web Application
                            |
                   REST / JSON over HTTPS
                            |
                 +----------+-----------+
                 |                      |
           auth-service         catalog-service
                 |                      |
             MySQL auth            MySQL catalog
                 |
                 +-----------+----------+
                             |
                       order-service
                             |
                    MySQL order database
                             |
                    payment-service
                             |
                    payment provider

        RabbitMQ <--------- domain events --------->
          |                 |              |
   notification-service   order        payment
          |
       email/SMS

        Redis: cache + idempotency + short lived distributed state
```

## Why these services

- **auth-service** owns identity, credentials, refresh tokens, roles and authentication events.
- **catalog-service** owns categories, services, service metadata and discovery queries.
- **order-service** owns carts, orders, order items and the order state machine.
- **payment-service** owns payment intents, gateway integration, signature verification and payment events.
- **notification-service** consumes events and sends email/SMS without blocking customer requests.

We intentionally do not create a separate microservice for every small domain. A service boundary is justified only when it provides an independent scaling, ownership, security or failure boundary.

## Concurrency and multithreading

1. Spring MVC request handling remains non-blocking at the edge of the workflow wherever possible.
2. Java 25 virtual threads are enabled for I/O-heavy service workloads where they improve throughput without requiring an application-level thread pool for every request.
3. Explicit bounded executors are used for background work such as notifications, reconciliation and export jobs so a burst cannot exhaust JVM resources.
4. CompletableFuture is used for independent parallel reads where latency benefits from concurrency.
5. RabbitMQ consumers process domain events asynchronously and use controlled listener concurrency.
6. Every externally retried command must be idempotent. Payment and order commands use an idempotency key.
7. Database transactions are kept short and are never held open across remote HTTP or RabbitMQ calls.
8. Optimistic locking protects hot order/payment rows against lost updates.
9. Scheduled jobs use distributed locking so multiple service replicas cannot execute the same job concurrently.

## Resilience

- Timeouts for every outbound HTTP call.
- Retry only safe/transient operations with exponential backoff and jitter.
- Circuit breakers around payment and notification providers.
- Bulkheads for expensive external operations.
- Dead-letter queues for events that cannot be processed.
- Transactional outbox for changes that must atomically publish an event after a database commit.
- Idempotent consumers so duplicate delivery is safe.

## Security

- NGINX is the public entry point; internal services are not exposed directly to the internet.
- JWT access tokens and refresh tokens are issued by auth-service.
- Every service validates JWT signatures and required roles/scopes.
- Secrets are supplied through environment variables or a production secret manager; no credentials are committed.
- TLS between external clients and NGINX. Internal service TLS/mTLS can be enabled in production when the deployment environment requires it.
- CSP, HSTS, X-Content-Type-Options, Referrer-Policy and frame protections at NGINX.
- Rate limiting at the edge and application-level abuse controls for login/payment endpoints.

## Data ownership

Each service owns its schema and migration history. Cross-service relationships use identifiers and events rather than foreign keys between databases. Reporting across domains is handled through read models or an analytics pipeline, not cross-service SQL joins.

## Observability

Every request and message should carry a correlation/trace ID. Metrics include latency, error rate, throughput, queue depth, DB pool saturation, JVM memory/CPU and external provider health. Logs are structured JSON and never contain passwords, access tokens or payment secrets.

## Evolution strategy

The existing `backend/` module is retained temporarily as a compatibility reference while the new services become functional. New production functionality should be implemented in the service that owns the domain. Once feature parity is reached, the compatibility application can be retired.
