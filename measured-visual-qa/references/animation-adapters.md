# Animation Seeking Adapters

Install time control before the page schedules timers when using browser-clock emulation.

## Browser clock

Use the browser testing framework's clock when it controls `requestAnimationFrame`, timers, `performance`, and event timestamps. Pause after page setup, trigger the interaction, then advance with fixed increments such as one nominal frame.

Do not assume clock emulation controls compositor-only CSS animations. Confirm each engine by comparing a sought screenshot with a real recording.

## Web Animations API

Pause and seek animations exposed by `document.getAnimations()`:

```js
const animations = document.getAnimations({ subtree: true });
for (const animation of animations) animation.pause();

const seek = (milliseconds) => {
  for (const animation of animations) animation.currentTime = milliseconds;
};
```

Capture at logical percentages and around suspicious real-frame timestamps.

## GSAP

Prefer a named timeline supplied by the application. Pause and seek with timeline time or progress:

```js
timeline.pause();
timeline.progress(0.5, false);
```

If only the global timeline is available, isolate the target animation before seeking so unrelated loops do not contaminate screenshots.

## requestAnimationFrame loops

Use browser-clock control where supported. Otherwise instrument the loop behind a test-only time source and expose a deterministic `renderAt(milliseconds)` function. Do not add production behavior solely for QA without user approval.

## Scroll-triggered motion

Record real scroll first. Then sample deterministic scroll positions and wait for two animation frames before capture. Record scroll offset with every screenshot. Test forward and reverse directions because cleanup and scrub behavior can differ.

## Spring animations

Sample more densely near the endpoint and record position, velocity, and settled criteria. Do not require monotonic position when intentional spring overshoot is part of the design; require bounded overshoot and stable settlement instead.
