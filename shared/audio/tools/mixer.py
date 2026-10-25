"""Series mixer: narration + SFX + ducked music bed -> master WAV at -16 LUFS, <= -1 dBTP.

Driven entirely by an episode's timeline.json (narration start times, SFX event times),
so sound lands on the same frame as the action that the renderer draws.
"""
import json
import pathlib
import subprocess

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy import signal
from scipy.ndimage import minimum_filter1d

SR = 48000
ROOT = pathlib.Path(__file__).resolve().parents[3]
SFX = ROOT / "shared/audio/sfx"
TARGET_LUFS, TP_MAX = -16.0, -1.0
DUCK_SPEECH, DUCK_FREE = -17.5, -12.0    # music loudness relative to voice, during / between speech (LU)
SFX_REL = -9.0                           # each SFX's own loudness relative to voice (LU)
SFX_GAIN = {"steel_set": 2, "stick_place": 2, "mark": -7, "pencil": -4, "mark_long": -3, "tape_out": -3, "tape_snap": -3}  # per-sound trims (dB)


def load(p, ch=1):
    x, sr = sf.read(p, dtype="float32", always_2d=True)
    if sr != SR:
        x = signal.resample_poly(x, SR, sr, axis=0)
    return x.mean(1) if ch == 1 else (x if x.shape[1] == 2 else np.repeat(x, 2, 1))


def lufs(x):
    m = pyln.Meter(SR)
    return m.integrated_loudness(x if x.ndim == 1 else x)


def true_peak_db(x):
    up = signal.resample_poly(x, 4, 1, axis=0)
    return 20 * np.log10(np.max(np.abs(up)) + 1e-12)


def _hold_release(target, look, rel):
    """Gain curve that drops early (look-ahead hold) and recovers smoothly (one-pole release)."""
    held = minimum_filter1d(target, size=2 * look + 1) if look else target
    k = np.exp(-1 / (rel * SR))
    smooth = signal.lfilter([1 - k], [1, -k], held, zi=[held[0] * k])[0]
    return np.minimum(held, smooth)


def limiter(x, ceiling_db=-1.3, look=0.005, rel=0.08):
    """Look-ahead peak limiter on 4x-oversampled peaks (keeps true peak under the ceiling)."""
    c = 10 ** (ceiling_db / 20)
    up = np.abs(signal.resample_poly(x, 4, 1, axis=0))
    peak = up[: len(x) * 4].reshape(len(x), 4, x.shape[1]).max(axis=(1, 2))
    need = np.minimum(1, c / np.maximum(peak, 1e-9))
    return x * _hold_release(need, int(look * SR), rel)[:, None]


def mix(timeline_path, narr_dir, bed_path, out_path, t0=0.0, t1=None):
    tl = json.loads(pathlib.Path(timeline_path).read_text())
    t1 = tl["total"] if t1 is None else t1
    n = int(round((t1 - t0) * SR))
    voice = np.zeros(n)
    active = np.zeros(n)
    for ln in tl["narration"]:
        if ln["end"] < t0 or ln["start"] > t1:
            continue
        x = load(pathlib.Path(narr_dir) / f"{ln['id']}.wav")
        i = int(round((ln["start"] - t0) * SR))
        a, b = max(0, i), min(n, i + len(x))
        voice[a:b] += x[a - i:b - i]
        active[a:b] = 1
    # voice: bring the summed narration to a reference loudness first
    vl = lufs(voice[active > 0]) if active.any() else -23
    voice *= 10 ** ((-20 - vl) / 20)
    vl = -20.0
    sfx = np.zeros(n)
    cache = {}
    for ev in tl["sfx"]:
        if not (t0 <= ev["t"] < t1):
            continue
        if ev["sfx"] not in cache:
            s = load(SFX / f"{ev['sfx']}.wav")
            sl = lufs(np.concatenate([s, np.zeros(SR // 2)])) if len(s) > SR * 0.41 else 20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-9)
            cache[ev["sfx"]] = s * 10 ** ((vl + SFX_REL + SFX_GAIN.get(ev["sfx"], 0) - sl) / 20)
        s = cache[ev["sfx"]]
        i = int(round((ev["t"] - t0) * SR))
        b = min(n, i + len(s))
        sfx[i:b] += s[: b - i]
    # music: duck under speech with smoothed gain
    bed = load(bed_path, ch=2)
    i0 = int(round(t0 * SR))
    bed = bed[i0:i0 + n]
    if len(bed) < n:
        bed = np.pad(bed, ((0, n - len(bed)), (0, 0)))
    bl = lufs(bed)
    gs, gf = 10 ** ((vl + DUCK_SPEECH - bl) / 20), 10 ** ((vl + DUCK_FREE - bl) / 20)
    target = np.where(active > 0, gs, gf)
    # attack 0.25 s ahead of speech (look-ahead), release 0.6 s
    g = _hold_release(target, int(0.25 * SR), 0.6)
    music = bed * g[:, None]
    master = np.stack([voice + sfx, voice + sfx], 1) + music
    gain = TARGET_LUFS - lufs(master)
    master *= 10 ** (gain / 20)
    if true_peak_db(master) > TP_MAX - 0.2:
        master = limiter(master)
        master *= 10 ** ((TARGET_LUFS - lufs(master)) / 20)
        if true_peak_db(master) > TP_MAX:
            master = limiter(master, ceiling_db=-1.6)
    sf.write(out_path, master.astype(np.float32), SR, subtype="PCM_24")
    rep = measure(out_path)
    rep["music_vs_voice_during_speech_LU"] = round(lufs(music[active > 0]) - lufs(np.stack([voice, voice], 1)[active > 0]), 1) if active.any() else None
    return rep


def measure(path):
    """Integrated loudness and true peak via ffmpeg's EBU R128 meter (independent of pyloudnorm)."""
    r = subprocess.run(["ffmpeg", "-nostats", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    tail = r[r.rfind("Summary:"):]
    get = lambda key: float(tail.split(key)[1].split()[0])
    return {"integrated_LUFS": get("I:"), "true_peak_dBTP": get("Peak:"), "LRA_LU": get("LRA:")}
