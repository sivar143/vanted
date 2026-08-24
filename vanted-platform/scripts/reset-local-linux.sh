#!/usr/bin/env bash
set -Eeuo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "WARNING: this removes local Vanted containers AND database/message/cache volumes."
read -r -p "Type RESET to continue: " confirmation
[[ "$confirmation" == "RESET" ]] || { echo "Cancelled."; exit 1; }

docker compose down -v --remove-orphans
rm -f .env
cp .env.example .env

docker compose pull
docker compose up -d --build

echo "Local Vanted environment reset and restarted."
