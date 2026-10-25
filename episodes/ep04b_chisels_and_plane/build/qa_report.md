# Gate C: QA report, Episode 2

Overall: **PASS**

| Check | Result | Detail |
|---|---|---|
| Runtime 4:30–5:30 | PASS | 276.27 s (4:36.27) |
| Format 1080p30 H.264 | PASS | 1920×1080 h264 30/1 |
| Chapters embedded | PASS | 13 chapters |
| Geometry checks (tool models) | PASS | struck_chisels_have_hoops: True; mortise_chisel_thicker_than_wide: True; genno_dome_shallow: True; kanna_blade_projects_above_block: True; kanna_blade_head_inside_block: True; kanna_mouth_inside_block: True; chip_breaker_behind_edge: True |
| Loudness −16 LUFS ±1, TP ≤ −1 dBTP | PASS | -16.0 LUFS, -1.3 dBTP, LRA 10.2 LU (ffmpeg ebur128 on the MP4) |
| Captions match final narration | PASS | text identical: True; all 59 cue starts inside a narration line: True; ≤2 lines × ≤42 chars |
| On-screen kanji trace to verified research rows | PASS | on screen: かつら, 二枚鉋, 叩き鑿, 台, 向待鑿, 地金, 大入, 木殺し面, 片刃, 玄能, 突き鑿, 裏スキ, 裏金, 追入鑿, 鉋, 鋼, 鑿; verified rows found for: かつら, 二枚鉋, 叩き鑿, 台, 向待鑿, 地金, 大入, 木殺し面, 片刃, 玄能, 突き鑿, 裏スキ, 裏金, 追入鑿, 鉋, 鋼, 鑿 |
| Narration/visual sync (named thing on screen when named) | PASS | S03:term↔'nomi' +0.00s; S03:struck↔'struck' -0.01s; S03:pushed↔'pushed' +0.01s; S03:katsura↔'katsura' +0.01s; S05:hagane↔'hagane' +0.00s; S05:jigane↔'jigane' +0.01s; S05:ura↔'urasuki' +0.01s; S06:kigoroshi↔'kigoroshi' +0.00s; S07:dai↔'block' +0.00s; S07:cb↔'second' -0.01s; S09:dull↔'dull' +0.01s |
| Study holds | PASS | S03 3.5s, S04 3.5s, S05 3.5s, S06 3.0s, S07 3.5s, S08 2.0s, S09 1.5s, S11 9.0s |
| Stills exported | PASS | 21 stills in build/qa_stills/ (inspected by eye; notes below) |
