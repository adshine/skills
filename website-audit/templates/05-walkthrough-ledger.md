# Walkthrough Ledger (Completeness Contract)

> ⚠️ **SAMPLE DATA:** All rows below are fictional examples. Replace with the real audit's pages.

**Rule: the audit is not allowed to proceed to scoring (Phase 4) until EVERY crawled content page has a completed row here, or is explicitly listed in the Skipped table with a reason.** "I ran the scripts" does not complete a row; each row asserts that a human-judgment pass happened on that page.

**Primary intent of this site (one sentence):** Get prospective clients to submit the contact/quote form.
**Secondary intents:** Partner applications (CV upload), talent applications.

## Ledger (one row per page, no exceptions)

| Page | Screenshot viewed (desktop + 390px) | Interactions tested | Layout verdict | Intent verdict | Findings raised |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | yes | nav dropdowns, search, language switcher, hero slider, all CTAs | clean | advances (CTA above fold) | F-002, F-011 |
| `/pricing` | yes | plan toggle, all CTAs, FAQ accordions | clean | advances | F-001 |
| `/case-studies/` | yes | card hover, card links, pagination | BROKEN at 390px (grid collapses) | dead-ends (no CTA after proof) | F-033, F-040 |
| `/blog/` | yes | post links, sidebar search, category links | voids where featured images missing | dead-ends (no onward path) | F-035 |
| `/contact/` | yes | form empty submit, form valid submit (test data), map | clean | IS the intent | F-008 |

## Interactions checklist (minimum per page where present)

Nav menus and dropdowns (hover AND click), search, language switcher (confirm language changes), carousels/sliders, accordions/tabs, card grids (hover), every visible CTA button, forms (one empty submit for validation, one test-data submit where safe), mobile menu at 390px, footer links.

## Skipped pages (must be justified)

| Page | Reason skipped |
| :--- | :--- |
| `/tag/*` archives (11 pages) | Boilerplate archive layout identical to `/blog/`; spot-checked one |

## Persona journeys walked

| Persona | Path taken | Completed? | Friction found |
| :--- | :--- | :--- | :--- |
| Prospective client | Home > Services > Case Studies > Contact | yes, 3 clicks | proof page dead-ends; no CTA on case studies (F-040) |
| Job applicant | Home > (searched for careers) | NO | no careers path exists anywhere |
