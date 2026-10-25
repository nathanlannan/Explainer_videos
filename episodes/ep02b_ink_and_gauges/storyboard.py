"""Episode 2 · Part 2 storyboard -> build/timeline.json (shared timeline engine)."""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "render"))
from timeline import q, run, shot  # noqa: E402


@shot("S01", "One snap", "threeQ", "A 3 m timber; the ink line is taut along it, lifted and released; a straight line appears.")
def _(s):
    s.pause(0.6)
    s.line("N01", {"line": "line", "snap": "snap"}, gap=0.3)
    s.ev["lift"] = q(s.now - 0.2)
    s.ev["release"] = q(s.now + 0.6)
    s.sfx.append((q(s.ev["release"] + 0.08), "line_snap"))
    s.pause(1.6)
    s.line("N02", gap=0.0)
    s.pause(1.2)


@shot("S02", "Title card", "card", "Series title card: Episode 2 · Part 2 · Ink Line, Pen and Gauges.")
def _(s):
    s.pause(3.6)


@shot("S03", "The ink pot", "threeQ", "The sumitsubo model turning slowly; labels ike, reel, line, karuko as named.")
def _(s):
    s.chapters.append((0.0, "The ink line: sumitsubo"))
    s.pause(0.3)
    s.line("N03", {"term": "sumitsubo", "ike": "ike", "reel": "reel", "pin": "karuko", "wood": "traditional"}, gap=0.3)
    s.hold(3.5, "Study: the ink pot's parts")


@shot("S04", "Snapping a line", "threeQ", "Pin pushed into one end; line drawn out through the pond, taut; lifted straight up and released; a straight line on the timber.")
def _(s):
    s.pause(0.3)
    s.line("N04", {"pin": "push", "draw": "draw", "taut": "taut"}, gap=0.3, sfx={"pin": "pencil"})
    s.line("N05", {"lift": "lift", "go": "go", "uneven": "uneven"}, gap=0.5)
    s.sfx.append((q(s.ev["go"] + 0.15), "line_snap"))


@shot("S05", "Chalk vs ink; pot sizes", "2d", "A chalk line beside an ink line; 'chalk wipes off easily'. Three pot outlines to scale: about 180, 240, 300 mm.")
def _(s):
    s.pause(0.3)
    s.line("N06", {"chalk": "chalk", "wipes": "wipes", "sizes": "pots", "temple": "temple"}, gap=0.5)


@shot("S06", "The ink pen", "threeQ", "The sumisashi: flattened bamboo; slanted split end draws a line; rounded crushed end writes a note.")
def _(s):
    s.chapters.append((0.0, "The ink pen: sumisashi"))
    s.pause(0.3)
    s.line("N07", {"term": "sumisashi", "slant": "slant", "line": "draws"}, gap=0.3, sfx={"line": "mark_long"})
    s.line("N08", {"other": "other", "write": "writing", "ep1": "notes"}, gap=0.5, sfx={"write": "mark"})


@shot("S07", "Squaring with the sashigane", "threeQ", "One arm hooked against the board's edge, held near its middle; the other arm across the face; the line drawn along it. Then: laid on top ✕; and the two arm choices.")
def _(s):
    s.chapters.append((0.0, "Squaring a line with the sashigane"))
    s.pause(0.3)
    s.line("N09", gap=0.3)
    s.line("N10", {"hook": "hooks", "press": "presses", "fingers": "fingers", "draw": "draw"}, gap=0.4, sfx={"draw": "mark_long"})
    s.sfx.append((q(s.ev["hook"] + 0.4), "steel_set"))
    s.line("N11", {"wrong": "simply", "ref": "reference", "both": "both"}, gap=0.4)
    s.hold(4.0, "Study: squaring with the sashigane")


@shot("S08", "The marking gauge", "threeQ", "A kebiki slides along the board's edge, its blade scoring a parallel line; labels fence, beam, blade.")
def _(s):
    s.chapters.append((0.0, "Gauges and the knife"))
    s.pause(0.3)
    s.line("N12", {"term": "kebby", "fence": "fence", "blade": "blade", "set": "set"}, gap=0.4, sfx={"blade": "pencil"})


@shot("S09", "Pin vs blade", "2d", "Magnified fibers across the grain: a pin tears them; a blade slices them.")
def _(s):
    s.pause(0.3)
    s.line("N13", {"cutting": "cutting", "pin": "pin", "slice": "slices"}, gap=0.4)
    s.hold(3.0, "Study: pin vs. blade")


@shot("S10", "Kinds of kebiki", "2d", "Names only: sujikebiki 筋罫引 (scores lines), warikebiki 割罫引 (cuts thin boards to width).")
def _(s):
    s.pause(0.3)
    s.line("N14", {"suji": "tsuji", "wari": "wadi"}, gap=0.5)


@shot("S11", "The marking knife", "threeQ", "A marking knife (flat back, one bevel) cuts a fine line across a board along the square.")
def _(s):
    s.pause(0.3)
    s.line("N15", {"term": "shiragaki", "flat": "flat"}, gap=0.3, sfx={"flat": "pencil"})
    s.line("N16", {"cut": "fine", "later": "when"}, gap=0.5)


@shot("S12", "Next time", "2d", "Teaser: Episode 3 · From Plan to Timber.")
def _(s):
    s.pause(0.3)
    s.line("N17", {"plan": "board"}, gap=0.6)


@shot("S13", "Recap and glossary", "2d", "One sentence + glossary; held still for study.")
def _(s):
    s.chapters.append((0.0, "Recap and glossary"))
    s.pause(0.4)
    s.line("N18", gap=0.5)
    s.hold(8.5, "Glossary")


@shot("S14", "End card", "card", "Series end card: next episode.")
def _(s):
    s.pause(3.2)


if __name__ == "__main__":
    run(HERE)
