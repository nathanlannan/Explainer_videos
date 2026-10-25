"""Episode 6 -- marking out and cutting the koshikake ari-tsugi: the cut states of both pieces, fit-checked.

Builds on Episode 5's joint (same section and proportions) with two refinements from the training course (WBT):
  * at the tip, the socket is dug about 1 bu (~3 mm) more than the line (R6-28). The source text is ambiguous about the
    direction; it follows the step "dig down to the seat level", so this model reads it as DEEPER at the tip: the floor
    under the dovetail's head end is 3 mm below the seat level, and the tip cannot bear (recorded in decisions.md).
  * the male's dovetail cheeks taper in elevation: line left at the top, taken at the bottom (R6-24) -> modelled
    as TAPER mm per side narrower at the bottom of the dovetail; the 2D inset exaggerates it, labelled as such.
States (exact solids, exported for the renderer): female F0 blank -> F1 seat cut -> F2 socket chopped;
male M0 blank -> M1 lower half cut back -> M2 dovetail cheeks cut.
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "geometry"))
import fitcheck  # noqa: E402
from timber import Box, Hull, Member, PlanPrism  # noqa: E402

H = W = 105.0
HALF = H / 2
LD, HEAD, NECK = 50.0, 50.0, 30.0       # as Episode 5 (inside the engineering ranges, R6-19)
SEAT = 30.0                              # model assumption (R6-23), not stated on screen
DIG = 3.0                                # socket tip dug ~1 bu past the line (R6-28)
TAPER = 0.5                              # per side, bottom of the dovetail narrower (R6-24); illustrative amount
LF, LM = 700.0, 700.0
FL = (HEAD - NECK) / 2 / LD              # flare per side per mm of length


def socket(dig):
    return PlanPrism([(0, -NECK / 2), (0, NECK / 2), (-LD, HEAD / 2), (-LD, -HEAD / 2)], HALF, H + 1)


TIPLEN = 15.0   # length of the deepened pocket at the head end (model choice, not stated)


def tip_pocket(dig):
    """The socket's head end, TIPLEN long, dug DIG deeper than the seat level."""
    x0 = -LD + TIPLEN; hw0 = NECK / 2 + FL * (LD - TIPLEN)
    return PlanPrism([(x0, -hw0), (x0, hw0), (-LD, HEAD / 2), (-LD, -HEAD / 2)], HALF - dig, HALF + 0.5)


def dovetail_tapered(t):
    pts = []
    for y, inset in ((H, 0.0), (HALF, t)):
        pts += [(0, y, -NECK / 2 + inset), (0, y, NECK / 2 - inset), (-LD, y, HEAD / 2 - inset), (-LD, y, -HEAD / 2 + inset)]
    return Hull(pts)


def states():
    seat_cut = Box(0, HALF, -W / 2 - 1, SEAT + 1, HALF + 1, W + 2)
    F0 = Member("female", "sill", Box(-LF, 0, -W / 2, LF + SEAT, H, W), "x")
    F1 = Member("female", "sill", F0.body, "x", cuts=[seat_cut])
    F2 = Member("female", "sill", F0.body, "x", cuts=[seat_cut, socket(DIG), tip_pocket(DIG)])
    M0 = Member("male", "sill", Box(-LD, 0, -W / 2, LM + LD, H, W), "x")
    lower = Box(-LD - 1, -1, -W / 2 - 1, LD + SEAT + 1, HALF + 1, W + 2)
    M1 = Member("male", "sill", M0.body, "x", cuts=[lower])
    cheeks = Box(-LD - 1, HALF - 0.01, -W / 2 - 1, LD + 1, HALF + 2, W + 2)   # everything beyond the shoulder above the seat...
    M2 = Member("male", "sill", M0.body, "x", cuts=[lower, cheeks], adds=[])
    return F0, F1, F2, M0, M1, M2, cheeks


def main():
    F0, F1, F2, M0, M1, M2, cheeks = states()
    # M2 = body minus lower half minus the block beyond the shoulder, plus the tapered dovetail
    m2 = M2.solid() + dovetail_tapered(TAPER).solid()
    f2 = F2.solid()

    class _S:   # wrap a solid for fitcheck
        def __init__(self, name, s): self.name, self._s = name, s
        def solid(self): return self._s
    fe, ma = _S("female", f2), _S("male", m2)
    rep = fitcheck.run([fitcheck.Step(fe, (0, 0, 0), 0), fitcheck.Step(ma, (0, 1, 0), H + 20)], [fitcheck.Mate("female", "male", 0.1)])
    fitcheck.assert_ok(rep)
    # the tip doesn't bottom out: the male's head end has empty space under it (the pocket), and dropping the male a
    # further DIG - 0.2 mm would still not touch the female under the head end
    tip = Box(-LD + 0.5, HALF - DIG + 0.1, -20, TIPLEN - 1, DIG - 0.2, 40).solid()   # inside the pocket
    # the taper: at the bottom of the dovetail there is a gap each side; at the top, contact
    low = Box(-LD, HALF, -W / 2, LD, 2, W).solid(); top = Box(-LD, H - 2, -W / 2, LD, 2, W).solid()
    socket_low = (F0.solid() ^ low) - (f2 ^ low)          # the socket's empty space in the bottom 2 mm
    checks = {
        "fitcheck": fitcheck.summary(rep),
        "tip_does_not_bottom_out": (f2 ^ tip).volume() == 0 and (m2 ^ tip).volume() == 0,
        "taper_gap_at_bottom_mm3": round(socket_low.volume() - (m2 ^ low).volume(), 1),
        "taper_contact_at_top": (fitcheck._grow(m2 ^ top, 0.1) ^ f2).volume() > 0,
        "locked_against_pull_apart": (m2.translate([5, 0, 0]) ^ f2).volume() > 0,
        "free_to_lift": (m2.translate([0, 5, 0]) ^ f2).volume() == 0,
        "enters_freely_until_seated": all((m2.translate([0, k, 0]) ^ f2).volume() <= 1.0 for k in range(1, 60)),
    }
    checks["ok"] = rep["ok"] and checks["tip_does_not_bottom_out"] and checks["taper_gap_at_bottom_mm3"] > 0 \
        and checks["taper_contact_at_top"] and checks["locked_against_pull_apart"] and checks["free_to_lift"] and checks["enters_freely_until_seated"]
    assert checks["ok"], checks
    out = HERE / "build"
    out.mkdir(exist_ok=True)

    def mesh(name, s, box, axis="x"):
        import numpy as np
        mg = s.to_mesh(); v = np.asarray(mg.vert_properties)[:, :3]; t = np.asarray(mg.tri_verts)
        return {"name": name, "kind": "sill", "axis": axis, "box": box, "positions": v[t].reshape(-1, 3).round(4).tolist()}
    fb = [F0.body.x, F0.body.y, F0.body.z, F0.body.sx, F0.body.sy, F0.body.sz]
    mb = [M0.body.x, M0.body.y, M0.body.z, M0.body.sx, M0.body.sy, M0.body.sz]
    geo = {"H": H, "W": W, "LD": LD, "HEAD": HEAD, "NECK": NECK, "SEAT": SEAT, "DIG": DIG, "TAPER": TAPER, "LF": LF, "LM": LM,
           "female": [mesh("F0", F0.solid(), fb), mesh("F1", F1.solid(), fb), mesh("F2", f2, fb)],
           "male": [mesh("M0", M0.solid(), mb), mesh("M1", M1.solid(), mb), mesh("M2", m2, mb)],
           "checks": checks}
    (out / "geometry.json").write_text(json.dumps(geo))
    (out / "checks.json").write_text(json.dumps(checks, indent=1))
    print(json.dumps(checks, indent=1))


if __name__ == "__main__":
    main()
