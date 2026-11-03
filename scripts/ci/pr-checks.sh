#!/bin/bash

set -e

echo "Running ESLint..."
npm run lint

echo "Checking TypeScript..."
npx tsc --noEmit

echo "Building production app..."

export NEXT_PUBLIC_SUPABASE_URL="https://example.supabase.co"
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="dummy-key"
npm run build

echo "All CI checks passed!"