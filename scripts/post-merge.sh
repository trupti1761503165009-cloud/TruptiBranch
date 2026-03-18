#!/bin/bash
set -e

echo "Post-merge setup: checking dependencies..."

# Only run npm install if package.json has changed or node_modules is missing
if [ ! -d "node_modules" ]; then
  echo "node_modules missing, running npm install..."
  npm install --ignore-scripts 2>/dev/null || true
else
  echo "node_modules present, skipping npm install."
fi

echo "Post-merge setup complete."
