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

### 4. Content Truth & Accuracy
- **Question:** Are headlines, product prices, feature claims, copyright dates, and legal copy current and internally consistent?
- **Checks:** Matching prices across landing/pricing/checkout, current year in footer copyright, valid support email/phone numbers, verified testimonials/badges.

### 5. Navigation & Information Architecture
- **Question:** Can users reach every essential page from the header/footer without dead ends or circular links?
- **Checks:** Working dropdowns, mobile hamburger menu open/close, sticky header stability, breadcrumb accuracy, visible 404 recovery links.

### 6. Visual, Layout & Responsive Design
- **Question:** Does the layout remain balanced, readable, and free of overlap across standard viewports (390px mobile, 768px tablet, 1440px desktop)?
- **Checks:** No horizontal scrollbar overflow on mobile, proper typographic hierarchy, correct image aspect ratios (no distortion), balanced padding/margin whitespace.

### 7. Interaction & Controls
- **Question:** Does clicking, tapping, typing, scrolling, and dragging work reliably on all interactive components?
- **Checks:** Touch target sizes (min 44×44px on mobile), buttons disable double-submits, modal dialogs trap and release focus, accordion toggles expand/collapse correctly.

### 8. States & Feedback
- **Question:** Does the UI communicate what is happening across all system states?
- **Checks:** Empty states (zero search results, empty cart), Loading states (skeletons/spinners), Error states (404, 500, network offline), Success states (order confirmed, password changed).

### 9. Cross-Page Consistency
- **Question:** Do shared components, terminology, buttons, and design tokens behave identically across routes?
- **Checks:** Global header/footer styling identical, consistent primary button color/radius, consistent terminology (e.g., not mixing "Sign In" with "Log In").

### 10. Performance & Speed
- **Question:** Does the page load fast, respond instantly to input, and avoid visual instability?
- **Checks:** Core Web Vitals (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1), TTFB ≤ 800ms, modern image formats (AVIF/WebP), efficient caching headers, payload ≤ 2.5MB.

### 11. Accessibility (a11y)
- **Question:** Can people with disabilities (visual, motor, auditory, cognitive) perceive and operate the page?
- **Checks:** WCAG 2.1/2.2 AA color contrast (4.5:1 text, 3.0:1 UI), full keyboard navigation (visible focus rings, no keyboard traps), screen-reader-friendly semantic HTML and ARIA labels.

### 12. SEO Basics & Indexation
- **Question:** Can search engine bots crawl, index, and understand the page hierarchy?
- **Checks:** Unique `<title>` (50-60 chars), descriptive `<meta name="description">` (150-160 chars), single `<h1>` tag, valid `rel="canonical"`, clean XML sitemap, non-blocking `robots.txt`.

### 13. Social Share & Open Graph
- **Question:** Does the page present a compelling preview when shared on Slack, Twitter/X, LinkedIn, and iMessage?
- **Checks:** Valid `og:title`, `og:description`, `og:image` (1200×630px high-res), `twitter:card="summary_large_image"`, functioning favicon & Apple Touch icon.

### 14. Trust, Privacy & Legal
- **Question:** Does the website protect user rights, follow regional privacy laws, and inspire customer trust?
- **Checks:** Valid HTTPS/SSL, compliant cookie consent banner with explicit opt-out, accessible Privacy Policy and Terms of Service, security badges, money-back/refund policies.

### 15. Tracking & Analytics Hygiene
- **Question:** Do analytics and conversion pixels fire accurately without double-counting or firing on wrong triggers?
- **Checks:** Google Analytics / Meta Pixel events fire once per interaction, purchase revenue tracked accurately, unconsented tracking held until cookie approval.

### 16. Security Hygiene & Defense
- **Question:** Is the website hardened against common web exploits and data leakage?
- **Checks:** Security response headers (`CSP`, `HSTS`, `X-Frame-Options`), no API keys or secrets in client JS bundles, generic error messages (no database stack traces exposed to public), CSRF protection on forms.
