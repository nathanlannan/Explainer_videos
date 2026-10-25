// Episode 11 shots: the okkake daisen-tsugi -- the name, the parts and how it goes together, where the spec uses it,
// length and strength. The pieces and pegs are the exact, fit-checked solids from params.py (build/geometry.json); their
// sizes are one lab's test proportions and are tagged as such.
let L, THREE, G, TL;
const R = (p) => `/episodes/ep11_okkake/${p}`;

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
const INK = '#1B1B1B', ACC = '#B8432F', GHOST = '#7D8EA0', WOOD = '#E6C9A0', WOODL = '#EDD6B4', PEGC = '#9C6B3C';
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
const SRC = 'sizes: one lab\'s test proportions (Toda 2012): 120 wide · 180 deep · splice 360';

// ---------- the joint in 3D ----------
let J;
function getJoint() {
  if (J) return J;
  const s = L.makeScene({ shadowBox: 2200, lightDir: [0.45, 1, 0.7] });
  const [lm, um] = G.members;
  const lower = L.memberMesh(lm, { seed: 3 }), upper = L.memberMesh(um, { seed: 7, tint: '#EAD3AE' });
  const uG = new THREE.Group(); uG.add(upper); s.add(lower, uG);
  const pegs = G.pegs.map((p) => { const m = L.memberMesh(p, { seed: 11, tint: PEGC }); const g = new THREE.Group(); g.add(m); s.add(g); return g; });
  const ghostMat = new THREE.MeshBasicMaterial({ color: GHOST, transparent: true, opacity: 0.3, depthWrite: false });
  const gX = new THREE.Mesh(upper.geometry, ghostMat), gZ = new THREE.Mesh(upper.geometry, ghostMat.clone()); s.add(gX, gZ); gX.visible = gZ.visible = false;
  [[-500], [G.L + 500]].forEach(([x]) => s.add(L.memberMesh(L.boxMember('blk', [x - 40, -60, -100, 80, 60, 200], 'z'), { seed: 9 })));
  J = { s, lower, uG, pegs, gX, gZ };
  return J;
}
function setPegs(j, k0, k1) { j.pegs[0].position.set(0, 0, 220 * (1 - k0)); j.pegs[1].position.set(0, 0, -220 * (1 - k1)); j.pegs[0].visible = k0 > 0.001; j.pegs[1].visible = k1 > 0.001; }

const SHOTS = {
  S01: {
    build() { this.src = L.text(SRC, { x: 96, y: 966, size: 36, cls: 'soft' }); },
    frame(t, sh) {
      const j = getJoint(), e = sh.ev; j.gX.visible = j.gZ.visible = false;
      const k = L.ease(L.ramp(t, e.lowered, e.lowered + 2.0)); j.uG.position.set(13 * (1 - k), 300 * (1 - k), 0);
      setPegs(j, L.ease(L.ramp(t, e.pegs + 0.6, e.pegs + 1.8)), L.ease(L.ramp(t, e.pegs + 1.4, e.pegs + 2.6)));
      L.show(this.src, r(t, e.term));
      return { scene: j.s, camera: L.camera('threeQ', [G.L / 2, 60 + 110 * (1 - k), 0], 1700, { orbit: -0.3 + 0.008 * t, lift: 0.7 }) };
    },
  },
  S02: { fadeIn: 0.5, fadeOut: 0.6, build() { titleCard(); }, frame() { return {}; } },
  S03: {
    build() {
      this.big = L.text(`${kj('追掛け大栓継ぎ')}`, { x: 960, y: 150, size: 110, align: 'center' });
      this.l1 = L.text('<i>okkake daisen-tsugi</i> · read おっかけだいせんつぎ in Japanese references', { x: 960, y: 330, size: 40, align: 'center' });
      this.l2 = L.text(`${kj('大栓')} <i>daisen</i> · written with the characters for "large" and "peg"`, { x: 960, y: 450, size: 40, align: 'center' });
      this.l3 = L.text(`without the pegs: ${kj('追掛継')} <i>okkake-tsugi</i>`, { x: 960, y: 540, size: 40, align: 'center' });
      this.l4 = L.text('Episode 9: for the beams in the outer walls at second-floor level, the Flat 35 house specification offers the gooseneck, or this splice', { x: 960, y: 720, size: 40, align: 'center', w: 1500 }); this.l4.classList.add('wrap');
    },
    frame(t, sh) {
      const e = sh.ev;
      L.show(this.big, r(t, e.read - 0.4)); L.show(this.l1, r(t, e.read)); L.show(this.l2, r(t, e.daisen)); L.show(this.l3, r(t, e.without)); L.show(this.l4, r(t, e.ep));
      return {};
    },
  },
  S04: {
    build() {
      this.svg = L.svgLayer(); this.items = [];
      this.ll = L.text(`<b>lower piece</b> · ${kj('下木')} · set first`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.lu = L.text(`<b>upper piece</b> · ${kj('上木')} · lowered onto it`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.same = L.text('the same shape, turned end for end · the slope runs the other way on the upper piece (one training course)', { x: 96, y: 900, size: 36, cls: 'plate', w: 1700 }); this.same.classList.add('wrap');
      this.lh = L.text('over the splice: about half the width, full depth', { x: 96, y: 966, size: 40, cls: 'plate' });
      this.la = L.text(`<i>ago</i> ${kj('顎')} · the step at the middle`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.lm = L.text(`<i>mechigai</i> ${kj('目違')} · a tongue at each end`, { x: 0, y: 0, size: 40, cls: 'plate' });
      // plan inset: the top face, the stepped joint line (simplified: drawn straight)
      const S = 1.6, px = 130, py = 200; this.plan = el2(this.svg, 'g', {});
      el2(this.plan, 'rect', { x: px - 30, y: py - 40, width: G.L * S + 160, height: G.W * S + 160, fill: '#F3EEE4', stroke: INK, 'stroke-width': 2, rx: 8 });
      el2(this.plan, 'rect', { x: px, y: py, width: G.L * S + 100, height: G.W * S, fill: WOOD, stroke: INK, 'stroke-width': 2 });
      const zc = (z) => py + (G.W / 2 - z) * S, xc = (x) => px + 50 + x * S, e = G.E / 2, F = G.F;
      el2(this.plan, 'path', { d: `M${xc(0)},${zc(G.W / 2)} V${zc(e)} H${xc(-F)} V${zc(-e)} H${xc(G.L / 2)} V${zc(e)} H${xc(G.L + F)} V${zc(-e)} H${xc(G.L)} V${zc(-G.W / 2)}`, stroke: INK, 'stroke-width': 4, fill: 'none' });
      this.pt = L.text('top face · simplified: in the drawings the line runs slightly oblique', { x: px - 20, y: py + G.W * S + 20, size: 36, w: G.L * S + 140 }); this.pt.classList.add('wrap');
      // elevation inset: the ago's sloped face, exaggerated
      const ex = 140, ey = 200; this.elev = el2(this.svg, 'g', {});
      el2(this.elev, 'rect', { x: ex - 30, y: ey - 40, width: 560, height: 540, fill: '#F3EEE4', stroke: INK, 'stroke-width': 2, rx: 8 });
      el2(this.elev, 'path', { d: `M${ex},${ey} H${ex + 230} L${ex + 290},${ey + 260} H${ex} Z`, fill: WOOD, stroke: INK, 'stroke-width': 3 });
      el2(this.elev, 'path', { d: `M${ex + 230},${ey} H${ex + 500} V${ey + 260} H${ex + 290} Z`, fill: WOODL, stroke: INK, 'stroke-width': 3 });
      el2(this.elev, 'path', { d: `M${ex + 260},${ey - 20} V${ey + 280}`, stroke: GHOST, 'stroke-width': 2, 'stroke-dasharray': '8 6' });
      this.et = L.text('the ago\'s face, side view · slope greatly exaggerated · 1/20 of the depth (one source), about 1/10 (another)', { x: ex - 10, y: ey + 290, size: 36, w: 520 }); this.et.classList.add('wrap');
      this.ld = L.text('as the upper piece drops, the slope draws the shoulders closed', { x: 96, y: 966, size: 40, cls: 'plate' });
      this.lp = L.text(`pegs · ${kj('大栓')} · from opposite sides: they stop it lifting out`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.lx = L.text('<span class="acc">✕ can\'t be pulled apart or pushed sideways (our model)</span>', { x: 96, y: 966, size: 40, cls: 'plate' });
      this.l9a = L.text('without the pegs: it lifts straight out', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.l9b = L.text('with the pegs in: held', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.src = L.text(SRC, { x: 1824, y: 60, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const j = getJoint(), e = sh.ev; this.items.forEach((x) => x.remove()); this.items = [];
      j.gX.visible = j.gZ.visible = false;
      // the upper hovers until "lowered", then drops (moving -x as the slope bites), then lifts again in the demo
      const k = L.ease(L.ramp(t, e.lowered, e.lowered + 1.6));
      const lift = 70 * L.ease(L.ramp(t, e.lift9, e.lift9 + 0.8)) * (1 - L.ease(L.ramp(t, e.with - 0.2, e.with + 0.6)));
      j.uG.position.set(13 * (1 - k), 320 * (1 - k) + lift, 0);
      const pk0 = L.ease(L.ramp(t, e.pegs, e.pegs + 1.0)), pk1 = L.ease(L.ramp(t, e.pegs + 0.8, e.pegs + 1.8));
      const pegsOn = t < e.lift9 - 0.2 || t > e.with;
      setPegs(j, pegsOn ? pk0 : 0, pegsOn ? pk1 : 0); j.pegs.forEach((p) => { p.position.y = lift; });
      const exploded = t < e.lowered;
      const cam = L.camera('threeQ', [G.L * 0.6, 60 + 170 * (1 - k), 0], 1500 + 1000 * (1 - k), { orbit: -0.25, lift: 0.9 - 0.3 * k });
      anchor(this.ll, cam, [-200, G.H, -G.W / 2], -200, 30); anchor(this.lu, cam, [G.L * 0.8, 320 * (1 - k) + G.H, 0], -200, -100);
      L.show(this.ll, win(t, e.same, e.above)); L.show(this.lu, win(t, e.same, e.above));
      L.show(this.same, win(t, e.warns - 1.5, e.half)); L.show(this.lh, win(t, e.half, e.slope));
      anchor(this.la, cam, [G.L / 2, G.H, 0], -60, 40); anchor(this.lm, cam, [G.L + G.F / 2, G.H, 0], -40, 60);
      L.show(this.la, win(t, e.ago, e.lowered) * (exploded ? 1 : 0)); L.show(this.lm, win(t, e.mech, e.lowered) * (exploded ? 1 : 0));
      const pa = win(t, e.above, e.slope); this.plan.setAttribute('opacity', pa); L.show(this.pt, pa);
      const ea = win(t, e.slope, e.pegs); this.elev.setAttribute('opacity', ea); L.show(this.et, ea);
      L.show(this.ld, win(t, e.lowered, e.pegs));
      anchor(this.lp, cam, [G.L / 4, G.H / 2, G.W / 2 + 40], -40, 20); L.show(this.lp, win(t, e.pegs + 0.5, e.model));
      // fit-check demo: ghost pulled along the beam and ghost pushed sideways, both stopped
      const g = win(t, e.model, e.lift9);
      if (g > 0.01) {
        j.gX.visible = j.gZ.visible = true; j.gX.position.set(70, 0, 0); j.gZ.position.set(0, 0, 90); j.gX.material.opacity = 0.3 * g; j.gZ.material.opacity = 0.3 * g;
        const [x1, y1] = L.toScreen(cam, [G.L + 70, G.H + 20, 0]); const m1 = xMark(this.svg, x1, y1 - 20); m1.setAttribute('opacity', g); this.items.push(m1);
        const [x2, y2] = L.toScreen(cam, [G.L / 2, G.H + 20, 150]); const m2 = xMark(this.svg, x2, y2 - 20); m2.setAttribute('opacity', g); this.items.push(m2);
      }
      L.show(this.lx, g);
      const la = win(t, e.lift9, e.with);
      if (la > 0.01) { const ar = arrow3(this.svg, cam, [G.L * 0.75, G.H + 20, 0], [G.L * 0.75, G.H + 200, 0], { w: 5, head: 22 }); ar.setAttribute('opacity', la); this.items.push(ar); }
      anchor(this.l9a, cam, [G.L * 0.75, G.H + 160, 0], 30, -20); L.show(this.l9a, la);
      anchor(this.l9b, cam, [G.L / 4, G.H / 2, G.W / 2 + 40], -40, 20); L.show(this.l9b, r(t, e.with + 0.4));
      L.show(this.src, r(t, e.same));
      return { scene: j.s, camera: cam };
    },
  },
  S05: {
    build() {
      const h = L.text('Where it\'s used', { x: 96, y: 64, size: 56 }); h.style.fontWeight = 700;
      L.text('Flat 35 house specification', { x: 96, y: 144, size: 36, cls: 'soft' });
      const row = (y, html) => { const d = L.text(html, { x: 96, y, size: 40, w: 1700 }); d.classList.add('wrap'); return d; };
      this.r1 = row(220, 'beams in the outer walls at second-floor level: this splice, or the gooseneck');
      this.r2 = row(285, 'eaves plates: this splice, the gooseneck, or the dovetail');
      this.r3 = row(350, 'second-floor floor beams: one of the options');
      this.r4 = row(415, 'roof beams: this splice first · the gooseneck only where about 120 mm deep, with steel straps and bolts');
      this.r5 = row(540, 'no hardware named for this splice');
      const svg = L.svgLayer(); this.d = el2(svg, 'g', {}); const y0 = 720;
      el2(this.d, 'rect', { x: 560, y: y0 + 80, width: 70, height: 170, fill: '#C9A577', stroke: INK, 'stroke-width': 2 });
      L.woodRect(this.d, 200, y0, 760, 80, { vertical: false }); L.woodRect(this.d, 960, y0, 760, 80, { vertical: false });
      el2(this.d, 'path', { d: `M820,${y0} V${y0 + 80} M1100,${y0} V${y0 + 80}`, stroke: INK, 'stroke-width': 3, 'stroke-dasharray': '10 6' });
      el2(this.d, 'line', { x1: 595, y1: y0 - 30, x2: 820, y2: y0 - 30, stroke: INK, 'stroke-width': 2 });
      this.lp = L.text(`off the post, a short way out · ${kj('柱より持ち出し')} · splice dashed · schematic`, { x: 540, y: y0 - 90, size: 36 });
      L.text('post', { x: 595, y: y0 + 260, size: 36, cls: 'soft', align: 'center' });
    },
    frame(t, sh) {
      const e = sh.ev;
      L.show(this.r1, r(t, e.offers)); L.show(this.r2, r(t, e.offers + 2.2)); L.show(this.r3, r(t, e.offers + 3.6)); L.show(this.r4, r(t, e.roof)); L.show(this.r5, r(t, e.none));
      const p = r(t, e.post); this.d.setAttribute('opacity', p); L.show(this.lp, p);
      return {};
    },
  },
  S06: {
    build() {
      const h = L.text('Length and strength', { x: 96, y: 64, size: 56 }); h.style.fontWeight = 700;
      const T = (y, s, cls = '') => L.text(s, { x: 96, y, size: 40, cls });
      this.l1 = T(160, 'splice length: about 3× the depth gives the most strength (a training course)');
      this.l2 = T(215, '3–4× for beams 105 or 120 mm deep (a joinery handbook: 住吉・松井)');
      this.l3 = T(270, '1.5–3× (one test database)');
      this.l4 = T(350, 'our model: one lab\'s test proportions (Toda 2012): 120 wide · 180 deep · splice 360', 'soft');
      const svg = L.svgLayer(); this.bars = el2(svg, 'g', {}); const bx = 900, k = 12, by = 450;
      el2(this.bars, 'rect', { x: bx + 14.0 * k, y: by, width: (18.4 - 14.0) * k, height: 40, fill: GHOST });
      el2(this.bars, 'rect', { x: bx + 49.0 * k, y: by + 70, width: (50.3 - 49.0) * k + 4, height: 40, fill: '#9C7A4E' });
      el2(this.bars, 'line', { x1: bx, y1: by + 125, x2: bx + 60 * k, y2: by + 125, stroke: INK, 'stroke-width': 2 });
      [0, 20, 40, 60].forEach((v) => { el2(this.bars, 'line', { x1: bx + v * k, y1: by + 118, x2: bx + v * k, y2: by + 132, stroke: INK, 'stroke-width': 2 }); const tx = el2(this.bars, 'text', { x: bx + v * k, y: by + 170, 'text-anchor': 'middle', 'font-size': 36, fill: INK, 'font-family': "'Noto Sans', sans-serif" }); tx.textContent = `${v} kN`; });
      this.b1 = L.text('gooseneck specimens · 14.0–18.4 kN', { x: 96, y: by - 4, size: 36 });
      this.b2 = L.text('this splice · 49.0–50.3 kN', { x: 96, y: by + 66, size: 36 });
      this.b3 = L.text('peak pull, same lab, 180 mm deep · gooseneck head + neck 120–180 · this splice 360–480 long: much longer', { x: 96, y: 680, size: 36, cls: 'soft', w: 1700 }); this.b3.classList.add('wrap');
      this.l5 = T(790, 'depth mattered more: 360 → 480 long, 49.0 → 50.3 kN · 180 → 240 deep, 50.3 → 77.2 kN');
      this.l6 = T(855, 'bending: better than the gooseneck, only partly · often treated as a pin (test database)');
      this.l7 = T(920, 'slow by hand: 1–4 splices per person per day (one architect\'s guide)');
      [this.l5, this.l6, this.l7].forEach((d) => { d.style.fontSize = '38px'; });
    },
    frame(t, sh) {
      const e = sh.ev;
      L.show(this.l1, r(t, e.long + 0.6)); L.show(this.l2, r(t, e.hand)); L.show(this.l3, r(t, e.database)); L.show(this.l4, r(t, e.model));
      const b = r(t, e.tests); this.bars.setAttribute('opacity', b); L.show(this.b1, b); L.show(this.b2, b); L.show(this.b3, b);
      L.show(this.l5, r(t, e.mattered)); L.show(this.l6, r(t, e.bending)); L.show(this.l7, r(t, e.slow));
      return {};
    },
  },
  S07: {
    build() {
      const a = L.text('Next · Episode 12', { x: 96, y: 330, size: 48 }); a.style.fontWeight = 700;
      const b = L.text('Cutting the Okkake', { x: 96, y: 410, size: 96 }); b.style.fontWeight = 700;
      L.text('marking out and cutting, step by step', { x: 96, y: 560, size: 40, cls: 'soft' });
    },
    frame() { return {}; },
  },
  S08: {
    build() {
      const h = L.text('Two pieces of the same shape: the upper lowered onto the lower along a slope, then pegged so they can\'t lift apart.', { x: 96, y: 60, size: 48, w: 1728 }); h.style.fontWeight = 700; h.classList.add('wrap');
      const rows = [
        ['okkake daisen-tsugi', '追掛け大栓継ぎ', 'a pegged splice', 'two same-shape pieces, half the width each over the splice'],
        ['okkake-tsugi', '追掛継', 'the same, unpegged', 'the name without the pegs'],
        ['daisen', '大栓', 'the pegs', 'written "large" + "peg"; hardwood, driven from opposite sides'],
        ['ago', '顎', 'the step at the middle', 'its sloped face draws the shoulders closed as the upper drops'],
        ['mechigai', '目違', 'end tongue', 'stops the pieces coming apart sideways'],
        ['lower · upper piece', '下木 · 上木', 'order of assembly', 'the lower set first; the upper lowered onto it'],
      ];
      const g = L.text('', { x: 96, y: 230, size: 36, w: 1728 });
      g.innerHTML = '<div class="soft" style="font-size:36px;margin-bottom:12px;letter-spacing:.08em">GLOSSARY · EPISODE 11</div>' + rows.map((x) => `<div style="display:flex;gap:30px;margin-bottom:16px;align-items:baseline"><div style="width:660px;font-weight:700;font-size:38px"><i>${x[0]}</i> <span style="font-family:'Noto Serif CJK JP',serif;font-style:normal">${x[1]}</span></div><div style="width:1040px;white-space:normal;font-size:36px"><b>${x[2]}</b> — <span class="soft">${x[3]}</span></div></div>`).join('');
    },
    frame() { return {}; },
  },
  S09: { fadeOut: 1.0, build() { endCard(); }, frame() { return {}; } },
};

function titleCard() {
  const svg = L.svgLayer();
  el2(svg, 'line', { x1: 96, y1: 470, x2: 560, y2: 470, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 300, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('EPISODE 11', { x: 96, y: 370, size: 48 }); b.style.fontWeight = 700; b.style.letterSpacing = '0.12em';
  const c = L.text('The Other Splice', { x: 96, y: 510, size: 96 }); c.style.fontWeight = 700;
  L.text(`<i>okkake daisen-tsugi</i> ${kj('追掛け大栓継ぎ')}`, { x: 96, y: 650, size: 56, cls: 'soft' });
  // the top face in plan: the stepped line
  const S = 1.3, px = 1180, py = 470, zc = (z) => py + (G.W / 2 - z) * S, xc = (x) => px + 80 + x * S, e = G.E / 2;
  el2(svg, 'rect', { x: px, y: py, width: G.L * S + 160, height: G.W * S, fill: WOOD, stroke: INK, 'stroke-width': 2 });
  el2(svg, 'path', { d: `M${xc(0)},${zc(G.W / 2)} V${zc(e)} H${xc(-G.F)} V${zc(-e)} H${xc(G.L / 2)} V${zc(e)} H${xc(G.L + G.F)} V${zc(-e)} H${xc(G.L)} V${zc(-G.W / 2)}`, stroke: INK, 'stroke-width': 3, fill: 'none' });
}
function endCard() {
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 330, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('Next · Episode 12', { x: 96, y: 420, size: 48 }); b.style.fontWeight = 700;
  const c = L.text('Cutting the Okkake', { x: 96, y: 500, size: 96 }); c.style.fontWeight = 700;
  const svg = L.svgLayer(); el2(svg, 'line', { x1: 96, y1: 740, x2: 560, y2: 740, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
}
