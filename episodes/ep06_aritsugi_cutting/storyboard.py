"""Episode 6 storyboard -> build/timeline.json (shared timeline engine)."""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "render"))
from timeline import q, run, shot  # noqa: E402


@shot("S01", "It drops in", "threeQ", "The finished male drops into the finished female and seats.")
def _(s):
    s.pause(0.8)
    s.line("N01", {"marks": "marks", "drops": "drops"}, gap=0.4)
    s.sfx.append((q(s.ev["drops"] + 1.6), "joint_home"))
    s.line("N02", {"seq": "sequence"}, gap=0.4)
    s.pause(1.0)


@shot("S02", "Title card", "card", "Series title card: Episode 6 · Marking Out and Cutting.")
def _(s):
    s.pause(3.8)


@shot("S03", "Which piece", "threeQ", "Two blanks: the male (upper piece, anchor bolt beside the joint) and the female.")
def _(s):
    s.chapters.append((0.0, "Before marking"))
    s.pause(0.3)
    s.line("N03", {"male": "male", "bolt": "bolt", "mark": "mark"}, gap=0.4)


@shot("S04", "Center lines", "threeQ", "Center lines on the top faces of both blanks (Episode 1 callback).")
def _(s):
    s.pause(0.3)
    s.line("N04", {"center": "center", "laid": "laid"}, gap=0.4, sfx={"center": "mark_long"})
    s.hold(1.5)


@shot("S05", "Marking the female", "threeQ", "Top face of the female's end: end line, seat lines, dovetail lines from the center line, sides angled with the blade's width; seat lines down the sides.")
def _(s):
    s.chapters.append((0.0, "Marking out"))
    s.pause(0.3)
    s.line("N05", {"end": "end", "seat": "seat", "dove": "dovetail"}, gap=0.4, sfx={"end": "mark", "seat": "mark", "dove": "mark_long"})
    s.line("N06", {"blade": "blade", "sides": "faces"}, gap=0.4, sfx={"sides": "mark"})
    s.hold(3.5, "Study: the female's lines")


@shot("S06", "Marking the male", "threeQ", "The male's end line, dovetail tip and cut lines.")
def _(s):
    s.pause(0.3)
    s.line("N07", {"end": "end", "tip": "tip", "cut": "cut"}, gap=0.4, sfx={"end": "mark", "cut": "mark"})
    s.hold(2.5)


@shot("S07", "Cutting the female", "threeQ", "Seat ripped and crosscut (splitting the line); dovetail sides ripped (stopping at the line); socket chopped to the seat; the tip dug deeper.")
def _(s):
    s.chapters.append((0.0, "Cutting the female"))
    s.pause(0.3)
    s.line("N08", {"rip": "rip", "cross": "crosscut", "away": "away"}, gap=0.4)
    s.line("N09", {"sides": "sides", "past": "past"}, gap=0.4)
    s.line("N10", {"chop": "chop", "back": "back", "down": "down"}, gap=0.4)
    s.line("N11", {"dig": "dig", "gap": "gap"}, gap=0.4)
    s.hold(3.0, "Study: the female, cut")


@shot("S08", "Cutting the male", "threeQ", "End cut, lines on the end grain; rip to the shoulder, lower half away; cheeks tapered (exaggerated inset); shoulders crosscut; corners chiselled; chamfer.")
def _(s):
    s.chapters.append((0.0, "Cutting the male"))
    s.pause(0.3)
    s.line("N12", {"first": "first", "grain": "grain", "rip": "rip", "away": "away"}, gap=0.4)
    s.line("N13", {"cheeks": "cheeks", "top": "top", "bottom": "bottom", "narrower": "narrower"}, gap=0.4)
    s.line("N14", {"shoulders": "shoulders", "corners": "corners", "chamfer": "chamfer"}, gap=0.4)
    s.hold(3.0, "Study: the male, cut")


@shot("S09", "Test fit", "threeQ", "The male drops in and tightens; kigoroshi inset; the deepened tip pocket called out (neutral).")
def _(s):
    s.chapters.append((0.0, "Test fit"))
    s.pause(0.3)
    s.line("N15", {"test": "test", "tight": "tight", "kigo": "suggests", "face": "face"}, gap=0.4)
    s.sfx.append((q(s.ev["test"] + 2.2), "joint_home"))
    s.line("N16", {"tip": "tip"}, gap=0.4)
    s.hold(3.0, "Study: seated")


@shot("S10", "Next time", "2d", "Teaser: Episode 7 · hozo and hozo-ana (mortise and tenon).")
def _(s):
    s.pause(0.3)
    s.line("N17", {"joint": "joint"}, gap=0.6)


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
