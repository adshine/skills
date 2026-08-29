# Per-Page Health Scorecard (Dashboard View)

> ⚠️ **SAMPLE DATA:** All pages, scores, and finding references below are fictional examples. Recompute every score from the real Master Findings Table using the formula; never reuse these numbers.

Calculated mathematically from the **Master Findings Table** using the formula:
$$\text{Score} = \max\Big(1.0,\; 10.0 - (3.0 \times \text{Blocker}) - (2.0 \times \text{High}) - (1.0 \times \text{Medium}) - (0.3 \times \text{Low})\Big)$$

| Page / Route | Find & Convert (1-10) | Content & Trust (1-10) | Design & Interaction (1-10) | Speed & A11y (1-10) | Technical Hygiene (1-10) | Page Health Score | Key Driver / Flagged Finding |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Homepage (`/`)** | 10.0 | 10.0 | 9.0 | 8.0 | 9.0 | 🟢 **9.2 (Grade A)** | Hero LCP slow (`F-005`), Menu backdrop (`F-010`) |
| **Pricing (`/pricing`)** | 8.0 | 9.0 | 10.0 | 10.0 | 9.0 | 🟢 **9.2 (Grade A)** | Mobile CTA below fold (`F-001`), Toggle bug (`F-009`) |
| **Signup (`/signup`)** | 8.0 | 10.0 | 10.0 | 8.0 | 9.0 | 🟢 **9.0 (Grade A)** | Google OAuth error (`F-008`), Email a11y label (`F-003`) |
| **Checkout (`/checkout`)** | 7.0 | 9.0 | 8.0 | 10.0 | 9.0 | 🟢 **8.6 (Grade B)** | Promo 500 (`F-002`), Mobile overlap (`F-006`) |
| **Dashboard (`/dashboard`)**| 10.0 | 10.0 | 10.0 | 10.0 | 9.0 | 🟢 **9.8 (Grade A)** | Clean, reliable, standard global header finding (`F-004`) |
| **Pillar Average** | **8.6** | **9.6** | **9.4** | **9.2** | **9.0** | **9.2 (Unweighted)** | |

---

### Site-Wide Weighted Health Calculation
- **Money-Path Pages (Weight = 2.0):** Homepage (9.2), Pricing (9.2), Signup (9.0), Checkout (8.6)
- **Standard Pages (Weight = 1.0):** Dashboard (9.8)
- **Weighted Math:** $\frac{(9.2 \times 2) + (9.2 \times 2) + (9.0 \times 2) + (8.6 \times 2) + (9.8 \times 1)}{2 + 2 + 2 + 2 + 1} = \frac{81.8}{9} =$ **9.1 / 10.0 (Grade A)**

> ⚠️ **Key Focus Area:** Despite an overall Grade A (9.1), the Checkout route (Score: 8.6 / Grade B) contains Blocker `F-002` on promo codes and High defect `F-006` on mobile screens, which must be resolved prior to paid campaign scaling.
