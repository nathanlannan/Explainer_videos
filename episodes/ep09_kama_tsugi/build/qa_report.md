# Gate C: QA report, ep09_kama_tsugi

Overall: **PASS**

| Check | Result | Detail |
|---|---|---|
| Runtime 4:30–5:30 | PASS | 301.53 s (5:01.53) |
| Format 1080p30 H.264 | PASS | 1920×1080 h264 30/1 |
| Chapters embedded | PASS | 13 chapters |
| Geometry checks (fit-checked joints) | PASS | fitcheck: fit check PASS: interference 1/1 pairs ok (worst 0.0 mm^3); gaps 1/1 mates in contact; insertion 2/2 paths clear (worst 0.0 mm^3); cannot_slide_in_along: True; locked_against_pull_apart: True; locked_against_sideways: True; rests_on_seat: True; free_to_lift: True; L_in_D3_range_1.15W_1.75W: True; neck_in_D3_range_W4_W3: True; flare_in_D3_range_L20_L15: True; head_wider_than_neck: True; collision_volumes_mm3: {'pull_apart_+x': 4350.0, 'slide_sideways_+z': 45000.0, 'push_down_-y': 13725.0, 'lift_+y': 0.0} |
| Loudness −16 LUFS ±1, TP ≤ −1 dBTP | PASS | -16.0 LUFS, -1.1 dBTP, LRA 7.4 LU (ffmpeg ebur128 on the MP4) |
| Captions match final narration | PASS | text identical: True; all 61 cue starts inside a narration line: True; ≤2 lines × ≤42 chars |
| On-screen kanji trace to verified research rows | PASS | on screen: かまつぎ, 女木, 男木, 目違い, 腰掛, 腰掛け鎌継ぎ, 鎌, 鎌継ぎ, 鎌首, 首; verified rows found for: かまつぎ, 女木, 男木, 目違い, 腰掛, 腰掛け鎌継ぎ, 鎌, 鎌継ぎ, 鎌首, 首 |
| Narration/visual sync (named thing on screen when named) | PASS | S03:sickle↔'sickle' +0.01s; S03:kubi↔'kamakubi' +0.00s; S04:male↔'male' +0.01s; S04:drops↔'drops' +0.01s; S04:slide↔'slide' +0.01s; S05:test↔'test' -0.01s; S05:stress↔'stress' +0.01s; S06:sills↔'sills' -0.01s; S06:bolt↔'anchor' +0.01s; S07:stub↔'stub' +0.01s |
| Study holds | PASS | S03 3.0s, S04 3.5s, S05 3.5s, S06 3.5s, S07 3.0s, S09 9.0s |
| Stills exported | PASS | 16 stills in build/qa_stills/ (inspected by eye; notes below) |
