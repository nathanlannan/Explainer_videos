"""Episode 10 -- marking out and cutting the koshikake kama-tsugi: the cut states of both pieces, fit-checked.

Builds on Episode 9's joint (same test-specimen geometry on 120 mm timbers, R9-46) with two details from the training
course (W, R9-60/61):
  * the socket's tip is dug about 1 bu (~3 mm) past the line, its floor level with the seat (t0723 step 5) -> DIG;
  * the male's head and neck cheeks get the entry taper: line left at the top, taken at the bottom (t0725 step 2,
    t0727 step 5) -> TAPER per side at the bottom, illustrative amount; the 2D inset exaggerates it.
The bearing slope (すべり勾配) and the 1 bu left at the neck end before paring are shown only in a 2D schematic inset:
the course gives neither the direction nor the steepness of the slope.
States: female F0 blank -> F1 seat formed -> F2 socket chopped; male M0 blank -> M1 seat face ripped and shoulder cut
(lower half cut back) -> M2 head and neck cut.
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "geometry"))
import fitcheck  # noqa: E402
from timber import Box, Hull, Member, PlanPrism  # noqa: E402

H = W = 120.0
HALF = H / 2
L, NECK, E, TIP, SEAT = 150.0, 30.0, 7.5, 30.0, 15.0     # as Episode 9 (R9-46)
DIG = 3.0            # tip dug ~1 bu past the line (R9-60)
TAPER = 0.5          # per side at the bottom of the head and neck (R9-61), illustrative
LF, LM = 700.0, 700.0
n, j, tp, h = NECK / 2, NECK / 2 + E, TIP / 2, L / 2


def socket():
    pts = [(0, -n), (0, n), (-h, n), (-h, j), (-L - DIG, tp), (-L - DIG, -tp), (-h, -j), (-h, -n)]
    return PlanPrism(pts, HALF, H + 1)


def tenon(t):
    """Head and neck as two convex hulls, each narrower by t per side at the bottom (y = HALF)."""
    def hull(outline):
        pts = []
        for y, inset in ((H, 0.0), (HALF, t)):
            pts += [(x, y, z - inset if z > 0 else z + inset) for x, z in outline]
        return Hull(pts)
    return [hull([(0.0, -n), (0.0, n), (-h - 0.01, n), (-h - 0.01, -n)]), hull([(-h, -j), (-h, j), (-L, tp), (-L, -tp)])]


def main():
    seat_cut = Box(0, HALF, -W / 2 - 1, SEAT + 1, HALF + 1, W + 2)
    F0 = Member("female", "beam", Box(-LF, 0, -W / 2, LF + SEAT, H, W), "x")
    F1 = Member("female", "beam", F0.body, "x", cuts=[seat_cut])
    F2 = Member("female", "beam", F0.body, "x", cuts=[seat_cut, socket()])
    M0 = Member("male", "beam", Box(-L, 0, -W / 2, LM + L, H, W), "x")
    lower = Box(-L - 1, -1, -W / 2 - 1, L + SEAT + 1, HALF + 1, W + 2)
    M1 = Member("male", "beam", M0.body, "x", cuts=[lower])
    beyond = Box(-L - 1, HALF - 0.01, -W / 2 - 1, L + 1, HALF + 2, W + 2)
    m2 = Member("male", "beam", M0.body, "x", cuts=[lower, beyond]).solid()
    for p in tenon(TAPER):
        m2 = m2 + p.solid()
    f2 = F2.solid()

    class _S:
        def __init__(self, name, s): self.name, self._s = name, s
        def solid(self): return self._s
    rep = fitcheck.run([fitcheck.Step(_S("female", f2), (0, 0, 0), 0), fitcheck.Step(_S("male", m2), (0, 1, 0), H + 20)],
                       [fitcheck.Mate("female", "male", 0.1)])
    fitcheck.assert_ok(rep)
    low = Box(-L, HALF, -W / 2, L, 2, W).solid(); top = Box(-L, H - 2, -W / 2, L, 2, W).solid()
    socket_low = (F0.solid() ^ low) - (f2 ^ low)
    tipgap = Box(-L - DIG + 0.1, HALF + 1, -5, DIG - 0.2, HALF - 2, 10).solid()
    checks = {
        "fitcheck": fitcheck.summary(rep),
        "taper_gap_at_bottom_mm3": round(socket_low.volume() - (m2 ^ low).volume(), 1),
        "taper_contact_at_top": (fitcheck._grow(m2 ^ top, 0.1) ^ f2).volume() > 0,
        "tip_clear_by_dig": (f2 ^ tipgap).volume() == 0 and (m2 ^ tipgap).volume() == 0,
        "locked_against_pull_apart": (m2.translate([5, 0, 0]) ^ f2).volume() > 0,
        "locked_sideways": (m2.translate([0, 0, 5]) ^ f2).volume() > 0,
        "free_to_lift": (m2.translate([0, 5, 0]) ^ f2).volume() == 0,
        "enters_freely_until_seated": all((m2.translate([0, k, 0]) ^ f2).volume() <= 1.0 for k in range(1, 60)),
    }
    checks["ok"] = rep["ok"] and checks["taper_gap_at_bottom_mm3"] > 0 and all(v for k, v in checks.items() if isinstance(v, bool))
    assert checks["ok"], checks
    out = HERE / "build"; out.mkdir(exist_ok=True)

    def mesh(name, s, box):
        import numpy as np
        mg = s.to_mesh(); v = np.asarray(mg.vert_properties)[:, :3]; t = np.asarray(mg.tri_verts)
        return {"name": name, "kind": "beam", "axis": "x", "box": box, "positions": v[t].reshape(-1, 3).round(4).tolist()}
    fb = [F0.body.x, F0.body.y, F0.body.z, F0.body.sx, F0.body.sy, F0.body.sz]
    mb = [M0.body.x, M0.body.y, M0.body.z, M0.body.sx, M0.body.sy, M0.body.sz]
    geo = {"H": H, "W": W, "L": L, "NECK": NECK, "E": E, "TIP": TIP, "SEAT": SEAT, "DIG": DIG, "TAPER": TAPER, "LF": LF, "LM": LM,
           "female": [mesh("F0", F0.solid(), fb), mesh("F1", F1.solid(), fb), mesh("F2", f2, fb)],
           "male": [mesh("M0", M0.solid(), mb), mesh("M1", M1.solid(), mb), mesh("M2", m2, mb)], "checks": checks}
    (out / "geometry.json").write_text(json.dumps(geo))
    (out / "checks.json").write_text(json.dumps(checks, indent=1))
    print(json.dumps(checks, indent=1))


if __name__ == "__main__":
    main()
