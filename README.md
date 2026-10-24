# Japanese Joinery by Hand: explainer series

Correct first, then beautiful. These are motion-graphics explainers on Japanese hand-tool layout and joinery (the *daiku* and *sashimono* traditions), for a Western hobbyist woodworker.

**Episode 1, "Measure Once: The Story Stick":** see `episodes/ep01_story_stick/out/` and the final report in `REPORT.md`.

## Layout
```
shared/                    reusable across every episode
  style/                   style_guide.md, tokens.js (palette/type/safe area), contrast.py (WCAG check)
  render/                  lib.js (scene, materials, camera presets, marks, labels, 2D helpers),
                           stage.html (frame host), render.js (headless renderer -> MP4 / stills)
  geometry/                timber.py (parametric members, exact booleans), fitcheck.py (+ test_fitcheck.py)
  audio/voice/             voice_settings.md, pronunciation.md, auditions/
  audio/sfx/               make_sfx.py -> SFX library (CC0, synthesized)
  audio/music/             make_bed.py -> series music bed (CC0, composed in code)
  audio/tools/             asr.py (local forced alignment), listen.py (audio-model pronunciation check), mixer.py
  tools/openrouter.py      TTS/chat client; logs the actual cost of every call to spend.csv, refuses calls past the cap
episodes/ep01_story_stick/
  params.py                THE single definition: dimensions + mark list -> build/geometry.json + fit check
  narration.json           script lines (text = spoken & captioned; tts = respelling sent to the voice)
  synth.py                 per-line TTS + QA (ASR + two listeners)          -> audio/Nxx.wav, build/narration_qa.json
  storyboard.py            shots as beats on narration timing; events on spoken words -> build/timeline.json
  shots.js                 the episode's visuals (reads geometry.json + timeline.json)
  mix.py / captions.py / docs.py / keyframes.py
  gates/                   A_style_frames, B_test_sequence
  out/                     final MP4, .srt, chapters, glossary, bench exercise
research/research_table.md series-wide research table (sources + confidence tags)
decisions.md · licenses.md · spend.csv
```

## Requirements
Python 3.13 (`pip install manifold3d numpy scipy soundfile pyloudnorm faster-whisper`), Node 22 with `npm install` in `shared/render/` (three@0.170.0), Playwright's Chromium, FFmpeg, and `fonts-noto-cjk`. Set `OPENROUTER_API_KEY` in the environment; never put it in a file.

## Build Episode 1 from scratch
```bash
cd episodes/ep01_story_stick
python3 params.py          # geometry + fit check (must PASS)
python3 synth.py           # narration (only missing lines are paid for) + QA
python3 storyboard.py      # timeline
python3 mix.py             # build/mix.wav, -16 LUFS / <= -1 dBTP
python3 captions.py && python3 docs.py
cd ../.. && node shared/render/render.js --ep episodes/ep01_story_stick/shots.js --workers 3 --out episodes/ep01_story_stick/out/video_only.mp4
# then mux: see episodes/ep01_story_stick/finish.sh
```
Stills for review: `node shared/render/render.js --ep … --stills $(python3 episodes/ep01_story_stick/keyframes.py) --outdir …`

## Starting Episode 2 ("The Marking Kit")
1. Copy the episode skeleton: `cp -r episodes/ep01_story_stick episodes/ep02_marking_kit`. Delete `audio/`, `build/`, `gates/` and `out/`, and keep the scripts.
2. **Research first.** Add rows for the terms you will use (sashigane 指金/差金, ura-me 裏目, sumitsubo 墨壺, sumisashi 墨差し, kebiki 毛引, shirabiki 白引) to `research/research_table.md`, with two sources each. Only *verified* items get kanji on screen.
3. **Geometry.** Model the tools parametrically in `shared/geometry/` (e.g. `tools.py`: a sashigane with its real blade proportions and both scales computed, since the ura-me scale is the omote scale × √2). Never use generated images for tool shapes.
4. **Pronunciation.** Test every new term with `synth.py`'s QA (ASR plus the two listeners) and add rows to `shared/audio/voice/pronunciation.md`.
5. **Script and timing.** Write `narration.json`, then `storyboard.py` beats. Keep the total at 4:30–5:30, with study holds of 3 s or more and the glossary held 8 s or more.
6. **Reuse.** In `shots.js`, use `lib.js` (`makeScene`, `memberMesh`, `camera(preset…)`, `inkLine`, `centreLine`, `label`, `woodRect`, `X_ICON`/`CHECK_ICON`) and the title/end-card functions. Keep the title-card layout and swap only the emblem.
7. Run Gate A (style frames + independent review), Gate B (a 15–20 s test sequence) and Gate C (full render + QA), logging each in `decisions.md`.

The style rules live in `shared/style/style_guide.md`. Follow them in every shot.
