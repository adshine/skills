#!/usr/bin/env python3
"""Measure painted UI geometry from a screenshot and annotate the evidence."""

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw


COLORS = {
    "region": (70, 220, 120),
    "center": (255, 200, 0),
    "rule": (255, 80, 80),
    "label": (238, 238, 238),
}


def parse_args():
    parser = argparse.ArgumentParser(
        description="Measure foreground bounds and horizontal-rule rhythm in a UI screenshot."
    )
    parser.add_argument("--image", required=True, help="Input screenshot path")
    parser.add_argument("--spec", required=True, help="Measurement specification JSON")
    parser.add_argument("--annotated", required=True, help="Output annotated PNG path")
    parser.add_argument("--report", required=True, help="Output measurement JSON path")
    return parser.parse_args()


def painted_bbox(image, box, threshold):
    pixels = image.load()
    x0, y0, x1, y1 = map(int, box)
    points = []
    for y in range(max(0, y0), min(image.height, y1)):
        for x in range(max(0, x0), min(image.width, x1)):
            rgb = pixels[x, y]
            if sum(rgb) / len(rgb) >= threshold:
                points.append((x, y))
    if not points:
        return None
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    bounds = [min(xs), min(ys), max(xs) + 1, max(ys) + 1]
    return {
        "bounds": bounds,
        "center": [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2],
        "pixel_count": len(points),
    }


def detect_horizontal_rules(image, config):
    gray = image.convert("L")
    x0, x1 = map(int, config["x_range"])
    y0, y1 = map(int, config["y_range"])
    threshold = int(config.get("threshold", 35))
    coverage = float(config.get("minimum_coverage", 0.75))
    required = max(1, int((x1 - x0) * coverage))
    candidates = []
    for y in range(max(0, y0), min(image.height, y1)):
        count = sum(gray.getpixel((x, y)) >= threshold for x in range(x0, x1))
        if count >= required:
            candidates.append(y)

    groups = []
    for y in candidates:
        if not groups or y > groups[-1][-1] + 1:
            groups.append([y])
        else:
            groups[-1].append(y)
    rules = [round(sum(group) / len(group), 2) for group in groups]
    intervals = [round(b - a, 2) for a, b in zip(rules, rules[1:])]
    return {
        "rules": rules,
        "intervals": intervals,
        "interval_spread": round(max(intervals) - min(intervals), 2) if intervals else 0,
        "x_range": [x0, x1],
    }


def main():
    args = parse_args()
    image = Image.open(args.image).convert("RGB")
    spec = json.loads(Path(args.spec).read_text())
    draw = ImageDraw.Draw(image)
    report = {
        "image": str(Path(args.image).resolve()),
        "size": [image.width, image.height],
        "device_pixel_ratio": float(spec.get("device_pixel_ratio", 1)),
        "regions": [],
    }

    for region in spec.get("regions", []):
        measurement = painted_bbox(image, region["box"], int(region.get("threshold", 105)))
        item = {"name": region["name"], "search_box": region["box"], "painted": measurement}
        report["regions"].append(item)
        if measurement:
            bounds = measurement["bounds"]
            center_y = measurement["center"][1]
            draw.rectangle(bounds, outline=COLORS["region"], width=2)
            draw.line((bounds[0] - 4, center_y, bounds[2] + 4, center_y), fill=COLORS["center"], width=1)
            draw.text((bounds[0], max(0, bounds[1] - 13)), region["name"], fill=COLORS["label"])

    if "horizontal_rules" in spec:
        rules = detect_horizontal_rules(image, spec["horizontal_rules"])
        report["horizontal_rules"] = rules
        x0, x1 = rules["x_range"]
        for y in rules["rules"]:
            draw.line((x0, y, x1, y), fill=COLORS["rule"], width=1)
        for a, b in zip(rules["rules"], rules["rules"][1:]):
            center = (a + b) / 2
            draw.line((x0, center, x1, center), fill=COLORS["center"], width=1)
            draw.text((max(x0, x1 - 100), center - 13), f"{b - a:.1f}px", fill=COLORS["center"])

    Path(args.annotated).parent.mkdir(parents=True, exist_ok=True)
    Path(args.report).parent.mkdir(parents=True, exist_ok=True)
    image.save(args.annotated)
    Path(args.report).write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
