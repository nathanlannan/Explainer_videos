"""WCAG contrast check for every text/background pair the series uses."""
def lum(h):
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)
PAIRS = [("ink", "#1B1B1B", "paper", "#F3EEE4"), ("inkSoft", "#4A4642", "paper", "#F3EEE4"),
         ("accent", "#B8432F", "paper", "#F3EEE4"), ("ink", "#1B1B1B", "wood", "#E6C9A0"),
         ("ink", "#1B1B1B", "paperDeep", "#E9E1D2"), ("accent", "#B8432F", "paperDeep", "#E9E1D2"),
         ("ghost(text not allowed)", "#7D8EA0", "paper", "#F3EEE4"), ("paper", "#F3EEE4", "ink", "#1B1B1B")]
if __name__ == "__main__":
    for fa, a, fb, b in PAIRS:
        r = ratio(a, b)
        print(f"{fa:>24} on {fb:<10} {r:5.2f}:1  {'AA ok' if r >= 4.5 else ('AA-large only' if r >= 3 else 'FAIL - not for text')}")
