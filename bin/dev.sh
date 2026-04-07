#!/usr/bin/env bash
set -e

echo "=========================================="
echo "  Vanted — Starting Development Servers"
echo "=========================================="

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set."
  echo "  Example: export DATABASE_URL=postgresql://user:pass@localhost:5432/vanted"
  exit 1
fi

if [ -z "$API_PORT" ]; then
  export API_PORT=8080
fi

if [ -z "$WEB_PORT" ]; then
  export WEB_PORT=5173
fi

echo ""
echo "API Server  -> http://localhost:$API_PORT"
echo "Web App     -> http://localhost:$WEB_PORT"
echo ""
echo "Press Ctrl+C to stop all servers."
echo ""

cleanup() {
  echo ""
  echo "Stopping all servers..."
  kill 0
}
trap cleanup INT TERM

PORT=$API_PORT pnpm --filter @workspace/api-server run dev &
API_PID=$!

sleep 2

PORT=$WEB_PORT pnpm --filter @workspace/vanted run dev &
WEB_PID=$!

wait $API_PID $WEB_PID
