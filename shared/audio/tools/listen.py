"""An independent 'ear': send a narration clip to an audio-input model and ask for a
pronunciation/delivery critique. Used because the producer cannot listen to audio.
Results are advisory and cross-checked with local ASR (asr.py)."""
import base64, json, pathlib, re, subprocess, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[2] / "tools"))
import openrouter as o  # noqa: E402

LISTENER = "google/gemini-3.8-flash"

PROMPT = """You are a strict pronunciation and voice-over reviewer, fluent in Japanese and English.
Listen to this English narration clip. Intended script: {script!r}
Japanese terms and their correct kana: {terms}
For each Japanese term: write the kana you actually HEAR (be literal: note doubled consonants, long or short vowels, extra syllables), and judge correct/incorrect against the target kana.
Then rate: overall clarity 1-5, warmth 1-5, naturalness 1-5; note any audio artifacts, mispronounced English words, or words that differ from the script.
Reply with JSON only: {{"terms":[{{"term":..,"heard_kana":..,"correct":true/false,"note":..}}],"clarity":n,"warmth":n,"naturalness":n,"script_deviations":[..],"artifacts":[..]}}"""


def listen(path, script, terms, purpose="pronunciation listen", model=LISTENER):
    mp3 = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(path), "-ac", "1", "-b:a", "64k", "-f", "mp3", "-"],
                         capture_output=True, check=True).stdout
    msg = [{"role": "user", "content": [
        {"type": "text", "text": PROMPT.format(script=script, terms=json.dumps(terms, ensure_ascii=False))},
        {"type": "input_audio", "input_audio": {"data": base64.b64encode(mp3).decode(), "format": "mp3"}}]}]
    d, cost = o.chat(model, msg, purpose, max_tokens=1500, est=0.01)
    txt = d["choices"][0]["message"]["content"]
    m = re.search(r"\{.*\}", txt, re.S)
    return json.loads(m.group(0)) if m else {"raw": txt}, cost
