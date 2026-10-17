# Tickets and the board

A ticket is one file that is both the task and the worker's brief. The worker
has not seen your conversation, so the ticket stands alone.

```
$PM_HOME/<project-folder-name>/      (PM_HOME defaults to ~/.pm)
  board.md            the index, rewritten as things change
  ledger.md           append-only: dispatches, rulings, fix rounds, completions
  tickets/T07-slug.md one file per ticket
  reports/T07.md      written by the worker, one file per ticket
  inbox/              one file per finished or blocked ticket, from pm-report
  manager             the name workers ring: the delegator, or you when solo
  front               the front desk's name, only when a delegator runs (pm-delegate)
  requests/           front desk -> delegator, one file per user request (pm-request)
  digests/            delegator -> front desk, one file per digest (pm-digest)
  plans/<slug>/       plan, advisor prompt and answers (see planning.md)
  needs-you.md        open questions for the user (see user.md)
  handoffs/           see user.md
```

This folder lives outside the project so a deploy can never ship it.

## Whose board

A board belongs to one workspace and one manager, named in its first lines:

```
Workspace: wE "my-app"
Project: /absolute/path/to/project
Manager: pane wE:p4, since 2026-09-19 20:40
```

- **Finding yours.** In a multiplexer with workspace IDs (such as Herdr), your
  board is the one whose Workspace line names your workspace ID:
  `grep -lE '^Workspace.*\bwE\b' "${PM_HOME:-$HOME/.pm}"/*/board.md`.
  Otherwise, match the Project line to the project folder. Every other
  board in `$PM_HOME` belongs to someone else: you neither read it for work nor
  write to it, however relevant it looks.
- **One manager per board.** If the Manager line names a different pane that
  still hosts a live agent, that manager owns the board: tell the user and
  stop. If that pane is gone or is a bare shell, take the board over and
  rewrite the Manager line.
- **A new board** is named after the workspace label when your runtime has
  one, or the project folder otherwise, and is created only once you have a goal.

## Slicing

- **Tracer bullets.** Each build ticket cuts a narrow but complete path through
  every layer it needs (data, logic, UI, tests) and can be shown working on its
  own. Slice by user-visible behaviour, not by layer.
- **One fresh context.** Size a ticket so a worker starting from zero can finish
  and prove it in one sitting. Split anything larger.
- **Make the change easy, then make the easy change.** A refactor that makes
  the work simpler is its own ticket and blocks the work it helps.
- **Wide refactors go expand, migrate, contract.** For one mechanical change
  that touches the whole codebase: a ticket adds the new form beside the old, a
  ticket per batch moves callers over (each blocked by the expand), and a last
  ticket, blocked by every batch, deletes the old form. Tests stay green
  between tickets.
- **Verify the claim first.** A bug gets a reproduce ticket that blocks the fix
  ticket. Before ticketing any feature or fix, check it is not already built or
  already committed.
- **Scan for collisions as you slice.** For every pair of tickets that share a
  file or an interface, note what one produces and the other consumes, and
  either add a Blocked by edge or separate their fences. Write the pairs you
  checked in the ledger.
- **Batch the tiny ones.** Several small tickets of the same shape go to one
  worker as one ticket that lists each file and its change.
- **Fog stays fog.** Ticket a piece of work once you can state it sharply, even
  if it is blocked. Until then it is one loose line under "Not yet specified".

## Ticket kinds

| Kind | Default | Closes on |
|---|---|---|
| build | AFK | a passed review ticket |
| reproduce, investigate, research, baseline | AFK | your reading of its report |
| review | AFK | your reading of its report |
| merge, commit | AFK | your reading of its report |
| ops (push, deploy) | AFK after the user's yes | your reading of its report |
| explore (designs, mockups, generated images, written options) | AFK to produce | the user's reaction |
| bake-off (one explore or build ticket given to two or more agents) | AFK to produce | the user's pick |
| decision, prototype reaction, manual step | HITL | the user's answer |

A HITL ticket is resolved only by the human. Record their answer in the ticket
in their words. For a manual step, give the user a precise checklist.

**Work that is not code.** An explore ticket produces files, not a diff. Its
fence is an output folder, outside shipped folders. Its acceptance says exactly
what to produce (which screens or options, how many, format, file names), which
sources are the authority (the design system, a reference the user named), and
what must stay true (real routes, real copy, nothing invented). Base, tests,
and the commit step do not apply.

**A bake-off** gives the same ticket to two or more agents of different kinds,
each with its own output folder, blind to each other, so the user can compare.
Use it when the user asks several agents to do "it", or when taste decides the
outcome. Splitting the work between the agents is the other reading of such a
request: say which one you chose.

## The ticket file

When you write a ticket from this template, replace `$PM_HOME` and
`$PM_SKILL` with absolute paths: the worker does not share your shell.

```markdown
# T07: <outcome the user would recognise>

Kind: build | AFK          Status: frontier
Blocked by: T03, T05       (or: none)
Claim:                     (worker name, written at dispatch)
Base:                      (commit SHA, written at dispatch)
Where: main tree           (or: worktree path and branch)
Fence: <files and folders this ticket owns while it runs>
Report to: $PM_HOME/<project>/reports/T07.md

## Why
The user problem this solves, so you can make the small calls well.

## Current behaviour
What happens now. For a bug, the broken behaviour and how to see it.

## Desired behaviour
What should happen when you are finished, including edge cases and errors.
For UI: every state a person can hit (empty, loading, error, success,
duplicate, permission denied), the exact copy or the writing guide to follow,
where errors appear (field or page), keyboard and screen reader behaviour, and
the design system rules that apply.

## Key interfaces
Types, functions, routes, components, or config shapes to look for or change.

## Decisions already made
Product and UX calls that are settled. Build on them.

## Acceptance
- [ ] Each line independently checkable, with the exact command where one exists
- [ ] ...

## Review focus
Up to five inputs or failure modes this ticket implies but no acceptance line
names (empty input, a duplicate, a slow network, a long name, a second click).
Each gets a test in this ticket.

## Out of scope
Adjacent things to leave alone.

## Skills to read first
One or two file paths, only if the ticket needs them.

## How to work
Typecheck often, run single test files often, run the project's full suite once
at the end. Anything heavy (a full suite, end-to-end or browser tests, a
production build) runs through the machine-wide queue so only one runs at a
time: `$PM_SKILL/bin/pm-heavy <command>` (write both paths out in full in
the ticket). If it exits 75,
the machine cut the run short: that says nothing about your code, so change
nothing, wait, and run it again.

Work so that an interruption never leaves the project broken. Move in small
steps that each leave it building and its tests runnable, and finish the step
you are on before starting the next. After each step, save a checkpoint: in a
worktree, a commit on your branch titled `WIP <ticket>: <what works now>`; in
the shared main tree, `git diff -- <your fence> > $PM_HOME/<project>/reports/<ticket>.wip.patch`.
If you have to stop mid-step, say exactly what is half-done at the top of your
report. The project's suite defines green: report every failure by name,
including ones you did not cause. Do the work yourself, without spawning
subagents or your own reviewer. Stay inside your fence and your working
folder; this ticket and your report are the only files you touch outside it. If you need a change in a file
outside your fence, put the exact patch in your report. Stage and commit by
explicit file path, and only when this ticket says to commit. Leave shipped
folders free of test data and remove scratch files. Deploys, pushes, data
deletion, and outbound messages belong to the user: if your task seems to need
one, stop and say so in your report. A git command that exits 97 was stopped by
the manager's guardrail: report it and wait.

## Report
Write to the path above, under 30 lines: files changed, commands run with real
output, state checks or screenshots for UI work, each acceptance line ticked or
explained, anything skipped, open questions, patches for files outside your
fence. Fix rounds append to the same file. Status is one of DONE,
DONE_WITH_CONCERNS, NEEDS_CONTEXT, BLOCKED. Then hand it in with this one
command, which files it in the manager's inbox and lets them know:

$PM_SKILL/bin/pm-report $PM_HOME/<project> T07 <STATUS> "<optional note>"

Report only this way. Never type into the manager's pane or another worker's
pane, and never edit another ticket's report.
```

**Gates inside a ticket.** When other work is waiting on a step in the middle
of a ticket (the first of several merges, a schema landing before its callers),
name that step in the ticket and have the worker hand it in as a MILESTONE with
a one-line note, then keep going without waiting for you:
`pm-report $PM_HOME/<project> T07 MILESTONE "chat-components merged at <sha>"`.
You act on the milestone the moment it rings. The worker never has to stop and
be told to continue.

Writing rules:

- **Behavioural.** Describe what the product should do and let the worker find
  how. The Fence line is the one place file paths belong.
- **Checkable.** Every acceptance line can be verified on its own. "Works
  correctly" is not a criterion.
- **Non-build tickets** keep the same file and replace Current, Desired, and
  Interfaces with "What to find out" and "How to prove it".

## Handling the status line

| Status | What you do |
|---|---|
| DONE | Quick check, then a review ticket (review.md). |
| DONE_WITH_CONCERNS | Read the concerns first. Correctness or scope concerns are settled before review. Observations go in the ledger. |
| NEEDS_CONTEXT | Amend the ticket with what was missing and send the pointer again. |
| MILESTONE | The worker is still going. Open whatever that step was gating, now. |
| BLOCKED | Change something before retrying: more context, a more capable kind of agent, a smaller slice, or a ruling that corrects the ticket. The same ticket to the same worker unchanged is never the answer. |

## Skills by ticket kind

If you have [Superpowers](https://github.com/obra/superpowers) or
[Matt Pocock's skills](https://github.com/mattpocock/skills) installed, point
to them: set `SP` to the `skills/` folder of your Superpowers copy and `MP` to
the `skills/` folder of Matt Pocock's, wherever your install put them (a
plugin folder, a vendored clone, `~/.claude/skills`). Otherwise list your
installed skills (`ls ~/.claude/skills ~/.agents/skills 2>/dev/null`, or your
host's skill list) and pick the one that fits each kind. Skill names and
folders change upstream, so check a path exists before putting it in a ticket.
Put one path, two at most, in the ticket, written out in full. Read one
yourself only when you need it to write the ticket.

| Kind | First choice | Alternative |
|---|---|---|
| reproduce, investigate a bug | `$SP/systematic-debugging/SKILL.md` | `$MP/engineering/diagnosing-bugs/SKILL.md` |
| build | `$SP/test-driven-development/SKILL.md` | `$MP/engineering/tdd/SKILL.md` |
| review | `$SP/subagent-driven-development/task-reviewer-prompt.md` | `$MP/engineering/code-review/SKILL.md` |
| re-review after a fix | `$SP/subagent-driven-development/re-review-prompt.md` | |
| merge | `$SP/finishing-a-development-branch/SKILL.md` | |
| research | `$MP/engineering/research/SKILL.md` | |
| prototype for the user to react to | `$MP/engineering/prototype/SKILL.md` | |
| before claiming anything works | `$SP/verification-before-completion/SKILL.md` | |
| anything else | list your installed skills, pick the one folder that fits | |

## Frontier and claim

Order the frontier by user impact, then risk, then cost: anything live that is
broken, wrong, or leaking test data; then whatever blocks another ticket; then
the user's stated priorities in their order; then quality and cleanup.

At dispatch, write the Claim and the Base into the ticket, set Status to
`claimed`, append `T07: dispatched to app-w1 at <base7>` to the ledger, then
point the worker at the file. Statuses: `fog`, `blocked`,
`frontier`, `claimed`, `in review`, `bounced`, `done`, `out of scope`.

## Changing a running ticket

- **Amend:** append a dated "Amendment" section to the ticket saying what
  changes and what still stands, and send the worker a one-line pointer.
  Interrupt mid-turn only when the current direction is wasting work.
- **A missed instruction goes out at once,** as a one-line amendment to every
  worker it affects. A rule the workers have not been told does not exist.
- **Bounce:** append a "Bounce" section: the state of the diff now, the named
  gap with the reviewer's evidence, and what finishing looks like. The builder
  keeps its context for a bounce.

## Running tickets in parallel

- **Blocked by is the whole dependency story.** A ticket that builds on code
  another ticket is about to replace is blocked by it, so it is written once.
  Tell the user this is sequencing.
- **The shared main tree is the default.** Tickets with clearly separate fences
  run side by side in it.
- **A worktree when it is needed:** the fence overlaps a running ticket's; the
  ticket will leave the tree broken or half-built for a while; it changes
  shared ground (dependencies, config, schema, generated files); or its test
  runs would collide with another's. Unsure whether two fences overlap counts
  as overlap. Cut it from the current base into
  `../<project-folder-name>-wt/<ticket-id>`, and make the worker's first step
  getting dependencies working there and confirming the tests run.
- **Merging is a ticket.** One merge at a time into the main tree, suites rerun
  after each, then the same worker removes that worktree and branch.

## The board

`board.md` is an index. Detail lives in the ticket; the board gists and points.
Keep it current enough that you could be reset at any moment and carry on from
it.

```markdown
Workspace: <id> "<label>"
Project: <absolute path>
Manager: pane <id>, since <date time>
I am the project manager for <project>. Product files change only through
workers. Before acting, re-read the project-manager skill.
Goal: <the user's goal, in their words>
Branch: <name>   Baseline: <SHA, suite: pass/fail counts, or "none needed">

## Workers
name | kind | pane | state | ticket | created by me

## Tickets
ID | title | kind | status | claim | blocked by

## Needs the user
One line per open HITL ticket, pointing at needs-you.md.

## Decisions
One line each: the call, the reason, the ticket it came from.

## Not yet specified
Fog: work that is coming but cannot be stated sharply yet.

## Out of scope
Work, panes, and agents ruled outside this effort, each with one line of why.
```
