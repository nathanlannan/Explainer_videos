"""Negative tests: the fit check must catch an interference, an open gap and a blocked path."""
import fitcheck
from timber import Box, Member


def block(name, x, cuts=()):
    return Member(name, "post", Box(x, 0, 0, 100, 100, 100), "y", list(cuts))


def test_catches_overlap():
    a, b = block("a", 0), block("b", 99)          # 1 mm overlap
    rep = fitcheck.run([fitcheck.Step(a, (0, 1, 0), 0), fitcheck.Step(b, (1, 0, 0), 0)], [])
    assert not rep["ok"] and rep["interference"][0]["volume_mm3"] > 9000


def test_catches_gap():
    a, b = block("a", 0), block("b", 102)         # 2 mm gap, 0.5 allowed
    rep = fitcheck.run([fitcheck.Step(a, (0, 1, 0), 0), fitcheck.Step(b, (1, 0, 0), 0)], [fitcheck.Mate("b", "a", 0.5)])
    assert not rep["ok"] and not rep["gaps"][0]["in_contact"]


def test_catches_blocked_path():
    base = Member("base", "sill", Box(-50, -50, -50, 300, 50, 300), "x", [Box(0, -20, 0, 100, 21, 100)])
    peg = Member("peg", "post", Box(0, -20, 0, 100, 120, 100), "y")
    ok = fitcheck.run([fitcheck.Step(base, (0, 1, 0), 0), fitcheck.Step(peg, (0, 1, 0), 300)], [])
    bad = fitcheck.run([fitcheck.Step(base, (0, 1, 0), 0), fitcheck.Step(peg, (1, 0, 0), 300)], [])  # slid in sideways through the wall
    assert ok["ok"] and not bad["ok"]


if __name__ == "__main__":
    test_catches_overlap(); test_catches_gap(); test_catches_blocked_path(); print("fitcheck self-tests pass")
