# Audit Cover Sheet & Scope Definition

| Audit Field | Target Specification |
| :--- | :--- |
| **Target Website & Environment** | `https://example.com` (Production) |
| **Audit Date & Commit/Build** | YYYY-MM-DD | Build `#1042-prod` |
| **Primary Scope / Scoped Pages** | Homepage (`/`), Pricing (`/pricing`), Signup (`/signup`), Checkout (`/checkout`), App Dashboard (`/dashboard`) |
| **Tested Devices & Viewports** | Desktop 1440×900, Tablet 768×1024, Mobile 390×844 (iPhone 14/15) |
| **Tested Browsers** | Chrome 128 (Chromium), Safari 17.5 (WebKit), Firefox 129 (Gecko) |
| **Authentication States Tested** | Logged-Out Guest, Logged-In Free User, Logged-In Admin |
| **Auditor(s) / Lead** | [Auditor Name / Team] |

---

### Out of Scope / Not Tested (Explicit Boundary Protection)
- [ ] Legacy API routes (`/api/v1/*`)
- [ ] Native mobile apps (iOS / Android Swift/Kotlin wrappers)
- [ ] Internal staging intranet behind VPN
- [ ] Load / DDoS volumetric stress testing beyond 500 RPS
