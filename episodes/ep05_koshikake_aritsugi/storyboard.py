"""Episode 5 storyboard -> build/timeline.json (shared timeline engine)."""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "render"))
from timeline import q, run, shot  # noqa: E402


@shot("S01", "Drop in", "threeQ", "The male piece descends onto the female and settles; a tug along the sill is held.")
def _(s):
    s.pause(0.8)
    s.line("N01", {"meet": "meet", "drops": "drops", "apart": "apart"}, gap=0.4)
    s.sfx.append((q(s.ev["drops"] + 1.5), "joint_home"))
    s.line("N02", {"term": "joint"}, gap=0.4)
    s.pause(1.2)


@shot("S02", "Title card", "card", "Series title card: Episode 5 · The First Joint · koshikake ari-tsugi 腰掛蟻継ぎ.")
def _(s):
    s.pause(3.8)


@shot("S03", "Tsugite and shiguchi", "2d", "An in-line splice (継手 tsugite) beside a corner joint (仕口 shiguchi).")
def _(s):
    s.chapters.append((0.0, "A splice: tsugite"))
    s.pause(0.3)
    s.line("N03", {"tsugite": "splice", "angle": "angle"}, gap=0.5)
    s.hold(2.5)


@shot("S04", "The name", "2d", "The dovetail shape (蟻 ari) and the seat (腰掛 koshikake; also 敷面 shikimen).")
def _(s):
    s.pause(0.3)
    s.line("N04", {"ari": "dovetail", "seat": "seat", "shikimen": "called"}, gap=0.5)
    s.hold(3.0, "Study: the name")


@shot("S05", "Where it goes", "2d", "Sill plan on a foundation: posts, vents, the splice clear of both; anchor bolt in the upper piece beside the joint.")
def _(s):
    s.chapters.append((0.0, "Where it goes"))
    s.pause(0.3)
    s.line("N05", {"sills": "sills", "obiki": "ground"}, gap=0.4)
    s.line("N06", {"spec": "specification", "avoid": "away", "size": "least", "bolt": "bolt"}, gap=0.4)
    s.hold(3.0, "Study: where the splice goes")


@shot("S06", "The parts", "threeQ", "Exploded: male (男木 ogi) above female (女木 megi); head, neck, shoulder, seat, socket labelled.")
def _(s):
    s.chapters.append((0.0, "The parts"))
    s.pause(0.3)
    s.line("N07", {"ogi": "male", "megi": "female"}, gap=0.4)
    s.line("N09", {"head": "head", "neck": "neck", "shoulder": "shoulder"}, gap=0.4)
    s.hold(3.5, "Study: the parts")


@shot("S07", "Upper half, lower half", "2d", "Side view: dovetail and socket in about the upper half; seat in the lower half; the male's cut-back underside.")
def _(s):
    s.pause(0.3)
    s.line("N08", {"upper": "upper", "lower": "lower", "cut": "cut"}, gap=0.5)
    s.hold(2.5)


@shot("S08", "Assembly", "threeQ", "The male drops straight down; ghosts trying the end and the side are stopped (✕); a pull along the sill is held.")
def _(s):
    s.chapters.append((0.0, "How it goes together"))
    s.pause(0.3)
    s.line("N10", {"above": "above", "end": "end", "side": "side", "drops": "drops"}, gap=0.4)
    s.sfx.append((q(s.ev["drops"] + 1.2), "joint_home"))
    s.line("N11", {"hooks": "hooks", "rests": "rests"}, gap=0.5)


@shot("S09", "Proportions", "2d", "Plan to scale: the engineering ranges for neck and length as bands; our drawing inside; slope 1:5; schematic of the blade-width method.")
def _(s):
    s.chapters.append((0.0, "Proportions"))
    s.pause(0.3)
    s.line("N12", {"vary": "vary", "neck": "neck", "length": "long", "ours": "drawing"}, gap=0.4)
    s.line("N13", {"slope": "slopes"}, gap=0.4)
    s.line("N14", {"sashigane": "sashigane", "width": "width"}, gap=0.4)
    s.hold(3.5, "Study: proportions")


@shot("S10", "What it isn't", "2d", "Modest pull; almost a hinge; anchor bolt in the upper piece (✕ not in the female, not inside the joint); failure modes; keep knots out.")
def _(s):
    s.chapters.append((0.0, "Limits"))
    s.pause(0.3)
    s.line("N15", {"pull": "pull", "hinge": "hinge", "bolt": "bolt", "never": "never"}, gap=0.4)
    s.line("N16", {"split": "split", "shear": "shear", "knots": "knots"}, gap=0.4)
    s.hold(3.0, "Study: limits")


@shot("S11", "Next time", "2d", "Teaser: Episode 6 · marking out and cutting the koshikake ari-tsugi.")
def _(s):
    s.pause(0.3)
    s.line("N17", {"mark": "mark"}, gap=0.6)


@shot("S12", "Recap and glossary", "2d", "One sentence + glossary; held still for study.")
def _(s):
    s.chapters.append((0.0, "Recap and glossary"))
    s.pause(0.4)
    s.line("N18", gap=0.5)
    s.hold(9.0, "Glossary")


@shot("S13", "End card", "card", "Series end card: next episode.")
def _(s):
    s.pause(3.2)


if __name__ == "__main__":
    run(HERE)
