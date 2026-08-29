# website-audit

A comprehensive website audit skill for AI coding agents (Claude Code, Codex, Antigravity) with **Dual-Track Reporting**:
- **Track 1: Plain-English Executive Summary** for business stakeholders, C-Suite, and founders (translating technical issues into revenue loss, bounce rate impact, and legal exposure).
- **Track 2: Deep Technical Engineering Spec** for developers and DevOps (with root causes, exact URLs, code diffs, and CLI verification commands).

---

## What It Evaluates

Evaluates web applications across **17 pre-loaded check buckets** rolled up into **5 Executive Scorecard Pillars**:

1. **Find & Convert:** Landing value prop, primary CTAs, signup flows, checkout steps, promo codes, forms & data capture.
2. **Content & Trust:** Accurate claims plus E-E-A-T credibility signals, pricing truth, copyright, legal disclosures, terms of service, refund policies, multi-jurisdiction privacy compliance (GDPR, 20+ US state laws, GPC opt-out).
3. **Design & Interaction:** Mobile viewport stability (390px), tap targets (44×44px), working menus, loading/error states.
4. **Speed & Accessibility:** Core Web Vitals (LCP, INP, CLS), payload size, image compression, WCAG 2.2 AA contrast & keyboard/screen-reader navigation, European Accessibility Act conformance and statement.
5. **Technical & Security Hygiene:** Technical SEO with structured data and crawl/index verification, AI search visibility (crawler access, snippet eligibility, answer readiness), Open Graph social cards, security headers (`CSP` with `frame-ancestors`, `HSTS`), supply-chain script integrity (SRI, CVE-flagged libraries), Consent Mode v2, unconsented tracking pixels, secret leakage.

---

## Core Architecture

- **Single Source of Truth:** Every issue is logged into the **Master Findings Table** with a stable ID (`F-001`) and verifiable receipt/evidence.
- **Objective Mathematical Scoring:** Per-page 1-10 scores are calculated directly from findings via standard formula:
  $$\text{Score} = \max\Big(1.0,\; 10.0 - 3.0(\text{Blocker}) - 2.0(\text{High}) - 1.0(\text{Medium}) - 0.3(\text{Low})\Big)$$
- **2-Axis Severity Matrix:** Goal Impairment × User Breadth. (Nits are strictly excluded from Executive summaries).

---

## Install

Copy or symlink into your agent's skills directory:

```bash
# Clone the repository
git clone https://github.com/adshine/skills.git ~/adshine-skills

# Symlink into Claude Code or agent skills directory
ln -s ~/adshine-skills/website-audit ~/.claude/skills/website-audit
# or for Codex / Antigravity
ln -s ~/adshine-skills/website-audit ~/.agents/skills/website-audit
```

---

## Usage

```bash
# Run full audit
/website-audit

# Targeted domain audit (preserves dual-track output)
/website-audit --only security,performance
/website-audit --only accessibility
/website-audit --only conversion,ux
```

---

## Layout

```
website-audit/
├── SKILL.md                          # Master orchestrator & 6-phase workflow
├── README.md                         # Documentation & install guide
├── references/
│   ├── check-buckets.md              # 17 pre-loaded check question library
│   ├── severity-rubric.md            # 2-axis decision matrix
│   ├── scorecard-rubric.md           # 5-Pillar mathematical scoring formula
│   └── evidence-standards.md         # Evidence & receipt standards (screenshots, HAR, logs)
└── templates/
    ├── 00-cover-sheet.md             # Environment, devices & Out-of-Scope boundaries
    ├── 01-findings-table.md          # Master findings table with stable IDs (F-001)
    ├── 02-scorecard.md               # 5-Pillar per-page dashboard
    ├── 03-executive-summary.md       # Plain-English 1-page C-suite report
    ├── 04-technical-spec.md          # Engineering spec with code diffs & verification tests
    └── business-translation-guide.md # Jargon-to-Business-Impact dictionary
```

---

## License

MIT
