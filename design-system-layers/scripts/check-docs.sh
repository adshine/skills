#!/usr/bin/env bash
# Wrapper: installs playwright-core, pixelmatch and pngjs into a cache dir,
# then runs check-docs.mjs from there with all arguments passed through.
# Uses the installed Google Chrome (channel "chrome"), so no browser download.
#
#   scripts/check-docs.sh path/to/dist --update-baseline   # record baselines
#   scripts/check-docs.sh path/to/dist                     # check against them
#   scripts/check-docs.sh https://example.com/docs/ --qa ./qa
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CACHE="${XDG_CACHE_HOME:-$HOME/.cache}/design-system-layers/check"
mkdir -p "$CACHE"
if [ ! -d "$CACHE/node_modules/playwright-core" ] || [ ! -d "$CACHE/node_modules/pixelmatch" ] || [ ! -d "$CACHE/node_modules/pngjs" ]; then
  echo '{"name":"dsl-check","private":true,"type":"module"}' > "$CACHE/package.json"
  if command -v pnpm >/dev/null; then
    (cd "$CACHE" && pnpm add playwright-core@1 pixelmatch@7 pngjs@7 >/dev/null || { echo "install failed; clearing $CACHE" >&2; rm -rf "$CACHE"; exit 1; })
  else
    (cd "$CACHE" && npm install --silent playwright-core@1 pixelmatch@7 pngjs@7)
  fi
fi
cp "$HERE/check-docs.mjs" "$CACHE/check-docs.mjs"
exec node "$CACHE/check-docs.mjs" "$@"
