"""Episode 4 · Part 2 storyboard -> build/timeline.json (shared timeline engine)."""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "render"))
from timeline import q, run, shot  # noqa: E402


@shot("S01", "Pull the plane", "threeQ", "A kanna pulled along a board toward the viewer; a shaving curls up out of the mouth.")
def _(s):
    s.pause(0.6)
    s.ev["stroke0"] = q(s.now)
    s.line("N01", {"pull": "pulled", "curl": "shaving"}, gap=0.4)
    s.line("N02", {"kit": "chisels"}, gap=0.3)
    s.pause(2.6)
    k = s.ev["stroke0"]
    while k < s.now - 1.0:
        s.sfx.append((q(k + 0.1), "kanna_shaving")); k += 2.4


@shot("S02", "Title card", "card", "Series title card: Episode 4 · Part 2 · Chisels, Hammer and Plane.")
def _(s):
    s.pause(3.6)


@shot("S03", "Two families", "threeQ", "A struck chisel (hoop on the handle) beside a longer pushed chisel (no hoop).")
def _(s):
    s.chapters.append((0.0, "Chisels: nomi"))
    s.pause(0.3)
    s.line("N03", {"term": "nomi", "struck": "struck", "pushed": "pushed"}, gap=0.4)
    s.line("N04", {"hoop": "hoop", "katsura": "katsura"}, gap=0.4)
    s.hold(3.5, "Study: struck and pushed")


@shot("S04", "Bench and mortise chisels", "threeQ", "Oire-nomi and mukōmachi-nomi side by side; the mortise chisel chops straight down.")
def _(s):
    s.pause(0.3)
    s.line("N05", {"oire": "general", "variants": "also", "muko": "mortises", "thick": "thick"}, gap=0.4)
    s.hold(3.5, "Study: bench and mortise chisels")


@shot("S05", "The blade", "2d", "Section: single bevel; hard steel layer on the flat back, forge-welded to softer iron; the shallow back hollow; the bevel flat.")
def _(s):
    s.chapters.append((0.0, "The blade: hagane and jigane"))
    s.pause(0.3)
    s.line("N06", {"bevel": "beveled", "hagane": "hagane", "jigane": "jigane", "supports": "supports", "maker": "maker"}, gap=0.4)
    s.line("N07", {"ura": "urasuki", "flat": "flatten", "bevel2": "bevel"}, gap=0.4)
    s.hold(3.5, "Study: a laminated blade")


@shot("S06", "The gennō", "threeQ", "Gennō with flat and domed faces; a nail driven with the flat face, finished with the domed face.")
def _(s):
    s.chapters.append((0.0, "The hammer: gennō"))
    s.pause(0.3)
    s.line("N08", {"term": "hammer", "flat": "flat", "dome": "domed"}, gap=0.4)
    s.line("N09", {"strike": "strike", "last": "last", "kigoroshi": "kigoroshi"}, gap=0.4)
    s.hold(3.0, "Study: flat face and domed face")


@shot("S07", "The kanna", "threeQ", "Kanna: block, blade, chip breaker; pull arrow; taps on the blade's head advance it, on the block draw it back.")
def _(s):
    s.chapters.append((0.0, "The plane: kanna"))
    s.pause(0.3)
    s.line("N10", {"term": "plane", "pull": "pulled", "push": "pushed"}, gap=0.4)
    s.line("N11", {"dai": "block", "manual": "manual", "adv": "deeper", "back": "back"}, gap=0.4)
    s.pause(2.0)
    s.line("N12", {"nimai": "two", "cb": "second", "tear": "tear", "meiji": "meiji"}, gap=0.4)
    s.hold(3.5, "Study: the kanna's parts")


@shot("S08", "Western cousins", "2d", "Bench chisel, hammer and mallet, bench plane (push) beside the Japanese tools.")
def _(s):
    s.pause(0.3)
    s.line("N13", {"western": "western", "plane": "plane"}, gap=0.5)
    s.hold(2.0)


@shot("S09", "Keep it sharp", "2d", "Card: a dull tool invites injury; never point an edge at yourself or anyone else (skills-test manual).")
def _(s):
    s.chapters.append((0.0, "Sharp edges"))
    s.pause(0.3)
    s.line("N14", {"dull": "dull", "never": "never", "after": "after"}, gap=0.6)
    s.hold(1.5)


@shot("S10", "Next time", "2d", "Teaser: Episode 5 · the first joint, koshikake ari-tsugi.")
def _(s):
    s.pause(0.3)
    s.line("N15", {"joint": "joint"}, gap=0.6)


@shot("S11", "Recap and glossary", "2d", "One sentence + glossary; held still for study.")
def _(s):
    s.chapters.append((0.0, "Recap and glossary"))
    s.pause(0.4)
    s.line("N16", gap=0.5)
    s.hold(9.0, "Glossary")


@shot("S12", "A note on sharp tools", "2d", "Quiet closing card: learn sharp-tool technique from a teacher.")
def _(s):
    s.pause(0.4)
    s.line("N17", gap=1.2)


@shot("S13", "End card", "card", "Series end card: next episode.")
def _(s):
    s.pause(3.2)


if __name__ == "__main__":
    run(HERE)
