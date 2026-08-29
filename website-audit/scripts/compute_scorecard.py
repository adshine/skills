#!/usr/bin/env python3
"""Compute per-page pillar scores and the weighted site score from a findings.json sidecar.

This script is the ONLY allowed source of scorecard numbers.

Example:
  python3 compute_scorecard.py --findings findings.json --money-path /,/pricing,/signup,/checkout --markdown
"""

import argparse
import json
import sys

PILLARS = ["Find & Convert", "Content & Trust", "Design & Interaction", "Speed & A11y", "Technical Hygiene"]
DEDUCTIONS = {"Blocker": 3.0, "High": 2.0, "Medium": 1.0, "Low": 0.3, "Nit": 0.0}
OPEN_STATUSES = {"Open", "In Progress", "Needs Human"}


def grade(score):
    if score >= 9.0:
        return "A"
    if score >= 7.5:
        return "B"
    if score >= 5.0:
        return "C"
    if score >= 3.0:
        return "D"
    return "F"


def main():
    p = argparse.ArgumentParser(description="Scorecard calculator")
    p.add_argument("--findings", required=True, help="findings.json (object with findings[], or bare array)")
    p.add_argument("--money-path", default="", help="comma-separated pages weighted 2.0")
    p.add_argument("--markdown", action="store_true", help="also print a markdown table")
    p.add_argument("--out", help="write JSON result to this path instead of stdout")
    args = p.parse_args()

    try:
        with open(args.findings) as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError) as e:
        print(f"cannot read findings: {e}", file=sys.stderr)
        sys.exit(2)

    findings = data if isinstance(data, list) else data.get("findings", [])
    money = {s.strip() for s in args.money_path.split(",") if s.strip()}
    if not money and isinstance(data, dict):
        money = set(data.get("moneyPath", []))

    pages = {}
    for f in findings:
        page, pillar, sev = f.get("page"), f.get("pillar"), f.get("severity")
        if f.get("status") not in OPEN_STATUSES:
            continue
        if pillar not in PILLARS:
            print(f"warning: {f.get('id')} has unknown pillar '{pillar}', skipped", file=sys.stderr)
            continue
        pages.setdefault(page, {pl: 0.0 for pl in PILLARS})
        pages[page][pillar] += DEDUCTIONS.get(sev, 0.0)

    result = {"pages": {}, "pageHealth": {}, "site": {}}
    weighted_sum, weight_total = 0.0, 0.0
    for page, deductions in sorted(pages.items()):
        scores = {pl: round(max(1.0, 10.0 - d), 1) for pl, d in deductions.items()}
        health = round(sum(scores.values()) / len(PILLARS), 1)
        result["pages"][page] = scores
        result["pageHealth"][page] = {"score": health, "grade": grade(health)}
        w = 2.0 if page in money else 1.0
        weighted_sum += health * w
        weight_total += w

    site = round(weighted_sum / weight_total, 1) if weight_total else None
    result["site"] = {"score": site, "grade": grade(site) if site is not None else None,
                      "moneyPath": sorted(money)}

    out_json = json.dumps(result, indent=2)
    if args.out:
        with open(args.out, "w") as f:
            f.write(out_json)
    else:
        print(out_json)

    if args.markdown:
        hdr = "| Page | " + " | ".join(PILLARS) + " | Health | Grade |"
        sep = "|" + " :--- |" * (len(PILLARS) + 3)
        print("\n" + hdr + "\n" + sep)
        for page, scores in result["pages"].items():
            h = result["pageHealth"][page]
            cells = " | ".join(f"{scores[pl]:.1f}" for pl in PILLARS)
            print(f"| {page} | {cells} | {h['score']:.1f} | {h['grade']} |")
        if site is not None:
            print(f"\nSite score (money path 2x): **{site:.1f} ({result['site']['grade']})**")


if __name__ == "__main__":
    main()
