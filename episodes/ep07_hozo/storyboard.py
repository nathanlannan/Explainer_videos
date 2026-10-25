"""Episode 7 storyboard -> build/timeline.json (shared timeline engine)."""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "render"))
from timeline import q, run, shot  # noqa: E402


@shot("S01", "Post onto sill", "threeQ", "A post lowers onto a sill; the tenon enters; a square pin is driven across.")
def _(s):
    s.pause(0.8)
    s.line("N01", {"comes": "comes", "pin": "pin"}, gap=0.4)
    s.sfx.append((q(s.ev["comes"] + 2.0), "joint_home"))
    s.line("N02", {"term": "japanese"}, gap=0.4)
    s.pause(1.0)


@shot("S02", "Title card", "card", "Series title card: Episode 7 · Mortise and Tenon.")
def _(s):
    s.pause(3.8)


@shot("S03", "Hozo and hozo-ana", "2d", "Tenon and mortise labelled; older reading; a stepped tenon at a post top (schematic).")
def _(s):
    s.chapters.append((0.0, "Hozo and hozo-ana"))
    s.pause(0.3)
    s.line("N03", {"tenon": "tenon", "ana": "mortise", "hoso": "older"}, gap=0.4)
    s.line("N04", {"kinds": "kinds", "stepped": "stepped", "sill": "sill"}, gap=0.4)
    s.hold(2.5)


@shot("S04", "Two families", "threeQ", "Short tenon + hardware beside long tenon + komisen, same member size, no dimensions; ōgi-hozo inset.")
def _(s):
    s.chapters.append((0.0, "Post to sill: the options"))
    s.pause(0.3)
    s.line("N05", {"spec": "specification", "short": "short", "long": "long"}, gap=0.4)
    s.line("N06", {"corner": "corner", "fan": "fan"}, gap=0.4)
    s.hold(3.0, "Study: two families")


@shot("S05", "The short tenon", "threeQ", "Cutaway: 105 mm post and sill, tenon 30 × 85 × 50 (howtec test standard); bearing-wall rating card (neutral).")
def _(s):
    s.chapters.append((0.0, "The short tenon"))
    s.pause(0.3)
    s.line("N07", {"big": "big", "dims": "30"}, gap=0.4)
    s.line("N08", {"rating": "rating", "needs": "needs"}, gap=0.4)
    s.hold(3.5, "Study: the short tenon")


@shot("S06", "The long tenon and its pin", "threeQ", "Cutaway on 120 mm members (Toda 2015): long tenon, square pin; hanasen schematic; offset-hole inset (exaggerated).")
def _(s):
    s.chapters.append((0.0, "The long tenon and the komisen"))
    s.pause(0.3)
    s.line("N09", {"deep": "deep", "pin": "pin", "hana": "projecting"}, gap=0.4)
    s.line("N10", {"holes": "holes", "closer": "closer", "pulls": "pulls"}, gap=0.4)
    s.line("N11", {"square": "square", "class": "class"}, gap=0.4)
    s.hold(3.5, "Study: the pin that pulls")


@shot("S07", "Cutting the tenon", "threeQ", "Rip the cheeks, crosscut the shoulder (kerf on the waste side); ✕ inset: a crosscut sawn too deep.")
def _(s):
    s.chapters.append((0.0, "Cutting the tenon"))
    s.pause(0.3)
    s.line("N12", {"rip": "rip", "cross": "crosscut", "deep": "deep"}, gap=0.4)
    s.line("N13", {"loose": "loose"}, gap=0.4)


@shot("S08", "Chopping the mortise", "threeQ", "Mortise chisel narrower than the hole; start inside the lines; rough out; pare to the lines; check depth.")
def _(s):
    s.chapters.append((0.0, "Chopping the mortise"))
    s.pause(0.3)
    s.line("N14", {"chisel": "chisel", "inside": "inside", "pare": "pair", "depth": "depth"}, gap=0.4)
    s.line("N15", {"light": "lightly", "harder": "harder"}, gap=0.4)
    s.hold(2.5)


@shot("S09", "Fit", "threeQ", "The tenon tapped in over a block; snug, driven in and seated.")
def _(s):
    s.chapters.append((0.0, "Fit"))
    s.pause(0.3)
    s.line("N16", {"steps": "steps", "taps": "taps", "snug": "snug"}, gap=0.4)
    s.sfx.append((q(s.ev["taps"] + 0.3), "genno_nomi"))
    s.hold(2.0)


@shot("S10", "Next time", "2d", "Teaser: Episode 8 · where one beam crosses over another.")
def _(s):
    s.pause(0.3)
    s.line("N17", {"cross": "crosses"}, gap=0.6)


@shot("S11", "Recap and glossary", "2d", "One sentence + glossary; held still for study.")
def _(s):
    s.chapters.append((0.0, "Recap and glossary"))
    s.pause(0.4)
    s.line("N18", gap=0.5)
    s.hold(9.0, "Glossary")


@shot("S12", "A note on sharp tools", "2d", "Quiet closing card: learn sharp-tool technique from a teacher.")
def _(s):
    s.pause(0.4)
    s.line("N19", gap=1.2)


@shot("S13", "End card", "card", "Series end card: next episode.")
def _(s):
    s.pause(3.2)


if __name__ == "__main__":
    run(HERE)
