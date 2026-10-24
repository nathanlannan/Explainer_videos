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
class Member:
    name: str
    kind: str                 # 'post', 'sill', 'beam', 'rail', 'stick', ...
    body: Box
    axis: str                 # long axis 'x' | 'y' | 'z' -> grain direction
    cuts: list[Box] = field(default_factory=list)

    def solid(self) -> m3.Manifold:
        s = self.body.solid()
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
