# Gate C: QA report, Episode 2

Overall: **PASS**

| Check | Result | Detail |
|---|---|---|
| Runtime 4:30–5:30 | PASS | 277.00 s (4:37.00) |
| Format 1080p30 H.264 | PASS | 1920×1080 h264 30/1 |
| Chapters embedded | PASS | 14 chapters |
| Geometry checks (line choices, kerf, tenon) | PASS | kerf_wider_than_plate: True; leave_keeps_whole_line: True; take_leaves_no_line_on_piece: True; kerf_narrower_than_line: True; split_is_centred_sliver_each_side: True; piece_size_order: True; tenon_fits_member: True; cold_open_kerf_in_waste: True; panels (kerf intervals, line centred at 0, width 12.0): {'take': [-6.0, 2.0], 'leave': [6.0, 14.0], 'split': [-4.0, 4.0]} |
| Loudness −16 LUFS ±1, TP ≤ −1 dBTP | PASS | -16.0 LUFS, -1.3 dBTP, LRA 9.2 LU (ffmpeg ebur128 on the MP4) |
| Captions match final narration | PASS | text identical: True; all 55 cue starts inside a narration line: True; ≤2 lines × ≤42 chars |
| On-screen kanji trace to verified research rows | PASS | on screen: 両刃, 横挽き, 片刃鋸, 縦挽き, 背金, 胴付, 胴付鋸; verified rows found for: 両刃, 横挽き, 片刃鋸, 縦挽き, 背金, 胴付, 胴付鋸 |
| Narration/visual sync (named thing on screen when named) | PASS | S04:term↔'double' -0.01s; S04:rip↔'rips' +0.01s; S04:cross↔'crosscuts' +0.01s; S06:spine↔'spine' +0.01s; S06:shoulder↔'shoulder' +0.00s; S08:set↔'set' -0.01s; S09:away↔'away' +0.01s; S09:leave↔'leave' +0.00s; S09:split↔'split' +0.01s; S10:thick↔'thickness' -0.01s; S10:width↔'width' -0.01s |
| Study holds | PASS | S03 3.5s, S04 3.0s, S05 3.5s, S07 2.0s, S08 3.5s, S09 4.0s, S10 3.5s, S11 2.0s, S13 9.0s |
| Stills exported | PASS | 24 stills in build/qa_stills/ (inspected by eye; notes below) |
