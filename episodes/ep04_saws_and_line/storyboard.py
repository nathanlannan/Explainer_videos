"""Episode 4 · Part 1 storyboard -> build/timeline.json (shared timeline engine)."""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "render"))
from timeline import q, run, shot  # noqa: E402


@shot("S01", "Pull to cut", "threeQ", "A ryōba drawn back through a board beside a marked line; the kerf grows on the waste side; a 'pull' arrow.")
def _(s):
    s.pause(0.6)
    s.ev["stroke0"] = q(s.now)
    s.line("N01", {"pull": "pull", "shapes": "shapes"}, gap=0.4)
    s.line("N02", {"saws": "saws", "line": "line"}, gap=0.3)
    s.pause(1.6)
    s.ev["stroke1"] = q(s.now)
    k = s.ev["stroke0"]
    while k < s.now - 0.8:          # one pull sound per cutting stroke (period 1.6 s in shots.js)
        s.sfx.append((q(k + 0.05), "saw_pull")); k += 1.6


@shot("S02", "Title card", "card", "Series title card: Episode 4 · Part 1 · Saws and the Line.")
def _(s):
    s.pause(3.6)


@shot("S03", "Push and pull", "2d", "Two blades: pulled (tension arrows, thin plate) and pushed (compression arrows, thicker plate; ghosted bow).")
def _(s):
    s.chapters.append((0.0, "Why pull?"))
    s.pause(0.3)
    s.line("N03", {"push": "push", "pull": "pull", "tension": "tension", "thin": "thinner", "stiff": "stiffer"}, gap=0.4)
    s.line("N04", {"kerf": "kerf", "narrow": "narrower", "less": "less"}, gap=0.4)
    s.hold(3.5, "Study: pull vs. push")


@shot("S04", "The ryōba", "threeQ", "Ryōba model turning; rip edge and crosscut edge labelled; grain arrows on a board.")
def _(s):
    s.chapters.append((0.0, "The ryōba"))
    s.pause(0.3)
    s.line("N05", {"term": "double", "rip": "rips", "tate": "tatibiki", "cross": "crosscuts", "yoko": "yokobiki", "meiji": "era"}, gap=0.4)
    s.hold(3.0, "Study: the ryōba's two edges")


@shot("S05", "Rip and crosscut teeth", "2d", "Magnified tooth profiles: rip teeth pare along the fibres like chisels; crosscut teeth sever them like knives.")
def _(s):
    s.pause(0.3)
    s.line("N06", {"teeth": "teeth", "rip": "rip", "cross": "cross"}, gap=0.4)
    s.hold(3.5, "Study: rip and crosscut teeth")


@shot("S06", "The dōzuki", "threeQ", "Dōzuki with its spine highlighted; then a tenoned member with the shoulder highlighted and the dōzuki cutting it.")
def _(s):
    s.chapters.append((0.0, "The dōzuki and the kataba"))
    s.pause(0.3)
    s.line("N07", {"term": "joinery", "spine": "spine", "cross": "classed"}, gap=0.4)
    s.line("N08", {"shoulder": "shoulder", "cutting": "cutting", "made": "work"}, gap=0.3)
    s.ev["cut"] = q(s.now - 2.0)
    s.pause(3.0)
    k = s.ev["cutting"] - 0.2
    while k < s.now - 0.7:          # one pull sound per stroke (period 1.3 s in shots.js)
        s.sfx.append((q(k + 0.05), "saw_pull")); k += 1.3


@shot("S07", "The kataba", "threeQ", "A single-edged saw, name only.")
def _(s):
    s.pause(0.3)
    s.line("N09", {"term": "also", "spine": "spine"}, gap=0.4)
    s.hold(2.0)


@shot("S08", "Kerf and set", "2d", "End view: teeth bent alternately; kerf = plate + set.")
def _(s):
    s.chapters.append((0.0, "Kerf"))
    s.pause(0.3)
    s.line("N10", {"kerf": "end", "bent": "bent", "set": "set", "wider": "wider"}, gap=0.4)
    s.hold(3.5, "Study: kerf and set")


@shot("S09", "Where the cut goes", "2d", "Three panels: take the line, leave the line, split the line; waste hatched.")
def _(s):
    s.chapters.append((0.0, "Cutting to the line"))
    s.pause(0.3)
    s.line("N11", {"manual": "manual", "away": "away", "leave": "leave", "split": "split"}, gap=0.4)
    s.line("N12", {"tight": "tight"}, gap=0.4)
    s.hold(4.0, "Study: take, leave, split")


@shot("S10", "A worked example", "2d", "Tenon end view: thickness cut on the line (a little loose); width cut just outside (tight). Source tag.")
def _(s):
    s.pause(0.3)
    s.line("N13", {"manual": "manual", "thick": "thickness", "width": "width"}, gap=0.4)
    s.line("N14", {"ref": "reference"}, gap=0.4)
    s.hold(3.5, "Study: the tenon example")


@shot("S11", "Western cousins", "2d", "Panel saw and backsaw (push) beside ryōba and dōzuki (pull).")
def _(s):
    s.pause(0.3)
    s.line("N15", {"western": "western", "stroke": "stroke"}, gap=0.5)
    s.hold(2.0)


@shot("S12", "Next time", "2d", "Teaser: Part 2 · chisels, gennō, kanna.")
def _(s):
    s.pause(0.3)
    s.line("N16", {"chisels": "chisels"}, gap=0.6)


@shot("S13", "Recap and glossary", "2d", "One sentence + glossary; held still for study.")
def _(s):
    s.chapters.append((0.0, "Recap and glossary"))
    s.pause(0.4)
    s.line("N17", gap=0.5)
    s.hold(9.0, "Glossary")


@shot("S14", "A note on sharp tools", "2d", "Quiet closing card: learn sharp-tool technique from a teacher.")
def _(s):
    s.pause(0.4)
    s.line("N18", gap=1.2)


@shot("S15", "End card", "card", "Series end card: next episode.")
def _(s):
    s.pause(3.2)


if __name__ == "__main__":
    run(HERE)
