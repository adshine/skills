# Audit Scripts

Deps: `pip install requests playwright && playwright install chromium`. All scripts: `--out <path>` writes JSON, otherwise stdout. Findings rows use: page, bucket, check, severity_hint, found, evidence, expected. `severity_hint` is a suggestion; the agent assigns final severity per the rubric.

| Script | Purpose | Example |
| :--- | :--- | :--- |
| `compute_scorecard.py` | The ONLY allowed source of scorecard numbers. Pillar/page/site scores from findings.json. | `python3 compute_scorecard.py --findings findings.json --money-path /,/pricing,/checkout --markdown` |
| `crawl_audit.py` | BFS same-origin crawl: link health, redirect chains, titles/metas/canonicals, OG, JSON-LD, sitemap 404s, orphans. | `python3 crawl_audit.py --url https://example.com --max-pages 50 --out crawl.json` |
| `headers_check.py` | Security headers (CSP frame-ancestors, HSTS, nosniff, Permissions-Policy, COOP) + security.txt. | `python3 headers_check.py --url https://example.com --url https://example.com/checkout` |
| `robots_ai_check.py` | AI crawler access in robots.txt + per-page noindex/nosnippet directives. | `python3 robots_ai_check.py --url https://example.com --pages /pricing,/blog` |
| `crux_fetch.py` | Real-user p75 LCP/INP/CLS from the CrUX API. Needed for High/Blocker INP findings. | `CRUX_API_KEY=... python3 crux_fetch.py --url https://example.com` |
| `browser_audit.py` | Playwright: viewport screenshots, 390px overflow, tab-order walk (focus obscured/invisible/traps), GPC replay, console errors. | `python3 browser_audit.py --url https://example.com/pricing --artifacts ./artifacts` |
| `audit_gate.py` | Quality gate + sensor recheck over findings.json. Exits nonzero on open Blockers/Highs or regressions. | `python3 audit_gate.py --findings findings.json --milestone blockers --recheck` |
