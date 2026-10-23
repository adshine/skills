# Adapter: workers in Herdr panes (optional)

**Optional.** Read this only if your workers run in
[Herdr](https://github.com/herdrdev/herdr) panes. With plain Claude Code subagents, read
`claude-code-subagents.md` instead. With tmux or another multiplexer, use this
file as a model and map each command onto your tool.

Herdr is the terminal workspace the panes live in. The `herdr` command is how
you sweep, dispatch, and create workers. Its own help is the authority on
syntax: run a group name alone (`herdr agent`, `herdr pane`, `herdr tab`) when
a command here fails. This file holds what the help cannot tell you.

Commands return large JSON. Read IDs from the response, and print only what you
need with `jq`. Keep any wait at 90000 ms or less so your shell tool outlasts
it.

## Your space

```bash
printf '%s\n' "${HERDR_ENV:-outside}" "$HERDR_WORKSPACE_ID" "$HERDR_PANE_ID"
```

- **Inside Herdr** (`1`): your workspace is `$HERDR_WORKSPACE_ID`.
- **Outside** (the user started you in another terminal): run
  `herdr workspace list` and adopt the one workspace whose folder or label
  matches the project folder you were started in. Tell the user in one line
  which you adopted. With no match or several, ask once. Outside there is no
  `--current`, so pass explicit pane IDs, and make your first worker tab with
  `herdr tab create`. If the list command fails, Herdr is not running: use
  the host's background subagents as workers (`claude-code-subagents.md`),
  and tell the user in one line that you are doing so. With no subagents
  either, give them tickets to paste.

The workspace decides the project. The project folder is where the workspace's
panes live (`herdr pane list --workspace "$WS"` shows each pane's folder), which
may not be the folder you were started in. When they differ, the workspace
wins.

Write the workspace ID on the board and use it wherever this file says `$WS`.
Everything you create, prompt, read, or close has a pane ID starting with
`$WS:`. Pass `--workspace "$WS"` wherever a command takes it.

Your tools for that are tabs, panes, and agents. `herdr workspace create`,
`herdr worktree create`, and `herdr worktree open` all open new workspaces, so
they stay unused, as do bare `herdr` and `herdr server stop`.

## Sweep

```bash
herdr agent list | jq -r --arg w "$WS:" '.result.agents[] | select(.pane_id | startswith($w)) | [.name // "-", .agent, .agent_status, .pane_id] | @tsv'
```

Your workers are those rows, minus your own pane, minus any other project
manager, minus panes the user has ruled out. Agents whose folder is a different
project go on the board as out of scope.

- `idle` or `done`: free. With a report file for its ticket, it has finished.
  With a claimed ticket and no report, read its last 10 lines.
- `working`: leave it.
- `blocked`: it is showing a question or an approval. See Unblock.
- `unknown`: read its last 10 lines.

## Dispatch

Write the Claim and Base into the ticket, then send a pointer:

```bash
herdr agent prompt app-w1 "Read $PM_HOME/<project>/tickets/T07-slug.md and do it. Hand in your report with the pm-report command it gives."
```

The prompt is always a one-line pointer to a file, for tickets, amendments, and
bounces alike. Send it without `--wait` and move to the next free worker. After
the last dispatch, sweep once: each worker you briefed shows `working`. A
timeout or stalled error means read the pane before resending, since it may
have arrived.

Reset a worker before an unrelated ticket, once its report file exists: prompt
`/new` (or `/compact` when the next ticket continues the same area), carry on
with the others, and dispatch to it on the next sweep when it is `idle`.

## A wedged worker

A briefed worker that stays `idle` with no report gets two minutes of your
time, spent like this:

1. Read its last 10 lines. If your text is sitting in its input box, send
   `herdr agent send-keys <name> enter` and look again after 20 seconds.
   Grey text in a Claude Code input box is the tool's own suggestion, not your
   brief and not user input: never press enter on it.
2. Still nothing: mark it `wedged` on the board with one line of what you saw
   ("context 99.9%, prompts echo, nothing runs"), return its ticket to the
   frontier, and dispatch that ticket to another worker, creating one if nobody
   is free.
3. Mention it in your next report. The pane is the user's to restart or close.

## Unblock

Read the pane, then:

- A question about the ticket: answer with `herdr agent prompt`.
- An approval for something inside the ticket (editing its fence, running
  tests, reading files): approve with the key the dialog shows, using
  `herdr agent send-keys <name> <key>`.
- Anything that is a hard stop: dismiss with `herdr agent send-keys <name> esc`,
  open a HITL ticket, and give the worker another ticket.

## Check

Read the report file. Pane text is not a source of truth and every line of it
lands in your context for the rest of the session. Read a pane only when a
worker is wedged or its report is missing, only its last 10 lines, and write a
ledger line saying why:

```bash
herdr agent read app-w1 --source recent-unwrapped --lines 10
```

With no report file and nothing useful in those lines, ask the worker to write
the report to its path and hand it in with `pm-report`.

## Being woken

You never wait. After dispatch you end your turn, and one of two things starts
the next one:

- **A doorbell.** A worker's `pm-report` types one line beginning `inbox:` into
  the pane named in `<board-dir>/manager` (the delegator's, when the board has
  a front desk; the front desk itself is never rung by workers). It needs your agent name, so set it once at the start:

```bash
herdr agent rename "$HERDR_PANE_ID" app-pm
echo app-pm > $PM_HOME/<project>/manager   # pm-delegate later swaps in app-delegate
```

- **A nudge.** The watchdog (`pm-watch`) types `nudge:` into the manager's pane when
  the inbox has held unread entries for more than two minutes, which covers a
  lost or failed doorbell.

Either way, read the inbox with `pm-inbox <board-dir>`: it prints every unread
entry and marks them read, so act on all of them, and never pipe it through a
filter. To look without marking anything read, use `pm-inbox <board-dir> --peek`.
`herdr agent wait <name>` is for the one case where you must know a specific
worker has settled before your very next command, such as a reset before a
brief, and never for passing time.

Outside Herdr you have no pane, so nothing can wake you: say so to the user and
end your turn; they will nudge you.

## Create a worker

When the frontier has a ticket, every responsive worker is busy, and the
ticket's fence is clear. Also when a ticket reaching fix round 4 needs a more
capable kind of agent and none is free.

**The machine has one budget, shared by every workspace and every manager.**
`bin/pm-capacity` gives the verdict, judged mostly on how many agents are
WORKING at once and on the operating system's memory-pressure signal (macOS;
elsewhere it falls back to free memory and load):

- `OK`: you may put one more idle worker to work.
- `BUSY`: the number working is at its limit. Hand a ticket only to a worker
  that has just finished, so the number working does not rise.
- `STOP`: dispatch nothing, close idle workers you created, and tell the user
  the numbers it printed.

None of these ever interrupts a worker that is already working. Capacity only
decides whether NEW work starts. Work in flight always runs to its finish, and
you close a worker only when it is idle and its report file exists.

Run it before every dispatch. Starting a NEW agent is judged more strictly
(`pm-capacity --spawn`, which `pm-spawn` runs for you): it also counts how many
agents are open and refuses while memory pressure is at warning, because an
idle worker you already have is always cheaper than a new one. A message in
your pane beginning `capacity: STOP` comes from the watchdog: treat it the same
way, at once. When your frontier is empty, close the workers you created: open
agents pile up in swap even when idle. With a front desk only the delegator
is rung; it tells the front desk once if work stays paused over 10 minutes.

**1. Make room.** A pane in a tab you own first, a new tab once that tab holds
about four panes or a split would leave them too small to read. Split wide
panes to the right and tall ones down.

```bash
herdr pane split --pane <pane-id> --direction right --cwd "<folder>" --env PM_GUARD=1 --no-focus
herdr tab create --workspace "$WS" --cwd "<folder>" --label "pm-workers" --env PM_GUARD=1 --no-focus
```

The new pane is `.result.pane.pane_id` from a split and
`.result.root_pane.pane_id` from a tab. `<folder>` is the project folder or the
ticket's worktree. `--no-focus` keeps the user's view still; only split, move,
and tab create accept it.

**2. Start the agent with `pm-spawn`, never with `herdr agent start` directly.**

```bash
$PM_SKILL/bin/pm-spawn app-w1 claude <pane-id>
$PM_SKILL/bin/pm-spawn app-w1 codex <pane-id>
$PM_SKILL/bin/pm-spawn app-w1 pi <pane-id>
$PM_SKILL/bin/pm-spawn app-w1 grok <pane-id>
$PM_SKILL/bin/pm-spawn app-w1 opencode <pane-id>
```

It checks capacity and refuses unless the verdict is OK, takes turns with other
managers so two cannot slip through together, turns the git guardrail on in the
pane (pushes, hard resets, cleans, forced branch deletes, stashes, and
stage-everything commands then exit 97; review.md covers lifting one), and adds
the flags set for each kind in `pm-spawn` (edit that case statement to match
your CLIs; by default codex and grok get `--yolo`, opencode `--auto`, pi
`--no-skills`). A refusal is an answer, not an obstacle:
reuse, wait, or close.

When the user named the kinds they want, or the board records a kind and tab
for this workspace (SKILL.md, Opening moves), use exactly those, in that tab.
Otherwise use the
agent CLIs installed on this machine, in the order the user prefers: take the
first that starts and is ready for input. When memory is tight, prefer the
lightest kind: agents that load every helper server (MCP) in the user's
settings can cost ten times the processes of a minimal one. A cheap, fast
model suits read-only tickets (research, reproduce); `opencode` with a cheap
default model fits that role well.

Name workers with a short project prefix and a number, matching any prefix the
existing workers use. Pane IDs such as `w1:p6` are not names. Names are
lowercase, start with a letter, and are unique across the whole session, so
take the next number when one is taken. When a start fails, times out, or lands
on a login, quota, or error screen: read why, close that pane, make a fresh
one, and try the next kind. When every kind fails, tell the user what each said.

Auto-approve (`--yolo`) agents run every command without asking. The guardrail catches git
accidents, and the ticket's "How to work" section carries the rest, so every
ticket for an auto-approve worker keeps that section whole. A yolo worker that
crosses a hard stop gets `herdr agent send-keys <name> ctrl+c`, no further
tickets, and a line in your next report.

**The verifier.** The first worker you create for a project is
`<prefix>-verify`, dedicated to review tickets and health checks (review.md).
Reset it with `/new` before each ticket. It counts toward capacity like any
worker, and it is the one worker you keep even when the frontier is empty.

**3. Record it** on the board (name, kind, pane, tab, created by you), then
dispatch.

## Worktrees

When tickets.md says a ticket needs one, make it yourself with plain git, then
give the ticket a pane whose folder is that path:

```bash
git worktree add "../<project>-wt/T07" -b T07-slug <base-commit>
```

Record the path and branch in the ticket's Where line. The merge ticket's
worker removes it afterwards:

```bash
git worktree remove "../<project>-wt/T07" && git branch -d T07-slug
```

## Clean up

Close a pane or tab you created once its worker's report file exists:

```bash
herdr pane close <pane-id>
herdr tab close <tab-id>
```

Close only panes your board records as "created by me"; looking idle is not a
reason. Panes the user set up are yours to brief and theirs to close, rename,
or restart.
