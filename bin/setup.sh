#!/usr/bin/env bash
set -e

echo "=========================================="
echo "  Vanted — Local Environment Setup"
echo "=========================================="

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "ERROR: Node.js is required. Install from https://nodejs.org (v18+)"; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "Installing pnpm..."; npm install -g pnpm; }

echo ""
echo "[1/4] Installing dependencies..."
pnpm install

echo ""
echo "[2/4] Checking environment variables..."
if [ -z "$DATABASE_URL" ]; then
  echo "WARNING: DATABASE_URL is not set."
  echo "  Set it in your shell or a .env file:"
  echo "  export DATABASE_URL=postgresql://user:pass@localhost:5432/vanted"
  echo ""
fi

echo "[3/4] Pushing database schema..."
pnpm --filter @workspace/db run push-force

echo ""
echo "[4/4] Seeding the database with Vanted services..."
pnpm --filter @workspace/scripts run tsx src/seed-vanted.ts 2>/dev/null || echo "(Seed script not found, skipping)"

echo ""
echo "=========================================="
echo "  Setup complete! Run './bin/dev.sh' to"
echo "  start the development servers."
echo "=========================================="
