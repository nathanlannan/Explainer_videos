// Shared sashigane model (JIS A形 dimensions + computed scales), extracted from Episode 2 · Part 1.
// makeSashigane(lib, params, scales) -> { getSashigane, bendArm, STEEL }
export function makeSashigane(L, P, SC) {
  const THREE = L.THREE;
  const STEEL = '#BFC3C7';
  function scaleCanvas(lengthMM, widthMM, marks, { edge = 'outer', numberEvery = 10, unitLabel = '', pxmm = 8 } = {}) {
    // marks: [value, position_mm]; ticks drawn from the chosen edge; numbers every `numberEvery` units
    const c = document.createElement('canvas'); c.width = Math.ceil(lengthMM * pxmm); c.height = Math.ceil(widthMM * pxmm);
    const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height);
    g.fillStyle = '#2a2a2a'; g.strokeStyle = '#2a2a2a'; g.textAlign = 'center'; g.textBaseline = edge === 'outer' ? 'top' : 'bottom';
    const H = c.height;
    for (const [v, x] of marks) {
      const big = v % numberEvery === 0, mid = v % (numberEvery / 2) === 0;
      const len = (big ? 0.42 : mid ? 0.3 : 0.18) * H;
      const X = x * pxmm; g.lineWidth = big ? 2.2 : 1.4;
      g.beginPath();
      if (edge === 'outer') { g.moveTo(X, 0); g.lineTo(X, len); } else { g.moveTo(X, H); g.lineTo(X, H - len); }
      g.stroke();
      if (big && x > 20 && x < lengthMM - 6) { g.font = `600 ${Math.round(0.36 * H)}px 'Noto Sans'`; g.fillText(String(v), X, edge === 'outer' ? len + 0.03 * H : H - len - 0.03 * H); }
    }
    if (unitLabel) { g.font = `700 ${Math.round(0.3 * H)}px 'Noto Sans CJK JP'`; g.textAlign = 'right'; g.fillText(unitLabel, c.width - 8, edge === 'outer' ? H - 0.33 * H : 0.33 * H); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16;
    return t;
  }
  function decal(tex, len, wid, segs = 1) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(len, wid, segs, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    return m;
  }
  let sashi;
  function getSashigane() {
    if (sashi) return sashi;
    const s = P, S = SC, grp = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: '#D3D7DB', metalness: 0.25, roughness: 0.4 });
    // long arm is segmented so it can flex
    const longG = new THREE.BoxGeometry(s.overall_long, s.thickness, s.width, 96, 1, 1); longG.translate(s.overall_long / 2, s.thickness / 2, s.width / 2);
    const longArm = new THREE.Mesh(longG, mat); longArm.castShadow = longArm.receiveShadow = true; grp.add(longArm);
    const shortArm = new THREE.Mesh(new THREE.BoxGeometry(s.width, s.thickness, s.overall_short - s.width), mat);
    shortArm.position.set(s.width / 2, s.thickness / 2, s.width + (s.overall_short - s.width) / 2); shortArm.castShadow = shortArm.receiveShadow = true; grp.add(shortArm);
    // front scales (omote-me): along the outer edges, zero at the heel
    const fL = decal(scaleCanvas(s.overall_long, s.width, S.omote_long), s.overall_long, s.width, 96);
    fL.rotation.x = -Math.PI / 2; fL.position.set(s.overall_long / 2, s.thickness + 0.06, s.width / 2); grp.add(fL);
    const fS = decal(scaleCanvas(s.overall_short, s.width, S.omote_short), s.overall_short, s.width);
    fS.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); fS.position.set(s.width / 2, s.thickness + 0.06, s.overall_short / 2); grp.add(fS);
    // back scales: ura-me (x√2) on the long arm's outer edge; marume (1/π) on the short arm's inner edge
    // back decals face -Y; seen from the back with the long arm to the right they read unmirrored. Canvas bottom = the arm's outer edge.
    const uraTex = scaleCanvas(s.overall_long, s.width, S.ura_long, { edge: 'inner', unitLabel: '裏目' });
    const bL = decal(uraTex, s.overall_long, s.width, 96); bL.rotation.x = Math.PI / 2; bL.position.set(s.overall_long / 2, -0.06, s.width / 2); grp.add(bL);
    const maruTex = scaleCanvas(s.overall_short, s.width, S.maru_short.map(([v, x]) => [v, x]), { edge: 'outer', numberEvery: 100, unitLabel: '丸目' });
    const bS = decal(maruTex, s.overall_short, s.width); bS.rotation.set(Math.PI / 2, 0, Math.PI / 2); bS.position.set(s.width / 2, -0.06, s.overall_short / 2); grp.add(bS);
    const base = longG.attributes.position.array.slice(), fBase = fL.geometry.attributes.position.array.slice(), bBase = bL.geometry.attributes.position.array.slice();
    sashi = { grp, longArm, base, fL, bL, fBase, bBase, bend: 0 };
    return sashi;
  }
  // Flex the long arm: y offset = -sag * sin(pi * x / L) beyond the heel region (sag in mm, + = bow up)
  function bendArm(sag) {
    const A = getSashigane(), s = P; if (A.bend === sag) return; A.bend = sag;
    const f = (x) => sag * Math.sin(Math.PI * Math.min(1, Math.max(0, x / s.overall_long)));
    const pos = A.longArm.geometry.attributes.position.array;
    for (let i = 0; i < pos.length; i += 3) pos[i + 1] = A.base[i + 1] + f(A.base[i]);
    A.longArm.geometry.attributes.position.needsUpdate = true; A.longArm.geometry.computeVertexNormals();
    for (const [m, b] of [[A.fL, A.fBase], [A.bL, A.bBase]]) {
      const p = m.geometry.attributes.position.array; // plane local x maps to arm x - L/2; plane local z (after rotation) is world y
      for (let i = 0; i < p.length; i += 3) p[i + 2] = b[i + 2] + (m === A.fL ? -1 : 1) * f(b[i] + s.overall_long / 2);
      m.geometry.attributes.position.needsUpdate = true;
    }
  }

  return { getSashigane, bendArm, STEEL };
}
