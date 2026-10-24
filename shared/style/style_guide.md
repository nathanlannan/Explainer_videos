# Series style guide: Japanese Joinery by Hand

Rule zero: **be correct, then beautiful.** If a shot looks right but teaches something wrong, it fails. The tokens live in `tokens.js`; `contrast.py` checks every text/background pair.

## Palette
| Token | Hex | Use |
|---|---|---|
| paper | `#F3EEE4` | every background |
| paperDeep | `#E9E1D2` | panels and boards |
| wood | `#E6C9A0` | hinoki timber. Procedural grain always runs along the member's long axis; end faces show rings. |
| woodDark | `#C9A577` | shading accents |
| ink | `#1B1B1B` | all text, all marks and lines (14.9:1 on paper) |
| inkSoft | `#4A4642` | secondary text, glosses (8.1:1) |
| accent (shu vermilion) | `#B8432F` | **only** for attention or error, and **always** with a ✕ icon or explicit words (4.7:1 on paper, AA) |
| ghost blue-grey | `#7D8EA0` | ghosted previews, guides and "where it should be" lines. Never used for text (2.9:1). |

The story stick is tinted paler than the timber (`#FFF6E6` multiply) so it stays readable when lying on a post.

## Encodings (same everywhere, every episode)
- **Center line:** dash-dot ink (pattern 30-9-6-9 px in 2D; 80-22-14-22 mm in 3D). On real timber it is one solid ink line; the dash-dot is our symbol, and Episode 1 says so on screen.
- **Reference face/edge:** no traditional Japanese symbol was found (R-04), so the series does not invent one and present it as traditional. If a later episode needs a face mark, label it "our symbol".
- **Cut line vs waste:** waste is always hatched (45° ink hatch at 25% opacity) or ghost-tinted, never left ambiguous. Not used in Ep 1, which has no cutting.
- **Ghosted next step:** translucent blue-grey (opacity 0.28–0.55).
- **Mistake or error:** accent colour + ✕ icon (`X_ICON`). Agreement: ink ✓ (`CHECK_ICON`). Never colour alone.
- **Exaggeration:** any scaled-up error or size difference carries a visible label ("drawn 20× larger", "drawn 4× larger").
- **Marks:** drawn heavier than real ink so they read at 1080p (3.5–6 mm wide in 3D). Positions are exact.

## Type
- Noto Sans (Latin) and Noto Sans / Serif CJK JP (kanji). All are OFL.
- Minimum sizes at 1080p: labels 36 px, titles 48 px. Card titles 84–110 px.
- **Term label:** romaji in italic bold, kanji (Noto Serif CJK JP) beside it, plain-English gloss underneath in inkSoft. Kanji appear only for terms *verified* in the research table; otherwise romaji only.
- Labels stay up for at least 1.5× their reading time.
- Title-safe: everything sits inside a 5% margin (96 px left/right, 54 px top/bottom).

## Camera
Presets (`lib.js → PRESETS`, FOV 24°): **front**, **threeQ** (three-quarter), **top**, **section**. Only slow, eased moves (`ramp` = cubic in-out). Never move during a key explanation. One idea per shot.

## Study holds
Every key diagram holds still for at least 3 s, with no camera move and no narration, and is a chapter marker. The recap glossary holds for at least 8 s.

## Cards
- **Title card:** "JAPANESE JOINERY BY HAND" (tracked caps, 40 px) / "EPISODE N" (48 px bold) / dash-dot rule / title (110 px bold) / subtitle (64 px inkSoft). An episode emblem slot sits on the right half, drawn from that episode's own geometry.
- **End card:** the same header, then "Next · Episode N+1", the next title and a one-line teaser.
- Shot transitions fade through paper in 0.4 s.

## Output
1920×1080, 30 fps, H.264 (x264 CRF 16 for masters), AAC 256 kbps. Audio is mixed to −16 LUFS integrated, true peak ≤ −1 dBTP, with music about 20 dB under the voice.

## Episode 4 onward
Any episode that shows cutting tools ends with one line noting that sharp-tool technique is best learned from a teacher.
