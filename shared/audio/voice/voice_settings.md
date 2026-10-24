# Series voice

- **Model:** `google/gemini-3.8-flash-tts` (OpenRouter), **voice:** `Sulafat`
- **Output:** `response_format: pcm` (24 kHz, 16-bit, mono, little-endian) → converted to WAV
- **Instructions (sent as `instructions`, never in the text):**
  > A calm, warm, unhurried documentary narrator teaching a hand craft to a friend. Steady pace of about 135 words per minute. Japanese words are pronounced the Japanese way: even syllables, pure vowels, no English stress.
- **Price (Oct 2026):** $0.0000005/input token + $0.000009/output token; measured ≈ $0.002 per 100 characters of narration.
- **Pronunciation hints:** OpenRouter exposes no SSML/phoneme input for this model, so the only lever is spelling in the input text (see `pronunciation.md`). No word timestamps are returned; captions use local forced alignment (`shared/audio/tools/asr.py`, faster-whisper).
- **QA per clip:** local ASR transcript vs script; two independent audio "listeners" (`google/gemini-3.8-flash`, `openai/gpt-audio-mini`) via `shared/audio/tools/listen.py` report the kana they hear for each term. A clip is retaken if either listener marks a term wrong and ASR agrees.

## Auditions (shared/audio/voice/auditions/)
Same line, with three Japanese terms:

| Voice | wpm | Term check (listeners) | Notes |
|---|---|---|---|
| ElevenLabs v3 `george` | 155 | shinzumi stressed English-style ("shin-ZOO-mee") | too fast for target; no speed control on this model |
| MAI-Voice-2.1 `en-US-Grant` | 154 | bakabō → "bakabū" (wrong vowel) | audible breaths |
| Gemini 3.8 Flash TTS `Charon` | 124 | all three Anglicised (sumitsu-KAY, long "zoo", short bo) | |
| **Gemini 3.8 Flash TTS `Sulafat`** | 121–136 | **all three correct (both listeners)** | chosen: rated warmest and clearest |
