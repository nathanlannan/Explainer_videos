"""Episode 3 -- the board plan grid and its banzuke addresses, tied to Episode 1's frame.

The frame (sill, 4 posts, 3 rails, beam) is Episode 1's fit-checked geometry, reused unchanged:
its posts stand at 910 mm centres on grid line 一, so they are い一, ろ一, は一, に一.
"""
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
EP1 = HERE.parents[0] / "ep01_story_stick" / "build" / "geometry.json"
SPACING = 910.0                       # grid every 3 shaku (R4-04 "usually")
IROHA = ["い", "ろ", "は", "に"]       # across (one common layout, R4-09)
NUMS = ["一", "二", "三"]              # counted down from the top
ROMAJI = {"い": "i", "ろ": "ro", "は": "ha", "に": "ni", "一": "ichi", "二": "ni", "三": "san"}


def main():
    ep1 = json.loads(EP1.read_text())
    posts = [(i, j) for j in range(len(NUMS)) for i in range(len(IROHA)) if i in (0, len(IROHA) - 1) or j in (0, len(NUMS) - 1)]
    addr = {f"{IROHA[i]}{NUMS[j]}": [i * SPACING, j * SPACING] for i, j in posts}
    # Episode 1's posts must sit exactly on line 一 at い..に
    assert [round(x) for x in ep1["x_posts"]] == [round(i * SPACING) for i in range(4)], "Ep1 posts are not on the 910 grid"
    out = HERE / "build"
    out.mkdir(exist_ok=True)
    checks = {"ep1_posts_on_grid_line_1": True, "post_addresses": list(addr), "ok": True}
    (out / "checks.json").write_text(json.dumps(checks, indent=1, ensure_ascii=False))
    (out / "geometry.json").write_text(json.dumps({"spacing": SPACING, "iroha": IROHA, "nums": NUMS, "romaji": ROMAJI, "posts": addr,
                                                    "frame": ep1, "checks": checks}, ensure_ascii=False))
    print(json.dumps(checks, ensure_ascii=False))


if __name__ == "__main__":
    main()
