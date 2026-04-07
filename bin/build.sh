#!/usr/bin/env bash
set -e

echo "=========================================="
echo "  Vanted — Production Build"
echo "=========================================="

echo ""
echo "[1/3] Type-checking all packages..."
pnpm run typecheck

echo ""
echo "[2/3] Building API server..."
pnpm --filter @workspace/api-server run build

echo ""
echo "[3/3] Building frontend..."
pnpm --filter @workspace/vanted run build

echo ""
echo "=========================================="
echo "  Build complete!"
echo "  API:     artifacts/api-server/dist/"
echo "  Web:     artifacts/vanted/dist/"
echo "=========================================="
