"""Parametric timber members for the series (units: mm).

World axes used everywhere in the series:
  X = along the wall / along a horizontal member's length
  Y = up
  Z = toward the viewer (out of the wall plane)

A Member is an axis-aligned box with a long axis (for grain direction) and a
list of box-shaped cuts (housings, notches). Booleans are exact (manifold3d),
and the meshes the renderer draws are exported from these same solids, so what
is fit-checked is exactly what is shown.
"""
from __future__ import annotations

from dataclasses import dataclass, field

import manifold3d as m3
import numpy as np

INCH = 25.4


def mm_in(v: float) -> str:
    """'105 mm (4.13 in)' formatting used in docs and labels."""
    return f"{v:g} mm ({v / INCH:.2f} in)"


@dataclass
class Box:
    """Axis-aligned box given by its min corner and size (mm)."""
    x: float
    y: float
    z: float
    sx: float
    sy: float
    sz: float

    def solid(self) -> m3.Manifold:
        return m3.Manifold.cube([self.sx, self.sy, self.sz]).translate([self.x, self.y, self.z])


@dataclass
class PlanPrism:
    """A vertical prism: a polygon in plan (x, z) extruded along Y from y0 to y1 (mm). Used for dovetails."""
    poly: list[tuple[float, float]]
    y0: float
    y1: float

    def solid(self) -> m3.Manifold:
        # CrossSection lives in (X, Y); extrude goes along +Z. Map (X, Y, Z) -> (x = X, y = y0 + Z, z = -Y)
        # (a proper rotation, det = +1), so the polygon is given as (x, -z).
        pts = [(x, -z) for x, z in self.poly]
        signed = sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(pts, pts[1:] + pts[:1])) / 2
        cs = m3.CrossSection([pts if signed > 0 else pts[::-1]])   # counter-clockwise for the Positive fill rule
        e = cs.extrude(self.y1 - self.y0)
        return e.transform([[1, 0, 0, 0], [0, 0, 1, self.y0], [0, -1, 0, 0]])


@dataclass
class Hull:
    """Convex hull of points (mm): e.g. a dovetail whose cheeks taper in elevation."""
    points: list[tuple[float, float, float]]

    def solid(self) -> m3.Manifold:
        return m3.Manifold.hull_points([list(p) for p in self.points])


@dataclass
class Member:
    name: str
    kind: str                 # 'post', 'sill', 'beam', 'rail', 'stick', ...
    body: Box
    axis: str                 # long axis 'x' | 'y' | 'z' -> grain direction
    cuts: list = field(default_factory=list)   # Box, PlanPrism or Hull, subtracted
    adds: list = field(default_factory=list)   # Box, PlanPrism or Hull, added (e.g. a dovetail tongue)

    def solid(self) -> m3.Manifold:
        s = self.body.solid()
        for a in self.adds:
            s = s + a.solid()
        for c in self.cuts:
            s = s - c.solid()
        return s

    def mesh(self) -> dict:
        """Flat-shaded triangle mesh (positions duplicated per face for crisp edges)."""
        mg = self.solid().to_mesh()
        v = np.asarray(mg.vert_properties)[:, :3]
        t = np.asarray(mg.tri_verts)
        return {"positions": v[t].reshape(-1, 3).round(4).tolist()}

    def to_json(self) -> dict:
        b = self.body
        return {
            "name": self.name, "kind": self.kind, "axis": self.axis,
            "box": [b.x, b.y, b.z, b.sx, b.sy, b.sz],
            "volume_mm3": self.solid().volume(),
            **self.mesh(),
        }
