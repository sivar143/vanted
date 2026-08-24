# Vanted environment and feature model

Vanted separates the deployment environment from optional features.

## Environment modes

- `local`: default developer workflow. Docker Compose is used and `VANTED_LOCAL_MODE=true`.
- `test`: automated/integration testing. Local-only shortcuts are disabled.
- `production`: Kubernetes/production deployment. Production-only infrastructure is enabled explicitly.

## Local defaults

```text
VANTED_ENV=local
VANTED_LOCAL_MODE=true
VANTED_TEST_MODE=false
VANTED_PRODUCTION_FEATURES=false
VANTED_KUBERNETES_ENABLED=false
VANTED_DEBUG_FEATURES=false
VANTED_OBSERVABILITY_ENABLED=false
VANTED_REDIS_ENABLED=true
VANTED_RABBITMQ_ENABLED=true
VANTED_EXTERNAL_INTEGRATIONS_ENABLED=false
VANTED_PAYMENT_MODE=mock
```

## Local production-like debugging

Use `local-debug.env.example` when a developer needs to reproduce production-like behavior locally. It can enable tracing, metrics, Redis, RabbitMQ, sandbox payment flows, retries, and other operational features without enabling Kubernetes or real production integrations.

Examples:

```text
VANTED_ENV=local
VANTED_LOCAL_MODE=true
VANTED_DEBUG_FEATURES=true
VANTED_OBSERVABILITY_ENABLED=true
VANTED_REDIS_ENABLED=true
VANTED_RABBITMQ_ENABLED=true
VANTED_EXTERNAL_INTEGRATIONS_ENABLED=true
VANTED_PAYMENT_MODE=sandbox
VANTED_KUBERNETES_ENABLED=false
VANTED_PRODUCTION_FEATURES=false
```

## Safety rules

1. Local and test environments must never accept real production database URLs, payment secrets, mail credentials or production API endpoints.
2. `VANTED_PAYMENT_MODE=live` is permitted only when `VANTED_ENV=production` and `VANTED_PRODUCTION_FEATURES=true`.
3. `VANTED_KUBERNETES_ENABLED=true` is only a deployment capability flag; the application must still run correctly when it is false.
4. Security controls such as authentication, authorization, validation and secrets handling are never disabled simply because `VANTED_LOCAL_MODE=true`.
5. Production manifests must set every critical flag explicitly rather than rely on application defaults.

Environment files are examples only. Real secrets belong in local untracked `.env` files or a production secret manager/Kubernetes Secret.