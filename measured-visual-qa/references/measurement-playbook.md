# Measurement Playbook

## Specification format

Use device-pixel screenshot coordinates. Record device pixel ratio so results can be converted to CSS pixels.

```json
{
  "device_pixel_ratio": 1,
  "regions": [
    {"name": "step-02", "box": [48, 480, 76, 538], "threshold": 105},
    {"name": "title-02", "box": [88, 480, 290, 538], "threshold": 105},
    {"name": "icon-02", "box": [1216, 480, 1234, 538], "threshold": 105}
  ],
  "horizontal_rules": {
    "x_range": [40, 1240],
    "y_range": [320, 630],
    "threshold": 35,
    "minimum_coverage": 0.75
  }
}
```

Run:

```bash
python3 scripts/measure_visual.py \
  --image screenshot.png \
  --spec measurement.json \
  --annotated annotated.png \
  --report report.json
```

## Browser geometry capture

Evaluate a target and its relevant ancestors in the rendered page:

```js
const box = (element) => {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return {
    rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    display: style.display,
    gap: style.gap,
    rowGap: style.rowGap,
    columnGap: style.columnGap,
    margin: [style.marginTop, style.marginRight, style.marginBottom, style.marginLeft],
    padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
    border: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth],
    boxSizing: style.boxSizing,
    alignItems: style.alignItems,
    justifyContent: style.justifyContent,
    transform: style.transform,
    overflow: style.overflow,
    lineHeight: style.lineHeight,
    fontSize: style.fontSize
  };
};
```

Capture the target, siblings that define rhythm, and ancestors until the layout owner is found.

## Measurement selection

- Use rule intervals for accordions, table rows, lists, and stacked cards.
- Use painted bounding boxes for glyph, icon, label, and logo alignment.
- Use center-to-center spacing for repeated navigation or carousel items.
- Use edge deltas for shared gutters and stitcher consistency.
- Use an element crop for pixel isolation and a contextual viewport screenshot for composition.

## Threshold safety

- Inspect the annotation after every run.
- Exclude borders when measuring text unless borders are the target.
- Exclude expanded body content when measuring a trigger.
- Prefer a narrow search box to aggressive threshold tuning.
- Keep thresholds unchanged between before and after.
