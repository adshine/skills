#!/usr/bin/env python3
"""Evaluate security response headers for one or more URLs. Bucket 16 collector.

Example:
  python3 headers_check.py --url https://example.com --url https://example.com/checkout --out headers.json
"""

import argparse
import json
import sys
from urllib.parse import urlparse

import requests

UA = {"User-Agent": "website-audit-skill/1.0"}


def row(page, check, found, evidence, expected, sev="Medium"):
    return {"page": page, "bucket": "Security Hygiene", "check": check, "severity_hint": sev,
            "found": found, "evidence": evidence, "expected": expected}


def check_url(url):
    findings = []
    try:
        r = requests.get(url, headers=UA, timeout=15, allow_redirects=True)
    except requests.RequestException as e:
        return [row(url, "reachability", f"request failed: {e}", str(e), "HTTP 200 response", "High")]
    h = {k.lower(): v for k, v in r.headers.items()}

    csp = h.get("content-security-policy", "")
    if not csp:
        findings.append(row(url, "Content-Security-Policy", "header missing",
                            "no content-security-policy header in response", "CSP present with frame-ancestors"))
    elif "frame-ancestors" not in csp:
        findings.append(row(url, "CSP frame-ancestors", "CSP lacks frame-ancestors directive",
                            f"content-security-policy: {csp[:200]}", "frame-ancestors directive (modern clickjacking control)", "Low"))

    hsts = h.get("strict-transport-security", "")
    if not hsts:
        findings.append(row(url, "Strict-Transport-Security", "header missing",
                            "no strict-transport-security header", "max-age>=31536000; includeSubDomains"))
    else:
        try:
            age = int(hsts.lower().split("max-age=")[1].split(";")[0])
        except (IndexError, ValueError):
            age = 0
        if age < 31536000 or "includesubdomains" not in hsts.lower().replace("-", ""):
            findings.append(row(url, "HSTS strength", "weak HSTS directive",
                                f"strict-transport-security: {hsts}", "max-age>=31536000; includeSubDomains", "Low"))

    if h.get("x-content-type-options", "").lower() != "nosniff":
        findings.append(row(url, "X-Content-Type-Options", "nosniff missing",
                            f"x-content-type-options: {h.get('x-content-type-options', '(absent)')}", "nosniff", "Low"))
    if "permissions-policy" not in h:
        findings.append(row(url, "Permissions-Policy", "header missing",
                            "no permissions-policy header", "restrict unused device APIs, e.g. camera=(), microphone=()", "Low"))
    if "cross-origin-opener-policy" not in h and any(s in url for s in ("login", "signin", "checkout", "account", "auth")):
        findings.append(row(url, "COOP on sensitive surface", "header missing on auth/payment page",
                            "no cross-origin-opener-policy header", "Cross-Origin-Opener-Policy: same-origin", "Low"))
    if "x-frame-options" in h and "frame-ancestors" not in csp:
        findings.append(row(url, "legacy clickjacking control only", "X-Frame-Options without CSP frame-ancestors",
                            f"x-frame-options: {h['x-frame-options']}", "add CSP frame-ancestors; keep XFO for old browsers", "Low"))
    if "referrer-policy" not in h:
        findings.append(row(url, "Referrer-Policy", "header missing",
                            "no referrer-policy header", "strict-origin-when-cross-origin or stricter", "Nit"))
    return findings


def main():
    p = argparse.ArgumentParser(description="Security header audit")
    p.add_argument("--url", action="append", required=True)
    p.add_argument("--out")
    args = p.parse_args()

    findings = []
    for url in args.url:
        findings.extend(check_url(url))

    origin = args.url[0]
    base = f"{urlparse(origin).scheme}://{urlparse(origin).netloc}"
    try:
        st = requests.get(f"{base}/.well-known/security.txt", headers=UA, timeout=10)
        sectxt = st.status_code == 200 and "contact" in st.text.lower()
    except requests.RequestException:
        sectxt = False
    if not sectxt:
        findings.append(row(base, "security.txt (RFC 9116)", "no valid /.well-known/security.txt",
                            "GET /.well-known/security.txt not found or lacks Contact", "published security contact", "Nit"))

    result = {"checked": args.url, "findings": findings}
    out = json.dumps(result, indent=2)
    if args.out:
        with open(args.out, "w") as f:
            f.write(out)
        print(f"{len(findings)} findings -> {args.out}")
    else:
        print(out)


if __name__ == "__main__":
    main()
