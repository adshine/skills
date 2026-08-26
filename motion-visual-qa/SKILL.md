---
name: motion-visual-qa
description: Diagnose flicker, one-frame flash, enter/exit, easing, duration, prefers-reduced-motion, scroll/view timelines, and CSS-native motion with recording as the primary evidence lane and seeking as optional proof. Use when a user asks to record, inspect frame by frame, or fix motion that looks wrong even when settled layout geometry passes. Not for settled 2D px layout (measured-visual-qa), click/hover/focus feel (interaction-feel-qa), shipped-vs-source fidelity (source-fidelity-qa), HTTP/DB (full-stack-interaction-qa), CLI/fs (cli-fs-qa), or 3D (spatial-runtime-qa, not built). SKIPPED seeking is never Pass.
---

# Motion Visual QA

Treat recordings as the primary evidence lane. Seeking is optional proof when an adapter can expose deterministic samples. **SKIPPED seeking ≠ Pass**—classify the path and report the gap.

Settled open/closed geometry belongs to `measured-visual-qa`. This skill owns in-flight and timeline behavior.

## When to pick

- Flicker or one-frame flash
- Enter/exit transitions
- Easing, duration, overshoot, reverse asymmetry
- `prefers-reduced-motion` (blocking separate context)
- Scroll-driven or view-driven timelines
- CSS-native motion covered by the closed adapter contract below

## Pointer-out

| Concern | Skill |
|---|---|
| Settled 2D layout, gutters, rhythm, clipping, optical center, ≤1 CSS-px tethers | `measured-visual-qa` |
| Click/drag/hover/focus feel, hit slop, light-dismiss, keyboard | `interaction-feel-qa` |
| Shipped UI vs named frozen source | `source-fidelity-qa` |
| HTTP/DB/trace correlation | `full-stack-interaction-qa` |
| CLI/fs fixtures | `cli-fs-qa` |
| Three.js / WebGL / canvas scene graph | `spatial-runtime-qa` (reserved, not shipped) |

## Path classification (required)

Before declaring a verdict, classify every interaction path as exactly one of:

| Class | Meaning |
|---|---|
| `time-seekable` | Logical time can be paused and advanced (WAAPI/GSAP/clock where confirmed) |
| `scroll-seekable` | Independent variable is scroll/view progress; sample scroll positions, not ms |
| `state-seekable` | Discrete states can be forced (open/closed, `:popover-open`, top-layer) |
| `recording-only` | No reliable seek adapter; native-cadence recording is the only evidence |

Report SKIPPED seeking explicitly. Never convert a skip into Pass.

## Required workflow

1. Name the motion contract in one sentence (permitted region, duration/easing or scroll progress, reverse policy, PRM policy).
2. Record at native browser cadence.
   - Match video dimensions to viewport; record device pixel ratio.
   - Record action timestamps, pointer position, console output, target/sibling rectangles, and asset fingerprints.
   - Do not claim sub-frame resolution beyond painted/encoded frames.
3. Extract only encoded frames with `scripts/extract_video_frames.py`.
4. Analyze adjacent frames with `scripts/analyze_motion.py`.
   - Flag motion outside the permitted region, one-frame appearances, held frames then jumps, clipping, overshoot, non-monotonic progress, neighbor movement, and failure to restore.
   - Mask cursors, carets, clocks, video, canvas, random content, and other expected volatility.
5. Classify the path (`time-seekable` | `scroll-seekable` | `state-seekable` | `recording-only`).
6. Apply the matching closed adapter from `references/animation-adapters.md`.
   - `getAnimations()` / WAAPI / GSAP alone are insufficient for CSS-native paths listed below.
   - `CSS.supports` is advisory discovery only, never Pass evidence.
7. Run `prefers-reduced-motion` as a **blocking separate context** (tokens must resolve to 0 ms / no motion where required).
8. Fix the highest-level owner; replay the same path with identical recording size, crop, masks, and thresholds.
9. Report the timeline: recording, timestamps, suspicious range, contact sheet, annotated frames, metrics JSON, path class, seeking status, and before/after verdict.

## Closed CSS-native adapter contract

Read `references/animation-adapters.md` for procedures. Summary:

| Adapter | Seek class | Capture / sample |
|---|---|---|
| **a.** `@starting-style` + `allow-discrete` (`display` / `overlay` / `content-visibility`) | `state-seekable` + recording | Native trigger. Capture closed, first painted enter, intermediates, open, first exit, removed. |
| **b.** `dialog` / `popover` top-layer + `::backdrop` | `state-seekable` + recording | Sample `:popover-open`, `dialog.open`, focus owner, backdrop computed style. |
| **c.** `interpolate-size` + `::details-content` | `state-seekable` + recording | Record open/close. Sample details/summary rects, `[open]`, sibling X, `block-size`. |
| **d.** Houdini `@property` typed keyframes | `recording-only` | Native-cadence record + encoded frames. Computed custom props if exposed, else pixel centroid. Seeking: skip. |
| **e.** `ScrollTimeline` / `ViewTimeline` (`view()` / `scroll()`) | `scroll-seekable` | Independent variable is scroll progress, not ms. Time-seek: skip. |
| **f.** Pseudo `offset-path` / `offset-distance` | `recording-only` | Native-cadence record + encoded frames / pixel centroid. Seeking: skip (compositor/pseudo). |
| **g.** View Transitions API | `recording-only` (unless documented state hooks) | Record old→new; do not invent seek points. |
| **h.** `prefers-reduced-motion` | separate blocking context | Re-run with PRM on; motion tokens must be 0 ms / suppressed. |

## Acceptance gates

Pass only when all applicable gates hold:

- Path class is stated and matches the adapter used.
- Recording evidence covers the suspicious interval at native cadence.
- Seeking was performed where the class requires it, or explicitly SKIPPED with reason—never silently omitted as Pass.
- No unexplained one-frame flicker, clipping, disappearance, overlap, or direction reversal remains in recording evidence.
- Reverse motion restores the original geometry within `measured-visual-qa` static tolerances when reverse is in scope.
- No unplanned pixels move outside the permitted motion region after masking.
- No unplanned sibling moves more than 1 CSS px during an isolated motion path.
- PRM context was run separately when motion tokens or decorative motion are in scope; PRM failure blocks Pass.
- Runtime-only jank is classified as such with frame-timing support, not waved through as Pass.

## Anti-patterns

- Declaring Pass because settled open/closed screenshots look fine.
- Treating SKIPPED seeking as Pass.
- Inferring sub-frame states from interpolated video.
- Using WAAPI/`getAnimations()` alone for `@starting-style`, scroll timelines, `@property`, or view transitions.
- Using `CSS.supports` as Pass evidence.
- Folding PRM into the default run instead of a blocking separate context.
- Diagnosing motion from compressed RGB differences without masks or noise thresholds.
- Hiding unexpected sibling movement by cropping only the animated child.
- Routing click-feel or HTTP/DB failures into this skill.

## Resources

- Run `scripts/extract_video_frames.py --help` to extract real encoded frames and timestamps.
- Run `scripts/analyze_motion.py --help` to create a motion timeline, annotated frames, and contact sheet.
- Read `references/temporal-playbook.md` for recording, extraction, masking, analysis, and acceptance guidance.
- Read `references/animation-adapters.md` before seeking or sampling any timeline.
- Hand settled geometry failures to `measured-visual-qa`.
