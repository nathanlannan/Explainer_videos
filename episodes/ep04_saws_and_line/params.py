"""Episode 4 · Part 1 -- dimensions for the saw models and the line demos (mm).

Saw shapes are drawn to look like the tools and are NOT presented as dimensions on screen ("not to scale").
Tooth pitch is enlarged so the teeth read on screen. The tenoned member uses the 105 mm section (R-07).
Line demos: kerf = plate + set (R5-11); the three line choices (R5-12) are derived here from one rule set,
so the 2D panels and the 3D cold open agree on which side of the line the kerf falls.
leave: the kerf is all in the waste (whole line stays); take: the kerf's work-side edge is the line's work-side edge
(line removed); split: the kerf is centred on the line (墨をまたぐ, "straddle"). A centred kerf removes more than
"take" whenever the kerf is wider than the line, so the diagram draws the line wider than the kerf (a convention:
real lines and kerfs are both fractions of a millimetre) -- enforced by piece_size_order.
"""
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent

RYOBA = {"len": 240.0, "h_heel": 95.0, "h_toe": 120.0, "plate": 0.6, "neck": 60.0, "handle": 260.0, "handle_d": 30.0,
         "rip_pitch": 9.0, "cross_pitch": 4.5}                                  # illustrative; teeth enlarged
DOZUKI = {"len": 240.0, "h": 60.0, "plate": 0.3, "spine_h": 9.0, "spine_t": 3.0, "neck": 50.0, "handle": 230.0,
          "handle_d": 28.0, "cross_pitch": 3.5}                                 # illustrative
KATABA = {"len": 270.0, "h_heel": 80.0, "h_toe": 105.0, "plate": 0.6, "neck": 60.0, "handle": 260.0, "handle_d": 30.0,
          "cross_pitch": 4.5}                                                   # illustrative
BOARD = (600.0, 30.0, 180.0)        # cold open: length (x), thickness (y), width (z)
CUT_X = 420.0                       # marked line across the board (x of the line's centre)
LINE_W = 0.8                        # ink line width (sumisashi line, illustrative)
MEMBER = 105.0                      # tenoned member section (R-07)
TENON = {"t": 30.0, "w": 90.0, "len": 60.0}  # illustrative proportions, not stated on screen

# 2D line-choice diagram, in diagram units (enlarged): plate, set per side, line width
DIAG = {"plate": 4.0, "set": 2.0, "line": 12.0}   # line drawn wider than the kerf, so take < split < leave


def kerf(plate, set_each_side):
    return plate + 2 * set_each_side


def line_choice(choice, line_c, line_w, k, waste_side=+1):
    """Kerf interval [a, b] for a line centred at line_c; waste lies on waste_side (+1 = larger x)."""
    edge_work, edge_waste = line_c - waste_side * line_w / 2, line_c + waste_side * line_w / 2
    if choice == "leave":      # whole kerf in the waste, line survives on the piece
        a = edge_waste
    elif choice == "split":    # kerf centred on the line (straddle, 墨をまたぐ): a sliver of line stays on each side
        a = line_c - waste_side * k / 2
    elif choice == "take":     # kerf removes the line; kerf's work-side edge = line's work-side edge
        a = edge_work
    else:
        raise ValueError(choice)
    b = a + waste_side * k
    return sorted((a, b))


def main():
    k = kerf(DIAG["plate"], DIAG["set"])
    panels = {c: line_choice(c, 0.0, DIAG["line"], k) for c in ("take", "leave", "split")}
    piece_edge = {c: min(v) for c, v in panels.items()}  # piece is on the work side (smaller x)
    checks = {
        "kerf_wider_than_plate": k > DIAG["plate"],
        "leave_keeps_whole_line": panels["leave"][0] >= DIAG["line"] / 2,
        "take_leaves_no_line_on_piece": panels["take"][0] <= -DIAG["line"] / 2,
        "kerf_narrower_than_line": k < DIAG["line"],
        "split_is_centred_sliver_each_side": abs(sum(panels["split"])) < 1e-9 and panels["split"][0] > -DIAG["line"] / 2,
        "piece_size_order": piece_edge["take"] < piece_edge["split"] < piece_edge["leave"],
        "tenon_fits_member": TENON["t"] < MEMBER and TENON["w"] < MEMBER,
        "cold_open_kerf_in_waste": True,
    }
    # cold open: leave the line, waste at larger x
    ck = kerf(RYOBA["plate"], 0.25)
    co = line_choice("leave", CUT_X, LINE_W, ck)
    checks["cold_open_kerf_in_waste"] = co[0] >= CUT_X + LINE_W / 2
    checks["ok"] = all(checks.values())
    assert checks["ok"], checks
    out = HERE / "build"
    out.mkdir(exist_ok=True)
    geo = {"ryoba": RYOBA, "dozuki": DOZUKI, "kataba": KATABA, "board": BOARD, "cut_x": CUT_X, "line_w": LINE_W,
           "member": MEMBER, "tenon": TENON, "diag": DIAG, "kerf_diag": k, "panels": panels, "cold_open_kerf": co,
           "checks": checks}
    (out / "geometry.json").write_text(json.dumps(geo))
    (out / "checks.json").write_text(json.dumps(checks, indent=1))
    print(json.dumps(checks))


if __name__ == "__main__":
    main()
