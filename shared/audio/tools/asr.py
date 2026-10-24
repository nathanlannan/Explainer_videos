"""Local ASR helpers (faster-whisper, CPU) used to check narration we can't listen to by ear.

- words(path): English word timestamps (for captions and sync)
- term_check(path, start, end): transcribe one term's audio in Japanese mode; returns kana/kanji text
"""
import functools, subprocess
import numpy as np
from faster_whisper import WhisperModel

SR = 16000


def load(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


@functools.cache
def model(name):
    return WhisperModel(name, device="cpu", compute_type="int8")


def words(path, name="small.en", prompt=None):
    segs, _ = model(name).transcribe(load(path), word_timestamps=True, initial_prompt=prompt, language="en")
    return [(w.word.strip(), float(w.start), float(w.end)) for s in segs for w in s.words]


def term_check(path, start, end, pad=0.12, name="medium"):
    a = load(path)
    seg = a[max(0, int((start - pad) * SR)): int((end + pad) * SR)]
    seg = np.concatenate([np.zeros(SR // 2, np.float32), seg, np.zeros(SR // 2, np.float32)])
    segs, _ = model(name).transcribe(seg, language="ja", beam_size=5)
    return "".join(s.text for s in segs).strip()
