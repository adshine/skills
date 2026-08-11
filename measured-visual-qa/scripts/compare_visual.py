#!/usr/bin/env python3
"""Compare two reports produced by measure_visual.py."""

import argparse
import json
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(description="Compare before and after visual measurements.")
    parser.add_argument("--before", required=True, help="Before report JSON")
    parser.add_argument("--after", required=True, help="After report JSON")
    parser.add_argument("--geometry-tolerance", type=float, default=1.0)
    parser.add_argument("--glyph-tolerance", type=float, default=2.0)
    return parser.parse_args()


def region_map(report):
    return {region["name"]: region for region in report.get("regions", [])}


def main():
    args = parse_args()
    before = json.loads(Path(args.before).read_text())
    after = json.loads(Path(args.after).read_text())
    findings = []

    b_rules = before.get("horizontal_rules", {})
    a_rules = after.get("horizontal_rules", {})
    if b_rules and a_rules:
        findings.append({
            "metric": "horizontal_rule_interval_spread",
            "before": b_rules.get("interval_spread", 0),
            "after": a_rules.get("interval_spread", 0),
            "passed": a_rules.get("interval_spread", 0) <= args.geometry_tolerance,
        })

    before_regions = region_map(before)
    after_regions = region_map(after)
    for name in sorted(before_regions.keys() & after_regions.keys()):
        bp = before_regions[name].get("painted")
        ap = after_regions[name].get("painted")
        if not bp or not ap:
            findings.append({"metric": f"region:{name}", "passed": False, "reason": "missing painted pixels"})
            continue
        dx = round(ap["center"][0] - bp["center"][0], 2)
        dy = round(ap["center"][1] - bp["center"][1], 2)
        findings.append({
            "metric": f"region:{name}:center_shift",
            "delta": [dx, dy],
            "passed": abs(dx) <= args.glyph_tolerance and abs(dy) <= args.glyph_tolerance,
        })

    result = {"passed": bool(findings) and all(item["passed"] for item in findings), "findings": findings}
    print(json.dumps(result, indent=2))
    raise SystemExit(0 if result["passed"] else 1)


if __name__ == "__main__":
    main()
