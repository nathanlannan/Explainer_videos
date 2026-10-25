"""Episode 2 · Part 1 storyboard -> build/timeline.json (uses the shared timeline engine)."""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "render"))
from timeline import q, run, shot  # noqa: E402


# ---------------- 1. Cold open ----------------
@shot("S01", "The log question", "front", "A log, small end toward us; 300 mm diameter shown. A sashigane flips over and lies across the end; the reading is withheld.")
def _(s):
    s.at("log", 0.2)
    s.pause(0.8)
    s.line("N01", {"dia": "across", "q": "biggest"}, gap=0.4)
    s.line("N02", {"turn": "turn"}, gap=0.0)
    s.ev["lay"] = q(s.ev["turn"] + 1.1)
    s.sfx.append((q(s.ev["turn"] + 0.5), "steel_set"))
    s.sfx.append((q(s.ev["lay"] + 0.6), "steel_set"))
    s.pause(2.0)


@shot("S02", "Title card", "card", "Series title card: Episode 2 · Part 1 · The Sashigane.")
def _(s):
    s.pause(4.0)


# ---------------- 2. Meet the sashigane ----------------
@shot("S03", "Meet the sashigane", "threeQ", "The sashigane on paper, slow turn; labels sashigane 差金, nagate 長手, tsumate 妻手; 500 / 250 mm dimensions.")
def _(s):
    s.chapters.append((0.0, "Meet the sashigane"))
    s.pause(0.4)
    s.line("N03", {"term": "sashigane", "steel": "steel", "ruler": "ruler"}, gap=0.4)
    s.line("N04", {"nagate": "nagate", "tsumate": "tsumate", "fifty": "50", "twentyfive": "25"}, gap=0.6)


@shot("S04", "Beside the framing square", "2d", "Top view, to scale: sashigane beside a 24 x 16 in framing square; section inset 15 x 1.4 mm.")
def _(s):
    s.pause(0.3)
    s.line("N05", {"framing": "framing", "dims": "24", "both": "both", "wide": "15", "thick": "thick"}, gap=0.5)
    s.hold(1.5)


@shot("S05", "A springy blade", "threeQ", "Close: the long arm flexes and springs back; pressed flat on a board where the line goes.")
def _(s):
    s.pause(0.3)
    s.line("N06", {"flex": "flexes", "springs": "springs", "press": "press"}, gap=0.5)


@shot("S06", "Used as a square", "2d", "Top view: a line squared across a board (right-angle mark); how to hold the square is deferred to Part 2.")
def _(s):
    s.pause(0.3)
    s.line("N07", {"draw": "carried", "next": "next"}, gap=0.6, sfx={"draw": "mark_long"})


# ---------------- 3. The two scales ----------------
@shot("S07", "Front scale", "top", "Close on the front scale: millimeter ticks and numbers; label omote-me 表目.")
def _(s):
    s.chapters.append((0.0, "Front and back scales"))
    s.pause(0.3)
    s.line("N08", {"term": "omote", "mm": "millimeters", "shaku": "shaku"}, gap=0.5)


@shot("S08", "Back scale", "2d", "The square flips; the back scale ura-me 裏目; front and back scales compared side by side: 10 back units = 14.14 mm.")
def _(s):
    s.pause(0.2)
    s.line("N09", {"turn": "turn", "term": ("scale", 0.5), "wider": "wider", "root": "root"}, gap=0.5)
    s.sfx.append((q(s.ev["turn"] + 0.4), "steel_set"))
    s.hold(3.5, "Study: front scale vs. back scale")


@shot("S09", "Why root two", "2d", "A 100 mm square, its diagonal 141.4 mm; s² + s² = d²; the back scale laid along the diagonal reads 100.")
def _(s):
    s.pause(0.3)
    s.line("N10", {"square": ("square", 0.0), "diag": "diagonal", "root": "root"}, gap=0.4)
    s.line("N11", {"back": "backscale", "side": "side", "ex": "100", "d141": "141", "reads": "reads"}, gap=0.5)
    s.hold(4.0, "Study: why the back scale is ×√2")


# ---------------- 4. The log ----------------
@shot("S10", "Log to largest beam", "front", "Log end, 300 mm: inscribed square, corners on the circle; diagonal = diameter; back scale across reads 212; square inked.")
def _(s):
    s.chapters.append((0.0, "The log: largest square beam"))
    s.pause(0.3)
    s.line("N12", {"corners": "corners", "diag": "diagonal"}, gap=0.4)
    s.line("N13", {"lay": "lay", "read": "read", "n212": "212", "side": "side"}, gap=0.4)
    s.sfx.append((q(s.ev["lay"] + 0.6), "steel_set"))
    s.ev["ink"] = q(s.ev["side"] + 0.3)
    s.sfx.append((q(s.ev["ink"]), "mark_long"))
    s.line("N14", {"built": "built"}, gap=0.4)
    s.hold(4.5, "Study: log diameter → largest beam")


@shot("S11", "Kikujutsu", "2d", "A ghosted hip-roof plan, hips on diagonals; label kikujutsu 規矩術 (named only).")
def _(s):
    s.pause(0.3)
    s.line("N15", {"roofs": "roofs", "hips": "hips", "term": "own"}, gap=0.5)


@shot("S12", "The marume", "2d", "Circle 300 mm; marume 丸目 scale across the diameter reads 942 = the circumference.")
def _(s):
    s.pause(0.3)
    s.line("N16", {"term": "marume", "pi": "pi", "dia": "diameter", "circ": "circumference"}, gap=0.5)
    s.hold(1.5)


# ---------------- 5. Same idea, other tradition ----------------
@shot("S13", "The framing square's tables", "2d", "Framing square outline with its stamped tables called out: rafter table, board measure.")
def _(s):
    s.chapters.append((0.0, "Same idea, two traditions"))
    s.pause(0.3)
    s.line("N17", {"tables": "rafter", "idea": "two"}, gap=0.6)


@shot("S14", "Next time", "2d", "Teaser text: Part 2 — ink line, bamboo pen, gauges (names only).")
def _(s):
    s.pause(0.3)
    s.line("N18", {"ink": "ink", "gauges": "gauges"}, gap=0.5)


# ---------------- 6. Recap ----------------
@shot("S15", "Recap and glossary", "2d", "One sentence + glossary of this episode's terms; held still for study.")
def _(s):
    s.chapters.append((0.0, "Recap and glossary"))
    s.pause(0.4)
    s.line("N19", gap=0.5)
    s.hold(8.5, "Glossary")


@shot("S16", "End card", "card", "Series end card: next episode.")
def _(s):
    s.pause(3.2)


if __name__ == "__main__":
    run(HERE)
