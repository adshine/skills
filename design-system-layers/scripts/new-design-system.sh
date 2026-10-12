#!/usr/bin/env bash
# Start a client design system from a premade starter instead of from scratch.
#   new-design-system.sh --stack react|html --dest DIR --seed "#RRGGBB" \
#     [--name "Brand"] [--tagline "..."] [--font "DM Sans"] [--variant fidelity] [--radius 0.625rem]
# react: Vite + React + Tailwind v4 + shadcn/ui (Radix), ~20 core components installed.
# html:  plain HTML/CSS components with the same theme variable names.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES="$HERE/../templates"
STACK="" DEST="" SEED="" NAME="Brand" TAGLINE="Design system" FONT="DM Sans" VARIANT="fidelity" RADIUS=""
while [ $# -gt 0 ]; do
  case "$1" in
    --stack) STACK="$2"; shift 2 ;;
    --dest) DEST="$2"; shift 2 ;;
    --seed) SEED="$2"; shift 2 ;;
    --name) NAME="$2"; shift 2 ;;
    --tagline) TAGLINE="$2"; shift 2 ;;
    --font) FONT="$2"; shift 2 ;;
    --variant) VARIANT="$2"; shift 2 ;;
    --radius) RADIUS="$2"; shift 2 ;;
    *) echo "unknown option $1" >&2; exit 2 ;;
  esac
done
case "$STACK" in react) TPL="react-shadcn"; THEME="src/theme.css"; BRAND="src/brand.css" ;;
  html) TPL="html"; THEME="theme.css"; BRAND="brand.css" ;;
  *) echo "--stack must be react or html" >&2; exit 2 ;; esac
[ -n "$DEST" ] && [ -n "$SEED" ] || { echo "--dest and --seed are required" >&2; exit 2; }
[ -e "$DEST" ] && [ -n "$(ls -A "$DEST" 2>/dev/null)" ] && { echo "$DEST exists and is not empty" >&2; exit 1; }

mkdir -p "$DEST"
rsync -a "$TEMPLATES/$TPL/" "$DEST/"
mkdir -p "$DEST/tokens" "$DEST/docs"

PREFIX="$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9')"
[ -n "$PREFIX" ] || PREFIX="brand"
"$HERE/seed-to-tokens.sh" --seed "$SEED" --variant "$VARIANT" --prefix "$PREFIX" \
  --out "$DEST/tokens/color.tokens.json" --shadcn "$DEST/$THEME"

# Brand foundations: font, radius, name.
FONT_Q="$(echo "$FONT" | sed 's/ /+/g')"
python3 - "$DEST" "$TPL" "$BRAND" "$FONT" "$FONT_Q" "$RADIUS" "$NAME" "$TAGLINE" <<'PY'
import sys, re, pathlib
dest, tpl, brand, font, font_q, radius, name, tagline = sys.argv[1:]
d = pathlib.Path(dest)
b = d / brand
s = b.read_text()
s = re.sub(r'--brand-font-sans: "[^"]*"', f'--brand-font-sans: "{font}"', s)
if radius:
    s = re.sub(r'--radius: [^;]+;', f'--radius: {radius};', s)
b.write_text(s)
idx = d / "index.html"
h = idx.read_text()
h = re.sub(r'family=[^:&"]+', f'family={font_q}', h, count=1)
if tpl == "html":
    h = h.replace('data-brand-name>Brand<', f'data-brand-name>{name}<').replace('data-brand-tagline>Design system starter<', f'data-brand-tagline>{tagline}<').replace('<title>Brand design system', f'<title>{name} design system')
else:
    h = re.sub(r'<title>[^<]*</title>', f'<title>{name} design system</title>', h)
    cfg = d / "src/brand.config.ts"
    cfg.write_text(cfg.read_text().replace('name: "Brand"', f'name: {name!r}'.replace("'", '"')).replace('tagline: "Design system starter"', f'tagline: {tagline!r}'.replace("'", '"')))
idx.write_text(h)
PY

cat > "$DEST/docs/foundations.md" <<MD
# $NAME foundations

Fill in the why for each rule. Values without reasons get overridden.

## Color
Generated from seed $SEED (variant $VARIANT) with seed-to-tokens. Rerun it instead of editing theme files by hand.
- Rule:
- Why:
- Tie-break (brand color vs contrast):

## Type
Typeface: $FONT.
- Rule:
- Why:

## Shape
- Rule:
- Why:

## Spacing and density
- Rule:
- Why:
MD

if [ "$STACK" = "react" ]; then
  (cd "$DEST" && pnpm install >/dev/null 2>&1 || { echo "pnpm install failed; run it in $DEST" >&2; exit 1; })
  echo "Ready: cd $DEST && pnpm dev"
else
  echo "Ready: open $DEST/index.html"
fi
