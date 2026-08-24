#!/usr/bin/env bash
set -Eeuo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

[[ -f .env ]] || cp .env.example .env
cp .env .env.debug
sed -i 's/^VANTED_DEBUG_FEATURES=.*/VANTED_DEBUG_FEATURES=true/' .env.debug
sed -i 's/^VANTED_OBSERVABILITY_ENABLED=.*/VANTED_OBSERVABILITY_ENABLED=true/' .env.debug
sed -i 's/^VANTED_EXTERNAL_INTEGRATIONS_ENABLED=.*/VANTED_EXTERNAL_INTEGRATIONS_ENABLED=true/' .env.debug
sed -i 's/^VANTED_PAYMENT_MODE=.*/VANTED_PAYMENT_MODE=sandbox/' .env.debug
sed -i 's/^VANTED_KUBERNETES_ENABLED=.*/VANTED_KUBERNETES_ENABLED=false/' .env.debug
sed -i 's/^VANTED_PRODUCTION_FEATURES=.*/VANTED_PRODUCTION_FEATURES=false/' .env.debug

docker compose --env-file .env.debug up -d --build

echo "Vanted local debug environment is running at http://localhost"
echo "Production-like features are enabled with sandbox integrations only."
docker compose --env-file .env.debug ps
