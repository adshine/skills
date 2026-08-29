#!/usr/bin/env python3
"""Audit robots.txt AI-crawler rules and per-page snippet/index directives. Bucket 17 collector.

Example:
  python3 robots_ai_check.py --url https://example.com --pages /pricing,/blog --out robots.json
"""

import argparse
import json
import re
from urllib.parse import urlparse

import requests

UA = {"User-Agent": "website-audit-skill/1.0"}
AI_BOTS = ["GPTBot", "ClaudeBot", "PerplexityBot", "Google-Extended", "OAI-SearchBot", "CCBot"]
SEARCH_BOTS = ["Googlebot", "Bingbot"]


def parse_robots(text):
    """Return {agent_lower: {'allow': [...], 'disallow': [...], 'lines': [...]}}."""
    groups, current = {}, []
    for raw in text.splitlines():
        line = raw.split("#")[0].strip()
        if not line:
            continue
        m = re.match(r"(?i)^(user-agent|allow|disallow)\s*:\s*(.*)$", line)
        if not m:
            continue
        key, val = m.group(1).lower(), m.group(2).strip()
        if key == "user-agent":
            agent = val.lower()
            groups.setdefault(agent, {"allow": [], "disallow": [], "lines": []})
            groups[agent]["lines"].append(raw)
            current = [agent]
        elif current:
            for agent in current:
                groups[agent][key].append(val)
                groups[agent]["lines"].append(raw)
    return groups


def classify(bot, groups):
    g = groups.get(bot.lower()) or groups.get("*")
    src = bot.lower() if bot.lower() in groups else ("*" if "*" in groups else None)
    if not g:
        return "allowed", "no matching rules"
    dis = g["disallow"]
    if "/" in dis:
        return "blocked", "\n".join(g["lines"])
    if any(d for d in dis):
        return "partial", "\n".join(g["lines"])
    return "allowed", f"rules under User-agent: {src}" if src else "no rules"


def page_directives(url):
    try:
        r = requests.get(url, headers=UA, timeout=15)
    except requests.RequestException as e:
        return {"url": url, "error": str(e)}
    directives = []
    xr = r.headers.get("x-robots-tag")
    if xr:
        directives.append(f"x-robots-tag: {xr}")
    for m in re.finditer(r'<meta[^>]+name=["\']robots["\'][^>]*>', r.text, re.I):
        directives.append(m.group(0))
    flags = " ".join(directives).lower()
    return {"url": url, "directives": directives,
            "noindex": "noindex" in flags, "nosnippet": "nosnippet" in flags,
            "max_snippet": ("max-snippet" in flags)}


def main():
    p = argparse.ArgumentParser(description="AI crawler access audit")
    p.add_argument("--url", required=True, help="site origin")
    p.add_argument("--pages", default="", help="comma-separated paths to check for meta directives (max 5)")
    p.add_argument("--out")
    args = p.parse_args()

    u = urlparse(args.url)
    base = f"{u.scheme}://{u.netloc}"
    try:
        rob = requests.get(f"{base}/robots.txt", headers=UA, timeout=15)
        robots_text = rob.text if rob.status_code == 200 else ""
    except requests.RequestException:
        robots_text = ""

    groups = parse_robots(robots_text)
    bots = {}
    for bot in AI_BOTS + SEARCH_BOTS:
        status, evidence = classify(bot, groups)
        bots[bot] = {"status": status, "evidence": evidence}

    pages = [base + "/"] + [base + p.strip() for p in args.pages.split(",") if p.strip()][:5]
    page_results = [page_directives(pg) for pg in pages]

    findings = []
    blocked_ai = [b for b in AI_BOTS if bots[b]["status"] == "blocked"]
    if blocked_ai:
        findings.append({"page": "/robots.txt", "bucket": "AI Search Visibility & Answer Readiness",
                         "check": "AI crawler access", "severity_hint": "Medium",
                         "found": f"AI crawlers fully blocked: {', '.join(blocked_ai)}",
                         "evidence": bots[blocked_ai[0]]["evidence"],
                         "expected": "blocking is a confirmed deliberate business decision, not an accident"})
    for pr in page_results:
        if pr.get("noindex") or pr.get("nosnippet"):
            findings.append({"page": pr["url"], "bucket": "AI Search Visibility & Answer Readiness",
                             "check": "snippet/index eligibility", "severity_hint": "High",
                             "found": "restrictive robots directive on page",
                             "evidence": "; ".join(pr["directives"]),
                             "expected": "indexable and snippet-eligible unless deliberately excluded"})

    result = {"robotsTxtFound": bool(robots_text), "bots": bots, "pages": page_results, "findings": findings}
    out = json.dumps(result, indent=2)
    if args.out:
        with open(args.out, "w") as f:
            f.write(out)
        print(f"{len(findings)} findings -> {args.out}")
    else:
        print(out)


if __name__ == "__main__":
    main()
