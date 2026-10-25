"""Episode 2 · Part 2 -- dimensions for the tool models and demos (mm).

Sourced: ink pot about 240 mm long (R3-03, mid of the 180/240/300 sizes); sashigane from JIS (R2-03/04).
Everything else is a model choice for illustration and is NOT presented on screen as a dimension:
pen, gauge and knife proportions are drawn to look like the tools, and no sizes are stated for them.
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "geometry"))
from tools import Sashigane  # noqa: E402

TIMBER = (3000.0, 105.0, 105.0)       # snapped beam: length, width, height (model choice; 105 mm section R-07)
LINE_Z = 0.0                          # line runs down the centre of the top face
POT = {"len": 240.0, "w": 70.0, "h": 75.0, "reel_r": 32.0, "ike_len": 80.0}   # pot length sourced; rest illustrative
PEN = {"len": 190.0, "w": 14.0, "t": 3.0, "slant": 18.0, "slits": 9}          # illustrative
GAUGE = {"fence": (25.0, 70.0, 60.0), "beam": (220.0, 12.0, 10.0), "setting": 30.0}  # illustrative; setting = gauged distance
KNIFE = {"len": 170.0, "w": 18.0, "t": 4.0, "bevel_len": 12.0}                 # illustrative
BOARD = (600.0, 30.0, 180.0)          # length (x), thickness (y), width (z): squaring and gauge demos
SQ = Sashigane()


def main():
    out = HERE / "build"
    out.mkdir(exist_ok=True)
    checks = {
        "snap_line_endpoints": [[0.0, TIMBER[1], LINE_Z], [TIMBER[0], TIMBER[1], LINE_Z]],
        "gauge_line_offset_mm": GAUGE["setting"],
        "gauge_line_inside_board": 0 < GAUGE["setting"] < BOARD[2],
        "square_arm_longer_than_board_width": SQ.long_scale > BOARD[2],
    }
    checks["ok"] = checks["gauge_line_inside_board"] and checks["square_arm_longer_than_board_width"]
    assert checks["ok"], checks
    geo = {"timber": TIMBER, "pot": POT, "pen": PEN, "gauge": GAUGE, "knife": KNIFE, "board": BOARD,
           "sashigane": SQ.__dict__, "scales": SQ.scales(), "checks": checks}
    (out / "geometry.json").write_text(json.dumps(geo))
    (out / "checks.json").write_text(json.dumps(checks, indent=1))
    print(json.dumps(checks))


if __name__ == "__main__":
    main()
