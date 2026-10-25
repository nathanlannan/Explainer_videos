"""Episode 9 storyboard -> build/timeline.json (shared timeline engine)."""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "render"))
from timeline import q, run, shot  # noqa: E402


@shot("S01", "It drops in", "threeQ", "The male drops into the female: the head into the socket, the timber onto the seat.")
def _(s):
    s.pause(0.8)
    s.line("N01", {"drops": "drops", "head": "head", "seat": "seat"}, gap=0.4)
    s.sfx.append((q(s.ev["drops"] + 2.2), "joint_home"))
    s.line("N02", {"term": "koshikake", "goose": "gooseneck"}, gap=0.4)
    s.pause(1.0)


@shot("S02", "Title card", "card", "Series title card: Episode 9 · The Gooseneck · koshikake kama-tsugi 腰掛鎌継ぎ.")
def _(s):
    s.pause(3.8)


@shot("S03", "The name", "2d", "鎌継ぎ kama-tsugi; 鎌 'a sickle'; 鎌首 kamakubi 'a snake's raised head and neck (lit. a neck curved like a sickle)'; 'gooseneck: an English name'.")
def _(s):
    s.chapters.append((0.0, "The name"))
    s.pause(0.3)
    s.line("N03", {"dict": "dictionaries", "short": "short", "sickle": "sickle", "kubi": "kamakubi"}, gap=0.4)
    s.line("N04", {"goose": "gooseneck", "geese": "geese"}, gap=0.4)
    s.hold(3.0, "Study: the name")


@shot("S04", "The parts", "threeQ", "Exploded: male 男木 above female 女木; head 鎌, neck 首, seat 腰掛. The male drops in; ghost slides ✕ (fit-checked); a neutral lift arrow.")
def _(s):
    s.chapters.append((0.0, "The parts"))
    s.pause(0.3)
    s.line("N05", {"male": "male", "female": "female", "half": "half", "seat": "seat"}, gap=0.4)
    s.line("N06", {"neck": "neck", "names": "names"}, gap=0.4)
    s.line("N07", {"drops": "drops", "pull": "pull", "slide": "slide", "lift": "lifting"}, gap=0.4)
    s.sfx.append((q(s.ev["drops"] + 1.4), "joint_home"))
    s.hold(3.5, "Study: the parts")


@shot("S05", "Proportions and strength", "2d", "Plans to scale: the gooseneck (test-specimen sizes, 120 mm) beside Episode 5's dovetail drawing (105 mm); attributed test loads; stress near the neck; failure modes; 'often treated as a pin'.")
def _(s):
    s.chapters.append((0.0, "Proportions and strength"))
    s.pause(0.3)
    s.line("N08", {"test": "test", "standard": "standard"}, gap=0.4)
    s.line("N09", {"drawings": "drawings", "database": "database", "rough": "rough"}, gap=0.4)
    s.line("N10", {"stress": "stress", "depth": "depth"}, gap=0.4)
    s.line("N11", {"fail": "brittle", "crush": "crush", "pin": "pin"}, gap=0.4)
    s.hold(3.5, "Study: proportions and strength")


@shot("S06", "Where it goes", "2d", "Flat 35: sills, eaves plates, purlins (ari or kama); 胴差し (kama or another splice, not ari); roof beams about 120 deep and one floor-beam option with straps and bolts; purlins two nails. Sill anchor bolt in the upper piece (public-works spec).")
def _(s):
    s.chapters.append((0.0, "Where it goes"))
    s.pause(0.3)
    s.line("N12", {"sills": "sills", "outer": "outer"}, gap=0.4)
    s.line("N13", {"roof": "roof", "option": "option", "purlins": "purlins"}, gap=0.4)
    s.line("N14", {"bolt": "anchor"}, gap=0.4)
    s.hold(3.5, "Study: where it goes")


@shot("S07", "Limits", "2d", "A stub tenon under the seat (schematic): resists twisting; no added pulling strength in one test series. Knots and grain run-out; a generous safety margin.")
def _(s):
    s.chapters.append((0.0, "Limits"))
    s.pause(0.3)
    s.line("N15", {"stub": "stub", "twist": "twisting", "one": "one"}, gap=0.4)
    s.line("N16", {"knots": "knots", "margin": "margin"}, gap=0.4)
    s.hold(3.0, "Study: limits")


@shot("S08", "Next time", "2d", "Teaser: Episode 10 · Marking Out and Cutting the Gooseneck.")
def _(s):
    s.pause(0.3)
    s.line("N17", {"cut": "cutting"}, gap=0.6)


@shot("S09", "Recap and glossary", "2d", "One sentence + glossary; held still for study.")
def _(s):
    s.chapters.append((0.0, "Recap and glossary"))
    s.pause(0.4)
    s.line("N18", gap=0.5)
    s.hold(9.0, "Glossary")


@shot("S10", "End card", "card", "Series end card: next episode.")
def _(s):
    s.pause(3.2)


if __name__ == "__main__":
    run(HERE)
