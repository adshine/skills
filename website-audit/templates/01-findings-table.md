# Master Findings Table (Single Source of Truth)

Every defect, bug, or risk discovered is logged here with stable IDs (`F-001`), fixed buckets, and required receipts.

| ID | Page / URL | Area / Bucket | Check | Severity | What Was Found | Evidence (Receipt) | Expected Behavior | Business / User Impact | Owner | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **F-001** | `/pricing` | Conversion Path | CTA visibility | **High** | Primary "Upgrade" button is pushed below fold on 390px mobile screens. | `screenshot: /artifacts/pricing-cta-mobile.png` | Button visible within initial viewport without scrolling. | Estimated 12% drop in mobile upgrades. | Product / Design | Open |
| **F-002** | `/checkout` | Forms & Data Capture | Promo code submission | **Blocker** | Entering promo code returns HTTP 500 error and disables submit button. | `console.log: POST /api/promo 500 Internal Server Error` | Promo applies discount or shows inline error "Invalid Code". | Users cannot complete checkout; direct revenue loss. | Backend / Eng | In Progress |
| **F-003** | `/signup` | Accessibility | Form input labeling | **High** | Email input lacks associated `<label>` or `aria-label`. | `axe-core: violation label-title-only on input#email` | Accessible name announced by VoiceOver/NVDA. | Screen reader users cannot sign up; ADA lawsuit risk. | Frontend / Eng | Open |
| **F-004** | `/*` (Global) | Security Hygiene | Security headers | **Medium** | Missing `Content-Security-Policy` and `X-Frame-Options` headers. | `curl -sI https://example.com | grep -i x-frame-options` (Empty) | Headers sent with valid policy on all responses. | Vulnerable to clickjacking and malicious script injection. | DevOps / SecOps | Open |
| **F-005** | `/` (Home) | Performance | LCP Hero asset | **High** | Hero image is uncompressed 4.1MB PNG causing 4.5s LCP. | `Lighthouse: LCP 4.52s (img.hero-bg)` | Compressed AVIF/WebP under 150KB loading in < 1.5s. | High bounce rate for mobile visitors. | Frontend / Design | Open |
