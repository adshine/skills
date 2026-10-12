---
name: design-system-layers
description: Sort a design system problem, request, or debate into the layer it belongs to (foundation, component, or pattern) before changing anything, then route the fix to that layer. Use when a design system "feels fragile" or inconsistent despite a big component library, when a component keeps growing props or variants, when a design review or ticket is going in circles, when asked to add or change a component that might really be a flow problem, or when auditing where a system is under-invested. Not for building tokens or theming (design-system-patterns), extracting a system from a site (extract-design-system), or sweeping code for palette violations (audit-design-system-violations).
---

# Design System Layers

A design system does three different jobs. Most "the system is broken" complaints are a fix aimed at the wrong job.

| Layer | Question it answers | Examples | Changes | Owned by | Done when |
|-------|--------------------|----------|---------|----------|-----------|
| **Foundation** | *Why* is it this way? | Color logic, type ramp, spacing rhythm, motion stance, density, voice, accessibility floor | Rarely; expensive, everything inherits it | Small senior group / foundations owner | Each rule has written reasoning and a tie-break for its known conflicts |
| **Component** | *What* is this block and what states does it have? | Button, input, card, modal, table, date picker widget | Sometimes | Design system team + its engineers | Built only from foundation values; full state set; small, stable API |
| **Pattern** | *How* does it work for the user, in context? | Search and filter, checkout, onboarding, settings, error recovery, booking date selection | Most often, as user needs move | DS team together with the product team that lives in it | Documented once with when-to-use, sequence, states, errors, and allowed adaptations |

Users never meet components. They meet patterns. Foundations have the most leverage and the least visibility; components have the most visibility. Teams tend to invest by visibility, so components get overbuilt and the other two get starved.

## Step 1: Name the layer before touching anything

For every request, complaint, or open review thread, ask in order:

1. Is it about meaning, rules, or values that many things should inherit? -> **Foundation**
2. Is it about one reusable block, its props, or its states? -> **Component**
3. Is it about solving a recurring user problem across screens or in a specific context? -> **Pattern**

If a single thread contains more than one answer, split it into one item per layer and resolve each separately with its owner. Say the split out loud in the output: "This is three questions: spacing (foundation), the widget's states (component), and how dates are picked during booking (pattern)."

## Step 2: Check for a misrouted fix

These symptoms mean the work is landing on the wrong layer:

| Symptom | Real layer | What to do instead |
|---------|-----------|--------------------|
| A component keeps gaining props/variants, one per screen that uses it | Pattern | Keep the component small; define the contexts as separate patterns that compose it |
| Same component, slightly different size, padding, or "almost brand" color in each product area | Foundation | Write down the missing rule and its reasoning, then tokenize it |
| Tokens exist but people override them whenever inconvenient | Foundation | Tokens without reasoning are just numbers; add the why and the conflict tie-breaks |
| Polished library, product still feels like several products | Pattern | Inventory duplicate flows (onboarding, search, settings, errors) and converge them |
| One component used for several meanings (summary, teaser, warning, confirmation) | Pattern | Add when-to-use guidance at the pattern level, not more component variants |
| Progress reported as "N components shipped" | All | Report foundations with written reasoning and patterns documented, not part counts |
| Review debate loops for a long time with everyone "right" | Mixed | Go back to Step 1 and split by layer |

## Step 3: Act at the right layer

- **Foundation fix:** Write the rule, the reasoning, and how to decide when it conflicts with something else (for example brand color vs contrast, density for power users vs newcomers, when the type scale may grow). Only then change token values. Flag every component and pattern that inherits the change.
- **Component fix:** Change only what the block is and its states. Every value must trace to a foundation. If the proposed change exists to serve one screen or flow, stop: it belongs in a pattern.
- **Pattern fix:** Describe the user problem, the composition of components, the sequence, empty/loading/error/recovery states, content rules, and which parts product teams may adapt. Involve the product team that owns the context.

When working in code, the same split applies: foundations live in tokens/theme plus their docs, components in the shared library, patterns in composed flows, recipes, or page-level templates. A prop that only one call site uses is a strong hint the logic belongs one layer up.

## Auditing a whole system

When asked where a system is weak, report all three layers, not just the component count:

1. **Foundations:** list each foundation area; mark whether it has reasoning written down or only values. Note conflicts with no tie-break.
2. **Components:** count, but also flag prop/variant bloat, values not traceable to tokens, and components used for several meanings.
3. **Patterns:** list recurring user problems in the product; for each, count how many different implementations exist and whether one documented pattern exists.
4. Recommend where the next investment goes, weighted by leverage (foundations) and user impact (patterns), not by visibility.

## Output shape

Lead with the layer verdict in one sentence, then the fix at that layer, then any items split off to other layers with their owners. Example:

> This is a pattern problem, not a component problem: the date picker has grown props because booking, reporting filters, and profile birthday each need different behavior. Keep the widget to its states; document three date-selection patterns. Separately, the spacing complaint is a foundation gap: there is no written rule for control padding at compact density.

Source idea: Ethan Feng, "Your design system isn't broken. You're just confusing its three layers." (Medium, Sep 2026). This skill restates the framework in operational form.
