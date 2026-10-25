#!/usr/bin/env bash
# Resumable full render: 1200-frame chunks (skips chunks already done), then lossless concat.
set -euo pipefail
cd "$(dirname "$0")/../.."
OUT=episodes/ep03_plan_to_timber/out; mkdir -p $OUT/chunks
TOTAL=$(python3 -c "import json;print(round(json.load(open('episodes/ep03_plan_to_timber/build/timeline.json'))['total']*30))")
for ((a=0; a<TOTAL; a+=1200)); do
  b=$((a+1200)); f=$OUT/chunks/c$(printf %05d $a).mp4
  [ -s "$f.ok" ] && continue
  node shared/render/render.js --ep episodes/ep03_plan_to_timber/shots.js --from $a --to $b --workers 3 --out $f
  echo ok > $f.ok
done
ls $OUT/chunks/c*.mp4 | sed "s|^|file '$PWD/|; s|$|'|" > $OUT/chunks/list.txt
ffmpeg -loglevel error -y -f concat -safe 0 -i $OUT/chunks/list.txt -c copy $OUT/video_only.mp4
echo RENDER_DONE
