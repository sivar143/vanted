#!/usr/bin/env bash
set -e

echo "=========================================="
echo "  Vanted — API Client Code Generation"
echo "=========================================="
echo ""
echo "Source: lib/api-spec/openapi.yaml"
echo "Output: lib/api-client-react/src/generated/"
echo "        lib/api-zod/src/generated/"
echo ""

pnpm --filter @workspace/api-spec run codegen

echo ""
echo "Codegen complete. Restart the dev servers to pick up the changes."
