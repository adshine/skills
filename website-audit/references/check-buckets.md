# Audit Check Buckets (Pre-loaded Question Library)

Auditors systematically tick each bucket for every scoped page.

---

### 1. Findability & Value Proposition
- **Question:** Can a stranger land, understand what this product/service is, and identify the primary CTA in under 10 seconds?
- **Checks:** Clear H1 headline, distinct value proposition, primary CTA above the fold on desktop and mobile, visible search/nav on content-heavy pages.

### 2. Conversion Path & Money Route
- **Question:** Does the path to buy, sign up, or contact complete without dead ends, confusing copy, or dropped inputs?
- **Checks:** Pricing tier clarity, friction-free signup flow, checkout steps visible, promo code validation, transparent pricing (no hidden surprise fees).

### 3. Forms & Data Capture *(Crucial Gap Filler)*
- **Question:** Do input forms guide the user seamlessly, prevent errors, and handle submissions securely?
- **Checks:** Explicit `<label>` elements for inputs, real-time inline validation, clear human-readable error messages, autofill attributes (`autocomplete="email"`), anti-spam protection (CAPTCHA without breaking UX), clear loading state on submit button.

### 4. Content Truth, Accuracy & Credibility (E-E-A-T)
- **Question:** Are claims true AND does the site visibly demonstrate experience, expertise, authoritativeness, and trust?
- **Checks:** Matching prices across landing/pricing/checkout, current year in footer copyright, valid support email/phone numbers, verified testimonials/badges.
- **Credibility signals (E-E-A-T):** Author bylines with real bios on articles, visible publish/updated dates, citations for factual claims, complete About and Contact pages, evidence of first-hand experience (original photos, data, case studies) rather than commodity rewrites. Google anchors both classic search and AI-answer visibility in demonstrated content credibility.
- **Factual spot-checks (domain-expert eye):** read maps, labels, geography, dates, and claimed numbers the way a knowledgeable client would. A misspelled country, an outdated country name, or a region assigned wrongly is a High-credibility finding for any business claiming expertise in that domain; no scanner catches these.

### 5. Navigation & Information Architecture
- **Question:** Can users reach every essential page from the header/footer without dead ends or circular links?
- **Checks:** Working dropdowns, mobile hamburger menu open/close, sticky header stability, visible 404 recovery links.
- **Breadcrumbs, fully:** click EVERY crumb on a sample of each page type; each must link to a live page (a crumb pointing at a 404 is a High trust finding). Separators must be sensible dividers (>, /, chevrons); stock themes sometimes substitute nonsense icons (thumbs-up hands, pointing fingers) from icon fonts, which reads as broken to visitors. Crumb labels must match page titles in wording and casing.
- **Iconography sanity:** scan theme icons in nav, lists, and buttons for meaningless or wrong substitutions (an icon-font fallback or theme default that has nothing to do with the content).

### 6. Visual, Layout & Responsive Design
- **Question:** Does the layout remain balanced, readable, and free of overlap across standard viewports (390px mobile, 768px tablet, 1440px desktop)?
- **Checks:** No horizontal scrollbar overflow on mobile, proper typographic hierarchy, correct image aspect ratios (no distortion), balanced padding/margin whitespace.
- **Broken-section sweep (visual, every page):** full-page screenshots of EVERY crawled page, reviewed by eye; flag empty content bands, collapsed grids (especially at 390px), missing featured images leaving voids, content squeezed into one column beside dead space. Scripts cannot see these; only the screenshot review catches them.
- **Template fingerprint:** identify the theme (`wp-content/themes/<name>` or equivalent) and oldest media dates; stock theme + surviving demo content or mismatched stock imagery is a credibility finding, not a nit.

### 7. Interaction & Controls
- **Question:** Does clicking, tapping, typing, scrolling, and dragging work reliably on all interactive components?
- **Checks:** Touch target sizes (min 44×44px on mobile), buttons disable double-submits, modal dialogs trap and release focus, accordion toggles expand/collapse correctly.
- **Hover-state sweep:** hover nav items, card grids, and buttons. Content that ONLY appears on hover (card titles, overlay links) is a finding; touch devices have no hover, so hover-gated information is invisible to mobile users. Verify visually with before/after screenshots, not computed styles (styles lie about overlay visibility).
- **Every control once:** click the search icon, each language switcher option (confirm the language actually changes), the mobile menu toggle at 390px, carousel arrows/dots, and submit one form empty to observe validation. A control that silently does nothing is a finding.

### 8. States & Feedback
- **Question:** Does the UI communicate what is happening across all system states?
- **Checks:** Empty states (zero search results, empty cart), Loading states (skeletons/spinners), Error states (404, 500, network offline), Success states (order confirmed, password changed).

### 9. Cross-Page Consistency
- **Question:** Do shared components, terminology, buttons, and design tokens behave identically across routes?
- **Checks:** Global header/footer styling identical, consistent primary button color/radius, consistent terminology (e.g., not mixing "Sign In" with "Log In").

### 10. Performance & Speed
- **Question:** Does the page load fast, respond instantly to input, and avoid visual instability?
- **Checks:** Core Web Vitals (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1), TTFB ≤ 800ms, modern image formats (AVIF/WebP), efficient caching headers, payload ≤ 2.5MB.

### 11. Accessibility (a11y) & Legal Compliance
- **Question:** Can people with disabilities (visual, motor, auditory, cognitive) perceive and operate the page, and does the site meet its legal accessibility obligations?
- **Checks:** WCAG 2.2 AA color contrast (4.5:1 text, 3.0:1 UI), full keyboard navigation (visible focus rings, no keyboard traps), screen-reader-friendly semantic HTML and ARIA labels.
- **WCAG 2.2-specific criteria automated linters miss:**
  - **Focus Not Obscured (2.4.11):** Focused elements must never be covered by sticky headers, footers, cookie banners, or floating chat widgets; tab through every scoped page with sticky UI visible.
  - **Target Size Minimum (2.5.8):** All interactive elements must meet the 24x24px legal compliance floor; 44x44px remains the UX recommendation (bucket 7), so log 24-44px targets as Low UX findings, below 24px as compliance findings.
  - **Accessible Authentication (3.3.8):** Never block pasting into password or verification fields; support browser autofill and password managers (`autocomplete` attributes); no cognitive tests (memorization, transcription) as the only login path.
- **European Accessibility Act (enforceable since June 28, 2025):** If the site sells products or services to EU consumers (e-commerce, banking, ticketing, telecoms), verify EN 301 549 / WCAG AA conformance INCLUDING third-party widgets and embeds, and confirm a published, accurate accessibility statement exists. Missing statement or false conformance claims are per-violation fineable findings, not nits.

### 12. SEO, Structured Data & Indexation
- **Question:** Can search engine bots crawl, index, and understand the page hierarchy, and does reality match intent?
- **On-page checks:** Unique `<title>` (50-60 chars), descriptive `<meta name="description">` (150-160 chars), single `<h1>` tag, valid `rel="canonical"`, clean XML sitemap, non-blocking `robots.txt`.
- **Structured data:** JSON-LD schema present and valid for the page type (Organization, BreadcrumbList, Product, FAQPage, Article, LocalBusiness as applicable); validate with Google's Rich Results Test; no schema that contradicts visible content.
- **Crawl and index reality check:** Compare indexed vs submitted pages in Google Search Console, hunt redirect chains, soft-404s, and orphan pages, verify `hreflang` on multilingual sites, and confirm primary content renders without JavaScript (content invisible without JS is invisible to most AI crawlers too).

### 13. Social Share & Open Graph
- **Question:** Does the page present a compelling preview when shared on Slack, Twitter/X, LinkedIn, and iMessage?
- **Checks:** Valid `og:title`, `og:description`, `og:image` (1200×630px high-res), `twitter:card="summary_large_image"`, functioning favicon & Apple Touch icon.

### 14. Trust, Privacy & Legal
- **Question:** Does the website protect user rights, follow regional privacy laws, and inspire customer trust?
- **Checks:** Valid HTTPS/SSL, compliant cookie consent banner with explicit opt-out, accessible Privacy Policy and Terms of Service, security badges, money-back/refund policies.
- **Scope of law (2026):** Audit against GDPR plus the full set of US state privacy laws in effect (20+ states, several with no cure period), not just CCPA. Identify which laws apply from the site's audience before scoring findings.
- **Universal opt-out (GPC):** Send a Global Privacy Control header (`Sec-GPC: 1`) and verify the site honors it by stopping sale/share processing; required by California, Colorado, Connecticut, Texas, and others.

### 15. Tracking & Analytics Hygiene
- **Question:** Do analytics and conversion pixels fire accurately, lawfully, and without double-counting?
- **Checks:** Google Analytics / Meta Pixel events fire once per interaction, purchase revenue tracked accurately, unconsented tracking held until cookie approval.
- **Consent Mode v2:** For sites using Google ads or measurement tags with EEA visitors, verify Consent Mode v2 signals (`ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`) are wired to the consent banner and default to denied before consent; mandatory since March 2024.

### 16. Security Hygiene & Defense
- **Question:** Is the website hardened against common web exploits, supply-chain compromise, and data leakage? (Aligned to OWASP Top 10:2025.)
- **Checks:** Security response headers (`CSP` with `frame-ancestors` as the modern clickjacking control; keep legacy `X-Frame-Options` for old browsers, but recommend `frame-ancestors` in fixes; `Strict-Transport-Security` with `max-age=31536000; includeSubDomains`, `preload` where enrolled; `X-Content-Type-Options: nosniff`), no API keys or secrets in client JS bundles, generic error messages (no database stack traces exposed to public), CSRF protection on forms.
- **Hardware & API lockdown:** `Permissions-Policy` restricting unused device APIs (e.g. `camera=(), microphone=(), geolocation=(), payment=()`) so third-party scripts and iframes cannot silently request them.
- **Origin isolation (conditional):** `Cross-Origin-Opener-Policy: same-origin` on auth, payment, and account-management surfaces. Do NOT recommend site-wide `Cross-Origin-Embedder-Policy`; it breaks legitimate embeds (YouTube, payment iframes) and belongs only on high-security endpoints after compatibility review.
- **Supply chain (OWASP 2025 A03):** Inventory all third-party scripts; require Subresource Integrity (`integrity` attribute) on CDN-loaded scripts; flag outdated JS libraries with known CVEs (Lighthouse/Retire.js); scrutinize any third-party script loaded on payment or login pages (Magecart exposure).

### 17. AI Search Visibility & Answer Readiness
- **Question:** Can AI search surfaces (Google AI Overviews/AI Mode, ChatGPT, Perplexity, Claude) find, cite, and correctly represent this site?
- **Crawler access:** Check `robots.txt` and CDN/WAF bot rules for AI crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, `OAI-SearchBot`); confirm any blocking is a deliberate business decision, not an accident.
- **Snippet eligibility:** No unintended `nosnippet`, restrictive `max-snippet`, or `noindex` on pages that should appear in AI answers; content must be indexable to be eligible for AI features.
- **Answerability:** Key pages give clear, self-contained answers near the top (extractable facts, definitions, prices, steps) rather than burying substance under marketing prose; headings phrase real user questions where natural.
- **Monitoring:** Check the Search Console generative-AI performance report where available; spot-check how major AI assistants describe the brand and whether they cite the site.
- **Anti-checks:** Do NOT recommend `llms.txt` (Google confirmed it is unused; at most a neutral note, never a finding) and do NOT recommend schema-stuffing or content "chunking" as AI-ranking hacks.

### 18. Primary Intent & Journey Coherence
- **Question:** What is the ONE thing this website exists to make a visitor do, and does every page pull toward it?
- **Name the intent first:** before auditing pages, state the site's primary intent in one sentence (request a quote, book a call, sign up, buy, apply, donate) and the secondary intents (careers, partners, press). If the intent cannot be determined from the homepage in 10 seconds, that is itself a High finding.
- **Per-page intent verdict (recorded in the walkthrough ledger for EVERY page):** does this page (a) advance the visitor toward the primary intent with a visible next step, (b) serve a named secondary intent, or (c) dead-end? Pages with no CTA and no onward path are findings. Count clicks from each money-path page to intent completion; more than 3 is friction worth logging.
- **Persona journeys, walked end to end:** for each key persona (e.g. prospective client, job applicant, partner), start on the homepage and actually walk to intent completion in the browser, clicking what a real visitor would click. Log every point of confusion, dead link, hidden information, or missing reassurance (pricing, proof, contact) along the way. A page can pass every isolated check and still fail the journey.
- **Proof placement:** the strongest evidence (case studies, testimonials, credentials, guarantees) must sit ON the journey, not buried in pages the journey never visits.
