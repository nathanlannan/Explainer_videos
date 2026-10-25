// Episode 10 shots: marking out and cutting the koshikake kama-tsugi, following one training course's sequence (WBT).
// Every piece shown is one of the exact cut states from params.py (F0-F2, M0-M2); tools are the series models. Cuts whose
// true saw pose would mislead (the piece is turned in practice) are drawn as schematic strokes, as in Episode 6.
import { makeSaws } from '/shared/render/saws.js';
import { makeEdgeTools } from '/shared/render/edgetools.js';
let L, THREE, G, TL, SAWS, ET;
const R = (p) => `/episodes/ep10_kama_cutting/${p}`;

export async function init(lib) {
  L = lib; THREE = lib.THREE;
  G = await (await fetch(R('build/geometry.json'))).json();
  TL = await (await fetch(R('build/timeline.json'))).json();
  SAWS = makeSaws(L); ET = makeEdgeTools(L);
  const byId = Object.fromEntries(TL.shots.map((s) => [s.id, s]));
  const shots = Object.entries(SHOTS).map(([id, def]) => ({ id, ...byId[id], ...def }));
  return { shots, fps: TL.fps, total: TL.total };
}
function el2(parent, tag, attrs) { return L.el('svg:' + tag, attrs, parent); }
function anchor(d, cam, pt, dx = 0, dy = 0) { const [x, y] = L.toScreen(cam, pt); d.style.left = x + dx + 'px'; d.style.top = y + dy + 'px'; }
const INK = '#1B1B1B', GHOST = '#7D8EA0', WOOD = '#E6C9A0', WOODL = '#EDD6B4';
const kj = (s) => `<span style="font-family:'Noto Serif CJK JP',serif;font-style:normal;font-weight:600">${s}</span>`;
function arrow(svg, x1, y1, x2, y2, { color = INK, w = 4, head = 18 } = {}) {
  const g = el2(svg, 'g', {}); const a = Math.atan2(y2 - y1, x2 - x1);
  el2(g, 'line', { x1, y1, x2: x2 - Math.cos(a) * head * 0.8, y2: y2 - Math.sin(a) * head * 0.8, stroke: color, 'stroke-width': w });
  const p = [[x2, y2], [x2 - Math.cos(a - 0.42) * head, y2 - Math.sin(a - 0.42) * head], [x2 - Math.cos(a + 0.42) * head, y2 - Math.sin(a + 0.42) * head]];
  el2(g, 'polygon', { points: p.map((q) => q.join(',')).join(' '), fill: color });
  return g;
}
function arrow3(svg, cam, a, b, opts) { const [x1, y1] = L.toScreen(cam, a), [x2, y2] = L.toScreen(cam, b); return arrow(svg, x1, y1, x2, y2, opts); }
const win = (t, a, b) => L.ramp(t, a - 0.3, a + 0.2) * (1 - L.ramp(t, b - 0.3, b));
const rr = (t, a) => L.ramp(t, a - 0.3, a + 0.3);

// ---------- ink lines on faces ----------
function topLine(ax, az, bx, bz, y, w = 2.2) { const m = L.inkLine(Math.hypot(bx - ax, bz - az), w); m.rotation.order = 'YXZ'; m.rotation.set(-Math.PI / 2, Math.atan2(-(bz - az), bx - ax), 0); m.position.set(ax, y + 0.4, az); return m; }
function sideLine(ax, ay, bx, by, z, w = 2.2) { const m = L.inkLine(Math.hypot(bx - ax, by - ay), w); m.rotation.set(0, 0, Math.atan2(by - ay, bx - ax)); m.position.set(ax, ay, z + 0.4); return m; }
// on an end face at x, facing -x (sign -1) or +x (sign +1)
function endLine(az, ay, bz, by, x, sign = -1, w = 2.2) { const m = L.inkLine(Math.hypot(bz - az, by - ay), w); m.rotation.order = 'YXZ'; m.rotation.set(0, sign < 0 ? Math.PI / 2 : -Math.PI / 2, Math.atan2(by - ay, sign < 0 ? -(bz - az) : (bz - az))); m.position.set(x + 0.4 * sign, ay, az); return m; }
function group(list) { const g = new THREE.Group(); list.forEach((m) => g.add(m)); return g; }

// ---------- the scene ----------
let S;
function getScene() {
  if (S) return S;
  const s = L.makeScene({ shadowBox: 1800, lightDir: [0.45, 1, 0.65] });
  const H = G.H, W = G.W, HALF = H / 2, Lk = G.L, SEAT = G.SEAT;
  const n = G.NECK / 2, j = G.NECK / 2 + G.E, tp = G.TIP / 2, h = Lk / 2;
  const F = G.female.map((m) => L.memberMesh(m, { seed: 3 })), M = G.male.map((m) => L.memberMesh(m, { seed: 7, tint: '#EAD3AE' }));
  const fG = new THREE.Group(), mG = new THREE.Group(); F.forEach((m) => fG.add(m)); M.forEach((m) => mG.add(m)); s.add(fG, mG);
  // support blocks: shown only with the timber they carry, following it sideways (not when it is lifted)
  const blk = [-560, 560].map((x) => { const b = L.memberMesh(L.boxMember('blk', [x - 40, -60, -100, 80, 60, 200], 'z'), { seed: 9 }); s.add(b); return b; });
  const clF = L.centreLine(G.LF - 40, 2.6, [60, 16, 10, 16]); clF.rotation.x = -Math.PI / 2; clF.position.set(-G.LF + 20, H + 0.4, 0); fG.add(clF);
  const clM = L.centreLine(G.LM - 40, 2.6, [60, 16, 10, 16]); clM.rotation.x = -Math.PI / 2; clM.position.set(-Lk + 20, H + 0.4, 0); mG.add(clM);
  // the tenon outline's lines on a top face (same for both pieces)
  const neckTip = () => group([topLine(-h, -n - 12, -h, n + 12, H), topLine(-Lk, -tp - 12, -Lk, tp + 12, H)]);
  const neck = () => group([topLine(0, -n, -h, -n, H), topLine(0, n, -h, n, H)]);
  const head = () => group([topLine(-Lk, -tp, -h, -j, H), topLine(-Lk, tp, -h, j, H), topLine(-h, -n, -h, -j, H), topLine(-h, n, -h, j, H)]);
  // female marks
  const fEnd = group([topLine(SEAT, -W / 2, SEAT, W / 2, H)]), fSeat = group([topLine(0, -W / 2, 0, W / 2, H)]);
  const fNT = neckTip(), fNeck = neck(), fHead = head();
  const fSides = group([sideLine(0, HALF, SEAT, HALF, W / 2), sideLine(0, HALF, 0, H, W / 2), sideLine(SEAT, 0, SEAT, H, W / 2)]);
  const fGrain = group([endLine(0, 0, 0, H, SEAT, 1), endLine(-W / 2, HALF, W / 2, HALF, SEAT, 1)]);
  [fEnd, fSeat, fNT, fNeck, fHead, fSides, fGrain].forEach((g) => fG.add(g));
  // male marks (end line at the tenon's tip, x = -L)
  const mEnd = group([topLine(-Lk, -W / 2, -Lk, W / 2, H)]), mNT = neckTip(), mNeck = neck(), mHead = head();
  const mCut = group([topLine(0, -W / 2, 0, -n, H), topLine(0, n, 0, W / 2, H), topLine(SEAT, -W / 2, SEAT, W / 2, H)]);
  const mSides = group([sideLine(-Lk, HALF, SEAT, HALF, W / 2), sideLine(SEAT, 0, SEAT, HALF, W / 2)]);
  const mGrain = group([endLine(0, 0, 0, H, -Lk), endLine(-W / 2, HALF, W / 2, HALF, -Lk), endLine(-tp, HALF, -tp, H, -Lk), endLine(tp, HALF, tp, H, -Lk)]);
  const kerfs = group([-12, -30, -48, -66].flatMap((x) => [topLine(x, n, x, j + 2, H, 3), topLine(x, -n, x, -j - 2, H, 3)]));
  [mEnd, mNT, mNeck, mHead, mCut, mSides, mGrain, kerfs].forEach((g) => mG.add(g));
  // waste pieces
  const wb = (name, box, seed, tint) => L.memberMesh(L.boxMember(name, box, 'x'), { seed, tint });
  const wasteF = wb('wF', [0, HALF, -W / 2, SEAT, HALF, W], 3); fG.add(wasteF);
  const endF = wb('eF', [SEAT, 0, -W / 2, 25, H, W], 3); fG.add(endF);
  const wasteM = wb('wM', [-Lk, 0, -W / 2, Lk + SEAT, HALF, W], 7, '#EAD3AE'); mG.add(wasteM);
  const endM = wb('eM', [-Lk - 25, 0, -W / 2, 25, H, W], 7, '#EAD3AE'); mG.add(endM);
  const sideW = [wb('sW1', [-Lk, HALF, j, Lk, HALF, W / 2 - j], 7, '#EAD3AE'), wb('sW2', [-Lk, HALF, -W / 2, Lk, HALF, W / 2 - j], 7, '#EAD3AE')];
  const neckW = [wb('nW1', [-h, HALF, n, h, HALF, j - n], 7, '#EAD3AE'), wb('nW2', [-h, HALF, -j, h, HALF, j - n], 7, '#EAD3AE')];
  [...sideW, ...neckW].forEach((m) => mG.add(m));
  const ry = SAWS.ryoba({ len: 240, h_heel: 95, h_toe: 120, plate: 0.6, neck: 60, handle: 260, handle_d: 30, rip_pitch: 9, cross_pitch: 4.5 });
  const ch = ET.chisel({ blade: 60, width: 18, thick: 7, bevel: 28, neck: 40, handle: 110, handle_d: 26, hoop: true });
  const tools = { ry, ch }; Object.values(tools).forEach((t) => { const p = new THREE.Group(); p.add(t.g); s.add(p); t.piv = p; p.visible = false; });
  S = { s, blk, F, M, fG, mG, clF, clM, fEnd, fSeat, fNT, fNeck, fHead, fSides, fGrain, mEnd, mNT, mNeck, mHead, mCut, mSides, mGrain, kerfs, wasteF, endF, wasteM, endM, sideW, neckW, tools };
  return S;
}
function syncBlocks(sc) { [[sc.blk[0], sc.fG], [sc.blk[1], sc.mG]].forEach(([b, g]) => { b.visible = g.visible; b.position.set(g.position.x, 0, g.position.z); }); }
function showState(list, k) { list.forEach((m, i) => { m.visible = i === k; }); }
function resetScene(sc) {
  sc.fG.position.set(0, 0, 0); sc.mG.position.set(0, 0, 0); sc.fG.visible = sc.mG.visible = true;
  [sc.clF, sc.clM, sc.fEnd, sc.fSeat, sc.fNT, sc.fNeck, sc.fHead, sc.fSides, sc.fGrain, sc.mEnd, sc.mNT, sc.mNeck, sc.mHead, sc.mCut, sc.mSides, sc.mGrain, sc.kerfs,
    sc.wasteF, sc.endF, sc.wasteM, sc.endM, ...sc.sideW, ...sc.neckW].forEach((g) => { g.visible = false; g.position.set(0, 0, 0); });
  sc.clF.position.set(-G.LF + 20, G.H + 0.4, 0); sc.clM.position.set(-G.L + 20, G.H + 0.4, 0);
  Object.values(sc.tools).forEach((t) => { t.piv.visible = false; t.piv.position.set(0, 0, 0); t.piv.rotation.set(0, 0, 0); t.piv.quaternion.identity(); });
}
function poseSaw(t, P, edgeTop, dir, up, p, s) {
  const d = new THREE.Vector3(...dir).normalize(), u = new THREE.Vector3(...up).normalize();
  const yl = edgeTop ? u.clone().negate() : u.clone(), zl = new THREE.Vector3().crossVectors(d, yl).normalize();
  t.piv.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(d, yl, zl));
  const hh = edgeTop ? P.h_heel + (P.h_toe - P.h_heel) * s / P.len : 0;
  const local = new THREE.Vector3(s, hh, 0).applyQuaternion(t.piv.quaternion);
  t.piv.position.set(p[0] - local.x, p[1] - local.y, p[2] - local.z); t.piv.visible = true;
}
const RY = { len: 240, h_heel: 95, h_toe: 120 };
const stroke = (t, period = 1.4) => { const f = (t / period) % 1; return f < 0.6 ? L.ease(f / 0.6) : 1 - L.ease((f - 0.6) / 0.4); };
const SRC = 'one training course\'s sequence (WBT, ものつくり大学)';

const SHOTS = {
  S01: {
    build() {
      this.l = L.text('the finished joint: the male drops in from above', { x: 96, y: 966, size: 40, cls: 'plate' });
      this.src = L.text(SRC, { x: 1824, y: 60, size: 36, cls: 'soft', align: 'right' });
      this.st = L.text('the course\'s exercise adds a stub tenon at the seat: left out here', { x: 96, y: 900, size: 36, cls: 'plate' });
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev; resetScene(sc); showState(sc.F, 2); showState(sc.M, 2);
      const k = L.ease(L.ramp(t, e.drops - 0.3, e.drops + 1.6)); sc.mG.position.set(0, 240 * (1 - k), 0);
      L.show(this.l, L.ramp(t, e.drops, e.drops + 0.5)); L.show(this.src, rr(t, e.train)); L.show(this.st, rr(t, e.stub));
      syncBlocks(sc); return { scene: sc.s, camera: L.camera('threeQ', [-90, 80 + 90 * (1 - k), 0], 1500, { orbit: -0.35 + 0.01 * t, lift: 0.5 }) };
    },
  },
  S02: { fadeIn: 0.5, fadeOut: 0.6, build() { titleCard(); }, frame() { return {}; } },
  S03: {
    build() {
      this.m = L.text('<b>male</b> · the upper piece<br>on a sill, the anchor bolt goes in it, beside the splice', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.f = L.text('<b>female</b> · the lower piece', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.l = L.text('center lines first: the neck and head are laid out from them', { x: 96, y: 966, size: 40, cls: 'plate' });
      this.bolt = null;
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev; resetScene(sc); showState(sc.F, 0); showState(sc.M, 0);
      sc.fG.position.set(-160, 0, 0); sc.mG.position.set(160, 0, 0);
      if (!this.bolt) { this.bolt = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 160, 16), new THREE.MeshStandardMaterial({ color: '#5E6266', metalness: 0.3, roughness: 0.5 })); sc.mG.add(this.bolt); }
      this.bolt.position.set(G.SEAT + 90, 40, 0); this.bolt.visible = t > e.bolt - 0.2;
      sc.clF.visible = sc.clM.visible = t > e.center - 0.3; L.setGroupProgress(sc.clF, L.ramp(t, e.center - 0.3, e.center + 1.2)); L.setGroupProgress(sc.clM, L.ramp(t, e.center, e.center + 1.5));
      const cam = L.camera('threeQ', [0, 60, 0], 1600, { orbit: -0.3, lift: 0.5 });
      this.m.style.left = '760px'; this.m.style.top = '150px'; anchor(this.f, cam, [-160 - 300, G.H, 0], -60, -90);
      L.show(this.m, rr(t, e.male)); L.show(this.f, rr(t, e.male + 0.8)); L.show(this.l, rr(t, e.laid));
      syncBlocks(sc); return { scene: sc.s, camera: cam };
    },
  },
  S04: {
    build() {
      this.le = L.text(`end line · ${kj('砂切り')}`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.ls = L.text('seat line', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.ln = L.text('neck and tip lines', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.lc = L.text('then the cut line', { x: 96, y: 966, size: 40, cls: 'plate' });
      this.lsp = L.text('neck lines split evenly from the center line', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.lb = L.text('a sashigane\'s blade is about 15 mm wide: quick to mark with (schematic)', { x: 96, y: 966, size: 40, cls: 'plate' });
      this.lh = L.text('slanted head lines, tip toward the neck', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.lf = L.text('seat lines carried down both side faces', { x: 96, y: 966, size: 40, cls: 'plate' });
      this.src = L.text(SRC, { x: 1824, y: 60, size: 36, cls: 'soft', align: 'right' });
      this.sq = null;
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev; resetScene(sc); showState(sc.F, 0); sc.mG.visible = false; sc.clF.visible = true; L.setGroupProgress(sc.clF, 1);
      sc.fEnd.visible = t > e.end - 0.3; sc.fSeat.visible = t > e.seat - 0.3; sc.fNT.visible = t > e.neck - 0.3; sc.fNeck.visible = t > e.split - 0.3; sc.fHead.visible = t > e.slant - 0.3; sc.fSides.visible = t > e.sides - 0.3;
      if (!this.sq) { this.sq = L.squareModel(300, 150, 15); sc.s.add(this.sq); }
      // the square's blade laid along a neck line, its edge on the line (schematic placement)
      this.sq.visible = t > e.blade - 0.3 && t < e.slant + 1.5; this.sq.position.set(10, G.H + 1, -G.NECK / 2 - 15); this.sq.rotation.set(-Math.PI / 2, 0, Math.PI);
      const cam = L.camera('threeQ', [-60, G.H, 0], 820, { orbit: -0.15, lift: 1.2 });
      anchor(this.le, cam, [G.SEAT, G.H, -G.W / 2], 20, -100); anchor(this.ls, cam, [0, G.H, G.W / 2], -60, 20);
      anchor(this.ln, cam, [-G.L, G.H, -G.W / 2], -220, -110); anchor(this.lsp, cam, [-G.L / 4, G.H, -G.W / 2], -260, -170);
      anchor(this.lh, cam, [-G.L, G.H, G.W / 2], -360, 40);
      L.show(this.le, rr(t, e.end)); L.show(this.ls, rr(t, e.seat)); L.show(this.ln, win(t, e.neck, e.split)); L.show(this.lc, win(t, e.cut, e.blade));
      L.show(this.lsp, win(t, e.split, e.slant)); L.show(this.lb, win(t, e.blade, e.sides)); L.show(this.lh, rr(t, e.slant)); L.show(this.lf, rr(t, e.sides)); L.show(this.src, rr(t, e.end));
      syncBlocks(sc); return { scene: sc.s, camera: cam };
    },
  },
  S05: {
    build() {
      this.l = L.text('the male, marked the same way: end line (the tip) · neck and tip lines · cut line · neck lines · slanted head lines · seat lines down both sides', { x: 96, y: 920, size: 36, cls: 'plate', w: 1700 }); this.l.classList.add('wrap');
      this.src = L.text(SRC, { x: 1824, y: 60, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev; resetScene(sc); showState(sc.M, 0); sc.fG.visible = false; sc.clM.visible = true; L.setGroupProgress(sc.clM, 1);
      sc.mEnd.visible = t > e.end - 0.3; sc.mNT.visible = t > e.neck - 0.3; sc.mCut.visible = t > e.neck + 1.0; sc.mNeck.visible = t > e.center - 0.3; sc.mHead.visible = t > e.slant - 0.3; sc.mSides.visible = t > e.sides - 0.3;
      const cam = L.camera('threeQ', [-40, G.H, 0], 860, { orbit: 0.4, lift: 1.0 });
      L.show(this.l, rr(t, e.end)); L.show(this.src, 1);
      syncBlocks(sc); return { scene: sc.s, camera: cam };
    },
  },
  S06: {
    build() {
      this.svg = L.svgLayer(); this.items = [];
      const P = (s) => L.text(s, { x: 96, y: 966, size: 40, cls: 'plate' });
      this.c0 = P('cut the end at the end line · mark the end grain');
      this.c1 = P('rip in, leaving half the line · angle the saw clear of the seat');
      this.c2 = P('crosscut, leaving half the line: the seat');
      this.c3 = P('chop the tip straight down, taking the line · then the sides · clear it out');
      this.c4 = P('the tip: dug about 3 mm (1 bu) past the line · the floor flat and level with the seat');
      this.c5 = P('the head\'s sides: chopped leaving half the line');
      this.src = L.text(SRC, { x: 1824, y: 60, size: 36, cls: 'soft', align: 'right' });
      // inset: plan of the socket corner where the head meets the neck (schematic)
      const svg = this.svg; this.inset = el2(svg, 'g', {}); const ix = 1280, iy = 170, S = 5;
      el2(this.inset, 'rect', { x: ix - 30, y: iy - 30, width: 600, height: 520, fill: '#F3EEE4', stroke: INK, 'stroke-width': 2, rx: 8 });
      el2(this.inset, 'path', { d: `M${ix},${iy + 40} H${ix + 540} V${iy + 380} H${ix} Z`, fill: WOOD, stroke: INK, 'stroke-width': 2 });
      // socket: neck (right) and head (left) in plan, one side shown
      el2(this.inset, 'path', { d: `M${ix + 540},${iy + 210} H${ix + 290} V${iy + 210 - 7.5 * S} L${ix + 20},${iy + 210 - 2 * S} V${iy + 380} H${ix + 540} Z`, fill: '#3A332D' });
      el2(this.inset, 'path', { d: `M${ix + 290},${iy + 60} V${iy + 380}`, stroke: INK, 'stroke-width': 3, 'stroke-dasharray': '10 6' });
      this.strip = el2(this.inset, 'rect', { x: ix + 290 - 3 * S * 2, y: iy + 210 - 7.5 * S, width: 3 * S * 2, height: 7.5 * S + 170, fill: '#C9A577', stroke: INK, 'stroke-width': 2 });
      this.sl = el2(this.inset, 'path', { d: `M${ix + 290},${iy + 210 - 7.5 * S} L${ix + 290 - 3 * S * 2},${iy + 380}`, stroke: INK, 'stroke-width': 4, fill: 'none' });
      this.it1 = L.text('at the neck end: chopped ~3 mm short of the line (dashed), on the tip side', { x: ix + 270, y: iy + 400, size: 36, align: 'center', w: 560 }); this.it1.classList.add('wrap');
      this.it2 = L.text('then that strip pared to a slight slope · direction and steepness schematic', { x: ix + 270, y: iy + 400, size: 36, align: 'center', w: 560 }); this.it2.classList.add('wrap');
      this.it0 = L.text('plan · one side · exaggerated', { x: ix + 270, y: iy - 20, size: 36, align: 'center', cls: 'soft' });
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev, H = G.H, HALF = H / 2, W = G.W; resetScene(sc); sc.mG.visible = false; sc.clF.visible = true; L.setGroupProgress(sc.clF, 1);
      const marks = t < e.tip; [sc.fSeat, sc.fNT, sc.fNeck, sc.fHead, sc.fSides].forEach((g) => { g.visible = marks || g === sc.fHead || g === sc.fNeck; });
      sc.fEnd.visible = t < e.female + 1.2;
      sc.endF.visible = t < e.female + 2.2; const ek = L.ease(L.ramp(t, e.female + 0.8, e.female + 2.0)); sc.endF.position.set(90 * ek, -60 * ek, 0);
      sc.fGrain.visible = t > e.grain - 0.3 && t < e.cross + 1;
      const st = t < e.tip - 0.3 ? 0 : t < e.clear + 0.8 ? 1 : 2; showState(sc.F, st);
      sc.wasteF.visible = t > e.cross && t < e.tip + 0.9; const wk = L.ease(L.ramp(t, e.tip - 0.6, e.tip + 0.6)); sc.wasteF.position.set(60 * wk, 140 * wk, 0);
      const s = stroke(t);
      if (t > e.rip - 0.3 && t < e.cross - 0.2) { const d = G.SEAT * L.ramp(t, e.rip, e.cross - 0.4); poseSaw(sc.tools.ry, { ...RY, plate: 0.6 }, false, [0, 0, -1], [1, 0, 0], [G.SEAT - d, HALF, W / 2 + 40], 40 + 120 * s); }
      else if (t > e.cross - 0.2 && t < e.tip - 0.4) { const d = HALF * L.ramp(t, e.cross, e.tip - 0.6); poseSaw(sc.tools.ry, { ...RY, plate: 0.6 }, true, [0, 0, -1], [0, 1, 0], [0.3, H - d, W / 2 + 40], 40 + 120 * s); }
      else if (t > e.tip - 0.3 && t < e.dig + 0.5) {
        const c = sc.tools.ch; c.piv.visible = true; c.piv.rotation.set(0, 0, -Math.PI / 2);
        const x = t < e.sides ? -G.L + 2 : t < e.clear ? -G.L * 0.75 : -G.L / 2;
        c.piv.position.set(x, HALF + 4 + 30 * s, t < e.sides ? 0 : G.NECK / 2 + 4);
      }
      const near = t > e.tip - 0.5;
      const cam = L.camera('threeQ', [near ? -G.L / 2 : -20, HALF + 10, 0], near ? 640 : 900, { orbit: -0.45, lift: 0.7 });
      L.show(this.c0, win(t, e.female, e.rip)); L.show(this.c1, win(t, e.rip, e.cross)); L.show(this.c2, win(t, e.cross, e.tip)); L.show(this.c3, win(t, e.tip, e.dig));
      L.show(this.c4, win(t, e.dig, e.along)); L.show(this.c5, rr(t, e.along)); L.show(this.src, 1);
      const ia = rr(t, e.meets); this.inset.setAttribute('opacity', ia); L.show(this.it0, ia);
      const p = L.ramp(t, e.pare - 0.2, e.pare + 1.2);
      this.strip.setAttribute('opacity', 1 - p); this.sl.setAttribute('opacity', p); L.show(this.it1, ia * (1 - rr(t, e.pare))); L.show(this.it2, rr(t, e.pare));
      syncBlocks(sc); return { scene: sc.s, camera: cam };
    },
  },
  S07: {
    build() {
      this.svg = L.svgLayer(); this.items = [];
      const P = (s) => L.text(s, { x: 96, y: 966, size: 40, cls: 'plate' });
      this.c0 = P('cut the end at the end line · mark the end grain');
      this.c1 = P('rip along the face that rests on the seat · crosscut the shoulder · half the line left on both');
      this.c2 = P('head\'s sides: leave the line at the top, take it at the bottom');
      this.c3 = P('crosscut the shoulder short of the neck line · the waste splits off with the chisel');
      this.c4 = P('saw the bearing slope, leaving half the line');
      this.c5 = P('kerfs a chisel\'s width apart beside the neck · chop the neck, half the line left, same taper');
      this.c6 = P('pare the bearing slope · chamfer the bottom edges of the head and neck');
      this.lsl = L.text('bearing slope', { x: 0, y: 0, size: 36, cls: 'plate' });
      this.src = L.text(SRC, { x: 1824, y: 60, size: 36, cls: 'soft', align: 'right' });
      const svg = this.svg; this.inset = el2(svg, 'g', {}); const ix = 1340, iy = 300;
      el2(this.inset, 'rect', { x: ix - 110, y: iy - 140, width: 560, height: 470, fill: '#F3EEE4', stroke: INK, 'stroke-width': 2, rx: 8 });
      el2(this.inset, 'path', { d: `M${ix + 60},${iy} L${ix + 280},${iy} L${ix + 255},${iy + 200} L${ix + 85},${iy + 200} Z`, fill: WOODL, stroke: INK, 'stroke-width': 3 });
      el2(this.inset, 'path', { d: `M${ix + 60},${iy} V${iy + 200} M${ix + 280},${iy} V${iy + 200}`, stroke: GHOST, 'stroke-width': 3, 'stroke-dasharray': '10 7' });
      this.it = L.text('head, end view · taper greatly exaggerated', { x: ix + 170, y: iy - 120, size: 36, align: 'center', cls: 'soft', w: 500 }); this.it.classList.add('wrap');
      this.it2 = L.text('narrower below: enters easily, snug as it goes down', { x: ix + 170, y: iy + 210, size: 36, align: 'center', w: 500 }); this.it2.classList.add('wrap');
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev, H = G.H, HALF = H / 2, W = G.W, n = G.NECK / 2, j = n + G.E; resetScene(sc); sc.fG.visible = false; sc.clM.visible = true; L.setGroupProgress(sc.clM, 1);
      const afterSplit = t > e.splits;
      showState(sc.M, t < e.head - 0.3 ? 0 : afterSplit ? 2 : 1);
      sc.mEnd.visible = t < e.begin + 1.2; sc.mNT.visible = sc.mNeck.visible = sc.mHead.visible = !afterSplit; sc.mCut.visible = t < e.head;
      sc.endM.visible = t < e.begin + 2.2; const ek = L.ease(L.ramp(t, e.begin + 0.8, e.begin + 2.0)); sc.endM.position.set(-90 * ek, -60 * ek, 0);
      sc.mGrain.visible = t > e.begin + 1.5 && t < e.head;
      sc.wasteM.visible = t > e.rip - 0.3 && t < e.head + 0.6; const wk = L.ease(L.ramp(t, e.head - 0.8, e.head + 0.4)); sc.wasteM.position.set(-40 * wk, -90 * wk, 0);
      // after the shoulder crosscut: the waste beside the head splits off; the neck waste stays until it is chopped
      const sk = L.ease(L.ramp(t, e.splits, e.splits + 1.0));
      sc.sideW.forEach((m, i) => { m.visible = afterSplit && sk < 0.99; m.position.set(0, 60 * sk, (i ? -1 : 1) * 120 * sk); });
      sc.neckW.forEach((m) => { m.visible = afterSplit && t < e.chop + 1.2; });
      sc.kerfs.visible = t > e.kerfs - 0.3 && t < e.chop + 1.2;
      const s = stroke(t);
      if (t > e.rip - 0.2 && t < e.cross) { const d = (G.L + G.SEAT) * L.ramp(t, e.rip, e.cross - 0.3); poseSaw(sc.tools.ry, { ...RY, plate: 0.6 }, false, [0, 0, -1], [-1, 0, 0], [-G.L + d, HALF, W / 2 + 40], 40 + 120 * s); }
      else if (t > e.head - 0.2 && t < e.shoulder - 0.3) { // rip down one head side, along its slanted line, to the neck
        const dx = -G.L / 2 - -G.L, dz = j - G.TIP / 2, len = Math.hypot(dx, dz), d = [dx / len, 0, dz / len];
        const dep = HALF * L.ramp(t, e.head, e.narrower);
        poseSaw(sc.tools.ry, { ...RY, plate: 0.6 }, true, d, [0, 1, 0], [-G.L * 0.75, H - dep, (G.TIP / 2 + j) / 2 + 0.3], 40 + 120 * s);
      }
      else if (t > e.chop - 0.3 && t < e.chamfer + 2.0) { const c = sc.tools.ch; c.piv.visible = true; c.piv.rotation.set(0, Math.PI / 2, 0.25); c.piv.position.set(-G.L / 4, H - 10, n + 14 + 8 * s); }
      const cam = L.camera('threeQ', [-G.L * 0.6, H - 10, 0], 900, { orbit: 0.55, lift: 0.5 });
      this.items.forEach((x) => x.remove()); this.items = [];
      const strokeA = (a, b, op) => { const ar = arrow3(this.svg, cam, a, b, { w: 5 }); ar.setAttribute('opacity', op); this.items.push(ar); };
      const xs = win(t, e.cross, e.head); if (xs > 0.01) strokeA([G.SEAT, 0, W / 2 + 2], [G.SEAT, HALF, W / 2 + 2], xs);
      const hs = win(t, e.head, e.shoulder); if (hs > 0.01) { strokeA([-G.L, H + 2, G.TIP / 2], [-G.L / 2, H + 2, j], hs); strokeA([-G.L, H + 2, -G.TIP / 2], [-G.L / 2, H + 2, -j], hs); }
      const ss = win(t, e.shoulder, e.splits); if (ss > 0.01) { strokeA([0, H + 2, W / 2], [0, H + 2, n + 6], ss); strokeA([0, H + 2, -W / 2], [0, H + 2, -n - 6], ss); }
      L.show(this.c0, win(t, e.begin, e.rip)); L.show(this.c1, win(t, e.rip, e.head)); L.show(this.c2, win(t, e.head, e.shoulder)); L.show(this.c3, win(t, e.shoulder, e.slope));
      L.show(this.c4, win(t, e.slope, e.kerfs)); L.show(this.c5, win(t, e.kerfs, e.finally)); L.show(this.c6, rr(t, e.finally)); L.show(this.src, 1);
      anchor(this.lsl, cam, [-G.L / 2, H, -j], -200, -70); L.show(this.lsl, win(t, e.slope, e.kerfs));
      const ia = win(t, e.top, e.shoulder); this.inset.setAttribute('opacity', ia); L.show(this.it, ia); L.show(this.it2, ia);
      syncBlocks(sc); return { scene: sc.s, camera: cam };
    },
  },
  S08: {
    build() { this.l = L.text('the male drops in from above, onto the seat', { x: 96, y: 966, size: 40, cls: 'plate' }); },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev; resetScene(sc); showState(sc.F, 2); showState(sc.M, 2);
      const k = L.ease(L.ramp(t, e.drops, e.drops + 1.8)); sc.mG.position.set(0, 220 * (1 - k), 0);
      L.show(this.l, rr(t, e.drops));
      syncBlocks(sc); return { scene: sc.s, camera: L.camera('threeQ', [-80, 60 + 80 * (1 - k), 0], 1300, { orbit: -0.35, lift: 0.5 }) };
    },
  },
  S09: {
    build() {
      const a = L.text('Next · Episode 11', { x: 96, y: 330, size: 48 }); a.style.fontWeight = 700;
      const b = L.text('The Other Splice', { x: 96, y: 410, size: 96 }); b.style.fontWeight = 700;
      this.c = L.text('for the beams in the outer walls at second-floor level', { x: 96, y: 560, size: 40, cls: 'soft' });
    },
    frame(t, sh) { L.show(this.c, L.ramp(t, sh.ev.splice - 0.2, sh.ev.splice + 0.3)); return {}; },
  },
  S10: {
    build() {
      const h = L.text('Center lines first. Mark both pieces the same way, split the neck from the center, and taper the head so it enters easily.', { x: 96, y: 60, size: 48, w: 1728 }); h.style.fontWeight = 700; h.classList.add('wrap');
      L.text('one training course\'s sequence (WBT); others may order things differently', { x: 96, y: 200, size: 36, cls: 'soft', w: 1728 });
      const rows = [
        ['koshikake kama-tsugi', '腰掛け鎌継ぎ', 'seated gooseneck splice', 'from Episode 9'],
        ['end line', '砂切り', 'end crosscut line', 'the end is cut at this line, then the end grain is marked'],
        ['kama · kubi', '鎌 · 首', 'head · neck', 'neck lines split from the center; head lines slanted, tip toward the neck'],
        ['half the line', '', 'leave half', 'most of the course\'s cuts leave half the line'],
        ['taper', '', 'head and neck sides', 'line left at the top, taken at the bottom: enters easily'],
        ['(bearing slope)', '', 'the head\'s bearing faces', 'chopped short at the neck end, then pared to a slight slope'],
      ];
      const g = L.text('', { x: 96, y: 290, size: 36, w: 1728 });
      g.innerHTML = '<div class="soft" style="font-size:36px;margin-bottom:12px;letter-spacing:.08em">GLOSSARY · EPISODE 10</div>' + rows.map((r) => `<div style="display:flex;gap:30px;margin-bottom:14px;align-items:baseline"><div style="width:640px;font-weight:700;font-size:38px"><i>${r[0]}</i> <span style="font-family:'Noto Serif CJK JP',serif;font-style:normal">${r[1]}</span></div><div style="width:1060px;white-space:normal;font-size:36px"><b>${r[2]}</b> — <span class="soft">${r[3]}</span></div></div>`).join('');
    },
    frame() { return {}; },
  },
  S11: {
    build() {
      const a = L.text('One note', { x: 960, y: 380, size: 48, align: 'center' }); a.style.fontWeight = 700;
      const b = L.text('Sharp-tool technique, and how to use these tools safely, is best learned from a teacher, at a bench, in person.', { x: 960, y: 470, size: 48, align: 'center', w: 1400 }); b.classList.add('wrap');
    },
    frame() { return {}; },
  },
  S12: { fadeOut: 1.0, build() { endCard(); }, frame() { return {}; } },
};

function titleCard() {
  const svg = L.svgLayer();
  el2(svg, 'line', { x1: 96, y1: 470, x2: 560, y2: 470, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 300, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('EPISODE 10', { x: 96, y: 370, size: 48 }); b.style.fontWeight = 700; b.style.letterSpacing = '0.12em';
  const c = L.text('Cutting the Gooseneck', { x: 96, y: 510, size: 96 }); c.style.fontWeight = 700;
  L.text(`the <i>koshikake kama-tsugi</i> ${kj('腰掛け鎌継ぎ')}, step by step`, { x: 96, y: 650, size: 52, cls: 'soft' });
}
function endCard() {
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 330, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('Next · Episode 11', { x: 96, y: 420, size: 48 }); b.style.fontWeight = 700;
  const c = L.text('The Other Splice', { x: 96, y: 500, size: 96 }); c.style.fontWeight = 700;
  L.text('for the outer-wall beams', { x: 96, y: 640, size: 40, cls: 'soft' });
  const svg = L.svgLayer(); el2(svg, 'line', { x1: 96, y1: 740, x2: 560, y2: 740, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
}
