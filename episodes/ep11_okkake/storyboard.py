"""Episode 11 storyboard -> build/timeline.json (shared timeline engine)."""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "render"))
from timeline import q, run, shot  # noqa: E402


@shot("S01", "Lowered and pegged", "threeQ", "The lower piece set; the upper lowered from above beside it; two pegs driven from opposite sides.")
def _(s):
    s.pause(0.8)
    s.line("N01", {"lowered": "lowered", "pegs": "pegs"}, gap=0.4)
    s.sfx.append((q(s.ev["lowered"] + 2.0), "joint_home"))
    s.line("N02", {"term": "okake"}, gap=0.4)
    s.pause(1.0)


@shot("S02", "Title card", "card", "Series title card: Episode 11 · The Other Splice · okkake daisen-tsugi 追掛け大栓継ぎ.")
def _(s):
    s.pause(3.8)


@shot("S03", "The name", "2d", "追掛け大栓継ぎ read おっかけだいせんつぎ (references); 大栓 written 'large' + 'peg'; without pegs 追掛継; Episode 9 callback: the outer-wall beam clause.")
def _(s):
    s.chapters.append((0.0, "The name"))
    s.pause(0.3)
    s.line("N03", {"read": "references", "daisen": "daisen", "without": "without"}, gap=0.4)
    s.line("N04", {"ep": "episode", "goose": "gooseneck"}, gap=0.4)
    s.hold(3.0, "Study: the name")


@shot("S04", "The parts", "threeQ", "Exploded: lower and upper pieces (same shape, turned end for end); half width over the splice; ago step and mechigai tongues; the upper drops in; slope inset; pegs from opposite sides; fit-check demo.")
def _(s):
    s.chapters.append((0.0, "The parts"))
    s.pause(0.3)
    s.line("N05", {"same": "same", "warns": "warns", "lower": "lower"}, gap=0.4)
    s.line("N06", {"half": "half", "above": "above", "ago": "ago", "mech": "mechigai"}, gap=0.4)
    s.line("N07", {"slope": "slope", "lowered": "lowered", "tight": "tight"}, gap=0.4)
    s.sfx.append((q(s.ev["lowered"] + 1.6), "joint_home"))
    s.line("N08", {"pegs": "pegs", "lift": "lifting", "credit": "credit"}, gap=0.4)
    s.line("N09", {"model": "model", "lift9": "lift", "with": "with"}, gap=0.4)
    s.hold(3.5, "Study: the parts")


@shot("S05", "Where it goes", "2d", "Flat 35 clauses; no hardware named; the lower piece cantilevered past the post with the splice beyond it (schematic).")
def _(s):
    s.chapters.append((0.0, "Where it goes"))
    s.pause(0.3)
    s.line("N10", {"offers": "offers", "roof": "roof", "goose": "gooseneck"}, gap=0.4)
    s.line("N11", {"none": "none", "post": "post"}, gap=0.4)
    s.hold(3.5, "Study: where it goes")


@shot("S06", "Length and strength", "2d", "Length rules (attributed); our model's proportions; tension bars vs the gooseneck (same lab); depth over length; bending; slow by hand.")
def _(s):
    s.chapters.append((0.0, "Length and strength"))
    s.pause(0.3)
    s.line("N12", {"long": "long", "hand": "handbook", "database": "database"}, gap=0.4)
    s.line("N13", {"model": "model", "twice": "twice"}, gap=0.4)
    s.line("N14", {"tests": "tests", "mattered": "mattered"}, gap=0.4)
    s.line("N15", {"bending": "bending", "pin": "pin"}, gap=0.4)
    s.line("N16", {"slow": "slow", "guide": "guide"}, gap=0.4)
    s.hold(3.5, "Study: length and strength")


@shot("S07", "Next time", "2d", "Teaser: Episode 12 · Cutting the Okkake.")
def _(s):
    s.pause(0.3)
    s.line("N17", {"cut": "cutting"}, gap=0.6)


@shot("S08", "Recap and glossary", "2d", "One sentence + glossary; held still for study.")
def _(s):
    s.chapters.append((0.0, "Recap and glossary"))
    s.pause(0.4)
    s.line("N18", gap=0.5)
    s.hold(9.0, "Glossary")


@shot("S09", "End card", "card", "Series end card: next episode.")
def _(s):
    s.pause(3.2)


if __name__ == "__main__":
    run(HERE)
