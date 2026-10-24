"""Series SFX library, synthesized from scratch (numpy) -> shared/audio/sfx/*.wav (48 kHz mono).

Every sound is generated here, so the library is original work dedicated to the
public domain (CC0) -- see licenses.md. Re-run to regenerate; seeds are fixed.

  python3 make_sfx.py
"""
import pathlib

import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
OUT = pathlib.Path(__file__).resolve().parent
rng = np.random.default_rng(1234)


def t(d):
    return np.arange(int(d * SR)) / SR


def bp(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], "band")
    return signal.lfilter(b, a, x)


def lp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2))
    return signal.lfilter(b, a, x)


def hp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), "high")
    return signal.lfilter(b, a, x)


def env(n, a, d, shape=4.0):
    """attack a s (linear), then exponential-ish decay over d s."""
    e = np.ones(n)
    na = max(1, int(a * SR))
    e[:na] = np.linspace(0, 1, na)
    tt = np.arange(n - na) / SR
    e[na:] = np.exp(-shape * tt / max(d, 1e-3))
    return e


def norm(x, peak=0.7):
    x = x - np.mean(x)
    return x / (np.max(np.abs(x)) + 1e-9) * peak


def knock(f0, d, partials=((1, 1), (2.3, .5), (3.9, .3), (5.6, .15)), noise=0.3):
    """Wooden knock: a few inharmonic damped modes plus a click of filtered noise."""
    n = int(d * SR)
    x = np.zeros(n)
    tt = t(d)
    for ratio, amp in partials:
        x += amp * np.sin(2 * np.pi * f0 * ratio * tt) * np.exp(-tt * (18 + 9 * ratio) / d * 0.12)
    click = bp(rng.standard_normal(n), f0 * 1.5, min(f0 * 9, 16000)) * env(n, 0.0005, 0.02, 6)
    return x * env(n, 0.001, d, 5) + noise * click


def scratch(d, lo=1800, hi=7000, grit=0.6):
    """Pen or pencil on wood: band-limited noise with grainy amplitude modulation, soft edges."""
    n = int(d * SR)
    x = bp(rng.standard_normal(n), lo, hi)
    grain = lp(np.abs(rng.standard_normal(n)), 60) * grit + (1 - grit)
    shape = np.sin(np.linspace(0, np.pi, n)) ** 1.2
    return x * grain * shape


def write(name, x, peak=0.7):
    sf.write(OUT / f"{name}.wav", norm(x, peak).astype(np.float32), SR, subtype="PCM_24")


def main():
    # --- Episode 1 ---
    write("mark", lp(scratch(0.3, 900, 4200, 0.5), 3500), 0.5)
    write("mark_long", lp(scratch(1.6, 900, 4200, 0.5), 3500), 0.45)
    write("pencil", scratch(0.22, 2500, 9000, 0.5), 0.5)
    stick = knock(380, 0.3, partials=((1, 1), (2.1, .6), (3.4, .3), (5.2, .12)), noise=0.35)
    write("stick_place", stick, 0.55)
    pre = scratch(0.18, 300, 1500, 0.3) * 0.25
    th = knock(170, 0.45, partials=((1, 1), (1.9, .55), (3.1, .3), (4.4, .1)), noise=0.25)
    write("settle", np.concatenate([pre, th]), 0.8)
    hv = knock(110, 0.7, partials=((1, 1), (1.7, .6), (2.9, .35), (4.2, .15)), noise=0.2)
    write("settle_heavy", np.concatenate([scratch(0.25, 200, 1200, 0.3) * 0.3, hv]), 0.85)
    slide = scratch(0.5, 250, 2500, 0.5) * np.linspace(0.4, 1, int(0.5 * SR))
    write("slide_home", np.concatenate([slide * 0.5, knock(240, 0.3, noise=0.3)]), 0.7)
    # tape measure: blade out = ratchet clicks over a metallic rattle; snap = fast whirr then a hard click
    d = 0.6
    n = int(d * SR)
    clicks = np.zeros(n)
    for k in np.cumsum(rng.uniform(0.018, 0.03, 40)):
        if k < d - 0.01:
            i = int(k * SR)
            clicks[i:i + 200] += bp(rng.standard_normal(200), 3000, 9000) * np.exp(-np.arange(200) / 40)
    rattle = bp(rng.standard_normal(n), 2000, 6000) * 0.08
    write("tape_out", clicks + rattle, 0.5)
    d = 0.35
    n = int(d * SR)
    whirr = bp(rng.standard_normal(n), 1500, 5000) * np.linspace(0.3, 1, n) * (1 + 0.5 * np.sin(2 * np.pi * 70 * t(d)))
    snap = knock(1800, 0.12, partials=((1, 1), (2.7, .6), (5.1, .4)), noise=0.8)
    write("tape_snap", np.concatenate([whirr * 0.4, snap]), 0.6)
    # ink line snap (sumitsubo): a taut cord released onto wood -- low thwack plus brief cord buzz
    d = 0.35
    n = int(d * SR)
    thw = lp(rng.standard_normal(n), 900) * env(n, 0.0005, 0.06, 6)
    buzz = np.sin(2 * np.pi * 95 * t(d)) * env(n, 0.001, 0.12, 6) * 0.5
    write("line_snap", thw + buzz + 0.3 * knock(400, d, noise=0.2), 0.7)

    # --- later episodes (built now so the library is complete) ---
    # pull-stroke saw: five strokes; cutting on the pull (louder, toothy), quiet return
    out = []
    for _ in range(5):
        dd = 0.55
        nn = int(dd * SR)
        teeth = 1 + 0.6 * np.sign(np.sin(2 * np.pi * 180 * t(dd)))
        pull = bp(rng.standard_normal(nn), 2500, 9000) * teeth * np.sin(np.linspace(0, np.pi, nn)) ** 0.7
        ret = bp(rng.standard_normal(int(0.4 * SR)), 3000, 8000) * 0.15 * np.sin(np.linspace(0, np.pi, int(0.4 * SR)))
        out += [pull, ret]
    write("saw_pull", np.concatenate(out), 0.6)
    # gennō on nomi: steel-on-steel strike (bright partials) + wood body
    d = 0.6
    hit = sum(a * np.sin(2 * np.pi * f * t(d)) * np.exp(-t(d) * k) for f, a, k in ((2210, 1, 14), (3570, .6, 18), (5230, .4, 25), (790, .3, 10)))
    write("genno_nomi", hit * env(int(d * SR), 0.0003, d, 2) + 0.6 * knock(300, d, noise=0.5), 0.8)
    # kanna shaving: long rasp whose band rises as the shaving curls
    d = 1.4
    n = int(d * SR)
    x = rng.standard_normal(n)
    sos = [signal.butter(2, [f / (SR / 2), (f * 2.5) / (SR / 2)], "band", output="sos") for f in np.linspace(1200, 3500, 8)]
    seg = n // 8
    y = np.concatenate([signal.sosfilt(s_, x[i * seg:(i + 1) * seg]) for i, s_ in enumerate(sos)])
    write("kanna_shaving", y * np.sin(np.linspace(0, np.pi, len(y))) ** 0.5, 0.5)
    # joint sliding home: friction then a solid seat
    write("joint_home", np.concatenate([scratch(0.7, 300, 2000, 0.6) * np.linspace(0.3, 1, int(0.7 * SR)) * 0.5, knock(200, 0.4, noise=0.3)]), 0.8)
    print("sfx written:", sorted(p.stem for p in OUT.glob("*.wav")))


if __name__ == "__main__":
    main()
