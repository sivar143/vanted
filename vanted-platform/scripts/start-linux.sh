#!/usr/bin/env bash
set -Eeuo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then cp .env.example .env; fi

docker compose up -d --build

echo "Vanted is running at http://localhost:8080"
echo "RabbitMQ management: http://localhost:15672"
echo
docker compose ps
