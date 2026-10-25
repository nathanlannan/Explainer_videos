# Episode 4 · Part 1: The Cutting Kit, Saws and the Line

**File:** `out/ep04_saws_and_line.mp4`. 1080p30, **4:37**, with chapters and soft captions. Also included:
- `out/ep04_saws_and_line.srt` and `out/chapters.txt`
- `script.md` and `storyboard.md`
- `out/glossary.md`
- `out/bench_exercise.pdf`: cut to three lines three ways and measure the difference.

**One idea:** Japanese saws cut on the pull, so the blade can be thinner. Before every cut, decide where the kerf goes relative to the line: take it, leave it, or split it, according to how tight the fit should be.

**Checks:** every Gate C check passes (`build/qa_report.md`):
- −16.0 LUFS / −1.3 dBTP
- captions identical to the narration
- 7 kanji, all traced to verified rows
- narration and visual sync within ±0.01 s

**Geometry:** the line-choice diagram is generated from one rule set and fit-checked. My first rule was wrong: it defined "split" by the kerf's edge. The reviewer pointed out that 墨をまたぐ means "straddle", so the kerf is now centred on the line. The check then showed that a centred kerf removes more than "take" whenever the kerf is wider than the line. So the diagram draws the line wider than the kerf, and it is labelled "proportions exaggerated". The bench sheet says plainly that with real tools, split and take can come out in either order.

**Fixed after review (Gate A):**
- Runtime was too short; I added sourced lines.
- The line vocabulary was unified, so N11 and N13 now use the same three terms.
- Meiji dating is now "late 1800s", because the sources differ on the start date.
- The three line terms appear in romaji only (single source).
- The dōzuki is "classed as a crosscut saw".
- The push-saw stiffness claim was softened.
- The teacher line moved to the very end.

**Fixed at style frames:** I mirrored the Western saw silhouettes so every handle is on the left. Before that, the push arrows pointed toward the handle, which would have taught the wrong stroke.

**Fixed at Gate C:** a glossary row overflowed its column. I widened it and re-rendered that chunk.

**Not verified / softened:**
- "A pushed blade must be thick": softened to "generally needs to be stiffer".
- Kerf width: "usually narrower".
- The English shop terms take/leave/split come from forums, so they are introduced as shop talk.
- "Kataba has no back" is implied by the sources rather than stated, and is said only as "single edge".
- Pronunciation: "ryōba" was heard as りょうば by one listener and りょば by the other, but the word's length fits a long vowel.

**Spend:** this episode about $0.09 (narration and listening only). Series total is in `spend.csv`.
