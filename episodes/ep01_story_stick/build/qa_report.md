# Gate C: QA report, Episode 1

Overall: **PASS**

| Check | Result | Detail |
|---|---|---|
| Runtime 4:30–5:30 | PASS | 326.33 s (5:26.33) |
| Format 1080p30 H.264 | PASS | 1920×1080 h264 30/1 |
| Chapters embedded | PASS | 11 chapters |
| Fit check (cold-open frame) | PASS | max interference 0.0 mm³ over 36 pairs; 14/14 mates in contact; 9/9 insertion paths clear |
| Post marks == story-stick definition | PASS | post_marks == stick_marks for all 4 posts; renderer draws both from the same MARKS() list ([0.0, 15.0, 1000.0, 1090.0, 2685.0, 2700.0] mm) |
| Loudness −16 LUFS ±1, TP ≤ −1 dBTP | PASS | -16.0 LUFS, -1.2 dBTP, LRA 9.2 LU (ffmpeg ebur128 on the MP4) |
| Captions match final narration | PASS | text identical: True; all 72 cue starts inside a narration line: True; ≤2 lines × ≤42 chars |
| On-screen kanji trace to verified research rows | PASS | on screen: 墨付け, 板図, 芯墨, 馬鹿棒; verified rows found for: 墨付け, 板図, 芯墨, 馬鹿棒 |
| Narration/visual sync (named thing on screen when named) | PASS | S05:term↔'called' +0.01s; S07:term↔'shinzumi' -0.00s; S14:term↔'called' +0.50s; S16:term↔'itazu' +0.00s; S10:m0↔'bottom' -0.01s; S10:m4↔'underside' +0.01s; S12:x20↔'drawn' -0.01s; S01:beam↔'beam' -0.01s |
| Study holds | PASS | S04 0.9s, S05 1.3s, S07 4.0s, S08 1.0s, S10 3.6s, S11 4.0s, S12 4.5s, S13 2.5s, S14 1.5s, S17 8.5s |
| Stills exported | PASS | 28 stills in build/qa_stills/ (inspected by eye; notes below) |
