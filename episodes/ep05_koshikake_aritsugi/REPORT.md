# Episode 5: The First Joint, koshikake ari-tsugi 腰掛蟻継ぎ

**File:** `out/ep05_koshikake_aritsugi.mp4`. 1080p30, **4:53**, with chapters and soft captions. Also included:
- `out/ep05_koshikake_aritsugi.srt` and `out/chapters.txt`
- `script.md` and `storyboard.md`
- `out/glossary.md`
- `out/bench_exercise.pdf`: build the joint full size in card, to see why it drops in from above and can't slide apart.

**One idea:** a tsugite (splice) joins two members in line. The koshikake ari-tsugi puts a dovetail in the upper half and a seat in the lower half. The male drops in from above and resists a modest pull. It is almost a hinge, so it goes where the specs allow: away from posts and vents, with the anchor bolt in the upper piece.

**Checks:** every Gate C check passes:
- −16.0 LUFS / −1.2 dBTP
- captions identical to the narration
- all on-screen kanji trace to verified rows
- narration and visual sync within ±0.01 s
- holds meet minimum lengths

**Geometry:** parametric and fit-checked (`params.py`):
- no interference, and faces in contact
- a clear drop-in path
- locked against pulling apart and sliding sideways
- cannot be slid in along or across the sill

The drawing's neck and length are checked against the engineering study's ranges.

**Fixed after review (Gate A):**
- The example dimensions came from a video that couldn't be fetched. They are not cited; the drawing is justified by the engineering ranges (R6-19) instead.
- The Western 1:6–1:8 dovetail comparison was cut because it was unsourced.
- Spec claims are split between their two sources: Flat 35 (JHF) for where the splice goes, and the MLIT spec for the anchor bolt.

**Fixed in production:** the 仕口 gloss in S03 overran the title-safe margin. It was moved left and that chunk re-rendered.

**Not verified / softened:**
- The seat length has no source. The model uses 30 mm, and the length is never stated on screen.
- "ogi"/"megi" still have slightly long vowels after three TTS takes. The kanji 男木/女木 are on screen.

**Spend:** about $0.10 for this episode.
