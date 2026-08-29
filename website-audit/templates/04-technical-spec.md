# 🛠️ Technical Audit & Remediation Specification (Engineering Track)

**Target Environment:** Production (`https://example.com`)  
**Audit Reference Commit:** `git rev-parse HEAD`  
**Tooling:** Lighthouse 12.x, axe-core 4.9, Chrome DevTools, OWASP ZAP

---

## Detailed Defect Backlog & Code Fixes

### [F-001] Primary CTA Wrapped Below Viewport on Mobile Breakpoints
- **Area:** Conversion Path / Visual Layout
- **Severity:** High
- **Target URL:** `https://example.com/pricing`
- **Root Cause:** Container `.pricing-grid` has fixed `margin-top: 120px` and unconstrained hero banner height on viewport width ≤ 400px.
- **Evidence:** `screenshot: /artifacts/pricing-mobile-wrap-390px.png`
- **Remediation Code Diff:**
```diff
--- a/src/components/PricingSection.tsx
+++ b/src/components/PricingSection.tsx
@@ -14,7 +14,7 @@ export function PricingSection() {
   return (
-    <div className="pt-32 pb-20 px-4 max-w-6xl mx-auto">
+    <div className="pt-12 md:pt-28 pb-12 px-4 max-w-6xl mx-auto">
       <h1 className="text-3xl md:text-5xl font-bold text-center mb-4">
```
- **Verification Test:** Load `/pricing` in Chrome DevTools Device Mode (iPhone 14, 390×844) and assert CTA is rendered within top 600px of screen.

---

### [F-002] Promo Code Submission Returns HTTP 500 Unhandled Exception
- **Area:** Forms & Data Capture / Backend API
- **Severity:** Blocker
- **Target URL:** `https://example.com/checkout` (Endpoint: `POST /api/promo/apply`)
- **Root Cause:** Null pointer exception when promo lookup returns empty record without default fallback object.
- **Evidence:** `console.log: POST /api/promo/apply 500 (Internal Server Error)`
- **Remediation Code Diff:**
```diff
--- a/src/app/api/promo/apply/route.ts
+++ b/src/app/api/promo/apply/route.ts
@@ -22,6 +22,10 @@ export async function POST(req: NextRequest) {
     const promo = await db.promoCodes.findUnique({ where: { code } });
+    if (!promo) {
+      return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
+    }
```
- **Verification Test:** Submit invalid code `"TEST50"` on `/checkout` and assert UI displays inline toast `"Invalid promo code"` with HTTP 404, without crashing checkout flow.

---

### [F-003] Missing Accessible Name / Form Label on Email Input
- **Area:** Accessibility (a11y)
- **Severity:** High (WCAG 2.1 AA 1.3.1, 4.1.2)
- **Target URL:** `https://example.com/signup`
- **Offending DOM Node:** `<input type="email" id="user-email" placeholder="Enter your email">` (No `<label for="user-email">` or `aria-label`).
- **Remediation Code Diff:**
```diff
--- a/src/components/SignupForm.tsx
+++ b/src/components/SignupForm.tsx
@@ -10,6 +10,7 @@ export function SignupForm() {
   return (
     <div className="form-group">
+      <label htmlFor="user-email" className="block text-sm font-medium text-gray-700">Email Address</label>
       <input 
         id="user-email"
         type="email"
+        aria-required="true"
         placeholder="name@company.com"
```
- **Verification Test:** Run `npx axe-cli https://example.com/signup` and assert 0 violations for `label` rule.
