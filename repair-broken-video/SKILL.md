---
name: repair-broken-video
description: Recover an unplayable or "corrupt" .mov/.mp4 (won't open, won't convert, ffmpeg says "moov atom not found") using a healthy reference clip from the same device, then fix stutter/skipped frames. Use when a video file is broken, truncated, or plays with dropped or jumping frames after repair.
---

# Repair a broken video

Typical cause: the recording or export was interrupted, so the file has only `ftyp` + `mdat` (raw frames and audio) and no `moov` (the index telling players where each frame is and how to decode it). The media is still inside; the index must be rebuilt.

## 1. Diagnose (do not guess)

```bash
ffprobe -v error "$F"                      # "moov atom not found" = this skill
python3 - "$F" <<'E'                        # list top-level atoms
import struct,sys
f=open(sys.argv[1],'rb'); import os; n=os.path.getsize(sys.argv[1]); o=0
while o<n:
    f.seek(o); h=f.read(16); s,t=struct.unpack('>I4s',h[:8])
    if s==1: s=struct.unpack('>Q',h[8:16])[0]
    if s==0: s=n-o
    print(t.decode('latin1'),o,s); o+=s
E
```

If the file came from Drive/email, compare size and md5 against the source first. If identical, re-downloading will not help; the upload itself is broken.

## 2. Get a healthy reference clip

Required. Must come from the **same device and app with the same settings** (same phone/Mac, same camera or QuickTime mode, same resolution). Ask the sender for any short clip they recorded the same way. Check the user's cloud drive and Downloads for one before asking (for example, search Google Drive for recent `video/*` files).

Do not burn hours brute-forcing H.264 SPS/PPS without a reference: wrong guesses decode "cleanly" into smeared stripes, so the search cannot verify itself.

## 3. Run the repair

```bash
<skill-dir>/scripts/repair.sh "<healthy ref>" "<broken file>" "<out.mp4>"
```

The script:
1. Builds `untrunc` (anthwlock fork) into `~/.local/bin` if missing. On Homebrew ffmpeg it needs explicit `-I/-L` and `-lavformat -lavcodec -lavutil`.
2. Runs `untrunc` to rebuild the index from the reference.
3. **Re-encodes** with evenly spaced display-order timestamps. This step is essential: untrunc writes `pts == dts` with guessed durations, so on footage with B-frames, QuickTime, Drive and phones show frames in storage order. The result looks like dropped or skipped frames. A plain remux (`-c copy`, `+genpts`) does NOT fix it.

## 4. Verify before handing back

- `ffprobe` packet pts vs dts on the output: pts must differ from dts on B-frames (reordered), not be identical.
- Video duration matches audio duration within about 1 s.
- Full decode: `ffmpeg -v error -i out.mp4 -f null -` has only a few lines of output.
- Pull stills at 5 or more points across the timeline and look at them.
- ffmpeg's own decoder reorders frames regardless of timestamps, so an ffmpeg-based smoothness check can pass while real players stutter. Always check the pts/dts ordering, and have the user watch it in QuickTime.

Delete the reference copy, the broken copy and the workdir when done; they are large and often personal.
