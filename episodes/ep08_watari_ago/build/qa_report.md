# Gate C: QA report, ep08_watari_ago

Overall: **PASS**

| Check | Result | Detail |
|---|---|---|
| Runtime 4:30–5:30 | PASS | 310.70 s (5:10.70) |
| Format 1080p30 H.264 | PASS | 1920×1080 h264 30/1 |
| Chapters embedded | PASS | 13 chapters |
| Geometry checks (fit-checked joints) | PASS | watari_fit: fit check PASS: interference 1/1 pairs ok (worst 0.0 mm^3); gaps 1/1 mates in contact; insertion 2/2 paths clear (worst 0.0 mm^3); aigaki_fit: fit check PASS: interference 1/1 pairs ok (worst 0.0 mm^3); gaps 1/1 mates in contact; insertion 2/2 paths clear (worst 0.0 mm^3); locked_along_lower_+x: True; locked_along_lower_-x: True; locked_along_upper_+z: True; locked_along_upper_-z: True; free_to_lift: True; cuts_shallow: True; different_heights: True; aigaki_tops_flush: True; aigaki_half_depth: True; upper_volume_removed_mm3: 55125; lower_volume_removed_mm3: 110250 |
| Loudness −16 LUFS ±1, TP ≤ −1 dBTP | PASS | -16.0 LUFS, -1.2 dBTP, LRA 6.9 LU (ffmpeg ebur128 on the MP4) |
| Captions match final narration | PASS | text identical: True; all 61 cue starts inside a narration line: True; ≤2 lines × ≤42 chars |
| On-screen kanji trace to verified research rows | PASS | on screen: かぶとあり掛け, 京呂組, 仕口, 大入れあり掛け, 渡り, 渡りあご, 渡り腮, 相欠き, 継手, 羽子板ボルト, 腮; verified rows found for: かぶとあり掛け, 京呂組, 仕口, 大入れあり掛け, 渡り, 渡りあご, 渡り腮, 相欠き, 継手, 羽子板ボルト, 腮 |
| Narration/visual sync (named thing on screen when named) | PASS | S03:crossing↔'crossing' +0.01s; S03:jaw↔'jaw' +0.01s; S04:groove↔'groove' -0.01s; S04:comes↔'comes' +0.01s; S04:slide↔'slide' -0.00s; S05:aigaki↔'aigaki' -0.01s; S06:roof↔'roof' +0.01s; S06:flush↔'flush' -0.01s; S07:plate↔'plate' +0.01s; S07:forbid↔'forbid' -0.01s |
| Study holds | PASS | S03 3.0s, S04 3.5s, S05 3.5s, S06 3.5s, S07 3.0s, S09 9.0s |
| Stills exported | PASS | 16 stills in build/qa_stills/ (inspected by eye; notes below) |
