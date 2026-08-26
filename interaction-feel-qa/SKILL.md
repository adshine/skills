---
name: interaction-feel-qa
description: Diagnose click, drag, hover, and focus feel—hit slop, light-dismiss, keyboard paths, and native widget state (dialog, popover, details)—when geometry can pass while the interaction still feels wrong. Use when a user reports mistaps, sticky hover, focus traps, accidental dismiss, or controls that look correct but respond poorly. Not for settled 2D px layout (measured-visual-qa), CSS motion/flicker/easing (motion-visual-qa), HTTP/DB/trace (full-stack-interaction-qa—never for these feel gates), CLI/fs (cli-fs-qa), shipped-vs-source pixels (source-fidelity-qa), or 3D (spatial-runtime-qa, not built). Visible “Copied” text or a spinner is not proof of correct feel.
---

# Interaction Feel QA

Geometry can pass while feel fails. This skill judges whether pointer, keyboard, and native widget interactions behave as users expect—not whether boxes align or requests succeed.

## When to pick

- Click, drag, hover, or focus feels wrong
- Hit targets too small, offset, or overlapping (hit slop)
- Light-dismiss / outside-click / Escape behavior
- Keyboard tab order, focus visible, focus trap, restore focus
- Native widget state: `dialog`, `popover`, `details`/`summary` open-close feel and focus handoff

## Pointer-out

| Concern | Skill |
|---|---|
| Settled 2D layout / painted px | `measured-visual-qa` |
| Flicker, easing, enter/exit, scroll/view timelines, CSS-native motion | `motion-visual-qa` |
| Shipped UI vs named frozen source | `source-fidelity-qa` |
| HTTP, DB, traces, queues | `full-stack-interaction-qa` (never for feel gates) |
| CLI / fixture filesystem | `cli-fs-qa` |
| 3D scene graph | `spatial-runtime-qa` (reserved, not shipped) |

## Required workflow

1. Name the gesture contract: input modality, target, expected response latency feel, dismiss rules, and focus policy.
2. Exercise the path with real pointer and keyboard—not only programmatic `.click()`.
3. Probe hit slop: click near edges, corners, and overlapping siblings; record miss/hit coordinates relative to the box.
4. Probe hover/focus entry and exit: sticky hover, hover holes, focus rings that disappear, focus that lands on the wrong node.
5. Probe light-dismiss and Escape against the documented policy (including nested overlays).
6. For native widgets, assert real engine state (`dialog.open`, `:popover-open`, `details[open]`) plus focus owner—not only visible chrome.
7. Reject false proof: a visible “Copied” label, toast, or spinner does not prove the control felt correct or that the intended action fired once.
8. Hand layout failures to `measured-visual-qa` and motion failures to `motion-visual-qa` without absorbing them here.
9. Report reproducible steps, modality, hit coordinates, focus owner sequence, and verdict.

## Acceptance gates

Pass only when all applicable gates hold:

- Primary pointer path succeeds within the declared hit target, including edge/slop checks in scope.
- Hover and focus entry/exit match the contract; no sticky or hollow regions remain unexplained.
- Keyboard path reaches the same outcomes as pointer where required, with visible focus and correct restore.
- Light-dismiss and Escape follow the documented policy; no accidental dismiss or undismissible trap.
- Native widget open/close updates engine state and focus correctly.
- Feel failures are never marked Pass because FSQA backend lanes were green, or because a spinner/toast appeared.

## Anti-patterns

- Declaring Pass from a single center-click on a large target.
- Using FSQA / HTTP / DB evidence to clear a feel gate.
- Treating CSS motion polish or settled layout as feel proof.
- Accepting “Copied” / spinner / optimistic label as sole success evidence.
- Skipping keyboard when the control is advertised as accessible.

## Resources

- Pair with `measured-visual-qa` when settled boxes are wrong.
- Pair with `motion-visual-qa` when the defect is flicker or easing during the gesture.
- Do not route feel-only failures through `full-stack-interaction-qa`.
