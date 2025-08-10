#!/usr/bin/env bash
set -euo pipefail

# Only create .env.local if it doesn't already exist
if [ ! -f .env.local ]; then
  : "${NEXT_PUBLIC_SUPABASE_URL:?Codespace secret not set}"
  : "${NEXT_PUBLIC_SUPABASE_ANON_KEY:?Codespace secret not set}"
  : "${NEXT_PUBLIC_SITE_URL:?Codespace secret not set}"

  cat > .env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
EOF

  echo ".env.local created from Codespaces secrets."
else
  echo ".env.local already exists — skipping creation."
fi