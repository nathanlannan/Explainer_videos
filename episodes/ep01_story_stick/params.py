"""Episode 1 -- single source of truth for every dimension and mark.

Every value below is in mm; sources are research-table IDs (research/research_table.md)
or 'model choice' (a simplification for teaching, stated in decisions.md).

Run:  python3 params.py   -> writes build/geometry.json and build/fitcheck.json
"""
from __future__ import annotations

import json
import pathlib
import random
import sys

HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "shared" / "geometry"))

import fitcheck  # noqa: E402
from timber import Box, Member, mm_in  # noqa: E402

# --- sections -----------------------------------------------------------------
POST = 105.0          # square post section; R-07 (105 mm = 3.5 sun, the common house post)
SILL_W = 105.0        # sill section = post section; R-07
SILL_H = 105.0
BEAM_W = 105.0        # beam width matches the wall (model choice)
BEAM_H = 150.0        # model choice (a modest beam depth for the small frame)
RAIL_H = 90.0         # model choice
RAIL_D = POST         # rail is full wall depth so its housings run through (model choice)
SPACING = 910.0       # post spacing centre-to-centre, 3 shaku module; R-15
N_POSTS = 4
POST_LEN = 2700.0     # overall post length (model choice, cut from 3 m stock; R-07)
HOUSING = 15.0        # depth of every simple housing (model choice)
CLEAR = 0.5           # total width clearance designed into every housing (model choice)
OVERHANG = 200.0      # sill/beam run past the outer post centres (model choice)

STICK_W, STICK_T = 45.0, 15.0   # story stick batten section (model choice)

# --- THE mark list ------------------------------------------------------------
# Positions measured from the post's bottom end (its reference end).
# The story stick, the marks on every post, and the frame's joint locations are
# all generated from this one list.
RAIL_BOTTOM = 1000.0  # model choice
MARKS = [
    # (id, position_mm, stick note, plain meaning)
    ("end_bottom", 0.0, "BOTTOM", "bottom end of the post"),
    ("sill_top", HOUSING, "SILL", "top of the sill: the post seats into it below this line"),
    ("rail_bottom", RAIL_BOTTOM, "RAIL", "underside of the rail"),
    ("rail_top", RAIL_BOTTOM + RAIL_H, "RAIL", "top of the rail"),
    ("beam_under", POST_LEN - HOUSING, "BEAM", "underside of the beam: the post seats into it above this line"),
    ("end_top", POST_LEN, "TOP", "top end of the post"),
]
MARK = {m[0]: m[1] for m in MARKS}

# --- tape comparison ------------------------------------------------------------
TAPE_ERR = 1.0        # each tape reading off by up to +-1 mm (uniform), a stated assumption
TAPE_SEED = 7
EXAGGERATE = 20       # drift drawn x20 on screen and labelled so


def tape_positions():
    """Each post laid out by chaining tape readings mark-to-mark from the bottom end.
    Reading k is the true segment plus an independent error in [-TAPE_ERR, +TAPE_ERR]."""
    rng = random.Random(TAPE_SEED)
    out = []
    for _ in range(N_POSTS):
        pos, acc = [0.0], 0.0
        for k in range(1, len(MARKS)):
            seg = MARKS[k][1] - MARKS[k - 1][1]
            acc += seg + rng.uniform(-TAPE_ERR, TAPE_ERR)
            pos.append(round(acc, 3))
        out.append(pos)
    return out


# --- frame geometry (all from MARKS) ----------------------------------------------
X_POSTS = [i * SPACING for i in range(N_POSTS)]
Y_POST0 = SILL_H - MARK["sill_top"]                 # post bottom sits in the sill housing
X0, X1 = X_POSTS[0] - OVERHANG, X_POSTS[-1] + OVERHANG
H = (POST + CLEAR) / 2                              # half housing width


def build():
    sill = Member("sill", "sill", Box(X0, 0, -SILL_W / 2, X1 - X0, SILL_H, SILL_W), "x",
                  [Box(x - H, SILL_H - HOUSING, -SILL_W, 2 * H, HOUSING + 1, 2 * SILL_W) for x in X_POSTS])
    y_beam = Y_POST0 + MARK["beam_under"]
    beam = Member("beam", "beam", Box(X0, y_beam - 0.0, -BEAM_W / 2, X1 - X0, BEAM_H, BEAM_W), "x",
                  [Box(x - H, y_beam - 1, -BEAM_W, 2 * H, HOUSING + 1, 2 * BEAM_W) for x in X_POSTS])
    posts, rails = [], []
    y_r = Y_POST0 + MARK["rail_bottom"]
    rh = (RAIL_H + CLEAR) / 2
    yc = y_r + RAIL_H / 2
    for i, x in enumerate(X_POSTS):
        cuts = []
        if i > 0:
            cuts.append(Box(x - POST / 2 - 1, yc - rh, -POST, HOUSING + 1, 2 * rh, 2 * POST))
        if i < N_POSTS - 1:
            cuts.append(Box(x + POST / 2 - HOUSING, yc - rh, -POST, HOUSING + 1, 2 * rh, 2 * POST))
        posts.append(Member(f"post{i + 1}", "post", Box(x - POST / 2, Y_POST0, -POST / 2, POST, POST_LEN, POST), "y", cuts))
    for i in range(N_POSTS - 1):
        xa = X_POSTS[i] + POST / 2 - HOUSING + CLEAR / 2
        xb = X_POSTS[i + 1] - POST / 2 + HOUSING - CLEAR / 2
        rails.append(Member(f"rail{i + 1}", "rail", Box(xa, y_r, -RAIL_D / 2, xb - xa, RAIL_H, RAIL_D), "x"))
    stick = Member("stick", "stick", Box(0, 0, 0, STICK_W, POST_LEN, STICK_T), "y")
    return sill, posts, rails, beam, stick


def main():
    sill, posts, rails, beam, stick = build()
    steps = ([fitcheck.Step(sill, (0, 1, 0), 0)]
             + [fitcheck.Step(p, (0, 1, 0), 400) for p in posts]
             + [fitcheck.Step(r, (0, 0, 1), 400) for r in rails]
             + [fitcheck.Step(beam, (0, 1, 0), 400)])
    mates = ([fitcheck.Mate(p.name, "sill", CLEAR) for p in posts]
             + [fitcheck.Mate(p.name, "beam", CLEAR) for p in posts]
             + [fitcheck.Mate(r.name, posts[i].name, CLEAR) for i, r in enumerate(rails)]
             + [fitcheck.Mate(r.name, posts[i + 1].name, CLEAR) for i, r in enumerate(rails)])
    rep = fitcheck.run(steps, mates)
    out = HERE / "build"
    out.mkdir(exist_ok=True)
    (out / "fitcheck.json").write_text(json.dumps(rep, indent=1))
    print(fitcheck.summary(rep))
    fitcheck.assert_ok(rep)

    # marks on each post == marks on the stick, by construction (same list); verify anyway
    tape = tape_positions()
    geo = {
        "units": "mm",
        "params": {k: v for k, v in globals().items() if k.isupper() and isinstance(v, (int, float))},
        "marks": [{"id": m[0], "pos": m[1], "note": m[2], "meaning": m[3]} for m in MARKS],
        "stick_marks": [m[1] for m in MARKS],
        "post_marks": [[m[1] for m in MARKS] for _ in posts],
        "tape_marks": tape,
        "x_posts": X_POSTS, "y_post0": Y_POST0,
        "members": [m.to_json() for m in [sill, *posts, *rails, beam, stick]],
    }
    assert all(pm == geo["stick_marks"] for pm in geo["post_marks"])
    (out / "geometry.json").write_text(json.dumps(geo))
    for i, t in enumerate(tape):
        drift = [round(a - b, 2) for a, b in zip(t, geo["stick_marks"])]
        print(f"tape post{i + 1} drift mm:", drift)
    print("post", mm_in(POST), "| length", mm_in(POST_LEN), "| spacing", mm_in(SPACING))


if __name__ == "__main__":
    main()
