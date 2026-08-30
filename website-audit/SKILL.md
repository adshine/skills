---
name: website-audit
description: Conduct comprehensive website audits across security, performance, accessibility, SEO, UX, and compliance with dual-track reporting (technical specs for engineers and plain-English business impact reports for stakeholders).
license: MIT
metadata:
  tags: audit, website-audit, performance, security, accessibility, seo, compliance, executive-reporting
---

# Website Audit Orchestrator & Dual-Track Reporting

A comprehensive, evidence-based website audit framework designed to evaluate web applications and produce dual-track deliverables: an **Executive Health Report** in plain English for business stakeholders and a **Technical Remediation Spec** for engineers.

---

## When to Use This Skill

- Performing pre-launch, quarterly, or post-incident website quality audits.
- Evaluating digital products across **18 check buckets** (Security, Performance, A11y, SEO, UX, Legal, etc.).
- Translating technical bugs and vitals into **revenue loss, conversion drop-off, and legal risks**.
- Generating structured audit backlogs with verified receipts (screenshots, logs, HAR, curl).

---

## The 8-Phase Audit Workflow (Phases 7-8 opt-in)

```
Phase 1: Scope & Cover Sheet
  └── Define Target URL, Build Date, Devices, Browsers, and Out-of-Scope boundaries.
      Template: [00-cover-sheet.md](templates/00-cover-sheet.md)

Phase 2: Systematic Multi-Bucket Evaluation
  └── Name the site's primary intent FIRST (bucket 18), then test every crawled
      page against the 18 Pre-loaded Check Buckets: scripts collect, but every
      page also gets an eyes-on screenshot review, its interactions exercised,
      and an intent verdict, recorded in the Walkthrough Ledger. The audit may
      NOT advance to Phase 4 until the ledger has a row (or justified skip) for
      every page, and each persona journey has been walked end to end.
      Reference: [check-buckets.md](references/check-buckets.md)
      Execution: [execution-playbook.md](references/execution-playbook.md)
      Ledger: [05-walkthrough-ledger.md](templates/05-walkthrough-ledger.md)

Phase 3: Evidence Capture & Logging (Single Source of Truth)
  └── Log every defect into the Master Findings Table with a stable ID (F-001) and receipt.
      Reference: [evidence-standards.md](references/evidence-standards.md)
      Template: [01-findings-table.md](templates/01-findings-table.md)

Phase 4: Severity & Decision Scoring
  └── Assign severity via 2-axis decision matrix (Goal Impairment x User Breadth).
      Reference: [severity-rubric.md](references/severity-rubric.md)

Phase 5: Compute Per-Page Health Scorecard
  └── Run scripts/compute_scorecard.py on the findings table; it is the ONLY
      allowed source of scorecard numbers (never hand-compute scores).
      Reference: [scorecard-rubric.md](references/scorecard-rubric.md)
      Template: [02-scorecard.md](templates/02-scorecard.md)

Phase 6: Dual-Track Deliverable Generation
  ├── Track 1: Executive Summary & Roadmap (Plain / Business English)
  │   Template: [03-executive-summary.md](templates/03-executive-summary.md)
  │   Dictionary: [business-translation-guide.md](templates/business-translation-guide.md)
  └── Track 2: Technical Engineering Spec (Code Diffs & Reproduction Steps)
      Template: [04-technical-spec.md](templates/04-technical-spec.md)

Phase 7 (opt-in, --fix, requires the site's repo locally): Closed Remediation Loop
  └── Patch findings in an isolated worktree; each fix verified by its sensor;
      3 bounded attempts, then Needs Human; regression barrier per severity tier.
      Reference: [remediation-loop.md](references/remediation-loop.md)
      Sensors: [sensor-library.md](references/sensor-library.md)

Phase 8 (opt-in, --gate / --recheck): Quality Gate & Sensor Recheck
  └── Re-run recorded sensors without rediscovery; CI gate fails on open
      Blockers/Highs or pillar scores below threshold (scripts/audit_gate.py).
```

**Machine state:** findings live in a `findings.json` sidecar conforming to [findings-schema.json](references/findings-schema.json); the markdown table, scorecard, and both report tracks are rendered FROM it. Where a deterministic sensor command exists, record it on the finding (see the sensor library); sensors are the preferred evidence receipt.

---

## Scope Flags & Domain Aliases

By default, a full 18-bucket audit is performed. When only specific areas are requested, load only the targeted domain playbooks while maintaining the same dual-track report shape:

```bash
# Run full audit
/website-audit

# Targeted domain audits
/website-audit --only security,performance
/website-audit --only accessibility
/website-audit --only conversion,ux

# Closed-loop modes (Phase 7/8; --fix requires the site's repo locally)
/website-audit --fix
/website-audit --recheck
/website-audit --gate blockers
```

### Scope Flag Alias Mapping:
| Flag Token | Mapped Check Buckets | Focus Area |
| :--- | :--- | :--- |
| `conversion` | Bucket 1 (Findability), Bucket 2 (Conversion Path), Bucket 3 (Forms), Bucket 18 (Intent & Journey) | Landing clarity, money routes, CTA clicks, checkout forms |
| `intent` / `journey` | Bucket 18 (Primary Intent & Journey Coherence) | Site's main goal, per-page intent verdicts, persona journeys walked end to end |
| `ux` | Bucket 5 (Navigation), Bucket 6 (Visual/Layout), Bucket 7 (Interaction), Bucket 8 (States) | Mobile viewports, tap targets, UI states, menus |
| `performance` | Bucket 10 (Performance & Speed) | Core Web Vitals (LCP/INP/CLS), TTFB, payload size, caching |
| `accessibility` / `a11y` | Bucket 11 (Accessibility) | WCAG 2.2 AA contrast, screen reader labels, keyboard navigation |
| `seo` | Bucket 12 (SEO, Structured Data & Indexation), Bucket 13 (Social Share & Open Graph) | Indexation, meta tags, canonicals, schema, rich cards |
| `ai-search` / `ai` | Bucket 17 (AI Search Visibility) | AI crawler access, snippet eligibility, answer readiness, AI citations |
| `trust` / `legal` | Bucket 4 (Content Truth), Bucket 14 (Trust & Legal) | Transparent claims, pricing, terms, cookie banners |
| `security` | Bucket 16 (Security Hygiene) | Defense headers (CSP, HSTS), secret leaks, XSS protection |
| `analytics` | Bucket 15 (Tracking & Analytics) | Event tracking, conversion pixels, unconsented tags |

---

## References & Template Index

- **Rubrics & Standards:**
  - Execution Playbook (collection methods, scripts, multi-agent fan-out): [`references/execution-playbook.md`](references/execution-playbook.md)
  - Severity Matrix: [`references/severity-rubric.md`](references/severity-rubric.md)
  - Scorecard Math: [`references/scorecard-rubric.md`](references/scorecard-rubric.md)
  - Evidence Receipts: [`references/evidence-standards.md`](references/evidence-standards.md)
  - Check Questions: [`references/check-buckets.md`](references/check-buckets.md)
  - Sensor Library: [`references/sensor-library.md`](references/sensor-library.md)
  - Remediation Loop & Gate: [`references/remediation-loop.md`](references/remediation-loop.md)
  - Findings Schema: [`references/findings-schema.json`](references/findings-schema.json)
- **Output Templates:**
  - Cover Sheet: [`templates/00-cover-sheet.md`](templates/00-cover-sheet.md)
  - Master Findings Table: [`templates/01-findings-table.md`](templates/01-findings-table.md)
  - Scorecard Dashboard: [`templates/02-scorecard.md`](templates/02-scorecard.md)
  - Business Executive Report: [`templates/03-executive-summary.md`](templates/03-executive-summary.md)
  - Technical Engineering Spec: [`templates/04-technical-spec.md`](templates/04-technical-spec.md)
  - Walkthrough Ledger (completeness contract): [`templates/05-walkthrough-ledger.md`](templates/05-walkthrough-ledger.md)
  - Jargon Translation Key: [`templates/business-translation-guide.md`](templates/business-translation-guide.md)
