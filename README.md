# adshine skills

A collection of agent skills (Claude Code / Codex / any SKILL.md-compatible agent).
Each subdirectory is a self-contained skill: a `SKILL.md` plus any helper scripts.

If a skill here helps you, please star the repo so others can find it.

Read: [Stop Guessing at UI Quality: Interaction QA Skills for AI Coding Agents](articles/introducing-interaction-qa-skills.md)

## Skills

| Skill | What it does | Non-goals (one line) |
|-------|--------------|----------------------|
| [modern-contact-qr](modern-contact-qr/) | Generate rounded, brand-colored contact QR codes as SVG/PNG with independent scan verification. | Not hosted contact pages or generative QR artwork. |
| [ios-sim-session](ios-sim-session/) | Pin one coding session to one iOS Simulator + an isolated build, so concurrent Claude/Codex/Xcode sessions never clash on the device or DerivedData. | Not a product QA skill. |
| [nano-banana-skill](nano-banana-skill/) | AI image generation with Nano Banana Pro (Gemini 3 Pro Image), optimized for Expo / React Native. | Not a product QA skill. |
| [measured-visual-qa](measured-visual-qa/) | Measure settled 2D layout/geometry: DOM rect vs painted px, gutters, rhythm, clipping, optical center, open/closed settled states. | Not motion, hover feel, WebGL/3D, HTTP/DB, or CLI/fs. |
| [motion-visual-qa](motion-visual-qa/) | Record and diagnose flicker, enter/exit, easing, PRM, scroll/view timelines, and CSS-native motion. | Not settled layout px, click feel, HTTP/DB, or CLI/fs. |
| [interaction-feel-qa](interaction-feel-qa/) | Probe click/drag/hover/focus feel, hit slop, light-dismiss, keyboard, and native widget state. | Not 2D layout px, CSS motion, HTTP/DB, or CLI/fs. |
| [source-fidelity-qa](source-fidelity-qa/) | Diff shipped UI against a named frozen source (Figma node, DS tokens, written spec, or functional contract). | Not authoring/editing Figma; no named source → Unknown, not Pass. |
| [cli-fs-qa](cli-fs-qa/) | Assert CLI exit codes, stdout/stderr, isolated fixture filesystems, lockfile hashes, and doctor findings. | Not HTTP/DB/trace; spinner is not truth. |
| [full-stack-interaction-qa](full-stack-interaction-qa/) | Correlate UI actions with HTTP, traces, logs, and DB/queue truth under explicit gates. | Not click-feel, static layout, CSS motion, CLI/fs, or 3D; missing backend evidence ≠ Pass. |
| [website-audit](website-audit/) | Conduct comprehensive website audits across 16 check buckets with dual-track reporting: Plain-English Executive Summary and Deep Engineering Spec. | Not continuous APM / synthetic uptime monitoring. |
| [repair-broken-video](repair-broken-video/) | Recover an unplayable `.mov`/`.mp4` (missing `moov` atom) from a healthy same-device reference clip, then re-encode so frames play in order without stutter. | Not a product QA skill; not for truly missing frame data. |
| [project-manager](project-manager/) | Run one agent as project manager over worker agents (subagents, CLI sessions, or terminal panes): tickets, dispatch, independent review, plain-English reports. | Not a builder; never writes product code itself. |
| [design-system-layers](design-system-layers/) | Deliver a usable design system in days from a premade React (shadcn/ui) or plain HTML starter (seed color to light/dark tokens, pattern pages first) or fix a fragile one by sorting work into foundation, component, or pattern. | Not extracting a system from an existing site or sweeping code for palette violations. |
| [reverse-api-engineer](reverse-api-engineer/) | Turn a site with no public API into a working typed client by capturing its real traffic with the reverse-api-engineer CLI, then verify the client returns real data. | Not for sites with a documented API, or for getting around logins, paywalls, or access controls. |

### Reserved (not shipped)

| Key | Intent |
|-----|--------|
| `spatial-runtime-qa` | Reserved for Three.js / WebGL / canvas scene-graph runtime QA. Not built—do not invent this folder or treat MVQA/FSQA as covering it. |

Do **not** create `figma-source-qa`; Figma is one adapter inside `source-fidelity-qa`.

## Install

Install one skill into your agent's skills directory (e.g. Claude Code):

```bash
# whole collection
git clone https://github.com/adshine/skills.git ~/adshine-skills
ln -s ~/adshine-skills/ios-sim-session ~/.claude/skills/ios-sim-session

# or copy a single skill
cp -R ~/adshine-skills/ios-sim-session ~/.claude/skills/
```

Each skill's own `README.md` has its specific install + usage steps when present.

## Layout

```
skills/
  ios-sim-session/           SKILL.md, README.md, bin/
  nano-banana-skill/         SKILL.md, README.md, scripts/
  measured-visual-qa/        SKILL.md, agents/, scripts/, references/
  motion-visual-qa/          SKILL.md, agents/, scripts/, references/
  interaction-feel-qa/       SKILL.md, agents/
  source-fidelity-qa/        SKILL.md, agents/
  cli-fs-qa/                 SKILL.md, agents/
  full-stack-interaction-qa/ SKILL.md, agents/, scripts/, references/
  website-audit/             SKILL.md, references/, templates/
  repair-broken-video/       SKILL.md, README.md, agents/, scripts/
  project-manager/           SKILL.md, README.md, adapters/, bin/
  articles/                  catalog essay
```

Add a new skill by creating a new top-level directory with a `SKILL.md`.
