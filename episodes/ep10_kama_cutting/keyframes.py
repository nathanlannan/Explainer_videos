"""Frame numbers for stills: every study hold midpoint, plus a chosen moment in each shot."""
import json, pathlib, sys
tl = json.loads((pathlib.Path(__file__).parent / "build/timeline.json").read_text())
fr = []
for s in tl["shots"]:
    for a, b in s["holds"]:
        fr.append(round((s["start"] + (a + b) / 2) * 30))
    fr.append(round((s["start"] + 0.75 * (s["end"] - s["start"])) * 30))
print(",".join(map(str, sorted(set(fr)))))
