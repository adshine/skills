# repair-broken-video

A Claude Code / agent **skill** that recovers an unplayable `.mov`/`.mp4` ("corrupt file",
`moov atom not found`) using a healthy reference clip from the same device, then fixes the
stutter that naive repairs leave behind.

## The problem

Phones and QuickTime write a video's index (the `moov` atom) last. Interrupt the recording or
export and you get a file full of perfectly good frames and audio with no index. Every player
refuses it.

The common repair tool fixes that, but leaves a second problem people rarely notice until
they watch it:

| Stage | Symptom | Cause |
|---|---|---|
| Broken file | Won't open anywhere; `moov atom not found` | Index never written |
| After `untrunc` alone | Plays, but looks like dropped/skipped frames | B-frames shown in storage order (`pts == dts`), guessed frame durations |
| After this skill | Smooth, audio and video same length | Re-encoded with display-order, evenly spaced timestamps |

## Install

```bash
git clone https://github.com/adshine/skills.git ~/adshine-skills
ln -s ~/adshine-skills/repair-broken-video ~/.claude/skills/repair-broken-video
chmod +x ~/adshine-skills/repair-broken-video/scripts/repair.sh
```

Requires `ffmpeg` (with `libx264`), `python3`, and `git` + a C++ toolchain. The script builds
[untrunc](https://github.com/anthwlock/untrunc) into `~/.local/bin` on first run.

## Use

Ask your agent to fix the video, or run the script directly:

```bash
scripts/repair.sh "healthy-reference.mov" "broken.mov" "recovered.mp4"
```

The reference must come from the **same device and app with the same settings**. Without one,
do not try to brute-force the decoder settings: wrong guesses decode into smeared stripes with
no error, so the search cannot verify itself.

## Non-goals

Not for files whose frame data is actually missing or overwritten, and not for DRM-protected
media.
