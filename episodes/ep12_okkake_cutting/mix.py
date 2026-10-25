"""Episode 12 audio: mix narration + SFX + music from build/timeline.json.

  python3 mix.py                 -> build/mix.wav (full episode)
  python3 mix.py 186.0 206.0 out.wav   -> a section (used for the test sequence)
"""
import json, pathlib, subprocess, sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "shared/audio/tools"))
import mixer  # noqa: E402

tl = json.loads((HERE / "build/timeline.json").read_text())
bed = ROOT / f"shared/audio/music/bed_{int(tl['total']) + 2}.wav"
if not bed.exists():
    subprocess.run([sys.executable, str(ROOT / "shared/audio/music/make_bed.py"), str(int(tl["total"]) + 2)], check=True)
t0 = float(sys.argv[1]) if len(sys.argv) > 1 else 0.0
t1 = float(sys.argv[2]) if len(sys.argv) > 2 else None
out = pathlib.Path(sys.argv[3]) if len(sys.argv) > 3 else HERE / "build/mix.wav"
rep = mixer.mix(HERE / "build/timeline.json", HERE / "audio", bed, out, t0, t1)
print(json.dumps(rep))
(out.with_suffix(".loudness.json")).write_text(json.dumps(rep, indent=1))
