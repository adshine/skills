# ios-sim-session

A Claude Code / agent **skill** that pins one coding session to one iOS Simulator and
an isolated build, so multiple concurrent sessions (Claude, Codex, a human in Xcode)
never clash on the same device or DerivedData.

## The problem

Run two AI coding sessions against the same Xcode app and they fight over **two**
shared resources at once:

| Shared resource | Symptom |
|---|---|
| The simulator device | app reinstalled under you, sim shut down mid-capture, "Timeout waiting for screen surfaces" |
| The xcodebuild build  | "Build input ... database is locked", stale installs |

Isolating only one is not enough. This skill isolates **both**: each session claims
its own simulator UDID and builds into its own DerivedData path.

## Install

Clone into your skills directory:

```bash
git clone https://github.com/adshine/ios-sim-session.git \
  ~/.claude/skills/ios-sim-session
chmod +x ~/.claude/skills/ios-sim-session/bin/ios-sim-session
```

## Use

Pick a short session id (`SID`) once and pass `--sid` to every command (shell env
does not survive between calls, so the SID is how the tool remembers your sim):

```bash
SS=~/.claude/skills/ios-sim-session/bin/ios-sim-session

$SS claim  --sid sessA --project-dir apps/ios          # claim a free, runtime-compatible sim
$SS run    --sid sessA --scheme MyApp --project-dir apps/ios \
           --out /tmp/shot.png --launch-args "--some-flag"   # build + install + capture
$SS status                                             # all active claims
$SS release --sid sessA --shutdown                     # free the sim
```

See [SKILL.md](SKILL.md) for the full protocol and the rationale behind each piece.

## Why it works

- **Runtime-aware claim** — only picks sims on an iOS runtime `>=` the project's
  `IPHONEOS_DEPLOYMENT_TARGET` (an iOS 18 sim can't run an iOS 26 app).
- **Prefers shutdown + unclaimed sims** — never steals a device another session booted.
- **Per-session DerivedData** — the real fix for "database is locked" (isolation, not a
  mutex).
- **Stale-install-proof capture** — terminate → install fresh `.app` → launch →
  screenshot the claimed UDID (never the ambiguous `booted`).

## License

MIT
