# Gate C: QA report, ep06_aritsugi_cutting

Overall: **PASS**

| Check | Result | Detail |
|---|---|---|
| Runtime 4:30–5:30 | PASS | 282.33 s (4:42.33) |
| Format 1080p30 H.264 | PASS | 1920×1080 h264 30/1 |
| Chapters embedded | PASS | 12 chapters |
| Geometry checks (cut states, fit check) | PASS | fitcheck: fit check PASS: interference 1/1 pairs ok (worst 0.0 mm^3); gaps 1/1 mates in contact; insertion 2/2 paths clear (worst 0.0 mm^3); tip_does_not_bottom_out: True; taper_gap_at_bottom_mm3: 98.1; taper_contact_at_top: True; locked_against_pull_apart: True; free_to_lift: True; enters_freely_until_seated: True |
| Loudness −16 LUFS ±1, TP ≤ −1 dBTP | PASS | -16.0 LUFS, -1.2 dBTP, LRA 7.8 LU (ffmpeg ebur128 on the MP4) |
| Captions match final narration | PASS | text identical: True; all 58 cue starts inside a narration line: True; ≤2 lines × ≤42 chars |
| On-screen kanji trace to verified research rows | PASS | on screen: ものつくり大学, 木殺し, 砂切り, 腰掛, 腰掛蟻継ぎ, 蟻; verified rows found for: ものつくり大学, 木殺し, 砂切り, 腰掛, 腰掛蟻継ぎ, 蟻 |
| Narration/visual sync (named thing on screen when named) | PASS | S03:male↔'male' -0.01s; S05:end↔'end' +0.01s; S05:dove↔'dovetail' +0.01s; S07:rip↔'rip' +0.01s; S07:chop↔'chop' +0.00s; S07:dig↔'dig' +0.01s; S08:cheeks↔'cheeks' -0.01s; S09:test↔'test' +0.00s |
| Study holds | PASS | S04 1.5s, S05 3.5s, S06 2.5s, S07 3.0s, S08 3.0s, S09 3.0s, S11 9.0s |
| Stills exported | PASS | 20 stills in build/qa_stills/ (inspected by eye; notes below) |
