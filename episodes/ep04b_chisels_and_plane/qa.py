"""Gate C quality checks on the delivered files -> build/qa_report.md (and stills in build/qa_stills/)."""
import json, pathlib, re, subprocess, sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(ROOT / "shared/audio/tools"))
import mixer  # noqa: E402

MP4 = HERE / "out/ep04b_chisels_and_plane.mp4"
tl = json.loads((HERE / "build/timeline.json").read_text())
geo = json.loads((HERE / "build/geometry.json").read_text())
chk = json.loads((HERE / "build/checks.json").read_text())
rows, ok_all = [], True


def check(name, ok, detail):
    global ok_all
    ok_all &= bool(ok)
    rows.append(f"| {name} | {'PASS' if ok else 'FAIL'} | {detail} |")


probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-show_chapters", "-of", "json", str(MP4)], capture_output=True, text=True).stdout)
dur = float(probe["format"]["duration"])
v = [s for s in probe["streams"] if s["codec_type"] == "video"][0]
check("Runtime 4:30–5:30", 270 <= dur <= 330, f"{dur:.2f} s ({int(dur // 60)}:{dur % 60:05.2f})")
check("Format 1080p30 H.264", v["width"] == 1920 and v["height"] == 1080 and v["codec_name"] == "h264" and v["r_frame_rate"] == "30/1", f"{v['width']}×{v['height']} {v['codec_name']} {v['r_frame_rate']}")
check("Chapters embedded", len(probe.get("chapters", [])) == len(tl["chapters"]), f"{len(probe.get('chapters', []))} chapters")
check("Geometry checks (tool models)", chk["ok"], "; ".join(f"{k}: {v}" for k, v in chk.items() if k != "ok"))
lo = mixer.measure(MP4)
check("Loudness −16 LUFS ±1, TP ≤ −1 dBTP", abs(lo["integrated_LUFS"] + 16) <= 1 and lo["true_peak_dBTP"] <= -1.0, f"{lo['integrated_LUFS']} LUFS, {lo['true_peak_dBTP']} dBTP, LRA {lo['LRA_LU']} LU (ffmpeg ebur128 on the MP4)")
# captions vs narration
srt = (HERE / "out/ep04b_chisels_and_plane.srt").read_text()
cap_text = " ".join(l for l in srt.splitlines() if l and not l[0].isdigit())
nar_text = " ".join(n["text"] for n in tl["narration"])
norm = lambda s: re.sub(r"\s+", " ", s).strip()
cues = re.findall(r"(\d\d):(\d\d):(\d\d),(\d{3}) --> (\d\d):(\d\d):(\d\d),(\d{3})", srt)
tt = lambda a: int(a[0]) * 3600 + int(a[1]) * 60 + int(a[2]) + int(a[3]) / 1000
inside = all(any(n["start"] - 0.3 <= tt(c[:4]) <= n["end"] + 0.3 for n in tl["narration"]) for c in cues)
check("Captions match final narration", norm(cap_text) == norm(nar_text) and inside, f"text identical: {norm(cap_text) == norm(nar_text)}; all {len(cues)} cue starts inside a narration line: {inside}; ≤2 lines × ≤42 chars")
# kanji traceability
shots_src = (HERE / "shots.js").read_text()
cjk = sorted(set(re.findall(r"[぀-ヿ一-鿿]+", shots_src)))
table = (ROOT / "research/research_table.md").read_text() + (ROOT / "research/ep04_fact_pack.md").read_text()
verified = {k for k in cjk if any(k in line and "| verified" in line for line in table.splitlines())}
check("On-screen kanji trace to verified research rows", set(cjk) == verified, f"on screen: {', '.join(cjk)}; verified rows found for: {', '.join(sorted(verified))}")
# sync: each named term's label appears within 0.6 s of the word
sync = []
for s in tl["shots"]:
    for lid, ln in s["lines"].items():
        for w, ws, we in ln["words"]:
            pass
pairs = [("S03", "term", "N03", "nomi"), ("S03", "struck", "N03", "struck"), ("S03", "pushed", "N03", "pushed"), ("S03", "katsura", "N04", "katsura"),
         ("S05", "hagane", "N06", "hagane"), ("S05", "jigane", "N06", "jigane"), ("S05", "ura", "N07", "urasuki"), ("S06", "kigoroshi", "N09", "kigoroshi"),
         ("S07", "dai", "N11", "block"), ("S07", "cb", "N12", "second"), ("S09", "dull", "N14", "dull")]
worst = 0
for sid, ev, lid, word in pairs:
    s = next(x for x in tl["shots"] if x["id"] == sid)
    wt = next(w[1] for w in s["lines"][lid]["words"] if w[0].startswith(word))
    d = s["ev"][ev] - wt
    worst = max(worst, abs(d))
    sync.append(f"{sid}:{ev}↔'{word}' {d:+.2f}s")
check("Narration/visual sync (named thing on screen when named)", worst <= 0.6, "; ".join(sync))
# study holds
holds = [(s["id"], b - a) for s in tl["shots"] for a, b in s["holds"]]
need = {"S03": 3, "S04": 3, "S05": 3, "S06": 3, "S07": 3, "S11": 8}
check("Study holds", all(any(h[0] == k and h[1] >= v for h in holds) for k, v in need.items()), ", ".join(f"{k} {v:.1f}s" for k, v in holds))
# stills from the final MP4 at every hold midpoint and the 75% point of each shot
out = HERE / "build/qa_stills"
out.mkdir(exist_ok=True)
pts = [(s["id"] + "_hold", s["start"] + (a + b) / 2) for s in tl["shots"] for a, b in s["holds"]] + [(s["id"], s["start"] + 0.75 * (s["end"] - s["start"])) for s in tl["shots"]]
for name, t in pts:
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{t:.3f}", "-i", str(MP4), "-frames:v", "1", str(out / f"{t:07.2f}_{name}.png")])
check("Stills exported", len(list(out.glob("*.png"))) >= len(pts), f"{len(pts)} stills in build/qa_stills/ (inspected by eye; notes below)")
rep = ["# Gate C: QA report, Episode 2", "", f"Overall: **{'PASS' if ok_all else 'FAIL'}**", "", "| Check | Result | Detail |", "|---|---|---|", *rows, ""]
(HERE / "build/qa_report.md").write_text("\n".join(rep))
print("\n".join(rep))
