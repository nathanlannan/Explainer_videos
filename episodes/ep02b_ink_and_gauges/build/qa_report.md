# Gate C: QA report, Episode 2

Overall: **PASS**

| Check | Result | Detail |
|---|---|---|
| Runtime 4:30–5:30 | PASS | 284.03 s (4:44.03) |
| Format 1080p30 H.264 | PASS | 1920×1080 h264 30/1 |
| Chapters embedded | PASS | 10 chapters |
| Geometry checks | PASS | snap line end to end [[0.0, 105.0, 0.0], [3000.0, 105.0, 0.0]]; gauge line 30.0 mm from the edge, inside the board; sashigane long arm longer than the board width |
| Loudness −16 LUFS ±1, TP ≤ −1 dBTP | PASS | -16.0 LUFS, -1.3 dBTP, LRA 6.2 LU (ffmpeg ebur128 on the MP4) |
| Captions match final narration | PASS | text identical: True; all 58 cue starts inside a narration line: True; ≤2 lines × ≤42 chars |
| On-screen kanji trace to verified research rows | PASS | on screen: 仮子, 割罫引, 墨壺, 墨差し, 定規板, 差金, 棹, 毛引, 池, 筋罫引, 罫引, 軽子; verified rows found for: 仮子, 割罫引, 墨壺, 墨差し, 定規板, 差金, 棹, 毛引, 池, 筋罫引, 罫引, 軽子 |
| Narration/visual sync (named thing on screen when named) | PASS | S03:term↔'sumitsubo' +0.01s; S03:ike↔'ike' +0.01s; S03:pin↔'karuko' -0.01s; S06:term↔'sumisashi' +0.01s; S04:go↔'go' +0.01s; S07:draw↔'draw' +0.01s; S08:fence↔'fence' -0.01s; S11:term↔'shiragaki' +0.00s |
| Study holds | PASS | S03 3.5s, S05 2.0s, S07 4.0s, S09 3.5s, S10 2.5s, S13 8.5s |
| Stills exported | PASS | 20 stills in build/qa_stills/ (inspected by eye; notes below) |
