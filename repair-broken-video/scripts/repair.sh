#!/usr/bin/env bash
# Repair an unplayable .mov/.mp4 (missing moov atom) using a healthy reference clip
# from the same device/app, then re-encode so B-frames play in display order.
#
# Usage: repair.sh <healthy_reference> <broken_file> [out.mp4]
set -euo pipefail

REF="$1"; BROKEN="$2"
OUT="${3:-${BROKEN%.*} (recovered).mp4}"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/video-repair.XXXXXX")"
UNTRUNC="${UNTRUNC:-$(command -v untrunc || echo "$HOME/.local/bin/untrunc")}"

if [ ! -x "$UNTRUNC" ]; then
  echo "untrunc not found; building into ~/.local/bin" >&2
  git clone -q --depth 1 https://github.com/anthwlock/untrunc.git "$WORK/src"
  P="$(brew --prefix ffmpeg)"
  make -C "$WORK/src" CXXFLAGS="-I$P/include" LDFLAGS="-L$P/lib -lavformat -lavcodec -lavutil" >/dev/null
  mkdir -p "$HOME/.local/bin"; cp "$WORK/src/untrunc" "$HOME/.local/bin/untrunc"
  UNTRUNC="$HOME/.local/bin/untrunc"
fi

echo "== reference"
ffprobe -v error -show_entries stream=codec_name,profile,width,height,r_frame_rate,sample_rate,channels -of compact "$REF"

echo "== step 1: rebuild moov from reference"
cp "$BROKEN" "$WORK/broken.mov"
"$UNTRUNC" -dst "$WORK/fixed.mov" "$REF" "$WORK/broken.mov" 2>&1 | grep -E 'Found|Duration|Warning' || true

# untrunc guesses frame durations and writes pts == dts, so B-frames show in
# decode order in QuickTime/Drive/phones (looks like dropped/skipped frames).
# Re-encode with evenly spaced display-order timestamps.
NV=$(ffprobe -v error -count_packets -select_streams v -show_entries stream=nb_read_packets -of csv=p=0 "$WORK/fixed.mov")
AD=$(ffprobe -v error -select_streams a -show_entries stream=duration -of csv=p=0 "$WORK/fixed.mov")
R=$(python3 -c "print($NV/$AD)")
echo "== step 2: re-encode $NV frames at $R fps to match audio ($AD s)"
ffmpeg -v error -y -i "$WORK/fixed.mov" -map 0:v -map 0:a \
  -vf "setpts=N/($R*TB)" -fps_mode passthrough \
  -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -c:a copy \
  -movflags +faststart "$OUT"

echo "== verify"
ffprobe -v error -show_entries stream=codec_name,duration,nb_frames -of compact "$OUT"
echo "decode error lines: $(ffmpeg -v error -i "$OUT" -f null - 2>&1 | wc -l | tr -d ' ')"
echo "output: $OUT"
echo "workdir (delete when done): $WORK"
