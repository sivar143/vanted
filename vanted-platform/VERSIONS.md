# Vanted Platform — Supported Stable Release Baseline

This project intentionally uses current stable releases that are supported by the surrounding stack, rather than preview/milestone builds.

| Component | Baseline | Policy |
|---|---|---|
| Angular | 22.1.x | Active supported major; track latest 22.1 patch |
| Node.js | 24.19.0 LTS | Use the latest LTS line compatible with Angular |
| Java | 25 LTS | Use the latest Java 25 security update |
| Spring Boot | 4.1.1 | Stable GA release; do not use 4.2 milestones |
| MySQL | 8.4.12 | LTS line; patch upgrades are preferred |
| RabbitMQ | 4.3.5 | Current stable 4.x release |
| Redis | 8.8.2 | Current stable release |
| NGINX | 1.30.4 | Current stable release |

## Dependency rules

1. No alpha, beta, RC, snapshot, milestone, or nightly dependencies in production.
2. Framework and runtime major versions are selected as a compatible set, not independently.
3. Patch releases should be updated promptly when they contain security fixes.
4. Maven and npm dependency lockfiles are required once each service is fully bootstrapped.
5. Docker image tags should be explicit rather than `latest`.
6. Renovate/Dependabot automation will propose version-only upgrades; application behavior changes require tests.
7. CI must perform dependency, unit, integration, and container checks before merging to `main`.

## Why this is not always the absolute newest major

The newest release is not automatically the safest production choice. For example, Java 26 is a current non-LTS release, while Java 25 is the current LTS baseline; Spring Boot 4.2 is currently a milestone line, while 4.1.1 is a stable GA release. We therefore select the newest stable, supported combination that minimizes compatibility risk.
