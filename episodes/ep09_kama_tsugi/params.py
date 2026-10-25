"""Episode 9 -- the koshikake kama-tsugi (腰掛け鎌継ぎ), a seated "gooseneck" splice, drawn on 120 mm members.

Sources (research/ep09_fact_pack.md):
  * head and socket in about the upper half, seat in the lower half (R9-16); the male (男木) is the upper piece and
    drops in from above onto the female's (女木) seat (R9-14, R9-17)
  * a narrow neck, then a head flared at the neck end (R9-13, R9-15)
  * sizes are ONE TEST SERIES' specimen geometry on 120 mm members (R9-46, D3/T): neck b = 30, head + neck L = 150
    (each L/2), flare e = 7.5 per side, head height h/2, seat projecting 15 beyond the shoulder. No carpentry source
    gives standard sizes (R9-47), so these are tagged on screen as test-specimen values, never "standard".
  * they sit inside the engineering applicability range (R9-45): L = 1.15W-1.75W, b = W/4-W/3, e = L/15-L/20.
  * the head is widest at its back (the 'jaw', NECK + 2E = 45) and narrows to a flat tip about the neck's width, read
    from the D3 specimen drawing (Gate A measurement, not dimensioned there). The 1/10 bearing slope and the entry
    taper (R9-20, R9-21) are omitted; on screen: "1/10 slope and entry taper omitted".
Fit check (exact solids): no interference, faces in contact, the male drops in along -Y, cannot be pulled apart
along the timber (+X) or slid sideways (Z), rests on the seat, and is free to lift.
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "geometry"))
import fitcheck  # noqa: E402
from timber import Box, Member, PlanPrism  # noqa: E402

H = W = 120.0
HALF = H / 2
L, NECK, E = 150.0, 30.0, 7.5        # R9-46 (test specimens)
TIP = 30.0                           # head width at its tip, read from the D3 specimen drawing (not dimensioned)
SEAT = 15.0                          # R9-46 (D3 drawing), single-source
LF, LM = 700.0, 700.0


def kama(y0, y1):
    """Plan outline, pointing -X from the male's shoulder at x = 0: neck (L/2), then the head (L/2) flaring out at its
    back (the 'jaw') and narrowing toward the tip."""
    n, j, t, h = NECK / 2, NECK / 2 + E, TIP / 2, L / 2
    return PlanPrism([(0, -n), (0, n), (-h, n), (-h, j), (-L, t), (-L, -t), (-h, -j), (-h, -n)], y0, y1)


def build():
    female = Member("female", "beam", Box(-LF, 0, -W / 2, LF + SEAT, H, W), "x",
                    cuts=[Box(0, HALF, -W / 2 - 1, SEAT + 1, HALF + 1, W + 2), kama(HALF, H + 1)])
    male = Member("male", "beam", Box(0, 0, -W / 2, LM, H, W), "x",
                  cuts=[Box(-1, -1, -W / 2 - 1, SEAT + 1, HALF + 1, W + 2)], adds=[kama(HALF, H)])
    return female, male


def main():
    female, male = build()
    rep = fitcheck.run([fitcheck.Step(female, (0, 0, 0), 0), fitcheck.Step(male, (0, 1, 0), H + 20)],
                       [fitcheck.Mate("female", "male", 0.1)])
    fitcheck.assert_ok(rep)
    ms, fs = male.solid(), female.solid()
    hit = lambda d: round((ms.translate(list(d)) ^ fs).volume(), 2)
    blocked = {"pull_apart_+x": hit((5, 0, 0)), "slide_sideways_+z": hit((0, 0, 5)), "push_down_-y": hit((0, -2, 0)), "lift_+y": hit((0, 5, 0))}
    side = max(hit((k, 0, 0)) for k in range(1, 161, 3))
    checks = {
        "fitcheck": fitcheck.summary(rep),
        "cannot_slide_in_along": side > 0,
        "locked_against_pull_apart": blocked["pull_apart_+x"] > 0,
        "locked_against_sideways": blocked["slide_sideways_+z"] > 0,
        "rests_on_seat": blocked["push_down_-y"] > 0,
        "free_to_lift": blocked["lift_+y"] == 0,
        "L_in_D3_range_1.15W_1.75W": 1.15 * W <= L <= 1.75 * W,
        "neck_in_D3_range_W4_W3": W / 4 <= NECK <= W / 3,
        "flare_in_D3_range_L20_L15": L / 20 <= E <= L / 15,
        "head_wider_than_neck": NECK + 2 * E > NECK and TIP < NECK + 2 * E,
        "collision_volumes_mm3": blocked,
    }
    checks["ok"] = rep["ok"] and all(v for k, v in checks.items() if isinstance(v, bool))
    assert checks["ok"], checks
    geo = {"H": H, "W": W, "L": L, "NECK": NECK, "E": E, "TIP": TIP, "SEAT": SEAT, "LF": LF, "LM": LM,
           "members": [female.to_json(), male.to_json()], "checks": checks}
    (HERE / "build" / "geometry.json").write_text(json.dumps(geo))
    (HERE / "build" / "checks.json").write_text(json.dumps(checks, indent=1))
    print(json.dumps(checks, indent=1))


if __name__ == "__main__":
    main()
