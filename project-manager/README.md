# project-manager

Turn one agent session into a project manager over a team of worker agents.
It slices what you want into tickets, dispatches them to workers, has a
separate verifier review every build, and tells you in plain English what is
proven done and what needs your decision. It never builds product code itself.

Works with Claude Code subagents out of the box, and with long-lived workers in
terminal panes (Herdr, tmux, separate sessions) through adapters.

## What you get

- **Tickets as files.** Each ticket is the task and the worker's brief in one
  file, so a worker with zero context can finish it. Reports, an inbox, a
  board, and an append-only ledger live beside them, outside your repo.
- **Rulings, not stalls.** The manager settles routine calls itself and logs
  them, and only stops for you on product decisions and anything irreversible
  (push, deploy, delete, send).
- **Evidence before "done".** Builders hand in a report; a fresh verifier
  checks spec, standards, and rendered states; a capped fix loop handles
  bounces; one broad review runs before anything ships.
- **Machine-friendly.** A git guardrail stops workers from pushing, hard
  resetting, or sweeping up each other's changes; a heavy-job queue runs one
  full test suite or build at a time; a capacity check refuses new work when
  memory is short.

## Install

```bash
git clone https://github.com/adshine/skills.git ~/adshine-skills

# symlink (stays current with git pull)
ln -s ~/adshine-skills/project-manager ~/.claude/skills/project-manager
# or for agents that read ~/.agents/skills
ln -s ~/adshine-skills/project-manager ~/.agents/skills/project-manager

# or copy
cp -R ~/adshine-skills/project-manager ~/.claude/skills/
```

Then ask your agent to "manage this project" or "coordinate workers on X".

## Adapt it to your setup

The skill reads its setup rather than assuming one. `SKILL.md` has an
"Adapt this to your setup" section; the short version:

| Setting | Default | Change it |
|---|---|---|
| Worker runtime | whatever you have | `adapters/claude-code-subagents.md` for Claude Code subagents; `adapters/herdr.md` (optional) for Herdr panes; map the same verbs for tmux or anything else |
| State folder | `~/.pm/<project>` | `export PM_HOME=/your/path` |
| Skill folder | discovered from where `SKILL.md` loaded | nothing to set |
| Helper skills | none required | installs of Superpowers or Matt Pocock's skills are used when present; otherwise it lists your installed skills |
| Capacity limits | from RAM size | `PM_MAX_WORKING`, `PM_MAX_AGENTS`, `PM_DISK_PATH` |
| Spawn flags per agent kind | in `bin/pm-spawn` | edit its case statement |

## Files

```
project-manager/
  SKILL.md                        the role, principles, loop, hard stops
  planning.md                     large new work: brainstorm, plan, one approval
  tickets.md                      ticket template, slicing, board, parallel work
  review.md                       verifier, fix loop, final review, shipping
  user.md                         reporting, questions, handoffs, crash recovery
  adapters/claude-code-subagents.md
  adapters/herdr.md               optional, for Herdr panes
  bin/
    pm-report  pm-inbox           worker hands in; manager reads the inbox (any runtime)
    git                           guardrail wrapper put first on a worker's PATH (any runtime)
    pm-heavy                      one heavy job at a time per machine (any runtime)
    pm-capacity                   OK / BUSY / STOP verdict (macOS and Linux; agent count needs Herdr)
    pm-watch                      capacity alarm and inbox nudges (nudges need Herdr)
    pm-spawn  pm-blocked-watch  pm-stall-watch   Herdr only
```

Dependencies: bash, git; `jq` for the Herdr scripts; zsh and python3 for
`pm-stall-watch`.

## Credits

This skill optionally points workers at two excellent skill collections when
you have them installed:

- [Superpowers](https://github.com/obra/superpowers) by Jesse Vincent: the
  per-ticket review, capped fix loop, and final review follow its
  subagent-driven-development flow, and tickets can cite its debugging, TDD,
  and verification skills.
- [Matt Pocock's skills](https://github.com/mattpocock/skills): diagnosing
  bugs, TDD, code review, research, and prototyping skills for tickets.

Worker panes in the optional adapter run on
[Herdr](https://github.com/herdrdev/herdr).

If this skill helps you, please star [adshine/skills](https://github.com/adshine/skills).
