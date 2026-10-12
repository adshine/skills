#!/usr/bin/env bash
# Wrapper: installs @material/material-color-utilities into a cache dir,
# bundles seed-to-tokens.mjs with esbuild (the library needs a bundler),
# then runs it with all arguments passed through.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CACHE="${XDG_CACHE_HOME:-$HOME/.cache}/design-system-layers/mcu"
mkdir -p "$CACHE"
if [ ! -d "$CACHE/node_modules/@material/material-color-utilities" ]; then
  echo '{"name":"dsl-mcu","private":true}' > "$CACHE/package.json"
  if command -v pnpm >/dev/null; then
    (cd "$CACHE" && pnpm add --allow-build=esbuild @material/material-color-utilities@0.4.0 esbuild@0 >/dev/null || { echo "install failed; clearing $CACHE" >&2; rm -rf "$CACHE"; exit 1; })
  else
    (cd "$CACHE" && npm install --silent @material/material-color-utilities@0.4.0 esbuild@0)
  fi
fi
cp "$HERE/seed-to-tokens.mjs" "$CACHE/entry.mjs"
"$CACHE/node_modules/.bin/esbuild" "$CACHE/entry.mjs" --bundle --platform=node --format=esm \
  --outfile="$CACHE/bundle.mjs" --log-level=warning
exec node "$CACHE/bundle.mjs" "$@"
