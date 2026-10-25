"""Episode 3 storyboard -> build/timeline.json (shared timeline engine)."""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "render"))
from timeline import q, run, shot  # noqa: E402


@shot("S01", "Where does each piece go?", "threeQ", "Episode 1's frame members lie apart, each cut on its own; then they rise into place.")
def _(s):
    s.pause(0.6)
    s.line("N01", {"cut": "cut", "where": "belongs"}, gap=0.4)
    s.line("N02", {"board": "board", "address": "address"}, gap=0.3)
    s.ev["rise"] = q(s.now - 0.4)
    for k in range(4):
        s.sfx.append((q(s.ev["rise"] + 1.0 + k * 0.35), "settle"))
    s.pause(3.0)


@shot("S02", "Title card", "card", "Series title card: Episode 3 · From Plan to Timber.")
def _(s):
    s.pause(3.6)


@shot("S03", "The board plan", "2d", "A plywood board; the plan drawn in ink: grid lines, posts at crossings, sills and beams between them; 910 mm spacing; grid lines through post centres.")
def _(s):
    s.chapters.append((0.0, "The board plan: itazu"))
    s.pause(0.3)
    s.line("N03", {"term": "itazu", "names": "names"}, gap=0.4, sfx={"term": "mark_long"})
    s.line("N04", {"post": "post", "beams": "beams"}, gap=0.4)
    s.line("N05", {"grid": "grid", "shaku": "shaku", "crossings": "crossings", "centers": "centers"}, gap=0.5)
    s.hold(3.5, "Study: the board plan")


@shot("S04", "Banzuke addresses", "2d", "Iroha across the top, numerals down the side; the corner post い一 and its neighbour ろ一 highlighted; an inset shows another carpenter's layout.")
def _(s):
    s.chapters.append((0.0, "Grid addresses: banzuke"))
    s.pause(0.3)
    s.line("N06", {"name": "name", "term": "banzuke", "iroha": "japanese", "nums": "numbered"}, gap=0.4, sfx={"iroha": "mark", "nums": "mark"})
    s.line("N07", {"address": "address", "i1": "inoichi", "r1": "runoichi"}, gap=0.4)
    s.hold(3.5, "Study: every crossing has an address")
    s.line("N08", {"common": "common", "varies": "varies", "other": "other"}, gap=0.5)


@shot("S05", "Onto the timber", "threeQ", "A post being marked out: its address い一 written by hand near the bottom; story stick and centre line called out; the address sits where the floor will hide it.")
def _(s):
    s.chapters.append((0.0, "From the board onto the timber"))
    s.pause(0.3)
    s.line("N09", {"writes": "writes", "where": "says", "stick": "stick", "center": "center"}, gap=0.4, sfx={"writes": "mark"})
    s.line("N10", {"hidden": "hidden", "tenon": "tenon", "floor": "floor"}, gap=0.4)
    s.hold(3.0, "Study: where the address goes")


@shot("S06", "Matching addresses at a joint", "threeQ", "The beam's underside at post い一 carries the same address (one common practice); centre lines on every member.")
def _(s):
    s.pause(0.3)
    s.line("N11", {"common": "common", "beam": "beam", "marked": "marked"}, gap=0.4, sfx={"marked": "mark"})
    s.line("N12", {"center": "center", "first": "first"}, gap=0.4, sfx={"center": "mark_long"})


@shot("S07", "Taken apart, put back", "2d", "An old frame's pieces, each with its address, shown apart and returning to place.")
def _(s):
    s.pause(0.3)
    s.line("N12b", {"apart": "apart", "back": "back"}, gap=0.6)
    s.hold(1.5)


@shot("S08", "One direction", "2d", "Flow: board plan → story sticks → marking out → cutting (kizami 刻み) → raising, labels matched.")
def _(s):
    s.chapters.append((0.0, "The workflow"))
    s.pause(0.3)
    s.line("N13", {"plan": "plan", "sticks": "sticks", "mark": "marking", "cut": "kizami"}, gap=0.4)
    s.line("N14", {"raise": "raised", "match": "matching"}, gap=0.4)
    s.hold(2.0)


@shot("S09", "Rare today", "2d", "2015: about 91% of post-and-beam framing in Japan pre-cut by machine (Forestry Agency white paper); the logic is the same.")
def _(s):
    s.pause(0.3)
    s.line("N15", {"rare": "rare", "stat": "2015", "logic": "logic"}, gap=0.6)
    s.hold(1.5)


@shot("S10", "Next time", "2d", "Teaser: Episode 4 · The Cutting Kit and the Line.")
def _(s):
    s.pause(0.3)
    s.line("N16", {"saws": "saws"}, gap=0.6)


@shot("S11", "Recap and glossary", "2d", "One sentence + glossary; held still for study.")
def _(s):
    s.chapters.append((0.0, "Recap and glossary"))
    s.pause(0.4)
    s.line("N17", gap=0.5)
    s.hold(8.5, "Glossary")


@shot("S12", "End card", "card", "Series end card: next episode.")
def _(s):
    s.pause(3.2)


if __name__ == "__main__":
    run(HERE)
