# Stop Guessing at UI Quality: Interaction QA Skills for AI Coding Agents

Modern coding agents can build an interface remarkably quickly. They can translate a prompt into components, wire up interactions, and produce a working application in minutes.

But "working" is not the same as correct.

A button can respond while its hit target feels wrong. An accordion can settle on-center while its enter transition flickers. A checkout flow can show a success toast while the backend records the wrong state. A CLI can print "Done" while the fixture filesystem is wrong. A page can match a designer's intent at one viewport and drift from the named source at another.

These problems live between disciplines. One skill cannot own all of them. This repository ships a **frozen QA catalog**: separate `SKILL.md` keys with explicit pick surfaces and non-goals so agents stop collapsing unrelated failures into one workflow.

## Live QA catalog

| Key | Pick when | Non-goals (one line) |
|-----|-----------|----------------------|
| [`measured-visual-qa`](https://github.com/adshine/skills/tree/master/measured-visual-qa) | Settled 2D layout/geometry: DOM rect vs painted px, gutters, rhythm, clipping, optical center, open/closed settled states | Not motion, hover feel, WebGL/3D, HTTP/DB, or CLI/fs |
| [`motion-visual-qa`](https://github.com/adshine/skills/tree/master/motion-visual-qa) | Flicker, enter/exit, easing, duration, PRM, scroll/view timelines, CSS-native motion | Not settled layout px, click feel, HTTP/DB, or CLI/fs |
| [`interaction-feel-qa`](https://github.com/adshine/skills/tree/master/interaction-feel-qa) | Click/drag/hover/focus feel, hit slop, light-dismiss, keyboard, native widget state | Not 2D layout px, CSS motion, HTTP/DB, or CLI/fs |
| [`source-fidelity-qa`](https://github.com/adshine/skills/tree/master/source-fidelity-qa) | Shipped UI vs a **named** frozen source (Figma file+node, DS tokens/components, written spec, functional contract) | Not Figma authoring; no named source → Unknown, not Pass |
| [`cli-fs-qa`](https://github.com/adshine/skills/tree/master/cli-fs-qa) | CLI invocation, exit code, stdout/stderr, isolated fixture FS, lockfile hashes, doctor findings | Not HTTP/DB/trace; spinner is not truth |
| [`full-stack-interaction-qa`](https://github.com/adshine/skills/tree/master/full-stack-interaction-qa) | Backend-dependent flows where UI must agree with HTTP/trace/DB/queue truth | Not click-feel, static layout, CSS motion, CLI/fs, or 3D; missing backend evidence ≠ Pass |

### Reserved (not shipped)

| Key | Intent |
|-----|--------|
| `spatial-runtime-qa` | Reserved for Three.js / WebGL / canvas **scene-graph** runtime QA. **Not built.** Do not invent the folder. Do not treat `measured-visual-qa` or `full-stack-interaction-qa` as covering WebGL or 3D. |

Do **not** create `figma-source-qa`. Figma is one adapter inside `source-fidelity-qa`, not a separate skill and not required when the freeze is tokens or a written contract.

## Why the split exists

Traditional automated tests are good at checking discrete facts:

- Did the button receive a click?
- Did the request return `200`?
- Did the expected text appear?
- Did the route change?

Those checks are necessary, but they do not tell us whether the complete experience was correct. A user does not experience layout, motion, feel, design fidelity, CLI side effects, and backend persistence as one blob. Our skills should not either.

**Common misreads this catalog forbids:**

- `full-stack-interaction-qa` does **not** cover CLI/filesystem contracts—that is `cli-fs-qa`.
- `measured-visual-qa` does **not** cover WebGL/3D, motion flicker, or hover feel—those are `spatial-runtime-qa` (reserved), `motion-visual-qa`, and `interaction-feel-qa`.
- A green FSQA backend lane does not Pass a feel or layout gate.
- A settled screenshot Pass does not Pass a motion path.
- `backend: none` is never an FSQA Pass.

## Measured Visual QA (settled 2D only)

[`measured-visual-qa`](https://github.com/adshine/skills/tree/master/measured-visual-qa) moves static layout inspection from opinion to evidence: DOM boxes, painted pixels, and composition rhythm within ≤1 CSS-px tethers.

It owns open/closed **settled** states, gutters, clipping, and optical center. It does **not** own hover animation, flicker, scroll timelines, or 3D.

## Motion Visual QA

[`motion-visual-qa`](https://github.com/adshine/skills/tree/master/motion-visual-qa) owns temporal evidence. Recording is primary; seeking is optional proof. **SKIPPED seeking ≠ Pass.**

Each path must be classified `time-seekable`, `scroll-seekable`, `state-seekable`, or `recording-only`. The closed CSS-native adapter contract covers `@starting-style` / `allow-discrete`, dialog/popover top-layer, `interpolate-size` / `::details-content`, Houdini `@property`, Scroll/View timelines, offset-path, view transitions, and `prefers-reduced-motion` as a blocking separate context.

## Interaction Feel QA

[`interaction-feel-qa`](https://github.com/adshine/skills/tree/master/interaction-feel-qa) owns whether the control *feels* right: hit slop, sticky hover, focus traps, light-dismiss, keyboard parity, and native widget state. Geometry can pass while feel fails. A visible “Copied” label or spinner is not proof. FSQA is never the gate for these checks.

## Source Fidelity QA

[`source-fidelity-qa`](https://github.com/adshine/skills/tree/master/source-fidelity-qa) owns shipped UI versus a **named frozen source**. No named source → **Unknown**, not Pass. A design-system token freeze with no Figma can still Pass or Fail. This skill does not edit Figma files; `figma-use` / `figma-generate-*` are authoring tools, not fidelity QA.

## CLI / Filesystem QA

[`cli-fs-qa`](https://github.com/adshine/skills/tree/master/cli-fs-qa) owns process exit codes, streams, isolated fixture trees, lockfile hashes, and doctor findings. Authoritative truth is the fixture filesystem. Do not require HTTP, DB, or distributed traces—and do not send these contracts to FSQA.

## Full-Stack Interaction QA (fenced)

[`full-stack-interaction-qa`](https://github.com/adshine/skills/tree/master/full-stack-interaction-qa) correlates user actions with HTTP, streams, traces, logs, and durable state. Missing backend evidence is a gap, never Pass.

It explicitly does **not** clear click-feel, static layout, CSS motion, CLI/fs, or 3D concerns.

## Better together

A complete quality loop uses the right key per failure class:

1. Name the expected contract and pick the catalog key.
2. Capture only the evidence lanes that key requires.
3. Classify the failure without absorbing out-of-scope concerns.
4. Fix and re-run the same key with identical thresholds.
5. Escalate across keys only when the owner truly changes (for example settled geometry after a motion fix).

This is especially valuable for AI coding agents. Agents are fast at generating code, but speed can encourage guesswork. A structured, split catalog gives the agent a disciplined way to observe before editing and verify before claiming success.

## Install and test the skills

Clone the public repository and copy the skills you need into your agent's skills directory:

```bash
git clone https://github.com/adshine/skills.git adshine-skills
cp -R adshine-skills/measured-visual-qa ~/.codex/skills/
cp -R adshine-skills/motion-visual-qa ~/.codex/skills/
cp -R adshine-skills/interaction-feel-qa ~/.codex/skills/
cp -R adshine-skills/source-fidelity-qa ~/.codex/skills/
cp -R adshine-skills/cli-fs-qa ~/.codex/skills/
cp -R adshine-skills/full-stack-interaction-qa ~/.codex/skills/
```

Restart or reload your agent if it does not discover newly installed skills automatically. Other `SKILL.md`-compatible agents may use a different skills directory.

Example prompts:

> Use measured-visual-qa on the settled open and closed accordion states. Measure trigger alignment against divider rhythm and annotate any ≤1 CSS-px tether failures.

> Use motion-visual-qa to record the accordion enter/exit, classify the path, apply the `@starting-style` adapter, and run prefers-reduced-motion as a separate blocking context.

> Use interaction-feel-qa on the popover: probe hit slop, outside dismiss, Escape, and keyboard focus restore. Do not treat a spinner as proof.

> Use source-fidelity-qa against this named Figma file+node (or DS token freeze). If no source is named, return Unknown.

> Use cli-fs-qa to run the scaffold CLI in an isolated fixture and assert exit code, stderr, and lockfile hash.

> Use full-stack-interaction-qa on file upload from selection through persisted completion. Treat missing DB/trace evidence as a gap, not Pass.

The best test is a case where you already know about a subtle bug. That makes it easier to assess whether the skill helps your agent discover the problem rather than merely describe the happy path.

## Help improve the skills

These are practical, evolving tools. Real-world feedback will make them better.

After testing, please share your agent and environment, the prompt you used, what the skill identified correctly, what it missed, and redacted screenshots, recordings, traces, or reports when possible.

Use the structured [skill feedback form](https://github.com/adshine/skills/issues/new?template=skill-feedback.yml) to report your experience.

The goal is straightforward: help agents stop guessing, pick the right QA key, and produce interface work that is not only functional, but visibly and behaviorally correct.
