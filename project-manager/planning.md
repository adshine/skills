# Planning large new work

Large new work gets a plan, a brainstorm, and one approval from the user before
any build ticket from it is dispatched. Everything else goes straight to
tickets.

## Is it large?

Yes when any of these is true: it would take more than about five tickets; it
changes what the product does for people; it touches shared ground (navigation,
data model, auth, the design system); or the user called it a phase, a feature,
or a redesign. A bug fix, a copy change, or a clear small request is not large,
whatever its wording.

## 1. Find the why

Before proposing anything, state in two lines why the user wants this and who
it is for, from what they said and the project's docs. If you cannot, that is
the first question in the plan, not a reason to stop.

## 2. Brainstorm

**With yourself,** always: write two or three genuinely different approaches,
each with what it costs and what it risks, and pick one with the reason.

**With advisors,** for anything architectural, expensive to undo, or where your
approaches feel equally good. Advisors are other models called headlessly. They
read, they answer, they change nothing. Launching one takes seconds, so you do
it yourself, in the background, and carry on with the loop.

Write one prompt file, `$PM_HOME/<project>/plans/<slug>/prompt.md`: the goal and
the why, the constraints and decisions already made, the docs worth reading,
and the ask: "Propose an approach and its main alternative with tradeoffs, a
slicing into tracer-bullet tickets with their blockers, the risks, the inputs
most likely to break it, and the product questions only the user can answer.
Under 500 words. Read anything you like. Change nothing."

Send the same file to two or three advisors, blind to each other. Use whichever
the user names. Otherwise use the headless agent CLIs you have installed
(check with `command -v`), preferring models from different vendors so the
answers are genuinely independent. Examples for common CLIs; check each tool's
`--help` for current flags before relying on them:

```bash
P=${PM_HOME:-~/.pm}/<project>/plans/<slug>
codex exec -c model_reasoning_effort="high" -s read-only -C "$PWD" -o "$P/codex.md" "$(cat "$P/prompt.md")" < /dev/null > "$P/codex.log" 2>&1 &
grok --prompt-file "$P/prompt.md" --effort high --permission-mode plan --cwd "$PWD" < /dev/null > "$P/grok.md" 2> "$P/grok.log" &
claude -p --permission-mode plan "$(cat "$P/prompt.md")" < /dev/null > "$P/claude.md" 2> "$P/claude.log" &
pi --no-skills --no-session --tools read -p "$(cat "$P/prompt.md")" < /dev/null > "$P/pi.md" 2> "$P/pi.log" &
opencode run "$(cat "$P/prompt.md")" < /dev/null > "$P/opencode.md" 2> "$P/opencode.log" &
```

Keep `< /dev/null` on every line, or the call hangs waiting for input. When
the user names a model, pass it with `-m <name>` (codex, grok) or
`--model <name>` (claude, pi, opencode). Ask for high reasoning effort for
planning wherever the CLI lets you set it.

Look for the answer files on later sweeps. Ten minutes is the most you wait:
whatever has arrived by then is what you use, and one advisor plus your own
thinking is enough. An advisor that errors or is at capacity is skipped with a
ledger line, and the next one in the list takes its place.

Done when you have your own approaches and every advisor answer that arrived
inside ten minutes.

## 3. Write the plan

`$PM_HOME/<project>/plans/<slug>/plan.md`, one page:

```markdown
# Plan: <name>

## Destination
What is true for the people using the product when this is finished.

## Why
Two lines.

## Approach
The one chosen, and why. Each rejected alternative in one line.
Where the advisors disagreed with each other or with you, and your ruling.

## Tickets
| # | Title | Kind | Blocked by | What it delivers |
Tracer bullets, in dependency order. Titles a person can read.

## Review focus
The inputs and failure modes most likely to break this effort as a whole.

## Not yet specified
Fog: what you can see coming but cannot ticket yet.

## Out of scope
What this effort deliberately leaves alone.

## Questions for you
Product calls only the user can make, each with options and a recommendation.
```

Done when every ticket has a blocker line and every question has a
recommendation.

## 4. One approval

Put the plan at the top of `needs-you.md` as a single question, "Approve the
plan for <name>?", with the plan's path and three answers: approve, approve
with changes, not now. In chat, give the user eight lines at most: the
destination, how many tickets, the first three, the biggest risk, and the
questions.

The approval attaches to the saved plan. The user liking the idea, or agreeing
a scope in conversation, has not approved a plan they have not seen.

While you wait, dispatch only the plan's tickets that read and do not build
(reproduce, research, baseline, preparing a prototype), and keep every other
approved piece of work moving. No build ticket from this plan leaves the
frontier until the answer is in.

After approval: write the ticket files, record the approval in the ledger in
the user's words, and open the frontier. This is the only approval the plan
gets. Changes that still reach the same destination are rulings. A change to
the destination goes back to the user as a new question.
