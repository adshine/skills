# Severity Rubric & Decision Rules

Every finding must be assigned a severity based on an objective **two-axis decision matrix** (Goal Impairment × User Breadth), not subjective adjectives.

---

## The 2-Axis Decision Matrix

| Severity | Goal Impairment (Can the user finish?) | User Breadth (Who is affected?) | Business & Legal Context | Report Target |
| :--- | :--- | :--- | :--- | :--- |
| **Blocker** | Completely halts primary task (cannot sign up, checkout, log in, or submit). | Most or all users on any supported device/browser. | Immediate revenue loss or total compliance failure. | Exec Summary & Tech Spec |
| **High** | Halts primary task for a subset of users (e.g. mobile Safari only, screen reader users) OR breaks secondary task for all users with wrong data / broken trust. | Significant subset (e.g. all mobile users, 15%+ a11y audience). | Severe friction, brand damage, or legal exposure. | Exec Summary & Tech Spec |
| **Medium** | Task completes, but with high friction, layout breakage, confusing state, or WCAG non-blocking violation. | Moderate subset. | Measurable drop in conversion efficiency. | Tech Spec (Aggregated in Exec) |
| **Low** | Task completes easily; minor visual polish, spacing, copy inconsistency, or harmless console warning. | Any. | Quality & craftsmanship debt. | Tech Spec only |
| **Nit** | Subjective stylistic preference or editorial suggestion (not a defect). | N/A. | Minor aesthetic opinion. | **Never in Executive Summary** |

---

## Executive Inclusion Rule
- **Blockers & Highs:** Must be featured prominently with financial/brand impact in the Executive Summary.
- **Mediums:** Listed in summary counts and roll-up metrics.
- **Lows:** Kept strictly within the technical findings backlog.
- **Nits:** Documented only in developer scratch notes or excluded completely.
