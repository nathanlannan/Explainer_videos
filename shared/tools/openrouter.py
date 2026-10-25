"""Minimal OpenRouter client with a spend ledger.

The API key is read from the OPENROUTER_API_KEY environment variable and is
never printed, logged or written anywhere. Every paid call is appended to
spend.csv with the *actual* cost reported by OpenRouter's generation-stats
endpoint (falling back to the response's usage block when available).
"""
import csv, datetime, json, os, pathlib, time, urllib.request, urllib.error

ROOT = pathlib.Path(__file__).resolve().parents[2]
LEDGER = ROOT / "spend.csv"
API = "https://openrouter.ai/api/v1"
CAP_USD = 5.00          # TOTAL series cap (owner instruction, 2026-10-25); guard() sums the whole ledger
CAUTION_USD = 3.50      # past this, paid calls only for narration


def _key():
    k = os.environ.get("OPENROUTER_API_KEY")
    if not k:
        raise SystemExit("OPENROUTER_API_KEY is not set")
    return k


def _req(path, body=None, method=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(API + path, data=data, method=method or ("POST" if data else "GET"))
    r.add_header("Authorization", "Bearer " + _key())
    r.add_header("Content-Type", "application/json")
    return urllib.request.urlopen(r, timeout=300)


def spent():
    if not LEDGER.exists():
        return 0.0
    with LEDGER.open() as f:
        return sum(float(r["cost_usd"] or 0) for r in csv.DictReader(f))


def _log(model, purpose, units, cost, gen_id):
    new = not LEDGER.exists()
    with LEDGER.open("a", newline="") as f:
        w = csv.writer(f)
        if new:
            w.writerow(["timestamp", "model", "purpose", "units", "cost_usd", "generation_id"])
        w.writerow([datetime.datetime.utcnow().isoformat(timespec="seconds") + "Z", model, purpose, units, f"{cost:.6f}", gen_id])


def generation_cost(gen_id, tries=10):
    """Actual cost from /generation (stats can lag a few seconds)."""
    for i in range(tries):
        try:
            with _req(f"/generation?id={gen_id}") as r:
                d = json.load(r)["data"]
                if d.get("total_cost") is not None:
                    return float(d["total_cost"])
        except urllib.error.HTTPError:
            pass
        time.sleep(2 + i)
    raise RuntimeError(f"no cost reported for generation {gen_id}")


def guard(estimate_usd):
    if spent() + estimate_usd > CAP_USD:
        raise SystemExit(f"refusing call: ${spent():.4f} spent + ${estimate_usd:.4f} est > ${CAP_USD} cap")


def tts(text, out_path, model, voice, purpose, price_per_char, instructions=None, fmt="mp3"):
    guard(len(text) * price_per_char * 1.2 + 0.001)
    body = {"model": model, "input": text, "voice": voice, "response_format": fmt}
    if instructions:
        body["instructions"] = instructions
    with _req("/audio/speech", body) as r:
        gen_id = r.headers.get("X-Generation-Id")
        audio = r.read()
    pathlib.Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    pathlib.Path(out_path).write_bytes(audio)
    cost = generation_cost(gen_id)
    _log(model, purpose, f"{len(text)} chars", cost, gen_id)
    return cost


def chat(model, messages, purpose, max_tokens=16, est=0.001):
    if spent() > CAUTION_USD:
        raise SystemExit(f"caution line passed (${spent():.2f} > ${CAUTION_USD}): non-narration calls disabled")
    guard(est)
    with _req("/chat/completions", {"model": model, "messages": messages, "max_tokens": max_tokens, "usage": {"include": True}}) as r:
        d = json.load(r)
    cost = d.get("usage", {}).get("cost")
    if cost is None:
        cost = generation_cost(d["id"])
    _log(model, purpose, f"{d.get('usage',{}).get('total_tokens')} tokens", float(cost), d["id"])
    return d, float(cost)


if __name__ == "__main__":
    print(f"spent so far: ${spent():.4f} of ${CAP_USD:.2f}")
