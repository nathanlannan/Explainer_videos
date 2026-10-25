"""Episode 12 -- cutting the okkake daisen-tsugi's lower piece (下木), in the training course's stages. Exact solids.

The finished piece is Episode 11's lower piece (same sizes: one lab's test proportions, W 120, H 180, splice 360;
ago 15 mm, mechigai 15 x 15, ago face sloped 1/20 of the depth). The stages follow W t0821-t0826 (R11-54), with the
Gate A reading of the drawings (plan.md):
  L0 blank (with a 25 mm end slice, removed by the end cut)
  L1 peg holes started: 15 x 15, from the side face that stays whole (z = -W/2), about W/4 deep
  L2 the outer block from the slope to the tip: {x in [L/2, L+F], z in [e, W/2]}
  L3 the outer layer from the shoulder to the slope: {x in [0, L/2], z in [e, W/2]}
  L4 the center strip back to the shoulder, to the sloped line: {x in [0, xs(y)], |z| <= e}
  L5 housing {x in [-F, 0], |z| < e}; tongue waste {x in [L, L+F], z in [-W/2, -e]}; peg holes completed
L5 is checked equal to Episode 11's lower piece.
"""
import importlib.util
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "geometry"))
from timber import Box, Hull, Member  # noqa: E402

spec = importlib.util.spec_from_file_location("ep11", HERE.parents[0] / "ep11_okkake" / "params.py")
ep11 = importlib.util.module_from_spec(spec); spec.loader.exec_module(ep11)
W, H, L, E, F, PEG, LL = ep11.W, ep11.H, ep11.L, ep11.E, ep11.F, ep11.PEG, ep11.LL
e = E / 2
SLICE = 25.0


def strip():
    """The center strip near the shoulder, |z| <= e, from x = 0 to the sloped face xs(y)."""
    pts = [(0.0, y, z) for y in (-1.0, H + 1) for z in (-e, e)] + [(ep11.xs(y), y, z) for y in (-1.0, H + 1) for z in (-e, e)]
    return Hull(pts)


def holes(full):
    out = []
    for x in (L / 4, 3 * L / 4):
        z0 = -W / 2 - 1
        z1 = (-e if x < L / 2 else e) if full else -W / 4
        out.append(Box(x - PEG / 2, H / 2 - PEG / 2, z0, PEG, PEG, z1 - z0))
    return out


def states():
    blank = Box(-LL, 0, -W / 2, LL + L + F + SLICE, H, W)
    endcut = Box(L + F, -1, -W / 2 - 1, SLICE + 1, H + 2, W + 2)
    a = Box(L / 2, -1, e, L / 2 + F + 1, H + 2, W / 2 - e + 1)
    b = Box(0, -1, e, L / 2, H + 2, W / 2 - e + 1)
    housing = Box(-F, -1, -e, F, H + 2, E)
    tongue = Box(L, -1, -W / 2 - 1, F + 1, H + 2, W / 2 - e + 1)
    cuts = [[], [endcut], [endcut] + holes(False), [endcut, a] + holes(False), [endcut, a, b] + holes(False),
            [endcut, a, b, strip()] + holes(False), [endcut, a, b, strip(), housing, tongue] + holes(True)]
    return [Member(f"L{i}", "beam", blank, "x", cuts=c) for i, c in enumerate(cuts)]


def main():
    st = states()
    fin = st[-1].solid()
    ref = ep11.build(pegs=True)[0].solid()
    diff = (fin - ref).volume() + (ref - fin).volume()
    vols = [round(m.solid().volume()) for m in st]
    checks = {
        "final_equals_ep11_lower_mm3_diff": round(diff, 2),
        "final_equals_ep11_lower": diff < 5.0,
        "each_stage_removes_wood": all(vols[i + 1] < vols[i] for i in range(len(vols) - 1)),
        "stage_volumes_mm3": vols,
    }
    checks["ok"] = checks["final_equals_ep11_lower"] and checks["each_stage_removes_wood"]
    assert checks["ok"], checks
    out = HERE / "build"; out.mkdir(exist_ok=True)
    up = ep11.build(pegs=True)
    geo = {"W": W, "H": H, "L": L, "E": E, "F": F, "PEG": PEG, "SLOPE": ep11.SLOPE, "LL": LL, "SLICE": SLICE,
           "states": [m.to_json() for m in st], "upper": up[1].to_json(), "pegs": [p.to_json() for p in up[2]], "checks": checks}
    (out / "geometry.json").write_text(json.dumps(geo))
    (out / "checks.json").write_text(json.dumps(checks, indent=1))
    print(json.dumps(checks, indent=1))


if __name__ == "__main__":
    main()
