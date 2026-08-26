#!/usr/bin/env python3
"""Extract real encoded video frames and preserve their source timestamps."""

import argparse
import csv
import json
import shutil
import subprocess
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(description="Extract encoded frames without inventing intermediate states.")
    parser.add_argument("--video", required=True, help="Input browser recording")
    parser.add_argument("--output", required=True, help="Output directory")
    parser.add_argument("--prefix", default="frame", help="Output frame prefix")
    return parser.parse_args()


def require_binary(name):
    path = shutil.which(name)
    if not path:
        raise SystemExit(f"Required binary not found: {name}")
    return path


def run(command):
    return subprocess.run(command, check=True, text=True, capture_output=True)


def main():
    args = parse_args()
    video = Path(args.video).resolve()
    output = Path(args.output).resolve()
    frames_dir = output / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    ffmpeg = require_binary("ffmpeg")
    ffprobe = require_binary("ffprobe")

    probe = run([
        ffprobe, "-v", "error", "-select_streams", "v:0",
        "-show_entries", "frame=best_effort_timestamp_time,pkt_duration_time,key_frame,pict_type",
        "-of", "json", str(video),
    ])
    source_frames = json.loads(probe.stdout).get("frames", [])

    pattern = frames_dir / f"{args.prefix}-%06d.png"
    run([
        ffmpeg, "-hide_banner", "-loglevel", "error", "-i", str(video),
        "-map", "0:v:0", "-fps_mode", "passthrough", str(pattern),
    ])
    images = sorted(frames_dir.glob(f"{args.prefix}-*.png"))

    rows = []
    for index, image in enumerate(images):
        source = source_frames[index] if index < len(source_frames) else {}
        rows.append({
            "index": index,
            "file": image.name,
            "timestamp_seconds": source.get("best_effort_timestamp_time"),
            "duration_seconds": source.get("pkt_duration_time"),
            "key_frame": source.get("key_frame"),
            "picture_type": source.get("pict_type"),
        })

    with (output / "frame-timestamps.csv").open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=rows[0].keys() if rows else ["index", "file"])
        writer.writeheader()
        writer.writerows(rows)
    (output / "frame-timestamps.json").write_text(json.dumps(rows, indent=2) + "\n")
    print(json.dumps({"video": str(video), "frames": len(images), "output": str(output)}, indent=2))


if __name__ == "__main__":
    main()
