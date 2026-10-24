# Final report: Episode 1, "Measure Once: The Story Stick"

## What I made
- **`episodes/ep01_story_stick/out/ep01_story_stick.mp4`**: 1920×1080, 30 fps, H.264, runtime **5:26**. It has embedded chapters and a soft English subtitle track.
- **Content:** 18 shots in six sections, 594 words of narration at about 137 wpm, and five study holds (face vs. center line, the marked stick, four marked posts, tape drift vs. stick, glossary).
- **Deliverables:**
  - `out/ep01_story_stick.srt` (captions) and `out/chapters.txt`
  - `script.md` (final script with timestamps) and `storyboard.md` (as built)
  - `out/glossary.md` and `out/bench_exercise.pdf` (one printable page, plus its `.html` source)
  - `research/research_table.md` (series-wide, with sources and confidence tags)
  - `licenses.md`, `spend.csv`, `decisions.md`
- **Gate artefacts:**
  - Style frames in `gates/A_style_frames/`
  - Voice auditions in `shared/audio/voice/auditions/`
  - The 20 s test sequence at `gates/B_test_sequence/test_sequence.mp4`
  - The Gate C QA report and stills in `build/qa_report.md` and `build/qa_stills/`
- **Reusable source:**
  - `shared/` holds the style guide and tokens, renderer library, label/cards/camera presets, materials, SFX library, music bed generator, voice settings and pronunciation sheet, parametric timber, and the fit-check script with self-tests.
  - The episode folder is separate.
  - `README.md` explains how to start Episode 2.

## Main decisions (details in `decisions.md`)
- **Stack:** three.js on headless Chromium (software GL), with frames piped to FFmpeg. There is no GPU here, so Blender Cycles would have taken many hours. All geometry is generated from one parameter file and booleans are exact (manifold3d).
- **Mark list:** the stick, all four posts' marks and the frame's joint positions all come from one list, so the transferred marks provably match.
- **Fit check:** it passes on the cold-open frame with 0 mm³ interference.
- **Voice:** Gemini 3.8 Flash TTS, voice "Sulafat". In the auditions it was the only voice that two independent audio-model "listeners" and local ASR all heard pronouncing sumitsuke, shinzumi and bakabō correctly.
- **Music and SFX:** both are generated in code (CC0). I chose that over Lyria for licence certainty and series reproducibility.
- **Generated images:** none. I skipped the optional AI title card.
- **Reference face:** I found no traditional Japanese reference-face mark. Japanese layout works from the center line, so the episode teaches the center line as the reference and doesn't invent a symbol. The center line is drawn dash-dot as a *series* symbol, and the screen says real ones are solid.
- **Independent review:** an independent reviewer found a real gap in the face-vs-center-line argument, and I rewrote it around the fact that plan lines run through member centers. It also caught a "strawman" tape comparison, which is now labelled "worst case".

## What I could not verify
- **Books:** I couldn't access Seike, Odate, Sumiyoshi & Matsui, or Nakahara. Archive.org copies refused search-inside and the Google Books quota was exhausted. Nothing is quoted from them; the sources are Japanese dictionaries, the MHLW carpentry manual, JAANUS, trade glossaries and Fine Woodworking.
- **Why it's called bakabō:** this is folk etymology from a single hedged source, so it's shown as "the usual explanation".
- **Plan lines through member centers:** "Japanese plan lines usually run through member centers" (通り芯) has a single glossary source, so it's softened with "usually".
- **Reference-face mark:** that no traditional mark exists is a negative finding only. On screen I say "the *main* Japanese layout reference is this line".
- **Center-line and cut-line symbols:** the Z-shaped center-line symbol and the キ-shaped cut-line symbol have trade-blog quality sources only, so they're not shown.
- **Proportions:** these are model choices for a simplified teaching frame, not a traditional design: post length 2,700 mm, beam 105×150, rail 90×105, 15 mm housings and the 910 mm spacing. Only the 105 mm section is sourced.
- **Pronunciation:**
  - Pitch accent is unverified for every term, so they're read flat.
  - I can't listen, so pronunciation was judged by local ASR plus two audio-model listeners.
  - All four terms passed, with one caveat. For ita-zu in N23, one listener heard a slightly long "ta" (いたーず) and the other heard イタズ. Treat it as probably fine but unconfirmed by a human ear.
- **Music and SFX:** judged the same way. The listeners called the music "generic but unobtrusive". No human has listened to the mix.

## Proposed episode-map changes
- **Split Ep 2 (The Marking Kit) into two parts.** Part one: sashigane, including ura-me and the √2 scale. Part two: sumitsubo + sumisashi + kebiki + shirabiki. Six tools, each beside its Western cousin, won't fit generously in 5 minutes.
- **Split Ep 4 (The Cutting Kit and the Line) into two parts.** Part one: saws and "leaving vs. splitting vs. removing the line". Part two: nomi + gennō + kanna. The line discipline needs its own study holds.
- **Add the formal rod names to Ep 3.** Introduce 尺杖 shakuzue / 矩計杖 kanabakari-zue (verified) as the formal names for what Ep 1 called the bakabō, alongside ita-zu and aiban.

## Spend
- **Total: SPEND_TOTAL of the $5.00 cap**, actual costs from OpenRouter's generation stats, in `spend.csv` (CALLS calls).
- **Breakdown:** about $0.06 on auditions and pronunciation tests, about $0.20 on narration takes and retakes, and the rest on audio-model listening checks.
- **Never reached:** the $3.50 caution line.

## One thing to do
The OpenRouter key was pasted into the chat, and the `OPENROUTER_API_KEY` variable was not set in this environment. I used the key only through the process environment and never wrote it to a file or a commit. Still, **please rotate it**, since it now exists in the conversation log.
