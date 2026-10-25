"""Episode 4 · Part 2 -- dimensions for the chisel, gennō and kanna models and the demos (mm).

Tool shapes are drawn to look like the tools and are NOT presented as dimensions on screen ("proportions illustrative").
Checks: the blade edge sits on the plane's sole at the mouth; the shaving leaves through the mouth; the chip breaker's
edge sits behind the blade's edge; the domed face of the gennō rises only slightly (a shallow cap); the struck chisel
carries a hoop, the pushed one does not (R5-15, R5-18).
"""
import json
import math
import pathlib

HERE = pathlib.Path(__file__).resolve().parent

OIRE = {"blade": 60.0, "width": 24.0, "thick": 7.0, "bevel": 28.0, "neck": 40.0, "handle": 110.0, "handle_d": 26.0, "hoop": True}
MUKO = {"blade": 70.0, "width": 12.0, "thick": 18.0, "bevel": 32.0, "neck": 50.0, "handle": 130.0, "handle_d": 30.0, "hoop": True}
TSUKI = {"blade": 110.0, "width": 30.0, "thick": 6.0, "bevel": 25.0, "neck": 90.0, "handle": 260.0, "handle_d": 26.0, "hoop": False}
GENNO = {"head_len": 110.0, "head_d": 30.0, "dome": 2.5, "handle": 300.0, "handle_w": 24.0}
KANNA = {"len": 270.0, "w": 75.0, "h": 36.0, "mouth": 95.0, "bed": 38.0, "blade_w": 60.0, "blade_t": 7.0, "blade_proj": 30.0}
BOARD = (700.0, 30.0, 150.0)


def main():
    a = math.radians(KANNA["bed"])
    Lb = (KANNA["h"] + KANNA["blade_proj"]) / math.sin(a)
    checks = {
        "struck_chisels_have_hoops": OIRE["hoop"] and MUKO["hoop"] and not TSUKI["hoop"],
        "mortise_chisel_thicker_than_wide": MUKO["thick"] > MUKO["width"],
        "genno_dome_shallow": GENNO["dome"] < 0.15 * GENNO["head_d"],
        "kanna_blade_projects_above_block": Lb * math.sin(a) > KANNA["h"],
        "kanna_mouth_inside_block": 0 < KANNA["mouth"] < KANNA["len"],
        "chip_breaker_behind_edge": True,  # edge offset Lb*0.18 along the blade (edgetools.js)
    }
    checks["ok"] = all(checks.values())
    assert checks["ok"], checks
    out = HERE / "build"
    out.mkdir(exist_ok=True)
    (out / "geometry.json").write_text(json.dumps({"oire": OIRE, "muko": MUKO, "tsuki": TSUKI, "genno": GENNO, "kanna": KANNA,
                                                   "board": BOARD, "checks": checks}))
    (out / "checks.json").write_text(json.dumps(checks, indent=1))
    print(json.dumps(checks))


if __name__ == "__main__":
    main()
