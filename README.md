# adshine skills

A collection of agent skills (Claude Code / Codex / any SKILL.md-compatible agent).
Each subdirectory is a self-contained skill: a `SKILL.md` plus any helper scripts.

Read: [Stop Guessing at UI Quality: Interaction QA Skills for AI Coding Agents](articles/introducing-interaction-qa-skills.md)

## Skills

| Skill | What it does | Non-goals (one line) |
|-------|--------------|----------------------|
| [ios-sim-session](ios-sim-session/) | Pin one coding session to one iOS Simulator + an isolated build, so concurrent Claude/Codex/Xcode sessions never clash on the device or DerivedData. | Not a product QA skill. |
| [nano-banana-skill](nano-banana-skill/) | AI image generation with Nano Banana Pro (Gemini 3 Pro Image), optimized for Expo / React Native. | Not a product QA skill. |
| [measured-visual-qa](measured-visual-qa/) | Measure settled 2D layout/geometry: DOM rect vs painted px, gutters, rhythm, clipping, optical center, open/closed settled states. | Not motion, hover feel, WebGL/3D, HTTP/DB, or CLI/fs. |
| [motion-visual-qa](motion-visual-qa/) | Record and diagnose flicker, enter/exit, easing, PRM, scroll/view timelines, and CSS-native motion. | Not settled layout px, click feel, HTTP/DB, or CLI/fs. |
| [interaction-feel-qa](interaction-feel-qa/) | Probe click/drag/hover/focus feel, hit slop, light-dismiss, keyboard, and native widget state. | Not 2D layout px, CSS motion, HTTP/DB, or CLI/fs. |
| [source-fidelity-qa](source-fidelity-qa/) | Diff shipped UI against a named frozen source (Figma node, DS tokens, written spec, or functional contract). | Not authoring/editing Figma; no named source → Unknown, not Pass. |
| [cli-fs-qa](cli-fs-qa/) | Assert CLI exit codes, stdout/stderr, isolated fixture filesystems, lockfile hashes, and doctor findings. | Not HTTP/DB/trace; spinner is not truth. |
| [full-stack-interaction-qa](full-stack-interaction-qa/) | Correlate UI actions with HTTP, traces, logs, and DB/queue truth under explicit gates. | Not click-feel, static layout, CSS motion, CLI/fs, or 3D; missing backend evidence ≠ Pass. |

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
  articles/                  catalog essay
```

Add a new skill by creating a new top-level directory with a `SKILL.md`.
