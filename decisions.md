# Decisions log

Each line is a decision and its one-line reason. Times are UTC on 2026-10-24.

## Step 0: verification
- **Credentials.** `OPENROUTER_API_KEY` was not set in the container. The key pasted in the request was passed inline to each command's environment only. It was never printed, logged, written to a file or committed. → The owner should rotate it, because it appeared in chat.
- **Network.** OK. The first paid call was a 5-character Kokoro TTS test ($0.000003, logged in `spend.csv`).
- **Models** (from `/api/v1/models`; prices are OpenRouter list prices):
  - **Speech output:** 36 models, including ElevenLabs v3/v4 ($0.00008/char), MAI-Voice-2.1 ($0.000022/char), Gemini 3.8 Flash TTS ($0.0000005/in-token + $0.000009/out-token), Kokoro ($0.00000062/char) and Fish S2.1 ($0.000015/char).
  - **Pronunciation hints:** none of them accept SSML or phonemes through OpenRouter. The endpoint takes `input`, `voice` and `instructions` only (Azure abstracts its SSML away), so respelling is the only lever.
  - **Timestamps:** no TTS model returns word timestamps.
  - **Voices:** each model lists its own in `supported_voices`.
  - **Music/audio output:** Lyria 3 Pro ($0.08/song) and Lyria 3 Clip ($0.04/30 s); GPT-audio (chat audio).
  - **Images:** Gemini image models, GPT-5 image and others (≈$0.00003–0.00012 per output token).
- **Rendering stack.** Chose **three.js in headless Chromium (Playwright), SwiftShader software GL, frames piped to FFmpeg** over Blender: no GPU here, Cycles on 4 CPU cores would take tens of hours, and this stack gives exact control of 2D type plus 3D in one deterministic page.
  - **Test clip:** lit, textured box at 1920×1080 30 fps (`shared/render/test/box_test.mp4`). 0.41 s/frame on one worker, projecting 62 min for 5 minutes.
  - **Episode measurement:** 0.62–0.74 s/frame wall with 2 workers, including about 50 s of shader warm-up per worker.
  - **GL:** "ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)))", software.
  - **Licences:** three.js MIT; Playwright Apache-2.0; Chromium BSD. Remotion was not used, so its licence threshold is moot.
- **Geometry kernel.** manifold3d 3.5.4 (Apache-2.0). Exact booleans, volume queries; touching faces return 0 mm³ intersection.
- **Fonts.** Installed `fonts-noto-cjk`: Noto Sans/Serif CJK JP (OFL), with full kanji coverage.

## Spending plan (made before narration)
- Narration ≈ 3,400 chars ≈ $0.07 per full pass on Gemini TTS. Budget: $0.50 for auditions, retakes and QA listening; $0.10 contingency. A Lyria bed would have cost $0.08, but I chose code-composed music (below). Expected total < $0.50, against the $3.50 caution line and the $5.00 cap.

## Research and content
- **Story-stick term.** On screen, *bakabō* 馬鹿棒 is presented as the shop nickname ("is also called"), with its literal sense "fool's stick" (verified). The reason for the name is shown only as "the usual explanation" (R-09, folk etymology). The formal rod names (尺杖, 矩計杖, 竪杖) stay off screen to avoid overloading Ep 1.
- **Reference face.** No traditional Japanese reference-face symbol was found (R-04). Japanese layout works from the center line (R-03). → Ep 1 shows the center line as the reference and does not invent a face symbol. N10 says "the *main* Japanese layout reference is this line" (softened after review).
- **Center line on screen.** It is drawn dash-dot as a series encoding, and the screen says the real line is solid. The traditional Z-shaped center-line symbol is single-source quality, so it is not shown.
- **Edge vs center argument.**
  - The independent review found a missing premise (BLOCKER), so the argument was rewritten.
  - New premise: plan lines that place posts and walls usually run through member centers (通り芯 / 心墨, DAIKEN glossary; softened with "usually").
  - With faces aligned, a thinner post's *middle* is off that line. With center-line layout, the difference splits half to each side.
- **Tape comparison.**
  - It uses chained readings (each from the previous mark, ±1 mm uniform, seed 7). The brief asks for cumulative drift.
  - After review, it is labelled "worst case" in narration and on screen, because most woodworkers read every position from one hooked end.
  - Drift is drawn 20× and labelled. The real numbers (−1.5, −2.2, −1.9, +0.5 mm; 2.7 mm spread) are printed unexaggerated.
- **Section timings.** These moved from the brief's targets to fit the content: §3 runs 1:11–2:26 and §4 runs 2:26–4:45, the longest section as intended.

## Dimensions (all in `episodes/ep01_story_stick/params.py`, one mark list)
- Post and sill 105 mm (4.13 in) square: the most common section for 管柱 and 土台 (R-07, verified).
- Post length 2,700 mm (106.3 in): model choice, cut from 3 m standard stock (R-07).
- Spacing 910 mm (35.8 in) center to center: model choice (R-15).
- Beam 105 × 150 mm; rail 90 × 105 mm; housings 15 mm deep with 0.5 mm total width clearance: model choices for a simplified teaching frame. The housings are not presented as a traditional joint.
- Story stick 45 × 15 mm: model choice. It was widened from 30 mm so the notes fit in two lanes.
- Marks from the post's bottom end: 0 / 15 / 1000 / 1090 / 2685 / 2700 mm (BOTTOM, SILL, RAIL, RAIL, BEAM, TOP).
- Layout shots show *uncut* posts, because layout comes before cutting. The cold-open frame uses the cut, fit-checked solids.

## Voice and audio
- **Voice.** Gemini 3.8 Flash TTS, voice **Sulafat**. Two independent audio-model listeners (Gemini 3.8 Flash and GPT-audio-mini) plus local Whisper all heard sumitsuke, shinzumi and bakabō correctly, and it was rated warmest. ElevenLabs George ran too fast at 155 wpm (no speed control) and Anglicised shinzumi. MAI Grant said "bakabū".
- **Listening method.** I can't hear audio myself, so every narration clip was checked by local ASR (transcript against script) plus the two listener models, reporting the kana they heard. GPT-audio-mini's "correct" flag proved unreliable (it rejects correct katakana), so its heard kana are compared by hand.
- **Respellings.** `sumi-tsuke` (plain spelling sometimes ended "-kay"); `baka-bō` in N21; `itazu` for ita-zu (the hyphen produced いたずう).
- **Captions.** Local forced alignment (faster-whisper word timestamps) mapped onto the script words, so captions show the script's spelling.
- **Music.** Composed in code, not Lyria. It gives certain licensing (CC0, original), exact length, reproducibility as a series theme, and control against clichés: diatonic maj7/9 pads in D, sparse mallet notes, no pentatonic riffs or gongs. Lyria's terms could not be verified in-session to the standard the brief asked for.
- **SFX.** All synthesized in code (CC0). After the Gate B listeners called the marking strokes too harsh and loud: low-passed at 3.5 kHz, softer envelope, −7 dB trim. The stick knock was given more body (380 Hz fundamental, +2 dB).
- **Mix.** −16 LUFS integrated, true peak ≤ −1 dBTP (look-ahead limiter on 4× oversampled peaks). Music ducks to ≈ −20 LU under the voice and −12 LU between lines. Measured −20.5 LU.

## Scope and runtime
- First assembly ran 5:45, so I cut words and pauses (never speed, never study holds below 3.5 s). The review fixes then pushed it to 5:31, so more trims followed. Final runtime **5:26.3**, 594 words, 137 wpm average.
- No generated images: the optional AI title card was skipped. The title card is typeset, with an emblem drawn from the mark list.

## Gate A: planning (self + independent reviewer)
- **Self-check of style frames** (`episodes/ep01_story_stick/gates/A_style_frames/`): fixed text outside title-safe (S04, S07, S17), overlapping notes on the stick (two-lane notes), sub-36 px glosses, a confusing full-width support beam (replaced by short blocks), a floating stick, and the label position in S05/S14.
- **Independent reviewer** (a separate agent that had not seen my reasoning): 2 BLOCKERS, both fixed.
  1. Missing premise in the edge/center argument: N07–N10 rewritten and S07 redrawn ("From a face", the plan line as a ghost line, the middle offset 3.0/1.5 mm with ✕).
  2. S12 numbers crossing title-safe: bars shortened.
- **Should-fixes from the reviewer:**
  - Fixed: tape "worst case"; N10 softened; N04 "after that, nothing is measured again"; "story stick" introduced in N11; no dash-dot for the plan line; front and back faces labelled; S11 hold with the stick lifted off and ghost guides joining the marks; S12 exaggeration note in inkSoft plus a "top-end drift" header and guides that stop short of text; S04 left-panel contrast; S05 label onto paper; N21 "often" → "also"; params comment fixed.
  - Accepted as is: S10's tiny in-world notes, since the callouts repeat them.

## Gate B: test sequence (`gates/B_test_sequence/test_sequence.mp4`, 20 s of S11)
- **First pass:** the wide camera made the marks unreadable, so I added a close camera that follows the tool mark to mark on post 1. Listeners said the marking SFX were harsh and 3–4 dB hot (fixed), the stick knock was too weak (fixed), and the post-2 strokes collided with "Same stick, same lines" (post 2–4 strokes now start late in or after their line).
- **Pipeline fixes found here:** a concat path bug in `render.js` (it now uses absolute paths) and a page-load timeout raised for parallel workers.

## Gate C: final (see final report and `episodes/ep01_story_stick/build/qa_report.md`)
