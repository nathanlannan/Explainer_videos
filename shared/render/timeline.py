"""Shared timeline engine: shots as beats on narration timing -> timeline.json.

An episode's storyboard.py imports this, registers shots with @shot, then calls run(HERE).
Events land on spoken words (word timestamps from synth.py's QA) so picture and SFX share times.
"""
import json
import pathlib
import re

FPS = 30
QA, TEXT, HERE = {}, {}, None


def load(here):
    global QA, TEXT, HERE
    HERE = pathlib.Path(here)
    QA.update(json.loads((HERE / "build" / "narration_qa.json").read_text()))
    TEXT.update({l["id"]: l["text"] for l in json.loads((HERE / "narration.json").read_text())["lines"]})


def q(t):  # quantise to frame
    return round(t * FPS) / FPS


class Shot:
    def __init__(self, sid, title, preset, start, onscreen):
        self.id, self.title, self.preset, self.start, self.onscreen = sid, title, preset, start, onscreen
        self.now = 0.0
        self.lines, self.ev, self.holds, self.sfx, self.chapters = {}, {}, [], [], []

    def pause(self, s):
        self.now += s
        return self

    def at(self, name, dt=0.0, sfx=None):
        self.ev[name] = q(self.now + dt)
        if sfx:
            self.sfx.append((self.ev[name], sfx))
        return self.ev[name]

    def line(self, lid, words=None, gap=0.35, sfx=None):
        """Place narration line at cursor; words = {event: word or (word, dt)} matched in order."""
        d = QA[lid]
        st = q(self.now)
        ws = [(re.sub(r"[^\w\-ōū']", "", w.lower()), s + st, e + st) for w, s, e in d["words"]]
        self.lines[lid] = {"start": st, "end": q(st + d["duration"]), "words": ws}
        k = 0
        for name, spec in (words or {}).items():
            w, dt = spec if isinstance(spec, tuple) else (spec, 0.0)
            while k < len(ws) and not ws[k][0].startswith(w):
                k += 1
            if k == len(ws):
                raise KeyError(f"{lid}: word {w!r} for event {name!r} not found in {[x[0] for x in ws]}")
            self.ev[name] = q(ws[k][1] + dt)
            if sfx and name in sfx:
                self.sfx.append((self.ev[name], sfx[name]))
        self.now = st + d["duration"] + gap
        return self

    def hold(self, s, chapter=None):
        self.holds.append([q(self.now), q(self.now + s)])
        if chapter:
            self.chapters.append((q(self.now), chapter))
        self.now += s
        return self


SHOTS = []


def shot(sid, title, preset, onscreen):
    def deco(fn):
        SHOTS.append((sid, title, preset, onscreen, fn))
        return fn
    return deco


def build():
    t, out, chapters, narr, sfx = 0.0, [], [], [], []
    for sid, title, preset, onscreen, fn in SHOTS:
        s = Shot(sid, title, preset, t, onscreen)
        fn(s)
        dur = q(s.now)
        out.append({"id": sid, "title": title, "preset": preset, "onscreen": onscreen, "start": q(t), "end": q(t + dur),
                    "lines": s.lines, "ev": s.ev, "holds": s.holds})
        for ct, title_c in s.chapters:
            chapters.append({"t": q(t + ct), "title": title_c})
        for lid, ln in s.lines.items():
            narr.append({"id": lid, "start": q(t + ln["start"]), "end": q(t + ln["end"]), "text": TEXT[lid]})
        for et, name in s.sfx:
            sfx.append({"t": q(t + et), "sfx": name, "shot": sid})
        t += dur
    chapters.insert(0, {"t": 0.0, "title": "Cold open"})
    tl = {"fps": FPS, "total": q(t), "shots": out, "chapters": chapters, "narration": narr, "sfx": sorted(sfx, key=lambda x: x["t"])}
    (HERE / "build" / "timeline.json").write_text(json.dumps(tl, indent=1, ensure_ascii=False))
    return tl




def run(here):
    load(here)
    tl = build()
    fmt = lambda x: f"{int(x // 60)}:{x % 60:05.2f}"
    for s in tl["shots"]:
        print(f"{s['id']} {fmt(s['start'])}-{fmt(s['end'])} ({s['end'] - s['start']:5.1f}s) {s['preset']:7} {s['title']}")
    print("total", fmt(tl["total"]), "| chapters:", [(fmt(c["t"]), c["title"]) for c in tl["chapters"]])
    return tl
