# Vanted environment modes

The application supports three explicit environment modes:

- `local`: local developer workflow. `VANTED_LOCAL_MODE=true` by default. Docker Compose is the expected local runtime; Kubernetes-only behavior and production hardening that slows local development are disabled.
- `test`: automated/integration tests. `VANTED_LOCAL_MODE=false` and `VANTED_TEST_MODE=true`. Test infrastructure is controlled by the test runner and should not inherit local-only shortcuts.
- `production`: production deployment. `VANTED_LOCAL_MODE=false`, `VANTED_PRODUCTION_FEATURES=true`, and `VANTED_KUBERNETES_ENABLED=true` when deployed to Kubernetes.

Do not use a single boolean as the sole security boundary. Environment values select application behavior, while the deployment platform, network policy, authentication, secrets, and Kubernetes configuration remain authoritative security controls.

## Local default

The Spring application defaults to:

```text
VANTED_ENV=local
VANTED_LOCAL_MODE=true
VANTED_TEST_MODE=false
VANTED_PRODUCTION_FEATURES=false
VANTED_KUBERNETES_ENABLED=false
```

Production and test deployment manifests/scripts must explicitly set their values instead of relying on defaults.
