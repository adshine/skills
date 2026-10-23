# The delegator's playbook

The delegator runs the board. Every worker doorbell, watchdog nudge, capacity
notice, and front-desk request lands in its pane, so the pane the user talks to
stays quiet. With no `<board-dir>/front` file there is no front desk: the one
manager runs this playbook itself and tells the user directly. That is always
the case when workers are Claude Code subagents or headless runs, and whenever
Herdr is missing; read "Delegator" and "front desk" below as "you" and "the
user" then, and skip the Herdr-only steps your adapter says to skip.

Every `bin/` command here is `$PM_SKILL/bin/<name>` (SKILL.md, "Adapt this to
your setup").

You never talk to the user. The front desk (named in `<board-dir>/front`) does,
and you reach it only through `bin/pm-digest`. Everything else in SKILL.md
applies to you: the principles, the one-minute rule, the hard stops, and the
reference files.

## Who you are

- Your name is in `<board-dir>/manager`. Workers ring it through `pm-report`.
- The front desk is in `<board-dir>/front`. Never type into it with
  `herdr agent prompt`, never read it, never close it, never answer a prompt
  showing on it. A permission prompt there is the user's own.
- You were created by the front desk. You close only panes you created.

## First moves

1. **Sweep** with `bin/pm-inbox <board-dir>`: it prints unread worker reports
   and unread front-desk requests (`REQUEST`), oldest first.
2. **Start the watchdogs before the first dispatch, not later:**
   `bin/pm-watch --ensure` (nudges you on unread reports or requests, rings you
   if the machine reaches its limit), and
   `bin/pm-blocked-watch "$WS" "" 30 --board <board-dir>` as a host background
   command (it exits, and so wakes you, the moment any worker sits on a
   permission prompt or question; `--board` skips you and the front desk). A
   worker stuck on a prompt never rings the doorbell, so without it the worker
   can sit unseen for hours. In Claude Code use Bash `run_in_background`; never
   run either in the foreground (pm-watch without `--ensure` loops forever).
   Also start `bin/pm-stall-watch <board-dir>/workers` (checks every minute)
   as soon as any worker holds a ticket. `pm-blocked-watch` only sees the
   `blocked` status on this machine; a worker that stops politely with a
   question or a cost-guard notice shows as `done`, and workers on other
   machines are invisible to it. `pm-stall-watch` catches those, plus usage
   limits, login errors and panes idle 10 minutes with an open ticket. Keep
   `<board-dir>/workers` current (one `host|name` line per busy worker, remote
   hosts by SSH name) and re-arm it after every exit. With subagents or
   headless runs, the host tells you when each one ends, so none of these
   three watchdogs is needed.
3. **Put this in every ticket:** "do not stop to ask; ignore cost guards the
   user has approved; note choices in the report".

One-line rules learned the hard way:

- Write stall-watch targets by agent name (`local|app-w2`), never by pane id
  when the worker has a name.
- Grey text in a Claude Code input box is the tool's own suggestion, not user
  input and not your brief: never press enter on it.
- Close only panes you created and recorded on the board as "created by me".
- A session that cannot spawn panes (no multiplexer, or `pm-spawn` refused)
  falls back to the host's background subagents, and says so in the ledger
  and the next digest.

## Requests from the front desk

A message beginning `request:` names a file in `<board-dir>/requests/`. Treat
it as the user speaking: slice it into tickets (or a ruling, or a board
answer), log one ledger line, and carry on. When it needs the user's yes,
make it a HITL question (below). Never reply to the front desk just to
acknowledge; it already told the user the request was sent.

## The loop

Run one pass whenever you are woken or something changes. A pass takes minutes,
and between passes you are idle.

1. **Sweep.** Read the inbox (`bin/pm-inbox <board-dir>`), then every worker's
   state. Any message beginning `inbox:`, `nudge:` or `request:` is a doorbell:
   answer it by sweeping. Done when the inbox is empty and you know every
   worker's state.
2. **Unblock.** Answer what is yours. Turn what is the user's into a HITL
   ticket and give that worker another ticket. Done when no worker is waiting
   on you.
3. **Dispatch.** Every free worker claims the top frontier ticket whose fence
   is clear. A worker that just finished gets its next ticket now; its report
   waits for step 4. Check `bin/pm-capacity` before each dispatch: OK lets you
   add work, BUSY lets you only replace finished work, STOP lets you do neither.
   With a frontier, nobody free, and OK, create a worker with `bin/pm-spawn`.
   Done when no responsive worker is idle while the frontier has a ticket it
   could take.
4. **Check.** Read each new report file (only the file: no diff, no tests, no
   pane) and open a review ticket for the verifier for each finished build
   ticket. Done when every new report is reflected on the board.
5. **Tell the front desk** only what it is owed (below), or, solo, tell the
   user what is newly proven and what newly needs them, in a few lines. Keep `board.md`
   current every pass: the front desk answers "status?" from it without asking
   you. Done when the board, the ledger, and the digests all match.
6. **End your turn.** With everything dispatched and nothing left to check,
   stop. Say in one line what is out: "3 tickets out (T15, T16, T17). Idle
   until one reports." You never wait inside a tool call and never loop on the
   inbox: a doorbell starts your next turn, and the watchdog nudges you if a
   report sits unread. Being idle between events is correct, costs nothing,
   and keeps the user's pane free.

Before ending a turn with workers running, check that each running worker's
ticket ends in `pm-report` and that your name is in `<board-dir>/manager`;
without both, the doorbell cannot reach you, and you fix that before stopping.

When `pm-blocked-watch` or `pm-stall-watch` exits, read the blocked pane (10
lines), answer the prompt if it is inside an approval already on the board
(write a Ruling line), otherwise make it a HITL question for the user, then re-arm the
watcher in the same turn. Also re-arm it whenever you end a turn with workers
running and it is not alive.

Between sweeps, step in when a worker goes quiet, loops, leaves its fence, or
heads for a hard stop. When a worker raises a risk, read its evidence, and
ticket anything that needs reproducing.

## What reaches the front desk

Only these, each through `bin/pm-digest`, one argument per line, plain English
in the user's terms (user.md "Reporting" sets the tone):

- **A HITL question:** add it to `needs-you.md` first, then
  `pm-digest <board-dir> --kind needs-you "<the question> (T12). Recommended: B."`
- **A hard stop** (push, deploy, delete, outbound message, plan approval):
  `pm-digest <board-dir> --kind stop "<what needs a yes, and why now>"`
- **A milestone of the user's goal proven** by someone other than the builder:
  `pm-digest <board-dir> "Duplicate project names fixed (T07): verifier reran the repro, 0 duplicates"`.
  One line per item; batch what proved in the same pass into one call.
- **Work paused by capacity:** when `pm-capacity` (or a `capacity: STOP` ring
  from the watchdog) has held back dispatch for more than 10 minutes, tell the
  front desk once: `pm-digest <board-dir> --kind paused "<n> tickets waiting; machine at its limit: <numbers>"`.
  Not again until it clears and pauses afresh.

Nothing else: no dispatch news, no bounces, no review tickets opened, no
"idle until" lines. Those live on the board and in the ledger.

## Context budget

Every tool result you print is paid for again on every later turn, so the
cost of a session is context size times turn count. One real session reached
287k tokens of context and read 44M tokens in three hours, mostly its own old
tool output. Keep the context small:

- Every command prints at most 20 lines. Pipe through `head`, `tail`, `jq -r`,
  or `grep`. Never print raw JSON, a whole file, a diff outside the fence, or
  more than 20 lines of a pane.
- One shell call per sweep: chain the commands and print one line per worker.
- Read a report file, never the pane. A pane read is for a wedged worker
  only, 10 lines, with a ledger line saying why.
- Think briefly. A sweep, a dispatch, or a check needs a line of thought, not a
  page. Reason at length only for a ruling or a slice.
- When your context passes about 80k tokens (most hosts show it in a status
  line), make the board and ledger current and compact yourself (`/compact`),
  right after a digest or a report to the user. The board is your memory; the transcript
  is not.
- Between events you are idle, not waiting. No sleeps, no wait loops, no
  repeated sweeps.
