# Evidence & Receipt Standards

**Rule:** No finding may be entered into the Master Findings Table without a verifiable receipt/evidence.

---

## Accepted Evidence Formats by Area

| Audit Area | Primary Evidence Type | Required Metadata | Example Receipt |
| :--- | :--- | :--- | :--- |
| **Visual / Layout & Mobile Breakpoints** | Screenshot / Loom Video | Viewport width (e.g. 390px), OS, browser | `screenshot: /artifacts/pricing-mobile-wrap-390px.png` showing CTA wrapped below viewport |
| **Interaction & State Failures** | Console error log / HAR file | Step-by-step reproduction sequence | `console.log`: `Uncaught TypeError: Cannot read properties of undefined (reading 'checkout')` on promo click |
| **Performance & Speed** | Lighthouse JSON / WebPageTest run | Throttling profile (e.g., Simulated 4G, Moto G4) | `LCP: 4.32s, element: img#hero-banner, transfer size: 3.8MB` |
| **Security & Headers** | `curl -sI` terminal output / Burp scan | Tested URL, HTTP response status & headers | `curl -sI https://example.com/checkout`: Missing `Content-Security-Policy` & `X-Frame-Options` |
| **Accessibility (a11y)** | axe-core violation tree / screen reader trace | CSS Selector, WCAG rule ID, contrast ratio | `node: button.btn-primary (contrast: 2.8:1, required: 4.5:1, WCAG 1.4.3)` |
| **SEO & Social Share** | HTML snippet / Open Graph debug curl | `<head>` metadata snippet, canonical tag | `<meta property="og:image" content="">` (Empty image tag) |
| **Tracking & Analytics** | Network payload / Tag Assistant trace | Event payload, firing order, duplicate IDs | `POST https://analytics.google.com/g/collect` fired 2x on single checkout submit |
