"""Captions (.srt) and chapters from the final narration + timeline.

Word timings: local forced alignment (faster-whisper word timestamps on each clip),
mapped onto the *script* words with a sequence match, so captions show the script
exactly (not the ASR's spellings). Cues: <= 2 lines, <= 42 chars per line.
"""
import difflib, json, pathlib, re

HERE = pathlib.Path(__file__).resolve().parent
tl = json.loads((HERE / "build/timeline.json").read_text())
qa = json.loads((HERE / "build/narration_qa.json").read_text())
ONSCREEN = {}          # caption spelling matches the on-screen term
norm = lambda w: re.sub(r"[^a-z0-9ō]", "", w.lower())


def timed_words(line):
    script = line["text"].split()
    asr = qa[line["id"]]["words"]
    sm = difflib.SequenceMatcher(a=[norm(w) for w in script], b=[norm(w[0]) for w in asr], autojunk=False)
    t = [None] * len(script)
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            t[a + k] = (asr[b + k][1], asr[b + k][2])
    # fill unmatched words by interpolating between neighbours
    dur = qa[line["id"]]["duration"]
    for i in range(len(script)):
        if t[i] is None:
            prev = next((t[j][1] for j in range(i - 1, -1, -1) if t[j]), 0.0)
            nxt = next((t[j][0] for j in range(i + 1, len(script)) if t[j]), dur)
            gapn = next((j for j in range(i + 1, len(script)) if t[j]), len(script)) - i
            step = (nxt - prev) / (gapn + 1)
            t[i] = (prev + step * 0.5, prev + step)
    out = []
    for w, (s, e) in zip(script, t):
        for k, v in ONSCREEN.items():
            w = w.replace(k, v)
        out.append((w, line["start"] + s, line["start"] + e))
    return out


def wrap(words, width=42):
    """One line if it fits; else the most balanced 2-line split (more lines only if unavoidable)."""
    text = " ".join(words)
    if len(text) <= width:
        return [text]
    best = None
    for i in range(1, len(words)):
        a, b = " ".join(words[:i]), " ".join(words[i:])
        if len(a) <= width and len(b) <= width and (best is None or max(len(a), len(b)) < max(map(len, best))):
            best = [a, b]
    if best:
        return best
    lines, cur = [], ""
    for w in words:
        if len(cur) + len(w) + (1 if cur else 0) > width:
            lines.append(cur); cur = w
        else:
            cur = (cur + " " + w).strip()
    return lines + [cur]


def cues():
    out = []
    for ln in tl["narration"]:
        ws = timed_words(ln)
        sents, cur = [], []
        for w in ws:
            cur.append(w)
            if w[0].endswith((".", "?", "!", ":")):
                sents.append(cur); cur = []
        if cur:
            sents.append(cur)
        for sw in sents:
            text = " ".join(x[0] for x in sw)
            k = 1
            while True:   # fewest balanced chunks that each fit in 2 lines of 42
                target = len(text) / k
                chunks, c, n = [], [], 0
                for w in sw:
                    if c and n + len(w[0]) > target * 1.08 and len(chunks) < k - 1:
                        chunks.append(c); c, n = [], 0
                    c.append(w); n += len(w[0]) + 1
                chunks.append(c)
                if all(len(wrap([x[0] for x in ch])) <= 2 for ch in chunks):
                    break
                k += 1
            for ch in chunks:
                out.append([ch[0][1], ch[-1][2], wrap([x[0] for x in ch])])
    for i, c in enumerate(out):     # min 1.0 s on screen, never overlapping the next cue
        nxt = out[i + 1][0] if i + 1 < len(out) else c[1] + 2
        c[1] = min(max(c[1] + 0.25, c[0] + 1.0), nxt - 0.04)
    return out


def ts(x):
    h, r = divmod(x, 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s % 1) * 1000)):03d}".replace(",1000", ",999")


if __name__ == "__main__":
    cs = cues()
    srt = "\n".join(f"{i + 1}\n{ts(a)} --> {ts(b)}\n" + "\n".join(l) + "\n" for i, (a, b, l) in enumerate(cs))
    (HERE / "out/ep03_plan_to_timber.srt").write_text(srt)
    assert all(len(l) <= 42 for _, _, ls in cs for l in ls) and all(len(ls) <= 2 for _, _, ls in cs)
    ch = "\n".join(f"{int(c['t'] // 60)}:{c['t'] % 60:05.2f}  {c['title']}" for c in tl["chapters"])
    yt = "\n".join(f"{int(c['t'] // 60)}:{int(c['t'] % 60):02d} {c['title']}" for c in tl["chapters"])
    (HERE / "out/chapters.txt").write_text("Chapter markers (also embedded in the MP4)\n\n" + ch + "\n\nYouTube-style:\n" + yt + "\n")
    meta = ";FFMETADATA1\n" + "".join(f"[CHAPTER]\nTIMEBASE=1/1000\nSTART={int(c['t'] * 1000)}\nEND={int((tl['chapters'][i + 1]['t'] if i + 1 < len(tl['chapters']) else tl['total']) * 1000)}\ntitle={c['title']}\n" for i, c in enumerate(tl["chapters"]))
    (HERE / "build/chapters.ffmeta").write_text(meta)
    print(len(cs), "cues; max line", max(len(l) for _, _, ls in cs for l in ls))
