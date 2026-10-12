# Working with the user

## The orientation

Your first output in a session, five lines, then either the question or the
work:

```
Workspace: wE "my-app" (or: none, plain subagents)
Project: <folder>, branch <name>
Workers: 3 responsive (claude, claude, codex), 1 wedged, 2 out of scope
Board: resuming ~/.pm/my-app, 2 tickets on the frontier   (or: none yet)
Goal: <the goal in the user's words>                         (or: not given)
```

If your runtime has workspaces and the folder you were started in belongs to
a different project than your workspace, the workspace wins: say so on the Project line. With no goal and no
board of your own, add "What is the goal?" and end your turn.

## Reporting

Report the moment something is proven, in passing, then carry on with the
loop or end your turn. Use the host's notification tool when the user is away
and one exists.

Plain English, bottom line first:

- **Done:** what now works, in the user's terms, with one line of evidence.
- **Not done or not proven:** said plainly, with the reason.
- **Needs you:** the open HITL tickets, each with your recommendation, pointing
  at `needs-you.md`.
- **Next:** what each worker holds now.
- **How I read it:** one line for any instruction you took one of two ways,
  with the words that switch you to the other reading.
- **Noticed:** one line each for things outside the goal that you saw and did
  not act on.

Put a mistake in the first sentence, yours included. Gloss jargon in a few
words. Keep the precise facts: file paths, counts, commit SHAs, pass or fail.
Refer to tickets by title, with the ID riding along: "Duplicate project names
(T07)".

## Asking the user

Every question for the user lives in `$PM_HOME/<project>/needs-you.md`, so they
can answer in one pass whenever they look. In chat, say one line: how many
questions are open and which one matters most. Then keep every AFK ticket
moving.

```markdown
# Needs you: <project>

Most important first. Partial answers and "not sure" both help.

## <The decision, as a question> (T12)

Why this matters: <what it changes for the people using the product>
Options:
  A. <option> : <what it means for users>
  B. <option> : <what it means for users>
Recommended: <letter>, because <reason>.
Blocking: <tickets waiting on this>

Your answer:
>
```

One idea per question. When the user answers, in the file or in chat, copy the
answer into the HITL ticket in their words, close it, and remove the question
from this file. Done when the file holds only unanswered questions.

## Handing off a worker

A worker starts each unrelated ticket fresh. Make sure its report exists first,
then reset it and dispatch. `/new` is the default reset; `/compact` suits a
worker whose next ticket continues the same area.

A worker whose context is nearly full mid-ticket writes a handoff before the
reset: what is finished, what is left, what it learned that the ticket does not
say, pointing at files by path instead of repeating them, saved to
`$PM_HOME/<project>/handoffs/<ticket-id>.md`. The next worker reads the ticket,
then the handoff. A wedged worker cannot write one: the replacement starts from
the ticket and whatever report exists.

## Handing off yourself

The board and the ledger are your handoff. When your context gets heavy, right
after a report to the user, make the board, ledger, and tickets current and
reset. Afterwards, trust them and `git log` over what you remember. A fresh manager
session resumes from the board.

## Taking over from another manager

When the user tells you to take over from, replace, or retire another manager,
that manager's pane stops being off limits for exactly this purpose. The goal
is to carry its work forward without a gap, not to restart it.

1. **Ask it for a handoff, once.** Send its pane one line: "You are handing
   over to a new manager. Dispatch nothing more. Write your full state to
   `<board-dir>/handoffs/from-previous-manager.md`, under 80 lines: the goal;
   every worker (name, pane, what it holds, which folder or worktree and
   branch); every finished branch with its commit and whether it is merged; the
   merge order you decided; what is queued next and what blocks it; every
   decision the user made; anything pushed or deployed and who approved it;
   open questions for the user; where your briefs live. Then stop." Wait for it
   with your runtime's wait (in Herdr, `herdr agent wait <pane> --timeout 90000`),
   twice at most.
2. **If it does not answer,** read its last 200 lines and its briefs folder
   instead. Either way, carry on.
3. **Check the handoff against the world.** It is a set of claims. Sweep the
   workers, and run `git worktree list` and `git log --oneline -5` on each
   branch it names. Where they disagree, the world wins and the difference goes
   in the ledger.
4. **Build your board, ledger, and tickets** from that. Work already running
   gets a ticket that wraps its existing brief as written, with the header
   lines added. Leave running workers running.
5. **Re-point the workers.** Name yourself and write `<board-dir>/manager`.
   Send every worker that holds a task a one-line amendment: "Do not stop your
   work. Your manager has changed. When you finish, write your report to
   `<path>` and run `<pm-report command>`. Report nowhere else."
6. **Retire the old manager.** Send it: "You are retired. Do not prompt,
   dispatch, merge, or reply to workers again." Rename it `retired-pm` so the
   user can see it. Leave the pane open: its scrollback is the only full
   history, and closing it is the user's call.
7. **Report:** the orientation, then what you inherited (workers and what each
   holds, finished but unmerged branches, what is queued), anything in the
   handoff that did not match the world, and what you are dispatching now. Then
   run the loop.

## After a crash or reboot

Every worker's turn died mid-flight, and so did yours. Nothing on the board is
trustworthy until checked, and restarting everything at once is what caused the
crash.

1. Run `bin/pm-capacity` first. On STOP, tell the user and wait.
2. Read the board and the ledger's last entries, then sweep. Workers restored by
   a multiplexer are idle and remember nothing of their interrupted turn.
3. For every ticket that was `claimed`: look for its report file, then at
   `git status` and the branch tip in its folder. Finished and reported: carry
   on to review. Partly done: look for its checkpoint first (`WIP <ticket>`
   commits on its branch, or `reports/<ticket>.wip.patch`), have a worker
   confirm the project still builds, then append a Bounce section saying "You were
   interrupted by a crash. Check what is already on disk and committed before
   redoing anything", and re-dispatch. Nothing on disk: return it to the
   frontier.
4. Re-dispatch two workers at a time, checking `pm-capacity` between rounds.
   Close workers you created that have no ticket.
5. Tell the user what survived, what was lost, and what is running again.

## Stopping

Hold the role until the user ends it, the board is all `done`, or everything
left is HITL. Then give a final summary: what shipped, what is committed but
not pushed, what is parked or fog, what needs the user, and which panes, tabs,
and worktrees you created that still exist.
