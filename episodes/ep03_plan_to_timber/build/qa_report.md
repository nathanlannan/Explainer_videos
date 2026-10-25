# Gate C: QA report, Episode 2

Overall: **PASS**

| Check | Result | Detail |
|---|---|---|
| Runtime 4:30–5:30 | PASS | 283.07 s (4:43.07) |
| Format 1080p30 H.264 | PASS | 1920×1080 h264 30/1 |
| Chapters embedded | PASS | 11 chapters |
| Geometry checks | PASS | Episode 1 posts sit on grid line 一 at 910 mm: True; addresses い一, ろ一, は一, に一, い二, に二, い三, ろ三, は三, に三 |
| Loudness −16 LUFS ±1, TP ≤ −1 dBTP | PASS | -16.0 LUFS, -1.1 dBTP, LRA 7.6 LU (ffmpeg ebur128 on the MP4) |
| Captions match final narration | PASS | text identical: True; all 60 cue starts inside a narration line: True; ≤2 lines × ≤42 chars |
| On-screen kanji trace to verified research rows | PASS | on screen: い, い一, に, に一, は, は一, ろ, ろ一, 一, 三, 二, 刻み, 図板, 墨付け, 尺, 手板, 板図, 番付; verified rows found for: い, い一, に, に一, は, は一, ろ, ろ一, 一, 三, 二, 刻み, 図板, 墨付け, 尺, 手板, 板図, 番付 |
| Narration/visual sync (named thing on screen when named) | PASS | S03:term↔'itazu' -0.01s; S03:shaku↔'shaku' +0.00s; S04:term↔'banzuke' +0.01s; S04:i1↔'inoichi' +0.01s; S05:writes↔'writes' +0.00s; S05:floor↔'floor' +0.01s; S06:marked↔'marked' +0.01s; S08:cut↔'kizami' +0.01s |
| Study holds | PASS | S03 3.5s, S04 3.5s, S05 3.0s, S07 1.5s, S08 3.5s, S09 1.5s, S11 8.5s |
| Stills exported | PASS | 19 stills in build/qa_stills/ (inspected by eye; notes below) |
