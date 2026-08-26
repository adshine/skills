# Temporal Motion QA Playbook

## Evidence model

Use two passes when seeking is available:

1. Record real time to discover unexpected behavior.
2. Seek exact logical times, scroll progress, or discrete states to prove and reproduce suspicious samples.

When the path is `recording-only`, pass 2 is **SKIPPED**—report that explicitly. SKIPPED seeking ≠ Pass; recording evidence must still satisfy acceptance.

Do not infer sub-frame browser states from interpolated video. At 60 Hz, visible frames are normally about 16.67 ms apart; at 120 Hz, about 8.33 ms apart.

## Capture contract

Record:

- URL and loaded asset fingerprint
- viewport and recording dimensions
- device pixel ratio and browser zoom
- browser, operating system, font state, and reduced-motion preference
- interaction action and action timestamp
- pointer position and focus owner
- target, sibling, and clipping-ancestor rectangles
- console errors and warnings
- stable start, forward motion, settled end, reverse motion, and restored start
- path class: `time-seekable` | `scroll-seekable` | `state-seekable` | `recording-only`

Prefer an exact viewport-sized recording. Keep a contextual viewport recording and analyze a stable target crop.

## Frame analysis

Extract source frames with `scripts/extract_video_frames.py`. Analyze them with `scripts/analyze_motion.py`.

Use:

- absolute frame difference for changed-pixel masks
- morphology or minimum-region area to suppress compression speckles
- connected components to separate moving regions
- SSIM for structural change
- optical flow for direction and velocity clues
- DOM rectangle samples to distinguish intended transforms from layout movement

Treat optical flow and SSIM as supporting evidence, not standalone verdicts.

## Suspicious patterns

- A held frame followed by a large displacement suggests stutter or dropped presentation.
- A one-frame component suggests flicker, overlap, or stale state.
- Motion outside the permitted region suggests layout shift or collateral animation.
- Direction reversal before the endpoint suggests overshoot or easing problems.
- Painted bounds touching a clipping ancestor suggest transient clipping.
- Different forward and reverse paths suggest state cleanup or timeline asymmetry.
- A final frame that differs from the initial frame after reversal suggests incomplete restoration.

## False-positive controls

Mask:

- cursor and pointer annotations
- blinking caret and focus blink
- clocks, counters, randomized text, and timestamps
- video, canvas, particle noise, and live charts outside scope
- scrollbars and browser chrome
- known loading spinners

Stabilize fonts, data, network responses, viewport, device pixel ratio, reduced-motion setting, and browser version. Prefer PNG frame extraction. Keep thresholds and masks identical before and after.

## prefers-reduced-motion

Always run a separate PRM context when decorative or tokenized motion is in scope. Tokens must resolve to 0 ms / suppressed motion. A default-context Pass does not satisfy PRM.

## Acceptance

- Match static start and end geometry (`measured-visual-qa` tolerances).
- Restore initial geometry after reverse motion.
- Keep unexpected movement outside the permitted region at zero after masking.
- Keep isolated sibling movement within 1 CSS px.
- Explain every one-frame appearance, disappearance, clip, overlap, or direction reversal.
- Reproduce suspicious states by deterministic seeking when the path class allows it; otherwise classify as `recording-only` or runtime-only jank with frame-timing support—never treat a seek skip as Pass.
- Clear the PRM separate context when applicable.
