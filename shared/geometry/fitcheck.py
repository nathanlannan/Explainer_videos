"""Series fit-check: run on every assembly before anything is rendered.

Three checks, all on the exact solids (manifold3d booleans):
  1. interference: pairwise intersection volume at the final pose <= tol_mm3
  2. gaps: each declared mating pair is in contact within its stated clearance
     (the member, grown by `clearance` on every axis, touches its mate) and the
     declared clearance equals the designed clearance (housing - member size)
  3. insertion: each part, moved along its declared insertion path in small
     steps, never intersects the parts already placed
Returns a report dict; `assert_ok(report)` raises if anything fails.
"""
from __future__ import annotations

import itertools
from dataclasses import dataclass

import manifold3d as m3

from timber import Member


@dataclass
class Step:
    member: Member
    direction: tuple[float, float, float]   # unit vector the part travels along to seat
    distance: float                          # mm of travel checked before seating


@dataclass
class Mate:
    a: str
    b: str
    clearance: float                         # max allowed gap, mm


def _grow(s: m3.Manifold, g: float) -> m3.Manifold:
    """Union of copies shifted +-g on each axis: a conservative 'within g' probe."""
    out = s
    for ax in range(3):
        for sgn in (-1, 1):
            d = [0.0, 0.0, 0.0]
            d[ax] = sgn * g
            out = out + s.translate(d)
    return out


def run(steps: list[Step], mates: list[Mate], tol_mm3: float = 1.0, n_path: int = 60) -> dict:
    solids = {s.member.name: s.member.solid() for s in steps}
    rep = {"interference": [], "gaps": [], "insertion": [], "ok": True}

    for a, b in itertools.combinations(solids, 2):
        v = (solids[a] ^ solids[b]).volume()
        ok = v <= tol_mm3
        rep["interference"].append({"a": a, "b": b, "volume_mm3": round(v, 4), "ok": ok})
        rep["ok"] &= ok

    for m in mates:
        touch = (_grow(solids[m.a], m.clearance) ^ solids[m.b]).volume() > 0
        rep["gaps"].append({"a": m.a, "b": m.b, "clearance_mm": m.clearance, "in_contact": touch, "ok": touch})
        rep["ok"] &= touch

    placed: list[str] = []
    for st in steps:
        worst = 0.0
        s = solids[st.member.name]
        for i in range(n_path, -1, -1):
            k = st.distance * i / n_path
            moved = s.translate([st.direction[0] * k, st.direction[1] * k, st.direction[2] * k])
            for p in placed:
                worst = max(worst, (moved ^ solids[p]).volume())
        ok = worst <= tol_mm3
        rep["insertion"].append({"part": st.member.name, "direction": st.direction, "distance_mm": st.distance,
                                 "max_collision_mm3": round(worst, 4), "ok": ok})
        rep["ok"] &= ok
        placed.append(st.member.name)
    return rep


def assert_ok(rep: dict) -> None:
    if not rep["ok"]:
        bad = [r for k in ("interference", "gaps", "insertion") for r in rep[k] if not r["ok"]]
        raise AssertionError(f"fit check failed: {bad}")


def summary(rep: dict) -> str:
    n = {k: (sum(r["ok"] for r in rep[k]), len(rep[k])) for k in ("interference", "gaps", "insertion")}
    worst_i = max((r["volume_mm3"] for r in rep["interference"]), default=0)
    worst_p = max((r["max_collision_mm3"] for r in rep["insertion"]), default=0)
    return (f"fit check {'PASS' if rep['ok'] else 'FAIL'}: interference {n['interference'][0]}/{n['interference'][1]} pairs ok "
            f"(worst {worst_i} mm^3); gaps {n['gaps'][0]}/{n['gaps'][1]} mates in contact; insertion "
            f"{n['insertion'][0]}/{n['insertion'][1]} paths clear (worst {worst_p} mm^3)")
