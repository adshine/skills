---
name: ios-sim-session
description: Pin one agent session to one iOS Simulator + an isolated build so multiple concurrent sessions (Claude, Codex, a human in Xcode) never clash on the same device or DerivedData. Use when builds fail with "database is locked", the app gets reinstalled/relaunched under you, the simulator is shut down mid-capture, screenshots show another session's state, or you are running two AI coding sessions against the same Xcode project.
---

# ios-sim-session: isolate concurrent iOS simulator sessions

When two sessions build + run the same Xcode app, they fight over **two** shared
resources. Isolating only one is not enough:

| Shared resource | Why it clashes | Symptom |
|---|---|---|
| The simulator device | both run `simctl install/launch/screenshot/terminate` on the same UDID | app reinstalled under you, sim shut down mid-capture, "Timeout waiting for screen surfaces" |
| The xcodebuild build | same `.xcodeproj` path → same DerivedData → same build database | "Build input ... database is locked", stale installs |

This skill gives each session its **own simulator UDID** and its **own DerivedData
path**, so two sessions run fully in parallel.

## Session identity (the one thing to understand)

Shell env vars do **not** survive between separate Bash tool calls, so there is no
automatic per-session token. **The agent is the persistence layer:** pick a short
session id (`SID`) once at the start of your session and pass `--sid <SID>` to every
command. The claim file maps `SID → UDID + DerivedData`.

Use a SID nobody else will reuse (e.g. `sessA`, or your branch slug). If two real
sessions accidentally pick the same SID they will share a sim again, so make it
distinct.

## The protocol

```bash
SS=~/.claude/skills/ios-sim-session/bin/ios-sim-session

# 1. Once, at session start — claim a free, runtime-compatible simulator.
#    Picks a SHUTDOWN, unclaimed iPhone on an iOS runtime >= the project's
#    IPHONEOS_DEPLOYMENT_TARGET, so it never steals another session's booted sim
#    and never picks a too-old runtime.
$SS claim --sid sessA --project-dir apps/ios

# 2. Build + install + capture in one step (build uses an isolated DerivedData path).
$SS run --sid sessA --scheme Pewnote --project-dir apps/ios \
    --out /tmp/shot.png --launch-args "--chat-state sermon-note-chat-entry"

# or the steps individually:
$SS build   --sid sessA --scheme Pewnote --project-dir apps/ios
$SS install --sid sessA
$SS capture --sid sessA --out /tmp/shot.png --launch-args "--some-flag"

# inspect / clean up
$SS status                       # all active claims across sessions
$SS udid    --sid sessA          # the UDID this session owns
$SS release --sid sessA --shutdown   # free the sim at session end
```

## Why each piece exists (maps to a real failure)

1. **Runtime-aware claim.** A sim on iOS 18.x cannot install an app whose deployment
   target is 26.0 ("Requires a Newer Version of iOS"). `claim` reads
   `IPHONEOS_DEPLOYMENT_TARGET` and only considers sims on a `>=` runtime. Override
   with `--min-ios 26.0`; omit and it takes the newest available runtime.
2. **Prefer shutdown + unclaimed.** `claim` skips any UDID already in a claim file and
   prefers shutdown sims, so it won't grab the device another session already booted.
3. **Per-session DerivedData.** `build` uses
   `~/Library/Developer/Xcode/DerivedData/<scheme>-sess-<SID>`, so two builds never
   touch the same build database. This (not a lockfile) is what actually fixes the
   "database is locked" failures.
4. **Stale-install-proof capture.** `install`/`capture` terminate first, then install
   the freshly built `.app` and screenshot the claimed UDID — never `booted` (which is
   ambiguous when two sims are up).

## Gotchas

- **`--device "iPhone 17 Pro"`** narrows the claim to a model; without it you get any
  eligible iPhone. If the only compatible sims are all booted/claimed, `claim` fails
  loudly rather than stealing one — create another sim or `release` a stale claim.
- **First build per SID is a full build** (fresh DerivedData). That is the cost of
  isolation; subsequent builds for the same SID are incremental.
- **Claims persist on disk** (`~/.ios-sim-session/claims/`). If a session dies without
  `release`, run `status` and delete the stale claim file (the `pid` column tells you
  if the owning process is gone).
- Not project-specific: works for any Xcode app. Set `--scheme` and `--project-dir`
  (auto-detects `.xcworkspace` else `.xcodeproj` under that dir).
