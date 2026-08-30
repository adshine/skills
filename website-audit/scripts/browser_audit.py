#!/usr/bin/env python3
"""Playwright browser audit: screenshots, overflow, tab-order, GPC replay, console. Buckets 6, 7, 11, 14 collector.

Example:
  python3 browser_audit.py --url https://example.com/pricing --artifacts ./artifacts --out browser.json
"""

import argparse
import json
import re
import time
from pathlib import Path
from urllib.parse import urlparse

from playwright.sync_api import sync_playwright

VIEWPORTS = [(390, 844), (768, 1024), (1440, 900)]
TRACKERS = ["google-analytics.com", "analytics.google.com", "facebook.com/tr", "connect.facebook.net",
            "doubleclick.net", "tiktok.com", "snapchat.com", "hotjar.com", "clarity.ms"]


def slugify(url):
    path = urlparse(url).path.strip("/") or "home"
    return re.sub(r"[^a-z0-9]+", "-", path.lower()).strip("-")[:60]


def finding(page, bucket, check, sev, found, evidence, expected):
    return {"page": page, "bucket": bucket, "check": check, "severity_hint": sev,
            "found": found, "evidence": evidence, "expected": expected}


def audit_url(pw, url, artifacts, do, findings):
    slug = slugify(url)
    result = {"url": url, "screenshots": [], "overflow": None, "tabOrder": [], "gpc": None, "console": []}
    browser = pw.chromium.launch()
    t0 = time.time()

    try:
        if do["screenshots"] or do["overflow"] or do["console"] or do["tab_order"] or do["hover"]:
            ctx = browser.new_context(viewport={"width": 390, "height": 844})
            page = ctx.new_page()
            errors = []
            page.on("console", lambda m: errors.append(f"console.{m.type}: {m.text}") if m.type == "error" else None)
            page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
            page.goto(url, wait_until="networkidle", timeout=45000)

            if do["overflow"]:
                try:
                    ov = page.evaluate("""() => {
                        const d = document.scrollingElement;
                        if (d.scrollWidth <= d.clientWidth + 1) return {overflow: false};
                        let widest = null, max = 0;
                        for (const el of document.querySelectorAll('body *')) {
                            const r = el.getBoundingClientRect();
                            if (r.width > max && r.width > d.clientWidth) { max = r.width; widest = el; }
                        }
                        const sel = widest ? widest.tagName.toLowerCase() +
                            (widest.id ? '#' + widest.id : '') +
                            (widest.className && typeof widest.className === 'string' ? '.' + widest.className.trim().split(/\\s+/).slice(0,2).join('.') : '') : null;
                        return {overflow: true, scrollWidth: d.scrollWidth, clientWidth: d.clientWidth, widest: sel, widestWidth: max};
                    }""")
                    result["overflow"] = ov
                    if ov.get("overflow"):
                        findings.append(finding(url, "Visual, Layout & Responsive Design", "horizontal overflow at 390px",
                                                "Medium", f"scrollWidth {ov['scrollWidth']} > viewport {ov['clientWidth']}; widest: {ov.get('widest')}",
                                                f"browser_audit overflow probe on {url} at 390x844",
                                                "no horizontal scroll on mobile viewport"))
                except Exception as e:
                    result["overflow"] = {"error": str(e)}

            if do["screenshots"]:
                for w, h in VIEWPORTS:
                    try:
                        page.set_viewport_size({"width": w, "height": h})
                        page.wait_for_timeout(400)
                        shot = str(Path(artifacts) / f"{slug}-{w}.png")
                        page.screenshot(path=shot, full_page=False)
                        result["screenshots"].append(shot)
                    except Exception as e:
                        result["screenshots"].append(f"error at {w}: {e}")

            if do["tab_order"]:
                try:
                    page.set_viewport_size({"width": 1440, "height": 900})
                    page.wait_for_timeout(300)
                    prev, repeat, distinct = None, 0, set()
                    for i in range(40):
                        page.keyboard.press("Tab")
                        info = page.evaluate("""() => {
                            const el = document.activeElement;
                            if (!el || el === document.body) return null;
                            const r = el.getBoundingClientRect();
                            const cs = getComputedStyle(el);
                            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
                            const top = document.elementFromPoint(cx, cy);
                            let obscured = false, obscuredBy = null;
                            if (top && top !== el && !el.contains(top) && !top.contains(el)) {
                                const ts = getComputedStyle(top);
                                if (ts.position === 'fixed' || ts.position === 'sticky') { obscured = true; obscuredBy = top.tagName.toLowerCase() + (top.id ? '#' + top.id : ''); }
                            }
                            const sel = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '');
                            const noOutline = cs.outlineStyle === 'none' && !cs.boxShadow.includes('rgb');
                            return {sel, obscured, obscuredBy, noOutline, visible: r.width > 0 && r.height > 0};
                        }""")
                        if info is None:
                            continue
                        result["tabOrder"].append(info)
                        distinct.add(info["sel"])
                        if info["sel"] == prev:
                            repeat += 1
                            if repeat >= 2 and len(distinct) >= 2:
                                findings.append(finding(url, "Accessibility (a11y) & Legal Compliance", "keyboard focus trap",
                                                        "High", f"focus stuck on {info['sel']} for 3+ Tab presses",
                                                        f"browser_audit tab-order walk step {i}", "Tab always advances focus"))
                                break
                        else:
                            repeat, prev = 0, info["sel"]
                        if info["obscured"]:
                            findings.append(finding(url, "Accessibility (a11y) & Legal Compliance", "focus obscured (WCAG 2.4.11)",
                                                    "Medium", f"{info['sel']} focused but covered by {info['obscuredBy']}",
                                                    f"browser_audit tab-order walk step {i}", "focused element fully visible"))
                        if info["noOutline"] and info["visible"]:
                            findings.append(finding(url, "Accessibility (a11y) & Legal Compliance", "focus indicator invisible",
                                                    "Medium", f"{info['sel']} has outline:none and no box-shadow on focus",
                                                    f"browser_audit tab-order walk step {i}", "visible focus indicator"))
                except Exception as e:
                    result["tabOrder"].append({"error": str(e)})

            if do["hover"]:
                try:
                    page.set_viewport_size({"width": 1440, "height": 900})
                    page.wait_for_timeout(300)
                    handles = page.query_selector_all(
                        "[class*=portfolio], [class*=card], [class*=team-item], [class*=case], nav li")
                    checked, flagged_sigs = 0, set()
                    for h in handles:
                        if checked >= 8:
                            break
                        box = h.bounding_box()
                        if not box or not (120 <= box["width"] <= 800 and 100 <= box["height"] <= 650):
                            continue
                        sig = h.evaluate("el => el.tagName + '|' + (el.className||'').toString().trim().split(/\\s+/).slice(0,2).join('.')")
                        if sig in flagged_sigs:
                            continue
                        checked += 1
                        h.scroll_into_view_if_needed()
                        page.wait_for_timeout(200)

                        def sample():
                            return page.evaluate("""(b) => {
                                const pts = [];
                                for (let i = 1; i <= 3; i++) for (let j = 1; j <= 3; j++) {
                                    const el = document.elementFromPoint(b.x + b.width*i/4, b.y + b.height*j/4);
                                    pts.push(el ? el.tagName + '.' + (el.className || '') : '');
                                }
                                return pts;
                            }""", h.bounding_box())

                        def style_state():
                            return h.evaluate("""el => {
                                const out = [];
                                for (const c of el.querySelectorAll('*')) {
                                    const cs = getComputedStyle(c);
                                    const txt = (c.textContent || '').trim();
                                    if (txt.length > 2 || c.tagName === 'A')
                                        out.push([+(parseFloat(cs.opacity) > 0.5 && cs.visibility === 'visible' && cs.display !== 'none'), txt.slice(0, 30)]);
                                    if (out.length >= 40) break;
                                }
                                return out;
                            }""")

                        before, sty_before = sample(), style_state()
                        b2 = h.bounding_box()
                        page.mouse.move(b2["x"] + b2["width"] / 2, b2["y"] + b2["height"] / 2)
                        page.wait_for_timeout(500)
                        after, sty_after = sample(), style_state()
                        changed = sum(1 for a, a2 in zip(before, after) if a != a2)
                        revealed = sum(1 for (v1, t1), (v2, t2) in zip(sty_before, sty_after)
                                       if t1 == t2 and v1 == 0 and v2 == 1)
                        if changed >= 4 or revealed >= 1:
                            flagged_sigs.add(sig)
                            sel = h.evaluate("el => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).slice(0,2).join('.') : '')")
                            findings.append(finding(url, "Interaction & Controls", "hover-revealed content",
                                                    "Medium", f"{sel}: hover changes content ({changed}/9 hit-test points changed, {revealed} text/link elements became visible); hover-gated overlay means titles/links are invisible without a mouse, i.e. on all touch devices",
                                                    f"browser_audit hover sweep on {url}",
                                                    "essential content visible without hover"))
                        page.mouse.move(0, 0)
                except Exception as e:
                    result.setdefault("hoverErrors", []).append(str(e)[:120])

            if do["console"] and errors:
                result["console"] = errors[:20]
                findings.append(finding(url, "Interaction & Controls", "console errors on load", "Low",
                                        f"{len(errors)} console/page errors during load", "; ".join(errors[:3]),
                                        "clean console on page load"))
            ctx.close()

        if do["gpc"]:
            try:
                def collect_hosts(context_kwargs, init_gpc):
                    ctx2 = browser.new_context(**context_kwargs)
                    if init_gpc:
                        ctx2.add_init_script("Object.defineProperty(navigator,'globalPrivacyControl',{get:()=>true});")
                    pg = ctx2.new_page()
                    hosts = set()
                    pg.on("request", lambda r: hosts.add(urlparse(r.url).netloc + urlparse(r.url).path[:20]))
                    pg.goto(url, wait_until="networkidle", timeout=45000)
                    pg.wait_for_timeout(2000)
                    ctx2.close()
                    return hosts

                before = collect_hosts({}, False)
                after = collect_hosts({"extra_http_headers": {"Sec-GPC": "1"}}, True)
                still = sorted({h for h in after if any(t in h for t in TRACKERS)})
                result["gpc"] = {"trackersBeforeGpc": sorted({h for h in before if any(t in h for t in TRACKERS)}),
                                 "trackersWithGpc": still}
                if still:
                    findings.append(finding(url, "Trust, Privacy & Legal", "GPC signal not honored", "Medium",
                                            f"trackers still fire with Sec-GPC: 1: {', '.join(still[:5])}",
                                            "browser_audit GPC replay (header + navigator.globalPrivacyControl)",
                                            "sale/share processing stops under GPC (required by CA, CO, CT, TX and others)"))
            except Exception as e:
                result["gpc"] = {"error": str(e)}
    finally:
        browser.close()
    result["seconds"] = round(time.time() - t0, 1)
    return result


def main():
    p = argparse.ArgumentParser(description="Playwright browser audit")
    p.add_argument("--url", action="append", required=True)
    p.add_argument("--artifacts", default="./artifacts")
    for flag in ("screenshots", "overflow", "tab-order", "gpc", "console", "hover"):
        p.add_argument(f"--{flag}", action="store_true")
    p.add_argument("--out")
    args = p.parse_args()

    chosen = {k: getattr(args, k) for k in ("screenshots", "overflow", "tab_order", "gpc", "console", "hover")}
    if not any(chosen.values()):
        chosen = {k: True for k in chosen}

    Path(args.artifacts).mkdir(parents=True, exist_ok=True)
    findings, results = [], []
    with sync_playwright() as pw:
        for url in args.url:
            results.append(audit_url(pw, url, args.artifacts, chosen, findings))

    out = json.dumps({"results": results, "findings": findings}, indent=2)
    if args.out:
        with open(args.out, "w") as f:
            f.write(out)
        print(f"{len(findings)} findings -> {args.out}")
    else:
        print(out)


if __name__ == "__main__":
    main()
