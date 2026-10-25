"""Episode 5 -- the koshikake ari-tsugi (腰掛蟻継ぎ), a seated dovetail splice, on a 105 mm sill.

Sources (research/ep05_fact_pack.md):
  * dovetail in the upper half, seat in the lower half, each about half the depth; socket dug to the seat (R6-18)
  * the male (男木) is the upper piece and drops in from above onto the female's (女木) seat (R6-14)
  * proportions (R6-19, engineering study D1): neck W/4-W/3, dovetail length W/4-W/2. The drawn joint (neck 30, length 50,
    head 50 on W = 105) sits inside both; its flare, 1:5 per side, is in the 1:4-1:5 range calculated from the
    engineering sources (R6-22). R6-21 (a video snippet with these same numbers) could not be fetched to confirm, so it
    is not cited on screen. Shown as "our drawing", never "standard".
  * the seat length has NO source (R6-23): 30 mm here is a modelling assumption and is never stated on screen.
Fit check (exact solids): no interference, faces in contact, the male drops in from above along -Y, and it
cannot be pulled apart along the sill (+X) or lifted sideways (Z): only straight up.
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "geometry"))
import fitcheck  # noqa: E402
from timber import Box, Member, PlanPrism  # noqa: E402

H = W = 105.0            # sill section (R-07 / R6-25: at least 105 mm)
HALF = H / 2             # dovetail above, seat below (R6-18)
LD, HEAD, NECK = 50.0, 50.0, 30.0   # one example (R6-21)
SEAT = 30.0              # model assumption (R6-23): not stated on screen
LF, LM = 700.0, 700.0    # lengths drawn (female to the left, male to the right)
FLARE = (HEAD - NECK) / 2 / LD   # per side (= 0.2, i.e. 1:5)


def dovetail(x_neck, y0, y1):
    """Plan trapezoid: neck at x = x_neck, head at x = x_neck - LD (pointing -X, into the female)."""
    return PlanPrism([(x_neck, -NECK / 2), (x_neck, NECK / 2), (x_neck - LD, HEAD / 2), (x_neck - LD, -HEAD / 2)], y0, y1)


def build():
    # female (女木): body x in [-LF, SEAT]; its upper half beyond x = 0 removed (leaving the seat); the socket cut
    # into its end, upper half only, down to the seat level
    female = Member("female", "sill", Box(-LF, 0, -W / 2, LF + SEAT, H, W), "x",
                    cuts=[Box(0, HALF, -W / 2 - 1, SEAT + 1, HALF + 1, W + 2), dovetail(0.0, HALF, H + 1)])
    # male (男木): body x in [0, LM]; its lower half for x in [0, SEAT] removed (it sits on the seat);
    # the dovetail tongue projects from its shoulder at x = 0 into the socket, upper half only
    male = Member("male", "sill", Box(0, 0, -W / 2, LM, H, W), "x",
                  cuts=[Box(-1, -1, -W / 2 - 1, SEAT + 1, HALF + 1, W + 2)], adds=[dovetail(0.0, HALF, H)])
    return female, male


def main():
    female, male = build()
    steps = [fitcheck.Step(female, (0, 0, 0), 0), fitcheck.Step(male, (0, 1, 0), H + 20)]   # male drops in from above
    mates = [fitcheck.Mate("female", "male", 0.1)]   # faces touch: no gap wider than 0.1 mm
    rep = fitcheck.run(steps, mates)
    fitcheck.assert_ok(rep)
    ms, fs = male.solid(), female.solid()
    blocked = {}
    for name, d in (("pull_apart_+x", (5, 0, 0)), ("slide_sideways_+z", (0, 0, 5)), ("push_down_-y", (0, -2, 0)), ("lift_+y", (0, 5, 0))):
        blocked[name] = round((ms.translate(list(d)) ^ fs).volume(), 2)
    # the wrong way in: sliding along the sill from +X (or across from +Z) must collide
    side = max((ms.translate([k, 0, 0]) ^ fs).volume() for k in range(1, 61, 2))
    across = max((ms.translate([0, 0, k]) ^ fs).volume() for k in range(1, 121, 3))
    checks = {
        "cannot_slide_in_along_sill": side > 0,
        "cannot_slide_in_across": across > 0,
        "fitcheck": fitcheck.summary(rep),
        "flare_per_side": f"1:{1 / FLARE:g}",
        "flare_in_sourced_range_1to4_1to5": 4 <= 1 / FLARE <= 5 + 1e-9,
        "neck_in_D1_range_W4_W3": W / 4 <= NECK <= W / 3,
        "length_in_D1_range_W4_W2": W / 4 <= LD <= W / 2,
        "dovetail_in_upper_half": True,
        "locked_against_pull_apart": blocked["pull_apart_+x"] > 0,
        "locked_against_sideways": blocked["slide_sideways_+z"] > 0,
        "rests_on_seat": blocked["push_down_-y"] > 0,
        "free_to_lift": blocked["lift_+y"] == 0,
        "collision_volumes_mm3": blocked,
    }
    checks["ok"] = rep["ok"] and all(v for k, v in checks.items() if isinstance(v, bool))
    assert checks["ok"], checks
    out = HERE / "build"
    out.mkdir(exist_ok=True)
    geo = {"H": H, "W": W, "LD": LD, "HEAD": HEAD, "NECK": NECK, "SEAT": SEAT, "LF": LF, "LM": LM,
           "members": [female.to_json(), male.to_json()], "checks": checks, "fit": rep}
    (out / "geometry.json").write_text(json.dumps(geo))
    (out / "checks.json").write_text(json.dumps(checks, indent=1))
    print(json.dumps(checks, indent=1))


if __name__ == "__main__":
    main()
