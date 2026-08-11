---
name: measured-visual-qa
description: Measure and diagnose static and temporal web UI defects by combining browser screenshots or recordings, DOM and computed-style geometry, real frame timestamps, Python pixel and motion analysis, annotated evidence, deterministic animation seeking, responsive states, and cache-busted deployed verification. Use when a user asks to screenshot, record, inspect frame by frame, measure, compare, or fix alignment, spacing, clipping, rhythm, flicker, stutter, hover, focus, open/closed, scroll, animation, mobile, or reference-fidelity issues; especially when CSS reports correct alignment or an interaction appears functional but the rendered composition or motion still looks wrong.
---

# Measured Visual QA

Reconcile three truths before editing: the element's DOM box, its painted pixels, and the larger composition users perceive as its container. Never treat `align-items: center`, a successful build, or one screenshot as sufficient proof.

## Select a mode

- Use **static mode** for alignment, spacing, clipping, typography, shared gutters, and settled interaction states.
- Use **temporal mode** for flicker, stutter, jumps, overshoot, clipping during motion, unintended sibling movement, hover/focus loss, scroll animation, easing, and broken reverse transitions.
- Use both when a motion defect may originate from static parent geometry.
- Treat recordings as discovery evidence. Prove suspicious intervals with deterministic timeline sampling before declaring the owning cause.

## Required workflow

1. State the target flow and expected visual relationship in one sentence.
   - Prefer "labels sit halfway between consecutive dividers" over "summary is centered."
   - Name URL, viewport, selector, state, and intended relationship.
2. Capture the rendered state.
   - Use the available browser-control skill when present.
   - Record URL, viewport, device pixel ratio, scroll position, state, and loaded asset URLs.
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
8. Repeat the same state and measurement after the fix.
   - Reuse viewport, crop, selectors, thresholds, and state.
   - Exercise open/closed, hover/focus, forward/reverse scroll, or responsive states that can change layout.
9. Verify the deployed surface when deployment is in scope.
   - Use a cache-busting query and confirm the loaded asset fingerprint.
   - Treat stale assets as a deployment/cache failure, not as evidence that the visual fix failed.
10. Report evidence.
   - Lead with the diagnosed cause and visible result.
   - Include before/after measurements and the annotated screenshot.
   - State untested states or viewports.

## Temporal workflow

1. Define the interaction path and permitted motion region.
   - Include stable start, trigger action, forward motion, settled end, reverse action, and restored start.
2. Record at the native browser cadence.
   - Match video dimensions to viewport dimensions and record device pixel ratio.
   - Record action timestamps, pointer position, console output, target and sibling rectangles, and loaded asset fingerprints.
   - Do not claim nanosecond resolution. Visible evidence is bounded by rendered or encoded frames, commonly 16.67 ms at 60 Hz or 8.33 ms at 120 Hz.
3. Extract only encoded frames.
   - Run `scripts/extract_video_frames.py` to preserve frame timestamps and avoid invented high-rate duplicates.
4. Analyze adjacent frames.
   - Run `scripts/analyze_motion.py` to calculate changed pixels, motion bounds, structural similarity when available, optical flow when available, annotated frames, and a contact sheet.
   - Mask cursors, carets, clocks, video, canvas, random content, and other expected volatility.
5. Locate suspicious intervals.
   - Flag motion outside the permitted region, one-frame appearances, held frames followed by jumps, clipping, overshoot, non-monotonic progress, neighbor movement, and failure to restore the initial state.
6. Seek deterministic states.
   - Read `references/temporal-playbook.md` and `references/animation-adapters.md`.
   - Prefer browser clock control or animation-engine seeking at exact logical times over repeatedly replaying real time.
7. Fix the highest-level owner and replay the same path.
   - Reuse recording size, crop, masks, thresholds, interaction order, and deterministic sample times.
8. Report the timeline.
   - Include the recording, frame timestamps, suspicious frame range, contact sheet, annotated frames, metrics JSON, and before/after verdict.

## Measurement rules

- Define the visual container from painted edges or repeated rhythm, not only DOM ancestry.
- Include parent `gap` and sibling margins in interval calculations.
- Separate expanded content from its trigger when measuring an accordion.
- Use repeated items to detect rhythm: compare divider-to-divider and center-to-center intervals.
- Use a default tolerance of 1 CSS px for box geometry and 2 CSS px for anti-aliased glyph bounds.
- Do not compare screenshots produced with different browsers, fonts, operating systems, zoom, or device pixel ratios without explicitly accounting for those differences.
- Prefer element crops for optical analysis and contextual screenshots for composition analysis.
- Inspect the screenshot visually after every automated measurement; a threshold can select the wrong pixels.
- Preserve source frame timestamps. Increasing extraction FPS does not create browser states that were never painted.
- Compare motion in a stable crop while retaining enough sibling context to expose layout shifts.
- Use real-time recording to discover defects and deterministic seeking to reproduce them.
- Keep compression, pixel, morphology, SSIM, and motion thresholds unchanged between before and after.

## Acceptance gates

Pass only when all applicable gates hold:

- Page identity, meaningful content, console health, and target interaction are verified.
- The intended visual container is explicitly named.
- DOM rectangles and screenshot measurements describe the same state.
- Ancestor gaps, padding, borders, and sibling margins are included.
- Repeated intended-equal intervals differ by no more than 1 CSS px.
- Painted glyph or icon centers differ from the intended center by no more than 2 CSS px, unless an optical adjustment is documented.
- Interaction states introduce no unplanned layout shift greater than 2 CSS px.
- Desktop and mobile pass independently when responsive behavior is in scope.
- The post-fix screenshot and report were generated with the same measurement specification.
- A deployed check confirms the corrected asset, when deployment is requested.
- Temporal start and end states match their static expectations.
- Reverse motion restores the original geometry within static tolerances.
- No unplanned pixels move outside the permitted motion region.
- No unplanned sibling moves more than 1 CSS px during an isolated interaction.
- No unexplained one-frame flicker, clipping, disappearance, overlap, or direction reversal remains.
- Every temporal failure is reproducible by deterministic seeking, or is explicitly classified as runtime-only jank.

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
- Extracting at an arbitrary high FPS and treating duplicated frames as higher temporal resolution.
- Diagnosing motion from compressed RGB differences without masks or noise thresholds.
- Using video alone when an animation timeline can be paused and sought.
- Hiding unexpected sibling movement by cropping only the animated child.
- Treating cursor, caret, timestamps, video, canvas, shadows, or antialiasing as application motion.

## Resources

- Run `scripts/measure_visual.py --help` to measure painted regions and repeated horizontal rules and to produce an annotated image plus JSON report.
- Run `scripts/compare_visual.py --help` to compare before and after reports using fixed tolerances.
- Run `scripts/extract_video_frames.py --help` to extract real encoded frames and timestamps from a recording.
- Run `scripts/analyze_motion.py --help` to create a motion timeline, annotated frames, and contact sheet.
- Read `references/measurement-playbook.md` for specification examples and browser geometry capture snippets.
- Read `references/failure-classifications.md` when selecting the owning CSS/layout cause.
- Read `references/temporal-playbook.md` for recording, extraction, masking, analysis, and acceptance guidance.
- Read `references/animation-adapters.md` before seeking Web Animations, browser-clock, GSAP, or requestAnimationFrame timelines.
