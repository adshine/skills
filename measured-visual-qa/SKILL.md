---
name: measured-visual-qa
description: Measure and diagnose settled 2D web UI layout and geometry by reconciling DOM rectangles with painted pixels—alignment, spacing, gutters, rhythm, clipping, overlap, optical center, ≤1 CSS-px tethers, and open/closed settled states. Use when a user asks to screenshot, measure, compare, or fix static alignment, spacing, clipping, rhythm, or settled composition; especially when CSS reports correct alignment but the painted layout still looks wrong. Not for motion, hover feel, backend, CLI, or 3D—pointer-out only: flicker/enter-exit/easing/duration/scroll-view timelines/CSS-native motion → motion-visual-qa; click/drag/hover/focus feel → interaction-feel-qa; shipped UI vs a named frozen source → source-fidelity-qa; 3D/WebGL/canvas scene graph → spatial-runtime-qa (not built); HTTP/DB/trace → full-stack-interaction-qa; CLI/fs → cli-fs-qa.
---

# Measured Visual QA

Reconcile three truths before editing: the element's DOM box, its painted pixels, and the larger composition users perceive as its container. Never treat `align-items: center`, a successful build, or one screenshot as sufficient proof.

This skill covers **settled** 2D layout and geometry only. Capture open/closed or other discrete settled states; do not diagnose in-flight motion here.

## Pointer-out (do not pick this skill for)

| Concern | Skill |
|---|---|
| Flicker, one-frame flash, enter/exit, easing, duration, scroll/view timelines, CSS-native motion | `motion-visual-qa` |
| Click, drag, hover, focus feel, hit slop, light-dismiss, keyboard, native widget state | `interaction-feel-qa` |
| Shipped UI vs a named frozen source (Figma node, DS tokens, written spec, functional contract) | `source-fidelity-qa` |
| Three.js / WebGL / canvas scene graph | `spatial-runtime-qa` (reserved, not shipped) |
| HTTP, WebSocket/SSE, traces, DB/queue truth | `full-stack-interaction-qa` |
| CLI invocation, exit codes, fixture filesystem, lockfile hashes | `cli-fs-qa` |

## Required workflow

1. State the target flow and expected visual relationship in one sentence.
   - Prefer "labels sit halfway between consecutive dividers" over "summary is centered."
   - Name URL, viewport, selector, settled state, and intended relationship.
2. Capture the rendered settled state.
   - Use the available browser-control skill when present.
   - Record URL, viewport, device pixel ratio, scroll position, settled state, and loaded asset URLs.
   - Capture the target plus enough surrounding layout to reveal ancestor spacing.
3. Measure DOM geometry before changing code.
   - Collect `getBoundingClientRect()` for target, siblings, and relevant ancestors.
   - Collect `display`, `gap`, `rowGap`, `columnGap`, margin, padding, border, box sizing, alignment, transform, overflow, font size, and line height.
   - Measure both the target box and the apparent container bounded by neighboring rules or edges.
4. Measure painted pixels.
   - Use `scripts/measure_visual.py` when dividers, repeated intervals, glyph bounds, or optical centers can be isolated.
   - Keep measurement regions narrow enough to exclude expanded bodies, neighboring text, scrollbars, and unrelated rules.
   - Convert device pixels to CSS pixels using the recorded device pixel ratio.
5. Annotate the evidence.
   - Show detected boundaries, expected centerlines, painted bounds, intervals, and offsets on the screenshot.
   - Keep the raw screenshot, specification JSON, report JSON, and annotated PNG together outside the repository unless the user requests committed artifacts.
6. Compare the three layers.
   - DOM geometry: Is the element centered in its own CSS box?
   - Painted geometry: Are its visible pixels centered in that box?
   - Composition geometry: Is that box centered in the area users perceive as the row or container?
7. Classify the owning cause before editing.
   - Read `references/failure-classifications.md` when the owner is unclear.
   - Fix the parent when the parent owns the rhythm. Do not compensate with child transforms or arbitrary offsets.
8. Repeat the same settled state and measurement after the fix.
   - Reuse viewport, crop, selectors, thresholds, and state.
   - Exercise open/closed and responsive settled states that can change layout.
   - Settled anchor tether and edge-flip geometry stay in scope here; in-flight transitions do not.
9. Verify the deployed surface when deployment is in scope.
   - Use a cache-busting query and confirm the loaded asset fingerprint.
   - Treat stale assets as a deployment/cache failure, not as evidence that the visual fix failed.
10. Report evidence.
   - Lead with the diagnosed cause and visible result.
   - Include before/after measurements and the annotated screenshot.
   - State untested states or viewports.

## Measurement rules

- Define the visual container from painted edges or repeated rhythm, not only DOM ancestry.
- Include parent `gap` and sibling margins in interval calculations.
- Separate expanded content from its trigger when measuring an accordion in a settled open or closed state.
- Use repeated items to detect rhythm: compare divider-to-divider and center-to-center intervals.
- Use a default tolerance of 1 CSS px for box geometry and 2 CSS px for anti-aliased glyph bounds.
- Settled anchor tethers and edge-flip positions must stay within the same ≤1 CSS-px tolerance unless a documented optical adjustment applies.
- Do not compare screenshots produced with different browsers, fonts, operating systems, zoom, or device pixel ratios without explicitly accounting for those differences.
- Prefer element crops for optical analysis and contextual screenshots for composition analysis.
- Inspect the screenshot visually after every automated measurement; a threshold can select the wrong pixels.
- Keep compression, pixel, morphology, and threshold settings unchanged between before and after.

## Acceptance gates

Pass only when all applicable gates hold:

- Page identity, meaningful content, console health, and target settled state are verified.
- The intended visual container is explicitly named.
- DOM rectangles and screenshot measurements describe the same settled state.
- Ancestor gaps, padding, borders, and sibling margins are included.
- Repeated intended-equal intervals differ by no more than 1 CSS px.
- Painted glyph or icon centers differ from the intended center by no more than 2 CSS px, unless an optical adjustment is documented.
- Settled interaction states introduce no unplanned layout shift greater than 2 CSS px versus the declared contract.
- Desktop and mobile pass independently when responsive behavior is in scope.
- The post-fix screenshot and report were generated with the same measurement specification.
- A deployed check confirms the corrected asset, when deployment is requested.

## Anti-patterns

- Declaring success from computed alignment alone.
- Measuring an entire expanded component when diagnosing its trigger.
- Cropping so tightly that parent rhythm disappears.
- Changing child height or transform when parent gap owns the defect.
- Using eye-only judgment without numeric or annotated evidence after the user requests measurement.
- Trusting threshold output without checking the annotated image.
- Comparing cached production output to fresh local output.
- Changing thresholds between before and after to manufacture a pass.
- Calling a build or test result visual proof.
- Using this skill to pass or fail motion, hover feel, backend truth, CLI/fs, or 3D scene-graph defects.

## Resources

- Run `scripts/measure_visual.py --help` to measure painted regions and repeated horizontal rules and to produce an annotated image plus JSON report.
- Run `scripts/compare_visual.py --help` to compare before and after reports using fixed tolerances.
- Read `references/measurement-playbook.md` for specification examples and browser geometry capture snippets.
- Read `references/failure-classifications.md` when selecting the owning CSS/layout cause.
