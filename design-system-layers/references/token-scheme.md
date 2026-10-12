# Token tiers and naming

Three tiers, mirroring Material 3 (ref, sys, comp) and Primer (base, functional, component). Swap `brand` for the client's prefix.

| Tier | Holds | Example name | Who may reference it |
|------|-------|--------------|----------------------|
| **ref** (primitive) | Every available raw value, no meaning | `brand.ref.palette.primary.40`, `brand.ref.space.4` | Only sys tokens |
| **sys** (role) | Decisions and meaning; this is where theming happens | `brand.sys.color.primary`, `brand.sys.color.onSurfaceVariant`, `brand.sys.shape.corner.md` | Components and patterns |
| **comp** (component) | One component's own knobs, only when truly needed | `brand.comp.button.primary.container.color` | That component's CSS only |

Rules:

- Names go general to specific: system, tier, category, role, variant, state (`...color.primary.hover`).
- Name by meaning, not value: `color.text.muted`, never `color.gray-500` at the sys tier.
- The name stays fixed across contexts; the value changes by mode (light, dark, high contrast, density, RTL).
- camelCase inside a segment; dots in JSON/JS, dashes in CSS (`--brand-color-on-surface-variant`).
- Surfaces that nest use numbered containers (`surfaceContainerLow`, `surfaceContainer`, `surfaceContainerHigh`) so cards on cards stay distinguishable.
- Pair every fill with its content color (`primary` / `onPrimary`), as Material and shadcn both do.

## DTCG 2025.10 shape

```json
{
  "brand": {
    "ref": {
      "palette": {
        "$type": "color",
        "primary": { "40": { "$value": "#2d6a51" } }
      }
    },
    "sys": {
      "color": {
        "$type": "color",
        "primary": {
          "$value": "{brand.ref.palette.primary.40}",
          "$description": "Main action color. Never use for body text on surface."
        }
      }
    }
  }
}
```

Spec: https://www.designtokens.org/tr/2025.10/format/ (stable Community Group report, Oct 2025; not a W3C Standard). `$type` inherits from the group; aliases use `{a.b.c}`; `$deprecated` marks retired tokens. Style Dictionary v5 reads DTCG; full 2025.10 coverage is still in progress there, so test the build.

`scripts/seed-to-tokens.sh` writes literal hex values per mode (`brand.sys.color.light.primary`, `brand.sys.color.dark.primary`) for simplicity. When wiring into Style Dictionary, either keep that split and emit one CSS block per mode (the script's `--css` already does this), or rewrite sys values as aliases into the ref palette.
