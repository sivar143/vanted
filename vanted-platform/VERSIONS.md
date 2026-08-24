# Vanted Platform — Stable Release Baseline

Vanted uses the newest stable/GA releases that form a compatible production set. Preview, milestone, release-candidate, beta, nightly and snapshot dependencies are excluded from production.

| Component | Baseline | Policy |
|---|---|---|
| Angular | 22.1.x | Active supported release line; track patch releases |
| Node.js | 24.19.0 LTS | Pin/update within the LTS line |
| Java | 25.0.4.1 LTS | Apply current security updates |
| Spring Boot | 4.0.8 GA | Use GA releases only |
| MySQL | 8.4.12 LTS | Prefer LTS patch releases |
| RabbitMQ | 4.3.5 | Stable 4.x release |
| Redis | 8.8.2 | Stable 8.x release |
| NGINX | 1.30.4 | Stable release |
| Kubernetes | 1.36.x | Supported stable production target |
| Maven | 3.9.16 | Stable build-tool baseline |

## Dependency policy

1. No alpha, beta, RC, milestone, nightly or snapshot dependencies in production.
2. Runtime/framework versions are selected as a compatible set.
3. Security patch releases are adopted promptly after validation.
4. Docker images are explicitly versioned; never use `latest`.
5. Application dependencies should be lockfile-pinned where the package manager supports it.
6. CI performs dependency, unit, integration, container and security checks before merging.
7. Local debugging may enable selected production-like features, but live production resources remain blocked outside production.

The goal is stability first: newest supported GA release, not newest unreleased build.
