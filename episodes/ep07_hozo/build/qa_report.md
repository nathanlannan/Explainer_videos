# Gate C: QA report, ep07_hozo

Overall: **PASS**

| Check | Result | Detail |
|---|---|---|
| Runtime 4:30–5:30 | PASS | 314.17 s (5:14.17) |
| Format 1080p30 H.264 | PASS | 1920×1080 h264 30/1 |
| Chapters embedded | PASS | 13 chapters |
| Geometry checks (fit-checked joints) | PASS | short_fit: fit check PASS: interference 1/1 pairs ok (worst 0.0 mm^3); gaps 1/1 mates in contact; insertion 2/2 paths clear (worst 0.0 mm^3); long_fit: fit check PASS: interference 3/3 pairs ok (worst 0.0 mm^3); gaps 2/2 mates in contact; insertion 3/3 paths clear (worst 0.0 mm^3); short_tenon_is_short: True; long_tenon_most_of_sill: True; long_tenon_stays_inside_sill: True; pin_locks_post_against_lift: True; short_post_free_to_lift: True; tenon_ratio_short: 0.286; tenon_ratio_long: 0.25 |
| Loudness −16 LUFS ±1, TP ≤ −1 dBTP | PASS | -16.0 LUFS, -1.2 dBTP, LRA 7.6 LU (ffmpeg ebur128 on the MP4) |
| Captions match final narration | PASS | text identical: True; all 66 cue starts inside a narration line: True; ≤2 lines × ≤42 chars |
| On-screen kanji trace to verified research rows | PASS | on screen: 扇ほぞ, 枘, 枘穴, 込み栓, 重ほぞ, 鼻栓; verified rows found for: 扇ほぞ, 枘, 枘穴, 込み栓, 重ほぞ, 鼻栓 |
| Narration/visual sync (named thing on screen when named) | PASS | S03:tenon↔'tenon' +0.01s; S03:ana↔'mortise' -0.01s; S04:short↔'short' +0.01s; S04:long↔'long' -0.01s; S05:rating↔'rating' -0.01s; S06:pin↔'pin' +0.01s; S06:holes↔'holes' +0.01s; S07:rip↔'rip' +0.01s; S08:chisel↔'chisel' -0.01s |
| Study holds | PASS | S03 2.5s, S04 3.0s, S05 3.5s, S06 3.5s, S08 2.5s, S09 2.0s, S11 9.0s |
| Stills exported | PASS | 20 stills in build/qa_stills/ (inspected by eye; notes below) |
