# Adapter: workers as Claude Code subagents

Use this when you run as the main Claude Code session and your workers are
subagents you launch with the Agent (Task) tool. No multiplexer, no panes, no
watchdogs: the host tells you when each subagent finishes.

## What maps to what

| Skill verb | With subagents |
|---|---|
| Create a worker | Launch a subagent. Pick the type (general-purpose, or a custom agent from `.claude/agents/`) that fits the ticket kind. |
| Dispatch | The subagent prompt is the one-line pointer: "Read `<absolute ticket path>` and do it. Write your report to `<absolute report path>`, then run the pm-report command the ticket gives." |
| Sweep | The list of running background subagents, plus `bin/pm-inbox <board-dir>`. |
| Doorbell | The subagent's completion notification. `pm-report` still files the inbox entry, which stays the source of truth; it finds no pane to ring and says so, which is fine. |
| Reset | Every subagent starts fresh. A bounce goes to a new subagent with the ticket, the report, and the Bounce section, or to the same one if your host can resume it with its context. |
| Wedged | A subagent that returns without a report file. Read its final message, return the ticket to the frontier, and dispatch it again with what was missing. |
| Verifier | A fresh subagent per review ticket. Prefer a different agent type or model from the builder's. |
| Worktree | Create it yourself with `git worktree add` (as in `herdr.md`, "Worktrees"), or use your host's worktree isolation option if it has one, and put the path in the ticket's Where line. |

## Running them

- Launch independent tickets together, in the background, so they run in
  parallel. End your turn once they are out; each completion wakes you.
- Write absolute paths into every ticket. A subagent does not share your shell,
  so `$PM_HOME` and `$PM_SKILL` must already be expanded.
- The git guardrail (`bin/git`) only applies when it is first on the worker's
  `PATH`. Subagents usually inherit your environment, so if you want it, start
  the session with `PATH="$PM_SKILL/bin:$PATH" PM_GUARD=1`. Otherwise the
  ticket's "How to work" section is the guardrail, so keep it whole.
- Capacity still matters on a laptop: check `bin/pm-capacity` before
  launching many at once (its agent count reads zero without Herdr; the memory
  and load checks still apply). Route full suites and builds through
  `bin/pm-heavy`.
- Subagents cannot ask you questions mid-run. Tickets must stand alone, and
  "do not stop to ask; note choices in the report" matters even more here.

## What you skip

`pm-spawn`, `pm-blocked-watch`, `pm-stall-watch`, and `pm-watch`'s pane
nudges are for long-lived workers in panes. With subagents, the completion
notification replaces all of them.
