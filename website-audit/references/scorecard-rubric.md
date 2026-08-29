# Scorecard Rubric & Mathematical Formula

To eliminate auditor bias, every per-page scorecard score (1–10) is mathematically anchored to the **Master Findings Table**.

---

## 1. The 5 Core Scorecard Pillars

The 15 detailed audit check buckets roll up into **5 Executive Scorecard Pillars**:

| Pillar | Included Audit Check Buckets | Focus Area |
| :--- | :--- | :--- |
| **1. Find & Convert** | Findability, Conversion Path, Forms & Data Capture | Landing clarity, CTAs, signups, checkouts, form validation. |
| **2. Content & Trust** | Content Truth, Trust & Legal, Cross-Page Consistency | Accurate claims, pricing, legal disclosures, terms, consistent UI. |
| **3. Design & Interaction** | Navigation & IA, Visual / Layout, Interaction, States | Layout stability, mobile wrap, working buttons/menus, error/loading states. |
| **4. Speed & A11y** | Performance, Accessibility | Core Web Vitals (LCP/INP/CLS), payload size, WCAG 2.2 AA contrast/focus. |
| **5. Technical Hygiene** | SEO Basics, Social Share & Open Graph, Tracking & Analytics, Security Hygiene | Meta tags, canonicals, security headers, unconsented pixels, leaked secrets. |

---

## 2. Mathematical Scoring Formula (Per Page & Pillar)

Each page starts with a base score of **10.0** in each of the 5 pillars. Points are subtracted based on open findings linked to that specific page and pillar:

$$\text{Score} = \max\Big(1.0,\; 10.0 - (3.0 \times N_{\text{Blocker}}) - (2.0 \times N_{\text{High}}) - (1.0 \times N_{\text{Medium}}) - (0.3 \times N_{\text{Low}})\Big)$$

### Score Interpretation Table:
| Score Range | Health Grade | Status Meaning | Action Required |
| :--- | :--- | :--- | :--- |
| **9.0 – 10.0** | 🟢 **A (Exceptional)** | Clean, reliable, no critical defects. | Routine maintenance. |
| **7.5 – 8.9** | 🟢 **B (Good)** | Minor polish or isolated medium friction. | Scheduled backlog sprint. |
| **5.0 – 7.4** | 🟡 **C (Needs Work)** | Multiple friction points or 1-2 High issues. | Address in next sprint. |
| **3.0 – 4.9** | 🔴 **D (At Risk)** | Blocker or multiple High issues affecting users. | Urgent remediation. |
| **1.0 – 2.9** | 🚨 **F (Critical Failure)** | Multiple Blockers on the revenue / money path. | Immediate hotfix / triage. |

> **Note:** A page's overall score is weighted by the critical "money path" (Homepage, Pricing, Checkout, and Auth pages carry 2x weight in the site-wide average).
