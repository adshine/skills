#!/usr/bin/env python3
"""Quality gate and sensor recheck over a findings.json sidecar.

Exit codes: 0 gate passes, 1 gate fails, 2 input error.

Examples:
  python3 audit_gate.py --findings findings.json --milestone blockers
  python3 audit_gate.py --findings findings.json --milestone highs --min-score 7.0
  python3 audit_gate.py --findings findings.json --recheck --base-url https://example.com
"""

import argparse
import json
import os
import subprocess
import sys

OPEN_STATUSES = {"Open", "In Progress", "Needs Human"}
MILESTONES = {"blockers": ["Blocker"], "highs": ["Blocker", "High"]}


def load(path):
    try:
        with open(path) as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError) as e:
        print(f"cannot read findings file: {e}", file=sys.stderr)
        sys.exit(2)


def run_sensors(data, base_url):
    """Re-run every recorded sensor; update statuses in place. Returns list of regressions."""
    changed = []
    env = dict(os.environ)
    if base_url:
        env["URL"] = base_url
        env["ORIGIN"] = base_url
    for f in data.get("findings", []):
        sensor = f.get("sensor", {}).get("cmd")
        if not sensor:
            continue
        try:
            res = subprocess.run(sensor, shell=True, env=env, capture_output=True,
                                 text=True, timeout=120)
            passed = res.returncode == 0
            output = (res.stdout + res.stderr).strip()[:500]
        except subprocess.TimeoutExpired:
            passed, output = False, "sensor timed out after 120s"
        prev = f.get("status")
        if passed and prev in OPEN_STATUSES:
            f["status"] = "Verified Fixed"
            changed.append((f["id"], "fixed", output))
        elif not passed and prev == "Verified Fixed":
            f["status"] = "Open"
            changed.append((f["id"], "REGRESSION", output))
        print(f"  {f['id']}: {'pass' if passed else 'FAIL'} ({f.get('check', '')})")
    return changed


def main():
    p = argparse.ArgumentParser(description="Audit quality gate")
    p.add_argument("--findings", required=True)
    p.add_argument("--milestone", choices=list(MILESTONES), default="blockers")
    p.add_argument("--min-score", type=float, default=None,
                   help="fail if any pillar score in --scorecard output is below this")
    p.add_argument("--scorecard", help="path to compute_scorecard.py JSON output")
    p.add_argument("--recheck", action="store_true", help="re-run all sensors and update statuses")
    p.add_argument("--base-url", default=None)
    p.add_argument("--write", action="store_true", help="with --recheck, write updated statuses back")
    args = p.parse_args()

    data = load(args.findings)
    failures = []

    if args.recheck:
        changed = run_sensors(data, args.base_url)
        for fid, what, output in changed:
            line = f"{fid}: {what}"
            print(line)
            if what == "REGRESSION":
                failures.append(line + (f" | {output}" if output else ""))
        if args.write:
            with open(args.findings, "w") as f:
                json.dump(data, f, indent=2)

    gate_sevs = MILESTONES[args.milestone]
    open_gated = [f for f in data.get("findings", [])
                  if f.get("severity") in gate_sevs and f.get("status") in OPEN_STATUSES]
    for f in open_gated:
        failures.append(f"{f['id']} ({f['severity']}) still open: {f.get('check', '')} on {f.get('page', '')}")

    if args.min_score is not None:
        if not args.scorecard:
            print("--min-score requires --scorecard (output of compute_scorecard.py)", file=sys.stderr)
            sys.exit(2)
        card = load(args.scorecard)
        for page, pillars in card.get("pages", {}).items():
            for pillar, score in pillars.items():
                if isinstance(score, (int, float)) and score < args.min_score:
                    failures.append(f"{page} / {pillar} scored {score} < {args.min_score}")

    if failures:
        print(f"\nGATE FAILED ({args.milestone}):")
        for line in failures:
            print(f"  - {line}")
        sys.exit(1)
    print(f"\nGATE PASSED ({args.milestone})")
    sys.exit(0)


if __name__ == "__main__":
    main()
