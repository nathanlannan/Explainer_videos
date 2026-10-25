"""Scaffold a new episode folder from the Episode 2 pipeline scripts.

  python3 shared/tools/new_episode.py ep03_ink_and_gauges "Episode 2 · Part 2" "Ink Line, Pen and Gauges"

Copies synth/mix/captions/docs/qa/keyframes/finish/render_full with names substituted.
You then write: params.py, narration.json, storyboard.py, shots.js, and adapt TERMS in synth.py,
section names in docs.py, and the sync pairs / holds in qa.py.
"""
import pathlib
import re
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / "episodes/ep02_sashigane"
FILES = ["synth.py", "mix.py", "captions.py", "docs.py", "qa.py", "keyframes.py", "finish.sh", "render_full.sh"]


def main(slug, label, title):
    dst = ROOT / "episodes" / slug
    for d in ("build", "audio", "out", "gates"):
        (dst / d).mkdir(parents=True, exist_ok=True)
    for f in FILES:
        s = (SRC / f).read_text()
        s = s.replace("ep02_sashigane", slug).replace("ep02 ", slug.split("_")[0] + " ")
        s = s.replace("Episode 2 · Part 1 — The Marking Kit: The Sashigane", f"{label} — {title}")
        s = s.replace("Ep 2 · Part 1 · The Marking Kit: The Sashigane", f"{label} · {title}")
        s = s.replace("# Gate C: QA report, Episode 2 · Part 1", f"# Gate C: QA report, {label}")
        s = re.sub(r"^TERMS = \{.*\}$", "TERMS = {}  # TODO: romaji/respelling -> kana for this episode's terms", s, flags=re.M)
        (dst / f).write_text(s)
        if f.endswith(".sh"):
            (dst / f).chmod(0o755)
    print("scaffolded", dst)


if __name__ == "__main__":
    main(*sys.argv[1:4])
