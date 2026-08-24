# Vanted Platform — Supported Stable Release Baseline

Vanted uses a verified, stable, supported dependency set. We prefer the latest supported LTS runtime where that reduces compatibility risk, and we never use preview, milestone, RC, beta, snapshot, or nightly releases in production.

| Component | Baseline | Policy |
|---|---|---|
| Angular | 22.1.x | Active supported major; track the latest 22.1 patch |
| Node.js | 24.19.0 LTS | Use the current LTS line compatible with Angular |
| Java | 25.0.4.1 LTS | Use the latest security update on the Java 25 LTS line |
| Spring Boot | 4.0.8 GA | Current supported stable 4.0 release; do not use 4.2 milestones |
| MySQL | 8.4.12 LTS | LTS line; patch upgrades are preferred |
| RabbitMQ | 4.3.5 | Current stable 4.x release |
| Redis | 8.8.2 | Current stable GA release |
| NGINX | 1.30.4 | Current stable release |
| Kubernetes | 1.36.x | Current supported stable line; pin an exact patch in production manifests |

## Dependency rules

1. No alpha, beta, RC, snapshot, milestone, or nightly dependencies in production.
2. Runtime/framework versions are selected as a compatible set, not independently.
3. Security patch releases are applied promptly after CI validation.
4. Maven and npm lockfiles are required for bootstrapped applications.
5. Docker image tags are explicit; never use `latest` in committed deployment manifests.
6. Version-only upgrades are automated; behavior-changing upgrades require tests and review.
7. CI must run unit, integration, dependency, container, and security checks before merging to `main`.

## Environment strategy

- `local` is the default developer environment.
- `test` is explicit and must not inherit local shortcuts.
- `production` is explicit and enables production-only deployment features.
- Feature flags allow production-like functionality to be enabled safely in local debugging without enabling Kubernetes or real external production integrations.
