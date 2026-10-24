"""Series music bed, composed in code -> shared/audio/music/bed_<seconds>.wav (48 kHz stereo).

Quiet, warm, slow: sustained pads on diatonic seventh/ninth chords (no pentatonic riffs,
no gongs or koto-style stingers), plus sparse soft mallet notes. Same seed and harmony
every episode = the series theme; only the length changes.

  python3 make_bed.py 330      # seconds
"""
import pathlib
import sys

import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
OUT = pathlib.Path(__file__).resolve().parent
A4 = 440.0
midi = lambda m: A4 * 2 ** ((m - 69) / 12)

# D major, slow cycle. Voicings in MIDI notes (open, warm, mid-low register).
CHORDS = [
    [50, 57, 61, 64, 69],   # Dmaj9 (D A C# E A)
    [47, 54, 57, 61, 66],   # Bm11-ish (B F# A C# F#)
    [43, 50, 54, 57, 62],   # Gmaj7/9 (G D F# A D)
    [45, 52, 55, 59, 64],   # A sus / A7sus (A E G B E)
]
BAR = 9.0                   # seconds per chord


def pad(freqs, d, rng):
    tt = np.arange(int(d * SR)) / SR
    x = np.zeros_like(tt)
    for f in freqs:
        for h, a in ((1, 1.0), (2, 0.35), (3, 0.12), (4, 0.05)):
            det = 1 + rng.uniform(-0.0012, 0.0012)
            x += a * np.sin(2 * np.pi * f * h * det * tt + rng.uniform(0, 6.28)) * (1 + 0.08 * np.sin(2 * np.pi * rng.uniform(0.05, 0.12) * tt))
    a = np.minimum(1, tt / 3.0) * np.minimum(1, (d - tt) / 3.0)
    return x * np.clip(a, 0, 1) ** 1.5


def mallet(f, d=3.5):
    tt = np.arange(int(d * SR)) / SR
    x = sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt * k) for r, a, k in ((1, 1, 1.2), (2.0, 0.25, 2.5), (3.0, 0.08, 4)))
    return x * np.minimum(1, tt / 0.004)


def reverb(x, rng, secs=3.2):
    n = int(secs * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 3.0)
    ir = signal.lfilter(*signal.butter(1, 5000 / (SR / 2)), ir)
    ir /= np.sqrt(np.sum(ir ** 2))
    return signal.fftconvolve(x, ir)[: len(x)]


def bed(seconds):
    rng = np.random.default_rng(2026)
    n = int(seconds * SR)
    L = np.zeros(n + SR * 10)
    R = np.zeros_like(L)
    k = 0
    tpos = 0.0
    while tpos < seconds + BAR:
        ch = CHORDS[k % len(CHORDS)]
        p = pad([midi(m) for m in ch], BAR + 3.0, rng) * 0.05
        i = int(tpos * SR)
        pan = 0.5 + 0.15 * np.sin(k)
        L[i:i + len(p)] += p[: len(L) - i] * (1 - pan)
        R[i:i + len(p)] += p[: len(R) - i] * pan
        # two or three sparse mallet notes per chord, from the chord's upper tones
        for j in range(rng.integers(1, 4)):
            m = midi(rng.choice(ch[2:]) + 12)
            o = int((tpos + rng.uniform(1.0, BAR - 1.5)) * SR)
            s = mallet(m) * 0.03
            pn = rng.uniform(0.3, 0.7)
            L[o:o + len(s)] += s[: max(0, len(L) - o)] * (1 - pn)
            R[o:o + len(s)] += s[: max(0, len(R) - o)] * pn
        tpos += BAR
        k += 1
    L, R = L[:n], R[:n]
    L = 0.75 * L + 0.5 * reverb(L, rng)
    R = 0.75 * R + 0.5 * reverb(R, rng)
    lo = signal.butter(2, [70 / (SR / 2), 6000 / (SR / 2)], "band")
    L, R = signal.lfilter(*lo, L), signal.lfilter(*lo, R)
    fade = np.minimum(1, np.arange(n) / (3 * SR)) * np.minimum(1, (n - np.arange(n)) / (4 * SR))
    st = np.stack([L * fade, R * fade], 1)
    return st / np.max(np.abs(st)) * 0.5


if __name__ == "__main__":
    secs = float(sys.argv[1]) if len(sys.argv) > 1 else 60
    out = OUT / f"bed_{int(secs)}.wav"
    sf.write(out, bed(secs).astype(np.float32), SR, subtype="PCM_24")
    print("wrote", out)
