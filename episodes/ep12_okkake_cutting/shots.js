// Episode 12 shots: cutting the okkake daisen-tsugi's lower piece in the training course's stages, assembly, and the
// series close. Every piece shown is one of the exact cut states from params.py (L0-L6); the finished state equals
// Episode 11's lower piece. Saw cuts are drawn as schematic strokes; waste comes away as the course describes.
import { makeEdgeTools } from '/shared/render/edgetools.js';
import { makeSaws } from '/shared/render/saws.js';
let L, THREE, G, TL, ET, SAWS;
const R = (p) => `/episodes/ep12_okkake_cutting/${p}`;

export async function init(lib) {
  L = lib; THREE = lib.THREE;
  G = await (await fetch(R('build/geometry.json'))).json();
  TL = await (await fetch(R('build/timeline.json'))).json();
  ET = makeEdgeTools(L); SAWS = makeSaws(L);
  const byId = Object.fromEntries(TL.shots.map((s) => [s.id, s]));
  const shots = Object.entries(SHOTS).map(([id, def]) => ({ id, ...byId[id], ...def }));
  return { shots, fps: TL.fps, total: TL.total };
}
function el2(parent, tag, attrs) { return L.el('svg:' + tag, attrs, parent); }
function anchor(d, cam, pt, dx = 0, dy = 0) { const [x, y] = L.toScreen(cam, pt); d.style.left = x + dx + 'px'; d.style.top = y + dy + 'px'; }
const INK = '#1B1B1B', WOOD = '#E6C9A0', PEGC = '#9C6B3C';
const kj = (s) => `<span style="font-family:'Noto Serif CJK JP',serif;font-style:normal;font-weight:600">${s}</span>`;
function arrow(svg, x1, y1, x2, y2, { color = INK, w = 4, head = 18 } = {}) {
  const g = el2(svg, 'g', {}); const a = Math.atan2(y2 - y1, x2 - x1);
  el2(g, 'line', { x1, y1, x2: x2 - Math.cos(a) * head * 0.8, y2: y2 - Math.sin(a) * head * 0.8, stroke: color, 'stroke-width': w });
  const p = [[x2, y2], [x2 - Math.cos(a - 0.42) * head, y2 - Math.sin(a - 0.42) * head], [x2 - Math.cos(a + 0.42) * head, y2 - Math.sin(a + 0.42) * head]];
  el2(g, 'polygon', { points: p.map((q) => q.join(',')).join(' '), fill: color });
  return g;
}
function arrow3(svg, cam, a, b, opts) { const [x1, y1] = L.toScreen(cam, a), [x2, y2] = L.toScreen(cam, b); return arrow(svg, x1, y1, x2, y2, opts); }
const r = (t, a) => L.ramp(t, a - 0.3, a + 0.3);
const win = (t, a, b) => L.ramp(t, a - 0.3, a + 0.2) * (1 - L.ramp(t, b - 0.3, b));
const SRC = 'one training course\'s sequence (WBT, ものつくり大学)';

// ---------- ink lines ----------
function topLine(ax, az, bx, bz, y, w = 2.2) { const m = L.inkLine(Math.hypot(bx - ax, bz - az), w); m.rotation.order = 'YXZ'; m.rotation.set(-Math.PI / 2, Math.atan2(-(bz - az), bx - ax), 0); m.position.set(ax, y + 0.4, az); return m; }
function sideLine(ax, ay, bx, by, z, w = 2.2) { const m = L.inkLine(Math.hypot(bx - ax, by - ay), w); m.rotation.set(0, 0, Math.atan2(by - ay, bx - ax)); m.position.set(ax, ay, z + 0.4); return m; }
// on the far side face (z = -W/2, facing -z)
function farLine(ax, ay, bx, by, z, w = 2.2) { const m = L.inkLine(Math.hypot(bx - ax, by - ay), w); m.rotation.order = 'YXZ'; m.rotation.set(0, Math.PI, -Math.atan2(by - ay, bx - ax)); m.position.set(ax, ay, z - 0.4); return m; }
function group(list) { const g = new THREE.Group(); list.forEach((m) => g.add(m)); return g; }

let S;
function getScene() {
  if (S) return S;
  const s = L.makeScene({ shadowBox: 2200, lightDir: [0.45, 1, 0.65] });
  const W = G.W, H = G.H, Lk = G.L, F = G.F, e = G.E / 2, xs = (y) => Lk / 2 + (y - H / 2) * G.SLOPE;
  const P = G.states.map((m) => L.memberMesh(m, { seed: 3 })); const lG = new THREE.Group(); P.forEach((m) => lG.add(m)); s.add(lG);
  const up = L.memberMesh(G.upper, { seed: 7, tint: '#EAD3AE' }); const uG = new THREE.Group(); uG.add(up); s.add(uG);
  const pegs = G.pegs.map((p) => { const g = new THREE.Group(); g.add(L.memberMesh(p, { seed: 11, tint: PEGC })); s.add(g); return g; });
  const blk = L.memberMesh(L.boxMember('blk', [-540, -60, -100, 80, 60, 200], 'z'), { seed: 9 }); s.add(blk);
  // marks (lower piece)
  const T = H;
  const mEnd = group([topLine(Lk + F, -W / 2, Lk + F, W / 2, T)]);
  const mHousing = group([topLine(-F, -e, -F, e, T), topLine(-F, e, 0, e, T), topLine(-F, -e, 0, -e, T)]);
  const mShoulder = group([topLine(0, -e, 0, W / 2, T)]);
  const mAlong = group([topLine(0, -e, Lk / 2, -e, T), topLine(Lk / 2, e, Lk + F, e, T), topLine(Lk, -e, Lk + F, -e, T)]);
  const mOther = group([topLine(Lk, -W / 2, Lk, -e, T), topLine(xs(H), -e - 6, xs(H), e + 6, T, 3)]);
  const mSlope = group([topLine(xs(H), -e, xs(H), e, T), sideLine(xs(0), 0, xs(H), H, W / 2), sideLine(0, 0, 0, H, W / 2)]);
  const mFar = group([farLine(Lk / 2, 0, Lk / 2, H, -W / 2, 2.6)]);
  const mPegs = group([Lk / 4, 3 * Lk / 4].flatMap((x) => [farLine(x, 10, x, H - 10, -W / 2), farLine(x - 7.5, H / 2 - 7.5, x + 7.5, H / 2 - 7.5, -W / 2), farLine(x - 7.5, H / 2 + 7.5, x + 7.5, H / 2 + 7.5, -W / 2), farLine(x - 7.5, H / 2 - 7.5, x - 7.5, H / 2 + 7.5, -W / 2), farLine(x + 7.5, H / 2 - 7.5, x + 7.5, H / 2 + 7.5, -W / 2)]));
  const mGrain = group([0].map(() => null).filter(Boolean));
  const mSlope2 = group([sideLine(xs(0), 0, xs(H), H, e)]);
  const kerfs = group([15, 33, 51, 69, 87, 105, 123, 141, 159].map((x) => topLine(x, -e, x, e, T, 3)));
  [mEnd, mHousing, mShoulder, mAlong, mOther, mSlope, mFar, mPegs, mGrain, mSlope2, kerfs].forEach((g) => lG.add(g));
  // waste pieces
  const wb = (name, box) => L.memberMesh(L.boxMember(name, box, 'x'), { seed: 3 });
  const wSlice = wb('ws', [Lk + F, 0, -W / 2, G.SLICE, H, W]);
  const wA = wb('wa', [Lk / 2, 0, e, Lk / 2 + F, H, W / 2 - e]);
  const wB = wb('wb', [0, 0, e, Lk / 2, H, W / 2 - e]);
  const wS = wb('wst', [0, 0, -e, Lk / 2, H, G.E]);
  const wT = wb('wt', [Lk, 0, -W / 2, F, H, W / 2 - e]);
  [wSlice, wA, wB, wS, wT].forEach((m) => lG.add(m));
  const ch = ET.chisel({ blade: 60, width: 15, thick: 7, bevel: 28, neck: 40, handle: 110, handle_d: 26, hoop: true });
  const cp = new THREE.Group(); cp.add(ch.g); s.add(cp); ch.piv = cp; cp.visible = false;
  const ry = SAWS.ryoba({ len: 240, h_heel: 95, h_toe: 120, plate: 0.6, neck: 60, handle: 260, handle_d: 30, rip_pitch: 9, cross_pitch: 4.5 });
  const rp = new THREE.Group(); rp.add(ry.g); s.add(rp); ry.piv = rp; rp.visible = false;
  S = { s, ry, P, lG, uG, pegs, blk, mEnd, mHousing, mShoulder, mAlong, mOther, mSlope, mFar, mPegs, mSlope2, kerfs, wSlice, wA, wB, wS, wT, ch, xs };
  return S;
}
function state(sc, k) { sc.P.forEach((m, i) => { m.visible = i === k; }); }
function reset(sc) {
  ['mEnd', 'mHousing', 'mShoulder', 'mAlong', 'mOther', 'mSlope', 'mFar', 'mPegs', 'mSlope2', 'kerfs', 'wSlice', 'wA', 'wB', 'wS', 'wT'].forEach((k) => { sc[k].visible = false; sc[k].position.set(0, 0, 0); });
  sc.uG.visible = false; sc.uG.position.set(0, 0, 0); sc.pegs.forEach((p) => { p.visible = false; p.position.set(0, 0, 0); }); sc.ch.piv.visible = false; sc.ry.piv.visible = false;
}
function poseSaw(t, P, edgeTop, dir, up, p, sAlong) {
  const d = new THREE.Vector3(...dir).normalize(), u = new THREE.Vector3(...up).normalize();
  const yl = edgeTop ? u.clone().negate() : u.clone(), zl = new THREE.Vector3().crossVectors(d, yl).normalize();
  t.piv.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(d, yl, zl));
  const hh = edgeTop ? P.h_heel + (P.h_toe - P.h_heel) * sAlong / P.len : 0;
  const local = new THREE.Vector3(sAlong, hh, 0).applyQuaternion(t.piv.quaternion);
  t.piv.position.set(p[0] - local.x, p[1] - local.y, p[2] - local.z); t.piv.visible = true;
}
const RY = { len: 240, h_heel: 95, h_toe: 120 };
const sawStroke = (t, period = 1.4) => { const f = (t / period) % 1; return f < 0.6 ? L.ease(f / 0.6) : 1 - L.ease((f - 0.6) / 0.4); };
const stroke = (t, period = 0.9) => { const f = (t / period) % 1; return f < 0.3 ? f / 0.3 : 1 - (f - 0.3) / 0.7; };

const SHOTS = {
  S01: {
    build() { this.src = L.text('the finished joint from Episode 11 · sizes: one lab\'s test proportions', { x: 96, y: 966, size: 36, cls: 'soft' }); },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev; reset(sc); state(sc, 6); sc.uG.visible = true;
      const k = L.ease(L.ramp(t, e.lowered, e.lowered + 2.0)); sc.uG.position.set(13 * (1 - k), 300 * (1 - k), 0);
      sc.pegs.forEach((p, i) => { const kk = L.ease(L.ramp(t, e.pegs + 0.5 + i * 0.8, e.pegs + 1.5 + i * 0.8)); p.visible = kk > 0.001; p.position.set(0, 0, (i ? -1 : 1) * 220 * (1 - kk)); });
      L.show(this.src, r(t, e.course));
      return { scene: sc.s, camera: L.camera('threeQ', [G.L / 2, 60 + 110 * (1 - k), 0], 1700, { orbit: -0.3 + 0.008 * t, lift: 0.7 }) };
    },
  },
  S02: { fadeIn: 0.5, fadeOut: 0.6, build() { titleCard(); }, frame() { return {}; } },
  S03: {
    build() {
      const P = (s) => L.text(s, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.le = L.text(`end line · ${kj('砂切り')}`, { x: 0, y: 0, size: 40, cls: 'plate' }); this.lh = P('housing: for the other piece\'s tongue');
      this.ls = P('shoulder · the line along the beam'); this.lo = P('the other shoulder · marks for the slope');
      this.lsl = P('slope line, top face and this side face'); this.lu = L.text('the underside: marked the same way as the top', { x: 96, y: 966, size: 40, cls: 'plate' });
      this.lf = L.text('other side face: the splice\'s center line, and the peg lines evenly either side of it · the sashigane\'s blade width as a quick gauge', { x: 96, y: 920, size: 36, cls: 'plate', w: 1700 }); this.lf.classList.add('wrap');
      this.src = L.text(SRC, { x: 1824, y: 60, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev; reset(sc); state(sc, 0);
      sc.mEnd.visible = t > e.end - 0.3; sc.mHousing.visible = t > e.housing - 0.3; sc.mShoulder.visible = t > e.shoulder - 0.3; sc.mAlong.visible = t > e.along - 0.3;
      sc.mOther.visible = t > e.other - 0.3; sc.mSlope.visible = t > e.slope - 0.3; sc.mFar.visible = t > e.center - 0.3; sc.mPegs.visible = t > e.pegs - 0.3;
      const far = t > e.other6 - 0.5;
      const cam = far ? L.camera('threeQ', [G.L / 2, G.H / 2, 0], 1250, { orbit: Math.PI - 0.35, lift: 0.35 }) : L.camera('threeQ', [G.L / 2, G.H, 0], 1250, { orbit: -0.3, lift: 0.9 });
      const n = !far;
      anchor(this.le, cam, [G.L + G.F, G.H, -G.W / 2], -40, -100); anchor(this.lh, cam, [-G.F, G.H, -G.W / 2], -300, -110);
      anchor(this.ls, cam, [0, G.H, G.W / 2], -200, 30); anchor(this.lo, cam, [G.L, G.H, -G.W / 2], -420, -170); anchor(this.lsl, cam, [G.L / 2, G.H / 2, G.W / 2], 40, 60);
      L.show(this.le, n * r(t, e.end)); L.show(this.lh, n * r(t, e.housing)); L.show(this.ls, n * win(t, e.shoulder, e.slope)); L.show(this.lo, n * win(t, e.other, e.slope));
      L.show(this.lsl, n * win(t, e.slope, e.under)); L.show(this.lu, win(t, e.under, e.other6)); L.show(this.lf, r(t, e.center)); L.show(this.src, 1);
      return { scene: sc.s, camera: cam };
    },
  },
  S04: {
    build() {
      this.svg = L.svgLayer(); this.items = [];
      const P = (s) => L.text(s, { x: 96, y: 966, size: 40, cls: 'plate' });
      this.c0 = P('cut the end at the end line · mark the end grain');
      this.c1 = P('most cuts leave half the line: half the ink line stays on the piece (as in Episode 10)');
      this.c2 = P('peg holes first: chopped from the side face, about a quarter of the width deep');
      this.c3 = P('rip from the end, half the line left, to just past the slope · crosscut at the slope');
      this.c4 = P('crosscut the shoulder · chisel into the end grain at the slope cut · split it off');
      this.src = L.text(SRC, { x: 1824, y: 60, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev, W = G.W, H = G.H, Lk = G.L, F = G.F, ee = G.E / 2; reset(sc); this.items.forEach((x) => x.remove()); this.items = [];
      const st = t < e.cutting + 1.0 ? 0 : t < e.holes ? 1 : t < e.away ? 2 : t < e.splits + 0.6 ? 3 : 4; state(sc, st);
      [sc.mEnd, sc.mHousing, sc.mShoulder, sc.mAlong, sc.mOther, sc.mSlope].forEach((g) => { g.visible = st < 3; });
      sc.wSlice.visible = t > e.cutting && t < e.cutting + 2.2; const k0 = L.ease(L.ramp(t, e.cutting + 0.8, e.cutting + 2.0)); sc.wSlice.position.set(80 * k0, -80 * k0, 0);
      sc.wA.visible = st === 2 && t > e.rips - 0.3 || (t >= e.away && t < e.away + 1.2); const ka = L.ease(L.ramp(t, e.away - 0.2, e.away + 1.0)); sc.wA.position.set(30 * ka, 40 * ka, 140 * ka);
      sc.wB.visible = t > e.splits - 0.3 && t < e.splits + 1.4; const kb = L.ease(L.ramp(t, e.splits, e.splits + 1.2)); sc.wB.position.set(-20 * kb, 40 * kb, 140 * kb);
      const far = t > e.holes - 0.5 && t < e.rips - 0.3;
      if (far) { const c = sc.ch; c.piv.visible = true; c.piv.rotation.set(Math.PI / 2, 0, 0); c.piv.position.set(Lk / 4, H / 2, -W / 2 - 10 - 25 * stroke(t)); }
      if (t > e.chisel - 0.3 && t < e.splits + 0.3) { const c = sc.ch; c.piv.visible = true; c.piv.rotation.set(0, 0, -Math.PI / 2); c.piv.position.set(Lk / 2 + 4, H + 10 + 20 * stroke(t), W / 4 + ee / 2); }
      const sk = sawStroke(t);
      if (t > e.rips - 0.2 && t < e.cross - 0.2) { const dep = H * L.ramp(t, e.rips, e.cross - 0.5); poseSaw(sc.ry, RY, true, [-1, 0, 0], [0, 1, 0], [Lk * 0.75 + 20, H - dep, ee + 0.3], 40 + 120 * sk); }
      else if (t > e.cross - 0.2 && t < e.away - 0.2) { const dep = H * L.ramp(t, e.cross, e.away - 0.5); poseSaw(sc.ry, RY, true, [0, 0, -1], [0, 1, 0], [Lk / 2 + 0.3, H - dep, W / 2 - 20], 40 + 100 * sk); }
      else if (t > e.shoulder - 0.2 && t < e.chisel - 0.2) { const dep = H * L.ramp(t, e.shoulder, e.chisel - 0.5); poseSaw(sc.ry, RY, true, [0, 0, -1], [0, 1, 0], [0.3, H - dep, W / 2 - 20], 40 + 100 * sk); }
      const cam = far ? L.camera('threeQ', [Lk / 2, H / 2, 0], 1300, { orbit: Math.PI - 0.35, lift: 0.4 }) : L.camera('threeQ', [Lk / 2, H / 2, 0], 1300, { orbit: -0.3, lift: 0.6 });
      const sa = win(t, e.rips, e.away); if (sa > 0.01) { const a1 = arrow3(this.svg, cam, [Lk + F, H + 2, ee], [Lk / 2 - 15, H + 2, ee], { w: 5 }); a1.setAttribute('opacity', sa); this.items.push(a1); const a2 = arrow3(this.svg, cam, [Lk / 2, H + 2, W / 2], [Lk / 2, H + 2, ee + 2], { w: 5 }); a2.setAttribute('opacity', r(t, e.cross) * sa); this.items.push(a2); }
      const sb = win(t, e.shoulder, e.chisel); if (sb > 0.01) { const a3 = arrow3(this.svg, cam, [0, H + 2, W / 2], [0, H + 2, ee + 3], { w: 5 }); a3.setAttribute('opacity', sb); this.items.push(a3); }
      L.show(this.c0, win(t, e.cutting, e.half)); L.show(this.c1, win(t, e.half, e.holes)); L.show(this.c2, win(t, e.holes, e.rips)); L.show(this.c3, win(t, e.rips, e.shoulder)); L.show(this.c4, r(t, e.shoulder)); L.show(this.src, 1);
      return { scene: sc.s, camera: cam };
    },
  },
  S05: {
    build() {
      const P = (s) => L.text(s, { x: 96, y: 966, size: 40, cls: 'plate' });
      this.c1 = P('mark the slope again, on the newly split face · saw it, half the line left');
      this.c2 = P('kerfs a chisel\'s width apart, back to the shoulder · chop · pare, half the line left');
      this.c3 = P('the housing at the shoulder: kerfs, then the chisel · the tongue: rip and crosscut');
      this.c4 = P('the peg holes: marked on the newly cut faces and chopped');
      this.c5 = P('the upper piece: the same shape, its slope running the other way');
      this.src = L.text(SRC, { x: 1824, y: 60, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev, W = G.W, H = G.H, Lk = G.L, ee = G.E / 2; reset(sc);
      const st = t < e.chop + 1.0 ? 4 : t < e.tongue + 1.2 ? 5 : 6; state(sc, st);
      sc.mSlope2.visible = t > e.mark - 0.3 && st === 4; sc.kerfs.visible = t > e.kerfs - 0.3 && st === 4;
      sc.wS.visible = t > e.chop && t < e.chop + 1.8; const ks = L.ease(L.ramp(t, e.chop + 0.6, e.chop + 1.6)); sc.wS.position.set(0, 160 * ks, 60 * ks);
      sc.wT.visible = t > e.tongue && t < e.tongue + 2.0; const kt = L.ease(L.ramp(t, e.tongue + 0.6, e.tongue + 1.8)); sc.wT.position.set(40 * kt, -60 * kt, -100 * kt);
      if (t > e.kerfs && t < e.chop + 1.0) { const c = sc.ch; c.piv.visible = true; c.piv.rotation.set(0, 0, -Math.PI / 2); c.piv.position.set(60, H + 8 + 25 * stroke(t), 0); }
      if (t > e.housing - 0.2 && t < e.tongue) { const c = sc.ch; c.piv.visible = true; c.piv.rotation.set(0, 0, -Math.PI / 2); c.piv.position.set(-G.F / 2, H + 8 + 25 * stroke(t), 0); }
      sc.uG.visible = t > e.upper - 0.3; sc.uG.position.set(0, 330, 0);
      const cam = L.camera('threeQ', [Lk / 2, H / 2 + (t > e.upper - 0.3 ? 120 : 0), 0], t > e.upper - 0.3 ? 1700 : 1100, { orbit: -0.35, lift: 0.75 });
      L.show(this.c1, win(t, e.mark, e.kerfs)); L.show(this.c2, win(t, e.kerfs, e.housing)); L.show(this.c3, win(t, e.housing, e.last)); L.show(this.c4, win(t, e.last, e.upper)); L.show(this.c5, r(t, e.upper)); L.show(this.src, 1);
      return { scene: sc.s, camera: cam };
    },
  },
  S06: {
    build() {
      this.l1 = L.text('the upper lowered onto the lower · pegs from opposite sides', { x: 96, y: 966, size: 40, cls: 'plate' });
      this.l2 = L.text('a fit where light taps bring the pieces level; the pegs stop them slipping (one test database)', { x: 96, y: 966, size: 40, cls: 'plate' });
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev; reset(sc); state(sc, 6); sc.uG.visible = true;
      const k = L.ease(L.ramp(t, e.lowered, e.lowered + 1.6)); sc.uG.position.set(13 * (1 - k), 300 * (1 - k), 0);
      sc.pegs.forEach((p, i) => { const kk = L.ease(L.ramp(t, e.pegs + 0.4 + i * 0.8, e.pegs + 1.4 + i * 0.8)); p.visible = kk > 0.001; p.position.set(0, 0, (i ? -1 : 1) * 220 * (1 - kk)); });
      L.show(this.l1, win(t, e.lowered, e.warns)); L.show(this.l2, r(t, e.warns));
      return { scene: sc.s, camera: L.camera('threeQ', [G.L / 2, 60 + 110 * (1 - k), 0], 1600, { orbit: -0.3, lift: 0.6 }) };
    },
  },
  S07: {
    build() {
      const h = L.text('Japanese Joinery by Hand · the series', { x: 96, y: 64, size: 56 }); h.style.fontWeight = 700;
      const eps = [['1', 'Measure Once: the story stick'], ['2', 'The marking kit: the sashigane'], ['2b', 'Ink line, pen and gauges'], ['3', 'From plan to timber'],
        ['4', 'Saws and the line'], ['4b', 'Chisels, hammer and plane'], ['5', 'The first joint: the dovetail splice'], ['6', 'Marking out and cutting it'],
        ['7', 'Mortise and tenon'], ['8', 'Beam over beam: the crossing joint'], ['9', 'The gooseneck'], ['10', 'Cutting the gooseneck'], ['11', 'The other splice: the okkake'], ['12', 'Cutting the okkake']];
      this.cards = eps.map(([n, ttl], i) => { const col = i % 2, row = Math.floor(i / 2); const d = L.text(`<b>${n}</b> · ${ttl}`, { x: 96 + col * 880, y: 170 + row * 110, size: 40 }); return d; });
    },
    frame(t, sh) { const e = sh.ev; this.cards.forEach((d, i) => L.show(d, L.ramp(t, e.story - 0.5 + i * 0.35, e.story + i * 0.35))); return {}; },
  },
  S08: {
    build() {
      const h = L.text('Mark the lower piece first, chop the peg holes early, take the waste off in stages, cut the slope; make the upper the same, its slope reversed.', { x: 96, y: 60, size: 46, w: 1728 }); h.style.fontWeight = 700; h.classList.add('wrap');
      L.text('one training course\'s sequence (WBT); others may order things differently', { x: 96, y: 200, size: 36, cls: 'soft', w: 1728 });
      const rows = [
        ['okkake daisen-tsugi', '追掛け大栓継ぎ', 'the pegged splice', 'from Episode 11'],
        ['end line', '砂切り', 'end crosscut line', 'marked first; the end is cut at it'],
        ['lower piece', '下木', 'marked and cut first', 'the upper is the same shape, its slope reversed'],
        ['daisen', '大栓', 'the pegs', 'holes started early from the side face that stays whole'],
        ['ago', '顎', 'the sloped step', 'sawn and pared, half the line left'],
        ['(housing)', '', 'at the shoulder', 'takes the other piece\'s tongue (mechigai 目違)'],
      ];
      const g = L.text('', { x: 96, y: 290, size: 36, w: 1728 });
      g.innerHTML = '<div class="soft" style="font-size:36px;margin-bottom:12px;letter-spacing:.08em">GLOSSARY · EPISODE 12</div>' + rows.map((x) => `<div style="display:flex;gap:30px;margin-bottom:14px;align-items:baseline"><div style="width:660px;font-weight:700;font-size:38px"><i>${x[0]}</i> <span style="font-family:'Noto Serif CJK JP',serif;font-style:normal">${x[1]}</span></div><div style="width:1040px;white-space:normal;font-size:36px"><b>${x[2]}</b> — <span class="soft">${x[3]}</span></div></div>`).join('');
    },
    frame() { return {}; },
  },
  S09: {
    build() {
      const a = L.text('One note', { x: 960, y: 380, size: 48, align: 'center' }); a.style.fontWeight = 700;
      const b = L.text('Sharp-tool technique, and how to use these tools safely, is best learned from a teacher, at a bench, in person.', { x: 960, y: 470, size: 48, align: 'center', w: 1400 }); b.classList.add('wrap');
    },
    frame() { return {}; },
  },
  S10: { fadeOut: 1.2, build() { endCard(); }, frame() { return {}; } },
};

function titleCard() {
  const svg = L.svgLayer();
  el2(svg, 'line', { x1: 96, y1: 470, x2: 560, y2: 470, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 300, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('EPISODE 12', { x: 96, y: 370, size: 48 }); b.style.fontWeight = 700; b.style.letterSpacing = '0.12em';
  const c = L.text('Cutting the Okkake', { x: 96, y: 510, size: 96 }); c.style.fontWeight = 700;
  L.text(`the <i>okkake daisen-tsugi</i> ${kj('追掛け大栓継ぎ')}, step by step`, { x: 96, y: 650, size: 52, cls: 'soft' });
}
function endCard() {
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 380, size: 40 }); a.style.letterSpacing = '0.18em';
  const c = L.text('Thank you for watching', { x: 96, y: 460, size: 96 }); c.style.fontWeight = 700;
  L.text('learn sharp-tool work from a teacher, at a bench', { x: 96, y: 600, size: 40, cls: 'soft' });
  const svg = L.svgLayer(); el2(svg, 'line', { x1: 96, y1: 700, x2: 560, y2: 700, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
}
