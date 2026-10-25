# Episode 3: From Plan to Timber, the board plan and its addresses

**File:** `out/ep03_plan_to_timber.mp4`. 1080p30, **4:43**, with chapters and soft captions. Also included:
- `out/ep03_plan_to_timber.srt` and `out/chapters.txt`
- `script.md` and `storyboard.md`
- `out/glossary.md`
- `out/bench_exercise.pdf`: draw a board plan, address it, mark sticks, shuffle them, and have someone else rebuild the frame from the addresses alone.

**One idea:** the plan is drawn once, on a board (itazu 板図). Every crossing of its grid gets an address (banzuke 番付, e.g. い一 i-no-ichi). The address is written on every piece, where it will be hidden once built, so the frame tells you how it goes together. The episode reuses Episode 1's frame: a check proves its posts sit on grid line 一 at 910 mm, so they really are い一 to に一.

**Checks:** every Gate C check passes (`build/qa_report.md`):
- −16.0 LUFS / −1.1 dBTP
- captions identical to the narration
- all 18 kanji/kana marks on screen trace to verified rows
- narration and visual sync within ±0.01 s
- study holds as planned

**Fixed after review (Gate A):**
- Added rows for reuse when dismantling (R4-20) and for grid lines through post centres (R4-21).
- The addresses on the posts are now written vertically beside the centre line, with a caption tag, so they read.
- The beam's mark moved to the housing face that the post covers (exploded view), which matches "hidden once built".
- The grid is clipped to the board; romaji were added beside 一 二 三; text over timber got backing plates.
- I retook the fast N10 line.

**Fixed at Gate C:** the title card's grid labels collided with the title. I moved the grid and re-rendered that chunk.

**Not verified / softened:**
- The axis and starting corner of the addresses: shown as "one common layout", since they vary by carpenter.
- Marking the beam at every joint: "one common practice" (single source).
- "いの一番 comes from banzuke": a folk etymology, left out.
- "aiban" (合番) is not a carpentry labelling term, so it isn't used.
- Pronunciation was judged by ASR plus two AI listeners, not a human ear.

**Spend:** this episode about $0.16. Series total is in `spend.csv`.
