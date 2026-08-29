#!/usr/bin/env python3
"""Fetch real-user Core Web Vitals (p75) from the Chrome UX Report API. Bucket 10 field data.

Required by the field-vs-lab rule: INP findings at High/Blocker severity need this
(or equivalent RUM). Without field data, lab-only responsiveness findings cap at Medium.

Example:
  CRUX_API_KEY=... python3 crux_fetch.py --url https://example.com --out crux.json
"""

import argparse
import json
import os
import sys

import requests

API = "https://chromeuserexperience.googleapis.com/v1/records:queryRecord"
METRICS = {
    "largest_contentful_paint": ("LCP", 2500, 4000, "ms"),
    "interaction_to_next_paint": ("INP", 200, 500, "ms"),
    "cumulative_layout_shift": ("CLS", 0.1, 0.25, ""),
}


def classify(value, good, poor):
    if value <= good:
        return "good"
    if value <= poor:
        return "needs-improvement"
    return "poor"


def main():
    p = argparse.ArgumentParser(description="CrUX field data fetcher")
    p.add_argument("--url", required=True, help="origin, e.g. https://example.com")
    p.add_argument("--api-key", default=os.environ.get("CRUX_API_KEY"))
    p.add_argument("--out")
    args = p.parse_args()

    if not args.api_key:
        result = {"fieldDataAvailable": False, "reason": "no CRUX_API_KEY provided",
                  "rule": "lab-only severity capping applies: INP findings cap at Medium (see evidence-standards.md)"}
        print(json.dumps(result, indent=2))
        sys.exit(0)

    result = {"origin": args.url, "fieldDataAvailable": True, "formFactors": {}}
    for ff in ("PHONE", "DESKTOP"):
        try:
            r = requests.post(f"{API}?key={args.api_key}",
                              json={"origin": args.url, "formFactor": ff}, timeout=20)
        except requests.RequestException as e:
            result["formFactors"][ff] = {"error": str(e)}
            continue
        if r.status_code == 404:
            result["formFactors"][ff] = {"error": "origin not in CrUX dataset (insufficient traffic)"}
            continue
        if r.status_code != 200:
            result["formFactors"][ff] = {"error": f"HTTP {r.status_code}: {r.text[:200]}"}
            continue
        metrics = r.json().get("record", {}).get("metrics", {})
        out = {}
        for key, (name, good, poor, unit) in METRICS.items():
            m = metrics.get(key, {}).get("percentiles", {}).get("p75")
            if m is None:
                continue
            val = float(m)
            out[name] = {"p75": val, "unit": unit, "rating": classify(val, good, poor)}
        result["formFactors"][ff] = out

    if all("error" in v for v in result["formFactors"].values()):
        result["fieldDataAvailable"] = False
        result["rule"] = "lab-only severity capping applies: INP findings cap at Medium"

    out_json = json.dumps(result, indent=2)
    if args.out:
        with open(args.out, "w") as f:
            f.write(out_json)
        print(f"crux -> {args.out}")
    else:
        print(out_json)


if __name__ == "__main__":
    main()
