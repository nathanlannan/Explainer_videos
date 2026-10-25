// Episode 4 · Part 2 shots: chisels (struck and pushed), the laminated blade, the gennō, the kanna, sharp edges.
import { makeEdgeTools } from '/shared/render/edgetools.js';
let L, THREE, G, TL, ET;
const R = (p) => `/episodes/ep04b_chisels_and_plane/${p}`;

export async function init(lib) {
  L = lib; THREE = lib.THREE;
  G = await (await fetch(R('build/geometry.json'))).json();
  TL = await (await fetch(R('build/timeline.json'))).json();
  ET = makeEdgeTools(L);
  const byId = Object.fromEntries(TL.shots.map((s) => [s.id, s]));
  const shots = Object.entries(SHOTS).map(([id, def]) => ({ id, ...byId[id], ...def }));
  return { shots, fps: TL.fps, total: TL.total };
}
function el2(parent, tag, attrs) { return L.el('svg:' + tag, attrs, parent); }
function anchor(d, cam, pt, dx = 0, dy = 0) { const [x, y] = L.toScreen(cam, pt); d.style.left = x + dx + 'px'; d.style.top = y + dy + 'px'; }
const INK = '#1B1B1B', ACC = '#B8432F', STEEL2 = '#AEB4BA', STEELD = '#7E858C', IRONC = '#C9CCD0';
const kj = (s) => `<span style="font-family:'Noto Serif CJK JP',serif;font-style:normal;font-weight:600">${s}</span>`;
function arrow(svg, x1, y1, x2, y2, { color = INK, w = 4, head = 18 } = {}) {
  const g = el2(svg, 'g', {}); const a = Math.atan2(y2 - y1, x2 - x1);
  el2(g, 'line', { x1, y1, x2: x2 - Math.cos(a) * head * 0.8, y2: y2 - Math.sin(a) * head * 0.8, stroke: color, 'stroke-width': w });
  const p = [[x2, y2], [x2 - Math.cos(a - 0.42) * head, y2 - Math.sin(a - 0.42) * head], [x2 - Math.cos(a + 0.42) * head, y2 - Math.sin(a + 0.42) * head]];
  el2(g, 'polygon', { points: p.map((q) => q.join(',')).join(' '), fill: color });
  return g;
}
// screen-space arrow between two 3D points
function arrow3(svg, cam, a, b, opts) { const [x1, y1] = L.toScreen(cam, a), [x2, y2] = L.toScreen(cam, b); return arrow(svg, x1, y1, x2, y2, opts); }

// =============== scenes ===============
const BY = 40; // bench height of the board's underside
let planeScene;
function getPlane() {
  if (planeScene) return planeScene;
  const [BL, BT, BW] = G.board;
  const s = L.makeScene({ shadowBox: 1400, lightDir: [0.5, 1, 0.5] });
  const board = L.memberMesh(L.boxMember('board', [0, BY, -BW / 2, BL, BT, BW], 'x'), { seed: 6 }); s.add(board);
  [[90], [BL - 90]].forEach(([x]) => { s.add(L.memberMesh(L.boxMember('horse', [x - 20, 0, -BW / 2 - 40, 40, BY, BW + 80], 'z'), { seed: 8 })); });
  const k = ET.kanna(G.kanna); s.add(k.g);
  const shv = ET.shaving(G.kanna.blade_w * 0.8, 1.5, 24); const sg = new THREE.Group(), sm = new THREE.Group(); sm.add(shv); shv.scale.x = -1; sg.add(sm); sm.rotation.z = -k.bedA; k.g.add(sg);
  // the shaving emerges where the blade leaves the top of the block, riding up the blade's face
  sg.position.set(G.kanna.mouth - G.kanna.h / Math.tan(k.bedA) + 4, G.kanna.h + 0.5, 0);
  planeScene = { s, k, shv, sg, BL, BT, BW, top: BY + BT };
  return planeScene;
}
let chiselScene;
function getChisels() {
  if (chiselScene) return chiselScene;
  const s = L.makeScene({ shadowBox: 1000, lightDir: [0.35, 1, 0.8] });
  const mk = (P) => { const c = ET.chisel(P); const piv = new THREE.Group(); piv.add(c.g); s.add(piv); c.piv = piv; return c; };
  chiselScene = { s, oire: mk(G.oire), tsuki: mk(G.tsuki), muko: mk(G.muko) };
  return chiselScene;
}
// lay a chisel flat (back down) with its edge at x = ex, along +x, at z
function layChisel(c, ex, z, y = 0) { c.piv.position.set(ex, y + 2, z); c.piv.rotation.set(0, 0, 0); c.g.position.set(0, 0, 0); c.g.rotation.set(0, 0, 0); }
let hammerScene;
function getHammer() {
  if (hammerScene) return hammerScene;
  const s = L.makeScene({ shadowBox: 900, lightDir: [0.4, 1, 0.7] });
  const board = L.memberMesh(L.boxMember('hb', [-200, 0, -80, 400, 40, 160], 'x'), { seed: 4 }); s.add(board);
  const hm = ET.genno(G.genno); const piv = new THREE.Group(); piv.add(hm.g); s.add(piv);
  const nail = new THREE.Group();
  const shank = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 50, 10), new THREE.MeshStandardMaterial({ color: '#8C9196', metalness: 0.3, roughness: 0.4 })); shank.position.y = 25; nail.add(shank);
  const head = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 1.4, 16), new THREE.MeshStandardMaterial({ color: '#8C9196', metalness: 0.3, roughness: 0.4 })); head.position.y = 50.7; nail.add(head);
  s.add(nail);
  hammerScene = { s, hm, piv, nail };
  return hammerScene;
}

const SHOTS = {
  S01: {
    build() {
      this.svg = L.svgLayer(); this.arr = null;
      this.pull = L.text('pull', { x: 0, y: 0, size: 44 }); this.pull.style.fontWeight = 700;
      this.cap = L.text('a Japanese plane is pulled toward you', { x: 96, y: 980, size: 40, cls: 'plate' });
    },
    frame(t, sh) {
      const P = getPlane(), K = G.kanna, e = sh.ev, period = 2.4;
      const ph = Math.max(0, t - e.stroke0) / period, cyc = Math.floor(ph), f = ph - cyc;
      const pulling = f < 0.62, k = pulling ? L.ease(f / 0.62) : 1 - L.ease((f - 0.62) / 0.38);
      const x0 = 60, x1 = P.BL - K.len - 40;
      P.k.g.position.set(x0 + (x1 - x0) * k, P.top, 0);
      P.k.g.position.y = P.top + (pulling ? 0 : 4 * Math.sin(Math.PI * (f - 0.62) / 0.38)); // lift slightly on the return
      ET.setShaving(P.shv, pulling ? k : 0); P.shv.material.opacity = 1;
      const cam = L.camera('threeQ', [P.BL * 0.5, P.top + 40, 0], 1150, { orbit: -0.15, lift: 0.25 });
      if (this.arr) this.arr.remove();
      this.arr = arrow3(this.svg, cam, [P.BL * 0.4, P.top + 170, 0], [P.BL * 0.75, P.top + 170, 0], { w: 6, head: 26 }); // fixed: the direction of the pull
      const [px, py] = L.toScreen(cam, [P.BL * 0.57, P.top + 170, 0]);
      this.pull.style.left = px - 40 + 'px'; this.pull.style.top = py - 80 + 'px';
      const a = L.ramp(t, e.pull - 0.3, e.pull + 0.3) * (pulling ? 1 : 0.35); L.show(this.pull, a); this.arr.setAttribute('opacity', a);
      L.show(this.cap, L.ramp(t, e.pull - 0.2, e.pull + 0.4) * (1 - L.ramp(t, e.kit - 0.4, e.kit)));
      return { scene: P.s, camera: cam };
    },
  },
  S02: { fadeIn: 0.5, fadeOut: 0.6, build() { titleCard(); }, frame() { return {}; } },
  S03: {
    build() {
      this.term = L.label({ romaji: 'nomi', kanji: '鑿', gloss: 'chisel · two families', x: 96, y: 70 });
      this.ta = L.text(`<b>struck</b> · <i>tataki-nomi</i> ${kj('叩き鑿')}`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.ts = L.text(`<b>pushed by hand</b> · <i>tsuki-nomi</i> ${kj('突き鑿')}`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.hp = L.text(`iron hoop · <i>katsura</i> ${kj('かつら')}`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.nohp = L.text('no hoop', { x: 0, y: 0, size: 36, cls: 'soft plate' });
      this.note = L.text('proportions illustrative', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const C = getChisels(), e = sh.ev; C.muko.piv.visible = false; C.oire.piv.visible = true; C.tsuki.piv.visible = true;
      layChisel(C.oire, 120, -60); layChisel(C.tsuki, 260, 60);
      const cam = L.camera('threeQ', [40, 0, 0], 950, { orbit: -0.25, lift: 0.5 });
      const oy = G.oire.thick * 0.55 + 2, ty = G.tsuki.thick * 0.55 + 2;
      anchor(this.ta, cam, [40, oy + 20, -60], -40, -110); anchor(this.ts, cam, [60, ty + 20, 60], -40, 50);
      anchor(this.hp, cam, [120 + C.oire.buttX + 8, oy + 14, -60], -380, -40);
      anchor(this.nohp, cam, [260 + C.tsuki.buttX + 8, ty + 14, 60], -200, -20);
      L.show(this.term, L.ramp(t, e.term - 0.3, e.term + 0.3)); L.show(this.ta, L.ramp(t, e.struck - 0.2, e.struck + 0.3)); L.show(this.ts, L.ramp(t, e.pushed - 0.2, e.pushed + 0.3));
      L.show(this.hp, L.ramp(t, e.hoop - 0.2, e.hoop + 0.3)); L.show(this.nohp, L.ramp(t, e.katsura + 0.4, e.katsura + 0.9));
      return { scene: C.s, camera: cam };
    },
  },
  S04: {
    build() {
      this.oi = L.text(`<b>bench chisel</b> · <i>oire-nomi</i> ${kj('追入鑿')}`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.vr = L.text(`also read <i>oiire</i>, or written <i>ōire</i> ${kj('大入')}`, { x: 0, y: 0, size: 36, cls: 'soft plate' });
      this.mu = L.text(`<b>mortise chisel</b> · <i>mukōmachi-nomi</i> ${kj('向待鑿')} · thick blade`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.note = L.text('proportions illustrative', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const C = getChisels(), e = sh.ev; C.tsuki.piv.visible = false; C.oire.piv.visible = true; C.muko.piv.visible = true;
      layChisel(C.oire, 150, -70); layChisel(C.muko, 170, 80);
      // turn slowly so the thickness of the mortise chisel reads
      const yaw = -0.1 + 0.02 * t; C.oire.piv.rotation.y = yaw; C.muko.piv.rotation.y = yaw;
      const cam = L.camera('threeQ', [-40, 10, 5], 780, { orbit: -0.15, lift: 0.12 });
      anchor(this.oi, cam, [-40, 30, -70], -120, -150); anchor(this.vr, cam, [-40, 30, -70], -120, -95);
      anchor(this.mu, cam, [-40, 0, 80], -120, 120);
      L.show(this.oi, L.ramp(t, e.oire - 0.2, e.oire + 0.3)); L.show(this.vr, L.ramp(t, e.variants - 0.2, e.variants + 0.3)); L.show(this.mu, L.ramp(t, e.muko - 0.2, e.muko + 0.3));
      return { scene: C.s, camera: cam };
    },
  },
  S05: {
    build() {
      const svg = L.svgLayer();
      this.h = L.text('the blade', { x: 96, y: 60, size: 56 }); this.h.style.fontWeight = 700;
      // side profile, magnified: back (flat) at the bottom; the hard-steel layer along the back; the bevel at the right
      const x0 = 160, x1 = 1060, yb = 520, T = 150, st = 34, bev = 300;
      this.side = el2(svg, 'g', {});
      el2(this.side, 'path', { d: `M${x0},${yb} L${x1},${yb} L${x1 - bev},${yb - T} L${x0},${yb - T} Z`, fill: IRONC, stroke: INK, 'stroke-width': 2 });
      // steel layer: along the back, ending at the edge (the bevel cuts through iron then steel)
      const sx = x1 - bev * st / T;
      el2(this.side, 'path', { d: `M${x0},${yb} L${x1},${yb} L${sx},${yb - st} L${x0},${yb - st} Z`, fill: STEELD, stroke: INK, 'stroke-width': 2 });
      this.lSteel = L.text(`<b>hard steel</b> · <i>hagane</i> ${kj('鋼')}`, { x: x0, y: yb + 16, size: 40 });
      this.lIron = L.text(`<b>softer iron</b> · <i>jigane</i> ${kj('地金')}`, { x: x0 + 20, y: yb - T + 40, size: 40 });
      this.lBev = L.text(`one bevel · ${kj('片刃')}`, { x: x1 - bev - 40, y: yb - T - 70, size: 40 });
      this.lSup = L.text('the iron supports the brittle steel and absorbs shock', { x: x0, y: yb + 70, size: 36, cls: 'soft', w: 900 });
      this.lBack = L.text('back (flat side)', { x: x1 - 120, y: yb + 16, size: 36, cls: 'soft', align: 'right' });
      // cross-section across the width, near the edge: the urasuki is a shallow hollow inside the steel layer
      const cx = 1480, W2 = 520, cy = 470, Ts = 34, Ti = 80, dep = 12;
      this.sec = el2(svg, 'g', {});
      el2(this.sec, 'rect', { x: cx - W2 / 2, y: cy - Ti - Ts, width: W2, height: Ti, fill: IRONC, stroke: INK, 'stroke-width': 2 });
      el2(this.sec, 'path', { d: `M${cx - W2 / 2},${cy - Ts} H${cx + W2 / 2} V${cy} H${cx + W2 * 0.3} Q${cx},${cy - dep * 2} ${cx - W2 * 0.3},${cy} H${cx - W2 / 2} Z`, fill: STEELD, stroke: INK, 'stroke-width': 2 });
      this.lUra = L.text(`<b>back hollow</b> · <i>urasuki</i> ${kj('裏スキ')}`, { x: cx, y: cy + 20, size: 40, align: 'center' });
      this.lUra2 = L.text('makes the back easier to flatten', { x: cx, y: cy + 72, size: 36, align: 'center', cls: 'soft' });
      this.lSec = L.text('across the blade, near the edge', { x: cx, y: cy - Ti - Ts - 60, size: 36, align: 'center', cls: 'soft' });
      // the wrong idea, ghosted, with ✕: a hollow-ground bevel
      this.bad = el2(svg, 'g', {});
      el2(this.bad, 'path', { d: `M${x1},${yb} Q${x1 - bev * 0.6},${yb - T * 0.35} ${x1 - bev},${yb - T}`, fill: 'none', stroke: ACC, 'stroke-width': 4, 'stroke-dasharray': '10 8' });
      this.lBad = L.text('<span class="acc">✕ not hollow-ground: the bevel is flat</span>', { x: 640, y: yb + 130, size: 36, w: 520 }); this.lBad.classList.add('wrap');
      this.quote = L.text('“foreign blades are usually one piece of steel; Japanese blades are laminated”<br><span class="soft">a Japanese blade maker (Harima Quarterly no. 49)</span>', { x: 96, y: 760, size: 40, w: 1700 }); this.quote.classList.add('wrap');
      this.n = L.text('magnified · proportions exaggerated', { x: 1824, y: 990, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const e = sh.ev, r = (a) => L.ramp(t, a - 0.3, a + 0.3);
      this.side.setAttribute('opacity', r(e.bevel)); L.show(this.lBev, r(e.bevel)); L.show(this.lBack, r(e.bevel));
      L.show(this.lSteel, r(e.hagane)); L.show(this.lIron, r(e.jigane)); L.show(this.lSup, r(e.supports));
      L.show(this.quote, r(e.maker));
      this.sec.setAttribute('opacity', r(e.ura)); L.show(this.lUra, r(e.ura)); L.show(this.lSec, r(e.ura)); L.show(this.lUra2, r(e.flat));
      this.bad.setAttribute('opacity', 0.85 * r(e.bevel2)); L.show(this.lBad, r(e.bevel2));
      return {};
    },
  },
  S06: {
    build() {
      this.term = L.label({ romaji: 'gennō', kanji: '玄能', gloss: 'the hammer', x: 96, y: 70 });
      this.fl = L.text('flat face', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.dm = L.text(`domed face · <i>kigoroshi-men</i> ${kj('木殺し面')}`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.lit = L.text('literally, the “wood-killing face”', { x: 0, y: 0, size: 36, cls: 'soft plate' });
      this.seq = L.text('drive with the flat face · last blows with the domed face, so the surface isn’t marked', { x: 96, y: 990, size: 36, cls: 'plate', w: 1700 });
      this.note = L.text('dome exaggerated', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const H = getHammer(), e = sh.ev, Pg = G.genno;
      // timeline: show the hammer, then drive the nail: flat-face blows from e.strike, domed-face last blows from e.last
      const blow = (tt, period) => { const f = ((tt % period) + period) % period / period; return f < 0.25 ? L.ease(f / 0.25) : 1 - L.ease((f - 0.25) / 0.75); };
      let face = 'flat', lift = 1, nailUp = 46;
      if (t > e.strike) { const tb = t - e.strike; const n = Math.min(4, Math.floor(tb / 0.8)); nailUp = Math.max(4, 46 - n * 10 - (n < 4 ? 10 * blow(tb, 0.8) * 0 : 0)); lift = 1 - blow(tb, 0.8); }
      if (t > e.last) { face = 'dome'; const tb = t - e.last; const n = Math.min(2, Math.floor(tb / 0.9)); nailUp = Math.max(0, 4 - n * 2); lift = n >= 2 ? 1 : 1 - blow(tb, 0.9); }
      H.nail.position.set(0, 40 - 50 + nailUp, 0); // nail head height above the board = nailUp
      // hammer: head axis horizontal; the striking face points down at the nail: rotate the head so +x (flat) or -x (dome) faces -y
      const rz = face === 'flat' ? -Math.PI / 2 : Math.PI / 2;
      H.piv.rotation.order = 'XYZ'; H.piv.rotation.set(0, face === 'flat' ? Math.PI : 0, rz); // handle points right in both poses
      const faceOff = face === 'flat' ? Pg.head_len / 2 : Pg.head_len / 2 + Pg.dome;
      const headY = 40 + nailUp + 1.4 + faceOff + 120 * lift;
      H.piv.position.set(0, headY, 0);
      const before = t < e.strike - 0.2;
      if (before) { H.piv.rotation.order = 'YXZ'; H.piv.rotation.set(Math.PI / 2, 0.6 + 0.03 * t, 0); H.piv.position.set(0, 140, 0); } // lying level, handle horizontal
      const cam = L.camera('threeQ', [0, 120, 0], 1000, { orbit: -0.3, lift: 0.1 });
      H.piv.updateMatrixWorld(true);
      const fp = new THREE.Vector3(Pg.head_len / 2, 0, 0).applyMatrix4(H.hm.g.matrixWorld), dp = new THREE.Vector3(-Pg.head_len / 2 - Pg.dome, 0, 0).applyMatrix4(H.hm.g.matrixWorld);
      anchor(this.fl, cam, fp.toArray(), 30, -20); anchor(this.dm, cam, dp.toArray(), 30, -20); anchor(this.lit, cam, dp.toArray(), 30, 36);
      L.show(this.term, L.ramp(t, e.term - 0.3, e.term + 0.3));
      L.show(this.fl, L.ramp(t, e.flat - 0.2, e.flat + 0.3) * (face === 'flat' ? 1 : 0));
      L.show(this.dm, (before ? L.ramp(t, e.dome - 0.2, e.dome + 0.3) : 0) + (face === 'dome' ? 1 : 0));
      L.show(this.lit, face === 'dome' ? L.ramp(t, e.kigoroshi + 0.3, e.kigoroshi + 0.8) : 0);
      L.show(this.seq, L.ramp(t, e.strike - 0.2, e.strike + 0.4));
      return { scene: H.s, camera: cam };
    },
  },
  S07: {
    build() {
      this.svg = L.svgLayer(); this.arrs = [];
      this.term = L.label({ romaji: 'kanna', kanji: '鉋', gloss: 'the plane (the whole tool)', x: 96, y: 70 });
      this.dai = L.text(`block · <i>dai</i> ${kj('台')} · usually oak`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.bl = L.text('blade', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.cb = L.text(`chip breaker · <i>uragane</i> ${kj('裏金')}`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.nm = L.text(`two-blade plane · <i>nimai-ganna</i> ${kj('二枚鉋')} · Meiji era`, { x: 96, y: 990, size: 40, cls: 'plate' });
      this.tapA = L.text('tap the head: blade goes deeper', { x: 0, y: 0, size: 36, cls: 'plate' });
      this.tapB = L.text('tap the corners of the head end: blade draws back', { x: 0, y: 0, size: 36, cls: 'plate' });
      this.src = L.text('blade setting: national skills-test manual (MHLW)', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
      this.pull = L.text('pull →', { x: 0, y: 0, size: 40 }); this.pull.style.fontWeight = 700;
    },
    frame(t, sh) {
      const P = getPlane(), K = G.kanna, e = sh.ev; ET.setShaving(P.shv, 0);
      P.k.g.position.set(P.BL * 0.3, P.top, 0); P.k.g.rotation.set(0, 0, 0);
      const cam = L.camera('threeQ', [P.BL * 0.3 + K.len * 0.45, P.top + 30, 0], 820, { orbit: -0.75, lift: 0.35 });
      P.k.g.updateMatrixWorld(true);
      const W = (x, y, z) => new THREE.Vector3(x, y, z).applyMatrix4(P.k.g.matrixWorld).toArray();
      const a = P.k.bedA, head = [K.mouth - (K.h + K.blade_proj) / Math.tan(a), K.h + K.blade_proj, 0];
      anchor(this.dai, cam, W(K.len * 0.8, K.h, K.w / 2), -40, 10);
      anchor(this.bl, cam, W(head[0] + 6, head[1] - 4, -K.blade_w / 2), 40, -70);
      anchor(this.cb, cam, W(head[0] + 22, head[1] - 22, K.blade_w / 2), 20, -60);
      this.arrs.forEach((x) => x.remove()); this.arrs = [];
      const r = (x) => L.ramp(t, x - 0.3, x + 0.3);
      // tap arrows: along the blade's axis onto its head; and down onto the block's head-end top corners (x = 0)
      const ax = [-Math.cos(a), Math.sin(a)];
      const ta = arrow3(this.svg, cam, W(head[0] + ax[0] * 90, head[1] + ax[1] * 90, 0), W(head[0] + ax[0] * 6, head[1] + ax[1] * 6, 0), { w: 5 }); ta.setAttribute('opacity', r(e.adv) * (1 - r(e.nimai))); this.arrs.push(ta);
      [-1, 1].forEach((sd) => { const tb = arrow3(this.svg, cam, W(4, K.h + 90, sd * (K.w / 2 - 4)), W(4, K.h + 4, sd * (K.w / 2 - 4)), { w: 5 }); tb.setAttribute('opacity', r(e.back) * (1 - r(e.nimai))); this.arrs.push(tb); });
      anchor(this.tapA, cam, W(head[0] + ax[0] * 90, head[1] + ax[1] * 90, 0), 60, -110); L.show(this.tapA, r(e.adv) * (1 - r(e.nimai)));
      anchor(this.tapB, cam, W(4, K.h + 4, -K.w / 2), -520, 40); L.show(this.tapB, r(e.back) * (1 - r(e.nimai)));
      const pa = arrow3(this.svg, cam, W(K.len + 20, 6, K.w / 2 + 30), W(K.len + 180, 6, K.w / 2 + 30), { w: 6, head: 24 }); pa.setAttribute('opacity', r(e.pull) * (1 - r(e.dai))); this.arrs.push(pa);
      anchor(this.pull, cam, W(K.len + 100, 6, K.w / 2 + 30), -40, 10); L.show(this.pull, r(e.pull) * (1 - r(e.dai)));
      L.show(this.term, r(e.term)); L.show(this.dai, r(e.dai)); L.show(this.bl, r(e.dai) * (1 - r(e.adv - 0.5)) + r(e.cb));
      L.show(this.cb, r(e.cb)); L.show(this.nm, r(e.nimai)); L.show(this.src, r(e.manual));
      return { scene: P.s, camera: cam };
    },
  },
  S08: {
    build() {
      const svg = L.svgLayer();
      this.h = L.text('the same jobs', { x: 96, y: 70, size: 56 }); this.h.style.fontWeight = 700;
      L.text('<b>Japanese</b>', { x: 300, y: 190, size: 40, align: 'center' }); L.text('<b>Western</b>', { x: 1300, y: 190, size: 40, align: 'center' });
      const rows = [['chisel', 'nomi · struck or pushed', 'bench chisel'], ['hammer', 'gennō', 'hammer or mallet'], ['plane', 'kanna · pulled ←', 'bench plane · pushed →']];
      rows.forEach(([what, j, w], i) => {
        const y = 300 + i * 220;
        L.text(`<b>${what}</b>`, { x: 800, y, size: 40, align: 'center', cls: 'soft' });
        L.text(j, { x: 300, y: y + 60, size: 40, align: 'center' }); L.text(w, { x: 1300, y: y + 60, size: 40, align: 'center' });
        el2(svg, 'line', { x1: 96, y1: y + 150, x2: 1824, y2: y + 150, stroke: '#D8CFBF', 'stroke-width': 2 });
      });
      this.k = L.text('the clearest difference: a Western plane is pushed', { x: 96, y: 990, size: 40 });
    },
    frame(t, sh) { L.show(this.k, L.ramp(t, sh.ev.plane - 0.3, sh.ev.plane + 0.3)); return {}; },
  },
  S09: {
    build() {
      const a = L.text('Keep edges sharp', { x: 960, y: 300, size: 64, align: 'center' }); a.style.fontWeight = 700;
      this.l1 = L.text('a dull tool invites injury', { x: 960, y: 450, size: 48, align: 'center' });
      this.l2 = L.text('never point a chisel’s edge at yourself or anyone else', { x: 960, y: 540, size: 48, align: 'center' });
      this.l3 = L.text('sharpen chisels and planes well after use', { x: 960, y: 630, size: 48, align: 'center' });
      L.text('from the national skills-test manual for carpenters (MHLW)', { x: 960, y: 780, size: 36, align: 'center', cls: 'soft' });
    },
    frame(t, sh) { const e = sh.ev; L.show(this.l1, L.ramp(t, e.dull - 0.3, e.dull + 0.3)); L.show(this.l2, L.ramp(t, e.never - 0.3, e.never + 0.3)); L.show(this.l3, L.ramp(t, e.after - 0.6, e.after)); return {}; },
  },
  S10: {
    build() {
      const a = L.text('Next · Episode 5', { x: 96, y: 330, size: 48 }); a.style.fontWeight = 700;
      const b = L.text('The First Joint', { x: 96, y: 410, size: 96 }); b.style.fontWeight = 700;
      this.c = L.text('<i>koshikake ari-tsugi</i>', { x: 96, y: 560, size: 48, cls: 'soft' });
    },
    frame(t, sh) { L.show(this.c, L.ramp(t, sh.ev.joint - 0.2, sh.ev.joint + 0.3)); return {}; },
  },
  S11: {
    build() {
      const h = L.text('Strike or push the chisel. Pull the plane.', { x: 96, y: 60, size: 60 }); h.style.fontWeight = 700;
      L.text('tap the blade into its block · keep every edge sharp', { x: 96, y: 150, size: 36, cls: 'soft', w: 1728 });
      const rows = [
        ['nomi', '鑿', 'chisel', 'tataki-nomi 叩き鑿 (struck) · tsuki-nomi 突き鑿 (pushed by hand)'],
        ['katsura', 'かつら', 'hoop', 'the iron hoop on a struck chisel’s handle'],
        ['oire-nomi', '追入鑿', 'bench chisel', 'also read oiire, or written ōire 大入'],
        ['mukōmachi-nomi', '向待鑿', 'mortise chisel', 'a thick blade, for deep mortises'],
        ['hagane / jigane', '鋼 / 地金', 'steel / iron', 'a laminated blade: hard steel forge-welded to softer iron'],
        ['urasuki', '裏スキ', 'back hollow', 'a shallow hollow in the back; the bevel stays flat'],
        ['gennō', '玄能', 'hammer', 'flat face; domed face, kigoroshi-men 木殺し面'],
        ['kanna · dai', '鉋 · 台', 'plane · block', 'pulled; the blade is set by tapping'],
        ['uragane', '裏金', 'chip breaker', 'two-blade plane, nimai-ganna 二枚鉋 (Meiji era)'],
      ];
      const g = L.text('', { x: 96, y: 230, size: 36, w: 1728 });
      g.innerHTML = '<div class="soft" style="font-size:36px;margin-bottom:10px;letter-spacing:.08em">GLOSSARY · EPISODE 4 · PART 2</div>' + rows.map((r) => `<div style="display:flex;gap:30px;margin-bottom:8px;align-items:baseline"><div style="width:560px;font-weight:700;font-size:38px"><i>${r[0]}</i> <span style="font-family:'Noto Serif CJK JP',serif;font-style:normal">${r[1]}</span></div><div style="width:1140px;white-space:normal;font-size:36px"><b>${r[2]}</b> — <span class="soft">${r[3]}</span></div></div>`).join('');
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
  const b = L.text('EPISODE 4 · PART 2', { x: 96, y: 370, size: 48 }); b.style.fontWeight = 700; b.style.letterSpacing = '0.12em';
  const c = L.text('The Cutting Kit', { x: 96, y: 510, size: 96 }); c.style.fontWeight = 700;
  L.text('Chisels, Hammer and Plane', { x: 96, y: 650, size: 64, cls: 'soft' });
}
function endCard() {
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 330, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('Next · Episode 5', { x: 96, y: 420, size: 48 }); b.style.fontWeight = 700;
  const c = L.text('The First Joint', { x: 96, y: 500, size: 96 }); c.style.fontWeight = 700;
  L.text('koshikake ari-tsugi: what it is, its parts, and why it is shaped that way', { x: 96, y: 640, size: 40, cls: 'soft' });
  const svg = L.svgLayer(); el2(svg, 'line', { x1: 96, y1: 740, x2: 560, y2: 740, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
}
