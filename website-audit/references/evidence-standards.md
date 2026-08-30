# Evidence & Receipt Standards

**Rule:** No finding may be entered into the Master Findings Table without a verifiable receipt/evidence.

**One defect, one finding.** A defect living in a shared template (broken breadcrumb on all service pages, missing labels on every product card) is logged ONCE with the archetype pattern as its page (e.g. `/service/<slug>`) and the affected page count in the evidence; never one finding per affected URL. Redundant findings bury the real story and double-punish the score.

**Sensors are the preferred receipt.** Where a deterministic command can prove the defect (see [sensor-library.md](sensor-library.md)), record its failing output as the evidence AND attach the command to the finding in findings.json. A screenshot proves the defect happened once; a sensor proves it is still there and later proves it is fixed. Screenshots remain required for visual/layout findings where no command can judge.

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
| **Consent Mode & GPC** | Network trace before/after consent, header replay | Consent state, tag behavior, GPC header sent | `with Sec-GPC: 1, Meta Pixel still fires sale event on /product` |
| **Structured Data** | Rich Results Test output / JSON-LD snippet | Page URL, schema type, validation errors | `Rich Results Test: Product schema missing required 'offers' on /product/x` |
| **Crawl & Indexation** | Search Console export / crawler report | Indexed vs submitted counts, affected URLs | `GSC: 240 submitted, 61 indexed; 45 soft-404s under /blog/*` |
| **AI Search Visibility** | robots.txt capture / rendered-vs-raw HTML diff | Blocked bot names, snippet directives, AI answer citation check | `robots.txt blocks GPTBot and ClaudeBot site-wide; owner confirms unintentional` |
| **Supply-Chain Scripts** | Script inventory / Lighthouse legacy-JS audit | Script URL, SRI presence, CVE ID and library version | `checkout loads https://cdn.example.net/lib.js v2.1 (CVE-2025-1234) without integrity attribute` |
| **Accessibility Statement (EAA)** | Page capture / absence proof | Statement URL or crawl showing none exists | `no /accessibility or statement link in footer; site sells to EU consumers` |

---

## Field vs. Lab Telemetry Rule (Performance Findings)

Synthetic lab runs (Lighthouse, local DevTools) cannot reproduce real human interaction. Lighthouse does not measure INP at all; it approximates responsiveness with proxies. Findings must respect the evidence source:

1. **INP:** High or Blocker severity requires real-user field data: Chrome UX Report (CrUX) p75 or the site's own RUM. With lab-only evidence, INP responsiveness findings are capped at **Medium** severity.
2. **CLS:** Load-time layout shifts DO reproduce in lab runs, so lab CLS evidence is acceptable; still prefer CrUX/RUM confirmation before assigning Blocker, since post-load shifts (ads, late injections) only appear in field data.
3. **LCP:** Lab evidence is acceptable (the offending element and payload are directly observable), but cite the throttling profile.

**Accepted receipt formats:**
- `CrUX field data: p75 INP = 340ms (Needs Improvement), origin: https://example.com, 28-day window`
- `Lighthouse lab: LCP = 4.2s (element: img#hero, size: 3.8MB, throttled 4G profile)`
