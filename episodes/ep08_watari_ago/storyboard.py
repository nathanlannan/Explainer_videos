"""Episode 8 storyboard -> build/timeline.json (shared timeline engine)."""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "render"))
from timeline import q, run, shot  # noqa: E402


@shot("S01", "Beam over beam", "threeQ", "An upper timber comes down at right angles onto a lower timber and settles in.")
def _(s):
    s.pause(0.8)
    s.line("N01", {"comes": "comes", "cut": "cut", "inter": "interlock"}, gap=0.4)
    s.sfx.append((q(s.ev["comes"] + 2.0), "joint_home"))
    s.line("N02", {"term": "crossing"}, gap=0.4)
    s.pause(1.0)


@shot("S02", "Title card", "card", "Series title card: Episode 8 · Beam Over Beam · watari-ago 渡り腮.")
def _(s):
    s.pause(3.8)


@shot("S03", "The name", "2d", "Tsugite 継手 vs shiguchi 仕口 (Episode 5 callback); 渡り 'a crossing' + 腮 ago 'jaw' (also read era, 'gills'); the spec spelling 渡りあご; 'which part is the jaw? our sources don't say'.")
def _(s):
    s.chapters.append((0.0, "The name"))
    s.pause(0.3)
    s.line("N03", {"splice": "splice", "family": "family", "one": "one"}, gap=0.4)
    s.line("N04", {"crossing": "crossing", "jaw": "jaw", "gills": "gills", "kana": "kana"}, gap=0.4)
    s.line("N05", {"jaw2": "jaw"}, gap=0.4)
    s.hold(3.0, "Study: the name")


@shot("S04", "Both timbers are cut", "threeQ", "Exploded: the groove across the upper timber's underside; the lower timber cut away left and right, its middle standing. The upper drops in; ghost slides are stopped (✕); a neutral lift arrow; end-on view; 'depths illustrative' tag.")
def _(s):
    s.chapters.append((0.0, "Both timbers are cut"))
    s.pause(0.3)
    s.line("N06", {"dict": "dictionary", "groove": "groove", "lower": "lower", "middle": "middle"}, gap=0.4)
    s.line("N07", {"comes": "comes", "slide": "slide", "lift": "lifting"}, gap=0.4)
    s.sfx.append((q(s.ev["comes"] + 1.4), "joint_home"))
    s.line("N08", {"end": "end", "raised": "raised"}, gap=0.4)
    s.line("N09", {"deep": "deep", "shallow": "shallow", "illus": "illustration"}, gap=0.4)
    s.hold(3.5, "Study: the cuts")


@shot("S05", "Not a half-lap", "threeQ", "Side by side: aigaki 相欠き (each half depth, tops flush) and the watari-ago (shallow cuts, different heights).")
def _(s):
    s.chapters.append((0.0, "Not a half-lap"))
    s.pause(0.3)
    s.line("N10", {"half": "half", "aigaki": "aigaki", "flush": "flush"}, gap=0.4)
    s.line("N11", {"shallow": "shallow", "heights": "heights", "locks": "locks", "dict": "dictionary"}, gap=0.4)
    s.hold(3.5, "Study: watari-ago and aigaki")


@shot("S06", "Where it goes", "2d", "Text panel (no stacking drawn): roof beam ↔ eaves plate per Flat 35: かぶとあり掛け or 渡りあご, with a 羽子板ボルト; flush tops → 大入れあり掛け (not a crossing joint); other uses; 京呂組 (JAANUS).")
def _(s):
    s.chapters.append((0.0, "Where it goes"))
    s.pause(0.3)
    s.line("N12", {"roof": "roof", "kabuto": "kabuto", "bolt": "bolt"}, gap=0.4)
    s.line("N13", {"flush": "flush", "housed": "housed"}, gap=0.4)
    s.line("N14", {"second": "second", "log": "log", "style": "style"}, gap=0.4)
    s.hold(3.5, "Study: where it goes")


@shot("S07", "Holding it together", "2d", "Art. 47 card and the spec's hardware; a generic plate bolt, not mounted on the joint; a beam over two supports with a mid-span underside notch ✕ (Art. 44) and a neutral marker where one timber rests on the other.")
def _(s):
    s.chapters.append((0.0, "Holding it together"))
    s.pause(0.3)
    s.line("N15", {"law": "regulations", "pairs": "pairs"}, gap=0.4)
    s.line("N16", {"plate": "plate", "nut": "nut"}, gap=0.4)
    s.line("N17", {"forbid": "forbid", "middle": "middle", "rests": "rests"}, gap=0.4)
    s.hold(3.0, "Study: the rules")


@shot("S08", "Next time", "2d", "Teaser: Episode 9 · back to splices.")
def _(s):
    s.pause(0.3)
    s.line("N18", {"splices": "splices"}, gap=0.6)


@shot("S09", "Recap and glossary", "2d", "One sentence + glossary; held still for study.")
def _(s):
    s.chapters.append((0.0, "Recap and glossary"))
    s.pause(0.4)
    s.line("N19", gap=0.5)
    s.hold(9.0, "Glossary")


@shot("S10", "End card", "card", "Series end card: next episode.")
def _(s):
    s.pause(3.2)


if __name__ == "__main__":
    run(HERE)
