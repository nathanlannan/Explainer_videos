"""Episode 1 storyboard -> build/timeline.json (the timing source for picture AND sound).

Narration clip lengths (measured, build/narration_qa.json) drive everything: each shot is
written as a sequence of beats on a cursor. Events (a post seating, a mark being drawn) are
placed either at the cursor or at the start time of a spoken word, so the action lands when
it is named. The renderer (shots.js) animates from these event times and the mixer (mix.py)
places SFX at exactly the same times, quantised to frames.

  python3 storyboard.py   -> build/timeline.json, prints the shot table
"""
import json
import pathlib
import re

HERE = pathlib.Path(__file__).resolve().parent
FPS = 30
QA = json.loads((HERE / "build" / "narration_qa.json").read_text())
TEXT = {l["id"]: l["text"] for l in json.loads((HERE / "narration.json").read_text())["lines"]}


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


# ---------------- 1. Cold open ----------------
@shot("S01", "Frame assembles", "threeQ", "Sill set down; four posts lower into housings; rails slide in; beam settles. No tape anywhere.")
def _(s):
    s.at("sill", 0.4, "settle_heavy")
    s.pause(0.9)
    s.line("N01", {"posts": "posts", "rails": "rail", "beam": "beam"}, gap=0.0)
    for i in range(4):
        s.ev[f"post{i}"] = q(s.ev["posts"] + 0.05 + i * 0.42)
        s.sfx.append((q(s.ev[f"post{i}"] + 0.6), "settle"))
    for i in range(3):
        s.ev[f"rail{i}"] = q(s.ev["rails"] + 0.1 + i * 0.4)
        s.sfx.append((q(s.ev[f"rail{i}"] + 0.6), "slide_home"))
    s.sfx.append((q(s.ev["beam"] + 0.8), "settle_heavy"))
    s.pause(1.0)


@shot("S02", "Title card", "card", "Series title card: 'Episode 1 · Measure Once: The Story Stick'.")
def _(s):
    s.pause(3.6)


@shot("S03", "The question", "threeQ", "Assembled frame, slow orbit; on-screen question.")
def _(s):
    s.pause(0.4).line("N02", gap=0.0).pause(0.6)


# ---------------- 2. Two ways to put a mark on wood ----------------
@shot("S04", "Two workflows", "2d", "Split screen. Left: tape hooks, reads, marks each piece in turn. Right: one stick, marks copied to all pieces.")
def _(s):
    s.chapters.append((0.0, "Two ways to put a mark on wood"))
    s.pause(0.6)
    s.line("N03", {"hook": "hook", "read": "read", "mark": "make", "next1": "next", "next2": ("next", 0.0)}, gap=0.5,
           sfx={"hook": "tape_out", "mark": "pencil", "next1": "tape_snap"})
    s.line("N04", {"once": "once", "copy": "copied", "every": "every"}, gap=0.3)
    for p in range(4):
        s.sfx.append((q(s.ev["copy"] + 0.25 + p * 0.35), "mark"))
    s.hold(0.9)


@shot("S05", "Sumitsuke", "front", "Close on a post face: an ink line drawn across. Label: sumitsuke 墨付け / layout marking.")
def _(s):
    s.pause(0.5)
    s.line("N05", {"term": "called", "draw": "drawing"}, gap=0.3, sfx={"draw": "mark"})
    s.hold(1.3)


# ---------------- 3. Reference first ----------------
@shot("S06", "Timber varies", "2d", "End-grain sections: 105 vs 99 mm; out of square (exaggerated); shrinkage as it dries.")
def _(s):
    s.chapters.append((0.0, "Reference first: the center line"))
    s.pause(0.4)
    s.line("N06", {"sizes": "real", "thinner": "thinner", "square": "square", "moves": "moves"}, gap=0.5)


@shot("S07", "Edge vs center line", "2d", "Plan view, four posts of differing size. Top: laid out from the front edge, joint marks miss the shared line (✕). Bottom: from the center line, marks on the line (✓).")
def _(s):
    s.pause(0.4)
    s.line("N07", {"edge": "face", "piles": "lands", "off": "middle"}, gap=0.4)
    s.line("N08", {"plan": "plan", "center": "middle", "term": "shinzumi", "strike": "struck"}, gap=0.4, sfx={"strike": "line_snap"})
    s.line("N09", {"line": "line", "splits": "splits", "inline": ("half", 0.8)}, gap=0.5)
    s.hold(4.0, "Study: face vs. center line")


@shot("S08", "Series center-line symbol", "threeQ", "Post close-up: the center line drawn along the face in the series dash-dot style; label.")
def _(s):
    s.pause(0.3)
    s.line("N10", {"draw": ("this", 0.0), "symbol": "always"}, gap=0.3, sfx={"draw": "mark_long"})
    s.hold(1.0)


# ---------------- 4. The story stick ----------------
@shot("S09", "A plain batten", "threeQ", "Post lying on supports; a plain batten slides in beside it, ends flush: same length.")
def _(s):
    s.chapters.append((0.0, "The story stick"))
    s.pause(0.5)
    s.line("N11", {"stick": "stick", "flush": "length"}, gap=0.6, sfx={"flush": "stick_place"})


@shot("S10", "Marking the stick", "top", "Camera tracks along the stick; at each named position the square and pen draw a line and write a short note.")
def _(s):
    s.pause(0.3)
    names = [("m0", "bottom"), ("m1", "sill"), ("m2", "bottom"), ("m3", "top"), ("m4", "underside"), ("m5", "top"), ("notes", "note")]
    s.line("N12", dict(names), gap=0.6)
    for k in range(6):
        s.sfx.append((q(s.ev[f"m{k}"] + 0.35), "mark"))
    s.at("pull")
    s.line("N13", gap=0.4)
    s.hold(3.6, "Study: the marked story stick")


@shot("S11", "Transfer to four posts", "threeQ", "Stick set against each post in turn, ends flush; each line carried across. Repeated rhythm x4.")
def _(s):
    s.pause(0.4)
    s.line("N14", {"place0": "against", "carry0": "carried"}, gap=0.0)
    lines = [None, "N15", "N16", "N17"]
    rhythm = 0.38

    # post 1 is slow (the camera follows the tool mark to mark); posts 2-4 settle into a quicker rhythm
    gaps1 = [0.0, 0.55, 1.15, 0.55, 1.25, 0.55]

    def transfer(p, t_place, t_marks):
        s.ev[f"place{p}"] = q(t_place)
        s.sfx.append((q(t_place + 0.55), "stick_place"))
        tk = t_marks
        for k in range(6):
            tk += gaps1[k] if p == 0 else (rhythm if k else 0.0)
            s.ev[f"mk{p}_{k}"] = q(tk)
            s.sfx.append((q(tk + 0.18), "mark"))
        s.ev[f"lift{p}"] = q(tk + rhythm + 0.2)
        return s.ev[f"lift{p}"] + 0.6
    end = transfer(0, s.ev["place0"] - 0.3, s.ev["carry0"])
    s.now = max(s.now, end) + 0.5
    for p in (1, 2, 3):
        st = s.now
        s.line(lines[p], gap=0.0)
        end = transfer(p, st, max(st + 0.85, s.now - 0.9))
        s.now = max(s.now, end) + 0.15
    s.hold(4.0, "Study: four posts, identical marks")


@shot("S12", "Tape drift vs stick", "2d", "Four posts, marks from chained tape readings, drift drawn x20 (labelled). Then four story-stick posts: zero spread.")
def _(s):
    s.pause(0.4)
    s.line("N18", {"tape": "tape", "err": "off", "x20": "drawn", "adds": "errors", "every": "every"}, gap=0.5,
           sfx={"tape": "tape_out"})
    s.line("N19", {"stick": "story", "none": "no"}, gap=0.4)
    s.hold(4.5, "Study: tape drift vs. story stick")


@shot("S13", "Identical, not accurate", "2d", "If the stick is 1 mm off, all four posts shift together. Key line in type.")
def _(s):
    s.pause(0.3)
    s.line("N20", {"off": "if", "together": "together", "acc": "accurate", "ident": "identical", "joint": "joint"}, gap=0.4)
    s.hold(2.5)


@shot("S14", "Bakabō", "threeQ", "Close on the marked stick; label bakabō 馬鹿棒 / 'fool's stick' (usual explanation, softened).")
def _(s):
    s.pause(0.3)
    s.line("N21", {"term": ("called", 0.5), "lit": "literally", "expl": "usual"}, gap=0.3)
    s.hold(1.5)


# ---------------- 5. Looking ahead ----------------
@shot("S15", "More than one stick", "threeQ", "Pull back to the frame: the height stick beside a post; ghosted length sticks along sill and beam.")
def _(s):
    s.chapters.append((0.0, "Looking ahead"))
    s.pause(0.4)
    s.line("N22", {"heights": "heights", "lengths": "lengths"}, gap=0.6)


@shot("S16", "Ita-zu teaser", "2d", "A board with the small frame's plan drawn in ink, pieces named. Teasers for Episodes 2 and 3.")
def _(s):
    s.pause(0.3)
    s.line("N23", {"board": "board", "term": "itazu", "ep3": "that"}, gap=0.6)
    s.pause(0.3)


# ---------------- 6. Recap ----------------
@shot("S17", "Recap and glossary", "2d", "One sentence + glossary of this episode's terms; held still for study.")
def _(s):
    s.chapters.append((0.0, "Recap and glossary"))
    s.pause(0.5)
    s.line("N24", gap=0.5)
    s.hold(8.5, "Glossary")


@shot("S18", "End card", "card", "Series end card: next episode.")
def _(s):
    s.pause(3.2)


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


if __name__ == "__main__":
    tl = build()
    fmt = lambda x: f"{int(x // 60)}:{x % 60:05.2f}"
    for s in tl["shots"]:
        print(f"{s['id']} {fmt(s['start'])}-{fmt(s['end'])} ({s['end'] - s['start']:5.1f}s) {s['preset']:7} {s['title']}")
    print("total", fmt(tl["total"]), "| chapters:", [(fmt(c["t"]), c["title"]) for c in tl["chapters"]])
