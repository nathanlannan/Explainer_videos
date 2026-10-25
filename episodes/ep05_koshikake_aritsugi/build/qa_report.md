# Gate C: QA report, ep05_koshikake_aritsugi

Overall: **PASS**

| Check | Result | Detail |
|---|---|---|
| Runtime 4:30–5:30 | PASS | 293.30 s (4:53.30) |
| Format 1080p30 H.264 | PASS | 1920×1080 h264 30/1 |
| Chapters embedded | PASS | 14 chapters |
| Geometry checks (exact solids, fit check) | PASS | cannot_slide_in_along_sill: True; cannot_slide_in_across: True; fitcheck: fit check PASS: interference 1/1 pairs ok (worst -0.0 mm^3); gaps 1/1 mates in contact; insertion 2/2 paths clear (worst 0.0 mm^3); flare_per_side: 1:5; flare_in_sourced_range_1to4_1to5: True; neck_in_D1_range_W4_W3: True; length_in_D1_range_W4_W2: True; dovetail_in_upper_half: True; locked_against_pull_apart: True; locked_against_sideways: True; rests_on_seat: True; free_to_lift: True; collision_volumes_mm3: {'pull_apart_+x': 4725.0, 'slide_sideways_+z': 13125.0, 'push_down_-y': 10300.0, 'lift_+y': -0.0} |
| Loudness −16 LUFS ±1, TP ≤ −1 dBTP | PASS | -16.0 LUFS, -1.2 dBTP, LRA 9.3 LU (ffmpeg ebur128 on the MP4) |
| Captions match final narration | PASS | text identical: True; all 62 cue starts inside a narration line: True; ≤2 lines × ≤42 chars |
| On-screen kanji trace to verified research rows | PASS | on screen: 仕口, 大引, 女木, 敷面, 敷面蟻継, 男木, 継手, 胴付き, 腰掛, 腰掛蟻継ぎ, 蟻; verified rows found for: 仕口, 大引, 女木, 敷面, 敷面蟻継, 男木, 継手, 胴付き, 腰掛, 腰掛蟻継ぎ, 蟻 |
| Narration/visual sync (named thing on screen when named) | PASS | S03:tsugite↔'splice' +0.01s; S04:ari↔'dovetail' +0.01s; S04:seat↔'seat' +0.01s; S05:bolt↔'bolt' +0.00s; S06:ogi↔'male' +0.01s; S06:megi↔'female' +0.01s; S06:head↔'head' +0.01s; S06:neck↔'neck' +0.01s; S07:upper↔'upper' +0.00s; S08:end↔'end' +0.01s; S08:side↔'side' -0.01s; S10:pull↔'pull' +0.01s |
| Study holds | PASS | S03 2.5s, S04 3.0s, S05 3.0s, S06 3.5s, S07 2.5s, S09 3.5s, S10 3.0s, S12 9.0s |
| Stills exported | PASS | 21 stills in build/qa_stills/ (inspected by eye; notes below) |
