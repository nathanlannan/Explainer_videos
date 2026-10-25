"""Episode 7 -- hozo (tenon) and hozo-ana (mortise): post into sill, two ways. Fit-checked exact solids.

Short tenon (R7-19, the howtec hardware-test standard, attributed on screen): 105 mm post and sill; tenon 30 thick x 85
wide x 50 deep, centred; mortise the same size (a snug fit: R7-23 "固く").
Long tenon + komisen (R7-20, lab specimens on 120 mm members, attributed; there is NO sourced 105 mm size, R7-21):
120 mm post and sill; tenon 30 x 90 x 117 (into a 120 mm sill); an 18 mm square pin (R7-34 square holes) through the
sill and tenon at sill mid-height. The draw (R7-31) is shown separately in 2D: here the holes are drawn aligned, as
they end up once the pin has pulled the joint home.
Axes: X along the sill, Y up, Z across the sill (toward the viewer). The sill's top is y = 0; the post stands on it.
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "geometry"))
import fitcheck  # noqa: E402
from timber import Box, Member  # noqa: E402

SHORT = {"S": 105.0, "T": 30.0, "W": 85.0, "D": 50.0, "post_len": 600.0, "sill_len": 700.0}
LONG = {"S": 120.0, "T": 30.0, "W": 90.0, "D": 117.0, "pin": 18.0, "post_len": 600.0, "sill_len": 700.0}


def joint(P, pin=None):
    S, T, W, D = P["S"], P["T"], P["W"], P["D"]
    # the tenon's width runs along the sill (X), its thickness across it (Z)
    sill = Member("sill", "sill", Box(-P["sill_len"] / 2, -S, -S / 2, P["sill_len"], S, S), "x",
                  cuts=[Box(-W / 2, -D, -T / 2, W, D + 1, T)])
    post = Member("post", "post", Box(-S / 2, 0, -S / 2, S, P["post_len"], S), "y",
                  adds=[Box(-W / 2, -D, -T / 2, W, D, T)])
    parts = [sill, post]
    if pin:
        y = -S / 2                                           # sill mid-height
        hole = Box(-pin / 2, y - pin / 2, -S / 2 - 1, pin, pin, S + 2)
        sill.cuts.append(hole); post.cuts.append(hole)
        peg = Member("pin", "pin", Box(-pin / 2, y - pin / 2, -S / 2 - 6, pin, pin, S + 12), "z")
        parts.append(peg)
    return parts


def check(parts, pin):
    steps = [fitcheck.Step(parts[0], (0, 0, 0), 0), fitcheck.Step(parts[1], (0, 1, 0), 200)]
    mates = [fitcheck.Mate("sill", "post", 0.1)]
    if pin:
        steps.append(fitcheck.Step(parts[2], (0, 0, 1), 200)); mates.append(fitcheck.Mate("pin", "post", 0.1))
    rep = fitcheck.run(steps, mates)
    fitcheck.assert_ok(rep)
    return rep


def main():
    out = HERE / "build"; out.mkdir(exist_ok=True)
    short, long_ = joint(SHORT), joint(LONG, pin=LONG["pin"])
    r1, r2 = check(short, False), check(long_, True)
    sp, ss = short[1].solid(), short[0].solid()
    lp, ls, pg = long_[1].solid(), long_[0].solid(), long_[2].solid()
    checks = {
        "short_fit": fitcheck.summary(r1), "long_fit": fitcheck.summary(r2),
        "short_tenon_is_short": SHORT["D"] < SHORT["S"] / 2 + 1e-9,
        "long_tenon_most_of_sill": LONG["D"] / LONG["S"] > 0.9,
        "long_tenon_stays_inside_sill": LONG["D"] < LONG["S"],
        "pin_locks_post_against_lift": (lp.translate([0, 5, 0]) ^ pg).volume() > 0,
        "short_post_free_to_lift": (sp.translate([0, 5, 0]) ^ ss).volume() == 0,
        "tenon_ratio_short": round(SHORT["T"] / SHORT["S"], 3), "tenon_ratio_long": round(LONG["T"] / LONG["S"], 3),
    }
    checks["ok"] = r1["ok"] and r2["ok"] and all(v for k, v in checks.items() if isinstance(v, bool))
    assert checks["ok"], checks
    geo = {"SHORT": SHORT, "LONG": LONG, "short": [m.to_json() for m in short], "long": [m.to_json() for m in long_], "checks": checks}
    (out / "geometry.json").write_text(json.dumps(geo))
    (out / "checks.json").write_text(json.dumps(checks, indent=1))
    print(json.dumps(checks, indent=1))


if __name__ == "__main__":
    main()
