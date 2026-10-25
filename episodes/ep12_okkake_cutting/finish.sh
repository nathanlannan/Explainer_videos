#!/usr/bin/env bash
# Mux final video + mix + chapters + soft-subtitle track into the deliverable MP4.
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -loglevel error -y -i out/video_only.mp4 -i build/mix.wav -i out/ep12_okkake_cutting.srt -f ffmetadata -i build/chapters.ffmeta \
  -map 0:v -map 1:a -map 2:s -map_metadata 3 -map_chapters 3 \
  -c:v copy -c:a aac -b:a 256k -c:s mov_text -metadata:s:s:0 language=eng \
  -metadata title="Japanese Joinery by Hand · Episode 12 · Cutting the Okkake" -movflags +faststart \
  out/ep12_okkake_cutting.mp4
ffprobe -v error -show_entries format=duration,size -of default=nw=1 out/ep12_okkake_cutting.mp4
