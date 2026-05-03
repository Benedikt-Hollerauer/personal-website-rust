#!/bin/bash
# Single source of truth: root .env.example
#
# - Creates root .env from .env.example if it doesn't exist
# - Appends any keys missing from an existing .env (never overwrites)
# - Generates frontend/.env from VITE_ vars in root .env (for local dev)
set -e

ROOT_EXAMPLE=".env.example"
ROOT_ENV=".env"
FRONTEND_ENV="frontend/.env"

if [ ! -f "$ROOT_EXAMPLE" ]; then
  echo "No $ROOT_EXAMPLE found, skipping."
  exit 0
fi

# Create or patch root .env
if [ ! -f "$ROOT_ENV" ]; then
  cp "$ROOT_EXAMPLE" "$ROOT_ENV"
  echo "Created $ROOT_ENV from $ROOT_EXAMPLE — fill in the placeholder values before starting."
else
  added=0
  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line// }" ]] && continue
    key="${line%%=*}"
    if ! grep -q "^${key}=" "$ROOT_ENV" 2>/dev/null; then
      echo "$line" >> "$ROOT_ENV"
      echo "  Added missing key: $key"
      added=$((added + 1))
    fi
  done < "$ROOT_EXAMPLE"
  [ "$added" -gt 0 ] && echo "Added $added missing key(s) to $ROOT_ENV." || echo "$ROOT_ENV is already up to date."
fi

# Generate frontend/.env from VITE_ vars in root .env (for local Vite dev server)
if [ -f "$ROOT_ENV" ]; then
  if grep "^VITE_" "$ROOT_ENV" > "$FRONTEND_ENV" 2>/dev/null; then
    echo "Generated $FRONTEND_ENV from VITE_ vars in $ROOT_ENV."
  else
    echo "Skipped $FRONTEND_ENV (not writable — VITE_ vars injected via Docker build args)."
  fi
fi
