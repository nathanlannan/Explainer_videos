"""Episode 8 -- watari-ago (crossing joint) and, for comparison, aigaki (half-lap). Fit-checked exact solids.

Watari-ago (R8-11, R8-33: KN 「上の木の下に溝を作り、下の木の中ほどを残して左右を削りとって両材を組み合わせる」):
the lower timber (along X) is cut down at both edges inside the crossing zone, leaving its middle standing as a ridge;
the upper timber (along Z) has a groove across its underside that takes the ridge. No spec gives depths (R8-23), so the
depths here are illustrative and say so on screen. Sizes are generic (105 x 120 lower, 105 x 180 upper).
Aigaki (R8-04, R8-13): two 105 mm timbers, each cut to half depth, tops flush.
Axes: X along the lower timber, Y up, Z along the upper timber. The lower timber's top is y = 0.
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "geometry"))
import fitcheck  # noqa: E402
from timber import Box, Member  # noqa: E402

WA = {"W": 105.0, "H_low": 120.0, "H_up": 180.0, "CUT": 15.0, "RIDGE": 35.0, "len": 700.0}
AI = {"S": 105.0, "len": 700.0}


def watari(P):
    W, HL, HU, C, R, Ln = P["W"], P["H_low"], P["H_up"], P["CUT"], P["RIDGE"], P["len"]
    e = (W - R) / 2                                          # width of each cut-away edge strip
    low = Member("lower", "beam", Box(-Ln / 2, -HL, -W / 2, Ln, HL, W), "x",
                 cuts=[Box(-W / 2, -C, -W / 2 - 1, W, C + 1, e + 1), Box(-W / 2, -C, R / 2, W, C + 1, e + 1)])
    up = Member("upper", "beam", Box(-W / 2, -C, -Ln / 2, W, HU, Ln), "z",
                cuts=[Box(-W / 2 - 1, -C - 1, -R / 2, W + 2, C + 1, R)])
    return [low, up]


def aigaki(P):
    S, Ln = P["S"], P["len"]
    a = Member("a", "beam", Box(-Ln / 2, -S, -S / 2, Ln, S, S), "x", cuts=[Box(-S / 2, -S / 2, -S / 2 - 1, S, S / 2 + 1, S + 2)])
    b = Member("b", "beam", Box(-S / 2, -S, -Ln / 2, S, S, Ln), "z", cuts=[Box(-S / 2 - 1, -S - 1, -S / 2, S + 2, S / 2 + 1, S)])
    return [a, b]


def check(parts, names):
    steps = [fitcheck.Step(parts[0], (0, 0, 0), 0), fitcheck.Step(parts[1], (0, 1, 0), 250)]
    rep = fitcheck.run(steps, [fitcheck.Mate(*names, 0.1)])
    fitcheck.assert_ok(rep)
    return rep


def main():
    out = HERE / "build"; out.mkdir(exist_ok=True)
    w, a = watari(WA), aigaki(AI)
    r1, r2 = check(w, ("lower", "upper")), check(a, ("a", "b"))
    lo, up = w[0].solid(), w[1].solid()
    hit = lambda d: (up.translate(d) ^ lo).volume() > 0
    bb = lambda m: m.bounding_box()
    checks = {
        "watari_fit": fitcheck.summary(r1), "aigaki_fit": fitcheck.summary(r2),
        "locked_along_lower_+x": hit([3, 0, 0]), "locked_along_lower_-x": hit([-3, 0, 0]),
        "locked_along_upper_+z": hit([0, 0, 3]), "locked_along_upper_-z": hit([0, 0, -3]),
        "free_to_lift": not hit([0, 3, 0]),
        "cuts_shallow": WA["CUT"] / WA["H_low"] < 0.25 and WA["CUT"] / WA["H_up"] < 0.25,
        "different_heights": abs(bb(up)[4] - bb(lo)[4]) > 1,                   # tops not flush
        "aigaki_tops_flush": abs(bb(a[0].solid())[4] - bb(a[1].solid())[4]) < 1e-6,
        "aigaki_half_depth": all(abs(m.body.solid().volume() - m.solid().volume() - AI["S"] ** 3 / 2) < 1 for m in a),
        "upper_volume_removed_mm3": round(w[1].body.solid().volume() - up.volume()),
        "lower_volume_removed_mm3": round(w[0].body.solid().volume() - lo.volume()),
    }
    checks["ok"] = r1["ok"] and r2["ok"] and all(v for k, v in checks.items() if isinstance(v, bool))
    assert checks["ok"], checks
    geo = {"WA": WA, "AI": AI, "watari": [m.to_json() for m in w], "aigaki": [m.to_json() for m in a], "checks": checks}
    (out / "geometry.json").write_text(json.dumps(geo))
    (out / "checks.json").write_text(json.dumps(checks, indent=1))
    print(json.dumps(checks, indent=1))


if __name__ == "__main__":
    main()
