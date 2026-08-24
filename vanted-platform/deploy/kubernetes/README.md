# Vanted Kubernetes deployment

This directory contains the production deployment model for Vanted. It is intentionally separate from local Docker Compose development.

## Environments

```text
base/
  common Kubernetes resources

clusters/
  production cluster-specific entry points

helm/
  reusable chart packaging
```

Production deployment should use the same immutable container images built and tested in CI. Secrets must come from Kubernetes Secrets or an external secret manager.

## Production principles

- Kubernetes 1.36.x pinned by the deployment pipeline.
- NGINX remains at the public edge through the Ingress layer.
- Stateless application services use Deployments and Services.
- HorizontalPodAutoscaler controls independently scalable services.
- Readiness and liveness probes protect rollout health.
- PodDisruptionBudgets protect availability during voluntary disruptions.
- NetworkPolicies restrict east-west access.
- ConfigMaps hold non-secret configuration; Secrets hold credentials.
- MySQL should be managed externally for production unless there is a deliberate database-operator strategy.
- RabbitMQ and Redis should use managed/HA deployments for production rather than single-node development containers.
- Production-only flags are set by manifests and are not inferred from code defaults.

## Local

Do not use these manifests for normal development. Use `scripts/setup-*` and Docker Compose so local setup stays fast and deterministic.
