// Episode 7 shots: hozo (tenon) and hozo-ana (mortise), post into sill: short tenon + hardware, long tenon + komisen.
// Joints are the exact, fit-checked solids from params.py; sizes on screen carry their source tags.
import { makeSaws } from '/shared/render/saws.js';
import { makeEdgeTools } from '/shared/render/edgetools.js';
let L, THREE, G, TL, SAWS, ET;
const R = (p) => `/episodes/ep07_hozo/${p}`;

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
const INK = '#1B1B1B', ACC = '#B8432F', GHOST = '#7D8EA0', WOOD = '#E6C9A0', WOODD = '#C9A577';
const kj = (s) => `<span style="font-family:'Noto Serif CJK JP',serif;font-style:normal;font-weight:600">${s}</span>`;
function arrow(svg, x1, y1, x2, y2, { color = INK, w = 4, head = 18 } = {}) {
  const g = el2(svg, 'g', {}); const a = Math.atan2(y2 - y1, x2 - x1);
  el2(g, 'line', { x1, y1, x2: x2 - Math.cos(a) * head * 0.8, y2: y2 - Math.sin(a) * head * 0.8, stroke: color, 'stroke-width': w });
  const p = [[x2, y2], [x2 - Math.cos(a - 0.42) * head, y2 - Math.sin(a - 0.42) * head], [x2 - Math.cos(a + 0.42) * head, y2 - Math.sin(a + 0.42) * head]];
  el2(g, 'polygon', { points: p.map((q) => q.join(',')).join(' '), fill: color });
  return g;
}
function xMark(svg, x, y, s = 22) { const g = el2(svg, 'g', {}); el2(g, 'circle', { cx: x, cy: y, r: s, fill: ACC }); el2(g, 'path', { d: `M${x - s * 0.45},${y - s * 0.45} L${x + s * 0.45},${y + s * 0.45} M${x + s * 0.45},${y - s * 0.45} L${x - s * 0.45},${y + s * 0.45}`, stroke: '#fff', 'stroke-width': 4 }); return g; }
function poseSaw(t, P, edgeTop, dir, up, p, sAlong) {
  const d = new THREE.Vector3(...dir).normalize(), u = new THREE.Vector3(...up).normalize();
  const yl = edgeTop ? u.clone().negate() : u.clone(), zl = new THREE.Vector3().crossVectors(d, yl).normalize();
  t.piv.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(d, yl, zl));
  const h = edgeTop ? P.h_heel + (P.h_toe - P.h_heel) * sAlong / P.len : 0;
  const local = new THREE.Vector3(sAlong, h, 0).applyQuaternion(t.piv.quaternion);
  t.piv.position.set(p[0] - local.x, p[1] - local.y, p[2] - local.z); t.piv.visible = true;
}
const stroke = (t, period = 1.4) => { const f = (t / period) % 1; return f < 0.6 ? L.ease(f / 0.6) : 1 - L.ease((f - 0.6) / 0.4); };
const ghostify = (mesh, a = 0.35) => { const m = mesh.material; [].concat(m).forEach((x) => { x.transparent = true; x.opacity = a; x.depthWrite = false; }); return mesh; };

// ---------- scenes ----------
let SC;
function getScene() {
  if (SC) return SC;
  const s = L.makeScene({ shadowBox: 1600, lightDir: [0.45, 1, 0.65] });
  const mk = (list, tintPost) => {
    const g = new THREE.Group(); const sill = L.memberMesh(list[0], { seed: 3 }); const post = L.memberMesh(list[1], { seed: 6, tint: tintPost });
    const pG = new THREE.Group(); pG.add(post); g.add(sill, pG);
    let pin = null; if (list[2]) { pin = L.memberMesh(list[2], { seed: 11, tint: '#B99068' }); g.add(pin); }
    const sillGhost = ghostify(L.memberMesh(list[0], { seed: 3 }), 0.28); sillGhost.visible = false; g.add(sillGhost);
    s.add(g); return { g, sill, sillGhost, post, pG, pin };
  };
  const short = mk(G.short, '#EAD3AE'), long = mk(G.long, '#EAD3AE');
  // a flat metal plate across the post-sill joint (schematic hardware for the short tenon, S04 only)
  const plate = new THREE.Mesh(new THREE.BoxGeometry(50, 220, 3), new THREE.MeshStandardMaterial({ color: '#7A7F84', metalness: 0.4, roughness: 0.45 }));
  plate.position.set(0, 10, G.SHORT.S / 2 + 1.6); plate.castShadow = true; short.g.add(plate); plate.visible = false; short.plate = plate;
  // blocks under the sills
  const ry = SAWS.ryoba({ len: 240, h_heel: 95, h_toe: 120, plate: 0.6, neck: 60, handle: 260, handle_d: 30, rip_pitch: 9, cross_pitch: 4.5 });
  const dz = SAWS.dozuki({ len: 240, h: 60, plate: 0.3, spine_h: 9, spine_t: 3, neck: 50, handle: 230, handle_d: 28, cross_pitch: 3.5 });
  [ry, dz].forEach((t) => { const p = new THREE.Group(); p.add(t.g); s.add(p); t.piv = p; p.visible = false; });
  SC = { s, short, long, ry, dz };
  return SC;
}
function only(sc, which) { sc.short.plate.visible = false; if (sc.chisel) sc.chisel.piv.visible = false; sc.ry.piv.visible = false; sc.dz.piv.visible = false; sc.short.g.visible = which.includes('short'); sc.long.g.visible = which.includes('long'); }
function reset(j) { j.g.rotation.set(0, 0, 0); j.g.position.set(0, 0, 0); j.g.scale.set(1, 1, 1); j.pG.position.set(0, 0, 0); j.sill.visible = true; j.sillGhost.visible = false; if (j.pin) { j.pin.visible = true; j.pin.position.set(0, 0, 0); } }

const SHOTS = {
  S01: {
    build() {},
    frame(t, sh) {
      const sc = getScene(), e = sh.ev, j = sc.long; only(sc, ['long']); reset(j);
      const k = L.ease(L.ramp(t, e.comes, e.comes + 2.0)); j.pG.position.set(0, 260 * (1 - k), 0);
      const kp = L.ease(L.ramp(t, e.pin - 0.2, e.pin + 1.2)); j.pin.position.set(0, 0, 220 * (1 - kp)); j.pin.visible = t > e.pin - 0.4;
      return { scene: sc.s, camera: L.camera('threeQ', [0, 80 + 120 * (1 - k), 0], 1200, { orbit: -0.25 + 0.01 * t, lift: 0.35 }) };
    },
  },
  S02: { fadeIn: 0.5, fadeOut: 0.6, build() { titleCard(); }, frame() { return {}; } },
  S03: {
    build() {
      const svg = L.svgLayer();
      // tenon (left) and mortise (right), schematic
      this.a = el2(svg, 'g', {});
      L.woodRect(this.a, 220, 200, 240, 380, { vertical: true }); el2(this.a, 'rect', { x: 300, y: 580, width: 80, height: 120, fill: WOOD, stroke: INK, 'stroke-width': 3 });
      this.la = L.label({ romaji: 'hozo', kanji: '枘', gloss: 'the tenon: the tongue', x: 180, y: 740 });
      this.b = el2(svg, 'g', {});
      L.woodRect(this.b, 640, 500, 520, 200, { vertical: false }); el2(this.b, 'rect', { x: 860, y: 500, width: 80, height: 120, fill: '#3A332D' });
      this.lb = L.label({ romaji: 'hozo-ana', kanji: '枘穴', gloss: 'the mortise: literally "tenon hole"', x: 640, y: 740 });
      this.lh = L.text('older reading: <i>hoso</i>', { x: 640, y: 860, size: 36, cls: 'soft' });
      // stepped tenon at a post top (schematic)
      this.c = el2(svg, 'g', {});
      L.woodRect(this.c, 1400, 360, 200, 340, { vertical: true }); el2(this.c, 'path', { d: 'M1440,360 V300 H1500 V250 H1540 V300 H1560 V360', fill: WOOD, stroke: INK, 'stroke-width': 3 });
      this.lc = L.label({ romaji: 'jūhozo', kanji: '重ほぞ', gloss: 'a stepped ("stacked") tenon, at a post top under a plate and a beam', x: 1300, y: 740 });
      this.lc.style.width = '520px'; this.lc.style.whiteSpace = 'normal';
      this.n = L.text('schematic', { x: 1824, y: 60, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const e = sh.ev, r = (a) => L.ramp(t, a - 0.3, a + 0.3);
      this.a.setAttribute('opacity', r(e.tenon)); L.show(this.la, r(e.tenon)); this.b.setAttribute('opacity', r(e.ana)); L.show(this.lb, r(e.ana)); L.show(this.lh, r(e.hoso));
      this.c.setAttribute('opacity', r(e.stepped)); L.show(this.lc, r(e.stepped));
      return {};
    },
  },
  S04: {
    build() {
      this.ls = L.text('short tenon + hardware<br><span class="soft">plate, bracket or staple</span>', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.ll = L.text(`long tenon + <i>komisen</i> ${kj('込み栓')}`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.src = L.text('posts outside the bearing walls · Flat 35 house specification · same member size, not dimensioned · hardware schematic', { x: 96, y: 915, size: 36, cls: 'soft', w: 1700 }); this.src.classList.add('wrap');
      const svg = L.svgLayer(); this.inset = el2(svg, 'g', {}); const ix = 720, iy = 280;
      el2(this.inset, 'rect', { x: ix - 20, y: iy - 20, width: 480, height: 400, fill: '#F3EEE4', stroke: INK, 'stroke-width': 2, rx: 8 });
      // plan of an outside sill corner, the post and its trapezoid-section tenon (schematic), plus a corner plate
      L.woodRect(this.inset, ix + 40, iy + 160, 380, 90, { vertical: false }); L.woodRect(this.inset, ix + 40, iy + 160, 90, 220, { vertical: true });
      el2(this.inset, 'rect', { x: ix + 40, y: iy + 160, width: 90, height: 90, fill: WOODD, stroke: INK, 'stroke-width': 2 });
      el2(this.inset, 'path', { d: `M${ix + 62},${iy + 180} L${ix + 110},${iy + 180} L${ix + 100},${iy + 230} L${ix + 72},${iy + 230} Z`, fill: '#EAD3AE', stroke: INK, 'stroke-width': 2 });
      el2(this.inset, 'path', { d: `M${ix + 140},${iy + 150} h60 M${ix + 30},${iy + 260} v60`, stroke: '#5E6266', 'stroke-width': 8 });
      this.li = L.text(`<i>ōgi-hozo</i> ${kj('扇ほぞ')} · a "fan" tenon, trapezoid section · with hardware · plan, schematic`, { x: ix - 20, y: iy + 400, size: 36, w: 520, cls: 'plate' }); this.li.classList.add('wrap');
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev; only(sc, ['short', 'long']); reset(sc.short); reset(sc.long);
      // same member size: scale the 120 mm long-tenon joint to 105 for this comparison only
      sc.short.g.position.set(-420, 0, 0); sc.long.g.position.set(420, 0, 0); const k = G.SHORT.S / G.LONG.S; sc.long.g.scale.set(k, k, k);
      // solid sills here: the cutaways come in S05 and S06
      sc.short.plate.visible = t > e.short;
      const cam = L.camera('front', [0, 100, 0], 2300, { orbit: 0.35, lift: 0.3 });
      anchor(this.ls, cam, [-420, 400, 0], -160, -60); anchor(this.ll, cam, [420, 400, 0], -330, -60);
      const r = (a) => L.ramp(t, a - 0.3, a + 0.3);
      const off = t > e.corner - 0.3; // the corner inset takes the frame on its own
      sc.short.g.visible = !off && t > e.short - 0.4; sc.long.g.visible = !off && t > e.long - 0.4;
      L.show(this.ls, off ? 0 : r(e.short)); L.show(this.ll, off ? 0 : r(e.long)); L.show(this.src, r(e.spec));
      const ia = r(e.corner); this.inset.setAttribute('opacity', ia); L.show(this.li, ia);
      return { scene: sc.s, camera: cam };
    },
  },
  S05: {
    build() {
      this.d1 = L.text('30 thick', { x: 0, y: 0, size: 40, cls: 'plate' }); this.d2 = L.text('85 wide', { x: 0, y: 0, size: 40, cls: 'plate' }); this.d3 = L.text('50 deep', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.src = L.text('105 mm post and sill · test standard for certified joint hardware (howtec) · mm', { x: 96, y: 966, size: 36, cls: 'soft' });
      this.card = L.text('bearing-wall joint rating (howtec standard details): short tenon alone 0.0 · pinned long tenon 0.7 · L-plate CP-L 0.7', { x: 96, y: 70, size: 36, cls: 'plate', w: 1700 }); this.card.classList.add('wrap');
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev, j = sc.short, P = G.SHORT; only(sc, ['short']); reset(j); j.sill.visible = false; j.sillGhost.visible = true;
      const cam = L.camera('threeQ', [0, -20, 0], 780, { orbit: -0.3, lift: 0.3 });
      const r = (a) => L.ramp(t, a - 0.3, a + 0.3);
      anchor(this.d1, cam, [0, -P.D / 2, P.T / 2], 30, -10); anchor(this.d2, cam, [P.W / 2, -P.D, 0], 20, 10); anchor(this.d3, cam, [-P.W / 2, -P.D / 2, P.T / 2], -170, -10);
      [this.d1, this.d2, this.d3].forEach((d) => L.show(d, r(e.dims))); L.show(this.src, r(e.big)); L.show(this.card, r(e.rating));
      return { scene: sc.s, camera: cam };
    },
  },
  S06: {
    build() {
      this.tag = L.text('lab specimen on 120 mm members (Toda 2015): tenon 117 deep · 18 mm square hardwood pin', { x: 96, y: 966, size: 36, cls: 'plate' });
      this.lp = L.text(`<i>komisen</i> ${kj('込み栓')}`, { x: 0, y: 0, size: 40, cls: 'plate' });
      const svg = L.svgLayer();
      // hanasen: schematic through-tenon (generic, not on a sill)
      this.hs = el2(svg, 'g', {}); const hx = 120, hy = 140;
      L.woodRect(this.hs, hx, hy + 90, 300, 70, { vertical: false }); L.woodRect(this.hs, hx + 120, hy, 60, 90, { vertical: true });
      el2(this.hs, 'rect', { x: hx + 130, y: hy + 160, width: 40, height: 60, fill: '#EAD3AE', stroke: INK, 'stroke-width': 2 });
      el2(this.hs, 'rect', { x: hx + 110, y: hy + 180, width: 80, height: 14, fill: '#B99068', stroke: INK, 'stroke-width': 2 });
      this.lh = L.text(`<i>hanasen</i> ${kj('鼻栓')} · a pin through the projecting part of a through-tenon · schematic`, { x: hx, y: hy + 240, size: 36, w: 420, cls: 'plate' }); this.lh.classList.add('wrap');
      // drawbore inset: the tenon's hole bored slightly closer to the shoulder; the pin pulls the post down (exaggerated)
      this.db = el2(svg, 'g', {}); const dx = 1340, dy = 160;
      el2(this.db, 'rect', { x: dx - 20, y: dy - 20, width: 480, height: 420, fill: '#F3EEE4', stroke: INK, 'stroke-width': 2, rx: 8 });
      L.woodRect(this.db, dx + 20, dy + 160, 400, 200, { vertical: false }); L.woodRect(this.db, dx + 160, dy, 120, 160, { vertical: true });
      el2(this.db, 'rect', { x: dx + 200, y: dy + 160, width: 40, height: 180, fill: '#EAD3AE', stroke: INK, 'stroke-width': 2 });
      el2(this.db, 'rect', { x: dx + 205, y: dy + 236, width: 30, height: 30, fill: 'none', stroke: INK, 'stroke-width': 3 });           // hole in the sill
      el2(this.db, 'rect', { x: dx + 205, y: dy + 224, width: 30, height: 30, fill: 'none', stroke: GHOST, 'stroke-width': 3, 'stroke-dasharray': '6 4' }); // hole in the tenon, higher
      arrow(this.db, dx + 320, dy + 120, dx + 320, dy + 175, { w: 4 });
      this.ld = L.text('hole in the tenon (dashed) bored slightly closer to the shoulder: the pin pulls the post down · exaggerated', { x: dx, y: dy + 410, size: 36, w: 440 }); this.ld.classList.add('wrap');
      this.lsq = L.text('square holes and pins (public-works spec) · round pins now more common (one lab report)', { x: 96, y: 900, size: 36, cls: 'plate', w: 1700 });
      this.lcl = L.text('bearing wall: same class as an L-shaped metal corner plate (Flat 35)', { x: 96, y: 840, size: 36, cls: 'plate', w: 1700 });
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev, j = sc.long, P = G.LONG; only(sc, ['long']); reset(j); j.sill.visible = false; j.sillGhost.visible = true;
      const cam = L.camera('threeQ', [0, -40, 0], 820, { orbit: -0.3, lift: 0.3 });
      const kp = L.ease(L.ramp(t, e.pin - 0.2, e.pin + 1.0)); j.pin.position.set(0, 0, 200 * (1 - kp)); j.pin.visible = t > e.pin - 0.4;
      const r = (a) => L.ramp(t, a - 0.3, a + 0.3);
      anchor(this.lp, cam, [0, -P.S / 2, P.S / 2 + 10], 30, 20); L.show(this.lp, r(e.pin)); L.show(this.tag, r(e.deep));
      const hs = r(e.hana) * (1 - r(e.holes)); this.hs.setAttribute('opacity', hs); L.show(this.lh, hs);
      const db = r(e.holes); this.db.setAttribute('opacity', db); L.show(this.ld, db);
      L.show(this.lsq, r(e.square)); L.show(this.lcl, r(e.class));
      return { scene: sc.s, camera: cam };
    },
  },
  S07: {
    build() {
      this.svg = L.svgLayer(); this.items = [];
      this.c1 = L.text('rip down the cheeks', { x: 96, y: 966, size: 40, cls: 'plate' });
      this.c2 = L.text('crosscut the shoulder: kerf on the waste side of its line', { x: 96, y: 966, size: 40, cls: 'plate' });
      this.c3 = L.text('practice piece (a beam\'s tenon): a little loose in thickness, a little tight in width', { x: 96, y: 966, size: 40, cls: 'plate' });
      // ✕ inset: a crosscut sawn too deep, into the tenon
      const svg = this.svg; this.bad = el2(svg, 'g', {}); const bx = 1380, by = 220;
      el2(this.bad, 'rect', { x: bx - 20, y: by - 20, width: 440, height: 360, fill: '#F3EEE4', stroke: INK, 'stroke-width': 2, rx: 8 });
      L.woodRect(this.bad, bx + 40, by + 20, 320, 200, { vertical: true });
      el2(this.bad, 'rect', { x: bx + 160, y: by + 220, width: 80, height: 80, fill: '#EAD3AE', stroke: INK, 'stroke-width': 2 });
      el2(this.bad, 'line', { x1: bx + 40, y1: by + 220, x2: bx + 200, y2: by + 220, stroke: ACC, 'stroke-width': 4 });
      xMark(this.bad, bx + 300, by + 60);
      this.lb = L.text('<span class="acc">✕ crosscut too deep: it cuts into the tenon</span>', { x: bx, y: by + 350, size: 36, w: 420 }); this.lb.classList.add('wrap');
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev, j = sc.short, P = G.SHORT; only(sc, ['short']); reset(j); j.sill.visible = false; j.sillGhost.visible = false;
      j.g.rotation.set(0, 0, Math.PI); j.g.position.set(0, 400, 0); // post end up, as on the bench
      const sk = stroke(t);
      // post end up: shoulder plane at y = 400, tenon above it (y 400..450), cheeks at z = +-T/2
      if (t > e.rip - 0.3 && t < e.cross - 0.2) { const dep = P.D * L.ramp(t, e.rip, e.cross - 0.5); poseSaw(sc.ry, { len: 240, h_heel: 95, h_toe: 120 }, false, [1, 0, 0], [0, 1, 0], [-60, 400 + P.D - dep, P.T / 2 + 0.3], 40 + 110 * sk); }
      else if (t > e.cross - 0.2 && t < e.loose) { const dep = (P.S - P.T) / 2 * L.ramp(t, e.cross, e.deep - 0.3); poseSaw(sc.dz, { len: 240, h: 60 }, false, [1, 0, 0], [0, 0, 1], [-60, 400.3, P.S / 2 - dep], 40 + 110 * sk); }
      const cam = L.camera('threeQ', [0, 420, 0], 760, { orbit: -0.3, lift: 0.4 });
      const r = (a, b) => L.ramp(t, a - 0.3, a + 0.2) * (1 - L.ramp(t, b - 0.3, b));
      L.show(this.c1, r(e.rip, e.cross)); L.show(this.c2, r(e.cross, e.loose)); L.show(this.c3, L.ramp(t, e.loose - 0.3, e.loose + 0.2));
      const ba = L.ramp(t, e.deep - 0.3, e.deep + 0.3) * (1 - L.ramp(t, e.loose - 0.3, e.loose)); this.bad.setAttribute('opacity', ba); L.show(this.lb, ba);
      return { scene: sc.s, camera: cam };
    },
  },
  S08: {
    build() {
      this.steps = ['a mortise chisel a little narrower than the hole', 'start a few mm inside the lines', 'rough it out', 'pare back to the lines · check the depth', 'strike lightly along the grain · a little harder across it'].map((s, i) => L.text(`${i + 1} · ${s}`, { x: 96, y: 620 + i * 66, size: 40 }));
      this.src = L.text('skills-test manual (MHLW): its steps for a mortise', { x: 96, y: 966, size: 36, cls: 'soft' });
      this.ch = null;
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev, j = sc.short, P = G.SHORT; only(sc, ['short']); reset(j); j.pG.position.set(0, 2000, 0);
      if (!this.ch) { this.ch = ET.chisel({ blade: 70, width: 24, thick: 16, bevel: 32, neck: 50, handle: 130, handle_d: 30, hoop: true }); const p = new THREE.Group(); p.add(this.ch.g); sc.s.add(p); this.ch.piv = p; sc.chisel = this.ch; }
      const f = (t / 0.9) % 1, s = f < 0.3 ? f / 0.3 : 1 - (f - 0.3) / 0.7;
      this.ch.piv.visible = t > e.chisel - 0.3; this.ch.piv.rotation.set(0, Math.PI / 2, -Math.PI / 2); this.ch.piv.position.set(P.W / 2 - 18, 10 + 30 * s, 0);
      const cam = L.camera('threeQ', [0, -10, 0], 700, { orbit: -0.3, lift: 0.7 });
      const at = [e.chisel, e.inside, e.inside + 1.5, e.pare, e.light]; this.steps.forEach((d, i) => L.show(d, L.ramp(t, at[i] - 0.3, at[i] + 0.3)));
      L.show(this.src, L.ramp(t, e.chisel, e.chisel + 0.5));
      return { scene: sc.s, camera: cam };
    },
  },
  S09: {
    build() {
      this.l1 = L.text('practice piece: the width goes in with light taps over a block of wood; the thickness, by hand', { x: 96, y: 860, size: 36, cls: 'plate', w: 1700 }); this.l1.classList.add('wrap');
      this.l2 = L.text('posts: a snug fit, driven in and fully seated (public-works specification)', { x: 96, y: 966, size: 40, cls: 'plate' });
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev, j = sc.short; only(sc, ['short']); reset(j);
      const k = L.ease(L.ramp(t, e.steps, e.taps + 0.8)); j.pG.position.set(0, 60 * (1 - k), 0);
      if (this.ch) this.ch.piv.visible = false;
      const r = (a) => L.ramp(t, a - 0.3, a + 0.3); L.show(this.l1, r(e.taps)); L.show(this.l2, r(e.snug));
      return { scene: sc.s, camera: L.camera('threeQ', [0, 120, 0], 1000, { orbit: -0.3, lift: 0.35 }) };
    },
  },
  S10: {
    build() {
      const a = L.text('Next · Episode 8', { x: 96, y: 330, size: 48 }); a.style.fontWeight = 700;
      const b = L.text('Beam Over Beam', { x: 96, y: 410, size: 96 }); b.style.fontWeight = 700;
      this.c = L.text('where one beam crosses over another', { x: 96, y: 560, size: 40, cls: 'soft' });
    },
    frame(t, sh) { L.show(this.c, L.ramp(t, sh.ev.cross - 0.2, sh.ev.cross + 0.3)); return {}; },
  },
  S11: {
    build() {
      const h = L.text('A short tenon needs hardware. A pinned long tenon pulls itself tight.', { x: 96, y: 60, size: 48, w: 1728 }); h.style.fontWeight = 700; h.classList.add('wrap');
      L.text('and a snug fit, made in small steps, does the rest', { x: 96, y: 140, size: 36, cls: 'soft', w: 1728 });
      const rows = [
        ['hozo', '枘', 'tenon', 'older reading hoso'],
        ['hozo-ana', '枘穴', 'mortise', 'literally "tenon hole"'],
        ['jūhozo', '重ほぞ', 'stepped tenon', 'at a post top where a plate and a beam stack'],
        ['ōgi-hozo', '扇ほぞ', 'fan tenon', 'trapezoid section; outside sill corners, with hardware'],
        ['komisen', '込み栓', 'draw pin', 'hardwood; square holes (spec); bored to pull the joint tight'],
        ['hanasen', '鼻栓', 'pin', 'through the projecting part of a through-tenon'],
      ];
      const g = L.text('', { x: 96, y: 230, size: 36, w: 1728 });
      g.innerHTML = '<div class="soft" style="font-size:36px;margin-bottom:12px;letter-spacing:.08em">GLOSSARY · EPISODE 7</div>' + rows.map((r) => `<div style="display:flex;gap:30px;margin-bottom:16px;align-items:baseline"><div style="width:520px;font-weight:700;font-size:38px"><i>${r[0]}</i> <span style="font-family:'Noto Serif CJK JP',serif;font-style:normal">${r[1]}</span></div><div style="width:1180px;white-space:normal;font-size:36px"><b>${r[2]}</b> — <span class="soft">${r[3]}</span></div></div>`).join('');
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
  const b = L.text('EPISODE 7', { x: 96, y: 370, size: 48 }); b.style.fontWeight = 700; b.style.letterSpacing = '0.12em';
  const c = L.text('Mortise and Tenon', { x: 96, y: 510, size: 96 }); c.style.fontWeight = 700;
  L.text(`<i>hozo</i> ${kj('枘')} and <i>hozo-ana</i> ${kj('枘穴')}`, { x: 96, y: 650, size: 56, cls: 'soft' });
  L.woodRect(svg, 1450, 260, 160, 320, { vertical: true }); el2(svg, 'rect', { x: 1500, y: 580, width: 60, height: 90, fill: WOOD, stroke: INK, 'stroke-width': 3 });
  L.woodRect(svg, 1300, 670, 460, 150, { vertical: false });
}
function endCard() {
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 330, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('Next · Episode 8', { x: 96, y: 420, size: 48 }); b.style.fontWeight = 700;
  const c = L.text('Beam Over Beam', { x: 96, y: 500, size: 96 }); c.style.fontWeight = 700;
  L.text('where one beam crosses over another', { x: 96, y: 640, size: 40, cls: 'soft' });
  const svg = L.svgLayer(); el2(svg, 'line', { x1: 96, y1: 740, x2: 560, y2: 740, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
}
