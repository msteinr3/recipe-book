#!/bin/bash

set -e

echo "Running ESLint..."
npm run lint

echo "Checking TypeScript..."
npx tsc --noEmit

echo "Building production app..."
npm run build

echo "All CI checks passed!"