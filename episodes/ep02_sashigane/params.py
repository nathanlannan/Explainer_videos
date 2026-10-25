"""Episode 2 · Part 1 -- single source of truth: tool dimensions, scales, the log demo.

Run:  python3 params.py   -> build/geometry.json and build/checks.json
"""
import json
import math
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "geometry"))
import manifold3d as m3  # noqa: E402
from tools import ROOT2, FramingSquare, Sashigane, largest_square_in_circle, maru_reading, ura_reading  # noqa: E402

SQ = Sashigane()
FS = FramingSquare()
LOG_D = 300.0        # small-end diameter of the demo log (model choice: a round, easy number)
LOG_LEN = 1800.0     # model choice
BOARD = (600.0, 180.0)   # board for the squaring demo, length x width (model choice)
EXAMPLE_SIDE = 100.0      # Pythagoras example square side (model choice)
MARU_D = 200.0            # marume demo circle: must fit the 250 mm scaled short arm, where the marume sits (R2-12)


def checks():
    side = largest_square_in_circle(LOG_D)
    reading = ura_reading(LOG_D)
    # geometric proof with exact solids: the square fits inside the circle with corners on it,
    # and any larger square pokes out
    disk = m3.Manifold.cylinder(1.0, LOG_D / 2, LOG_D / 2, circular_segments=4096)
    def poke(s):
        sq = m3.Manifold.cube([s, s, 1.0]).translate([-s / 2, -s / 2, 0])
        return (sq - disk).volume()
    c = {
        "ura_reading_across_diameter": round(reading, 2),
        "largest_square_side": round(side, 2),
        "reading_equals_side": abs(reading - side) < 1e-9,
        "corner_radius": round(side / 2 * ROOT2, 4),
        "poke_out_at_side_mm3": round(poke(side - 0.05), 4),
        "poke_out_at_side_plus_1mm_mm3": round(poke(side + 1.0), 2),
        "maru_demo_diameter": MARU_D,
        "maru_reading_across_diameter": round(maru_reading(MARU_D), 1),
        "maru_fits_short_arm": MARU_D <= SQ.short_scale,
        "pythagoras_example_diagonal": round(EXAMPLE_SIDE * ROOT2, 2),
        "pythagoras_example_ura_reading": round(ura_reading(EXAMPLE_SIDE * ROOT2), 2),
    }
    c["ok"] = (c["reading_equals_side"] and c["poke_out_at_side_mm3"] < 0.01 and c["poke_out_at_side_plus_1mm_mm3"] > 1
               and abs(c["pythagoras_example_ura_reading"] - EXAMPLE_SIDE) < 1e-6 and c["maru_fits_short_arm"])
    return c


def main():
    out = HERE / "build"
    out.mkdir(exist_ok=True)
    c = checks()
    assert c["ok"], c
    (out / "checks.json").write_text(json.dumps(c, indent=1))
    geo = {"units": "mm", "sashigane": SQ.__dict__, "scales": SQ.scales(), "framing": FS.__dict__,
           "log_d": LOG_D, "log_len": LOG_LEN, "board": BOARD, "example_side": EXAMPLE_SIDE, "root2": ROOT2, "pi": math.pi, "checks": c}
    (out / "geometry.json").write_text(json.dumps(geo))
    print(json.dumps(c))


if __name__ == "__main__":
    main()
