// Generate a full color foundation from one brand seed color using Google's
// material-color-utilities (HCT tonal palettes + contrast-checked roles).
// Output: DTCG 2025.10 JSON (ref palettes + sys roles per mode) and optional CSS.
// Run through seed-to-tokens.sh, which installs and bundles the library
// (0.4.0 does not load in plain Node ESM).
import {
  argbFromHex, hexFromArgb, Hct, MaterialDynamicColors,
  SchemeTonalSpot, SchemeNeutral, SchemeVibrant, SchemeExpressive,
  SchemeFidelity, SchemeContent, SchemeMonochrome,
} from '@material/material-color-utilities';
import { writeFileSync } from 'node:fs';

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) =>
  a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : null
).filter(Boolean));

const seed = args.seed;
if (!seed || !/^#?[0-9a-fA-F]{6}$/.test(seed)) {
  console.error('usage: seed-to-tokens --seed #RRGGBB [--variant tonalSpot|neutral|vibrant|expressive|fidelity|content|monochrome] [--prefix brand] [--contrast 0] [--out tokens.json] [--css tokens.css]');
  process.exit(2);
}
const variants = {
  tonalSpot: SchemeTonalSpot, neutral: SchemeNeutral, vibrant: SchemeVibrant,
  expressive: SchemeExpressive, fidelity: SchemeFidelity, content: SchemeContent,
  monochrome: SchemeMonochrome,
};
const variant = args.variant || 'tonalSpot';
const Scheme = variants[variant];
if (!Scheme) { console.error(`unknown variant ${variant}`); process.exit(2); }
const prefix = args.prefix || 'brand';
const contrast = Number(args.contrast ?? 0);
// The 2025 spec only applies to tonalSpot/neutral/vibrant/expressive; others fall back to 2021.
const spec = ['tonalSpot', 'neutral', 'vibrant', 'expressive'].includes(variant) ? '2025' : '2021';

const source = Hct.fromInt(argbFromHex(seed.startsWith('#') ? seed : `#${seed}`));
const camel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const color = (argb) => ({ $value: hexFromArgb(argb) });

const light = new Scheme(source, false, contrast, spec);
const dark = new Scheme(source, true, contrast, spec);
const dyn = new MaterialDynamicColors();

const TONES = [0, 4, 6, 10, 12, 17, 20, 22, 24, 30, 40, 50, 60, 70, 80, 87, 90, 92, 94, 95, 96, 98, 99, 100];
const palettes = {
  primary: light.primaryPalette, secondary: light.secondaryPalette,
  tertiary: light.tertiaryPalette, neutral: light.neutralPalette,
  neutralVariant: light.neutralVariantPalette, error: light.errorPalette,
};
const ref = { palette: { $type: 'color' } };
for (const [name, p] of Object.entries(palettes)) {
  ref.palette[name] = Object.fromEntries(TONES.map((t) => [String(t), color(p.tone(t))]));
}

const roles = (scheme) => {
  const out = { $type: 'color' };
  for (const c of dyn.allColors) {
    if (!c || c.name.endsWith('_palette_key_color')) continue;
    out[camel(c.name)] = color(c.getArgb(scheme));
  }
  return out;
};
const sys = { color: { light: roles(light), dark: roles(dark) } };

const tokens = {
  $description: `Generated from seed ${seed} (variant ${variant}, spec ${spec}, contrast ${contrast}) with @material/material-color-utilities.`,
  [prefix]: { ref, sys },
};
const json = JSON.stringify(tokens, null, 2);
if (args.out) writeFileSync(args.out, json + '\n'); else console.log(json);

if (args.css) {
  const kebab = (s) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
  const block = (sel, r) => `${sel} {\n${Object.entries(r).filter(([k]) => !k.startsWith('$'))
    .map(([k, v]) => `  --${prefix}-color-${kebab(k)}: ${v.$value};`).join('\n')}\n}`;
  const css = [
    `/* Generated from seed ${seed}, variant ${variant}, spec ${spec}. Do not edit by hand. */`,
    block(':root, [data-theme="light"]', sys.color.light),
    block('[data-theme="dark"]', sys.color.dark),
    `@media (prefers-color-scheme: dark) {\n${block('  :root:not([data-theme="light"])', sys.color.dark).replace(/\n/g, '\n  ')}\n}`,
  ].join('\n\n');
  writeFileSync(args.css, css + '\n');
}
