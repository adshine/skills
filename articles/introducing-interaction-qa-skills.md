# Stop Guessing at UI Quality: Two Open Skills for AI Coding Agents

Modern coding agents can build an interface remarkably quickly. They can translate a prompt into components, wire up interactions, and produce a working application in minutes.

But "working" is not the same as correct.

A button can respond while its hover state jumps out of alignment. An accordion can open while its trigger is visibly off-center. A checkout flow can pass a frontend test while the backend records the wrong state. A page can match a reference at one viewport and fall apart on mobile.

These problems live between disciplines. They require visual judgment, interaction testing, frontend inspection, backend evidence, and a reliable way to explain what failed.

To help address this, I have published two open-source skills for `SKILL.md`-compatible AI coding agents:

- [Measured Visual QA](https://github.com/adshine/skills/tree/master/measured-visual-qa)
- [Full-Stack Interaction QA](https://github.com/adshine/skills/tree/master/full-stack-interaction-qa)

Together, they give coding agents a more rigorous way to inspect interfaces, diagnose interaction failures, and produce evidence that humans can review.

## The problem with "looks good"

Visual QA is often reduced to a screenshot and a subjective opinion: "It looks close enough."

That misses a lot. Spacing may be inconsistent by only a few pixels. Content can be technically centered but optically unbalanced. A hover animation may look correct at its final state while shifting neighboring elements during the transition. A scroll-triggered sequence may work in one direction but fail when reversed.

Traditional automated tests are good at checking discrete facts:

- Did the button receive a click?
- Did the request return `200`?
- Did the expected text appear?
- Did the route change?

Those checks are necessary, but they do not tell us whether the complete experience was correct. A user does not experience the frontend, backend, and animation system as separate layers. They experience one continuous interaction. Our testing methods should reflect that.

## Measured Visual QA

[Measured Visual QA](https://github.com/adshine/skills/tree/master/measured-visual-qa) helps an agent move from subjective inspection to evidence-led analysis.

The skill provides a workflow for:

- Measuring alignment, spacing, dimensions, and visual rhythm
- Comparing implementation screenshots against references
- Annotating screenshots so problems are easy to locate
- Extracting representative frames from screen recordings
- Examining transitional states, not only initial and final states
- Classifying visual and temporal failures consistently

Imagine a horizontal logo marquee. Each item is centered in its default container, then expands on hover to reveal a label. The resting state may look perfect. The final hover state may also look acceptable. The bug might exist only during the 150 milliseconds between them.

A neighboring logo could jump. The hovered item could drift away from its original center. Text could be clipped for two frames. The animation might expand from the left instead of symmetrically from the center.

Measured Visual QA treats those frames as evidence. Instead of guessing at the CSS, the agent can record the interaction, extract key frames, annotate the changing geometry, and identify the exact state where the visual contract breaks.

## Full-Stack Interaction QA

[Full-Stack Interaction QA](https://github.com/adshine/skills/tree/master/full-stack-interaction-qa) extends that discipline across the complete product interaction.

It helps agents capture and correlate:

- User actions and browser state
- Network requests and responses
- Console and runtime errors
- Backend events and persisted state
- Visual changes over time
- Final user-visible outcomes

It includes practical interaction models for saving, searching, uploading files, and completing payments.

Consider a file upload. The progress indicator reaches 100%, and a success message appears. A simple UI test might declare victory. But what if the backend job failed? What if the database still reports the file as processing? What if refreshing the page makes it disappear?

Full-Stack Interaction QA encourages the agent to establish a correlation contract across the entire flow. The click, request, server operation, stored state, and visible confirmation should describe the same successful interaction.

That is a much stronger conclusion than "the success message appeared."

## Better together

Measured Visual QA asks whether the interface looks correct, stays stable through every state, and matches the intended reference.

Full-Stack Interaction QA asks whether the interaction behaved correctly across every relevant layer and whether the visible result reflects what actually happened.

Used together, they support a complete quality loop:

1. Define the expected interaction.
2. Capture the action and its state changes.
3. Inspect network, runtime, and backend evidence.
4. Extract and compare important visual frames.
5. Classify the failure.
6. Produce a reproducible report.
7. Fix the implementation and repeat the evaluation.

This is especially valuable for AI coding agents. Agents are fast at generating code, but speed can encourage guesswork. A structured QA skill gives the agent a disciplined way to observe before editing and verify before claiming success.

## Install and test the skills

Clone the public repository and copy either skill into your agent's skills directory:

```bash
git clone https://github.com/adshine/skills.git adshine-skills
cp -R adshine-skills/measured-visual-qa ~/.codex/skills/
cp -R adshine-skills/full-stack-interaction-qa ~/.codex/skills/
```

Restart or reload your agent if it does not discover newly installed skills automatically. Other `SKILL.md`-compatible agents may use a different skills directory.

Try Measured Visual QA with:

> Record the accordion interaction on desktop and mobile. Extract representative frames, measure trigger alignment and content movement, annotate any failures, and produce a visual QA report before recommending changes.

Try Full-Stack Interaction QA with:

> Test the file-upload flow from selection through persisted completion. Correlate the browser state, network activity, backend result, and refreshed UI. Report any mismatch with reproducible evidence.

Try both together with:

> Evaluate this save interaction end to end. Confirm that the persisted state is correct, then inspect the loading, success, error, and refreshed visual states for alignment, layout shifts, and misleading feedback.

The best test is an interaction where you already know about a subtle bug. That makes it easier to assess whether the skill helps your agent discover the problem rather than merely describe the happy path.

## Help improve the skills

These are practical, evolving tools. Real-world feedback will make them better.

After testing, please share your agent and environment, the prompt you used, what the skill identified correctly, what it missed, and redacted screenshots, recordings, traces, or reports when possible.

Use the structured [skill feedback form](https://github.com/adshine/skills/issues/new?template=skill-feedback.yml) to report your experience.

The goal is straightforward: help agents stop guessing, start observing, and produce interface work that is not only functional, but visibly and behaviorally correct.
