"""Episode 12 storyboard -> build/timeline.json (shared timeline engine)."""
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "render"))
from timeline import q, run, shot  # noqa: E402


@shot("S01", "Lowered and pegged", "threeQ", "The finished okkake: the upper lowered onto the lower, the pegs driven.")
def _(s):
    s.pause(0.8)
    s.line("N01", {"lowered": "lowered", "pegs": "pegs", "course": "training"}, gap=0.4)
    s.sfx.append((q(s.ev["lowered"] + 1.8), "joint_home"))
    s.line("N02", {"first": "first", "other": "other"}, gap=0.4)
    s.pause(0.8)


@shot("S02", "Title card", "card", "Series title card: Episode 12 · Cutting the Okkake.")
def _(s):
    s.pause(3.8)


@shot("S03", "Marking out", "threeQ", "The lower piece's blank: lines in the course's order on the top face, one side face, the underside; the splice and peg center lines on the other side face.")
def _(s):
    s.chapters.append((0.0, "Marking out"))
    s.pause(0.3)
    s.line("N03", {"top": "top", "end": "end", "housing": "housing"}, gap=0.4, sfx={"end": "mark", "housing": "mark"})
    s.line("N04", {"shoulder": "shoulder", "along": "along", "other": "other", "marks": "marks"}, gap=0.4, sfx={"shoulder": "mark", "along": "mark_long"})
    s.line("N05", {"slope": "slope", "side": "side", "under": "underside"}, gap=0.4, sfx={"slope": "mark"})
    s.line("N06", {"other6": "other", "center": "center", "pegs": "peg", "blade": "blade"}, gap=0.4, sfx={"center": "mark_long"})
    s.hold(3.5, "Study: the lines")


@shot("S04", "Cutting: first stages", "threeQ", "End cut; half the line (Episode 10 callback); peg holes started from the whole side face; the outer block from slope to tip; the outer layer split off back to the shoulder.")
def _(s):
    s.chapters.append((0.0, "Cutting the lower piece"))
    s.pause(0.3)
    s.line("N07", {"cutting": "cutting", "grain": "grain"}, gap=0.4)
    s.line("N08", {"half": "half"}, gap=0.4)
    s.line("N09", {"holes": "holes"}, gap=0.4)
    s.line("N10", {"rips": "rips", "cross": "crosscuts", "away": "away"}, gap=0.4)
    s.line("N11", {"shoulder": "shoulder", "chisel": "chisel", "splits": "splits"}, gap=0.4)


@shot("S05", "The slope, housing and tongue", "threeQ", "The center strip: slope sawn, kerfs, chopped, pared; the housing; the tongue; the peg holes finished; the upper the same, slope reversed.")
def _(s):
    s.pause(0.3)
    s.line("N12", {"mark": "mark", "saw": "saw", "kerfs": "kerfs", "chop": "chop"}, gap=0.4)
    s.line("N13", {"housing": "housing", "tongue": "tongue", "rip": "rip"}, gap=0.4)
    s.line("N14", {"last": "last"}, gap=0.4)
    s.line("N15", {"upper": "upper"}, gap=0.4)
    s.hold(3.5, "Study: the lower piece, cut")


@shot("S06", "Assembly", "threeQ", "The upper lowered onto the lower; pegs from opposite sides; the fit advice (one test database).")
def _(s):
    s.chapters.append((0.0, "Assembly"))
    s.pause(0.3)
    s.line("N16", {"lowered": "lowered", "pegs": "pegs"}, gap=0.4)
    s.sfx.append((q(s.ev["lowered"] + 1.6), "joint_home"))
    s.line("N17", {"warns": "warns", "light": "light"}, gap=0.4)
    s.hold(2.0)


@shot("S07", "The series", "2d", "The twelve episodes in one row.")
def _(s):
    s.chapters.append((0.0, "The series"))
    s.pause(0.3)
    s.line("N18", {"story": "story", "splices": "splices"}, gap=0.4)
    s.hold(3.0)


@shot("S08", "Recap and glossary", "2d", "One sentence + glossary; held still for study.")
def _(s):
    s.chapters.append((0.0, "Recap and glossary"))
    s.pause(0.4)
    s.line("N19", gap=0.5)
    s.hold(9.0, "Glossary")


@shot("S09", "A note on sharp tools", "2d", "Quiet closing card: learn sharp-tool technique from a teacher.")
def _(s):
    s.pause(0.4)
    s.line("N20", gap=1.2)


@shot("S10", "End card", "card", "Series end card.")
def _(s):
    s.pause(4.0)


if __name__ == "__main__":
    run(HERE)
