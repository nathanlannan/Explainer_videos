// Episode 6 shots: marking out and cutting the koshikake ari-tsugi, following one training course's sequence (WBT).
// Every piece shown is one of the exact cut states from params.py (F0-F2, M0-M2); tools are the series models.
import { makeSaws } from '/shared/render/saws.js';
import { makeEdgeTools } from '/shared/render/edgetools.js';
let L, THREE, G, TL, SAWS, ET;
const R = (p) => `/episodes/ep06_aritsugi_cutting/${p}`;

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
const INK = '#1B1B1B', ACC = '#B8432F', GHOST = '#7D8EA0', WOOD = '#E6C9A0';
const kj = (s) => `<span style="font-family:'Noto Serif CJK JP',serif;font-style:normal;font-weight:600">${s}</span>`;
function arrow(svg, x1, y1, x2, y2, { color = INK, w = 4, head = 18 } = {}) {
  const g = el2(svg, 'g', {}); const a = Math.atan2(y2 - y1, x2 - x1);
  el2(g, 'line', { x1, y1, x2: x2 - Math.cos(a) * head * 0.8, y2: y2 - Math.sin(a) * head * 0.8, stroke: color, 'stroke-width': w });
  const p = [[x2, y2], [x2 - Math.cos(a - 0.42) * head, y2 - Math.sin(a - 0.42) * head], [x2 - Math.cos(a + 0.42) * head, y2 - Math.sin(a + 0.42) * head]];
  el2(g, 'polygon', { points: p.map((q) => q.join(',')).join(' '), fill: color });
  return g;
}
function arrow3(svg, cam, a, b, opts) { const [x1, y1] = L.toScreen(cam, a), [x2, y2] = L.toScreen(cam, b); return arrow(svg, x1, y1, x2, y2, opts); }

// ---------- ink lines on faces ----------
// on the top face (y), from (ax, az) to (bx, bz)
function topLine(ax, az, bx, bz, y, w = 2.2) { const m = L.inkLine(Math.hypot(bx - ax, bz - az), w); m.rotation.order = 'YXZ'; m.rotation.set(-Math.PI / 2, Math.atan2(-(bz - az), bx - ax), 0); m.position.set(ax, y + 0.4, az); return m; }
// on the front face (z), from (ax, ay) to (bx, by)
function sideLine(ax, ay, bx, by, z, w = 2.2) { const m = L.inkLine(Math.hypot(bx - ax, by - ay), w); m.rotation.set(0, 0, Math.atan2(by - ay, bx - ax)); m.position.set(ax, ay, z + 0.4); return m; }
// on the end face at x (facing -x), from (az, ay) to (bz, by): a plane in the z-y plane
function endLine(az, ay, bz, by, x, w = 2.2) { const m = L.inkLine(Math.hypot(bz - az, by - ay), w); m.rotation.order = 'YXZ'; m.rotation.set(0, Math.PI / 2, Math.atan2(by - ay, -(bz - az))); m.position.set(x - 0.4, ay, az); return m; }
function group(list) { const g = new THREE.Group(); list.forEach((m) => g.add(m)); return g; }
function fade(g, a) { g.visible = a > 0.01; g.traverse((o) => { if (o.material) { o.material = o.material.clone ? o.material : o.material; } }); }

// ---------- the scene ----------
let S;
function getScene() {
  if (S) return S;
  const s = L.makeScene({ shadowBox: 1800, lightDir: [0.45, 1, 0.65] });
  const H = G.H, W = G.W, HALF = H / 2, LD = G.LD, HEAD = G.HEAD, NECK = G.NECK, SEAT = G.SEAT;
  const F = G.female.map((m, i) => L.memberMesh(m, { seed: 3 })), M = G.male.map((m) => L.memberMesh(m, { seed: 7, tint: '#EAD3AE' }));
  const fG = new THREE.Group(), mG = new THREE.Group(); F.forEach((m) => fG.add(m)); M.forEach((m) => mG.add(m)); s.add(fG, mG);
  [[-560], [560]].forEach(([x]) => s.add(L.memberMesh(L.boxMember('blk', [x - 40, -60, -90, 80, 60, 180], 'z'), { seed: 9 })));
  // centre lines on the top faces
  const clF = L.centreLine(G.LF - 40, 2.6, [60, 16, 10, 16]); clF.rotation.x = -Math.PI / 2; clF.position.set(-G.LF + 20, H + 0.4, 0); fG.add(clF);
  const clM = L.centreLine(G.LM - 40, 2.6, [60, 16, 10, 16]); clM.rotation.x = -Math.PI / 2; clM.position.set(-LD + 20, H + 0.4, 0); mG.add(clM);
  // female marks (top face, then the side face z = +W/2)
  const fEnd = group([topLine(SEAT, -W / 2, SEAT, W / 2, H)]);
  const fSeat = group([topLine(0, -W / 2, 0, W / 2, H)]);
  const fDove = group([topLine(0, -NECK / 2, -LD, -HEAD / 2, H), topLine(0, NECK / 2, -LD, HEAD / 2, H), topLine(-LD, -HEAD / 2, -LD, HEAD / 2, H)]);
  const fSides = group([sideLine(0, HALF, SEAT, HALF, W / 2), sideLine(0, HALF, 0, H, W / 2), sideLine(SEAT, 0, SEAT, H, W / 2)]);
  [fEnd, fSeat, fDove, fSides].forEach((g) => fG.add(g));
  // male marks: end line (= the dovetail's tip), the cut lines (shoulder at 0, seat end at SEAT)
  const mEnd = group([topLine(-LD, -W / 2, -LD, W / 2, H)]);
  const mCut = group([topLine(0, -W / 2, 0, -NECK / 2, H), topLine(0, NECK / 2, 0, W / 2, H), topLine(SEAT, -W / 2, SEAT, W / 2, H), topLine(0, -NECK / 2, -LD, -HEAD / 2, H), topLine(0, NECK / 2, -LD, HEAD / 2, H)]);
  // male end grain (after the end cut): centre line, dovetail sides, the half line
  const mGrain = group([endLine(0, 0, 0, H, -LD), endLine(-HEAD / 2, HALF, -HEAD / 2, H, -LD), endLine(HEAD / 2, HALF, HEAD / 2, H, -LD), endLine(-W / 2, HALF, W / 2, HALF, -LD)]);
  [mEnd, mCut, mGrain].forEach((g) => mG.add(g));
  // waste pieces that come away
  const wasteF = L.memberMesh(L.boxMember('wF', [0, HALF, -W / 2, SEAT, HALF, W], 'x'), { seed: 3 }); fG.add(wasteF);
  const wasteM = L.memberMesh(L.boxMember('wM', [-LD, 0, -W / 2, LD + SEAT, HALF, W], 'x'), { seed: 7, tint: '#EAD3AE' }); mG.add(wasteM);
  const endSlice = L.memberMesh(L.boxMember('wE', [-LD - 25, 0, -W / 2, 25, H, W], 'x'), { seed: 7, tint: '#EAD3AE' }); mG.add(endSlice);
  // tools
  const ry = SAWS.ryoba(G.ryoba || { len: 240, h_heel: 95, h_toe: 120, plate: 0.6, neck: 60, handle: 260, handle_d: 30, rip_pitch: 9, cross_pitch: 4.5 });
  const dz = SAWS.dozuki({ len: 240, h: 60, plate: 0.3, spine_h: 9, spine_t: 3, neck: 50, handle: 230, handle_d: 28, cross_pitch: 3.5 });
  const ch = ET.chisel({ blade: 60, width: 18, thick: 7, bevel: 28, neck: 40, handle: 110, handle_d: 26, hoop: true });
  const tools = { ry, dz, ch }; Object.values(tools).forEach((t) => { const p = new THREE.Group(); p.add(t.g); s.add(p); t.piv = p; p.visible = false; });
  S = { s, F, M, fG, mG, clF, clM, fEnd, fSeat, fDove, fSides, mEnd, mCut, mGrain, wasteF, wasteM, endSlice, tools };
  return S;
}
function showState(list, k) { list.forEach((m, i) => { m.visible = i === k; }); }
function resetScene(sc) {
  sc.fG.position.set(0, 0, 0); sc.mG.position.set(0, 0, 0); sc.fG.visible = sc.mG.visible = true;
  [sc.clF, sc.clM, sc.fEnd, sc.fSeat, sc.fDove, sc.fSides, sc.mEnd, sc.mCut, sc.mGrain, sc.wasteF, sc.wasteM, sc.endSlice].forEach((g) => { g.visible = false; g.position.set(0, 0, 0); });
  sc.clF.position.set(-G.LF + 20, G.H + 0.4, 0); sc.clM.position.set(-G.LD + 20, G.H + 0.4, 0);
  Object.values(sc.tools).forEach((t) => { t.piv.visible = false; t.piv.position.set(0, 0, 0); t.piv.rotation.set(0, 0, 0); t.g.position.set(0, 0, 0); t.g.rotation.set(0, 0, 0); });
}
// pose a saw: blade's cutting edge along `dir`, body toward `up`, edge point p at distance s from the heel
function poseSaw(t, P, edgeTop, dir, up, p, s) {
  const d = new THREE.Vector3(...dir).normalize(), u = new THREE.Vector3(...up).normalize();
  const yl = edgeTop ? u.clone().negate() : u.clone(), zl = new THREE.Vector3().crossVectors(d, yl).normalize();
  t.piv.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(d, yl, zl));
  const h = edgeTop ? P.h_heel + (P.h_toe - P.h_heel) * s / P.len : 0;
  const local = new THREE.Vector3(s, h, 0).applyQuaternion(t.piv.quaternion);
  t.piv.position.set(p[0] - local.x, p[1] - local.y, p[2] - local.z); t.piv.visible = true;
}
const RY = { len: 240, h_heel: 95, h_toe: 120 }, DZ = { len: 240, h: 60 };
const stroke = (t, period = 1.4) => { const f = (t / period) % 1; return f < 0.6 ? L.ease(f / 0.6) : 1 - L.ease((f - 0.6) / 0.4); };

const SHOTS = {
  S01: {
    build() { this.l = L.text('drops in from above, tightens as it seats', { x: 96, y: 990, size: 40, cls: 'plate' }); },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev; resetScene(sc); showState(sc.F, 2); showState(sc.M, 2);
      const k = L.ease(L.ramp(t, e.drops - 0.3, e.drops + 1.6)); sc.mG.position.set(0, 240 * (1 - k), 0);
      L.show(this.l, L.ramp(t, e.drops, e.drops + 0.5));
      return { scene: sc.s, camera: L.camera('threeQ', [0, 80 + 90 * (1 - k), 0], 1250, { orbit: -0.35 + 0.01 * t, lift: 0.5 }) };
    },
  },
  S02: { fadeIn: 0.5, fadeOut: 0.6, build() { titleCard(); }, frame() { return {}; } },
  S03: {
    build() {
      this.m = L.text('<b>male</b> · the upper piece · the anchor bolt goes in it, beside the joint', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.f = L.text('<b>female</b>', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.mk = L.text('mark each piece clearly first', { x: 96, y: 990, size: 40, cls: 'plate' });
      this.bolt = null;
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev; resetScene(sc); showState(sc.F, 0); showState(sc.M, 0);
      sc.fG.position.set(-140, 0, 0); sc.mG.position.set(140, 0, 0);
      if (!this.bolt) { this.bolt = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 160, 16), new THREE.MeshStandardMaterial({ color: '#5E6266', metalness: 0.3, roughness: 0.5 })); sc.mG.add(this.bolt); }
      this.bolt.position.set(G.SEAT + 80, 40, 0); this.bolt.visible = t > e.bolt - 0.2;
      const cam = L.camera('threeQ', [0, 60, 0], 1500, { orbit: -0.3, lift: 0.5 });
      this.m.style.left = '780px'; this.m.style.top = '150px'; anchor(this.f, cam, [-140 - 300, G.H, 0], -60, -90);
      L.show(this.m, L.ramp(t, e.male - 0.3, e.male + 0.3)); L.show(this.f, L.ramp(t, e.male + 0.5, e.male + 1.0)); L.show(this.mk, L.ramp(t, e.mark - 0.3, e.mark + 0.3));
      return { scene: sc.s, camera: cam };
    },
  },
  S04: {
    build() { this.l = L.text('center lines first: the dovetail is laid out from them', { x: 96, y: 990, size: 40, cls: 'plate' }); },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev; resetScene(sc); showState(sc.F, 0); showState(sc.M, 0);
      sc.fG.position.set(-140, 0, 0); sc.mG.position.set(140, 0, 0);
      sc.clF.visible = sc.clM.visible = t > e.center - 0.3; L.setGroupProgress(sc.clF, L.ramp(t, e.center - 0.3, e.center + 1.2)); L.setGroupProgress(sc.clM, L.ramp(t, e.center, e.center + 1.5));
      L.show(this.l, L.ramp(t, e.laid - 0.3, e.laid + 0.3));
      return { scene: sc.s, camera: L.camera('threeQ', [0, 60, 0], 1500, { orbit: -0.3, lift: 0.6 }) };
    },
  },
  S05: {
    build() {
      this.le = L.text(`end line · ${kj('砂切り')}`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.ls = L.text('seat line', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.ld = L.text('dovetail lines, evenly either side of the center line', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.lb = L.text('sides angled using the width of the sashigane\'s blade (schematic)', { x: 96, y: 920, size: 36, cls: 'plate' });
      this.lf = L.text('seat lines carried down both side faces', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.src = L.text('one training course\'s sequence (WBT, ものつくり大学)', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
      this.sq = null;
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev; resetScene(sc); showState(sc.F, 0); sc.mG.visible = false; sc.clF.visible = true; L.setGroupProgress(sc.clF, 1);
      const r = (a) => L.ramp(t, a - 0.3, a + 0.3);
      sc.fEnd.visible = t > e.end - 0.3; sc.fSeat.visible = t > e.seat - 0.3; sc.fDove.visible = t > e.dove - 0.3; sc.fSides.visible = t > e.sides - 0.3;
      if (!this.sq) { this.sq = L.squareModel(300, 150, 15); sc.s.add(this.sq); }
      // the square's blade laid along one dovetail side (schematic placement)
      const ang = Math.atan2((G.HEAD - G.NECK) / 2, G.LD);
      this.sq.visible = t > e.blade - 0.3 && t < e.sides; this.sq.position.set(10, G.H + 1, -G.NECK / 2 - 4); this.sq.rotation.set(-Math.PI / 2, 0, Math.PI - ang);
      const cam = L.camera('threeQ', [-20, G.H, 0], 760, { orbit: -0.15, lift: 1.2 });
      anchor(this.le, cam, [G.SEAT, G.H, -G.W / 2], 20, -100); anchor(this.ls, cam, [0, G.H, G.W / 2], -60, 20);
      anchor(this.ld, cam, [-G.LD, G.H, G.HEAD / 2], -620, 60); anchor(this.lf, cam, [G.SEAT / 2, G.HALF || G.H / 2, G.W / 2], 30, 40);
      L.show(this.le, r(e.end)); L.show(this.ls, r(e.seat)); L.show(this.ld, r(e.dove)); L.show(this.lb, r(e.blade) * (1 - r(e.sides))); L.show(this.lf, r(e.sides)); L.show(this.src, r(e.end));
      return { scene: sc.s, camera: cam };
    },
  },
  S06: {
    build() {
      this.le = L.text('end line = the dovetail\'s tip', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.lc = L.text('cut lines', { x: 0, y: 0, size: 40, cls: 'plate' });
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev; resetScene(sc); showState(sc.M, 0); sc.fG.visible = false; sc.clM.visible = true; L.setGroupProgress(sc.clM, 1);
      sc.mEnd.visible = t > e.end - 0.3; sc.mCut.visible = t > e.cut - 0.3;
      const cam = L.camera('threeQ', [60, G.H, 0], 780, { orbit: 0.4, lift: 1.1 });
      anchor(this.le, cam, [-G.LD, G.H, -G.W / 2], -120, -80); anchor(this.lc, cam, [G.SEAT, G.H, G.W / 2], 20, 10);
      L.show(this.le, L.ramp(t, e.tip - 0.3, e.tip + 0.3)); L.show(this.lc, L.ramp(t, e.cut - 0.3, e.cut + 0.3));
      return { scene: sc.s, camera: cam };
    },
  },
  S07: {
    build() {
      this.svg = L.svgLayer(); this.items = [];
      this.c1 = L.text('rip along the seat line, splitting it', { x: 96, y: 990, size: 40, cls: 'plate' });
      this.c2 = L.text('crosscut down to it, splitting the line', { x: 96, y: 990, size: 40, cls: 'plate' });
      this.c3 = L.text('rip the socket\'s sides, splitting the line: stop at the line, never into the seat', { x: 96, y: 990, size: 40, cls: 'plate' });
      this.c4 = L.text('chop out the socket: the chisel\'s flat back toward the outside', { x: 96, y: 990, size: 40, cls: 'plate' });
      this.c5 = L.text('at the tip: about 3 mm deeper than the line · one training course: ~1 bu', { x: 96, y: 990, size: 40, cls: 'plate' });
      this.pk = L.text('tip pocket', { x: 0, y: 0, size: 36, cls: 'plate' });
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev, H = G.H, HALF = H / 2, W = G.W; resetScene(sc); sc.mG.visible = false; sc.clF.visible = true; L.setGroupProgress(sc.clF, 1);
      sc.fEnd.visible = sc.fSeat.visible = sc.fDove.visible = sc.fSides.visible = true;
      const st = t < e.away ? 0 : t < e.down ? 1 : 2; showState(sc.F, st);
      // the waste above the seat comes away after the two cuts
      sc.wasteF.visible = t > e.cross && t < e.away + 1.2; const wk = L.ease(L.ramp(t, e.away, e.away + 1.0)); sc.wasteF.position.set(60 * wk, 140 * wk, 0);
      if (t >= e.away) { sc.fEnd.visible = false; sc.fSeat.visible = false; }
      const s = stroke(t);
      if (t > e.rip - 0.3 && t < e.cross - 0.2) { // rip along the seat line: horizontal blade at y = HALF, entering from the end, toward -x
        const depth = G.SEAT * L.ramp(t, e.rip, e.cross - 0.4);
        poseSaw(sc.tools.ry, { ...RY, plate: 0.6 }, false, [0, 0, -1], [1, 0, 0], [G.SEAT - depth, HALF, W / 2 + 40], 40 + 120 * s);
      } else if (t > e.cross - 0.2 && t < e.away) { // crosscut at x = 0, down to the seat line
        const depth = HALF * L.ramp(t, e.cross, e.away - 0.2);
        poseSaw(sc.tools.ry, { ...RY, plate: 0.6 }, true, [0, 0, -1], [0, 1, 0], [0.3, H - depth, W / 2 + 40], 40 + 120 * s);
      } else if (t > e.sides - 0.3 && t < e.chop - 0.3) { // dozuki ripping the socket side down to the seat level
        const depth = HALF * L.ramp(t, e.sides, e.past);
        const a = Math.atan2((G.HEAD - G.NECK) / 2, G.LD), d = [-Math.cos(a), 0, -Math.sin(a)];
        poseSaw(sc.tools.dz, { ...DZ, plate: 0.3 }, false, [0, -1, 0], [Math.sin(a), 0, -Math.cos(a)], [-G.LD / 2, H - depth, -(G.NECK / 2 + G.LD / 2 * Math.tan(a))], 0);
        sc.tools.dz.piv.visible = false; // (shown as a schematic stroke below instead of a misleading blade orientation)
        void d;
      } else if (t > e.chop - 0.3 && t < e.dig + 1.0) { // chisel chopping in the socket, flat back toward the outside (toward -x end wall)
        const c = sc.tools.ch; c.piv.visible = true;
        c.piv.rotation.set(0, 0, -Math.PI / 2); // edge down, handle up; the flat back faces -x (toward the outside: the socket's head wall)
        c.piv.position.set(-G.LD + 2, HALF + 4 + 30 * s, 0);
      }
      const cam = L.camera('threeQ', [-10, HALF + 10, 0], 820, { orbit: -0.45, lift: 0.7 });
      this.items.forEach((x) => x.remove()); this.items = [];
      if (t > e.sides - 0.3 && t < e.chop - 0.3) { // schematic saw strokes along both dovetail sides
        const a1 = arrow3(this.svg, cam, [0, H + 2, -G.NECK / 2], [-G.LD, H + 2, -G.HEAD / 2], { w: 5 }); const a2 = arrow3(this.svg, cam, [0, H + 2, G.NECK / 2], [-G.LD, H + 2, G.HEAD / 2], { w: 5 }); this.items.push(a1, a2);
      }
      const r = (a, b) => L.ramp(t, a - 0.3, a + 0.2) * (1 - L.ramp(t, b - 0.3, b));
      L.show(this.c1, r(e.rip, e.cross)); L.show(this.c2, r(e.cross, e.sides)); L.show(this.c3, r(e.sides, e.chop)); L.show(this.c4, r(e.chop, e.dig)); L.show(this.c5, L.ramp(t, e.dig - 0.3, e.dig + 0.2));
      anchor(this.pk, cam, [-G.LD + 7, HALF, 0], -60, -80); L.show(this.pk, L.ramp(t, e.dig, e.dig + 0.5));
      return { scene: sc.s, camera: cam };
    },
  },
  S08: {
    build() {
      this.c0 = L.text('cut the end square at the end line; then lines onto the fresh end grain', { x: 96, y: 990, size: 40, cls: 'plate' });
      this.c1 = L.text('rip in to the shoulder, crosscut the lower half away', { x: 96, y: 990, size: 40, cls: 'plate' });
      this.c2 = L.text('cheeks: leave the line at the top, take it at the bottom', { x: 96, y: 990, size: 40, cls: 'plate' });
      this.c3 = L.text('shoulders crosscut (splitting the line) · corners chiselled · chamfer with the chisel', { x: 96, y: 990, size: 40, cls: 'plate' });
      // 2D inset: end view of the dovetail, the taper exaggerated
      const svg = L.svgLayer(); this.inset = el2(svg, 'g', {}); const ix = 1340, iy = 300;
      el2(this.inset, 'rect', { x: ix - 40, y: iy - 120, width: 420, height: 380, fill: '#F3EEE4', stroke: INK, 'stroke-width': 2, rx: 8 });
      el2(this.inset, 'path', { d: `M${ix + 60},${iy} L${ix + 280},${iy} L${ix + 255},${iy + 200} L${ix + 85},${iy + 200} Z`, fill: WOOD, stroke: INK, 'stroke-width': 3 });
      el2(this.inset, 'path', { d: `M${ix + 60},${iy} V${iy + 200} M${ix + 280},${iy} V${iy + 200}`, stroke: GHOST, 'stroke-width': 3, 'stroke-dasharray': '10 7' });
      this.it = L.text('end view · taper greatly exaggerated', { x: ix + 170, y: iy - 100, size: 36, align: 'center', cls: 'soft', w: 460 });
      this.it2 = L.text('top: line left · bottom: line taken', { x: ix + 170, y: iy + 210, size: 36, align: 'center' });
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev, H = G.H, HALF = H / 2, W = G.W; resetScene(sc); sc.fG.visible = false; sc.clM.visible = true; L.setGroupProgress(sc.clM, 1);
      const st = t < e.away ? 0 : t < e.narrower ? 1 : 2; showState(sc.M, st);
      sc.mEnd.visible = t < e.first; sc.mCut.visible = t < e.narrower;
      sc.endSlice.visible = t < e.first + 1.0; const ek = L.ease(L.ramp(t, e.first, e.first + 0.9)); sc.endSlice.position.set(-90 * ek, -60 * ek, 0);
      sc.mGrain.visible = t > e.grain - 0.3 && t < e.narrower;
      sc.wasteM.visible = t > e.rip - 0.3 && t < e.away + 1.2; const wk = L.ease(L.ramp(t, e.away, e.away + 1.0)); sc.wasteM.position.set(-40 * wk, -90 * wk, 0);
      const s = stroke(t);
      if (t > e.rip - 0.2 && t < e.away) { const depth = (G.LD + G.SEAT) * L.ramp(t, e.rip, e.away - 0.3); poseSaw(sc.tools.ry, { ...RY, plate: 0.6 }, false, [0, 0, -1], [-1, 0, 0], [-G.LD + depth, HALF, W / 2 + 40], 40 + 120 * s); }
      else if (t > e.shoulders - 0.2 && t < e.corners) { const depth = HALF * L.ramp(t, e.shoulders, e.corners - 0.3); poseSaw(sc.tools.dz, { ...DZ, plate: 0.3 }, false, [0, 0, -1], [0, 1, 0], [0.3, H - depth, W / 2 + 40], 40 + 120 * s); }
      else if (t > e.corners - 0.2 && t < e.chamfer + 1.5) { const c = sc.tools.ch; c.piv.visible = true; c.piv.rotation.set(0, Math.PI / 2, 0.25); c.piv.position.set(-2, H - 10, G.NECK / 2 + 12 + 8 * s); }
      const cam = L.camera('threeQ', [-20, HALF, 0], 820, { orbit: 0.55, lift: 0.55 });
      const r = (a, b) => L.ramp(t, a - 0.3, a + 0.2) * (1 - L.ramp(t, b - 0.3, b));
      L.show(this.c0, r(e.first, e.rip)); L.show(this.c1, r(e.rip, e.cheeks)); L.show(this.c2, r(e.cheeks, e.shoulders)); L.show(this.c3, L.ramp(t, e.shoulders - 0.3, e.shoulders + 0.2));
      const ia = r(e.top, e.shoulders); this.inset.setAttribute('opacity', ia); L.show(this.it, ia); L.show(this.it2, ia);
      return { scene: sc.s, camera: cam };
    },
  },
  S09: {
    build() {
      this.l1 = L.text('drop the male in from above', { x: 96, y: 990, size: 40, cls: 'plate' });
      this.l2 = L.text(`if a little too tight: <i>kigoroshi</i> ${kj('木殺し')} (a general carpentry manual) · the gennō's domed face is the <i>kigoroshi</i> face`, { x: 96, y: 900, size: 36, cls: 'plate', w: 1700 }); this.l2.classList.add('wrap');
      this.l3 = L.text('it bears on its faces, never on its tip', { x: 96, y: 990, size: 40, cls: 'plate' });
      // inset: side section through the dovetail's head, showing the deepened pocket (neutral, not an error)
      const svg = L.svgLayer(); this.inset = el2(svg, 'g', {}); const ix = 1300, iy = 220, S = 4;
      el2(this.inset, 'rect', { x: ix - 30, y: iy - 30, width: 560, height: 420, fill: '#F3EEE4', stroke: INK, 'stroke-width': 2, rx: 8 });
      el2(this.inset, 'path', { d: `M${ix},${iy + 52.5 * S} H${ix + 500} V${iy + 280} H${ix} Z`, fill: WOOD, stroke: INK, 'stroke-width': 2 });
      el2(this.inset, 'rect', { x: ix + 200, y: iy + 52.5 * S, width: 15 * S, height: 3 * S, fill: '#F3EEE4', stroke: INK, 'stroke-width': 2 });
      el2(this.inset, 'rect', { x: ix + 200, y: iy, width: 300, height: 52.5 * S, fill: '#EAD3AE', stroke: INK, 'stroke-width': 2 });
      this.it = L.text('section at the tip: a pocket ~3 mm below the seat level (model reading)', { x: ix + 250, y: iy + 290, size: 32, align: 'center', w: 520 }); this.it.classList.add('wrap');
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev; resetScene(sc); showState(sc.F, 2); showState(sc.M, 2);
      const k = L.ease(L.ramp(t, e.test, e.test + 2.2)); sc.mG.position.set(0, 220 * (1 - k), 0);
      const r = (a) => L.ramp(t, a - 0.3, a + 0.3);
      L.show(this.l1, r(e.test) * (1 - r(e.tight))); L.show(this.l2, r(e.tight)); L.show(this.l3, r(e.tip));
      const ia = r(e.tip); this.inset.setAttribute('opacity', ia); L.show(this.it, ia);
      return { scene: sc.s, camera: L.camera('threeQ', [-60, 60 + 80 * (1 - k), 0], 1200, { orbit: -0.35, lift: 0.5 }) };
    },
  },
  S10: {
    build() {
      const a = L.text('Next · Episode 7', { x: 96, y: 330, size: 48 }); a.style.fontWeight = 700;
      const b = L.text('Mortise and Tenon', { x: 96, y: 410, size: 96 }); b.style.fontWeight = 700;
      this.c = L.text('<i>hozo</i> and <i>hozo-ana</i>', { x: 96, y: 560, size: 48, cls: 'soft' });
    },
    frame(t, sh) { L.show(this.c, L.ramp(t, sh.ev.joint - 0.2, sh.ev.joint + 0.3)); return {}; },
  },
  S11: {
    build() {
      const h = L.text('Center lines first. Then mark, cut, taper, and drop it in.', { x: 96, y: 60, size: 56 }); h.style.fontWeight = 700;
      L.text('one training course\'s sequence (WBT); others may order things differently', { x: 96, y: 150, size: 36, cls: 'soft', w: 1728 });
      const rows = [
        ['koshikake ari-tsugi', '腰掛蟻継ぎ', 'seated dovetail splice', 'from Episode 5'],
        ['end line', '砂切り', 'end crosscut line', 'the end is cut square at this line'],
        ['koshikake', '腰掛', 'seat', 'the female\'s lower-half ledge the male sits on'],
        ['ari', '蟻', 'dovetail', 'its sides angled using the sashigane\'s blade width'],
        ['split the line', '', 'sumi o matagu', 'the kerf centered on the line (Episode 4)'],
        ['taper', '', 'cheeks', 'line left at the top, taken at the bottom: enters easily, tightens'],
        ['kigoroshi', '木殺し', 'if too tight', 'a general manual\'s remedy; also the gennō\'s domed face'],
      ];
      const g = L.text('', { x: 96, y: 240, size: 36, w: 1728 });
      g.innerHTML = '<div class="soft" style="font-size:36px;margin-bottom:12px;letter-spacing:.08em">GLOSSARY · EPISODE 6</div>' + rows.map((r) => `<div style="display:flex;gap:30px;margin-bottom:14px;align-items:baseline"><div style="width:640px;font-weight:700;font-size:38px"><i>${r[0]}</i> <span style="font-family:'Noto Serif CJK JP',serif;font-style:normal">${r[1]}</span></div><div style="width:1060px;white-space:normal;font-size:36px"><b>${r[2]}</b> — <span class="soft">${r[3]}</span></div></div>`).join('');
    },
    frame() { return {}; },
  },
  S12: {
    build() {
      const a = L.text('One note', { x: 960, y: 380, size: 48, align: 'center' }); a.style.fontWeight = 700;
      const b = L.text('Sharp-tool technique, and how to use these tools safely, is best learned from a teacher, at a bench, in person.', { x: 960, y: 470, size: 48, align: 'center', w: 1400 }); b.classList.add('wrap');
    },
    frame() { return {}; },
  },
  S13: { fadeOut: 1.0, build() { endCard(); }, frame() { return {}; } },
};

function titleCard() {
  const svg = L.svgLayer();
  el2(svg, 'line', { x1: 96, y1: 470, x2: 560, y2: 470, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 300, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('EPISODE 6', { x: 96, y: 370, size: 48 }); b.style.fontWeight = 700; b.style.letterSpacing = '0.12em';
  const c = L.text('Marking Out and Cutting', { x: 96, y: 510, size: 96 }); c.style.fontWeight = 700;
  L.text(`the <i>koshikake ari-tsugi</i> ${kj('腰掛蟻継ぎ')}, step by step`, { x: 96, y: 650, size: 52, cls: 'soft' });
}
function endCard() {
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 330, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('Next · Episode 7', { x: 96, y: 420, size: 48 }); b.style.fontWeight = 700;
  const c = L.text('Mortise and Tenon', { x: 96, y: 500, size: 96 }); c.style.fontWeight = 700;
  L.text('hozo and hozo-ana', { x: 96, y: 640, size: 40, cls: 'soft' });
  const svg = L.svgLayer(); el2(svg, 'line', { x1: 96, y1: 740, x2: 560, y2: 740, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
}
