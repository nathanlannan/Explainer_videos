"""Episode 10 storyboard -> build/timeline.json (shared timeline engine)."""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "render"))
from timeline import q, run, shot  # noqa: E402


@shot("S01", "It drops in", "threeQ", "The finished male drops into the finished female and seats.")
def _(s):
    s.pause(0.8)
    s.line("N01", {"drops": "drops", "train": "training"}, gap=0.4)
    s.sfx.append((q(s.ev["drops"] + 1.6), "joint_home"))
    s.line("N02", {"stub": "stub", "leave": "leave"}, gap=0.4)
    s.pause(0.8)


@shot("S02", "Title card", "card", "Series title card: Episode 10 · Cutting the Gooseneck.")
def _(s):
    s.pause(3.8)


@shot("S03", "Before marking", "threeQ", "Two blanks: the male (upper piece, anchor bolt beside the splice) and the female; center lines on both.")
def _(s):
    s.chapters.append((0.0, "Before marking"))
    s.pause(0.3)
    s.line("N03", {"which": "which", "male": "male", "bolt": "bolt"}, gap=0.4)
    s.line("N04", {"center": "center", "laid": "laid"}, gap=0.4)
    s.hold(1.5)


@shot("S04", "Marking the female", "threeQ", "Female's top face: end line, seat line, neck and tip lines, cut line; neck lines split from the center (blade width ~15 mm, schematic); slanted head lines; seat lines down both sides.")
def _(s):
    s.chapters.append((0.0, "Marking out"))
    s.pause(0.3)
    s.line("N05", {"end": "end", "seat": "seat", "neck": "neck", "cut": "cut"}, gap=0.4, sfx={"end": "mark", "seat": "mark", "cut": "mark"})
    s.line("N06", {"split": "split", "blade": "blade"}, gap=0.4, sfx={"split": "mark_long"})
    s.line("N07", {"slant": "slanted", "sides": "carried"}, gap=0.4, sfx={"slant": "mark", "sides": "mark"})
    s.hold(3.5, "Study: the female's lines")


@shot("S05", "Marking the male", "threeQ", "The male's lines, the same way.")
def _(s):
    s.pause(0.3)
    s.line("N08", {"end": "end", "neck": "neck", "center": "center", "slant": "slanted", "sides": "sides"}, gap=0.4, sfx={"end": "mark", "slant": "mark"})
    s.hold(2.5)


@shot("S06", "Cutting the female", "threeQ", "End cut; rip angled clear of the seat; crosscut to form the seat; chop the tip, the sides, clear the socket; tip dug ~3 mm past the line; inset: the neck-end strip left, then pared to a slope (schematic).")
def _(s):
    s.chapters.append((0.0, "Cutting the female"))
    s.pause(0.3)
    s.line("N09", {"female": "female", "grain": "grain", "rip": "rip", "cross": "cross"}, gap=0.4)
    s.line("N10", {"tip": "tip", "sides": "sides", "clear": "clear"}, gap=0.4)
    s.line("N11", {"dig": "digs", "floor": "floor"}, gap=0.4)
    s.line("N12", {"along": "along", "meets": "meets", "pare": "pairs"}, gap=0.4)
    s.hold(3.5, "Study: the female, cut")


@shot("S07", "Cutting the male", "threeQ", "End cut; rip along the seat face, crosscut the shoulder; head sides ripped with the entry taper (inset, exaggerated); waste split off; bearing slope sawn; kerfs beside the neck, neck chopped; slope pared; underside edges chamfered.")
def _(s):
    s.chapters.append((0.0, "Cutting the male"))
    s.pause(0.3)
    s.line("N13", {"begin": "cutting", "rip": "rip", "cross": "cross"}, gap=0.4)
    s.line("N14", {"head": "head", "top": "top", "narrower": "narrower"}, gap=0.4)
    s.line("N15", {"shoulder": "shoulder", "splits": "splits", "slope": "slope"}, gap=0.4)
    s.line("N16", {"kerfs": "kerfs", "chop": "chop", "finally": "finally", "chamfer": "chamfer"}, gap=0.4)
    s.hold(3.5, "Study: the male, cut")


@shot("S08", "Assembly", "threeQ", "The male drops in from above, onto the seat.")
def _(s):
    s.chapters.append((0.0, "Assembly"))
    s.pause(0.3)
    s.line("N17", {"drops": "drops"}, gap=0.4)
    s.sfx.append((q(s.ev["drops"] + 1.8), "joint_home"))
    s.hold(2.5)


@shot("S09", "Next time", "2d", "Teaser: Episode 11 · the other splice for outer-wall beams.")
def _(s):
    s.pause(0.3)
    s.line("N18", {"splice": "splice"}, gap=0.6)


@shot("S10", "Recap and glossary", "2d", "One sentence + glossary; held still for study.")
def _(s):
    s.chapters.append((0.0, "Recap and glossary"))
    s.pause(0.4)
    s.line("N19", gap=0.5)
    s.hold(9.0, "Glossary")


@shot("S11", "A note on sharp tools", "2d", "Quiet closing card: learn sharp-tool technique from a teacher.")
def _(s):
    s.pause(0.4)
    s.line("N20", gap=1.2)


@shot("S12", "End card", "card", "Series end card: next episode.")
def _(s):
    s.pause(3.2)


if __name__ == "__main__":
    run(HERE)
