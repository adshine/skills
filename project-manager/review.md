# Review, done, and shipping

Build tickets close on a passed review ticket. Every other kind closes on your
reading of its report. The shape here follows Superpowers'
subagent-driven-development: a task review per ticket, a capped fix loop, and
one broad review of the whole branch before it merges or ships.

## Your part: read the report, nothing else

When a build ticket hands in, you read its report file and its one-line status.
That is the whole of your check. You do not open the diff, run `git status`,
run a test, or read the worker's pane: every one of those is the verifier's
job, and a manager who does them drifts into judging work from a 200k-token
context, which is the worst seat in the house for it.

From the report you decide one thing: is there enough here to review (files
changed, commands with real output, acceptance lines ticked or explained)? If
yes, open a review ticket for the verifier. If not, bounce it to the builder
with the missing item named.

Done when the ticket is `in review` with a review ticket dispatched, or
`bounced` with the gap named.

## The verifier

Every project has one standing worker for reviews, named `<prefix>-verify`,
created with `pm-spawn` like any worker. It never builds. Before every review
ticket you reset it with `/new`, so it is always fresh and never the builder.
Where you can, make it a different kind of agent from the builders.

## The review ticket

Claimed by the verifier. It gets the ticket path, the report path, the Base,
and the current head. It treats the builder's report and its stated reasons as
unverified claims, stays read-only on the code, and works alone. It runs a
focused test only where reading raises a doubt no existing run answers. Full
suites rerun at merge and at the final review.

It starts with the quick check, reported as pass or fail with evidence:

1. `git diff <base>...HEAD` plus uncommitted changes, limited to the fence.
   Does it do the ticket, and only the ticket?
2. `git status` for leftovers: scratch scripts, test records, stray folders,
   modified registries or indexes.
3. The report's command list for anything outward-facing (push, deploy,
   delete, send).

Then three axes under separate headings, never merged or ranked across:

- **Spec:** missing (asked for, not built), extra (built, not asked for),
  misunderstood (the right thing built the wrong way). Each finding quotes the
  ticket line. Behaviour the ticket never mentions is judged by what a
  reasonable user would expect, so a crash on an unnamed input is a real
  finding.
- **Standards:** where the diff breaks the design system, the UX writing guide,
  or the repo's documented conventions, citing the rule. Skip what tooling
  already enforces. Noise or warnings in the builder's test output count.
- **States:** the rendered UI in every state the ticket names, at the widths
  that matter, with keyboard and screen reader behaviour. Evidence per state is
  a screenshot path or a checked value.

Every finding carries a severity: **Critical** (broken, unsafe, or loses data),
**Important** (a user would notice, or the ticket's intent is not met),
**Minor** (polish). The report ends with a **Declined to judge** list of
anything the reviewer could not verify from the diff, and you rule on each
item.

Prompt templates to hand the reviewer, if you have
[Superpowers](https://github.com/obra/superpowers) installed:
`skills/subagent-driven-development/task-reviewer-prompt.md` in your copy of it
and, for a re-review, `re-review-prompt.md` beside it. Without it, the three
axes above are the brief.

## Explore and bake-off tickets

There is no diff to review. Your check is a look at the output folder: every
file the ticket asked for exists, is named as asked, opens, and follows the
authority the ticket named. Anything missing goes back to the worker as a
bounce. Then the ticket goes to the user through `needs-you.md`, with the
folder path and, for a bake-off, the entries side by side. It closes on their
reaction or pick, recorded as a Decision. What they pick becomes the input to
the build tickets that follow.

## The fix loop

The loop opens on a failed Spec axis, any Critical or Important finding, or a
declined item you confirmed as a real gap. Minor findings never enter it: each
becomes a ledger line (`T07: minor (deferred): <one-liner>`) for the final
review to triage.

One round is one fix plus one scoped re-review. Five rounds at most.

- **Rounds 1 to 3: the original builder,** with its context intact. Append a
  Bounce section to the ticket (tickets.md) carrying the open findings verbatim,
  and send the pointer. A busy builder takes the bounce next.
- **Rounds 4 and 5: a fresh worker of a more capable kind** (for example a
  stronger model, or a different CLI agent from the one that built it), given the ticket, the report file, the open findings, and this framing:
  "A prior builder attempted this [N] times. You own it now. Read the report
  file for what was tried."
- **Every round:** the builder fixes, reruns the tests covering the changed
  code, and appends the tests, the command, and the output to the same report
  file. The re-review is scoped to the diff since the head the last review saw.
  It marks each finding ADDRESSED or NOT ADDRESSED and flags new breakage in
  that diff only. Anything else it notices is a deferred minor.
- **After each round,** append to the ledger:
  `T07: fix round 2/5 (3 addressed, 1 open: <one-liner>; commits a1b2c3d..e4f5a6b)`

**Outages and live checks are tickets too.** When production looks down or a
deploy needs a health check, the verifier gets a "check and report" ticket
with the exact URL or command. You do not run `curl` yourself.

**The breaker.** If round 5 still leaves findings open, stop dispatching and
adjudicate each one yourself, only now and never earlier:

- The reviewer is wrong or the point is arguable: park it with
  `T07: parked / <finding> / Ruling: <why the code stands>`.
- Real, but nothing else builds on it: park it the same way, marked real and
  deferred.
- Real and load-bearing: rule on the smallest change that unblocks the tickets
  that depend on it, ledger the ruling, and carry it into their tickets. If it
  shows the slicing was wrong, re-slice.

Every adjudication is a ledger line. Nothing is dropped silently.

## Passed

When the review is clean, or every open finding is parked with a ruling at the
cap:

1. A commit ticket (the builder if free, otherwise any worker): stage and
   commit the fence's files by explicit path, clear message, on the ticket's
   branch.
2. Append `T07: complete (commits <base7>..<head7>, review clean)` or
   `(..., 2 parked)` to the ledger, and mark the ticket `done` on the board.
3. If it ran in a worktree, a merge ticket joins the frontier.
4. Tell the user.

## The final review

Before a body of work merges to the main branch or is offered to the user for
pushing, one broad review ticket covers the whole branch:
`git diff $(git merge-base origin/<main> HEAD)...HEAD`, the full suites, the
main user journeys rendered end to end, and the ledger's deferred minors and
parked findings, triaged into "fix before shipping" and "fine to leave". Give it
to the most capable kind of agent you have. Its must-fix list becomes tickets.

## Pushing and deploying

These are the user's. An ops ticket exists only after the user's yes for that
specific change, quoted in the ticket. One ops ticket runs at a time, from the
main tree. Its first step is checking `git status` and the shipped folders for
stray files and test data, and stopping if it finds any.

Workers you started run git through a guardrail that stops pushes. The ops
ticket lifts it for the one command, exactly as written here:

```bash
PM_ALLOW=push git push origin <branch>
```

Other rules the guardrail enforces, with the name that lifts each:
`reset-hard`, `clean`, `branch-delete`, `stash`, `add-all`, `commit-all`,
`discard-all`. Lift one only inside a ticket, for one command, with the reason
written in the ticket. `add-all` and `commit-all` stay on always.
