// Episode 9 shots: the koshikake kama-tsugi ("gooseneck") -- the name, the parts, proportions and strength, where the
// spec uses it, its limits. The two members are the exact, fit-checked solids from params.py (build/geometry.json);
// their sizes are one test series' specimen geometry on 120 mm timbers and are tagged as such.
let L, THREE, G, TL;
const R = (p) => `/episodes/ep09_kama_tsugi/${p}`;

export async function init(lib) {
  L = lib; THREE = lib.THREE;
  G = await (await fetch(R('build/geometry.json'))).json();
  TL = await (await fetch(R('build/timeline.json'))).json();
  const byId = Object.fromEntries(TL.shots.map((s) => [s.id, s]));
  const shots = Object.entries(SHOTS).map(([id, def]) => ({ id, ...byId[id], ...def }));
  return { shots, fps: TL.fps, total: TL.total };
}
function el2(parent, tag, attrs) { return L.el('svg:' + tag, attrs, parent); }
function anchor(d, cam, pt, dx = 0, dy = 0) { const [x, y] = L.toScreen(cam, pt); d.style.left = x + dx + 'px'; d.style.top = y + dy + 'px'; }
const INK = '#1B1B1B', ACC = '#B8432F', GHOST = '#7D8EA0', WOOD = '#E6C9A0', WOODL = '#EDD6B4', STEEL = '#6F757B';
const kj = (s) => `<span style="font-family:'Noto Serif CJK JP',serif;font-style:normal;font-weight:600">${s}</span>`;
function arrow(svg, x1, y1, x2, y2, { color = INK, w = 4, head = 18 } = {}) {
  const g = el2(svg, 'g', {}); const a = Math.atan2(y2 - y1, x2 - x1);
  el2(g, 'line', { x1, y1, x2: x2 - Math.cos(a) * head * 0.8, y2: y2 - Math.sin(a) * head * 0.8, stroke: color, 'stroke-width': w });
  const p = [[x2, y2], [x2 - Math.cos(a - 0.42) * head, y2 - Math.sin(a - 0.42) * head], [x2 - Math.cos(a + 0.42) * head, y2 - Math.sin(a + 0.42) * head]];
  el2(g, 'polygon', { points: p.map((q) => q.join(',')).join(' '), fill: color });
  return g;
}
function arrow3(svg, cam, a, b, opts) { const [x1, y1] = L.toScreen(cam, a), [x2, y2] = L.toScreen(cam, b); return arrow(svg, x1, y1, x2, y2, opts); }
function xMark(svg, x, y, s = 22) { const g = el2(svg, 'g', {}); el2(g, 'circle', { cx: x, cy: y, r: s, fill: ACC }); el2(g, 'path', { d: `M${x - s * 0.45},${y - s * 0.45} L${x + s * 0.45},${y + s * 0.45} M${x + s * 0.45},${y - s * 0.45} L${x - s * 0.45},${y + s * 0.45}`, stroke: '#fff', 'stroke-width': 4 }); return g; }
const r = (t, a) => L.ramp(t, a - 0.3, a + 0.3);
const win = (t, a, b) => L.ramp(t, a - 0.3, a + 0.2) * (1 - L.ramp(t, b - 0.3, b));
// plan outline of the gooseneck tenon (mm, x pointing into the female, z across), from params.py
const kamaPts = () => { const n = G.NECK / 2, j = G.NECK / 2 + G.E, tp = G.TIP / 2, h = G.L / 2; return [[0, -n], [0, n], [-h, n], [-h, j], [-G.L, tp], [-G.L, -tp], [-h, -j], [-h, -n]]; };

// ---------- the joint in 3D ----------
let J;
function getJoint() {
  if (J) return J;
  const s = L.makeScene({ shadowBox: 1700, lightDir: [0.45, 1, 0.7] });
  const [fm, mm] = G.members;
  const female = L.memberMesh(fm, { seed: 3 }), male = L.memberMesh(mm, { seed: 7, tint: '#EAD3AE' });
  const fG = new THREE.Group(), mG = new THREE.Group(); fG.add(female); mG.add(male); s.add(fG, mG);
  const gSide = new THREE.Mesh(male.geometry, new THREE.MeshBasicMaterial({ color: GHOST, transparent: true, opacity: 0.3, depthWrite: false }));
  s.add(gSide); gSide.visible = false;
  [[-560], [560]].forEach(([x]) => s.add(L.memberMesh(L.boxMember('blk', [x - 40, -60, -100, 80, 60, 200], 'z'), { seed: 9 })));
  J = { s, fG, mG, gSide };
  return J;
}
const H = () => G.H;

const SHOTS = {
  S01: {
    build() {},
    frame(t, sh) {
      const j = getJoint(), e = sh.ev; j.gSide.visible = false;
      const k = L.ease(L.ramp(t, e.drops, e.drops + 2.2)); j.mG.position.set(0, 280 * (1 - k), 0);
      return { scene: j.s, camera: L.camera('threeQ', [-90, 60 + 120 * (1 - k), 0], 1650, { orbit: -0.35 + 0.01 * t, lift: 0.5 }) };
    },
  },
  S02: { fadeIn: 0.5, fadeOut: 0.6, build() { titleCard(); }, frame() { return {}; } },
  S03: {
    build() {
      const svg = L.svgLayer();
      this.big = L.text(`${kj('鎌継ぎ')}`, { x: 960, y: 120, size: 120, align: 'center' });
      this.l1 = L.text('<i>kama-tsugi</i> · read かまつぎ in two dictionaries · also <i>kama</i> alone, as a short form', { x: 960, y: 300, size: 40, align: 'center' });
      // a sickle (schematic)
      this.sk = el2(svg, 'g', {}); const sx = 300, sy = 520;
      el2(this.sk, 'path', { d: `M${sx},${sy} C${sx + 60},${sy - 140} ${sx + 260},${sy - 150} ${sx + 330},${sy - 40} C${sx + 250},${sy - 100} ${sx + 110},${sy - 90} ${sx + 40},${sy + 10} Z`, fill: '#8A9096', stroke: INK, 'stroke-width': 3 });
      el2(this.sk, 'rect', { x: sx - 20, y: sy - 10, width: 26, height: 220, fill: '#B99068', stroke: INK, 'stroke-width': 3, rx: 6, transform: `rotate(-12 ${sx} ${sy})` });
      this.ls = L.text(`${kj('鎌')} <i>kama</i> · on its own, a sickle`, { x: 200, y: 780, size: 40 });
      // a snake raising its head on a curved neck (schematic)
      this.sn = el2(svg, 'g', {}); const nx = 1180, ny = 730;
      el2(this.sn, 'path', { d: `M${nx},${ny} C${nx + 120},${ny + 20} ${nx + 260},${ny - 10} ${nx + 330},${ny - 60} C${nx + 400},${ny - 120} ${nx + 340},${ny - 260} ${nx + 290},${ny - 300}`, fill: 'none', stroke: '#7E7A4E', 'stroke-width': 26, 'stroke-linecap': 'round' });
      el2(this.sn, 'ellipse', { cx: nx + 265, cy: ny - 318, rx: 40, ry: 24, fill: '#7E7A4E', transform: `rotate(-25 ${nx + 265} ${ny - 318})` });
      el2(this.sn, 'circle', { cx: nx + 258, cy: ny - 326, r: 4, fill: '#F3EEE4' });
      this.lk = L.text(`${kj('鎌首')} <i>kamakubi</i> · a snake's raised head and neck<br><span class="soft">literally, a neck curved like a sickle</span>`, { x: 1000, y: 780, size: 40, w: 820 }); this.lk.classList.add('wrap');
      this.lg = L.text('"gooseneck": an English name, not a translation · the Japanese name says nothing about geese', { x: 960, y: 980, size: 36, align: 'center', cls: 'plate' });
      this.n = L.text('schematic', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const e = sh.ev;
      L.show(this.big, r(t, e.dict - 0.4)); L.show(this.l1, r(t, e.short));
      const a = r(t, e.sickle); this.sk.setAttribute('opacity', a); L.show(this.ls, a);
      const b = r(t, e.kubi); this.sn.setAttribute('opacity', b); L.show(this.lk, b); L.show(this.n, a);
      L.show(this.lg, r(t, e.goose));
      return {};
    },
  },
  S04: {
    build() {
      this.svg = L.svgLayer(); this.items = [];
      this.ogi = L.text(`<b>male</b> · ${kj('男木')} · the upper piece`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.megi = L.text(`<b>female</b> · ${kj('女木')} · the lower piece`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.half = L.text('head and socket: about the upper half · seat: the lower half', { x: 96, y: 990, size: 40, cls: 'plate' });
      this.head = L.text(`head · ${kj('鎌')} <i>kama</i>`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.neck = L.text(`neck · ${kj('首')} <i>kubi</i>`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.seat = L.text(`seat · ${kj('腰掛')} <i>koshikake</i>`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.src = L.text('part names: JAANUS glossary · sizes: one test series, 120 mm timbers', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
      this.lp = L.text('pulled: the flared back of the head bears against the socket', { x: 96, y: 990, size: 40, cls: 'plate' });
      this.lx = L.text('<span class="acc">✕ can\'t slide sideways (our model)</span>', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.lu = L.text('nothing stops it lifting', { x: 0, y: 0, size: 40, cls: 'plate' });
    },
    frame(t, sh) {
      const j = getJoint(), e = sh.ev; this.items.forEach((x) => x.remove()); this.items = [];
      const k = L.ease(L.ramp(t, e.drops - 0.1, e.drops + 1.2));
      j.mG.position.set(0, 250 * (1 - k), 0);
      const cam = L.camera('threeQ', [-120, 90 + 110 * (1 - k), 0], 1500 + 400 * (1 - k), { orbit: -0.3, lift: 0.5 });
      const y = 250 * (1 - k);
      anchor(this.ogi, cam, [200, y + H() / 2, G.W / 2], -150, 10); anchor(this.megi, cam, [-420, H(), 0], -120, -90);
      L.show(this.ogi, win(t, e.male, e.drops)); L.show(this.megi, win(t, e.female, e.drops)); L.show(this.half, win(t, e.half, e.pull));
      anchor(this.head, cam, [-G.L + 20, y + H(), 0], -250, -90); anchor(this.neck, cam, [-G.L / 4, y + H(), 0], -10, -120);
      anchor(this.seat, cam, [G.SEAT / 2, H() / 2, G.W / 2], 30, 30);
      L.show(this.head, win(t, e.names, e.drops)); L.show(this.neck, win(t, e.neck, e.drops)); L.show(this.seat, win(t, e.seat, e.drops));
      L.show(this.src, r(t, e.names));
      // pulled along the timbers: the arrow pulls, nothing moves
      const pa = win(t, e.pull, e.slide);
      if (pa > 0.01) { const ar = arrow3(this.svg, cam, [120, H() + 40, 0], [360, H() + 40, 0], { w: 6, head: 26 }); ar.setAttribute('opacity', pa); this.items.push(ar); }
      L.show(this.lp, pa);
      // ghost sliding sideways: stopped (fit-checked)
      const g = win(t, e.slide, e.lift); j.gSide.visible = g > 0.01; j.gSide.material.opacity = 0.3 * g; j.gSide.position.set(0, 0, 90);
      if (g > 0.01) { const [x, yy] = L.toScreen(cam, [-G.L / 2, H() + 20, 120]); const m = xMark(this.svg, x, yy - 30); m.setAttribute('opacity', g); this.items.push(m); anchor(this.lx, cam, [-G.L / 2, H() + 20, 120], 40, -60); }
      L.show(this.lx, g);
      const u = r(t, e.lift);
      if (u > 0.01) { const ar = arrow3(this.svg, cam, [0, H() + 10, 0], [0, H() + 200, 0], { w: 5, head: 22 }); ar.setAttribute('opacity', u); this.items.push(ar); anchor(this.lu, cam, [0, H() + 150, 0], 30, -20); }
      L.show(this.lu, u);
      return { scene: j.s, camera: cam };
    },
  },
  S05: {
    build() {
      const svg = L.svgLayer(), S = 2.6, cy = 330;
      this.h = L.text('Plans, drawn to the same scale', { x: 96, y: 54, size: 48 }); this.h.style.fontWeight = 700;
      // gooseneck: a 120 mm member stub with its tenon pointing left
      this.gk = el2(svg, 'g', {}); const gx = 560;
      el2(this.gk, 'rect', { x: gx, y: cy - G.W / 2 * S, width: 240, height: G.W * S, fill: WOODL, stroke: INK, 'stroke-width': 3 });
      el2(this.gk, 'polygon', { points: kamaPts().map(([x, z]) => `${gx + x * S},${cy + z * S}`).join(' '), fill: WOODL, stroke: INK, 'stroke-width': 3 });
      this.hl = el2(this.gk, 'g', {});
      [-1, 1].forEach((sgn) => el2(this.hl, 'circle', { cx: gx - G.L / 2 * S, cy: cy + sgn * (G.NECK / 2) * S, r: 22, fill: 'none', stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '6 5' }));
      this.lg = L.text('gooseneck · one test series\' specimens on 120 mm timbers: neck 30, head + neck 150, flare 7.5 a side · slope and taper omitted', { x: 96, y: 500, size: 36, w: 760 }); this.lg.classList.add('wrap');
      // dovetail (Episode 5's drawing): 105 mm member, neck 30, head 50, length 50
      this.ar = el2(svg, 'g', {}); const ax = 1500, W5 = 105, n5 = 15, h5 = 25, l5 = 50;
      el2(this.ar, 'rect', { x: ax, y: cy - W5 / 2 * S, width: 240, height: W5 * S, fill: WOODL, stroke: INK, 'stroke-width': 3 });
      el2(this.ar, 'polygon', { points: [[0, -n5], [0, n5], [-l5, h5], [-l5, -h5]].map(([x, z]) => `${ax + x * S},${cy + z * S}`).join(' '), fill: WOODL, stroke: INK, 'stroke-width': 3 });
      this.la = L.text('dovetail · Episode 5\'s drawing on 105 mm: neck 30, length 50, head 50', { x: 1180, y: 500, size: 36, w: 640 }); this.la.classList.add('wrap');
      // test loads: range bars (kN), attributed
      this.bars = el2(svg, 'g', {}); const bx = 700, k = 40, by = 720;
      el2(this.bars, 'line', { x1: bx, y1: by - 30, x2: bx, y2: by + 150, stroke: INK, 'stroke-width': 2 });
      [0, 10, 20].forEach((v) => { el2(this.bars, 'line', { x1: bx + v * k, y1: by + 130, x2: bx + v * k, y2: by + 145, stroke: INK, 'stroke-width': 2 }); const tx = el2(this.bars, 'text', { x: bx + v * k, y: by + 180, 'text-anchor': 'middle', 'font-size': 36, fill: INK, 'font-family': "'Noto Sans', sans-serif" }); tx.textContent = `${v} kN`; });
      el2(this.bars, 'line', { x1: bx, y1: by + 137, x2: bx + 22 * k, y2: by + 137, stroke: INK, 'stroke-width': 2 });
      el2(this.bars, 'rect', { x: bx + 6.3 * k, y: by, width: (7.6 - 6.3) * k, height: 40, fill: GHOST });
      el2(this.bars, 'rect', { x: bx + 15.7 * k, y: by + 80, width: (21.2 - 15.7) * k, height: 40, fill: '#9C7A4E' });
      this.lb1 = L.text('dovetail specimens · 6.3–7.6 kN', { x: 96, y: by - 2, size: 36 });
      this.lb2 = L.text('gooseneck specimens · 15.7–21.2 kN', { x: 96, y: by + 78, size: 36 });
      this.lb3 = L.text('average peak pull, 120 mm sugi timbers, one national test database (denmoku-db) · timber grades and joint sizes differ: a rough guide, not a rule', { x: 96, y: 930, size: 36, cls: 'soft', w: 1700 }); this.lb3.classList.add('wrap');
      // findings
      this.f1 = L.text('stress gathers near the neck (dashed circles) · a longer gooseneck isn\'t simply stronger', { x: 96, y: 690, size: 40 });
      this.f2 = L.text('one study: the timbers\' depth mattered more than the splice\'s length', { x: 96, y: 755, size: 40 });
      this.f3 = L.text('failure: often sudden and brittle, the head or neck shearing off; sometimes the flared edges crush first', { x: 96, y: 820, size: 40, w: 1700 }); this.f3.classList.add('wrap');
      this.f4 = L.text('often treated as a pin in design: it holds a pull, resists bending very little (test database)', { x: 96, y: 950, size: 40, w: 1700 }); this.f4.classList.add('wrap');
    },
    frame(t, sh) {
      const e = sh.ev, p = r(t, e.test);
      this.gk.setAttribute('opacity', p); L.show(this.lg, p); this.ar.setAttribute('opacity', r(t, e.drawings)); L.show(this.la, r(t, e.drawings)); L.show(this.h, p);
      const b = win(t, e.database, e.stress); this.bars.setAttribute('opacity', b); L.show(this.lb1, b); L.show(this.lb2, b); L.show(this.lb3, b);
      this.hl.setAttribute('opacity', r(t, e.stress)); L.show(this.f1, r(t, e.stress)); L.show(this.f2, r(t, e.depth)); L.show(this.f3, r(t, e.fail)); L.show(this.f4, r(t, e.pin));
      return {};
    },
  },
  S06: {
    build() {
      const h = L.text('Where it\'s used', { x: 96, y: 60, size: 56 }); h.style.fontWeight = 700;
      L.text('Flat 35 house specification', { x: 96, y: 140, size: 36, cls: 'soft' });
      const row = (y, html) => { const d = L.text(html, { x: 96, y, size: 40, w: 1700 }); d.classList.add('wrap'); return d; };
      this.r1 = row(230, 'sills · eaves plates · purlins: the dovetail splice or the gooseneck');
      this.r2 = row(300, 'beams in the outer walls at second-floor level: the gooseneck or another splice <span class="soft">· not the dovetail</span>');
      this.r3 = row(410, 'roof beams: only where about 120 mm deep, with steel straps on both faces, bolted through');
      this.r4 = row(480, 'one option for second-floor floor beams: the same, plus nails');
      this.r5 = row(550, 'purlins: two nails');
      // sill splice with the anchor bolt in the upper (male) piece (Episode 5 callback)
      const svg = L.svgLayer(); this.bolt = el2(svg, 'g', {}); const y0 = 760;
      L.woodRect(this.bolt, 300, y0, 640, 110, { vertical: false }); L.woodRect(this.bolt, 940, y0, 640, 110, { vertical: false });
      el2(this.bolt, 'path', { d: `M940,${y0} v55 h-60 v55`, stroke: INK, 'stroke-width': 3, fill: 'none', 'stroke-dasharray': '10 6' });
      el2(this.bolt, 'rect', { x: 1060, y: y0 - 40, width: 16, height: 190, fill: STEEL, stroke: INK, 'stroke-width': 2 });
      el2(this.bolt, 'rect', { x: 1046, y: y0 - 48, width: 44, height: 14, fill: STEEL, stroke: INK, 'stroke-width': 2 });
      this.lbl = L.text('sill: the anchor bolt in the upper piece, beside the splice · public-works specification (MLIT) · schematic', { x: 96, y: 920, size: 36, w: 1700 }); this.lbl.classList.add('wrap');
      L.text('upper piece', { x: 1260, y: y0 + 30, size: 36, cls: 'soft', align: 'center' }); L.text('lower piece', { x: 620, y: y0 + 30, size: 36, cls: 'soft', align: 'center' });
    },
    frame(t, sh) {
      const e = sh.ev;
      L.show(this.r1, r(t, e.sills)); L.show(this.r2, r(t, e.outer)); L.show(this.r3, r(t, e.roof)); L.show(this.r4, r(t, e.option)); L.show(this.r5, r(t, e.purlins));
      const b = r(t, e.bolt); this.bolt.setAttribute('opacity', b); L.show(this.lbl, b);
      return {};
    },
  },
  S07: {
    build() {
      const svg = L.svgLayer(), S = 3.2, y0 = 560, xj = 960, Hs = G.H * S, sb = 30 * S;
      this.h = L.text('Limits', { x: 96, y: 54, size: 56 }); this.h.style.fontWeight = 700;
      this.side = el2(svg, 'g', {});
      el2(this.side, 'path', { d: `M${xj - 560},${y0} H${xj + G.SEAT * S} V${y0 - Hs / 2} H${xj} V${y0 - Hs} H${xj - 560} Z`, fill: WOOD, stroke: INK, 'stroke-width': 3 });
      el2(this.side, 'path', { d: `M${xj + 560},${y0} H${xj + G.SEAT * S} V${y0 - Hs / 2} H${xj} V${y0 - Hs} H${xj + 560} Z`, fill: WOODL, stroke: INK, 'stroke-width': 3 });
      el2(this.side, 'path', { d: `M${xj},${y0 - Hs} H${xj - G.L * S} V${y0 - Hs / 2} H${xj}`, fill: 'none', stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '8 6' });
      this.stub = el2(svg, 'rect', { x: xj + G.SEAT * S - sb, y: y0 - Hs / 2 - 1, width: sb, height: 36, fill: '#D9B98C', stroke: INK, 'stroke-width': 3, 'stroke-dasharray': '8 5' });
      this.ls = L.text(`a stub tenon ${kj('目違い')} at the seat · schematic`, { x: xj + 120, y: y0 - Hs / 2 + 40, size: 36, cls: 'plate' });
      L.text('side view', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
      this.l1 = L.text('its job: resisting twisting (a training course; JAANUS; the test database)', { x: 96, y: 680, size: 40 });
      this.l2 = L.text('pulling strength: no gain in one test series (Toda 2012)', { x: 96, y: 750, size: 40 });
      this.l3 = L.text('knots or grain run-out at the splice weaken it', { x: 96, y: 850, size: 40 });
      this.l4 = L.text('the test database: a generous safety margin, or added hardware', { x: 96, y: 920, size: 40 });
    },
    frame(t, sh) {
      const e = sh.ev; const s = r(t, e.stub);
      this.stub.setAttribute('opacity', s); L.show(this.ls, s);
      L.show(this.l1, r(t, e.twist)); L.show(this.l2, r(t, e.one)); L.show(this.l3, r(t, e.knots)); L.show(this.l4, r(t, e.margin));
      return {};
    },
  },
  S08: {
    build() {
      const a = L.text('Next · Episode 10', { x: 96, y: 330, size: 48 }); a.style.fontWeight = 700;
      const b = L.text('Cutting the Gooseneck', { x: 96, y: 410, size: 96 }); b.style.fontWeight = 700;
      L.text('marking out and cutting, step by step', { x: 96, y: 560, size: 40, cls: 'soft' });
    },
    frame() { return {}; },
  },
  S09: {
    build() {
      const h = L.text('A head on a neck, dropped onto a seat. It holds a pull, but engineers often model it as a pin.', { x: 96, y: 60, size: 48, w: 1728 }); h.style.fontWeight = 700; h.classList.add('wrap');
      const rows = [
        ['koshikake kama-tsugi', '腰掛け鎌継ぎ', 'seated gooseneck splice', 'the male drops in from above onto the seat'],
        ['kama', '鎌', 'head', 'also a short form of kama-tsugi; on its own, a sickle'],
        ['kubi', '首', 'neck', 'between the shoulder and the head'],
        ['kamakubi', '鎌首', "a snake's raised head and neck", 'literally a neck curved like a sickle; two sources compare the tenon to one'],
        ['koshikake', '腰掛', 'seat', "the female's lower-half ledge"],
        ['(stub tenon)', '目違い', 'stub tenon', 'resists twisting; no added pull in one test series'],
      ];
      const g = L.text('', { x: 96, y: 230, size: 36, w: 1728 });
      g.innerHTML = '<div class="soft" style="font-size:36px;margin-bottom:12px;letter-spacing:.08em">GLOSSARY · EPISODE 9</div>' + rows.map((x) => `<div style="display:flex;gap:30px;margin-bottom:16px;align-items:baseline"><div style="width:640px;font-weight:700;font-size:38px"><i>${x[0]}</i> <span style="font-family:'Noto Serif CJK JP',serif;font-style:normal">${x[1]}</span></div><div style="width:1060px;white-space:normal;font-size:36px"><b>${x[2]}</b> — <span class="soft">${x[3]}</span></div></div>`).join('');
    },
    frame() { return {}; },
  },
  S10: { fadeOut: 1.0, build() { endCard(); }, frame() { return {}; } },
};

function titleCard() {
  const svg = L.svgLayer();
  el2(svg, 'line', { x1: 96, y1: 470, x2: 560, y2: 470, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 300, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('EPISODE 9', { x: 96, y: 370, size: 48 }); b.style.fontWeight = 700; b.style.letterSpacing = '0.12em';
  const c = L.text('The Gooseneck', { x: 96, y: 510, size: 96 }); c.style.fontWeight = 700;
  L.text(`<i>koshikake kama-tsugi</i> ${kj('腰掛け鎌継ぎ')}`, { x: 96, y: 650, size: 56, cls: 'soft' });
  // the tenon in plan
  const S = 2.2, gx = 1600, cy = 520;
  el2(svg, 'rect', { x: gx, y: cy - 60 * S, width: 140, height: 120 * S, fill: WOODL, stroke: INK, 'stroke-width': 3 });
  el2(svg, 'polygon', { points: kamaPts().map(([x, z]) => `${gx + x * S},${cy + z * S}`).join(' '), fill: WOODL, stroke: INK, 'stroke-width': 3 });
}
function endCard() {
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 330, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('Next · Episode 10', { x: 96, y: 420, size: 48 }); b.style.fontWeight = 700;
  const c = L.text('Cutting the Gooseneck', { x: 96, y: 500, size: 96 }); c.style.fontWeight = 700;
  const svg = L.svgLayer(); el2(svg, 'line', { x1: 96, y1: 740, x2: 560, y2: 740, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
}
