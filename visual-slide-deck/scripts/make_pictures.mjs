#!/usr/bin/env node
// Generate a deck's pictures from its own picture list. Nothing about the pictures is hard-coded here:
// the style, the reference image and every subject come from pictures.json next to the deck.
//
// Usage:  node make_pictures.mjs <pictures.json> [--route agy|codex] [--only name,name] [--force]
//
// pictures.json:
// {
//   "style":   "fine banknote-style engraving, black ink line work with cross-hatching",
//   "world":   "modern city, glass towers, people in tailored suits",  // the setting and class of everything drawn; agree it with the user first
//   "plateGround": "cream paper",          // ground for full-bleed plates
//   "reference": "assets/style-ref.jpg",   // optional: an earlier picture from this set, so the set matches
//   "out": "assets",
//   "pictures": [
//     { "name": "cover", "kind": "plate", "aspect": "2:3", "for": "Cover: AI Foundations", "subject": "..." },
//     { "name": "object-lightbulb", "kind": "object", "for": "Step 2: Your idea", "subject": "a single lightbulb" }
//   ]
// }
// "for" is required on every picture: it is the slide's own point, so a picture can be checked against what it stands for.
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync, copyFileSync, readdirSync, statSync, renameSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { homedir } from 'node:os';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const opt = (k) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : undefined; };
if (!file) { console.error('usage: node make_pictures.mjs <pictures.json> [--route agy|codex] [--only name,name] [--force]'); process.exit(2); }

const has = (bin) => spawnSync('sh', ['-c', `command -v ${bin}`]).status === 0;
const INSTALL = {
  agy: [
    'This skill makes its pictures with the agy command line tool (Google Antigravity CLI), and it is not installed on this machine.',
    'Install agy, sign in with a Google account that has Gemini image access, check it with `agy --version`, then run this again.',
    'If you already use the Codex CLI with the imagegen skill, you can run this with `--route codex` instead.',
  ],
  codex: [
    'The codex route needs the Codex CLI with the imagegen skill, and `codex` is not installed on this machine.',
    'Install the Codex CLI and sign in, or drop `--route codex` to use agy.',
  ],
};
let route = opt('route') || 'agy';
if (!['agy', 'codex'].includes(route)) { console.error(`unknown route "${route}": use agy or codex`); process.exit(2); }
if (!has(route)) {
  console.error('\nCannot generate pictures yet.\n\n' + INSTALL[route].join('\n') + '\n');
  process.exit(3);
}

const base = dirname(resolve(file));
const spec = JSON.parse(readFileSync(file, 'utf8'));
for (const key of ['style', 'pictures']) if (!spec[key]) { console.error(`pictures.json is missing "${key}"`); process.exit(2); }
const out = resolve(base, spec.out || 'assets');
mkdirSync(out, { recursive: true });
const ref = spec.reference ? resolve(base, spec.reference) : null;
if (ref && !existsSync(ref)) { console.error(`reference image not found: ${ref}`); process.exit(2); }
const only = opt('only') ? opt('only').split(',') : null;

const missingFor = spec.pictures.filter((p) => !p.for || !p.subject || !p.name);
if (missingFor.length) { console.error('Every picture needs "name", "subject" and "for" (the slide point it stands for). Missing on: ' + missingFor.map((p) => p.name || '(unnamed)').join(', ')); process.exit(2); }

function promptFor(p, target) {
  const plate = p.kind === 'plate';
  const ground = plate ? `on a ${spec.plateGround || 'plain paper'} ground` : 'on a pure white background';
  const shape = plate ? `Aspect ratio ${p.aspect || '16:9'}, filling the frame edge to edge.` : 'One object only, centred, with generous white margin, square format, no ground shadow.';
  const world = spec.world ? ` The world of every picture: ${spec.world}.` : '';
  return `Generate ONE image${ref ? ' matching the drawing technique of the attached reference (line work only, not its subject or setting)' : ''}: ${spec.style}, ${ground}. Subject: ${p.subject}.${world} ${shape} No text, no letters, no logos, no border. Never draw a recognisable real person. Save or copy the generated image to ${target} and reply with only that path.`;
}

function newestImageSince(dir, since) {
  let best = null;
  const walk = (d, depth) => {
    if (depth > 3 || !existsSync(d)) return;
    for (const n of readdirSync(d)) {
      const f = join(d, n); let s; try { s = statSync(f); } catch { continue; }
      if (s.isDirectory()) walk(f, depth + 1);
      else if (/\.(png|jpe?g|webp)$/i.test(n) && s.mtimeMs >= since && (!best || s.mtimeMs > best.t)) best = { f, t: s.mtimeMs };
    }
  };
  walk(dir, 0);
  return best && best.f;
}

const results = [];
for (const p of spec.pictures) {
  if (only && !only.includes(p.name)) continue;
  const target = join(out, p.name + '.png');
  if (existsSync(target) && !args.includes('--force')) { results.push({ name: p.name, status: 'kept (exists, use --force to redo)' }); continue; }
  // Move any earlier file aside first, so an old picture can never be reported as newly made.
  if (existsSync(target)) renameSync(target, target.replace(/\.png$/, `.previous.png`));
  const prompt = promptFor(p, target);
  const started = Date.now();
  const fresh = () => existsSync(target) && statSync(target).mtimeMs >= started - 1000;
  try {
    if (route === 'agy') {
      execFileSync('agy', ['-p', (ref ? `Use this image as the style reference: ${ref}. ` : '') + prompt, '--model', spec.agyModel || 'gemini-4-argon-medium', '--mode', 'accept-edits', '--add-dir', out, ...(ref ? ['--add-dir', dirname(ref)] : [])], { stdio: ['ignore', 'pipe', 'pipe'], timeout: 6 * 60 * 1000 });
      if (!fresh()) { const made = newestImageSince(join(homedir(), '.gemini', 'antigravity-cli', 'brain'), started); if (made) copyFileSync(made, target); }
    } else {
      execFileSync(process.env.CODEX_BIN || 'codex', ['exec', '--skip-git-repo-check', ...(ref ? ['-i', ref] : []), '-'], { input: 'Use the $imagegen skill (built-in image tool). ' + prompt, stdio: ['pipe', 'pipe', 'pipe'], timeout: 6 * 60 * 1000 });
    }
    results.push({ name: p.name, status: fresh() ? 'made' : 'FAILED: the tool ran but no image was saved (image quota may be used up; try the other route)' });
  } catch (e) {
    results.push({ name: p.name, status: 'FAILED: ' + String(e.stderr || e.message).trim().split('\n').slice(-1)[0].slice(0, 200) });
  }
}
console.log(JSON.stringify({ route, out, results }, null, 2));
console.log('\nNext: look at every picture beside its "for" line. A picture that does not show what its slide says gets a new subject and a rerun with --only <name> --force.');
if (results.some((r) => r.status.startsWith('FAILED'))) process.exit(1);
