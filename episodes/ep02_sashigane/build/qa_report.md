# Gate C: QA report, Episode 2

Overall: **PASS**

| Check | Result | Detail |
|---|---|---|
| Runtime 4:30–5:30 | PASS | 297.40 s (4:57.40) |
| Format 1080p30 H.264 | PASS | 1920×1080 h264 30/1 |
| Chapters embedded | PASS | 10 chapters |
| Geometry checks (√2 reading = largest inscribed square) | PASS | ura-me across 300 mm reads 212.13; largest square side 212.13; corners at r = 150.0; overhang at that side 0.0 mm³, at +1 mm 2.0 mm³; marume across 200 mm → 628.3 |
| Scales computed from definition | PASS | omote 501 ticks ×1 mm; ura-me 354 ticks ×√2; marume 158 ticks ×1/π (renderer draws these lists) |
| Loudness −16 LUFS ±1, TP ≤ −1 dBTP | PASS | -16.0 LUFS, -1.2 dBTP, LRA 6.8 LU (ffmpeg ebur128 on the MP4) |
| Captions match final narration | PASS | text identical: True; all 63 cue starts inside a narration line: True; ≤2 lines × ≤42 chars |
| On-screen kanji trace to verified research rows | PASS | on screen: 丸目, 妻手, 差金, 指矩, 曲尺, 表目, 裏目, 規矩術, 角目, 長手; verified rows found for: 丸目, 妻手, 差金, 指矩, 曲尺, 表目, 裏目, 規矩術, 角目, 長手 |
| Narration/visual sync (named thing on screen when named) | PASS | S03:term↔'sashigane' +0.00s; S03:nagate↔'nagate' -0.01s; S03:tsumate↔'tsumate' +0.01s; S07:term↔'omote' +0.01s; S08:term↔'scale' +0.50s; S10:read↔'read' -0.01s; S12:term↔'marume' -0.01s; S11:term↔'own' +0.01s |
| Study holds | PASS | S04 1.5s, S08 3.5s, S09 4.0s, S10 4.5s, S12 1.5s, S15 8.5s |
| Stills exported | PASS | 22 stills in build/qa_stills/ (inspected by eye; notes below) |
