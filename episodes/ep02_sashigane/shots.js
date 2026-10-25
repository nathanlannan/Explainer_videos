// Episode 2 · Part 1 shots: the sashigane. Geometry and scales from build/geometry.json (params.py), timing from build/timeline.json.
let L, THREE, G, TL;
const R = (p) => `/episodes/ep02_sashigane/${p}`;

export async function init(lib) {
  L = lib; THREE = lib.THREE;
  G = await (await fetch(R('build/geometry.json'))).json();
  TL = await (await fetch(R('build/timeline.json'))).json();
  const byId = Object.fromEntries(TL.shots.map((s) => [s.id, s]));
  const shots = Object.entries(SHOTS).map(([id, def]) => ({ id, ...byId[id], ...def }));
  return { shots, fps: TL.fps, total: TL.total };
}
const SG = () => G.sashigane;
const mm = (v, d = 0) => `${v.toFixed(d)} mm <span class="soft">(${(v / 25.4).toFixed(2)} in)</span>`;
function el2(parent, tag, attrs) { return L.el('svg:' + tag, attrs, parent); }
function anchor(d, cam, pt, dx = 0, dy = 0) { const [x, y] = L.toScreen(cam, pt); d.style.left = x + dx + 'px'; d.style.top = y + dy + 'px'; }

// =============== the sashigane, built from the parameters ===============
// Local frame: heel (outer corner) at the origin; long arm along +X, short arm along +Z;
// outer edges on z = 0 (long arm) and x = 0 (short arm); front face is +Y, back face is -Y.
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
  const s = SG(), S = G.scales, grp = new THREE.Group();
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
  const A = getSashigane(), s = SG(); if (A.bend === sag) return; A.bend = sag;
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

// =============== scenes ===============
let benchScene;
function getBench() { // sashigane on paper, plus a board for the flex shot
  if (benchScene) return benchScene;
  const s = L.makeScene({ shadowBox: 900, lightDir: [0.35, 1, 0.6] });
  const A = getSashigane();
  const board = L.memberMesh(L.boxMember('board', [-60, -30, -40, 700, 30, 180], 'x'), { seed: 31 });
  s.add(board);
  benchScene = { s, board };
  return benchScene;
}
let logScene;
function getLog() {
  if (logScene) return logScene;
  const s = L.makeScene({ floor: false, lightDir: [0.5, 0.9, 0.8] });
  const r = G.log_d / 2, len = G.log_len;
  const bark = new THREE.MeshStandardMaterial({ color: '#6B5440', roughness: 0.95 });
  // end grain texture for the small end
  const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d');
  g.fillStyle = '#DDBF94'; g.fillRect(0, 0, 1024, 1024);
  for (let k = 8; k < 512; k += 9 + (k % 7)) { g.strokeStyle = `rgba(150,100,58,${0.18 + (k % 5) * 0.04})`; g.lineWidth = 2; g.beginPath(); g.arc(512 + 6, 512 - 4, k, 0, 6.3); g.stroke(); }
  g.strokeStyle = '#6B5440'; g.lineWidth = 26; g.beginPath(); g.arc(512, 512, 512, 0, 6.3); g.stroke();
  const endTex = new THREE.CanvasTexture(c); endTex.colorSpace = THREE.SRGBColorSpace;
  const cyl = new THREE.CylinderGeometry(r, r * 1.06, len, 96, 1, false); cyl.rotateX(Math.PI / 2); // top (radius r, the small end) ends up toward +z, the camera
  const log = new THREE.Mesh(cyl, [bark, new THREE.MeshStandardMaterial({ map: endTex, roughness: 0.85 }), bark]);
  log.position.set(0, r * 1.06, -len / 2); log.castShadow = log.receiveShadow = true; s.add(log);
  const zEnd = 0, yc = r * 1.06;
  // ink square on the end (drawn progressively), centre line ghosts
  const side = G.checks.largest_square_side;
  const sq = new THREE.Group(); const pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [a * side / 2, b * side / 2]);
  const edges = pts.map((p, i) => { const q = pts[(i + 1) % 4]; const dx = q[0] - p[0], dy = q[1] - p[1]; const ln = L.inkLine(Math.hypot(dx, dy), 3); ln.position.set(p[0], yc + p[1], zEnd + 0.6); ln.rotation.z = Math.atan2(dy, dx); sq.add(ln); return ln; });
  s.add(sq);
  logScene = { s, log, zEnd, yc, edges, sq };
  return logScene;
}
// Sashigane placed with its BACK toward the camera, long arm's outer edge on the log's horizontal diameter, heel at the left rim.
function placeOnLog(LS, k = 1, flip = 1) {
  const A = getSashigane(), r = G.log_d / 2;
  if (A.grp.parent !== LS.s) LS.s.add(A.grp);
  A.grp.visible = true; bendArm(0);
  // flip = 0: front toward camera; 1: back toward camera (rotation about the long axis)
  A.grp.rotation.set(-Math.PI / 2 * (2 * flip - 1) * 1, 0, 0);
  if (flip < 1 && flip > 0) A.grp.rotation.set(Math.PI / 2 - Math.PI * flip, 0, 0);
  const off = 260 * (1 - k);
  A.grp.position.set(-r, LS.yc + (flip >= 1 ? 0 : SG().width * 0), LS.zEnd + 1.6 + off);
}

// =============== shots ===============
const SHOTS = {
  S01: {
    fadeIn: 0.8,
    build() {
      getLog();
      this.dim = L.text(mm(G.log_d), { x: 960, y: 900, size: 40, align: 'center' });
      this.q = L.text('Biggest square beam?', { x: 96, y: 80, size: 56 }); this.q.style.fontWeight = 700;
      const svg = L.svgLayer(); this.svg = svg; this.dl = el2(svg, 'line', { stroke: L.C.ghost, 'stroke-width': 4, 'stroke-dasharray': '10 8' });
      this.qm = L.text('?', { x: 0, y: 0, size: 72 }); this.qm.style.fontWeight = 700;
    },
    frame(t, sh) {
      const LS = getLog(), e = sh.ev, r = G.log_d / 2;
      LS.edges.forEach((m) => L.setProgress(m, 0));
      const kTurn = L.ramp(t, e.turn, e.turn + 0.9), kLay = L.ramp(t, e.lay - 0.1, e.lay + 0.8);
      const A = getSashigane(); if (A.grp.parent !== LS.s) LS.s.add(A.grp); bendArm(0);
      A.grp.visible = t > e.turn - 0.6;
      // held up in front of the log, flipping from front to back, then laid on the end
      A.grp.rotation.set(Math.PI / 2 - Math.PI * kTurn, 0, 0);
      A.grp.position.set(-r, LS.yc + 140 * (1 - kLay) - (kTurn < 1 ? 0 : 0), LS.zEnd + 1.6 + 420 * (1 - kLay));
      const cam = L.cameraBlend(['threeQ', [0, LS.yc, -500], 2600, { orbit: -0.35 }], ['front', [0, LS.yc, 0], 1650, {}], L.ramp(t, 0, e.dia + 0.5));
      const [x0, y0] = L.toScreen(cam, [-r, LS.yc, 0]), [x1, y1] = L.toScreen(cam, [r, LS.yc, 0]);
      this.dl.setAttribute('x1', x0); this.dl.setAttribute('y1', y0); this.dl.setAttribute('x2', x0 + (x1 - x0) * L.ramp(t, e.dia, e.dia + 0.8)); this.dl.setAttribute('y2', y1);
      L.show(this.dl, L.fade(t, e.dia, e.lay, 0.4)); L.show(this.dim, L.fade(t, e.dia + 0.3, sh.end - sh.start, 0.4));
      L.show(this.q, L.ramp(t, e.q, e.q + 0.5));
      anchor(this.qm, cam, [r, LS.yc, 0], 30, -110); L.show(this.qm, L.ramp(t, e.lay + 0.8, e.lay + 1.2));
      return { scene: LS.s, camera: cam };
    },
  },
  S02: { fadeIn: 0.5, fadeOut: 0.6, build() { titleCard(); }, frame() { return {}; } },
  S03: {
    build() {
      getBench();
      this.term = L.label({ romaji: 'sashigane', kanji: '差金', gloss: "Japanese carpenter's square (also written 指矩)", x: 760, y: 500 });
      this.st = L.text('steel · today usually stainless', { x: 760, y: 620, size: 36, cls: 'soft' });
      this.na = L.label({ romaji: 'nagate', kanji: '長手', gloss: 'long arm', x: 0, y: 0 });
      this.ts = L.label({ romaji: 'tsumate', kanji: '妻手', gloss: 'short arm', x: 0, y: 0 });
      this.d1 = L.text('scaled to 500 mm', { x: 0, y: 0, size: 36 }); this.d2 = L.text('scaled to 250 mm', { x: 0, y: 0, size: 36 });
    },
    frame(t, sh) {
      const B = getBench(), A = getSashigane(), e = sh.ev; if (A.grp.parent !== B.s) B.s.add(A.grp);
      A.grp.visible = true; bendArm(0); A.grp.rotation.set(0, 0, 0); A.grp.position.set(0, 0.5, 0); B.board.visible = false;
      const cam = L.camera('top', [260, 0, 135 + 8 * L.lin(t, 0, sh.end - sh.start)], 960, {});
      L.show(this.term, L.ramp(t, e.term - 0.2, e.term + 0.3)); L.show(this.st, L.ramp(t, e.steel - 0.2, e.steel + 0.3));
      anchor(this.na, cam, [330, 0, 15], -60, 30); L.show(this.na, L.ramp(t, e.nagate - 0.2, e.nagate + 0.3));
      anchor(this.ts, cam, [15, 0, 200], 30, -10); L.show(this.ts, L.ramp(t, e.tsumate - 0.2, e.tsumate + 0.3));
      anchor(this.d1, cam, [250, 0, 0], -100, -70); L.show(this.d1, L.ramp(t, e.fifty - 0.2, e.fifty + 0.3));
      anchor(this.d2, cam, [15, 0, 120], 30, -10); L.show(this.d2, L.ramp(t, e.twentyfive - 0.2, e.twentyfive + 0.3));
      return { scene: B.s, camera: cam };
    },
  },
  S04: {
    build() {
      const svg = L.svgLayer(), s = SG(), F = G.framing, k = 1.2, x0 = 140, y0 = 200; // px per mm, to scale
      this.sq = el2(svg, 'g', {});
      el2(this.sq, 'path', { d: `M${x0},${y0} h${s.overall_long * k} v${s.width * k} h${-(s.overall_long - s.width) * k} v${(s.overall_short - s.width) * k} h${-s.width * k} Z`, fill: STEEL, stroke: L.C.ink, 'stroke-width': 2 });
      const fx = 1000, fy = 200;
      this.fs = el2(svg, 'g', {});
      el2(this.fs, 'path', { d: `M${fx},${fy} h${F.body * k} v${F.body_w * k} h${-(F.body - F.tongue_w) * k} v${(F.tongue - F.body_w) * k} h${-F.tongue_w * k} Z`, fill: '#8E9399', stroke: L.C.ink, 'stroke-width': 2 });
      this.l1 = L.label({ romaji: 'sashigane', gloss: 'scaled 500 × 250 mm · 15 mm wide', x: x0 + 40, y: y0 + 60, size: 40 });
      this.l2 = L.label({ gloss: '', x: fx + 80, y: y0 + 90 }); this.l2.innerHTML = '<div class="term">Western framing square</div><div class="gloss">24 × 16 in · 2 in blade</div>';
      this.scaleNote = L.text('top view · both drawn to the same scale', { x: 1824, y: 60, size: 36, cls: 'soft', align: 'right' });
      // section inset: sashigane cross-section 15 x ~1.4 mm, magnified
      this.sec = el2(svg, 'g', {}); const M = 18, sx = 140, sy = 820;
      el2(this.sec, 'rect', { x: sx, y: sy, width: s.width * M, height: s.thickness * M, fill: STEEL, stroke: L.C.ink, 'stroke-width': 2 });
      this.secL = L.text('section, magnified 18×: about 15 mm wide, about 1.4 mm thick', { x: sx, y: sy + 50, size: 36 });
      this.both = L.text('both are squares <i>and</i> rulers', { x: 1080, y: 760, size: 40 });
    },
    frame(t, sh) {
      const e = sh.ev;
      L.show(this.sq, L.ramp(t, 0, 0.5)); L.show(this.l1, L.ramp(t, 0.2, 0.7));
      L.show(this.fs, L.ramp(t, e.framing - 0.3, e.framing + 0.3)); L.show(this.l2, L.ramp(t, e.dims - 0.3, e.dims + 0.2)); L.show(this.scaleNote, L.ramp(t, e.dims, e.dims + 0.5));
      L.show(this.both, L.ramp(t, e.both - 0.2, e.both + 0.3));
      L.show(this.sec, L.ramp(t, e.wide - 0.3, e.wide + 0.3)); L.show(this.secL, L.ramp(t, e.thick - 0.6, e.thick));
      return {};
    },
  },
  S05: {
    build() { getBench(); this.lab = L.text('springs back flat', { x: 96, y: 900, size: 40 }); this.lab2 = L.text('pressed flat where the line goes', { x: 96, y: 900, size: 40 }); },
    frame(t, sh) {
      const B = getBench(), A = getSashigane(), e = sh.ev; if (A.grp.parent !== B.s) B.s.add(A.grp);
      A.grp.visible = true; B.board.visible = true; A.grp.rotation.set(0, 0, 0); A.grp.position.set(0, 0.5, 30);
      // flex up (a gentle bow), spring back, then a slight press
      const sag = 22 * L.ramp(t, e.flex - 0.2, e.flex + 0.5) * (1 - L.ramp(t, e.springs, e.springs + 0.35)) - 3 * L.fade(t, e.press - 0.2, e.press + 1.6, 0.3);
      bendArm(sag);
      L.show(this.lab, L.fade(t, e.springs + 0.2, e.press - 0.3, 0.3)); L.show(this.lab2, L.ramp(t, e.press, e.press + 0.4));
      const cam = L.camera('front', [270, 10, 60], 760, { lift: 0.3 });
      return { scene: B.s, camera: cam };
    },
  },
  S06: {
    build() {
      const svg = L.svgLayer(), k = 2.2, bx = 330, by = 330, BW = 1260, BH = G.board[1] * k;
      L.woodRect(svg, bx, by, BW, BH);
      this.X = 960; this.y0 = by + BH; this.y1 = by;
      this.line = el2(svg, 'line', { x1: this.X, y1: this.y0, x2: this.X, y2: this.y0, stroke: L.C.ink, 'stroke-width': 5 });
      this.ra = el2(svg, 'path', { d: `M${this.X},${this.y0 - 34} h34 v34`, fill: 'none', stroke: L.C.ink, 'stroke-width': 3 });
      L.text('board (top view)', { x: bx, y: by + BH + 24, size: 36, cls: 'soft' });
      this.t1 = L.text('a line squared across, at 90° to the edge', { x: this.X + 50, y: by + BH / 2 - 24, size: 40 });
      this.ep1 = L.text('as the lines were carried across the posts in Episode 1', { x: 96, y: 900, size: 36, cls: 'soft' });
      this.next = L.text('how to hold the sashigane: Part 2', { x: 96, y: 960, size: 36, cls: 'soft' });
    },
    frame(t, sh) {
      const e = sh.ev, kd = L.ramp(t, e.draw - 0.1, e.draw + 1.4);
      this.line.setAttribute('y2', this.y0 + (this.y1 - this.y0) * kd); L.show(this.ra, L.ramp(t, e.draw + 1.2, e.draw + 1.6));
      L.show(this.t1, L.ramp(t, e.draw + 1.2, e.draw + 1.6)); L.show(this.ep1, L.ramp(t, e.draw - 0.2, e.draw + 0.3)); L.show(this.next, L.ramp(t, e.next - 0.3, e.next + 0.2));
      return {};
    },
  },
  S07: {
    build() { getBench(); this.lab = L.label({ romaji: 'omote-me', kanji: '表目', gloss: 'front scale: ordinary units (usually millimeters)', x: 96, y: 860 }); this.sh = L.text('some squares: traditional shaku units', { x: 96, y: 990, size: 36, cls: 'soft' }); },
    frame(t, sh) {
      const B = getBench(), A = getSashigane(), e = sh.ev; if (A.grp.parent !== B.s) B.s.add(A.grp);
      A.grp.visible = true; B.board.visible = false; bendArm(0); A.grp.rotation.set(0, 0, 0); A.grp.position.set(0, 0.5, 0);
      L.show(this.lab, L.ramp(t, e.term - 0.2, e.term + 0.3)); L.show(this.sh, L.ramp(t, e.shaku - 0.2, e.shaku + 0.3));
      const cam = L.camera('top', [L.lerp(110, 210, L.lin(t, 0, sh.end - sh.start)), 0, 7.5], 260, {});
      return { scene: B.s, camera: cam };
    },
  },
  S08: {
    build() {
      const svg = L.svgLayer(), s = SG(), x0 = 160, pxmm = 11, len = 100; // show 0..100 mm
      this.flipG = el2(svg, 'g', {});
      el2(this.flipG, 'rect', { x: x0, y: 150, width: 1100, height: s.width * 6, fill: STEEL, stroke: L.C.ink, 'stroke-width': 2 });
      this.flipLab = L.text('turn it over', { x: 160, y: 80, size: 40 });
      const strip = (y, unit, label, kanji, gloss) => {
        const g = el2(svg, 'g', {});
        el2(g, 'rect', { x: x0, y, width: len * pxmm, height: 90, fill: STEEL, stroke: L.C.ink, 'stroke-width': 2 });
        for (let v = 0; v * unit <= len + 1e-6; v++) {
          const X = x0 + v * unit * pxmm, big = v % 10 === 0, mid = v % 5 === 0;
          el2(g, 'line', { x1: X, y1: y, x2: X, y2: y + (big ? 44 : mid ? 32 : 20), stroke: '#222', 'stroke-width': big ? 3 : 2 });
          if (big && v) el2(g, 'text', { x: X, y: y + 82, 'font-size': 36, 'text-anchor': 'middle', 'font-family': "'Noto Sans CJK JP', sans-serif", 'font-weight': 600, fill: '#222' }).textContent = v;
        }
        const lb = L.label({ romaji: label, kanji, gloss, x: x0 + len * pxmm + 60, y: y - 6, size: 40 });
        return { g, lb };
      };
      this.front = strip(380, 1, 'omote-me', '表目', 'front · 1 unit = 1 mm');
      this.back = strip(620, G.root2, 'ura-me', '裏目', 'back · 1 unit = 1.414 mm');
      // ghost guides: 10 back units = 14.14 mm on the front scale
      this.g = el2(svg, 'g', {});
      [10, 20, 30, 40, 50, 60, 70].forEach((v) => { const X = x0 + v * G.root2 * pxmm; el2(this.g, 'line', { x1: X, y1: 470, x2: X, y2: 620, stroke: L.C.ghost, 'stroke-width': 3, 'stroke-dasharray': '6 6' }); });
      this.eq = L.text('10 back units = 14.14 mm', { x: x0, y: 300, size: 40 });
      this.root = L.text('each back unit = front unit × √2 ≈ 1.414', { x: 160, y: 790, size: 48 }); this.root.style.fontWeight = 700;
      this.kaku = L.text('formally called <i>kakume</i> <span style="font-family:\'Noto Serif CJK JP\'">角目</span>; one common layout puts it on the long arm\'s outer edge', { x: 160, y: 880, size: 36, cls: 'soft' });
    },
    frame(t, sh) {
      const e = sh.ev;
      const kf = L.ramp(t, e.turn, e.turn + 0.8); this.flipG.setAttribute('transform', `translate(0,${150 + 45}) scale(1,${Math.cos(Math.PI * kf)}) translate(0,${-(150 + 45)})`);
      L.show(this.flipG, L.fade(t, 0, e.term + 0.3, 0.3)); L.show(this.flipLab, L.fade(t, 0.1, e.term + 0.3, 0.3));
      L.show(this.front.g, L.ramp(t, e.term, e.term + 0.4)); L.show(this.front.lb, L.ramp(t, e.term, e.term + 0.4));
      L.show(this.back.g, L.ramp(t, e.term + 0.2, e.term + 0.6)); L.show(this.back.lb, L.ramp(t, e.term + 0.2, e.term + 0.6));
      L.show(this.g, L.ramp(t, e.wider - 0.2, e.wider + 0.3)); L.show(this.eq, L.ramp(t, e.wider, e.wider + 0.4));
      L.show(this.root, L.ramp(t, e.root - 0.2, e.root + 0.3)); L.show(this.kaku, L.ramp(t, e.root + 1.2, e.root + 1.6));
      return {};
    },
  },
  S09: {
    build() {
      const svg = L.svgLayer(), sz = 420, x0 = 260, y0 = 330; // a 100 mm square drawn at 4.2 px/mm
      this.sq = el2(svg, 'rect', { x: x0, y: y0, width: sz, height: sz, fill: '#E9E1D2', stroke: L.C.ink, 'stroke-width': 4 });
      this.sl = L.text('side 100 mm', { x: x0 + sz / 2, y: y0 + sz + 14, size: 36, align: 'center' });
      this.dg = el2(svg, 'line', { x1: x0, y1: y0 + sz, x2: x0, y2: y0 + sz, stroke: L.C.ink, 'stroke-width': 4 });
      this.dgl = L.text('diagonal 141.4 mm', { x: x0 - 10, y: y0 - 70, size: 36 });
      this.eq1 = L.text('side² + side² = diagonal²', { x: 900, y: 330, size: 44 });
      this.eq2 = L.text('diagonal = side × √2', { x: 900, y: 410, size: 56 }); this.eq2.style.fontWeight = 700;
      this.eq3 = L.text('100 × 1.414 = 141.4 mm', { x: 900, y: 500, size: 40, cls: 'soft' });
      // the back scale laid along the diagonal
      this.scale = el2(svg, 'g', {});
      const d = sz * Math.SQRT2;
      el2(this.scale, 'rect', { x: 0, y: -26, width: d + 30, height: 26, fill: STEEL, stroke: L.C.ink, 'stroke-width': 1.5 });
      for (let v = 0; v <= 100; v += 5) { const X = v * G.root2 * 4.2; el2(this.scale, 'line', { x1: X, y1: -26, x2: X, y2: v % 10 ? -14 : -6, stroke: '#222', 'stroke-width': v % 50 ? 1.5 : 3 }); }
      const nx = 100 * G.root2 * 4.2; const nt = el2(this.scale, 'text', { x: nx, y: -36, 'font-size': 36, 'text-anchor': 'middle', 'font-family': "'Noto Sans CJK JP', sans-serif", 'font-weight': 700 }); nt.textContent = '100';
      this.scale.setAttribute('transform', `translate(${x0},${y0 + sz}) rotate(-45)`);
      this.rd = L.text('back scale reads <b>100</b>: the side', { x: 900, y: 640, size: 48 });
      this.rd2 = L.text('the same 141.4 mm, read on the back = 100', { x: 900, y: 720, size: 36, cls: 'soft' });
    },
    frame(t, sh) {
      const e = sh.ev, x0 = 260, y0 = 330, sz = 420;
      L.show(this.sq, L.ramp(t, e.square - 0.3, e.square + 0.3)); L.show(this.sl, L.ramp(t, e.square, e.square + 0.4));
      const kd = L.ramp(t, e.diag - 0.2, e.diag + 0.6); this.dg.setAttribute('x2', x0 + sz * kd); this.dg.setAttribute('y2', y0 + sz - sz * kd);
      L.show(this.dgl, L.ramp(t, e.diag + 0.4, e.diag + 0.8));
      L.show(this.eq1, L.ramp(t, e.root - 1.0, e.root - 0.5)); L.show(this.eq2, L.ramp(t, e.root - 0.2, e.root + 0.3)); L.show(this.eq3, L.ramp(t, e.ex - 0.2, e.ex + 0.3));
      L.show(this.scale, L.ramp(t, e.back - 0.2, e.back + 0.4));
      L.show(this.rd, L.ramp(t, e.reads - 0.2, e.reads + 0.3)); L.show(this.rd2, L.ramp(t, e.reads + 0.4, e.reads + 0.8));
      return {};
    },
  },
  S10: {
    build() {
      getLog();
      const svg = L.svgLayer(); this.svg = svg;
      this.diag = el2(svg, 'line', { stroke: L.C.ghost, 'stroke-width': 4, 'stroke-dasharray': '12 8' });
      this.sqG = el2(svg, 'polygon', { fill: 'rgba(125,142,160,0.22)', stroke: L.C.ghost, 'stroke-width': 3 });
      this.cl = L.text('corners on the circle', { x: 0, y: 0, size: 36 });
      this.dl = L.text('diagonal = diameter = 300 mm', { x: 0, y: 0, size: 36 });
      // magnifier inset on the reading at the right rim
      this.mag = el2(svg, 'g', {}); const mx = 1290, my = 130, mw = 530, mh = 290;
      el2(this.mag, 'rect', { x: mx, y: my, width: mw, height: mh, fill: L.C.paper, stroke: L.C.ink, 'stroke-width': 3, rx: 10 });
      const cx = mx + mw / 2, pxu = 16; // px per back unit around the reading
      el2(this.mag, 'rect', { x: mx + 20, y: my + 90, width: mw - 40, height: 70, fill: STEEL, stroke: L.C.ink, 'stroke-width': 1.5 });
      const reading = G.checks.ura_reading_across_diameter;
      for (let v = 198; v <= 226; v++) { const X = cx + (v - reading) * pxu; if (X < mx + 24 || X > mx + mw - 24) continue; const big = v % 10 === 0, mid = v % 5 === 0; el2(this.mag, 'line', { x1: X, y1: my + 160, x2: X, y2: my + 160 - (big ? 40 : mid ? 28 : 16), stroke: '#222', 'stroke-width': big ? 3 : 2 }); if (big) el2(this.mag, 'text', { x: X, y: my + 120, 'font-size': 36, 'text-anchor': 'middle', 'font-family': "'Noto Sans CJK JP', sans-serif", 'font-weight': 600 }).textContent = v; }
      el2(this.mag, 'line', { x1: cx, y1: my + 70, x2: cx, y2: my + 200, stroke: L.C.ink, 'stroke-width': 3 });
      el2(this.mag, 'text', { x: cx, y: my + 250, 'font-size': 36, 'text-anchor': 'middle', 'font-family': "'Noto Sans CJK JP', sans-serif" }).textContent = "log's far edge";
      el2(this.mag, 'text', { x: mx + 20, y: my + 50, 'font-size': 36, 'font-family': "'Noto Sans CJK JP', sans-serif", 'font-weight': 700 }).textContent = `back scale reads ${reading.toFixed(1)}`;
      this.res = L.text(`largest square beam: <b>212 mm</b> a side <span class="soft">(212.1 = 300 ÷ √2)</span>`, { x: 96, y: 960, size: 44 });
    },
    frame(t, sh) {
      const LS = getLog(), e = sh.ev, r = G.log_d / 2, side = G.checks.largest_square_side;
      const kLay = L.ramp(t, e.lay - 0.2, e.lay + 0.7);
      placeOnLog(LS, kLay, 1); getSashigane().grp.visible = t > e.lay - 0.3;
      LS.edges.forEach((m, i) => L.setProgress(m, L.ramp(t, e.ink + i * 0.35, e.ink + 0.35 + i * 0.35)));
      const cam = L.camera('front', [0, LS.yc, 0], 1500, {});
      const P = (x, y) => L.toScreen(cam, [x, LS.yc + y, 0]);
      const c = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => P(a * side / 2, b * side / 2));
      this.sqG.setAttribute('points', c.map((p) => p.join(',')).join(' ')); L.show(this.sqG, L.ramp(t, e.corners - 0.2, e.corners + 0.4) * (1 - L.ramp(t, e.ink + 1.2, e.ink + 1.8)));
      const a = P(-side / 2, -side / 2), b = P(side / 2, side / 2);
      this.diag.setAttribute('x1', a[0]); this.diag.setAttribute('y1', a[1]); this.diag.setAttribute('x2', b[0]); this.diag.setAttribute('y2', b[1]); L.show(this.diag, L.ramp(t, e.diag - 0.2, e.diag + 0.3));
      anchor(this.cl, cam, [side / 2, LS.yc + side / 2, 0], 24, -60); L.show(this.cl, L.fade(t, e.corners, e.lay, 0.3));
      anchor(this.dl, cam, [-r, LS.yc - r, 0], -260, 40); L.show(this.dl, L.ramp(t, e.diag, e.diag + 0.4));
      L.show(this.mag, L.ramp(t, e.read - 0.2, e.read + 0.4)); L.show(this.res, L.ramp(t, e.side - 0.2, e.side + 0.3));
      return { scene: LS.s, camera: cam };
    },
  },
  S11: {
    build() {
      const svg = L.svgLayer(), x0 = 560, y0 = 260, W = 800, Hh = 460;
      this.g = el2(svg, 'g', {});
      el2(this.g, 'rect', { x: x0, y: y0, width: W, height: Hh, fill: 'none', stroke: L.C.ghost, 'stroke-width': 4 });
      const rg = Hh / 2; // equal-pitch hip roof in plan: hips at 45° meet the ridge
      el2(this.g, 'path', { d: `M${x0},${y0} L${x0 + rg},${y0 + rg} L${x0},${y0 + Hh} M${x0 + W},${y0} L${x0 + W - rg},${y0 + rg} L${x0 + W},${y0 + Hh} M${x0 + rg},${y0 + rg} L${x0 + W - rg},${y0 + rg}`, fill: 'none', stroke: L.C.ghost, 'stroke-width': 4 });
      this.cap = L.text('a hip roof in plan (ghosted): the hips run on diagonals', { x: 960, y: 760, size: 36, align: 'center', cls: 'soft' });
      this.lab = L.label({ romaji: 'kikujutsu', kanji: '規矩術', gloss: "the carpenter's layout geometry for roofs; beyond this series", x: 96, y: 860 });
    },
    frame(t, sh) { const e = sh.ev; L.show(this.g, L.ramp(t, e.roofs - 0.3, e.roofs + 0.3)); L.show(this.cap, L.ramp(t, e.hips - 0.2, e.hips + 0.3)); L.show(this.lab, L.ramp(t, e.term - 0.2, e.term + 0.3)); return {}; },
  },
  S12: {
    build() {
      const svg = L.svgLayer(), cx = 640, cy = 540, rr = 300;
      this.c = el2(svg, 'circle', { cx, cy, r: rr, fill: '#DDBF94', stroke: L.C.ink, 'stroke-width': 4 });
      this.circ = el2(svg, 'circle', { cx, cy, r: rr, fill: 'none', stroke: L.C.ink, 'stroke-width': 10, 'stroke-dasharray': `${2 * Math.PI * rr}`, 'stroke-dashoffset': `${2 * Math.PI * rr}`, transform: `rotate(-90 ${cx} ${cy})` });
      this.strip = el2(svg, 'g', {}); el2(this.strip, 'rect', { x: cx - rr, y: cy, width: 2 * rr, height: 40, fill: STEEL, stroke: L.C.ink, 'stroke-width': 1.5 });
      for (let v = 0; v <= G.checks.maru_reading_across_diameter; v += 10) { const X = cx - rr + v / Math.PI * (2 * rr / G.checks.maru_demo_diameter); el2(this.strip, 'line', { x1: X, y1: cy, x2: X, y2: cy + (v % 100 ? 12 : 26), stroke: '#222', 'stroke-width': v % 100 ? 1 : 2.5 }); }
      this.lab = L.label({ romaji: 'marume', kanji: '丸目', gloss: 'round scale: 1 unit = 1 mm ÷ π', x: 1060, y: 230 });
      this.r1 = L.text(`across a ${G.checks.maru_demo_diameter} mm diameter it reads <b>${Math.round(G.checks.maru_reading_across_diameter)}</b>`, { x: 1060, y: 470, size: 44 });
      this.r2 = L.text(`= the circumference, ${Math.round(G.checks.maru_reading_across_diameter)} mm (${G.checks.maru_demo_diameter} × π)`, { x: 1060, y: 550, size: 40, cls: 'soft' });
      this.r3 = L.text(`on some squares only · one common place: the back of the short arm (scaled 250 mm, so this circle is ${G.checks.maru_demo_diameter} mm)`, { x: 1060, y: 860, size: 36, cls: 'soft', w: 760 }); this.r3.classList.add('wrap');
    },
    frame(t, sh) {
      const e = sh.ev; L.show(this.c, L.ramp(t, 0, 0.4)); L.show(this.lab, L.ramp(t, e.term - 0.2, e.term + 0.3)); L.show(this.r3, L.ramp(t, e.term + 0.5, e.term + 1));
      L.show(this.strip, L.ramp(t, e.dia - 0.3, e.dia + 0.3)); L.show(this.r1, L.ramp(t, e.dia + 0.3, e.dia + 0.7));
      const kc = L.ramp(t, e.circ - 0.2, e.circ + 1.4); this.circ.setAttribute('stroke-dashoffset', `${2 * Math.PI * 300 * (1 - kc)}`); L.show(this.r2, L.ramp(t, e.circ + 0.4, e.circ + 0.8));
      return {};
    },
  },
  S13: {
    build() {
      const svg = L.svgLayer(), F = G.framing, k = 1.55, fx = 300, fy = 200;
      this.fs = el2(svg, 'g', {});
      el2(this.fs, 'path', { d: `M${fx},${fy} h${F.body * k} v${F.body_w * k} h${-(F.body - F.tongue_w) * k} v${(F.tongue - F.body_w) * k * 0.9} h${-F.tongue_w * k} Z`, fill: '#8E9399', stroke: L.C.ink, 'stroke-width': 2 });
      for (let row = 0; row < 3; row++) for (let i = 0; i < 28; i++) el2(this.fs, 'rect', { x: fx + 140 + i * 28, y: fy + 18 + row * 28, width: 14, height: 10, fill: 'rgba(27,27,27,0.55)' });
      this.l1 = L.text('stamped tables: rafter table, board measure (Essex), and more', { x: fx + 140, y: fy + 130, size: 36 });
      this.l2 = L.text('exact layout of tables varies by maker', { x: fx + 140, y: fy + 180, size: 36, cls: 'soft' });
      this.idea = L.text('Two traditions, one idea: let the tool do the math.', { x: 960, y: 880, size: 48, align: 'center' }); this.idea.style.fontWeight = 700;
    },
    frame(t, sh) { const e = sh.ev; L.show(this.fs, L.ramp(t, 0, 0.5)); L.show(this.l1, L.ramp(t, e.tables - 0.2, e.tables + 0.3)); L.show(this.l2, L.ramp(t, e.tables + 0.5, e.tables + 0.9)); L.show(this.idea, L.ramp(t, e.idea - 0.2, e.idea + 0.3)); return {}; },
  },
  S14: {
    build() {
      const a = L.text('Next · Episode 2, Part 2', { x: 96, y: 300, size: 48 }); a.style.fontWeight = 700;
      this.items = ['the ink line', 'the ink pen', 'the marking gauges'].map((s, i) => L.text(s, { x: 96, y: 420 + i * 80, size: 56 }));
      this.c = L.text('each beside its Western cousin', { x: 96, y: 700, size: 40, cls: 'soft' });
    },
    frame(t, sh) { const e = sh.ev; this.items.forEach((d, i) => L.show(d, L.ramp(t, e.ink - 0.3 + i * 0.6, e.ink + 0.1 + i * 0.6))); L.show(this.c, L.ramp(t, e.gauges + 0.4, e.gauges + 0.8)); return {}; },
  },
  S15: {
    build() {
      const h = L.text('Front measures lengths. Back turns a diagonal into its side.', { x: 96, y: 70, size: 56 }); h.style.fontWeight = 700;
      L.text('A thin, springy square that is also a calculator.', { x: 96, y: 160, size: 40, cls: 'soft' });
      const rows = [
        ['sashigane', '差金', "carpenter's square", 'thin steel L, a square and a ruler; also 曲尺 kanejaku'],
        ['nagate · tsumate', '長手 · 妻手', 'long arm · short arm', 'commonly scaled to 500 and 250 mm'],
        ['omote-me', '表目', 'front scale', 'ordinary units'],
        ['ura-me', '裏目', 'back scale, ×√2', 'reads the side from a diagonal; formally kakume 角目'],
        ['marume', '丸目', 'round scale, ÷π', 'across a diameter it reads the circumference'],
        ['kikujutsu', '規矩術', 'layout geometry', 'the carpenter\'s geometry for roofs; named only'],
      ];
      const g = L.text('', { x: 96, y: 250, size: 36, w: 1728 }); g.innerHTML = '<div class="soft" style="font-size:36px;margin-bottom:14px;letter-spacing:.08em">GLOSSARY · EPISODE 2 · PART 1</div>' + rows.map((r) => `<div style="display:flex;gap:30px;margin-bottom:20px;align-items:baseline"><div style="width:560px;font-weight:700;font-size:38px"><i>${r[0]}</i> <span style="font-family:'Noto Serif CJK JP',serif;font-style:normal">${r[1]}</span></div><div style="width:1140px;white-space:normal;font-size:36px"><b>${r[2]}</b> — <span class="soft">${r[3]}</span></div></div>`).join('');
    },
    frame() { return {}; },
  },
  S16: { fadeOut: 1.0, build() { endCard(); }, frame() { return {}; } },
};

// =============== series cards ===============
function titleCard() {
  const svg = L.svgLayer();
  el2(svg, 'line', { x1: 96, y1: 470, x2: 560, y2: 470, stroke: L.C.ink, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 300, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('EPISODE 2 · PART 1', { x: 96, y: 370, size: 48 }); b.style.fontWeight = 700; b.style.letterSpacing = '0.12em';
  const c = L.text('The Marking Kit', { x: 96, y: 510, size: 110 }); c.style.fontWeight = 700;
  L.text('The Sashigane', { x: 96, y: 650, size: 64, cls: 'soft' });
  // emblem: the sashigane outline with its front scale, drawn from the parameters
  const s = SG(), k = 1.25, x0 = 1180, y0 = 330;
  el2(svg, 'path', { d: `M${x0},${y0 + s.overall_short * k} v${-s.overall_short * k} h${s.overall_long * k} v${s.width * k} h${-(s.overall_long - s.width) * k} v${(s.overall_short - s.width) * k} Z`, fill: STEEL, stroke: L.C.ink, 'stroke-width': 2 });
  for (let v = 0; v <= 500; v += 10) el2(svg, 'line', { x1: x0 + v * k, y1: y0, x2: x0 + v * k, y2: y0 + (v % 50 ? 6 : 12), stroke: '#222', 'stroke-width': 1.5 });
}
function endCard() {
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 330, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('Next · Episode 2, Part 2', { x: 96, y: 420, size: 48 }); b.style.fontWeight = 700;
  const c = L.text('Ink Line, Pen and Gauges', { x: 96, y: 500, size: 96 }); c.style.fontWeight = 700;
  L.text('sumitsubo, sumisashi, kebiki — each beside its Western cousin', { x: 96, y: 640, size: 40, cls: 'soft' });
  const svg = L.svgLayer(); el2(svg, 'line', { x1: 96, y1: 740, x2: 560, y2: 740, stroke: L.C.ink, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
}
