"""Episode 11 -- the okkake daisen-tsugi (追掛け大栓継ぎ): two same-shape pieces, lowered together, pegged. Fit-checked.

Sources (research/ep11_fact_pack.md):
  * over the splice each piece keeps about half the WIDTH at full depth; the stepped joint line shows on the top face, the
    pegs on the side faces (R11-10, the WBT t0801/t0802 drawings and 住吉・松井 Fig.1.1.3 via KB);
  * a step (顎, ago) at mid-length, 15 mm wide (7.5 either side of the center line), and a 15 x 15 mm tongue (目違,
    mechigai) at each end, full depth (R11-09, R11-42, T Fig.3, KB Fig.1.1.3);
  * the ago's bearing face is sloped in elevation; drawn at 1/20 of the depth (住吉・松井; W says about 1/10: R11-11);
  * the upper piece is lowered from above (R11-12); two pegs through the side faces at L/4 either side of the center,
    driven from opposite sides (R11-16); 15 mm square hardwood (T, R11-20);
  * sizes are ONE LAB'S test proportions (T, OD-1836: W 120, depth 180, splice 360 = 2 x depth; R11-32), tagged on screen.
  * the slight plan taper of the joint line in KB's drawing is omitted (drawn straight), labelled "simplified".
Axes: X along the beam, Y up (0..H), Z across (-W/2..W/2). The lower piece (下木) lies at x < L; the upper (上木) at x > 0.
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "geometry"))
import fitcheck  # noqa: E402
from timber import Box, Hull, Member  # noqa: E402

W, H, L = 120.0, 180.0, 360.0
E = 15.0          # the ago step (7.5 each side of center)
F = 15.0          # mechigai tongue, x and z
SLOPE = 1 / 20    # dx/dy of the ago face (1/20 of the depth over the depth)
PEG = 15.0
LL, LU = 700.0, 700.0
e = E / 2


def xs(y, slope=None):
    return L / 2 + (y - H / 2) * (SLOPE if slope is None else slope)


def step_lower(slope=None):
    """The lower piece's part of the center strip (|z| < e): from the sloped ago face to the splice end."""
    pts = [(xs(y, slope), y, z) for y in (0.0, H) for z in (-e, e)] + [(L, y, z) for y in (0.0, H) for z in (-e, e)]
    return Hull(pts)


def build(pegs=True, slope=None):
    a = Box(0, 0, -W / 2, L, H, W / 2 - e)                       # lower's half (z < -e) over the whole splice
    tongue_lo = Box(L, 0, -e, F, H, E)                           # lower's mechigai, into the upper
    tongue_up = Box(-F, 0, -e, F, H, E)                          # upper's mechigai, into the lower
    holes = [Box(x - PEG / 2, H / 2 - PEG / 2, -W / 2 - 1, PEG, PEG, W + 2) for x in (L / 4, 3 * L / 4)]
    lower = Member("lower", "beam", Box(-LL, 0, -W / 2, LL, H, W), "x", adds=[a, step_lower(slope), tongue_lo], cuts=[tongue_up] + (holes if pegs else []))
    upper = Member("upper", "beam", Box(0, 0, -W / 2, L + LU, H, W), "x", adds=[tongue_up], cuts=[a, step_lower(slope), tongue_lo] + (holes if pegs else []))
    pg = [Member(f"peg{i}", "pin", Box(x - PEG / 2, H / 2 - PEG / 2, -W / 2 - 12, PEG, PEG, W + 24), "z") for i, x in enumerate((L / 4, 3 * L / 4))]
    return lower, upper, pg


def congruent(lo_m, up_m):
    a, b = lo_m.solid(), up_m.solid()
    return abs((b.rotate([0, 180, 0]).translate([L, 0, 0]) ^ a).volume() - a.volume()) < 1.0


def main():
    lower, upper, pegs = build()
    lo, up = lower.solid(), upper.solid()
    steps = [fitcheck.Step(lower, (0, 0, 0), 0), fitcheck.Step(upper, (0, 1, 0), H + 30),
             fitcheck.Step(pegs[0], (0, 0, -1), 200), fitcheck.Step(pegs[1], (0, 0, 1), 200)]   # pegs from opposite sides
    rep = fitcheck.run(steps, [fitcheck.Mate("lower", "upper", 0.1)])
    fitcheck.assert_ok(rep)
    hit = lambda d: (up.translate(list(d)) ^ lo).volume() > 1.0
    pegsolid = pegs[0].solid() + pegs[1].solid()
    lift_with_pegs = (up.translate([0, 5, 0]) ^ pegsolid).volume() > 1.0
    checks = {
        "fitcheck": fitcheck.summary(rep),
        "same_shape_turned_end_for_end_apart_from_slope": congruent(*build(pegs=True, slope=0.0)[:2]),
        "slope_reversed_on_upper": not congruent(lower, upper),
        "locked_against_pull_apart": hit((5, 0, 0)),
        "locked_sideways_+z": hit((0, 0, 5)), "locked_sideways_-z": hit((0, 0, -5)),
        "lifts_out_without_pegs": not hit((0, 5, 0)),
        "pegs_stop_lift": lift_with_pegs,
        "drops_in_clear": all(not hit((0, k, 0)) for k in range(1, int(H) + 25, 5)),
        "splice_twice_depth": L == 2 * H,
    }
    checks["ok"] = rep["ok"] and all(v for k, v in checks.items() if isinstance(v, bool))
    assert checks["ok"], checks
    out = HERE / "build"; out.mkdir(exist_ok=True)
    nl, nu, _ = build(pegs=False)
    geo = {"W": W, "H": H, "L": L, "E": E, "F": F, "SLOPE": SLOPE, "PEG": PEG, "LL": LL, "LU": LU,
           "members": [lower.to_json(), upper.to_json()], "pegs": [p.to_json() for p in pegs],
           "nopeg": [nl.to_json(), nu.to_json()], "checks": checks}
    (out / "geometry.json").write_text(json.dumps(geo))
    (out / "checks.json").write_text(json.dumps(checks, indent=1))
    print(json.dumps(checks, indent=1))


if __name__ == "__main__":
    main()
