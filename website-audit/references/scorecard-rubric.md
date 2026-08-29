# Scorecard Rubric & Mathematical Formula

To eliminate auditor bias, every per-page scorecard score (1.0 to 10.0) is mathematically anchored to the **Master Findings Table**.

---

## 1. The 5 Core Scorecard Pillars

The **17 detailed audit check buckets** roll up into **5 Executive Scorecard Pillars**:

| Pillar | Included Audit Check Buckets | Focus Area |
| :--- | :--- | :--- |
| **1. Find & Convert** | 1. Findability, 2. Conversion Path, 3. Forms & Data Capture | Landing clarity, CTAs, signups, checkouts, form validation. |
| **2. Content & Trust** | 4. Content Truth & Credibility (E-E-A-T), 9. Cross-Page Consistency, 14. Trust, Privacy & Legal | Accurate claims, credibility signals, pricing, privacy law compliance (GDPR, US state laws, GPC), consistent UI. |
| **3. Design & Interaction** | 5. Navigation & IA, 6. Visual / Layout, 7. Interaction, 8. States | Layout stability, mobile wrap, working buttons/menus, error/loading states. |
| **4. Speed & A11y** | 10. Performance & Speed, 11. Accessibility & Legal Compliance | Core Web Vitals (LCP/INP/CLS), payload size, WCAG 2.2 AA contrast/focus, EAA statement. |
| **5. Technical Hygiene** | 12. SEO, Structured Data & Indexation, 13. Social Share & Open Graph, 15. Tracking & Analytics, 16. Security Hygiene, 17. AI Search Visibility | Meta tags, canonicals, schema, security headers, supply-chain integrity, Consent Mode v2, unconsented pixels, leaked secrets, AI crawler access and answer readiness. |

---

## 2. Mathematical Scoring Formula (Per Page & Pillar)

Each page starts with a base score of **10.0** in each of the 5 pillars. Points are deducted based on open findings linked to that specific page and pillar:

$$\text{Score} = \max\Big(1.0,\; 10.0 - (3.0 \times N_{\text{Blocker}}) - (2.0 \times N_{\text{High}}) - (1.0 \times N_{\text{Medium}}) - (0.3 \times N_{\text{Low}})\Big)$$

### Score Interpretation & Grade Table:
| Score Range | Health Grade | Status Meaning | Action Required |
| :--- | :--- | :--- | :--- |
| **9.0 to 10.0** | 🟢 **A (Exceptional)** | Clean, reliable, no critical defects. | Routine maintenance. |
| **7.5 to 8.9** | 🟢 **B (Good)** | Minor polish or isolated medium friction. | Scheduled backlog sprint. |
| **5.0 to 7.4** | 🟡 **C (Needs Work)** | Multiple friction points or 1-2 High issues. | Address in next sprint. |
| **3.0 to 4.9** | 🔴 **D (At Risk)** | Blocker or multiple High issues affecting users. | Urgent remediation. |
| **1.0 to 2.9** | 🚨 **F (Critical Failure)** | Multiple Blockers on the revenue / money path. | Immediate hotfix / triage. |

---

## 3. Site-Wide Weighted Average Formula

The overall website health score weights the critical **money path** pages (Homepage, Pricing, Signup, Checkout) with a 2x multiplier compared to secondary pages (Dashboard, Docs, About):

$$\text{Overall Score} = \frac{\sum (w_i \times \text{PageScore}_i)}{\sum w_i} \quad \text{where } w_{\text{money}} = 2.0,\; w_{\text{standard}} = 1.0$$
