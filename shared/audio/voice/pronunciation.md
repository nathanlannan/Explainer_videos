# Series pronunciation sheet

Kana from dictionary sources (research table R-16). Pitch accent is **unverified** for all compounds (no dictionary data found); say them flat and even.
"TTS spelling" is what goes into the narration text sent to the voice model. Status is from Episode 1 tests (ASR round-trip plus two audio-model listeners); "heard" = kana the listeners reported.

| Romaji | Kanji | Kana | English respelling | TTS spelling | Ep 1 status |
|---|---|---|---|---|---|
| sumitsuke | 墨付け | すみつけ | soo-mee-tsoo-keh (u's light) | `sumi-tsuke` | OK with `sumi-tsuke` (plain `sumitsuke` sometimes ended on an English "kay") |
| shinzumi | 芯墨 | しんずみ | sheen-zoo-mee (even, not "ZOO") | `shinzumi` | OK (heard しんずみ) |
| bakabō | 馬鹿棒 | ばかぼう | bah-kah-boh (hold the last o) | `bakabō` in running speech; `baka-bō` if the ō comes out short | OK in context; short ō in one short test sentence (fixed by `baka-bō`) |
| ita-zu | 板図 | いたず | ee-tah-zoo | `itazu` | OK (ASR いたず; the hyphenated `ita-zu` gave いたずう) |

| sashigane | 差金 | さしがね | sah-shee-gah-neh | `sashigane` | OK (heard さしがね) |
| nagate | 長手 | ながて | nah-gah-teh | `nagate` | OK |
| tsumate | 妻手 | つまて (also つまで) | tsoo-mah-teh | `tsumate` | OK |
| omote-me | 表目 | おもてめ | oh-moh-teh-meh | `omote-meh` | OK with `omote-meh` (plain `omoteme` heard おもてぞめ; `omote-me` sometimes "-may") |
| ura-me | 裏目 | うらめ | oo-rah-meh | `ura-me` | OK (heard うらめ) |
| marume | 丸目 | まるめ | mah-roo-meh | `maroo-meh` | OK with `maroo-meh`; `marume`, `maru-me` and kana all came out "-may" (まるめい) |
| kikujutsu | 規矩術 | きくじゅつ | kee-koo-joo-tsoo | `kikujutsu` | OK (heard きくじゅつ) |
| shaku | 尺 | しゃく | shah-koo | `shaku` | OK |

**Series rule learned in Ep 2:** Gemini TTS tends to turn a final "-me" into "-may". Spell final "me" as "meh" in the `tts` text.

Later episodes (to be tested when used): sumitsubo すみつぼ, sumisashi すみさし, kebiki けびき, shirabiki しらびき, aiban あいばん, ryōba りょうば, dozuki どうづき, kataba かたば, nomi のみ, gennō げんのう, kanna かんな, koshikake ari-tsugi こしかけありつぎ, hozo ほぞ, hozo-ana ほぞあな, kama-tsugi かまつぎ, watari-ago わたりあご, okkake daisen-tsugi おっかけだいせんつぎ.
