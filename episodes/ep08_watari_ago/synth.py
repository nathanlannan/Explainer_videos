"""Synthesize Episode 8 narration per line, then QA every clip.

  python3 synth.py            # synth missing lines + QA
  python3 synth.py N05 N21    # force retake of these lines

Outputs audio/Nxx.wav (trimmed, 48 kHz mono) and build/narration_qa.json
(duration, ASR transcript, word timestamps, listener verdicts for Japanese terms).
"""
import json, pathlib, subprocess, sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path[:0] = [str(ROOT / "shared/tools"), str(ROOT / "shared/audio/tools")]
import openrouter as o  # noqa: E402
import asr  # noqa: E402
import listen  # noqa: E402

MODEL, VOICE, PRICE = "google/gemini-3.8-flash-tts", "Sulafat", 0.00001
INSTR = ("A calm, warm, unhurried documentary narrator teaching a hand craft to a friend. Steady pace of about 135 words per minute. "
         "Japanese words are pronounced the Japanese way: even syllables, pure vowels, no English stress.")
TERMS = {"watari-ago": "わたりあご", "wa-ta-ri": "わたり", "shee-goo-chee": "しぐち", "ah-go": "あご", "eh-ra": "えら", "ai-gah-kee": "あいがき", "kabuto ari-kah-keh": "かぶとありかけ"}
LISTENERS = ["google/gemini-3.8-flash", "openai/gpt-audio-mini"]
AUD = HERE / "audio"
QA = HERE / "build" / "narration_qa.json"


def synth(line, take):
    raw = AUD / "raw" / f"{line['id']}_t{take}.pcm"
    o.tts(line.get("tts", line["text"]), raw, MODEL, VOICE, f"ep08 narration {line['id']} take {take}", PRICE, instructions=line.get("instr", INSTR), fmt="pcm")
    out = AUD / f"{line['id']}.wav"
    # trim leading/trailing silence, keep 60 ms padding, resample to 48 kHz
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", raw,
                    "-af", "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.06,areverse,"
                           "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.06,areverse",
                    "-ar", "48000", out], check=True)
    return out


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                                capture_output=True, text=True).stdout)


def main():
    lines = json.load(open(HERE / "narration.json"))["lines"]
    force = set(sys.argv[1:])
    qa = json.loads(QA.read_text()) if QA.exists() else {}
    for ln in lines:
        wav = AUD / f"{ln['id']}.wav"
        if ln["id"] in force or not wav.exists():
            take = qa.get(ln["id"], {}).get("take", 0) + 1
            synth(ln, take)
            q = {"take": take}
        elif ln["id"] in qa:
            continue
        else:
            q = {"take": 1}
        w = asr.words(wav)
        q.update(duration=round(dur(wav), 3), asr=" ".join(x[0] for x in w), words=w,
                 wpm=round(len(ln["text"].split()) / dur(wav) * 60, 1))
        terms = {k: v for k, v in TERMS.items() if k in ln.get("tts", ln["text"])}
        if terms:
            q["listen"] = {}
            for m in LISTENERS:
                r, _ = listen.listen(wav, ln.get("tts", ln["text"]), terms, purpose=f"ep08 listen {ln['id']}", model=m)
                q["listen"][m] = r.get("terms", r); q.setdefault("listen_full", {})[m] = r
        qa[ln["id"]] = q
        QA.parent.mkdir(exist_ok=True)
        QA.write_text(json.dumps(qa, indent=1, ensure_ascii=False))
        print(ln["id"], q["take"], q["duration"], q["wpm"], "|", q["asr"][:90],
              "|", json.dumps({m: ([(t.get("heard_kana"), t.get("correct")) for t in v] if isinstance(v, list) else str(v)[:160]) for m, v in q.get("listen", {}).items()}, ensure_ascii=False))
    tot = sum(qa[l["id"]]["duration"] for l in lines)
    print(f"total speech {tot:.1f}s; spent ${o.spent():.4f}")


if __name__ == "__main__":
    main()
