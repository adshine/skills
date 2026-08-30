# Execution Playbook (How Evidence Actually Gets Collected)

Three layers, strictly separated:

1. **Collect:** Playwright and HTTP requests capture raw material (screenshots, HAR, headers, HTML, console logs).
2. **Analyze:** Python scripts in `scripts/` turn raw material into facts and numbers.
3. **Judge:** The agent assigns severity, writes findings rows, and authors the two report tracks.

**Core rule: numbers come from code, opinions come from the agent.** Any figure that reaches a report (a score, a count, a p75 latency) must trace back to a script output or captured artifact, never model recall. `scripts/compute_scorecard.py` is the ONLY allowed source of scorecard numbers.

---

## Bucket-to-Method Map

| Buckets | Collection Method | Script / Tool |
| :--- | :--- | :--- |
| 1, 2 (Findability, Conversion) | Browser click-through of the money path + screenshots | `browser_audit.py` + manual agent walkthrough |
| 3 (Forms) | Browser: submit valid, invalid, and empty inputs; observe validation and states | `browser_audit.py --console` + manual |
| 4 (Content truth, E-E-A-T) | Crawl extraction + agent reading of claims, bylines, dates | `crawl_audit.py` + manual |
| 5 (Navigation & IA) | Link sweep for 404s, redirect chains, orphans | `crawl_audit.py` |
| 6 (Visual / responsive) | Screenshots at 390 / 768 / 1440 + overflow detection | `browser_audit.py --screenshots --overflow` |
| 7, 8 (Interaction, States) | Browser click-through; trigger empty, loading, error, success states | `browser_audit.py` + manual |
| 9 (Consistency) | Cross-page screenshot comparison | `browser_audit.py --screenshots` + agent diff |
| 10 (Performance) | Field data first, lab second (see telemetry rule) | `crux_fetch.py`, then Lighthouse |
| 11 (Accessibility) | Tab-order walk (2.4.11 focus obscured, traps, invisible focus) + axe-core + manual paste test on auth (3.3.8) | `browser_audit.py --tab-order`, `npx axe-cli` |
| 12 (SEO, schema, indexation) | Crawl extraction of titles, metas, canonicals, JSON-LD; Search Console if access granted | `crawl_audit.py` |
| 13 (Social share) | Crawl extraction of OG / Twitter tags | `crawl_audit.py` |
| 14 (Privacy, GPC) | GPC header replay; observe tracker behavior before/after | `browser_audit.py --gpc` |
| 15 (Tracking, Consent Mode) | Network capture pre-consent and post-consent | `browser_audit.py --gpc --console` + manual banner interaction |
| 16 (Security) | Header evaluation, security.txt, script inventory with SRI | `headers_check.py` |
| 17 (AI visibility) | robots.txt AI-bot rules + snippet directives + JS-rendering dependence | `robots_ai_check.py`, `crawl_audit.py` |

Setup: `pip install requests playwright && playwright install chromium` (or use an existing install). Save all artifacts under `./artifacts/` and cite exact file paths as evidence receipts.

### Optional Accelerator: Firecrawl (CLI preferred, MCP if exposed)

Probe once at Phase 1 (`firecrawl --version` or key check); if absent, skip silently, the scripts above cover everything. Firecrawl is a COLLECTOR only, never a sensor: sensors must run free, offline, and deterministic or `--recheck`/`--gate` break.

| Task | Firecrawl form | Why / rule |
| :--- | :--- | :--- |
| Route inventory + orphan detection | `firecrawl map <origin> --sitemap skip` diffed against `--sitemap only` | Link-graph vs declared sitemap; orphans and indexation gaps in two commands |
| Raw vs rendered DOM diff (SPA hydration, bucket 12/17) | `curl` HTML vs `firecrawl scrape <url> --format html` | Catches client-side-only titles, canonicals, JSON-LD; the AI-crawler visibility check |
| Full-page screenshot receipts | `firecrawl scrape <url> --format screenshot -o ./artifacts/...` | Complements (not replaces) Playwright viewport shots; Playwright still owns 390/768/1440 and overflow |
| SPA interaction scouting | `firecrawl interact` | Scout only: any Blocker/High it surfaces must be reproduced in Playwright, and the Playwright repro is the receipt |

Hard boundaries: requests where YOUR origin matters (GPC replay, Consent Mode, security headers, TTFB) stay on local curl/Playwright, since Firecrawl fetches from its own infrastructure and geo/consent behavior can differ. Write every Firecrawl payload to `./artifacts/firecrawl/` via `-o` and read back only extracted facts, never raw DOM into context. Watch credits: map + key-page scrapes yes, bulk 50-page screenshot sweeps no (the Python crawler does bulk for free).

---

## Multi-Agent Fan-Out (for orchestrating harnesses)

When the host supports parallel subagents, split by pillar, not by script:

1. **Scout (single agent):** run `crawl_audit.py` to fix the page inventory, then write the cover sheet and scoped-page list. Everything downstream uses this list.
2. **Pillar agents (parallel, one per scorecard pillar):** each collects with the mapped scripts, judges, and returns findings rows in the master-table schema. IDs are assigned by the orchestrator after merge to keep them stable and collision-free.
3. **Verify pass:** every Blocker and High finding is re-reproduced by a different agent (fresh browser session, exact repro steps from the evidence). A finding that fails to reproduce is downgraded or dropped. Nothing unreproduced reaches the executive summary.
4. **Synthesis (single agent):** merge findings, run `compute_scorecard.py`, then author Track 1 and Track 2 from the same findings table.

Solo-agent fallback: run the phases sequentially in the same order; the verify pass still applies to Blockers (reproduce in a fresh browser context before reporting).

---

## The Visual Walkthrough (MANDATORY, not optional)

Scripts cannot see. Broken layouts (empty content bands, collapsed grids, missing images), hover-hidden content, dead language switchers, and template-default tells are invisible to every automated check and obvious to an eye on the page. After the scripted collection:

1. **Screenshot every crawled content page** full-height (desktop) plus the money path at 390px, via `browser_audit.py --screenshots` over the full inventory, not just the money path.
2. **The auditor VIEWS every screenshot** and judges each one: blank voids, squeezed columns, missing images, overlapping elements, template-default look, stock imagery mismatched to the business.
3. **Interact with every distinct control once:** hover nav items and card grids (content that appears only on hover is a finding; touch devices have no hover), click the search icon, click every language switcher option and confirm the language actually changes, open the mobile menu at 390px, submit one form empty and check inline validation, click carousel/slider controls.
4. **Spot-check facts a subject-matter reader would catch:** map labels, country and region names, dates, claimed numbers. A misspelled country on a research firm's coverage map is a High-credibility finding no scanner will ever flag.
5. **Fingerprint the template:** read `wp-content/themes/<name>` (or equivalent) and the oldest media upload dates from page source; if the theme is stock and demo-era content or imagery survives, judge template-default-ness as a credibility finding.

Hover-reveal detection and console capture also run scripted (`browser_audit.py --hover --console`), but the script output is a lead; the screenshot review is the check.

**Large sites: audit by page TYPE, not by URL.** `crawl_audit.py` clusters URLs into archetypes (pages sharing a template, e.g. `/blog/<slug>`, `/product/<slug>`, `/tag/<slug>`) and lists true singleton pages. Walk every singleton; per archetype, deep-audit ONE representative and spot-check two more, then record one ledger row for the whole archetype with its page count. Never produce a ledger row per URL of a templated set, and never file the same template defect once per page: **one defect, one finding**, with the archetype pattern as the page and the affected count in the evidence. This keeps a 2,000-page site auditable without losing coverage; the archetype row asserts the template was judged, not every copy.

**The walkthrough ledger is the completeness contract.** Fill [05-walkthrough-ledger.md](../templates/05-walkthrough-ledger.md) as you go: one row per crawled content page recording screenshot-viewed, interactions-tested, layout verdict, and intent verdict. The audit MUST NOT advance to severity scoring until every page has a row or an explicit skip entry with a reason. This exists because "the scripts ran" is not the same as "someone looked"; the ledger forces the looking.

**Intent before pages.** Before the per-page pass, state the site's primary intent in one sentence (bucket 18) and record it at the top of the ledger. Every page's row then carries an intent verdict: advances / serves secondary intent / dead-ends. Close the walkthrough by physically walking each persona journey (home to intent completion) in the browser and logging friction; a site can pass every page check and still lose the visitor between pages.

## Non-Negotiables

- No finding without a receipt (see [evidence-standards.md](evidence-standards.md)).
- INP High/Blocker requires field data (`crux_fetch.py`); lab-only responsiveness findings cap at Medium.
- Blocker and High findings must be reproduced twice (initial + verify) before entering the executive summary.
- Scorecard numbers come only from `compute_scorecard.py`.
- Respect the site: throttle crawls, never submit real payment forms, use test data in signup forms, and stop at any login wall unless credentials were explicitly provided for the audit.
