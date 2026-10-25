// Episode 4 · Part 1 shots: pull vs push, the ryōba and its teeth, the dōzuki and the kataba, kerf and set,
// and where the cut goes relative to the line (take / leave / split), with the skills-test manual's tenon example.
import { makeSaws } from '/shared/render/saws.js';
let L, THREE, G, TL, SAWS;
const R = (p) => `/episodes/ep04_saws_and_line/${p}`;

export async function init(lib) {
  L = lib; THREE = lib.THREE;
  G = await (await fetch(R('build/geometry.json'))).json();
  TL = await (await fetch(R('build/timeline.json'))).json();
  SAWS = makeSaws(L);
  const byId = Object.fromEntries(TL.shots.map((s) => [s.id, s]));
  const shots = Object.entries(SHOTS).map(([id, def]) => ({ id, ...byId[id], ...def }));
  return { shots, fps: TL.fps, total: TL.total };
}
function el2(parent, tag, attrs) { return L.el('svg:' + tag, attrs, parent); }
function anchor(d, cam, pt, dx = 0, dy = 0) { const [x, y] = L.toScreen(cam, pt); d.style.left = x + dx + 'px'; d.style.top = y + dy + 'px'; }
const INK = '#1B1B1B', SOFT = '#4A4642', GHOST = '#7D8EA0', STEEL2 = '#AEB4BA', JP = "'Noto Serif CJK JP', serif";
const kj = (s) => `<span style="font-family:'Noto Serif CJK JP',serif;font-style:normal;font-weight:600">${s}</span>`;
// arrow from (x1,y1) to (x2,y2) with a filled head
function arrow(svg, x1, y1, x2, y2, { color = INK, w = 4, head = 18 } = {}) {
  const g = el2(svg, 'g', {}); const a = Math.atan2(y2 - y1, x2 - x1);
  el2(g, 'line', { x1, y1, x2: x2 - Math.cos(a) * head * 0.8, y2: y2 - Math.sin(a) * head * 0.8, stroke: color, 'stroke-width': w });
  const p = [[x2, y2], [x2 - Math.cos(a - 0.42) * head, y2 - Math.sin(a - 0.42) * head], [x2 - Math.cos(a + 0.42) * head, y2 - Math.sin(a + 0.42) * head]];
  el2(g, 'polygon', { points: p.map((q) => q.join(',')).join(' '), fill: color });
  return g;
}
function hatch(svg, id, color = SOFT) {
  const defs = el2(svg, 'defs', {}); const pat = el2(defs, 'pattern', { id, width: 14, height: 14, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' });
  el2(pat, 'line', { x1: 0, y1: 0, x2: 0, y2: 14, stroke: color, 'stroke-width': 2, opacity: 0.55 });
  return `url(#${id})`;
}
// 2D saw silhouette (side view); kind: 'ryoba' | 'dozuki' (handle left, pull) | 'panel' | 'back' (handle right, push)
// zig-zag teeth from (xa,ya) to (xb,yb), pointing to the side `dir` (+1 = below the edge in screen space)
function zig(xa, ya, xb, yb, p, dir) {
  const L2 = Math.hypot(xb - xa, yb - ya), n = Math.max(1, Math.round(L2 / p)), ux = (xb - xa) / L2, uy = (yb - ya) / L2;
  const nx = -uy * dir, ny = ux * dir; let d = '';
  for (let i = 0; i < n; i++) { const a = i * L2 / n, m = a + L2 / n * 0.35; d += `L${xa + ux * a},${ya + uy * a} L${xa + ux * m + nx * p * 0.7},${ya + uy * m + ny * p * 0.7} `; }
  return d + `L${xb},${yb} `;
}
function sawSil(svg, x, y, s, kind) {
  // Western saws are drawn mirrored so every handle is on the left: pull = toward the handle, push = toward the toe
  const mir = kind === 'panel' || kind === 'back', w = kind === 'panel' ? 300 : 260;
  const g = el2(svg, 'g', { transform: `translate(${x},${y}) scale(${s})` + (mir ? ` translate(${w},0) scale(-1,1)` : '') });
  const st = { fill: STEEL2, stroke: INK, 'stroke-width': 1.2 };
  if (kind === 'ryoba') { // blade 0..240, widening toward the toe; rip teeth below, crosscut teeth above
    el2(g, 'path', { d: `M0,0 ${zig(0, 0, 240, 0, 8, 1)} ${zig(240, -40, 0, -30, 5, 1)} Z`, ...st });
    el2(g, 'rect', { x: -60, y: -19, width: 60, height: 8, fill: '#8E9398' });
    el2(g, 'rect', { x: -300, y: -28, width: 240, height: 26, rx: 10, fill: '#B48A55', stroke: INK, 'stroke-width': 1 });
  } else if (kind === 'dozuki') {
    el2(g, 'path', { d: `M0,0 ${zig(0, 0, 240, 0, 4, 1)} L240,-30 L0,-30 Z`, ...st });
    el2(g, 'rect', { x: 0, y: -38, width: 240, height: 10, fill: '#6E7378' });
    el2(g, 'rect', { x: -50, y: -26, width: 50, height: 8, fill: '#8E9398' });
    el2(g, 'rect', { x: -280, y: -34, width: 230, height: 24, rx: 10, fill: '#B48A55', stroke: INK, 'stroke-width': 1 });
  } else if (kind === 'panel') { // tapered plate, closed handle on the right
    el2(g, 'path', { d: `M0,0 ${zig(0, 0, 300, 0, 8, 1)} L300,-62 L0,-22 Z`, ...st });
    el2(g, 'path', { d: 'M296,-72 q62,-8 70,22 l0,42 q-10,30 -70,20 Z M318,-50 q24,0 28,14 l0,8 q-6,14 -28,10 Z', fill: '#9C6B43', 'fill-rule': 'evenodd', stroke: INK, 'stroke-width': 1 });
  } else { // backsaw: heavy back, closed handle on the right
    el2(g, 'path', { d: `M0,0 ${zig(0, 0, 260, 0, 4, 1)} L260,-36 L0,-36 Z`, ...st });
    el2(g, 'rect', { x: 0, y: -48, width: 262, height: 14, fill: '#B08D3C', stroke: INK, 'stroke-width': 1 });
    el2(g, 'path', { d: 'M256,-58 q60,-6 66,26 l0,30 q-8,24 -66,12 Z M276,-40 q24,0 26,12 l0,6 q-6,10 -26,8 Z', fill: '#9C6B43', 'fill-rule': 'evenodd', stroke: INK, 'stroke-width': 1 });
  }
  return g;
}

// =============== 3D: board, line, kerf, and a saw pose that keeps its cutting edge on the kerf front ===============
// Place a saw so that its cutting edge (local edge 'top' for the ryōba's crosscut side, or y = 0) runs along the
// unit direction `dir` (toward the toe), with the blade body on side `up`, through point `p` at distance `s` from the heel.
function poseSaw(group, edgeTop, P, dir, up, p, s) {
  const d = new THREE.Vector3(...dir).normalize(), u = new THREE.Vector3(...up).normalize();
  // local x = d; local y: for a bottom edge the body is at +y (= up); for a top edge the body is at -y (y = -up)
  const yl = edgeTop ? u.clone().negate() : u.clone();
  const zl = new THREE.Vector3().crossVectors(d, yl).normalize();
  const m = new THREE.Matrix4().makeBasis(d, yl, zl);
  group.quaternion.setFromRotationMatrix(m);
  // the edge's local height at s (top edge is sloped from h_heel to h_toe)
  const h = edgeTop ? P.h_heel + (P.h_toe - P.h_heel) * s / P.len : 0;
  const local = new THREE.Vector3(s, h, 0).applyQuaternion(group.quaternion);
  group.position.set(p[0] - local.x, p[1] - local.y, p[2] - local.z);
}
// kerf prism in the plane x = [x0, x1]: region of the board (z in [-W/2, W/2], y in [0, T]) above the line
// y = T - D + (z + W/2) * tanθ, i.e. deepest at the far edge (z = -W/2); returns a mesh to replace each frame.
function kerfMesh(x0, x1, W, T, D, th) {
  const tn = Math.tan(th), yAt = (z) => T - D + (z + W / 2) * tn, zAt = (y) => (y - T + D) / tn - W / 2;
  const pts = [];
  const zTop = Math.min(W / 2, zAt(T));
  pts.push([-W / 2, T], [zTop, T]);
  if (zTop >= W / 2) pts.push([W / 2, Math.max(0, yAt(W / 2))]);
  if (yAt(-W / 2) < 0) { pts.push([Math.min(W / 2, zAt(0)), 0]); pts.push([-W / 2, 0]); } else pts.push([-W / 2, yAt(-W / 2)]);
  const s = new THREE.Shape(); s.moveTo(...pts[0]); pts.slice(1).forEach((q) => s.lineTo(...q)); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: x1 - x0, bevelEnabled: false });
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#2A2522' }));
  m.rotation.y = -Math.PI / 2; m.position.x = x1; // local X -> world z, local Z (depth) -> world -x
  return m;
}

let coldScene;
function getCold() {
  if (coldScene) return coldScene;
  const [BL, BT, BW] = G.board;
  const s = L.makeScene({ shadowBox: 1400, lightDir: [0.4, 1, 0.7] });
  const board = L.memberMesh(L.boxMember('board', [0, 40, -BW / 2, BL, BT, BW], 'x'), { seed: 5 }); s.add(board);
  [[90, 0], [BL - 90, 0]].forEach(([x]) => { const b = L.memberMesh(L.boxMember('horse', [x - 20, 0, -BW / 2 - 40, 40, 40, BW + 80], 'z'), { seed: 8 }); s.add(b); });
  const line = L.inkLine(BW, G.line_w * 3); line.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); line.position.set(G.cut_x, 40 + BT + 0.3, -BW / 2); s.add(line);
  const saw = SAWS.ryoba(G.ryoba); s.add(saw.g);
  coldScene = { s, saw, kerf: null, BL, BT, BW };
  return coldScene;
}

let tenonScene;
function getTenon() {
  if (tenonScene) return tenonScene;
  const M = G.member, T = G.tenon, LEN = 420;
  const s = L.makeScene({ shadowBox: 1200, lightDir: [0.45, 1, 0.6] });
  // member lying with a cheek face up: tenon thickness along y, width along z; shoulder plane at x = LEN
  const body = L.memberMesh(L.boxMember('body', [0, 0, -M / 2, LEN, M, M], 'x'), { seed: 3 });
  const ten = L.memberMesh(L.boxMember('tenon', [LEN, (M - T.t) / 2, -T.w / 2, T.len, T.t, T.w], 'x'), { seed: 3 });
  const done = new THREE.Group(); done.add(body, ten); s.add(done);
  // the shoulder: the end face around the tenon's base (a square with a rectangular hole), highlighted in ghost blue
  const sh = new THREE.Shape(); sh.moveTo(-M / 2, 0); sh.lineTo(M / 2, 0); sh.lineTo(M / 2, M); sh.lineTo(-M / 2, M); sh.closePath();
  const hole = new THREE.Path(); hole.moveTo(-T.w / 2, (M - T.t) / 2); hole.lineTo(-T.w / 2, (M + T.t) / 2); hole.lineTo(T.w / 2, (M + T.t) / 2); hole.lineTo(T.w / 2, (M - T.t) / 2); hole.closePath(); sh.holes.push(hole);
  const shoulder = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: GHOST, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }));
  shoulder.rotation.y = Math.PI / 2; shoulder.position.x = LEN + 0.6; s.add(shoulder);
  // the blank (before cutting): full section, with the shoulder line squared around and the tenon outline on the end
  const blank = new THREE.Group();
  blank.add(L.memberMesh(L.boxMember('blank', [0, 0, -M / 2, LEN + T.len, M, M], 'x'), { seed: 3 }));
  const ln = L.inkLine(M, 3); ln.rotation.set(-Math.PI / 2, 0, -Math.PI / 2); ln.position.set(LEN, M + 0.3, -M / 2); blank.add(ln);
  const ln2 = L.inkLine(M, 3); ln2.rotation.set(0, 0, Math.PI / 2); ln2.position.set(LEN, 0, M / 2 + 0.3); blank.add(ln2);
  const cheek = L.inkLine(T.len, 3); cheek.position.set(LEN, (M + T.t) / 2, M / 2 + 0.3); blank.add(cheek);
  s.add(blank);
  const saw = SAWS.dozuki(G.dozuki); s.add(saw.g);
  tenonScene = { s, done, shoulder, blank, saw, kerf: null, LEN, M, T };
  return tenonScene;
}

let toolScene;
function getTools() {
  if (toolScene) return toolScene;
  const s = L.makeScene({ floor: true, shadowBox: 900, lightDir: [0.3, 1, 0.9] });
  const ry = SAWS.ryoba(G.ryoba), dz = SAWS.dozuki(G.dozuki), kt = SAWS.kataba(G.kataba);
  [ry, dz, kt].forEach((t) => { const piv = new THREE.Group(); piv.add(t.g); t.piv = piv; s.add(piv); });
  toolScene = { s, ry, dz, kt };
  return toolScene;
}
// stand a saw upright, centred on its overall length, turning slowly about the vertical axis
function showSaw(T, P, t, yaw0, rate, lift = 120) {
  const total = P.len + P.neck + P.handle;
  T.g.position.set(-(P.len - P.neck - P.handle) / 2, 0, 0);
  T.piv.position.set(0, lift, 0); T.piv.rotation.set(0, yaw0 + rate * t, 0);
  return total;
}

const SHOTS = {
  S01: {
    build() {
      this.pull = L.text('pull', { x: 0, y: 0, size: 44 }); this.pull.style.fontWeight = 700;
      this.pullSvg = L.svgLayer(); this.arr = arrow(this.pullSvg, 0, 0, 1, 0);
      this.ln = L.text('the line', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.wst = L.text('waste', { x: 0, y: 0, size: 36, cls: 'soft' });
      this.cap = L.text('pull to cut · crosscut edge, across the grain', { x: 96, y: 980, size: 40, cls: 'plate' });
    },
    frame(t, sh) {
      const C = getCold(), e = sh.ev, P = G.ryoba, th = 0.42;
      const T0 = e.stroke0, period = 1.6, ph = Math.max(0, t - T0) / period;
      const cyc = Math.floor(ph), f = ph - cyc;
      // pull (cutting) over the first 60% of each cycle, return over the rest
      const pulling = f < 0.6, k = pulling ? L.ease(f / 0.6) : 1 - L.ease((f - 0.6) / 0.4);
      const depthPerPull = 5.0, D = 6 + depthPerPull * (cyc + (pulling ? k : 1));
      const s = 205 - 120 * k; // contact point along the blade: pulling moves the saw toward the handle
      const x = (G.cold_open_kerf[0] + G.cold_open_kerf[1]) / 2, y0 = 40;
      const pFar = [x, y0 + C.BT - D, -C.BW / 2];
      poseSaw(C.saw.g, true, P, [0, -Math.sin(th), -Math.cos(th)], [0, Math.cos(th), -Math.sin(th)], pFar, s);
      if (C.kerf) { C.s.remove(C.kerf); C.kerf.geometry.dispose(); }
      C.kerf = kerfMesh(G.cold_open_kerf[0] - 0.6, G.cold_open_kerf[1] + 0.6, C.BW, C.BT, D, th); C.kerf.position.y = y0; C.s.add(C.kerf);
      const cam = L.camera('threeQ', [G.cut_x - 40, 90, 10], 1350, { orbit: 0.3, lift: 0.3 });
      // pull arrow along the saw toward the handle, drawn in screen space
      const Mw = new THREE.Matrix4().compose(C.saw.g.position, C.saw.g.quaternion, new THREE.Vector3(1, 1, 1));
      const hp = new THREE.Vector3(-G.ryoba.neck - 40, P.h_heel / 2, 0).applyMatrix4(Mw), tp = new THREE.Vector3(60, P.h_heel / 2, 0).applyMatrix4(Mw);
      const [ax, ay] = L.toScreen(cam, tp.toArray()), [bx, by] = L.toScreen(cam, hp.toArray());
      this.arr.remove(); this.arr = arrow(this.pullSvg, ax, ay - 70, ax + (bx - ax) * 0.55, ay - 70 + (by - ay) * 0.55, { w: 5, head: 22 });
      this.pull.style.left = ax + (bx - ax) * 0.3 + 'px'; this.pull.style.top = ay + (by - ay) * 0.3 - 140 + 'px';
      const pa = L.ramp(t, e.pull - 0.3, e.pull + 0.3) * (pulling ? 1 : 0.35);
      L.show(this.pull, pa); this.pullSvg.style.opacity = pa;
      anchor(this.ln, cam, [G.cut_x - 2, y0 + C.BT, C.BW / 2 - 10], -150, 20); L.show(this.ln, L.ramp(t, e.line - 0.3, e.line + 0.3));
      anchor(this.wst, cam, [G.cut_x + 120, y0 + C.BT, C.BW / 2], -20, 30); L.show(this.wst, L.ramp(t, e.line + 0.2, e.line + 0.7));
      L.show(this.cap, L.ramp(t, e.shapes - 0.2, e.shapes + 0.4));
      return { scene: C.s, camera: cam };
    },
  },
  S02: { fadeIn: 0.5, fadeOut: 0.6, build() { titleCard(); }, frame() { return {}; } },
  S03: {
    build() {
      const svg = L.svgLayer(); this.svg = svg;
      this.h1 = L.text('pull · <span class="soft">Japanese saws</span>', { x: 96, y: 110, size: 44 }); this.h1.style.fontWeight = 700;
      this.g1 = sawSil(svg, 600, 300, 1.4, 'ryoba');
      this.a1 = arrow(svg, 900, 200, 640, 200, { w: 6, head: 26 });
      this.t1 = el2(svg, 'g', {}); arrow(this.t1, 700, 340, 600, 340); arrow(this.t1, 860, 340, 960, 340);
      this.t1L = L.text('tension: the blade is stretched, so it can be made thinner', { x: 1100, y: 300, size: 36, w: 700 }); this.t1L.classList.add('wrap');
      this.h2 = L.text('push · <span class="soft">most Western saws</span>', { x: 96, y: 520, size: 44 }); this.h2.style.fontWeight = 700;
      this.g2 = sawSil(svg, 340, 730, 1.45, 'panel');
      this.a2 = arrow(svg, 620, 620, 920, 620, { w: 6, head: 26 });
      this.bow = el2(svg, 'path', { d: 'M340,735 Q560,800 780,735', fill: 'none', stroke: GHOST, 'stroke-width': 4, 'stroke-dasharray': '14 10' });
      this.bowL = L.text('buckling (exaggerated)', { x: 560, y: 800, size: 36, cls: 'soft', align: 'center' });
      this.t2 = el2(svg, 'g', {}); arrow(this.t2, 440, 770, 520, 770); arrow(this.t2, 760, 770, 680, 770);
      this.t2L = L.text('compression: a pushed blade generally needs to be stiffer, so it doesn\'t buckle', { x: 1100, y: 700, size: 36, w: 700 }); this.t2L.classList.add('wrap');
      // kerf comparison (N04)
      this.kf = el2(svg, 'g', {});
      const sec = (x, plate, label) => { const g = el2(this.kf, 'g', {}); L.woodRect(g, x - 130, 190, 260, 300, { vertical: true }); el2(g, 'rect', { x: x - plate / 2 - 4, y: 190, width: plate + 8, height: 210, fill: '#2A2522' }); el2(g, 'rect', { x: x - plate / 2, y: 140, width: plate, height: 240, fill: STEEL2, stroke: INK, 'stroke-width': 1.5 }); const tt = L.text(label, { x, y: 520, size: 36, align: 'center', w: 380 }); tt.classList.add('wrap'); return [g, tt]; };
      this.k1 = sec(560, 10, 'thinner blade: usually a narrower kerf');
      this.k2 = sec(1260, 26, 'thicker blade: a wider kerf');
      this.kL = L.label({ romaji: 'kerf', kanji: '', gloss: 'the width of a saw cut', x: 96, y: 760 });
      this.kN = L.text('end view · not to scale', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const e = sh.ev, k = L.ramp(t, e.kerf - 0.6, e.kerf), a = 1 - k;
      [this.h1, this.t1L, this.h2, this.t2L, this.bowL].forEach((d) => { d.style.opacity = a; d.style.display = a > 0.01 ? '' : 'none'; });
      [this.g1, this.g2, this.a1, this.a2, this.bow, this.t1, this.t2].forEach((g) => g.setAttribute('opacity', a));
      L.show(this.h1, Math.min(a, L.ramp(t, 0.2, 0.7)));
      this.a1.setAttribute('opacity', Math.min(a, L.ramp(t, e.pull - 0.2, e.pull + 0.3)));
      this.t1.setAttribute('opacity', Math.min(a, L.ramp(t, e.tension - 0.2, e.tension + 0.3))); L.show(this.t1L, Math.min(a, L.ramp(t, e.tension - 0.2, e.tension + 0.3)));
      this.g2.setAttribute('opacity', Math.min(a, L.ramp(t, e.push - 0.2, e.push + 0.3))); L.show(this.h2, Math.min(a, L.ramp(t, e.push - 0.2, e.push + 0.3)));
      this.a2.setAttribute('opacity', Math.min(a, L.ramp(t, e.stiff - 0.6, e.stiff - 0.1)));
      this.t2.setAttribute('opacity', Math.min(a, L.ramp(t, e.stiff - 0.2, e.stiff + 0.3))); L.show(this.t2L, Math.min(a, L.ramp(t, e.stiff - 0.2, e.stiff + 0.3)));
      this.bow.setAttribute('opacity', Math.min(a, 0.9 * L.ramp(t, e.stiff + 0.6, e.stiff + 1.2))); L.show(this.bowL, Math.min(a, L.ramp(t, e.stiff + 0.6, e.stiff + 1.2)));
      this.kf.setAttribute('opacity', k); L.show(this.k1[1], k); L.show(this.kL, k); L.show(this.kN, k);
      this.k2[0].setAttribute('opacity', L.ramp(t, e.narrow - 0.3, e.narrow + 0.2)); L.show(this.k2[1], Math.min(k, L.ramp(t, e.narrow - 0.3, e.narrow + 0.2)));
      return {};
    },
  },
  S04: {
    build() {
      this.term = L.label({ romaji: 'ryōba', kanji: '両刃', gloss: 'double-edged saw', x: 96, y: 70 });
      this.rip = L.text(`rip edge · <i>tatebiki</i> ${kj('縦挽き')}`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.cross = L.text(`crosscut edge · <i>yokobiki</i> ${kj('横挽き')}`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.meiji = L.text('Meiji era (1868–1912)', { x: 96, y: 990, size: 40 });
      this.note = L.text('proportions illustrative · teeth enlarged', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
      // grain inset: rip along the grain, crosscut across it
      const svg = L.svgLayer(); this.inset = el2(svg, 'g', {});
      L.woodRect(this.inset, 1400, 700, 420, 160, { vertical: false });
      this.ia = arrow(this.inset, 1430, 750, 1700, 750, { w: 5 }); this.ib = arrow(this.inset, 1760, 845, 1760, 715, { w: 5 });
      this.iT = L.text('board · grain runs lengthwise', { x: 1610, y: 880, size: 36, align: 'center', cls: 'soft' });
      this.iR = L.text('rip: along the grain', { x: 1400, y: 630, size: 36 }); this.iC = L.text('crosscut: across', { x: 1824, y: 940, size: 36, align: 'right' });
    },
    frame(t, sh) {
      const T = getTools(), e = sh.ev, P = G.ryoba;
      T.dz.piv.visible = false; T.kt.piv.visible = false; T.ry.piv.visible = true;
      showSaw(T.ry, P, t, -0.2, 0.03, 160);
      const cam = L.camera('front', [170, 175, 0], 1300, { orbit: 0.25, lift: 0.12 });
      const wm = T.ry.g.matrixWorld; T.ry.piv.updateMatrixWorld(true);
      const bot = new THREE.Vector3(P.len * 0.62, -2, 0).applyMatrix4(wm), top = new THREE.Vector3(P.len * 0.62, P.h_heel + (P.h_toe - P.h_heel) * 0.62 + 4, 0).applyMatrix4(wm);
      anchor(this.rip, cam, bot.toArray(), -120, 50); anchor(this.cross, cam, top.toArray(), -120, -110);
      L.show(this.term, L.ramp(t, e.term - 0.3, e.term + 0.3)); L.show(this.rip, L.ramp(t, e.rip - 0.2, e.rip + 0.3)); L.show(this.cross, L.ramp(t, e.cross - 0.2, e.cross + 0.3));
      L.show(this.meiji, L.ramp(t, e.meiji - 0.3, e.meiji + 0.3));
      const ia = L.ramp(t, e.rip - 0.2, e.rip + 0.3); this.inset.setAttribute('opacity', ia); L.show(this.iT, ia); L.show(this.iR, ia);
      this.ib.setAttribute('opacity', L.ramp(t, e.cross - 0.2, e.cross + 0.3)); L.show(this.iC, L.ramp(t, e.cross - 0.2, e.cross + 0.3));
      return { scene: T.s, camera: cam };
    },
  },
  S05: {
    build() {
      const svg = L.svgLayer();
      // left: rip teeth (side view), fibers running along the cut; right: crosscut teeth, fibers end-on
      const panel = (x0, kind) => {
        const g = el2(svg, 'g', {});
        el2(g, 'rect', { x: x0, y: 230, width: 780, height: 520, fill: '#EFE6D6', stroke: INK, 'stroke-width': 2, rx: 6 });
        // wood under the teeth
        const wood = el2(g, 'g', {}); el2(wood, 'rect', { x: x0 + 20, y: 470, width: 740, height: 260, fill: '#E6C9A0' });
        if (kind === 'rip') for (let yy = 490; yy < 730; yy += 18) el2(wood, 'line', { x1: x0 + 20, y1: yy, x2: x0 + 760, y2: yy, stroke: '#B88E5E', 'stroke-width': 3 });
        else for (let yy = 490; yy < 730; yy += 22) for (let xx = x0 + 34 + ((yy / 22) % 2) * 11; xx < x0 + 760; xx += 22) el2(wood, 'circle', { cx: xx, cy: yy, r: 4.5, fill: '#B88E5E' });
        // blade with teeth (handle off to the left: steep faces face left)
        const p = kind === 'rip' ? 90 : 60, h = kind === 'rip' ? 56 : 52, tip = kind === 'rip' ? 0.12 : 0.42;
        let d = `M${x0 + 20},300 L${x0 + 760},300 L${x0 + 760},470 `;
        for (let a = x0 + 760; a - p >= x0 + 20 - 0.1; a -= p) { const b = a - p; d += `L${a},470 L${b + p * tip},${470 + h} L${b},470 `; }
        d += 'Z';
        el2(g, 'path', { d, fill: STEEL2, stroke: INK, 'stroke-width': 2 });
        arrow(g, x0 + 560, 270, x0 + 300, 270, { w: 4, head: 18 });
        const cap = L.text('pull', { x: x0 + 600, y: 246, size: 36 }); void cap;
        return g;
      };
      this.pr = panel(110, 'rip'); this.pc = panel(1030, 'cross');
      this.lr = L.text('<b>rip</b> · like a row of tiny chisels, paring along the fibers', { x: 110, y: 780, size: 36, w: 780 }); this.lr.classList.add('wrap');
      this.lc = L.text('<b>crosscut</b> · pointed like small knives, severing the fibers (seen end-on)', { x: 1030, y: 780, size: 36, w: 780 }); this.lc.classList.add('wrap');
      this.n = L.text('side views, magnified · not to scale', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
      this.h = L.text('the teeth', { x: 110, y: 130, size: 56 }); this.h.style.fontWeight = 700;
    },
    frame(t, sh) {
      const e = sh.ev;
      this.pr.setAttribute('opacity', L.ramp(t, e.rip - 0.3, e.rip + 0.3)); L.show(this.lr, L.ramp(t, e.rip - 0.3, e.rip + 0.3));
      this.pc.setAttribute('opacity', L.ramp(t, e.cross - 0.3, e.cross + 0.3)); L.show(this.lc, L.ramp(t, e.cross - 0.3, e.cross + 0.3));
      return {};
    },
  },
  S06: {
    build() {
      this.term = L.label({ romaji: 'dōzuki', kanji: '胴付鋸', gloss: 'a fine joinery saw', x: 96, y: 70 });
      this.spine = L.text(`spine · ${kj('背金')} keeps the thin blade stiff`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.cls = L.text(`classed as a crosscut saw · ${kj('横挽き')}`, { x: 96, y: 990, size: 40 });
      this.sh = L.label({ romaji: 'dōzuki', kanji: '胴付', gloss: "a tenon's shoulder: the face around its base", x: 96, y: 70 });
      this.shL = L.text('shoulder', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.cut = L.text('cutting the shoulder: a crosscut, down to the tenon', { x: 96, y: 990, size: 40, cls: 'plate' });
      this.note = L.text('proportions illustrative', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const e = sh.ev, P = G.dozuki;
      const tenonT = e.shoulder - 0.6;
      if (t < tenonT) {
        const T = getTools(); T.ry.piv.visible = false; T.kt.piv.visible = false; T.dz.piv.visible = true;
        showSaw(T.dz, P, t, -0.25, 0.035, 160);
        const cam = L.camera('front', [0, 210, 0], 1600, { orbit: 0.25, lift: 0.1 });
        T.dz.piv.updateMatrixWorld(true);
        const sp = new THREE.Vector3(P.len * 0.6, P.h + P.spine_h, 0).applyMatrix4(T.dz.g.matrixWorld);
        anchor(this.spine, cam, sp.toArray(), -120, -110);
        L.show(this.term, L.ramp(t, e.term - 0.3, e.term + 0.3)); L.show(this.spine, L.ramp(t, e.spine - 0.2, e.spine + 0.3));
        L.show(this.cls, L.ramp(t, e.cross - 0.2, e.cross + 0.3)); L.show(this.sh, 0); L.show(this.shL, 0); L.show(this.cut, 0);
        return { scene: T.s, camera: cam };
      }
      const S = getTenon(), cutting = t > e.cutting - 0.2;
      L.show(this.term, 0); L.show(this.spine, 0); L.show(this.cls, 0);
      S.done.visible = !cutting; S.shoulder.visible = !cutting; S.blank.visible = cutting; S.saw.g.visible = cutting;
      S.shoulder.material.opacity = 0.55 * L.ramp(t, e.shoulder - 0.2, e.shoulder + 0.5);
      const cam = L.camera('threeQ', [S.LEN, S.M / 2, 0], 1250, { orbit: 0.15, lift: 0.25 });
      if (S.kerf) { S.s.remove(S.kerf); S.kerf = null; }
      if (cutting) {
        const tc = t - (e.cutting - 0.2), period = 1.3, ph = tc / period, cyc = Math.floor(ph), f = ph - cyc;
        const pulling = f < 0.6, k = pulling ? L.ease(f / 0.6) : 1 - L.ease((f - 0.6) / 0.4);
        const depthMax = (S.M - S.T.t) / 2, D = Math.min(depthMax, 2 + 4.5 * (cyc + (pulling ? k : 1)));
        // saw in the plane x = LEN (waste side of the shoulder line), edge level along z, descending in -y
        const kx = S.LEN + 0.6;
        poseSaw(S.saw.g, false, P, [0, 0, -1], [0, 1, 0], [kx, S.M - D, S.M / 2], 40 + 110 * (1 - k));
        const g = new THREE.BoxGeometry(1.4, D, S.M + 2); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#2A2522' }));
        m.position.set(kx, S.M - D / 2 + 0.05, 0); S.s.add(m); S.kerf = m;
      }
      L.show(this.sh, cutting ? 0 : L.ramp(t, e.shoulder - 0.3, e.shoulder + 0.3));
      anchor(this.shL, cam, [S.LEN, S.M * 0.85, S.M / 2], 40, -10); L.show(this.shL, cutting ? 0 : L.ramp(t, e.shoulder, e.shoulder + 0.4));
      L.show(this.cut, L.ramp(t, e.cutting - 0.2, e.cutting + 0.3));
      return { scene: S.s, camera: cam };
    },
  },
  S07: {
    build() {
      this.term = L.label({ romaji: 'kataba', kanji: '片刃鋸', gloss: 'a single-edged saw, no spine', x: 96, y: 70 });
      this.note = L.text('proportions illustrative', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const T = getTools(), P = G.kataba; T.ry.piv.visible = false; T.dz.piv.visible = false; T.kt.piv.visible = true;
      showSaw(T.kt, P, t, -0.2, 0.04, 160);
      L.show(this.term, L.ramp(t, sh.ev.term - 0.3, sh.ev.term + 0.3));
      return { scene: T.s, camera: L.camera('front', [0, 220, 0], 1750, { orbit: 0.25, lift: 0.1 }) };
    },
  },
  S08: {
    build() {
      const svg = L.svgLayer(); const cx = 960, u = 22; // diagram units -> px
      const pl = G.diag.plate * u, st = G.diag.set * u, k = G.kerf_diag * u;
      this.h = L.text('the kerf, end-on', { x: 96, y: 70, size: 56 }); this.h.style.fontWeight = 700;
      // wood with the kerf
      const wood = el2(svg, 'g', {}); L.woodRect(wood, cx - 520, 520, 1040, 330, { vertical: true });
      el2(wood, 'rect', { x: cx - k / 2, y: 520, width: k, height: 250, fill: '#2A2522' });
      // the blade: plate down to the teeth, teeth bent alternately (front tooth left, next tooth right)
      this.blade = el2(svg, 'g', {});
      el2(this.blade, 'rect', { x: cx - pl / 2, y: 220, width: pl, height: 500, fill: STEEL2, stroke: INK, 'stroke-width': 2 });
      this.tl = el2(svg, 'path', { d: `M${cx - pl / 2},720 L${cx - k / 2},768 L${cx - k / 2 + pl},768 L${cx + pl / 2},720 Z`, fill: '#9AA0A6', stroke: INK, 'stroke-width': 2 });
      this.tr = el2(svg, 'path', { d: `M${cx - pl / 2},720 L${cx + k / 2 - pl},768 L${cx + k / 2},768 L${cx + pl / 2},720 Z`, fill: STEEL2, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '6 4' });
      // dimensions
      this.dim = el2(svg, 'g', {});
      const dimL = (x1, x2, y, lab, above = true) => { el2(this.dim, 'path', { d: `M${x1},${y} H${x2} M${x1},${y - 12} v24 M${x2},${y - 12} v24`, stroke: INK, 'stroke-width': 3, fill: 'none' }); return L.text(lab, { x: (x1 + x2) / 2, y: above ? y - 62 : y + 16, size: 36, align: 'center' }); };
      this.dPlate = dimL(cx - pl / 2, cx + pl / 2, 190, 'blade');
      this.dKerf = dimL(cx - k / 2, cx + k / 2, 880, 'kerf = blade + set on both sides', false);
      this.setL = L.text('<b>set</b> · <i>asari</i>: teeth bent out alternately, left and right', { x: cx + 560, y: 680, size: 36, w: 360 }); this.setL.classList.add('wrap');
      this.n = L.text('magnified · not to scale', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const e = sh.ev;
      const a = L.ramp(t, e.bent - 0.2, e.bent + 0.5); this.tl.setAttribute('opacity', a); this.tr.setAttribute('opacity', L.ramp(t, e.bent + 0.4, e.bent + 1.0));
      L.show(this.setL, L.ramp(t, e.set - 0.3, e.set + 0.3));
      this.dim.setAttribute('opacity', 1); L.show(this.dPlate, 1); L.show(this.dKerf, L.ramp(t, e.wider - 0.3, e.wider + 0.3));
      return {};
    },
  },
  S09: {
    build() {
      const svg = L.svgLayer(), hz = hatch(svg, 'h9');
      this.h = L.text('where does the kerf go?', { x: 96, y: 70, size: 56 }); this.h.style.fontWeight = 700;
      const u = 6, panels = [['take', 'take the line', 'sumi o harau', 'the kerf removes the line from the piece'],
        ['leave', 'leave the line', 'sumi o nokosu', 'the kerf is all in the waste; the whole line stays on the piece'],
        ['split', 'split the line', 'sumi o matagu (straddle)', 'the kerf is centered on the line; a sliver stays on each side']];
      this.p = panels.map(([key, en, ro, gl], i) => {
        const x0 = 96 + i * 590, cx = x0 + 250, g = el2(svg, 'g', {});
        // top view: piece (left, work side) and waste (right, hatched); the line at cx
        L.woodRect(g, x0, 330, 500, 300, { vertical: true });
        el2(g, 'rect', { x: cx, y: 330, width: x0 + 500 - cx, height: 300, fill: hz });
        const lw = G.diag.line * u; el2(g, 'rect', { x: cx - lw / 2, y: 330, width: lw, height: 300, fill: INK });
        const [a, b] = G.panels[key]; el2(g, 'rect', { x: cx + a * u, y: 318, width: (b - a) * u, height: 324, fill: '#F3EEE4', stroke: '#2A2522', 'stroke-width': 2, 'stroke-dasharray': '8 5' });
        const ti = L.text(`<b>${en}</b><br><i>${ro}</i>`, { x: x0, y: 180, size: 40, w: 520 }); ti.classList.add('wrap');
        const gt = L.text(gl, { x: x0, y: 660, size: 36, w: 500 }); gt.classList.add('wrap');
        const pw = L.text('piece', { x: x0 + 12, y: 340, size: 36, cls: 'plate' }), ww = L.text('waste', { x: x0 + 488, y: 340, size: 36, cls: 'plate', align: 'right' });
        return { g, ti, gt, pw, ww };
      });
      this.n = L.text('top views · proportions exaggerated · terms: skills-test manual (MHLW)', { x: 96, y: 990, size: 36, cls: 'soft' });
    },
    frame(t, sh) {
      const e = sh.ev, at = [e.away, e.leave, e.split];
      this.p.forEach((p, i) => { const a = L.ramp(t, at[i] - 0.5, at[i] + 0.1); p.g.setAttribute('opacity', a); L.show(p.ti, a); L.show(p.gt, a); L.show(p.pw, a); L.show(p.ww, a); });
      return {};
    },
  },
  S10: {
    build() {
      const svg = L.svgLayer(), hz = hatch(svg, 'h10');
      this.h = L.text('one tenon, two fits', { x: 96, y: 70, size: 56 }); this.h.style.fontWeight = 700;
      this.src = L.text('an example from the national skills-test manual for carpenters (MHLW)', { x: 96, y: 150, size: 36, cls: 'soft' });
      // end view of the member, magnified: tenon outline (thickness across, width up), waste hatched
      const cx = 620, cy = 590, S = 4.4, M = G.member * S, tt = G.tenon.t * S, tw = G.tenon.w * S;
      const g = el2(svg, 'g', {}); this.g = g;
      L.woodRect(g, cx - M / 2, cy - M / 2, M, M, { vertical: false });
      el2(g, 'rect', { x: cx - M / 2, y: cy - M / 2, width: M, height: M, fill: hz });
      el2(g, 'rect', { x: cx - tt / 2, y: cy - tw / 2, width: tt, height: tw, fill: '#E6C9A0', stroke: 'none' });
      const lw = 6, kw = 4; // line and kerf drawn wide (exaggerated)
      // thickness lines (vertical): kerfs centred on the line (split)
      this.th = el2(svg, 'g', {});
      [-1, 1].forEach((sd) => { const x = cx + sd * tt / 2; el2(this.th, 'rect', { x: x - lw / 2, y: cy - M / 2, width: lw, height: M, fill: INK }); el2(this.th, 'rect', { x: x - kw / 2, y: cy - M / 2 - 12, width: kw, height: M + 24, fill: '#F3EEE4', stroke: '#2A2522', 'stroke-width': 1.5, 'stroke-dasharray': '6 4' }); });
      // width lines (horizontal): kerfs just outside, in the waste (leave the line)
      this.wd = el2(svg, 'g', {});
      [-1, 1].forEach((sd) => { const y = cy + sd * tw / 2; el2(this.wd, 'rect', { x: cx - M / 2, y: y - lw / 2, width: M, height: lw, fill: INK }); el2(this.wd, 'rect', { x: cx - M / 2 - 12, y: sd > 0 ? y + lw / 2 : y - lw / 2 - kw, width: M + 24, height: kw, fill: '#F3EEE4', stroke: '#2A2522', 'stroke-width': 1.5, 'stroke-dasharray': '6 4' }); });
      this.tL = L.text('<b>thickness</b>: split the line → fits a little looser', { x: 1000, y: 380, size: 40, w: 820 }); this.tL.classList.add('wrap');
      this.wL = L.text('<b>width</b>: leave the line, the saw just on the waste side → fits tight', { x: 1000, y: 560, size: 40, w: 820 }); this.wL.classList.add('wrap');
      this.rL = L.text('either way, the line is the reference', { x: 1000, y: 760, size: 40, w: 820 });
      this.n = L.text('end view · lines and kerfs exaggerated', { x: 1824, y: 990, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const e = sh.ev;
      this.th.setAttribute('opacity', L.ramp(t, e.thick - 0.3, e.thick + 0.3)); L.show(this.tL, L.ramp(t, e.thick - 0.3, e.thick + 0.3));
      this.wd.setAttribute('opacity', L.ramp(t, e.width - 0.3, e.width + 0.3)); L.show(this.wL, L.ramp(t, e.width - 0.3, e.width + 0.3));
      L.show(this.rL, L.ramp(t, e.ref - 0.3, e.ref + 0.3));
      return {};
    },
  },
  S11: {
    build() {
      const svg = L.svgLayer();
      this.h = L.text('the same ideas, the other stroke', { x: 96, y: 70, size: 56 }); this.h.style.fontWeight = 700;
      L.text('<b>Japanese</b> · pull', { x: 96, y: 200, size: 40 }); L.text('<b>Western</b> · push', { x: 1000, y: 200, size: 40 });
      sawSil(svg, 400, 420, 1.15, 'ryoba'); L.text('ryōba: rip + crosscut', { x: 96, y: 470, size: 36 });
      sawSil(svg, 400, 760, 1.15, 'dozuki'); L.text('dōzuki: backed, for joinery', { x: 96, y: 810, size: 36 });
      arrow(svg, 720, 300, 520, 300, { w: 5 }); arrow(svg, 720, 650, 520, 650, { w: 5 });
      sawSil(svg, 1000, 420, 1.15, 'panel'); L.text('hand saw: rip or crosscut', { x: 1000, y: 470, size: 36 });
      sawSil(svg, 1000, 760, 1.15, 'back'); L.text('backsaw: backed, for joinery', { x: 1000, y: 810, size: 36 });
      arrow(svg, 1300, 300, 1500, 300, { w: 5 }); arrow(svg, 1300, 650, 1500, 650, { w: 5 });
      L.text('silhouettes · not to scale', { x: 1824, y: 990, size: 36, cls: 'soft', align: 'right' });
    },
    frame() { return {}; },
  },
  S12: {
    build() {
      const a = L.text('Next · Episode 4 · Part 2', { x: 96, y: 330, size: 48 }); a.style.fontWeight = 700;
      const b = L.text('The Cutting Kit', { x: 96, y: 410, size: 96 }); b.style.fontWeight = 700;
      this.c = L.text('chisels (nomi), the hammer (gennō), the plane (kanna)', { x: 96, y: 560, size: 40, cls: 'soft' });
    },
    frame(t, sh) { L.show(this.c, L.ramp(t, sh.ev.chisels - 0.2, sh.ev.chisels + 0.3)); return {}; },
  },
  S13: {
    build() {
      const h = L.text('Pull to cut. Decide where the kerf goes.', { x: 96, y: 70, size: 60 }); h.style.fontWeight = 700;
      L.text('rip along the grain · crosscut across it · take, leave or split the line', { x: 96, y: 160, size: 36, cls: 'soft', w: 1728 });
      const rows = [
        ['ryōba', '両刃', 'double-edged saw', 'one rip edge, one crosscut edge; from the Meiji era'],
        ['tatebiki / yokobiki', '縦挽き / 横挽き', 'rip / crosscut', 'cutting along / across the grain'],
        ['dōzuki', '胴付鋸', 'backed joinery saw', 'thin blade stiffened by a metal spine (背金); classed as crosscut'],
        ['dōzuki', '胴付', 'tenon shoulder', 'the face around the base of a tenon'],
        ['kataba', '片刃鋸', 'single-edged saw', 'one edge, no spine'],
        ['asari', '', 'set', 'teeth bent out alternately; makes the kerf wider than the blade'],
        ['kerf', '', 'saw cut width', 'blade plus set'],
        ['take / leave / split', '', 'the line', 'sumi o harau / nokosu / matagu (skills-test manual)'],
      ];
      const g = L.text('', { x: 96, y: 250, size: 36, w: 1728 });
      g.innerHTML = '<div class="soft" style="font-size:36px;margin-bottom:12px;letter-spacing:.08em">GLOSSARY · EPISODE 4 · PART 1</div>' + rows.map((r) => `<div style="display:flex;gap:30px;margin-bottom:12px;align-items:baseline"><div style="width:700px;font-weight:700;font-size:38px"><i>${r[0]}</i> <span style="font-family:'Noto Serif CJK JP',serif;font-style:normal">${r[1]}</span></div><div style="width:1000px;white-space:normal;font-size:36px"><b>${r[2]}</b> — <span class="soft">${r[3]}</span></div></div>`).join('');
    },
    frame() { return {}; },
  },
  S14: {
    build() {
      const a = L.text('One note', { x: 960, y: 380, size: 48, align: 'center' }); a.style.fontWeight = 700;
      const b = L.text('Sharp-tool technique, and how to use these tools safely, is best learned from a teacher, at a bench, in person.', { x: 960, y: 470, size: 48, align: 'center', w: 1400 }); b.classList.add('wrap');
    },
    frame() { return {}; },
  },
  S15: { fadeOut: 1.0, build() { endCard(); }, frame() { return {}; } },
};

function titleCard() {
  const svg = L.svgLayer();
  el2(svg, 'line', { x1: 96, y1: 470, x2: 560, y2: 470, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 300, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('EPISODE 4 · PART 1', { x: 96, y: 370, size: 48 }); b.style.fontWeight = 700; b.style.letterSpacing = '0.12em';
  const c = L.text('The Cutting Kit', { x: 96, y: 510, size: 110 }); c.style.fontWeight = 700;
  L.text('Saws and the Line', { x: 96, y: 650, size: 64, cls: 'soft' });
  sawSil(svg, 1420, 560, 1.3, 'ryoba');
}
function endCard() {
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 330, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('Next · Episode 4 · Part 2', { x: 96, y: 420, size: 48 }); b.style.fontWeight = 700;
  const c = L.text('The Cutting Kit', { x: 96, y: 500, size: 96 }); c.style.fontWeight = 700;
  L.text('chisels, the hammer and the plane — each beside its Western cousin', { x: 96, y: 640, size: 40, cls: 'soft' });
  const svg = L.svgLayer(); el2(svg, 'line', { x1: 96, y1: 740, x2: 560, y2: 740, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
}
