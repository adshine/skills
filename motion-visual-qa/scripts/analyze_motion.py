#!/usr/bin/env python3
"""Analyze adjacent UI frames and generate annotated temporal evidence."""

import argparse
import csv
import json
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageOps

try:
    import cv2
    import numpy as np
except ImportError:
    cv2 = None
    np = None

try:
    from skimage.metrics import structural_similarity
except ImportError:
    structural_similarity = None


def parse_box(value):
    parts = [int(part) for part in value.split(",")]
    if len(parts) != 4:
        raise argparse.ArgumentTypeError("box must be x0,y0,x1,y1")
    return parts


def parse_args():
    parser = argparse.ArgumentParser(description="Measure and annotate motion between extracted UI frames.")
    parser.add_argument("--frames", required=True, help="Directory containing ordered PNG frames")
    parser.add_argument("--output", required=True, help="Output analysis directory")
    parser.add_argument("--timestamps", help="Optional frame-timestamps.csv")
    parser.add_argument("--glob", default="frame-*.png", help="Frame filename glob")
    parser.add_argument("--crop", type=parse_box, help="Analysis crop x0,y0,x1,y1")
    parser.add_argument("--ignore-box", action="append", type=parse_box, default=[], help="Mask x0,y0,x1,y1; repeatable")
    parser.add_argument("--pixel-threshold", type=int, default=18)
    parser.add_argument("--minimum-region-area", type=int, default=12)
    parser.add_argument("--contact-columns", type=int, default=5)
    return parser.parse_args()


def load_timestamps(path):
    if not path:
        return {}
    with Path(path).open(newline="") as handle:
        return {int(row["index"]): row for row in csv.DictReader(handle)}


def threshold_mask(diff, threshold):
    return diff.point(lambda value: 255 if value >= threshold else 0)


def count_white(mask):
    histogram = mask.histogram()
    return histogram[255] if len(histogram) > 255 else 0


def optional_metrics(previous, current, mask):
    metrics = {"ssim": None, "mean_flow": None, "max_flow": None, "regions": []}
    if np is None:
        return metrics
    previous_array = np.asarray(previous)
    current_array = np.asarray(current)
    gray_previous = cv2.cvtColor(previous_array, cv2.COLOR_RGB2GRAY)
    gray_current = cv2.cvtColor(current_array, cv2.COLOR_RGB2GRAY)
    mask_array = np.asarray(mask)

    if structural_similarity is not None:
        metrics["ssim"] = round(float(structural_similarity(gray_previous, gray_current, data_range=255)), 6)

    components, _, stats, _ = cv2.connectedComponentsWithStats(mask_array, connectivity=8)
    for label in range(1, components):
        x, y, width, height, area = [int(value) for value in stats[label]]
        metrics["regions"].append({"box": [x, y, x + width, y + height], "area": area})

    flow = cv2.calcOpticalFlowFarneback(gray_previous, gray_current, None, 0.5, 3, 15, 3, 5, 1.2, 0)
    magnitude, _ = cv2.cartToPolar(flow[..., 0], flow[..., 1])
    active = magnitude[mask_array > 0]
    if active.size:
        metrics["mean_flow"] = round(float(active.mean()), 6)
        metrics["max_flow"] = round(float(active.max()), 6)
    return metrics


def create_contact_sheet(entries, annotated_paths, output, columns):
    if not annotated_paths:
        return
    selected = sorted(range(len(entries)), key=lambda i: entries[i]["changed_ratio"], reverse=True)[: min(15, len(entries))]
    selected.sort()
    thumbs = []
    for index in selected:
        image = Image.open(annotated_paths[index]).convert("RGB")
        image.thumbnail((320, 200))
        canvas = Image.new("RGB", (320, 230), (12, 12, 12))
        canvas.paste(image, ((320 - image.width) // 2, 0))
        ImageDraw.Draw(canvas).text((8, 205), f"frame {entries[index]['frame']}  change {entries[index]['changed_ratio']:.4f}", fill=(238, 238, 238))
        thumbs.append(canvas)
    rows = (len(thumbs) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * 320, rows * 230), (8, 8, 8))
    for index, thumb in enumerate(thumbs):
        sheet.paste(thumb, ((index % columns) * 320, (index // columns) * 230))
    sheet.save(output)


def main():
    args = parse_args()
    frame_paths = sorted(Path(args.frames).glob(args.glob))
    if len(frame_paths) < 2:
        raise SystemExit("At least two frames are required")
    output = Path(args.output)
    annotated_dir = output / "annotated-frames"
    diff_dir = output / "differences"
    annotated_dir.mkdir(parents=True, exist_ok=True)
    diff_dir.mkdir(parents=True, exist_ok=True)
    timestamps = load_timestamps(args.timestamps)
    entries = []
    annotated_paths = []

    for index in range(1, len(frame_paths)):
        previous_full = Image.open(frame_paths[index - 1]).convert("RGB")
        current_full = Image.open(frame_paths[index]).convert("RGB")
        if previous_full.size != current_full.size:
            raise SystemExit(f"Frame size changed at {frame_paths[index].name}")
        crop = args.crop or [0, 0, current_full.width, current_full.height]
        previous = previous_full.crop(crop)
        current = current_full.crop(crop)
        diff = ImageChops.difference(previous, current)
        gray = ImageOps.grayscale(diff)
        mask = threshold_mask(gray, args.pixel_threshold)
        mask_draw = ImageDraw.Draw(mask)
        for box in args.ignore_box:
            local = [box[0] - crop[0], box[1] - crop[1], box[2] - crop[0], box[3] - crop[1]]
            mask_draw.rectangle(local, fill=0)
        changed = count_white(mask)
        bbox = mask.getbbox()
        ratio = changed / max(1, mask.width * mask.height)
        extra = optional_metrics(previous, current, mask)
        extra["regions"] = [region for region in extra["regions"] if region["area"] >= args.minimum_region_area]

        annotation = current.copy()
        draw = ImageDraw.Draw(annotation)
        if bbox:
            draw.rectangle(bbox, outline=(255, 70, 70), width=2)
        for region in extra["regions"]:
            draw.rectangle(region["box"], outline=(255, 170, 0), width=1)
        timestamp = timestamps.get(index, {}).get("timestamp_seconds")
        label = f"frame {index}  t={timestamp or 'unknown'}  changed={ratio:.5f}"
        draw.rectangle((0, 0, min(annotation.width, 520), 22), fill=(0, 0, 0))
        draw.text((6, 5), label, fill=(255, 255, 255))

        annotated_path = annotated_dir / f"frame-{index:06d}.png"
        annotation.save(annotated_path)
        mask.save(diff_dir / f"diff-{index:06d}.png")
        annotated_paths.append(annotated_path)
        entries.append({
            "frame": index,
            "file": frame_paths[index].name,
            "timestamp_seconds": timestamp,
            "changed_pixels": changed,
            "changed_ratio": round(ratio, 8),
            "motion_box": list(bbox) if bbox else None,
            **extra,
        })

    output.mkdir(parents=True, exist_ok=True)
    report = {
        "frames_analyzed": len(entries),
        "crop": args.crop,
        "ignore_boxes": args.ignore_box,
        "pixel_threshold": args.pixel_threshold,
        "opencv_available": cv2 is not None,
        "ssim_available": structural_similarity is not None,
        "timeline": entries,
    }
    (output / "motion-report.json").write_text(json.dumps(report, indent=2) + "\n")
    create_contact_sheet(entries, annotated_paths, output / "contact-sheet.png", args.contact_columns)
    print(json.dumps({
        "frames_analyzed": len(entries),
        "peak_changed_ratio": max(entry["changed_ratio"] for entry in entries),
        "output": str(output.resolve()),
        "opencv_available": cv2 is not None,
        "ssim_available": structural_similarity is not None,
    }, indent=2))


if __name__ == "__main__":
    main()
