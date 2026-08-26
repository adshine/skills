---
name: source-fidelity-qa
description: Compare shipped UI against a named frozen source—Figma file+node URL, design-system tokens/components, written spec, or functional contract—and Pass or Fail only against that source. Use when a user asks whether implementation matches a named design, token freeze, or written contract. Hard stop with no named source → Unknown, not Pass. Figma is one adapter, not the default and not required; a DS token freeze with no Figma can Pass or Fail. Not for settled layout measurement without a named source (measured-visual-qa), motion timelines (motion-visual-qa), click feel (interaction-feel-qa), HTTP/DB (full-stack-interaction-qa), CLI/fs (cli-fs-qa), or 3D (spatial-runtime-qa, not built). Does not edit Figma files; figma-use / figma-generate-* are authoring, not this skill.
---

# Source Fidelity QA

Judge shipped UI against a **named frozen source**. Without a named source, the result is **Unknown**, never Pass.

Figma is one optional adapter. A design-system token or component freeze with no Figma file can still Pass or Fail.

## When to pick

- “Does this match the Figma node / DS tokens / written spec / functional contract?”
- Regressions against a pinned source revision
- Token or component drift from a frozen design system

## Named sources (at least one required)

| Source kind | Freeze identity |
|---|---|
| Figma | File URL + node ID (and optional version/branch pin) |
| Design system | Token names/values and/or component API + version |
| Written spec | Document path/URL + revision |
| Functional contract | Explicit behavioral/visual rules the product named as source of truth |

Hard stop: if the user cannot name one of the above, return **Unknown** and ask for a freeze. Do not invent a source. Do not silently fall back to “looks good.”

## Pointer-out

| Concern | Skill |
|---|---|
| Layout geometry without a named source | `measured-visual-qa` |
| Motion / flicker / easing | `motion-visual-qa` |
| Click/hover/focus feel | `interaction-feel-qa` |
| Backend correlation | `full-stack-interaction-qa` |
| CLI / filesystem fixtures | `cli-fs-qa` |
| Authoring or editing Figma | `figma-use` / `figma-generate-*` (not this skill) |
| 3D scene graph | `spatial-runtime-qa` (reserved, not shipped) |

## Required workflow

1. Record the named source identity (URL/node, token package version, spec revision, or contract text hash).
2. Select the adapter for that source. Figma is not required when tokens/spec/contract are the freeze.
3. Diff shipped UI against the freeze on the dimensions the source actually specifies (spacing tokens, type ramp, component structure, copy, states).
4. Use screenshots and measurements as evidence lanes; they do not replace the named source.
5. Classify each delta: matches freeze / violates freeze / unspecified by freeze (out of scope, not Fail).
6. Never edit the Figma file or regenerate designs as part of this skill.
7. Report Pass, Fail, or Unknown with the freeze identity and evidence.

## Acceptance gates

- A named frozen source is on the record; otherwise **Unknown**.
- Every Fail cites a concrete freeze rule or node property that was violated.
- Unspecified dimensions are out of scope, not automatic Fail.
- Figma adapter runs only when a Figma freeze was named; DS/spec/contract freezes can Pass without Figma.
- No Pass from eyeballing without the freeze identity.

## Anti-patterns

- Passing because no Figma file was provided when a DS/spec freeze exists—or failing for the same reason.
- Creating a `figma-source-qa` split; Figma stays an adapter here.
- Editing Figma or calling authoring skills to “fix” fidelity.
- Treating `measured-visual-qa` optical centering alone as source fidelity.
- Declaring Pass when the source was never named (must be Unknown).

## Resources

- Hand pure geometry disputes with no freeze to `measured-visual-qa`.
- Hand motion mismatches to `motion-visual-qa` when the freeze specifies motion.
- Do not implement Figma plugins or app code from this skill.
