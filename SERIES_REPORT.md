# Japanese Joinery by Hand: series report

**Delivered:** 11 episodes, about 54 minutes in total. Each is 1080p30 with chapters, soft captions (≤ 2 lines × 42 characters), a script, a storyboard, a glossary and a one-page bench exercise.

| # | Episode | Runtime |
|---|---|---|
| 1 | Measure Once: The Story Stick | 5:26 |
| 2 | The Marking Kit: The Sashigane | 4:57 |
| 2b | Ink Line, Pen and Gauges | 4:44 |
| 3 | From Plan to Timber | 4:43 |
| 4 | Saws and the Line | 4:37 |
| 4b | Chisels, Hammer and Plane | 4:36 |
| 5 | The First Joint: Koshikake Ari-tsugi | 4:53 |
| 6 | Marking Out and Cutting the Koshikake Ari-tsugi | 4:42 |
| 7 | Mortise and Tenon: Hozo | 5:14 |
| 8 | Beam Over Beam: Watari-ago | 5:11 |
| 9 | The Gooseneck: Koshikake Kama-tsugi | 5:02 |

**Every delivered episode passes Gate C:**
- runtime 4:30–5:30
- −16 LUFS ±1, true peak ≤ −1 dBTP, music about 20 dB under the voice
- captions identical to the narration
- every on-screen kanji traced to a verified research row
- narration and visual sync
- study holds ≥ 3 s, glossary ≥ 8 s

Each also passed Gate A (an independent review of the script and model against primary sources) and Gate B (a test sequence).

**Built but not rendered (stopped at your request):**
- Ep10, Cutting the Gooseneck
- Ep11, The Other Splice: Okkake Daisen-tsugi
- Ep12, Cutting the Okkake

Each has its fact pack, Gate A fixes, narration audio, a fit-checked model, shots, Gate B and a clean layout check. Rendering one is: `episodes/<ep>/render_full.sh`, then `./finish.sh` and `python3 qa.py`.

**Known issues:**
- **Ep1–5:** bottom captions sit about 20 px below the 5% title-safe line. The automated layout check (`render.js --layout`) was added after they were delivered. Ep6–9 are clean; Ep1–5 were not re-rendered.
- **Ep9:** its closing teaser names Episode 10, which was not rendered.
- **Pronunciation:** a few terms in early episodes have slightly long vowels after three takes (noted in each REPORT.md). Every Japanese term is voiced correctly at least once, as judged by two listener models and ASR.

**Research:**
- `research/research_table.md` plus fact packs for Ep4, Ep5, Ep7, Ep8, Ep9 and Ep11, each with an Avoid list.
- Single-source claims are attributed on screen; unverified claims are not used.
- Every Gate A review found blockers, and all were fixed before narration. `decisions.md` logs each one.

**Spend:** **$1.89** of the $5 series cap, across 754 logged OpenRouter calls (TTS plus listener checks). By episode:

| Ep | 1 | 2 | 2b | 3 | 4 | 4b | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Spend ($) | 0.24 | 0.20 | 0.16 | 0.16 | 0.09 | 0.19 | 0.10 | 0.08 | 0.10 | 0.10 | 0.12 | 0.07 | 0.11 | 0.09 |

Voice and pronunciation setup cost a further $0.08. Ep10–12 spend covers narration only. All visuals, music and SFX were made locally at no cost (see `licenses.md`).
