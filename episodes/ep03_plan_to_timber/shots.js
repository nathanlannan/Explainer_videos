// Episode 3 shots: the board plan (itazu), banzuke grid addresses, carrying addresses onto the timber.
let L, THREE, G, TL, F;
const R = (p) => `/episodes/ep03_plan_to_timber/${p}`;
export async function init(lib) {
  L = lib; THREE = lib.THREE;
  G = await (await fetch(R('build/geometry.json'))).json(); F = G.frame;
  TL = await (await fetch(R('build/timeline.json'))).json();
  const byId = Object.fromEntries(TL.shots.map((s) => [s.id, s]));
  return { shots: Object.entries(SHOTS).map(([id, def]) => ({ id, ...byId[id], ...def })), fps: TL.fps, total: TL.total };
}
function el2(parent, tag, attrs) { return L.el('svg:' + tag, attrs, parent); }
function anchor(d, cam, pt, dx = 0, dy = 0) { const [x, y] = L.toScreen(cam, pt); d.style.left = x + dx + 'px'; d.style.top = y + dy + 'px'; }
const INK = '#1B1B1B', JP = "'Noto Serif CJK JP', serif", FONT = "'Noto Sans CJK JP', sans-serif";
const ADDR = ['い一', 'ろ一', 'は一', 'に一'];

// =============== the frame from Episode 1 (fit-checked solids), with address tags ===============
let frame;
function getFrame() {
  if (frame) return frame;
  const s = L.makeScene({ shadowBox: 3200, lightDir: [0.35, 1, 0.8] });
  const parts = {};
  F.members.filter((m) => m.kind !== 'stick').forEach((m, i) => { const me = L.memberMesh(m, { seed: i + 3 }); parts[m.name] = me; s.add(me); });
  // address written on each post near its bottom, on the front face (z = +post/2)
  const tags = [];
  // written vertically, beside the centre line (not across it)
  for (let i = 0; i < 4; i++) { const t = L.inkText(ADDR[i][0], 40, { font: JP, weight: 700 }), t2 = L.inkText(ADDR[i][1], 40, { font: JP, weight: 700 }); t2.onBeforeRender = () => { t2.material.opacity = t.material.opacity; }; t2.position.set(0, -46, 0.01); t.add(t2); t.position.set(F.x_posts[i] + 28, F.y_post0 + 200, F.params.POST / 2 + 0.6); parts['post' + (i + 1)].add(t); tags.push(t); }
  frame = { s, parts, tags };
  return frame;
}
// pose: k in 0..1 from "lying apart on the ground" to "assembled"
function poseFrame(Fr, k) {
  if (Fr.bt) Fr.bt.visible = false;
  if (Fr.cls) Fr.cls.forEach((c) => { c.visible = false; });
  for (const [n, me] of Object.entries(Fr.parts)) {
    const kind = n.replace(/\d+$/, ''), i = +(n.match(/\d+$/) || [0])[0];
    const kk = L.clamp(k * 1.6 - (kind === 'post' ? 0.1 * i : kind === 'rail' ? 0.4 + 0.05 * i : kind === 'beam' ? 0.55 : 0));
    const apart = { sill: [0, 0, 700], post: [0, 0, 3300], rail: [0, 0, 4300 + i * 200], beam: [0, 0, 5200] }[kind];
    me.position.set(apart[0] * (1 - kk), 0, apart[2] * (1 - L.ease(kk)));
    // lying down when apart: rotate posts onto the ground about their bottom
    if (kind === 'post') { me.rotation.x = -Math.PI / 2 * (1 - L.ease(kk)); me.position.y = 0; }
  }
}

// =============== the board plan, drawn in 2D (one SVG builder used by several shots) ===============
function drawPlan(svg, x0, y0, sp, { labels = true, posts = true, members = true, cls = '' } = {}) {
  const g = el2(svg, 'g', {}); const nx = G.iroha.length, ny = G.nums.length;
  const W = (nx - 1) * sp, H = (ny - 1) * sp;
  const grid = el2(g, 'g', {});
  for (let i = 0; i < nx; i++) el2(grid, 'line', { x1: x0 + i * sp, y1: y0 - sp * 0.15, x2: x0 + i * sp, y2: y0 + H + sp * 0.15, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '24 7 5 7' });
  for (let j = 0; j < ny; j++) el2(grid, 'line', { x1: x0 - sp * 0.15, y1: y0 + j * sp, x2: x0 + W + sp * 0.15, y2: y0 + j * sp, stroke: INK, 'stroke-width': 2.5, 'stroke-dasharray': '24 7 5 7' });
  const mem = el2(g, 'g', {});
  if (members) { el2(mem, 'rect', { x: x0, y: y0, width: W, height: H, fill: 'none', stroke: INK, 'stroke-width': 7 }); }
  const ps = el2(g, 'g', {});
  if (posts) Object.values(G.posts).forEach(([px, py]) => el2(ps, 'rect', { x: x0 + px / G.spacing * sp - 13, y: y0 + py / G.spacing * sp - 13, width: 26, height: 26, fill: '#E6C9A0', stroke: INK, 'stroke-width': 4 }));
  const lab = el2(g, 'g', {});
  if (labels) {
    G.iroha.forEach((c, i) => { const t = el2(lab, 'text', { x: x0 + i * sp, y: y0 - sp * 0.3, 'font-size': 52, 'text-anchor': 'middle', 'font-family': JP, 'font-weight': 600 }); t.textContent = c; });
    G.nums.forEach((c, j) => { const t = el2(lab, 'text', { x: x0 - sp * 0.42, y: y0 + j * sp + 18, 'font-size': 52, 'text-anchor': 'end', 'font-family': JP, 'font-weight': 600 }); t.textContent = c; const r = el2(lab, 'text', { x: x0 - sp * 0.42 - 70, y: y0 + j * sp + 14, 'font-size': 36, 'text-anchor': 'end', 'font-family': FONT, 'font-style': 'italic' }); r.textContent = G.romaji[c]; });
  }
  return { g, grid, mem, ps, lab, W, H };
}
function board(svg, x, y, w, h) {
  const g = el2(svg, 'g', {}); L.woodRect(g, x, y, w, h, { vertical: false }); return g;
}

const SHOTS = {
  S01: {
    fadeIn: 0.8,
    build() { getFrame(); this.q = L.text('Each piece is cut on its own. Where does it go?', { x: 96, y: 70, size: 48 }); this.q.style.fontWeight = 700; },
    frame(t, sh) {
      const Fr = getFrame(), e = sh.ev; poseFrame(Fr, L.ramp(t, e.rise, e.rise + 3.2));
      Fr.tags.forEach((tg, i) => { tg.visible = t > e.address - 0.2; tg.material.opacity = L.ramp(t, e.address - 0.2 + i * 0.2, e.address + 0.3 + i * 0.2); });
      L.show(this.q, L.ramp(t, e.where - 1.0, e.where - 0.3));
      const cam = L.camera('threeQ', [1365, 700, L.lerp(2400, 0, L.ramp(t, e.rise, e.rise + 3.2))], L.lerp(11000, 9800, L.ramp(t, e.rise, e.rise + 3.2)), { orbit: -0.3, lift: 0.35 });
      return { scene: Fr.s, camera: cam };
    },
  },
  S02: { fadeIn: 0.5, fadeOut: 0.6, build() { titleCard(); }, frame() { return {}; } },
  S03: {
    build() {
      const svg = L.svgLayer();
      this.b = board(svg, 230, 150, 1200, 760);
      this.plan = drawPlan(svg, 460, 330, 270, { labels: false });
      this.term = L.label({ romaji: 'itazu', kanji: '板図', gloss: "the carpenter's board plan · also zuita 図板, teita 手板", x: 96, y: 920 });
      this.lp = L.text('posts at the crossings', { x: 1460, y: 320, size: 36, w: 360 }); this.lp.classList.add('wrap');
      this.lm = L.text('← sills and beams between them (heavy line)', { x: 1460, y: 440, size: 36, w: 360 }); this.lm.classList.add('wrap');
      this.dim = el2(svg, 'g', {}); el2(this.dim, 'path', { d: 'M460,240 h270 M460,228 v24 M730,228 v24', stroke: INK, 'stroke-width': 3, fill: 'none' });
      this.dimT = L.text('3 shaku ≈ 910 mm <span class="soft">(usual)</span>', { x: 595, y: 170, size: 36, align: 'center' });
      this.cl = L.text('grid lines run through post centers', { x: 1460, y: 580, size: 36, w: 360 }); this.cl.classList.add('wrap');
      this.note = L.text('not to scale · simplified', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const e = sh.ev;
      L.show(this.b, L.ramp(t, 0, 0.5)); L.show(this.term, L.ramp(t, e.term - 0.2, e.term + 0.3)); L.show(this.note, L.ramp(t, e.term, e.term + 0.4));
      L.show(this.plan.ps, L.ramp(t, e.post - 0.3, e.post + 0.3)); L.show(this.lp, L.ramp(t, e.post, e.post + 0.4));
      L.show(this.plan.mem, L.ramp(t, e.beams - 0.3, e.beams + 0.3)); L.show(this.lm, L.ramp(t, e.beams, e.beams + 0.4));
      L.show(this.plan.grid, L.ramp(t, e.grid - 0.3, e.grid + 0.4));
      L.show(this.dim, L.ramp(t, e.shaku - 0.2, e.shaku + 0.3)); L.show(this.dimT, L.ramp(t, e.shaku, e.shaku + 0.4));
      L.show(this.cl, L.ramp(t, e.centers - 0.2, e.centers + 0.3));
      return {};
    },
  },
  S04: {
    build() {
      const svg = L.svgLayer();
      this.b = board(svg, 470, 200, 1000, 720);
      this.plan = drawPlan(svg, 740, 420, 210);
      this.term = L.label({ romaji: 'banzuke', kanji: '番付', gloss: 'the grid-address system', x: 96, y: 70 });
      this.ir = L.text('iroha: い ろ は に <span class="soft">(i, ro, ha, ni)</span>', { x: 500, y: 960, size: 40 });
      this.nu = L.text('numbers: 一 二 三 <span class="soft">(one, two, three)</span>', { x: 500, y: 1010, size: 40 });
      this.hl = el2(svg, 'g', {});
      const c1 = el2(this.hl, 'circle', { cx: 740, cy: 420, r: 34, fill: 'none', stroke: INK, 'stroke-width': 5 });
      this.hl2 = el2(svg, 'circle', { cx: 950, cy: 420, r: 34, fill: 'none', stroke: INK, 'stroke-width': 5 });
      this.a1 = L.text('<span style="font-family:\'Noto Serif CJK JP\';font-weight:700">い一</span> <i>i-no-ichi</i>', { x: 96, y: 380, size: 44 });
      this.a2 = L.text('<span style="font-family:\'Noto Serif CJK JP\';font-weight:700">ろ一</span> <i>ro-no-ichi</i>', { x: 96, y: 460, size: 44 });
      // inset: another carpenter's layout (axes swapped)
      this.inset = el2(svg, 'g', {}); const ix = 1600, iy = 300;
      el2(this.inset, 'rect', { x: ix - 80, y: iy - 70, width: 300, height: 300, fill: L.C.paper, stroke: INK, 'stroke-width': 2, rx: 8 });
      ['一', '二', '三'].forEach((c, i) => { const tt = el2(this.inset, 'text', { x: ix + i * 70, y: iy - 20, 'font-size': 36, 'font-family': JP, 'text-anchor': 'middle' }); tt.textContent = c; });
      ['い', 'ろ', 'は'].forEach((c, j) => { const tt = el2(this.inset, 'text', { x: ix - 40, y: iy + 20 + j * 70, 'font-size': 36, 'font-family': JP, 'text-anchor': 'middle' }); tt.textContent = c; });
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) el2(this.inset, 'rect', { x: ix + i * 70 - 8, y: iy + 8 + j * 70, width: 16, height: 16, fill: 'none', stroke: INK, 'stroke-width': 2 });
      this.insetT = L.text('another carpenter may swap the axes or start at another corner', { x: 1520, y: 560, size: 36, w: 300, cls: 'soft' }); this.insetT.classList.add('wrap');
      this.oth = L.text('other numbering systems exist too', { x: 96, y: 860, size: 36, cls: 'soft', w: 380 }); this.oth.classList.add('wrap');
    },
    frame(t, sh) {
      const e = sh.ev, ph2 = t > e.common - 0.4;
      L.show(this.b, 1); L.show(this.term, L.ramp(t, e.term - 0.2, e.term + 0.3));
      const kl = L.ramp(t, e.name - 0.3, e.name + 0.2); L.show(this.plan.lab, 0);
      [...this.plan.lab.children].forEach((c, i) => L.show(c, i < 4 ? L.ramp(t, e.iroha + i * 0.45, e.iroha + 0.3 + i * 0.45) : L.ramp(t, e.nums + (i - 4) * 0.4, e.nums + 0.3 + (i - 4) * 0.4))); L.show(this.plan.lab, kl);
      L.show(this.ir, L.ramp(t, e.iroha - 0.2, e.iroha + 0.3)); L.show(this.nu, L.ramp(t, e.nums - 0.2, e.nums + 0.3));
      L.show(this.hl, L.ramp(t, e.i1 - 0.3, e.i1 + 0.2)); L.show(this.a1, L.ramp(t, e.i1 - 0.2, e.i1 + 0.3));
      L.show(this.hl2, L.ramp(t, e.r1 - 0.3, e.r1 + 0.2)); L.show(this.a2, L.ramp(t, e.r1 - 0.2, e.r1 + 0.3));
      L.show(this.inset, L.ramp(t, e.varies - 0.3, e.varies + 0.3)); L.show(this.insetT, L.ramp(t, e.varies, e.varies + 0.4)); L.show(this.oth, L.ramp(t, e.other - 0.2, e.other + 0.3));
      void ph2;
      return {};
    },
  },
  S05: {
    build() {
      getFrame();
      this.lab = L.text('the address, written by hand while marking out', { x: 96, y: 70, size: 40, cls: 'plate' });
      this.tagL = L.text('<span style="font-family:\'Noto Serif CJK JP\';font-weight:700">い一</span> <i>i-no-ichi</i>', { x: 0, y: 0, size: 44, cls: 'plate' });
      this.l1 = L.text('address: where it goes', { x: 1824, y: 300, size: 40, align: 'right', cls: 'plate' });
      this.l3 = L.text('center line: the reference', { x: 1824, y: 370, size: 40, align: 'right', cls: 'plate' });
      this.hid = L.text('hidden once built: e.g. on a tenon, or below the floor', { x: 96, y: 980, size: 40, cls: 'plate' });
      const s = getFrame().s;
      // ghost floor band (illustrative) and the post's centre line
      this.floor = new THREE.Mesh(new THREE.BoxGeometry(900, 420, 400), new THREE.MeshBasicMaterial({ color: L.C.ghost, transparent: true, opacity: 0.25, depthWrite: false }));
      this.floor.position.set(0, 210, 0); s.add(this.floor); this.floor.visible = false;
      this.cl = L.centreLine(F.params.POST_LEN - 40, 4, [80, 22, 14, 22]); this.cl.rotation.z = Math.PI / 2; this.cl.position.set(0, F.y_post0 + 20, F.params.POST / 2 + 0.8); s.add(this.cl); this.cl.visible = false;
      this.fl = L.text('floor (ghosted)', { x: 0, y: 0, size: 36, cls: 'soft' });
    },
    frame(t, sh) {
      const Fr = getFrame(), e = sh.ev; poseFrame(Fr, 1);
      Fr.tags.forEach((tg, i) => { tg.visible = i === 0; tg.material.opacity = i === 0 ? L.ramp(t, e.writes - 0.1, e.writes + 1.0) : 0; });
      this.cl.visible = t > e.center - 0.3; L.setGroupProgress(this.cl, L.ramp(t, e.center - 0.3, e.center + 0.8));
      this.floor.visible = t > e.floor - 0.4; this.floor.material.opacity = 0.25 * L.ramp(t, e.floor - 0.4, e.floor + 0.2);
      const cam = L.camera('threeQ', [0, 420, 0], 1500, { orbit: -0.3, lift: 0.05 });
      anchor(this.fl, cam, [450, 420, 200], -260, -20); L.show(this.fl, this.floor.visible ? 1 : 0);
      anchor(this.tagL, cam, [60, F.y_post0 + 180, F.params.POST / 2], 70, -30); L.show(this.tagL, L.ramp(t, e.writes + 0.3, e.writes + 0.8));
      L.show(this.lab, L.ramp(t, e.writes - 0.2, e.writes + 0.3)); L.show(this.l1, L.ramp(t, e.where - 0.2, e.where + 0.3)); L.show(this.l3, L.ramp(t, e.center - 0.2, e.center + 0.3));
      L.show(this.hid, L.ramp(t, e.hidden - 0.2, e.hidden + 0.3));
      return { scene: Fr.s, camera: cam };
    },
  },
  S06: {
    build() {
      const Fr = getFrame();
      this.bt = L.inkText('い一', 60, { font: JP, weight: 600 }); this.bt.rotation.x = Math.PI / 2; // on the beam's underside, readable from below
      // on the housing face that the post's top covers
      this.bt.position.set(F.x_posts[0], F.y_post0 + F.params.POST_LEN - 0.6, 27); this.bt.scale.set(0.8, 0.8, 1); Fr.s.add(this.bt); this.bt.visible = false; Fr.bt = this.bt;
      this.lab = L.text('one common practice: the beam carries the same address at that joint, where the post covers it', { x: 96, y: 70, size: 40, w: 1700, cls: 'plate' }); this.lab.classList.add('wrap');
      this.cl = L.text('and every member gets its center line', { x: 96, y: 980, size: 40, cls: 'plate' });
      this.btL = L.text('<span style="font-family:\'Noto Serif CJK JP\';font-weight:700">い一</span> <i>i-no-ichi</i>', { x: 0, y: 0, size: 44, cls: 'plate' });
      this.bl = L.text('beam lifted to show the joint face', { x: 1824, y: 980, size: 36, cls: 'soft plate', align: 'right' });
      // centre lines: along the beam's underside, and up the post's front face
      this.clB = L.centreLine(3000, 4, [80, 22, 14, 22]); this.clB.rotation.x = Math.PI / 2; this.clB.position.set(-150, F.y_post0 + F.params.POST_LEN - F.params.HOUSING - 0.8, 0); Fr.s.add(this.clB);
      this.clP = L.centreLine(F.params.POST_LEN - 40, 4, [80, 22, 14, 22]); this.clP.rotation.z = Math.PI / 2; this.clP.position.set(0, F.y_post0 + 20, F.params.POST / 2 + 0.8); Fr.s.add(this.clP);
      this.cls = [this.clB, this.clP]; this.cls.forEach((c) => { c.visible = false; }); Fr.cls = this.cls;
    },
    frame(t, sh) {
      const Fr = getFrame(), e = sh.ev; poseFrame(Fr, 1); Fr.parts.beam.position.y = 240 * L.ramp(t, 0.2, 1.4); this.bt.position.y = F.y_post0 + F.params.POST_LEN - 0.6 + Fr.parts.beam.position.y;
      Fr.tags.forEach((tg, i) => { tg.visible = i === 0; tg.material.opacity = 1; }); L.show(this.bl, L.ramp(t, 0.8, 1.4));
      this.cls.forEach((c) => { c.visible = t > e.center - 0.3; L.setGroupProgress(c, L.ramp(t, e.center - 0.3, e.center + 1.2)); c.position.y = c === this.clB ? F.y_post0 + F.params.POST_LEN - F.params.HOUSING - 0.8 + Fr.parts.beam.position.y : c.position.y; });
      this.bt.visible = t > e.marked - 0.2; this.bt.material.opacity = L.ramp(t, e.marked - 0.2, e.marked + 0.6);
      const cam = L.camera('threeQ', [150, F.y_post0 + F.params.POST_LEN + 160, 0], 1150, { orbit: -0.3, lift: -1.4 });
      anchor(this.btL, cam, [F.x_posts[0] + 80, this.bt.position.y, 120], 0, 30); L.show(this.btL, L.ramp(t, e.marked + 0.3, e.marked + 0.8));
      L.show(this.lab, L.ramp(t, e.common - 0.2, e.common + 0.3)); L.show(this.cl, L.ramp(t, e.center - 0.2, e.center + 0.3));
      return { scene: Fr.s, camera: cam };
    },
  },
  S07: {
    build() {
      const svg = L.svgLayer(); this.parts = [];
      const pieces = [['い一', 400, 520, 30, 300], ['ろ一', 700, 520, 30, 300], ['は一', 1000, 520, 30, 300], ['に一', 1300, 520, 30, 300], ['beam', 380, 470, 980, 30], ['sill', 380, 830, 980, 30]];
      pieces.forEach(([lab, x, y, w, h], i) => { const g = el2(svg, 'g', {}); L.woodRect(g, x, y, w, h, { vertical: h > w }); const tt = el2(g, 'text', { x: x + w / 2 + (h > w ? 40 : 0), y: y + (h > w ? h / 2 : -12), 'font-size': 36, 'font-family': FONT, 'font-weight': 700, 'text-anchor': h > w ? 'start' : 'middle' }); tt.textContent = lab; this.parts.push({ g, i }); });
      this.t = L.text('taken apart for repair or moving · every piece goes back where it came from · simplified', { x: 960, y: 960, size: 36, align: 'center', w: 1500 }); this.t.classList.add('wrap');
    },
    frame(t, sh) {
      const e = sh.ev, k = L.ramp(t, e.apart - 0.4, e.apart + 0.8) * (1 - L.ramp(t, e.back - 0.2, e.back + 1.2));
      this.parts.forEach(({ g, i }) => g.setAttribute('transform', `translate(${(i - 2.5) * 90 * k},${(i % 2 ? -1 : 1) * 70 * k}) rotate(${(i % 3 - 1) * 8 * k} 960 600)`));
      L.show(this.t, L.ramp(t, e.apart, e.apart + 0.4));
      return {};
    },
  },
  S08: {
    build() {
      const steps = [['board plan', '板図 itazu'], ['story sticks', 'the heights'], ['marking out', '墨付け sumitsuke'], ['cutting', '刻み kizami'], ['raising', 'labels matched']];
      this.items = steps.map(([a, b], i) => { const d = L.text(`<b>${a}</b><br><span class="soft" style="white-space:nowrap">${b}</span>`, { x: 120 + i * 350, y: 420, size: 40, w: 330 }); d.classList.add('wrap'); return d; });
      const svg = L.svgLayer(); this.arrows = [0, 1, 2, 3].map((i) => el2(svg, 'path', { d: `M${410 + i * 350},450 h50 m-14,-12 l14,12 l-14,12`, stroke: INK, 'stroke-width': 4, fill: 'none' }));
      this.raise = L.text('at raising, the crew reads the addresses: matching labels go together', { x: 960, y: 760, size: 40, align: 'center', w: 1500 }); this.raise.classList.add('wrap');
    },
    frame(t, sh) {
      const e = sh.ev, ts = [e.plan, e.sticks, e.mark, e.cut, e.raise];
      this.items.forEach((d, i) => L.show(d, L.ramp(t, ts[i] - 0.3, ts[i] + 0.2))); this.arrows.forEach((a, i) => L.show(a, L.ramp(t, ts[i + 1] - 0.4, ts[i + 1])));
      L.show(this.raise, L.ramp(t, e.match - 0.3, e.match + 0.2));
      return {};
    },
  },
  S09: {
    build() {
      const svg = L.svgLayer();
      this.bar = el2(svg, 'g', {}); el2(this.bar, 'rect', { x: 260, y: 440, width: 1400, height: 80, fill: '#E9E1D2', stroke: INK, 'stroke-width': 2 });
      this.fill = el2(this.bar, 'rect', { x: 260, y: 440, width: 0, height: 80, fill: '#7D8EA0' });
      this.t1 = L.text('2015: about <b>91%</b> of Japan\'s post-and-beam framing was machine pre-cut', { x: 260, y: 330, size: 40, w: 1500 }); this.t1.classList.add('wrap');
      this.src = L.text('source: Forestry Agency, Annual Report on Forest and Forestry (FY2016)', { x: 260, y: 560, size: 36, cls: 'soft' });
      this.t2 = L.text('the logic is the same, and it is what hand-cut joinery needs', { x: 260, y: 700, size: 44 });
    },
    frame(t, sh) {
      const e = sh.ev; L.show(this.t1, L.ramp(t, e.stat - 0.4, e.stat)); L.show(this.bar, L.ramp(t, e.stat - 0.4, e.stat)); L.show(this.src, L.ramp(t, e.stat, e.stat + 0.4));
      this.fill.setAttribute('width', 1400 * 0.91 * L.ramp(t, e.stat, e.stat + 1.2)); L.show(this.t2, L.ramp(t, e.logic - 0.2, e.logic + 0.3));
      return {};
    },
  },
  S10: {
    build() {
      const a = L.text('Next · Episode 4', { x: 96, y: 330, size: 48 }); a.style.fontWeight = 700;
      const b = L.text('The Cutting Kit and the Line', { x: 96, y: 410, size: 96 }); b.style.fontWeight = 700;
      this.c = L.text('saws, chisels and hammer, the plane · and cutting to a line', { x: 96, y: 560, size: 40, cls: 'soft' });
    },
    frame(t, sh) { L.show(this.c, L.ramp(t, sh.ev.saws - 0.2, sh.ev.saws + 0.3)); return {}; },
  },
  S11: {
    build() {
      const h = L.text('Give every crossing an address.', { x: 96, y: 70, size: 60 }); h.style.fontWeight = 700;
      L.text('Draw it once on the board · write the address on every piece · the frame tells you how it goes together', { x: 96, y: 160, size: 36, cls: 'soft', w: 1728 });
      const rows = [
        ['itazu', '板図', 'board plan', "the carpenter's plan on a board; also zuita 図板, teita 手板"],
        ['banzuke', '番付', 'grid addresses', 'iroha across × numbers down (one common layout); varies by carpenter'],
        ['i-no-ichi', 'い一', 'an address', 'the post at grid lines い and 一'],
        ['kizami', '刻み', 'cutting', 'cutting the members after marking out'],
        ['sumitsuke', '墨付け', 'marking out', 'from Episode 1: marking lines and marks in ink'],
        ['shaku', '尺', 'old unit', 'about 303 mm; 3 shaku ≈ 910 mm'],
      ];
      const g = L.text('', { x: 96, y: 270, size: 36, w: 1728 }); g.innerHTML = '<div class="soft" style="font-size:36px;margin-bottom:14px;letter-spacing:.08em">GLOSSARY · EPISODE 3</div>' + rows.map((r) => `<div style="display:flex;gap:30px;margin-bottom:22px;align-items:baseline"><div style="width:440px;font-weight:700;font-size:40px"><i>${r[0]}</i> <span style="font-family:'Noto Serif CJK JP',serif;font-style:normal">${r[1]}</span></div><div style="width:1260px;white-space:normal;font-size:36px"><b>${r[2]}</b> — <span class="soft">${r[3]}</span></div></div>`).join('');
    },
    frame() { return {}; },
  },
  S12: { fadeOut: 1.0, build() { endCard(); }, frame() { return {}; } },
};

function titleCard() {
  const svg = L.svgLayer();
  el2(svg, 'line', { x1: 96, y1: 470, x2: 560, y2: 470, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 300, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('EPISODE 3', { x: 96, y: 370, size: 48 }); b.style.fontWeight = 700; b.style.letterSpacing = '0.12em';
  const c = L.text('From Plan to Timber', { x: 96, y: 510, size: 110 }); c.style.fontWeight = 700;
  L.text('The Board Plan and Its Addresses', { x: 96, y: 650, size: 64, cls: 'soft' });
  const p = drawPlan(svg, 1260, 380, 170, { labels: true }); void p;
}
function endCard() {
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 330, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('Next · Episode 4', { x: 96, y: 420, size: 48 }); b.style.fontWeight = 700;
  const c = L.text('The Cutting Kit and the Line', { x: 96, y: 500, size: 96 }); c.style.fontWeight = 700;
  L.text('ryōba, dozuki, nomi and gennō, kanna — each beside its Western cousin', { x: 96, y: 640, size: 40, cls: 'soft' });
  const svg = L.svgLayer(); el2(svg, 'line', { x1: 96, y1: 740, x2: 560, y2: 740, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
}
