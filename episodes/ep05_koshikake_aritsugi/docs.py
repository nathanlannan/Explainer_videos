"""Generate script.md and storyboard.md from narration.json + timeline.json (so they can't drift)."""
import json, pathlib
HERE = pathlib.Path(__file__).resolve().parent
tl = json.loads((HERE / "build/timeline.json").read_text())
fmt = lambda x: f"{int(x // 60)}:{x % 60:04.1f}"
narr = {n["id"]: n for n in tl["narration"]}
sec = {1: "Cold open", 2: "A splice: tsugite", 3: "Where it goes", 4: "The parts", 5: "How it goes together", 6: "Proportions", 7: "Limits", 8: "Next time", 9: "Recap"}
lines = json.loads((HERE / "narration.json").read_text())["lines"]
out = ["# Episode 5 — The First Joint: Koshikake Ari-tsugi · final script", "",
       f"Runtime {fmt(tl['total'])} · {sum(len(l['text'].split()) for l in lines)} words · timestamps are narration start–end in the final cut.", ""]
cur = None
for l in lines:
    if l["section"] != cur:
        cur = l["section"]; out += ["", f"## {cur}. {sec[cur]}", ""]
    n = narr[l["id"]]
    out.append(f"**{fmt(n['start'])}–{fmt(n['end'])}** ({l['id']}) {l['text']}")
    out.append("")
out += ["", "## Study holds (no narration, camera still)", ""]
for s in tl["shots"]:
    for a, b in s["holds"]:
        out.append(f"- {fmt(s['start'] + a)}–{fmt(s['start'] + b)} ({b - a:.1f} s) · {s['id']} {s['title']}")
(HERE / "script.md").write_text("\n".join(out) + "\n")
sb = [out[0].replace(" · final script", " · storyboard (as built)"), "", "| Shot | Time | Dur | Camera | On screen | Narration |", "|---|---|---|---|---|---|"]
for s in tl["shots"]:
    nar = " ".join(narr[k]["text"] for k in s["lines"]) or "—"
    sb.append(f"| {s['id']} {s['title']} | {fmt(s['start'])} | {s['end'] - s['start']:.1f} s | {s['preset']} | {s['onscreen']}{' Study hold ' + ', '.join(f'{b - a:.1f} s' for a, b in s['holds']) + '.' if s['holds'] else ''} | {nar} |")
(HERE / "storyboard.md").write_text("\n".join(sb) + "\n")
print("ok")
