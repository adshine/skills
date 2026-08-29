# Per-Page Health Scorecard (Dashboard View)

Calculated mathematically from the **Master Findings Table** using the formula:
$$\text{Score} = \max\Big(1.0,\; 10.0 - (3.0 \times \text{Blocker}) - (2.0 \times \text{High}) - (1.0 \times \text{Medium}) - (0.3 \times \text{Low})\Big)$$

| Page / Route | Find & Convert (1-10) | Content & Trust (1-10) | Design & Interaction (1-10) | Speed & A11y (1-10) | Technical Hygiene (1-10) | Page Health Score | Key Driver / Flagged Finding |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Homepage (`/`)** | 8.0 | 9.0 | 8.5 | 6.0 | 8.0 | 🟢 **7.9 (B)** | LCP hero banner slow (`F-005`) |
| **Pricing (`/pricing`)** | 6.0 | 8.5 | 7.0 | 7.5 | 8.0 | 🟡 **7.4 (C)** | Mobile CTA below fold (`F-001`) |
| **Signup (`/signup`)** | 7.0 | 9.0 | 8.0 | 5.0 | 8.0 | 🟡 **7.4 (C)** | Input lacks a11y label (`F-003`) |
| **Checkout (`/checkout`)** | **3.0** | 7.0 | 6.0 | 7.0 | 6.0 | 🚨 **5.8 (D)** | **Blocker:** Promo code 500 error (`F-002`) |
| **Dashboard (`/dashboard`)**| 9.0 | 9.5 | 9.0 | 8.5 | 8.5 | 🟢 **8.9 (A-)** | Clean, fast, no critical defects |

---

### Key Money-Path Risk Summary:
> ⚠️ **Checkout Page is at Risk (Score: 5.8 / Grade D):** The presence of Blocker `F-002` directly threatens transaction completion. Must be resolved before expanding paid acquisition campaigns.
