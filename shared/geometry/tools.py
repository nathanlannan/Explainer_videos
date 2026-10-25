"""Parametric marking-tool models for the series (units: mm).

Sashigane (差金, Japanese carpenter's square): dimensions from JIS B 7534:2005 A形
(research R2-03, R2-04). Scales are *computed*, never drawn by hand:
  omote-me (表目)  tick k at k * 1 mm
  ura-me   (裏目, kakume 角目) tick k at k * sqrt(2) mm
  marume   (丸目)  tick k at k / pi mm
Western framing square: 24 x 2 in body, 16 x 1.5 in tongue (R2-15).
"""
from __future__ import annotations

import math
from dataclasses import dataclass

INCH = 25.4
ROOT2 = math.sqrt(2.0)


@dataclass
class Sashigane:
    long_scale: float = 500.0     # scaled length of the long arm (nagate), outer edge; JIS 500
    short_scale: float = 250.0    # scaled length of the short arm (tsumate); JIS 250
    overall_long: float = 520.0   # JIS overall length of the long arm
    overall_short: float = 270.0  # model choice: same 20 mm allowance as the long arm (JIS gives 520 for the long arm only)
    width: float = 15.0           # JIS A形 15.0 +-0.3
    thickness: float = 1.4        # JIS A形 1.4 +-0.4 (at most; edges thinner)

    def ticks(self, unit: float, length: float, every: int = 1):
        """(value, position_mm) for every `every` units that fit within `length` mm."""
        n = int(math.floor(length / unit + 1e-9))
        return [(k, round(k * unit, 4)) for k in range(0, n + 1, every)]

    def scales(self):
        return {
            "omote_long": self.ticks(1.0, self.long_scale),
            "ura_long": self.ticks(ROOT2, self.long_scale),
            "omote_short": self.ticks(1.0, self.short_scale),
            "maru_short": self.ticks(1.0 / math.pi, self.short_scale, every=5),
        }


@dataclass
class FramingSquare:
    body: float = 24 * INCH
    body_w: float = 2 * INCH
    tongue: float = 16 * INCH
    tongue_w: float = 1.5 * INCH


def largest_square_in_circle(diameter: float) -> float:
    """Side of the largest square inscribed in a circle: its diagonal is the diameter."""
    return diameter / ROOT2


def ura_reading(length_mm: float) -> float:
    """What the ura-me scale reads over a physical length."""
    return length_mm / ROOT2


def maru_reading(length_mm: float) -> float:
    """What the marume scale reads over a physical length (a diameter -> its circumference)."""
    return length_mm * math.pi
