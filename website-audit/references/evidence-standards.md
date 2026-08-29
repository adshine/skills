# Evidence & Receipt Standards

**Rule:** No finding may be entered into the Master Findings Table without a verifiable receipt/evidence.

---

## Accepted Evidence Formats by Area

| Audit Area | Primary Evidence Type | Required Metadata | Example Receipt |
| :--- | :--- | :--- | :--- |
| **Visual / Layout & Mobile Breakpoints** | Screenshot / Video Clip | Viewport width (e.g. 390px), OS, browser | `screenshot: /artifacts/pricing-mobile-wrap-390px.png` showing CTA wrapped below viewport |
| **Interaction & State Failures** | Console error log / HAR file | Step-by-step reproduction sequence | `console.log: Uncaught TypeError: Cannot read properties of undefined (reading 'checkout')` on promo click |
| **Forms & Data Capture** | Screen recording / network payload | Form endpoint, input state, HTTP response | `network: POST /api/signup returns 422 with unrendered inline error` |
| **Content Truth & Pricing** | Side-by-side screenshot / URL diff | Conflicting page URLs and discrepancy | `screenshot diff: /pricing shows $29/mo, /checkout charges $39/mo` |
| **Navigation & IA** | HTTP status code / click trace | Origin URL, target URL, response code | `HTTP 404 on click: footer link 'Documentation' -> /docs/v2/guides` |
| **Cross-Page Consistency** | Side-by-side component capture | Page A vs Page B screenshots | `screenshot: /login uses blue primary btn, /signup uses green` |
| **Performance & Speed** | Lighthouse JSON / WebPageTest run | Throttling profile (e.g., Simulated 4G, Moto G4) | `LCP: 4.32s, element: img#hero-banner, transfer size: 3.8MB` |
| **Security & Headers** | Terminal output / Burp scan | Tested URL, HTTP response status & headers | `curl -sI https://example.com/checkout: Missing Content-Security-Policy and X-Frame-Options` |
| **Accessibility (a11y)** | axe-core violation tree / screen reader trace | CSS Selector, WCAG rule ID, contrast ratio | `node: button.btn-primary (contrast: 2.8:1, required: 4.5:1, WCAG 1.4.3)` |
| **SEO & Social Share** | HTML snippet / Open Graph debug curl | `<head>` metadata snippet, canonical tag | `<meta property="og:image" content=""> (Empty image tag)` |
| **Tracking & Analytics** | Network payload / Tag Assistant trace | Event payload, firing order, duplicate IDs | `POST https://analytics.google.com/g/collect fired 2x on single checkout submit` |
