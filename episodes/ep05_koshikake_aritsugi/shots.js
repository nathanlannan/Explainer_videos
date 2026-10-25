// Episode 5 shots: the koshikake ari-tsugi -- what it is, where it goes, its parts, how it goes together, its limits.
// The two members are the exact, fit-checked solids from params.py (build/geometry.json).
let L, THREE, G, TL;
const R = (p) => `/episodes/ep05_koshikake_aritsugi/${p}`;

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
const INK = '#1B1B1B', ACC = '#B8432F', GHOST = '#7D8EA0', WOOD = '#E6C9A0', WOODD = '#C9A577';
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
function tick(svg, x, y, s = 22) { const g = el2(svg, 'g', {}); el2(g, 'circle', { cx: x, cy: y, r: s, fill: INK }); el2(g, 'path', { d: `M${x - s * 0.45},${y} L${x - s * 0.1},${y + s * 0.38} L${x + s * 0.5},${y - s * 0.4}`, stroke: '#fff', 'stroke-width': 4, fill: 'none' }); return g; }

// ---------- the joint in 3D ----------
let J;
function getJoint() {
  if (J) return J;
  const s = L.makeScene({ shadowBox: 1600, lightDir: [0.45, 1, 0.7] });
  const [fm, mm] = G.members;
  const female = L.memberMesh(fm, { seed: 3 }), male = L.memberMesh(mm, { seed: 7, tint: '#EAD3AE' }); // male slightly darker so the seam reads
  const fG = new THREE.Group(), mG = new THREE.Group(); fG.add(female); mG.add(male); s.add(fG, mG);
  // ghost copies of the male for the "wrong way in" attempts
  const ghostMat = new THREE.MeshBasicMaterial({ color: GHOST, transparent: true, opacity: 0.3, depthWrite: false });
  const gEnd = new THREE.Mesh(male.geometry, ghostMat), gSide = new THREE.Mesh(male.geometry, ghostMat.clone());
  s.add(gEnd, gSide); gEnd.visible = gSide.visible = false;
  // lift the whole joint onto blocks so it reads as a sill
  [[-600], [600]].forEach(([x]) => s.add(L.memberMesh(L.boxMember('blk', [x - 40, -60, -90, 80, 60, 180], 'z'), { seed: 9 })));
  J = { s, fG, mG, gEnd, gSide };
  return J;
}
const H = () => G.H;

const SHOTS = {
  S01: {
    build() {
      this.svg = L.svgLayer(); this.arr = null;
      this.held = L.text('a pull along the sill: held', { x: 0, y: 0, size: 40, cls: 'plate' });
    },
    frame(t, sh) {
      const j = getJoint(), e = sh.ev; j.gEnd.visible = j.gSide.visible = false;
      const k = L.ease(L.ramp(t, e.drops - 0.2, e.drops + 1.5));
      j.mG.position.set(0, 260 * (1 - k), 0);
      const cam = L.camera('threeQ', [0, 60 + 110 * (1 - k), 0], 1250, { orbit: -0.35 + 0.01 * t, lift: 0.5 });
      if (this.arr) this.arr.remove();
      const pa = L.ramp(t, e.apart - 0.3, e.apart + 0.3);
      // a short tug: the arrow pulls, the piece doesn't move
      this.arr = arrow3(this.svg, cam, [60, H() + 60, 0], [260, H() + 60, 0], { w: 6, head: 26 }); this.arr.setAttribute('opacity', pa);
      anchor(this.held, cam, [160, H() + 60, 0], -200, -100); L.show(this.held, pa);
      return { scene: j.s, camera: cam };
    },
  },
  S02: { fadeIn: 0.5, fadeOut: 0.6, build() { titleCard(); }, frame() { return {}; } },
  S03: {
    build() {
      const svg = L.svgLayer();
      // in-line splice
      this.a = el2(svg, 'g', {});
      L.woodRect(this.a, 140, 380, 360, 120, { vertical: false }); L.woodRect(this.a, 500, 380, 360, 120, { vertical: false });
      el2(this.a, 'path', { d: 'M500,380 v120', stroke: INK, 'stroke-width': 3, 'stroke-dasharray': '10 6' });
      this.la = L.label({ romaji: 'tsugite', kanji: '継手', gloss: 'a splice: two members joined end to end, in line', x: 140, y: 560 });
      // corner joint
      this.b = el2(svg, 'g', {});
      L.woodRect(this.b, 1180, 380, 460, 120, { vertical: false }); L.woodRect(this.b, 1180, 500, 120, 300, { vertical: true });
      el2(this.b, 'path', { d: 'M1180,500 h120', stroke: INK, 'stroke-width': 3, 'stroke-dasharray': '10 6' });
      this.lb = L.label({ romaji: 'shiguchi', kanji: '仕口', gloss: 'members meeting at an angle (also read shikuchi)', x: 1180, y: 840 });
      this.n = L.text('schematic', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const e = sh.ev, a = L.ramp(t, e.tsugite - 0.3, e.tsugite + 0.3), b = L.ramp(t, e.angle - 0.3, e.angle + 0.3);
      this.a.setAttribute('opacity', a); L.show(this.la, a); this.b.setAttribute('opacity', b); L.show(this.lb, b);
      return {};
    },
  },
  S04: {
    build() {
      const svg = L.svgLayer();
      this.t = L.text(`${kj('腰掛蟻継ぎ')}`, { x: 960, y: 90, size: 72, align: 'center' });
      this.t2 = L.text('<i>koshikake ari-tsugi</i>', { x: 960, y: 190, size: 44, align: 'center' });
      // dovetail plan (head left, neck right), flaring like a dove's tail
      this.dv = el2(svg, 'g', {});
      el2(this.dv, 'path', { d: 'M280,380 L280,620 L600,560 L600,440 Z', fill: WOOD, stroke: INK, 'stroke-width': 3 });
      L.woodRect(this.dv, 600, 400, 260, 200, { vertical: false });
      this.la = L.text(`<b><i>ari</i> ${kj('蟻')}</b> · the dovetail: it flares like a dove's tail`, { x: 280, y: 660, size: 40, w: 640 }); this.la.classList.add('wrap');
      // seat (side view): lower half projecting
      this.st = el2(svg, 'g', {});
      L.woodRect(this.st, 1100, 380, 300, 240, { vertical: false });
      el2(this.st, 'rect', { x: 1400, y: 500, width: 120, height: 120, fill: WOODD, stroke: INK, 'stroke-width': 3 });
      el2(this.st, 'path', { d: 'M1400,500 h120', stroke: INK, 'stroke-width': 5 });
      this.ls = L.text(`<b><i>koshikake</i> ${kj('腰掛')}</b> · the seat: the ledge the upper piece sits on<br><span class="soft">also <i>shikimen</i> ${kj('敷面')}</span>`, { x: 1100, y: 660, size: 40, w: 720 }); this.ls.classList.add('wrap');
      this.n = L.text('plan (left) · side view (right) · schematic', { x: 1824, y: 990, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const e = sh.ev, a = L.ramp(t, e.ari - 0.3, e.ari + 0.3), b = L.ramp(t, e.seat - 0.3, e.seat + 0.3);
      this.dv.setAttribute('opacity', a); L.show(this.la, a); this.st.setAttribute('opacity', b); L.show(this.ls, b);
      return {};
    },
  },
  S05: {
    build() {
      const svg = L.svgLayer();
      this.h = L.text('where the splice goes', { x: 96, y: 60, size: 56 }); this.h.style.fontWeight = 700;
      // a strip of foundation with the sill on it (plan); posts, vents, the splice, the anchor bolt
      const y0 = 420, x0 = 140, x1 = 1780;
      el2(svg, 'rect', { x: x0 - 20, y: y0 - 40, width: x1 - x0 + 40, height: 200, fill: '#D9D3C7', stroke: INK, 'stroke-width': 2 });
      L.woodRect(svg, x0, y0, x1 - x0, 120, { vertical: false });
      this.posts = el2(svg, 'g', {}); [x0 + 40, 780, x1 - 40].forEach((x) => el2(this.posts, 'rect', { x: x - 50, y: y0 + 10, width: 100, height: 100, fill: WOODD, stroke: INK, 'stroke-width': 3 }));
      this.lp = L.text('posts', { x: 780, y: y0 + 150, size: 36, align: 'center' });
      this.vents = el2(svg, 'g', {}); [470, 1460].forEach((x) => el2(this.vents, 'rect', { x: x - 70, y: y0 - 40, width: 140, height: 30, fill: '#FFFFFF', stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '8 5' }));
      this.lv = L.text('underfloor vents', { x: 470, y: y0 - 100, size: 36, align: 'center' });
      // splice between post and vent, clear of both
      const sx = 1130;
      this.sp = el2(svg, 'g', {});
      el2(this.sp, 'path', { d: `M${sx},${y0} V${y0 + 32} L${sx - 34},${y0 + 26} V${y0 + 94} L${sx},${y0 + 88} V${y0 + 120}`, stroke: INK, 'stroke-width': 4, fill: 'none' });
      this.lsp = L.text('splice: clear of posts and vents', { x: sx, y: y0 + 150, size: 36, align: 'center' });
      this.bolt = el2(svg, 'g', {}); el2(this.bolt, 'circle', { cx: sx + 70, cy: y0 + 60, r: 14, fill: INK });
      this.lb = L.text('anchor bolt: in the upper piece, beside the joint', { x: sx + 70, y: y0 - 110, size: 36, align: 'center', w: 520 }); this.lb.classList.add('wrap');
      this.lb2 = el2(svg, 'line', { x1: sx + 70, y1: y0 - 30, x2: sx + 70, y2: y0 + 44, stroke: INK, 'stroke-width': 2 });
      this.sz = L.text('sills at least 105 mm square', { x: 96, y: 760, size: 40 });
      this.src = L.text('Flat 35 housing-loan specification (JHF) · public-works specification (MLIT) · plan, schematic', { x: 96, y: 990, size: 36, cls: 'soft' });
      this.ob = L.text(`also used for <i>ōbiki</i> ${kj('大引')}: ground-floor beams that carry the floor joists`, { x: 96, y: 180, size: 40, w: 1700 });
    },
    frame(t, sh) {
      const e = sh.ev, r = (a) => L.ramp(t, a - 0.3, a + 0.3);
      L.show(this.ob, r(e.obiki));
      const av = r(e.avoid); this.posts.setAttribute('opacity', 0.35 + 0.65 * av); this.vents.setAttribute('opacity', av); L.show(this.lp, av); L.show(this.lv, av);
      this.sp.setAttribute('opacity', r(e.spec)); L.show(this.lsp, av);
      L.show(this.sz, r(e.size)); const b = r(e.bolt); this.bolt.setAttribute('opacity', b); this.lb2.setAttribute('opacity', b); L.show(this.lb, b);
      return {};
    },
  },
  S06: {
    build() {
      this.ogi = L.text(`<b>male</b> · <i>ogi</i> ${kj('男木')} · the upper piece`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.megi = L.text(`<b>female</b> · <i>megi</i> ${kj('女木')}`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.head = L.text('head', { x: 0, y: 0, size: 40, cls: 'plate' }); this.neck = L.text('neck', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.sho = L.text(`shoulder · ${kj('胴付き')}`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.seat = L.text(`seat · ${kj('腰掛')}`, { x: 0, y: 0, size: 40, cls: 'plate' }); this.sock = L.text('socket', { x: 0, y: 0, size: 40, cls: 'plate' });
    },
    frame(t, sh) {
      const j = getJoint(), e = sh.ev; j.gEnd.visible = j.gSide.visible = false;
      j.mG.position.set(60, 230, 0);
      const cam = L.camera('threeQ', [40, 130, 0], 1600, { orbit: -0.3, lift: 0.3 });
      const r = (a) => L.ramp(t, a - 0.3, a + 0.3);
      anchor(this.ogi, cam, [200, 230 + H(), 0], -200, -100); anchor(this.megi, cam, [-300, H(), 0], -100, -90);
      anchor(this.head, cam, [60 - G.LD, 230 + H(), 0], -160, -60); anchor(this.neck, cam, [60 - 4, 230 + H(), 0], -40, -110);
      anchor(this.sho, cam, [60, 230 + H() * 0.75, G.W / 2], 20, -20);
      anchor(this.seat, cam, [G.SEAT / 2, H() / 2, G.W / 2], 20, 20); anchor(this.sock, cam, [-G.LD / 2, H(), 0], -60, -80);
      L.show(this.ogi, r(e.ogi)); L.show(this.megi, r(e.megi)); L.show(this.sock, r(e.megi + 0.6)); L.show(this.seat, r(e.megi + 1.0));
      L.show(this.head, r(e.head)); L.show(this.neck, r(e.neck)); L.show(this.sho, r(e.shoulder));
      return { scene: j.s, camera: cam };
    },
  },
  S07: {
    build() {
      const svg = L.svgLayer(), S = 4.2, y0 = 760, xj = 960, Hs = G.H * S;
      this.h = L.text('side view', { x: 96, y: 60, size: 56 }); this.h.style.fontWeight = 700;
      // female (left): full height to x = 0, then the seat (lower half) out to SEAT; socket hidden line in the upper half
      const f = el2(svg, 'g', {}), m = el2(svg, 'g', {}); this.f = f; this.m = m;
      el2(f, 'path', { d: `M${xj - 520},${y0} H${xj + G.SEAT * S} V${y0 - Hs / 2} H${xj} V${y0 - Hs} H${xj - 520} Z`, fill: WOOD, stroke: INK, 'stroke-width': 3 });
      el2(f, 'path', { d: `M${xj - G.LD * S},${y0 - Hs} V${y0 - Hs / 2} H${xj}`, stroke: INK, 'stroke-width': 3, 'stroke-dasharray': '12 8', fill: 'none' });
      // male (right): cut back below over the seat; the dovetail (upper half) reaching into the socket
      el2(m, 'path', { d: `M${xj + 520},${y0} H${xj + G.SEAT * S} V${y0 - Hs / 2} H${xj} V${y0 - Hs} H${xj + 520} Z`, fill: '#EDD6B4', stroke: INK, 'stroke-width': 3 });
      el2(m, 'path', { d: `M${xj},${y0 - Hs} H${xj - G.LD * S} V${y0 - Hs / 2} H${xj}`, fill: '#EDD6B4', 'fill-opacity': 0.6, stroke: INK, 'stroke-width': 2, 'stroke-dasharray': '6 5' });
      this.mid = el2(svg, 'line', { x1: xj - 600, y1: y0 - Hs / 2, x2: xj + 600, y2: y0 - Hs / 2, stroke: GHOST, 'stroke-width': 3, 'stroke-dasharray': '14 10' });
      this.lu = L.text('dovetail and socket: about the upper half', { x: xj - 520, y: y0 - Hs - 70, size: 40 });
      this.ll = L.text('seat: the lower half', { x: xj - 520, y: y0 + 20, size: 40 });
      this.lc = L.text("male's lower half cut back: it sits on the seat", { x: xj + 520, y: y0 + 20, size: 40, align: 'right', w: 600 }); this.lc.classList.add('wrap');
      L.text('female', { x: xj - 300, y: y0 - Hs / 4 - 22, size: 36, cls: 'soft', align: 'center' }); L.text('male', { x: xj + 300, y: y0 - Hs / 4 - 22, size: 36, cls: 'soft', align: 'center' });
      L.text('drawn to scale · seat length assumed', { x: 1824, y: 990, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const e = sh.ev, r = (a) => L.ramp(t, a - 0.3, a + 0.3);
      L.show(this.lu, r(e.upper)); L.show(this.ll, r(e.lower)); L.show(this.lc, r(e.cut)); this.mid.setAttribute('opacity', r(e.upper));
      return {};
    },
  },
  S08: {
    build() {
      this.svg = L.svgLayer(); this.items = [];
      this.lEnd = L.text('<span class="acc">✕</span> not from the end: the flare stops it', { x: 0, y: 0, size: 36, cls: 'plate' });
      this.lSide = L.text('<span class="acc">✕</span> not from the side: the socket walls stop it', { x: 0, y: 0, size: 36, cls: 'plate' });
      this.lDown = L.text('straight down', { x: 0, y: 0, size: 40, cls: 'plate' }); this.lDown.style.fontWeight = 700;
      this.held = L.text('the flare hooks the pieces: they can\'t slide apart', { x: 96, y: 990, size: 40, cls: 'plate' });
      this.rest = L.text('the male rests on the seat', { x: 0, y: 0, size: 36, cls: 'plate' });
    },
    frame(t, sh) {
      const j = getJoint(), e = sh.ev, r = (a) => L.ramp(t, a - 0.3, a + 0.3);
      // ghosts: one trying to come in along the sill (stopped where the dovetail meets the female), one from the side
      j.gEnd.visible = t > e.end - 0.3 && t < e.drops; j.gEnd.material.opacity = 0.3 * r(e.end); j.gEnd.position.set(G.LD + 160 * (1 - L.ease(L.ramp(t, e.end, e.end + 1.2))) + 2, 0, 0);
      j.gSide.visible = t > e.side - 0.3 && t < e.drops; j.gSide.material.opacity = 0.3 * r(e.side); j.gSide.position.set(0, 0, G.W / 2 + G.HEAD / 2 + 160 * (1 - L.ease(L.ramp(t, e.side, e.side + 1.2))) + 2);
      const k = L.ease(L.ramp(t, e.drops - 0.1, e.drops + 1.2));
      j.mG.position.set(0, t < e.drops - 0.1 ? 260 : 260 * (1 - k), 0);
      const cam = L.camera('threeQ', [80, 110, 60], 1550, { orbit: -0.3, lift: 0.5 });
      this.items.forEach((x) => x.remove()); this.items = [];
      if (j.gEnd.visible) { const [x, y] = L.toScreen(cam, [G.LD + 2 + 60, H() + 10, 0]); this.items.push(xMark(this.svg, x, y - 40)); }
      if (j.gSide.visible) { const [x, y] = L.toScreen(cam, [0, H() + 10, G.W / 2 + G.HEAD / 2 + 40]); this.items.push(xMark(this.svg, x, y - 40)); }
      anchor(this.lEnd, cam, [G.LD + 200, H(), 0], -360, -120); L.show(this.lEnd, j.gEnd.visible ? r(e.end) : 0);
      anchor(this.lSide, cam, [0, H(), G.W / 2 + 140], -80, 30); L.show(this.lSide, j.gSide.visible ? r(e.side) : 0);
      const dn = r(e.drops) * (1 - r(e.hooks)); const da = arrow3(this.svg, cam, [420, H() + 260, 0], [420, H() + 60, 0], { w: 6, head: 26 }); da.setAttribute('opacity', dn); this.items.push(da);
      anchor(this.lDown, cam, [420, H() + 200, 0], 24, -20); L.show(this.lDown, dn);
      const ha = r(e.hooks); const pa = arrow3(this.svg, cam, [260, H() + 40, 0], [460, H() + 40, 0], { w: 6, head: 26 }); pa.setAttribute('opacity', ha); this.items.push(pa);
      L.show(this.held, ha); anchor(this.rest, cam, [G.SEAT / 2, H() / 2, G.W / 2], 30, 10); L.show(this.rest, r(e.rests));
      return { scene: j.s, camera: cam };
    },
  },
  S09: {
    build() {
      const svg = L.svgLayer(), S = 6, cx = 860, cy = 560, W = G.W * S;
      this.h = L.text('proportions', { x: 96, y: 60, size: 56 }); this.h.style.fontWeight = 700;
      // plan view: female left, male right; the dovetail drawn to scale
      const g = el2(svg, 'g', {}); this.g = g;
      L.woodRect(g, cx - 640, cy - W / 2, 640, W, { vertical: false });
      el2(g, 'path', { d: `M${cx},${cy - G.NECK * S / 2} L${cx - G.LD * S},${cy - G.HEAD * S / 2} L${cx - G.LD * S},${cy + G.HEAD * S / 2} L${cx},${cy + G.NECK * S / 2} Z`, fill: '#EDD6B4', stroke: INK, 'stroke-width': 3 });
      el2(g, 'rect', { x: cx, y: cy - W / 2, width: 420, height: W, fill: '#EDD6B4', stroke: INK, 'stroke-width': 3 });
      el2(g, 'path', { d: `M${cx},${cy - G.NECK * S / 2} L${cx - G.LD * S},${cy - G.HEAD * S / 2} L${cx - G.LD * S},${cy + G.HEAD * S / 2} L${cx},${cy + G.NECK * S / 2}`, fill: 'none', stroke: INK, 'stroke-width': 3 });
      // range bands from the engineering study: neck W/4..W/3 at the neck; length W/4..W/2 along the sill
      this.bn = el2(svg, 'g', {});
      el2(this.bn, 'rect', { x: cx + 6, y: cy - G.W / 3 * S / 2, width: 18, height: G.W / 3 * S, fill: GHOST, opacity: 0.35 });
      el2(this.bn, 'rect', { x: cx + 6, y: cy - G.W / 4 * S / 2, width: 18, height: G.W / 4 * S, fill: GHOST, opacity: 0.6 });
      this.bl = el2(svg, 'g', {});
      el2(this.bl, 'rect', { x: cx - G.W / 2 * S, y: cy + W / 2 + 14, width: G.W / 4 * S, height: 18, fill: GHOST, opacity: 0.35 });
      el2(this.bl, 'rect', { x: cx - G.W / 4 * S, y: cy + W / 2 + 14, width: G.W / 4 * S, height: 18, fill: GHOST, opacity: 0.6 });
      this.ln = L.text('neck: ¼ to ⅓ of the width', { x: cx + 440, y: cy - 30, size: 40 });
      this.ll = L.text('length: ¼ to ½ of the width', { x: cx - G.W / 2 * S, y: cy + W / 2 + 50, size: 40 });
      this.lo = L.text('our drawing: inside both<br>each side slopes about 1 in 5', { x: cx + 440, y: cy + 50, size: 40, w: 620 }); this.lo.classList.add('wrap');
      // schematic: a sashigane's blade laid along the side (unscaled)
      this.sq = el2(svg, 'g', {});
      el2(this.sq, 'rect', { x: 1420, y: 820, width: 380, height: 26, fill: '#D3D7DB', stroke: INK, 'stroke-width': 2, transform: 'rotate(-11 1420 833)' });
      this.lsq = L.text('the sides are angled using the width of the sashigane\'s blade (one training course) · schematic', { x: 1060, y: 900, size: 36, w: 760 }); this.lsq.classList.add('wrap');
      this.src = L.text('plan, to scale · ranges: engineering study (denmoku-db)', { x: 96, y: 990, size: 36, cls: 'soft' });
    },
    frame(t, sh) {
      const e = sh.ev, r = (a) => L.ramp(t, a - 0.3, a + 0.3);
      this.bn.setAttribute('opacity', r(e.neck)); L.show(this.ln, r(e.neck)); this.bl.setAttribute('opacity', r(e.length)); L.show(this.ll, r(e.length));
      L.show(this.lo, r(e.ours)); this.sq.setAttribute('opacity', r(e.sashigane)); L.show(this.lsq, r(e.sashigane));
      return {};
    },
  },
  S10: {
    build() {
      const svg = L.svgLayer();
      this.h = L.text('what it isn\'t', { x: 96, y: 60, size: 56 }); this.h.style.fontWeight = 700;
      const row = (y) => y;
      this.p1 = el2(svg, 'g', {}); L.woodRect(this.p1, 140, 200, 300, 70, { vertical: false }); L.woodRect(this.p1, 440, 200, 300, 70, { vertical: false }); arrow(this.p1, 140, 235, 60, 235); arrow(this.p1, 740, 235, 820, 235);
      this.l1 = L.text('holds only a modest pull: counted as weak in tension', { x: 880, y: 210, size: 40, w: 900 });
      this.p2 = el2(svg, 'g', {}); el2(this.p2, 'path', { d: 'M140,400 L440,400 L740,440', stroke: INK, 'stroke-width': 20, fill: 'none', 'stroke-linejoin': 'round' }); el2(this.p2, 'circle', { cx: 440, cy: 400, r: 14, fill: '#fff', stroke: INK, 'stroke-width': 4 });
      this.l2 = L.text('one test report: almost a hinge, very little resistance to bending', { x: 880, y: 380, size: 40, w: 900 }); this.l2.classList.add('wrap');
      this.p3 = el2(svg, 'g', {}); tick(this.p3, 180, 600); xMark(this.p3, 180, 680);
      this.l3 = L.text('anchor bolt in the upper piece, beside the joint', { x: 230, y: 576, size: 40 });
      this.l4 = L.text('<span class="acc">not in the female piece, not inside the joint</span>', { x: 230, y: 656, size: 40 });
      this.l5 = L.text('fails suddenly: the female can split at the notch, or the dovetail shear off', { x: 96, y: 800, size: 40, w: 1700 });
      this.l6 = L.text('keep knots out · a longer dovetail does not make it stronger', { x: 96, y: 870, size: 40, w: 1700 });
      this.src = L.text('engineering test reports (denmoku-db) · specifications (MLIT)', { x: 96, y: 990, size: 36, cls: 'soft' });
    },
    frame(t, sh) {
      const e = sh.ev, r = (a) => L.ramp(t, a - 0.3, a + 0.3);
      this.p1.setAttribute('opacity', r(e.pull)); L.show(this.l1, r(e.pull)); this.p2.setAttribute('opacity', r(e.hinge)); L.show(this.l2, r(e.hinge));
      this.p3.setAttribute('opacity', r(e.bolt)); L.show(this.l3, r(e.bolt)); L.show(this.l4, r(e.never));
      L.show(this.l5, r(e.split)); L.show(this.l6, r(e.knots));
      return {};
    },
  },
  S11: {
    build() {
      const a = L.text('Next · Episode 6', { x: 96, y: 330, size: 48 }); a.style.fontWeight = 700;
      const b = L.text('Marking Out and Cutting', { x: 96, y: 410, size: 96 }); b.style.fontWeight = 700;
      this.c = L.text('the koshikake ari-tsugi, step by step', { x: 96, y: 560, size: 40, cls: 'soft' });
    },
    frame(t, sh) { L.show(this.c, L.ramp(t, sh.ev.mark - 0.2, sh.ev.mark + 0.3)); return {}; },
  },
  S12: {
    build() {
      const h = L.text('A dovetail above, a seat below.', { x: 96, y: 60, size: 60 }); h.style.fontWeight = 700;
      L.text('the upper piece, the male, drops in from above · keep the splice away from posts and vents', { x: 96, y: 150, size: 36, cls: 'soft', w: 1728 });
      const rows = [
        ['koshikake ari-tsugi', '腰掛蟻継ぎ', 'seated dovetail splice', 'one of two standard sill splices (Flat 35 spec); also shikimen ari-tsugi 敷面蟻継'],
        ['tsugite', '継手', 'splice', 'joins members end to end, in line'],
        ['shiguchi', '仕口', 'angle joint', 'joins members meeting at an angle (also read shikuchi)'],
        ['ari', '蟻', 'dovetail', 'the flaring shape'],
        ['koshikake', '腰掛', 'seat', 'the ledge the upper piece sits on; also shikimen 敷面'],
        ['ogi / megi', '男木 / 女木', 'male / female', 'the male carries the dovetail and is the upper piece'],
        ['ōbiki', '大引', 'ground-floor beam', 'carries the floor joists'],
      ];
      const g = L.text('', { x: 96, y: 240, size: 36, w: 1728 });
      g.innerHTML = '<div class="soft" style="font-size:36px;margin-bottom:12px;letter-spacing:.08em">GLOSSARY · EPISODE 5</div>' + rows.map((r) => `<div style="display:flex;gap:30px;margin-bottom:14px;align-items:baseline"><div style="width:600px;font-weight:700;font-size:38px"><i>${r[0]}</i> <span style="font-family:'Noto Serif CJK JP',serif;font-style:normal">${r[1]}</span></div><div style="width:1100px;white-space:normal;font-size:36px"><b>${r[2]}</b> — <span class="soft">${r[3]}</span></div></div>`).join('');
    },
    frame() { return {}; },
  },
  S13: { fadeOut: 1.0, build() { endCard(); }, frame() { return {}; } },
};

function titleCard() {
  const svg = L.svgLayer();
  el2(svg, 'line', { x1: 96, y1: 470, x2: 560, y2: 470, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 300, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('EPISODE 5', { x: 96, y: 370, size: 48 }); b.style.fontWeight = 700; b.style.letterSpacing = '0.12em';
  const c = L.text('The First Joint', { x: 96, y: 510, size: 96 }); c.style.fontWeight = 700;
  L.text(`<i>koshikake ari-tsugi</i> ${kj('腰掛蟻継ぎ')}`, { x: 96, y: 650, size: 56, cls: 'soft' });
  const S = 3.2, cx = 1500, cy = 520;
  el2(svg, 'path', { d: `M${cx - 300},${cy - 52 * S / 2 * 1} H${cx} V${cy - G.NECK * S / 2} L${cx - G.LD * S},${cy - G.HEAD * S / 2} L${cx - G.LD * S},${cy + G.HEAD * S / 2} L${cx},${cy + G.NECK * S / 2} V${cy + 52 * S / 2} H${cx - 300}`, fill: 'none', stroke: INK, 'stroke-width': 4 });
  el2(svg, 'path', { d: `M${cx + 300},${cy - 52 * S / 2} H${cx} V${cy - G.NECK * S / 2} M${cx},${cy + G.NECK * S / 2} V${cy + 52 * S / 2} H${cx + 300}`, fill: 'none', stroke: INK, 'stroke-width': 4 });
}
function endCard() {
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 330, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('Next · Episode 6', { x: 96, y: 420, size: 48 }); b.style.fontWeight = 700;
  const c = L.text('Marking Out and Cutting', { x: 96, y: 500, size: 96 }); c.style.fontWeight = 700;
  L.text('the koshikake ari-tsugi, step by step, from centre lines to a test fit', { x: 96, y: 640, size: 40, cls: 'soft' });
  const svg = L.svgLayer(); el2(svg, 'line', { x1: 96, y1: 740, x2: 560, y2: 740, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
}
