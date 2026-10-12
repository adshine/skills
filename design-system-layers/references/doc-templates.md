# Doc templates

Short is fine. A page with real "when not to use" guidance beats a long page of screenshots.

## Foundation page

1. **Rule:** the decision in one or two sentences.
2. **Why:** the reasoning (brand, accessibility, users, platform).
3. **Values:** link to the tokens; show the scale.
4. **Conflicts and tie-breaks:** what wins when this rule meets another (for example contrast beats brand hue).
5. **How to change it:** who owns it, what downstream breaks, changelog entry.

## Component page (merged from GOV.UK, Carbon, Material 3)

1. **What it is:** one line.
2. **When to use / when not to use:** name the alternative for each "not".
3. **Anatomy:** numbered parts.
4. **Variants and states:** default, hover, focus, pressed, disabled, loading, error, selected (only those that apply).
5. **How it works:** behavior and content rules (label wording, truncation, preventing double submit).
6. **Specs:** table of state x element (container, label, icon) with the sys token used.
7. **Accessibility:** keyboard, focus order, screen reader label, contrast, 200% text size, target size.
8. **Code:** import, minimal example, props that matter.
9. **Changelog / help improve this component.**

## Pattern page

1. **User problem:** what the user is trying to do, in their words.
2. **When to use / when not to use.**
3. **Options:** one or more solutions, each with when to choose it.
4. **How it works:** step sequence; components used; empty, loading, error, and recovery states; content and microcopy rules; input autocomplete attributes for forms.
5. **Allowed adaptations:** what product teams may change and what must stay fixed.
6. **Accessibility:** focus management across steps, error announcement, timing.
7. **Example screens:** rendered in every theme.
8. **Related components and patterns; evidence or research; feedback link.**
