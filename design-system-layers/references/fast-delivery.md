# Fast delivery: a usable design system in days

Goal: ship the smallest system that makes the client's real product coherent, then grow it from evidence. Generate what can be derived, borrow accessible behavior instead of building it, write patterns for the flows users actually touch, and keep the "why" next to every rule.

Order matters. Each stage only depends on the one before it.

## Stage 0: Intake (an hour, not a workshop)

Collect only what changes the output:

- **Brand inputs:** one seed color (plus optional secondary/tertiary if the brand truly has them), typeface(s) and license, logo, any existing site or app to extract from (use `extract-design-system` if one exists).
- **Product shape:** platforms (web, iOS, Android), framework, who the users are, power users vs occasional (sets density).
- **Top 3 to 5 user flows:** these become the first patterns. Ask "what do users come here to do?", not "which components do you need?".
- **Constraints:** accessibility target (default WCAG 2.2 AA), dark mode yes/no, multi-brand yes/no, deadline.

Do not ask for anything a later stage can derive.

## Stage 1: Foundations (generate, then write the why)

1. **Color:** run `scripts/seed-to-tokens.sh --seed "#RRGGBB" --prefix <brand> --out tokens/color.tokens.json --css src/styles/color.css`. This produces 6 tonal palettes (ref tier) and 49 contrast-checked roles for light and dark (sys tier) from one hex. Variants: `tonalSpot` (default, calm), `vibrant`, `expressive`, `fidelity` (keeps the seed hue exact, good for strict brand colors), `neutral`, `monochrome`. Use `--contrast 0.5` or `1` for a high-contrast theme.
   - Alternatives when the stack already uses them: Radix Colors custom generator (12-step scales, each step has a job: 1-2 backgrounds, 3-5 component states, 6-8 borders/focus, 9-10 solids, 11-12 text) for shadcn/Radix projects; Adobe Leonardo (`@adobe/leonardo-contrast-colors`) when the client gives target contrast ratios.
   - Never pick hex values by eye. Pick roles by meaning, never because a value "looks right" (it breaks the other theme).
2. **Type:** start from a 15-role scale (display, headline, title, body, label; each large/medium/small). Swap the typeface first: an unchanged default face is the fastest way to look generic.
3. **Shape:** corner scale none 0, xs 4, sm 8, md 12, lg 16, xl 28, full. Change the scale to fit the brand (sharper for finance, rounder for consumer) instead of using it as-is.
4. **Spacing and density:** 4px base grid; decide one density stance (comfortable vs compact) and write it down.
5. **Elevation, motion, states:** elevation levels 0-5; motion durations from 50ms to 1000ms with a standard and emphasized easing; interaction overlay opacity 0.08 hover, 0.12 focus/pressed, 0.16 dragged. Respect reduced motion.
6. **Write the reasoning.** For each foundation, 2 to 4 sentences: the rule, why, and the tie-break for known conflicts (brand color vs contrast, density for experts vs newcomers, when the type scale may grow). This is what stops later drift. Values without reasons get overridden.

Contrast floor in every theme: 4.5:1 for text, 3:1 for UI parts and focus rings.

## Stage 2: Components (borrow behavior, own the look)

- **Do not build interactive behavior from scratch.** Use an accessible headless base and theme it:
  - React/web: shadcn/ui (CLI v4, `npx shadcn create`; default base library is Base UI since July 2026, Radix and React Aria also supported; check `components.json` before assuming which). Or `@base-ui/react`, `radix-ui`, `react-aria-components` directly.
  - Native: platform controls first (SwiftUI, Jetpack Compose Material 3 with generated `Color.kt`/`Theme.kt` from Material Theme Builder).
- **Core set first (about 15):** button, icon button, text field, select, checkbox, radio, switch, card, dialog, menu, tabs, toast/snackbar, tooltip, progress, navigation (bar or rail or sidebar), top app bar/header. Add others only when a pattern needs them.
- **Rules:** components may only use sys (role) tokens, never raw values or ref tokens. Component-tier tokens only when a component genuinely needs its own knob, and only inside that component's CSS. A prop that only one call site uses means the logic belongs in a pattern.
- **De-generic pass before showing anyone:** brand hue, typeface, corner scale, density, and one or two signature moments. Untouched shadcn neutrals and radius, or Material's baseline purple plus Roboto, read as a template.

## Stage 3: Patterns (where the product actually gets coherent)

Write one pattern page per top flow from Stage 0, before adding more components. Typical first five: forms and validation/error recovery, empty/loading/error states, search and filter, navigation and page structure, confirmation and destructive actions. Add domain flows (checkout, booking, onboarding) from the intake list.

A pattern may offer more than one solution (GOV.UK's address pattern offers lookup, multiple fields, and a textarea) with when to use each. Use `references/doc-templates.md`.

## Stage 4: Package and govern (lightweight)

- Tokens in DTCG 2025.10 JSON (`.tokens.json`), built to CSS/JS/platform files with Style Dictionary v5 (`style-dictionary`); Tokens Studio syncs them with Figma variables if the team designs in Figma.
- One owner. One issue template that asks for evidence and the layer it belongs to. A changelog. Deprecate tokens with `$deprecated` rather than deleting them.
- Contribution gates (adapted from GOV.UK): to propose, it must be **useful** (evidence of need) and **unique** (not already covered); to publish, **usable** (tested, including with assistive tech), **consistent**, and **versatile**.
- Anything used in one place stays local until a second team needs it.

## Definition of done for a fast delivery

- [ ] Every foundation has values and written reasoning with tie-breaks
- [ ] Light and dark (if in scope) pass the contrast floor
- [ ] Core components use only sys tokens; behavior comes from an accessible base
- [ ] Each top flow has a pattern page
- [ ] Tokens build from one source of truth; a changelog exists
- [ ] Rendered screens of each pattern reviewed by eye in every theme

## Traps

- Shipping a component library and calling it a system (no foundations reasoning, no patterns).
- Over-building: 50 components before the first pattern page.
- Library defaults: `@material/material-color-utilities` 0.4.0 defaults to the 2021 spec; the script passes `2025` where supported. The package also fails in plain Node ESM, which is why the wrapper bundles it with esbuild.
- Outdated sources: `@material/web` is in maintenance mode; Polaris React docs URLs now redirect; Style Dictionary v3-era token JSON needs converting to DTCG.
