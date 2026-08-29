# Remediation Loop (--fix) and Quality Gate (--gate)

Turns the audit from a report into a closed loop: Plan, Patch, Sense, Verify. Only applies when the audited site's source repo is available locally. **Auditing someone else's site? --fix must refuse**; the deliverable is the technical spec with proposed diffs, nothing more.

## The Loop (per finding)

1. **Eligibility:** only `fix_class: auto` or `assisted` findings enter the loop, in severity order (all Blockers, then Highs, then Mediums). `manual` findings go straight to the human queue.
2. **Isolation:** all patches happen on a dedicated branch or git worktree, never the default branch.
3. **Precondition check:** run the sensor BEFORE touching code. If it passes already, the finding is stale; mark it `Verified Fixed` with the output and move on. If the finding has no sensor, write one first (it must fail).
4. **Patch:** make the narrowest change that addresses the root cause. Feed the sensor's failing output into the fix decision.
5. **Sense:** re-run the sensor. Pass: record the attempt, mark `Verified Fixed`. Fail: record output, loop back to 4.
6. **Bounded retries:** hard cap of 3 attempts. After the third failure, set status `Needs Human` and attach all three outputs. Never loop past the cap, never widen the patch to force a pass.
7. **Regression barrier (the gauntlet):** after finishing a severity tier, re-run EVERY recorded sensor, including previously verified ones. Any regression reopens that finding and blocks advancing to the next tier.
8. **Handoff:** fixes stay uncommitted-to-main; the human reviews the branch. The executive summary reports before/after per finding: found, fixed, verified by sensor, attempts used.

## Modes

- `--recheck`: run every sensor in findings.json, update statuses, recompute the scorecard. No discovery, no patching. This is the cheap follow-up audit.
- `--gate`: CI mode via `scripts/audit_gate.py`. Exits nonzero if any Blocker (or High, per `--milestone`) is open, or any pillar score is below the threshold (default 7.0, overridable). Wire it into CI to block merges on audit health.

## Invariants

- A finding is only ever closed by its sensor passing (`auto`), a human confirming (`assisted`/`manual`), or an explicit `Wont Fix` decision recorded with a reason.
- findings.json is the single source of truth; the markdown table and reports are regenerated from it after every loop iteration.
- The loop never touches: payment execution, real user data, production deploys, or anything outside the audited repo.
