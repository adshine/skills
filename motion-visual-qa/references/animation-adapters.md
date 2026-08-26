# Animation Seeking and CSS-Native Adapters

Recording is primary. Seeking proves suspicious states when an adapter exists. **SKIPPED seeking ≠ Pass.**

`document.getAnimations()` / WAAPI / GSAP are insufficient for the CSS-native adapters below. `CSS.supports` is advisory discovery only.

Classify each path: `time-seekable` | `scroll-seekable` | `state-seekable` | `recording-only`.

Install time control before the page schedules timers when using browser-clock emulation.

## Browser clock (`time-seekable` when confirmed)

Use the browser testing framework's clock when it controls `requestAnimationFrame`, timers, `performance`, and event timestamps. Pause after page setup, trigger the interaction, then advance with fixed increments such as one nominal frame.

Do not assume clock emulation controls compositor-only CSS animations. Confirm each engine by comparing a sought screenshot with a real recording.

## Web Animations API (`time-seekable` when exposed)

Pause and seek animations exposed by `document.getAnimations()`:

```js
const animations = document.getAnimations({ subtree: true });
for (const animation of animations) animation.pause();

const seek = (milliseconds) => {
  for (const animation of animations) animation.currentTime = milliseconds;
};
```

Capture at logical percentages and around suspicious real-frame timestamps. If the motion is CSS-native and not reflected in WAAPI, fall through to the matching adapter below—do not declare seek coverage.

## GSAP (`time-seekable`)

Prefer a named timeline supplied by the application. Pause and seek with timeline time or progress:

```js
timeline.pause();
timeline.progress(0.5, false);
```

If only the global timeline is available, isolate the target animation before seeking so unrelated loops do not contaminate screenshots.

## requestAnimationFrame loops (`time-seekable` with test hook)

Use browser-clock control where supported. Otherwise instrument the loop behind a test-only time source and expose a deterministic `renderAt(milliseconds)` function. Do not add production behavior solely for QA without user approval.

## Spring animations

Sample more densely near the endpoint and record position, velocity, and settled criteria. Do not require monotonic position when intentional spring overshoot is part of the design; require bounded overshoot and stable settlement instead.

---

## Closed CSS-native adapters

### a. `@starting-style` + `allow-discrete` (`state-seekable` + recording)

Covers discrete properties such as `display`, `overlay`, and `content-visibility` that participate in entry/exit via `@starting-style` and `transition-behavior: allow-discrete`.

- Trigger with the native mechanism (class, `showModal`, popover, etc.)—do not fake only computed styles.
- Capture ordered evidence: **closed → first painted enter → intermediates → open → first exit → removed**.
- Sample presence in the accessibility/layout tree and painted pixels at each step.
- WAAPI pause/seek alone is insufficient when discrete property flips are compositor- or style-driven.

### b. `dialog` / `popover` top-layer + `::backdrop` (`state-seekable` + recording)

- Sample `:popover-open` and `dialog.open` boolean state.
- Record focus owner before, during, and after open/close.
- Capture `::backdrop` computed style (opacity, background, pointer-events) alongside the top-layer box.
- Record enter/exit at native cadence; settle open/closed geometry may also be handed to `measured-visual-qa`.

### c. `interpolate-size` + `::details-content` (`state-seekable` + recording)

- Record open and close of `details`/`summary` at native cadence.
- Sample details and summary rectangles, the `[open]` attribute, sibling X positions, and computed `block-size` (including `::details-content` when exposed).
- Confirm size interpolation does not clip content or shift siblings outside the permitted region.

### d. Houdini `@property` typed keyframes (`recording-only`)

- Prefer native-cadence recording plus encoded frames.
- If typed custom properties are readable via computed style, sample them; otherwise track painted pixel centroid of the affected region.
- **Seeking: skip.** Report `recording-only`. SKIPPED seeking is not Pass by itself—recording must still clear the motion gates.

### e. `ScrollTimeline` / `ViewTimeline` (`scroll-seekable`)

Independent variable is **scroll progress**, not milliseconds.

- Record real scroll first (forward and reverse).
- Sample deterministic scroll/view positions; wait for two animation frames before each capture.
- Record scroll offset / timeline progress with every screenshot.
- **Time-seek: skip.** Do not advance a clock and call it scroll progress.

### f. Pseudo `offset-path` / `offset-distance` (`recording-only`)

Force class: **`recording-only`**. Compositor/pseudo offset motion is not honestly time-seekable or scroll-seekable from this skill.

- Prefer native-cadence recording plus encoded frames; track painted pixel centroid of the moving region.
- Readable `offset-distance` values may annotate the report but do not upgrade the seek class.
- **Seeking: skip.** SKIPPED seeking is not Pass by itself—recording must still clear the motion gates.
- Confirm the element stays on the path and does not clip unexpectedly at corners.

### g. View Transitions API (`recording-only` unless documented hooks)

- Record the old→new transition at native cadence, including intermediate encoded frames.
- Do not invent seek points unless the app exposes documented transition hooks.
- Capture named transition groups when identifiable; otherwise treat the viewport recording as authoritative.

### h. `prefers-reduced-motion` (blocking separate context)

- Re-run the same scenarios with `prefers-reduced-motion: reduce`.
- Motion tokens and decorative transitions must resolve to **0 ms** / suppressed motion per the product contract.
- PRM is never a soft warning folded into the default run—failure here blocks Pass even if the default context looks correct.

---

## Scroll-triggered motion (general)

Record real scroll first. Then sample deterministic scroll positions and wait for two animation frames before capture. Record scroll offset with every screenshot. Test forward and reverse directions because cleanup and scrub behavior can differ. Prefer adapter **e** when Scroll/View timelines are in use.
