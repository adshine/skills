# Sensor Library (Deterministic Verification Commands)

A **sensor** is a shell command attached to a finding whose exit code answers one question: is this specific defect fixed? Exit 0 means fixed, nonzero means still broken. Sensors make findings re-checkable without rediscovery and are the backbone of `--recheck`, `--fix`, and `--gate`.

Rules:

1. **Precondition:** a sensor MUST fail against the unfixed site before it is recorded. A sensor that passes on day one proves nothing.
2. **Sensors verify, scripts discover.** The Python scripts in `scripts/` sweep for unknown problems; a sensor re-checks one known problem. Write the narrowest command that isolates the finding.
3. **Prefer a sensor as the receipt** where one exists (see [evidence-standards.md](evidence-standards.md)); a screenshot proves it happened once, a sensor proves it stays fixed.
4. **Fix-class honesty:** only `auto` findings may be closed by a sensor alone. `assisted` needs a human confirming the sensor tested the right thing. `manual` findings (content truth, brand tone, legal interpretation) never get sensors; a human closes them.

## Sensor Patterns by Bucket

| Buckets | Sensor pattern | Example |
| :--- | :--- | :--- |
| 16 (headers) | curl + grep for the exact header | `curl -sI "$URL" \| grep -qi '^content-security-policy:.*frame-ancestors'` |
| 16 (SRI) | fetch HTML, assert integrity attr on the named script | `curl -s "$URL" \| grep -q 'cdn.example.net/lib.js" integrity='` |
| 11 (a11y, DOM-checkable) | axe-core scoped to the failing rule | `npx @axe-core/cli "$URL" --rules label --exit` |
| 12 (SEO artifacts) | fetch + assert the tag | `curl -s "$URL" \| grep -q '<link rel="canonical" href="https://example.com/pricing"'` |
| 12 (schema) | re-run extraction, assert type present | `python3 scripts/crawl_audit.py --url "$URL" --max-pages 1 \| grep -q '"Product"'` |
| 17 (AI access) | robots re-check for the named bot | `python3 scripts/robots_ai_check.py --url "$ORIGIN" \| grep -q '"GPTBot": "allowed"'` |
| 10 (perf, lab-checkable) | Lighthouse budget assertion | `npx lighthouse "$URL" --only-audits=largest-contentful-paint --output=json --quiet \| python3 -c "import json,sys;d=json.load(sys.stdin);sys.exit(0 if d['audits']['largest-contentful-paint']['numericValue']<=2500 else 1)"` |
| 6 (overflow) | overflow probe on the fixed viewport | `python3 scripts/browser_audit.py --url "$URL" --overflow \| grep -q '"overflow": false'` |
| 14 (GPC) | GPC replay, assert tracker silent | `python3 scripts/browser_audit.py --url "$URL" --gpc \| grep -qv 'facebook.com/tr'` |
| 2, 3, 7, 8 (flows) | usually `assisted`: a Playwright snippet reproducing the exact interaction, human-confirmed | scripted click-through asserting the promo error renders inline |
| 1, 4, 9 (judgement) | `manual`: no sensor; human closes | n/a |

Tool degradation: if a sensor's tool is missing (no axe, no lighthouse), mark the finding `assisted` and say so; never silently skip. When recording a sensor in findings.json, capture its failing output at discovery time as the evidence receipt.
