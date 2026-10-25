// Episode 2 · Part 2 shots: ink line, ink pen, squaring with the sashigane, marking gauge, marking knife.
import { makeSashigane } from '/shared/render/sashigane.js';
let L, THREE, G, TL, SQ;
const R = (p) => `/episodes/ep02b_ink_and_gauges/${p}`;

export async function init(lib) {
  L = lib; THREE = lib.THREE;
  G = await (await fetch(R('build/geometry.json'))).json();
  TL = await (await fetch(R('build/timeline.json'))).json();
  SQ = makeSashigane(L, G.sashigane, G.scales);
  const byId = Object.fromEntries(TL.shots.map((s) => [s.id, s]));
  const shots = Object.entries(SHOTS).map(([id, def]) => ({ id, ...byId[id], ...def }));
  return { shots, fps: TL.fps, total: TL.total };
}
function el2(parent, tag, attrs) { return L.el('svg:' + tag, attrs, parent); }
function anchor(d, cam, pt, dx = 0, dy = 0) { const [x, y] = L.toScreen(cam, pt); d.style.left = x + dx + 'px'; d.style.top = y + dy + 'px'; }
const FONT = "'Noto Sans CJK JP', sans-serif";
const BAMBOO = '#C8B07A', ZELKOVA = '#7A4E2D', INK = '#1B1B1B';
const std = (c, r = 0.7, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });

// a thin cylinder between two points (string, needle)
function segment(r = 1.8, color = INK) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1, 8), std(color, 0.6)); m.castShadow = true; return m; }
function setSeg(m, a, b) { const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b); const d = B.clone().sub(A); m.position.copy(A.clone().add(B).multiplyScalar(0.5)); m.scale.set(1, d.length(), 1); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); }

// =============== tool models (proportions illustrative except the pot length) ===============
function makePot() { // local: back (reel) at x=0, mouth at x=len; base at y=0
  const P = G.pot, g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(P.len, P.h * 0.62, P.w), std(ZELKOVA, 0.55)); body.position.set(P.len / 2, P.h * 0.31, 0); g.add(body);
  const front = new THREE.Mesh(new THREE.CylinderGeometry(P.w / 2, P.w / 2, P.h * 0.62, 32, 1, false, 0, Math.PI), std(ZELKOVA, 0.55)); front.position.set(P.len, P.h * 0.31, 0); front.rotation.y = -Math.PI / 2 + Math.PI; g.add(front);
  const pond = new THREE.Mesh(new THREE.CylinderGeometry(26, 26, 2, 32), std('#2B2724', 0.9)); pond.scale.set(1.25, 1, 0.85); pond.position.set(P.len - P.ike_len / 2 - 10, P.h * 0.62 + 0.2, 0); g.add(pond);
  const floss = new THREE.Mesh(new THREE.SphereGeometry(18, 16, 8), std('#4a4642', 0.95)); floss.scale.set(1.3, 0.25, 0.9); floss.position.set(P.len - P.ike_len / 2 - 10, P.h * 0.62 + 1, 0); g.add(floss);
  const reel = new THREE.Mesh(new THREE.CylinderGeometry(P.reel_r, P.reel_r, 34, 32), std('#9C6B43', 0.5)); reel.rotation.x = Math.PI / 2; reel.position.set(55, P.h * 0.62 + P.reel_r * 0.55, 0); g.add(reel);
  const spokes = new THREE.Mesh(new THREE.BoxGeometry(P.reel_r * 1.9, 4, 36), std('#5E3A22', 0.5)); spokes.position.copy(reel.position); g.add(spokes);
  const crank = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 40, 10), std('#5E3A22', 0.5)); crank.rotation.x = Math.PI / 2; crank.position.set(55 + P.reel_r * 0.6, P.h * 0.62 + P.reel_r * 0.55, 34); g.add(crank);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  const mouth = [P.len + P.w / 2 - 4, P.h * 0.62 - 6, 0], reelTop = [55, P.h * 0.62 + P.reel_r * 1.55, 0], pondPt = [P.len - P.ike_len / 2 - 10, P.h * 0.62 + 2, 0];
  return { g, reel, spokes, mouth, reelTop, pondPt, pond };
}
function makePin() { // karuko: small wooden head with a needle; local tip at origin
  const g = new THREE.Group();
  const head = new THREE.Mesh(new THREE.CylinderGeometry(7, 9, 26, 12), std('#9C6B43', 0.5)); head.position.y = 22; g.add(head);
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.2, 10, 8), std('#888', 0.3, 0.7)); needle.position.y = 4; g.add(needle);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}
function makePen() { // sumisashi: flattened bamboo; +x end slanted and split (line end); -x end rounded (writing end). Tip of line end at origin.
  const P = G.pen, sh = new THREE.Shape();
  sh.moveTo(0, 0); sh.lineTo(-P.slant, P.w); sh.lineTo(-P.len + P.w / 2, P.w);
  sh.absarc(-P.len + P.w / 2, P.w / 2, P.w / 2, Math.PI / 2, 3 * Math.PI / 2, false); sh.lineTo(0, 0);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: P.t, bevelEnabled: false }); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, 0);
  const m = new THREE.Mesh(geo, std(BAMBOO, 0.6)); m.castShadow = true;
  const g = new THREE.Group(); g.add(m);
  // slits on the line end, ink on both tips
  for (let i = 1; i <= P.slits; i++) { const k = i / (P.slits + 1); const sl = new THREE.Mesh(new THREE.BoxGeometry(P.slant + 22, 0.6, 0.6), std('#2a2522', 0.9)); sl.position.set(-P.slant * k - 12, P.t + 0.1, -P.w * k); sl.rotation.y = 0; g.add(sl); }
  const inkTip = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, P.w), std('#1B1B1B', 0.9)); inkTip.position.set(-P.slant / 2, P.t + 0.1, -P.w / 2); inkTip.rotation.y = Math.atan2(P.w, P.slant) - Math.PI / 2 + Math.PI / 2; inkTip.scale.set(0.6, 1, 1); g.add(inkTip);
  const brush = new THREE.Mesh(new THREE.SphereGeometry(P.w / 2, 12, 8), std('#6b5a44', 0.95)); brush.scale.set(0.9, 0.35, 1); brush.position.set(-P.len + P.w / 2 - 2, P.t / 2, -P.w / 2); g.add(brush);
  return g; // lies flat in the XZ plane, width toward -z
}
function makeGauge() { // kebiki: fence block + beam + blade. local: fence face at z=0 (presses the edge from +z), beam toward -z on the board top (y=0 = board top)
  const Gp = G.gauge, g = new THREE.Group(), wood = std('#B07A45', 0.55);
  const [fx, fy, fz] = Gp.fence; // x along the edge, y height, z thickness
  const fence = new THREE.Mesh(new THREE.BoxGeometry(fy, fy, fx * 0.36), wood); fence.scale.set(fx / fy, 1, 1); fence.position.set(0, fy / 2 - 32, fx * 0.18); g.add(fence);
  const [bl, bh, bw] = Gp.beam;
  const beam = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bl), wood); beam.position.set(0, bh / 2 + 0.5, -Gp.setting + bl / 2 - 4); g.add(beam);
  const blade = new THREE.Mesh(new THREE.BoxGeometry(2.0, 20, 9), std('#C9CED3', 0.25, 0.8)); blade.position.set(0, 5, -Gp.setting); g.add(blade);
  const wedge = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 30), std('#8a5a33', 0.55)); wedge.position.set(fy * 0.35, fy - 30, fx * 0.18); g.add(wedge);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { g, fence, beam, blade };
}
function makeKnife() { // single bevel, flat back on -z side; tip at origin, blade along -x
  const K = G.knife, sh = new THREE.Shape(); // section in (x=along length, y=width)
  sh.moveTo(0, 0); sh.lineTo(-K.len, 0); sh.lineTo(-K.len, K.w); sh.lineTo(-K.bevel_len * 2.2, K.w); sh.lineTo(0, 0);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: K.t, bevelEnabled: false });
  const pos = geo.attributes.position; // thin the cutting end toward a single bevel: back face (z=0) stays flat
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i); if (z > 0 && x > -K.bevel_len * 2.2) pos.setZ(i, z * Math.min(1, -x / (K.bevel_len * 2.2))); }
  geo.computeVertexNormals(); geo.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(geo, std('#C9CED3', 0.3, 0.5)); m.castShadow = true;
  const grip = new THREE.Mesh(new THREE.BoxGeometry(80, K.t + 3, K.w + 3), std('#3a2f2a', 0.8)); grip.position.set(-K.len + 40, -(K.t) / 2, K.w / 2); grip.rotation.x = Math.PI / 2; grip.rotation.set(0, 0, 0); grip.position.set(-K.len + 40, K.w / 2 * 0, 0);
  const g = new THREE.Group(); g.add(m); return g;
}

// =============== scenes ===============
let timberScene;
function getTimber() {
  if (timberScene) return timberScene;
  const [Lx, W, Ht] = G.timber, s = L.makeScene({ shadowBox: 2400, lightDir: [0.35, 1, 0.6] });
  const t = L.memberMesh(L.boxMember('timber', [0, 0, -W / 2, Lx, Ht, W], 'x'), { seed: 41 }); s.add(t);
  const pot = makePot(); pot.g.rotation.y = Math.PI; pot.g.position.set(-60, 60, 0); s.add(pot.g); // mouth toward +x (the timber)
  const pin = makePin(); s.add(pin);
  const seg = [segment(), segment(), segment()]; seg.forEach((m) => s.add(m));
  const ink = L.inkLine(Lx, 5); ink.rotation.x = -Math.PI / 2; ink.position.set(0, Ht + 0.3, 0); s.add(ink);
  const blocks = [500, 2500].map((x) => { const b = new THREE.Mesh(new THREE.BoxGeometry(90, 60, 200), std('#B9A58A', 0.9)); b.position.set(x, -30, 0); b.castShadow = b.receiveShadow = true; s.add(b); return b; });
  timberScene = { s, t, pot, pin, seg, ink, Ht, Lx };
  return timberScene;
}
// world point of a pot-local point (pot rotated by pi about y, then translated)
function potW(S, p) { const v = new THREE.Vector3(...p); S.pot.g.localToWorld(v); return [v.x, v.y, v.z]; }
// string state: k_out (0..1 drawn out to the far end), lift (mm, at mid), vib (release oscillation)
function poseString(S, kOut, lift, vib = 0) {
  S.pot.g.updateMatrixWorld();
  const reel = potW(S, S.pot.reelTop), pond = potW(S, S.pot.pondPt), mouth = potW(S, S.pot.mouth);
  const end = [S.Lx * kOut, S.Ht + 0.8, 0];
  S.pin.position.set(end[0], S.Ht, 0); S.pin.visible = true;
  const mid = [L.lerp(mouth[0], end[0], 0.5), L.lerp(mouth[1], end[1], 0.5) + lift + vib, 0];
  setSeg(S.seg[0], reel, pond);
  setSeg(S.seg[1], pond, mouth);
  if (lift > 0.5 || Math.abs(vib) > 0.5) { setSeg(S.seg[2], mouth, mid); if (!S.seg[3]) { S.seg[3] = segment(); S.s.add(S.seg[3]); } S.seg[3].visible = true; setSeg(S.seg[3], mid, end); }
  else { setSeg(S.seg[2], mouth, end); if (S.seg[3]) S.seg[3].visible = false; }
}

let boardScene;
function getBoard() {
  if (boardScene) return boardScene;
  const [bx, by, bz] = G.board, s = L.makeScene({ shadowBox: 900, lightDir: [0.3, 1, 0.75] });
  const board = L.memberMesh(L.boxMember('board', [0, 0, -bz / 2, bx, by, bz], 'x'), { seed: 52 }); s.add(board);
  const A = SQ.getSashigane(); s.add(A.grp);
  const pen = makePen(); s.add(pen);
  const penW = new THREE.Group(); const inner = makePen(); inner.position.x = G.pen.len - G.pen.w / 2; penW.add(inner); s.add(penW);
  const gauge = makeGauge(); s.add(gauge.g);
  const knife = makeKnife(); s.add(knife);
  const penLine = L.inkLine(bz, 2.2); const plg = new THREE.Group(); plg.rotation.y = Math.PI / 2; plg.position.set(0, by + 0.3, bz / 2); penLine.rotation.x = -Math.PI / 2; plg.add(penLine); s.add(plg);
  const gaugeLine = L.inkLine(bx, 1.4); gaugeLine.rotation.x = -Math.PI / 2; gaugeLine.position.set(0, by + 0.25, bz / 2 - G.gauge.setting); s.add(gaugeLine);
  const knifeLine = L.inkLine(bz, 1.1); const klg = new THREE.Group(); klg.rotation.y = Math.PI / 2; klg.position.set(0, by + 0.25, bz / 2); knifeLine.rotation.x = -Math.PI / 2; klg.add(knifeLine); s.add(klg);
  const note = L.inkText('RAIL', 20); note.rotation.x = -Math.PI / 2; note.position.set(330, by + 0.3, 20); s.add(note);
  boardScene = { s, board, A, pen, penW, gauge, knife, penLine, plg, gaugeLine, knifeLine, klg, note, by, bz, bx };
  return boardScene;
}
function boardReset(B) {
  B.A.grp.visible = false; B.pen.visible = false; B.penW.visible = false; B.gauge.g.visible = false; B.knife.visible = false;
  L.setProgress(B.penLine, 0); L.setProgress(B.gaugeLine, 0); L.setProgress(B.knifeLine, 0); B.note.visible = false; SQ.bendArm(0);
}
// sashigane hooked per the Topman figure: long arm along the near edge (outside, inner edge on the side face), short arm across the face.
const HEELX = 420;
function poseHooked(B, k = 1) {
  const A = B.A; A.grp.visible = true; A.grp.rotation.set(0, Math.PI, 0);
  A.grp.position.set(HEELX, B.by + 0.4, B.bz / 2 + G.sashigane.width + 260 * (1 - k));
}

// =============== shots ===============
const SHOTS = {
  S01: {
    fadeIn: 0.8,
    build() { getTimber(); this.cap = L.text('3 m · one line, end to end', { x: 96, y: 960, size: 40 }); },
    frame(t, sh) {
      const S = getTimber(), e = sh.ev;
      const lift = 120 * L.ramp(t, e.lift - 0.5, e.lift + 0.3) * (1 - L.lin(t, e.release, e.release + 0.05));
      const vib = t > e.release ? 18 * Math.exp(-(t - e.release) * 9) * Math.sin((t - e.release) * 70) : 0;
      poseString(S, 1, lift, vib);
      S.ink.visible = t > e.release + 0.05; L.setProgress(S.ink, t > e.release + 0.05 ? 1 : 0);
      L.show(this.cap, L.ramp(t, e.line - 0.2, e.line + 0.4));
      const cam = L.camera('threeQ', [1500, 60, 0], 3500, { orbit: -0.12 + 0.06 * L.lin(t, 0, sh.end - sh.start), lift: 0.2 });
      return { scene: S.s, camera: cam };
    },
  },
  S02: { fadeIn: 0.5, fadeOut: 0.6, build() { titleCard(); }, frame() { return {}; } },
  S03: {
    build() {
      const s = L.makeScene({ shadowBox: 400, lightDir: [0.3, 1, 0.6] }); this.sc = s;
      this.pot = makePot(); s.add(this.pot.g); this.pot.g.position.set(-G.pot.len / 2, 0, 0);
      this.str = segment(0.9); s.add(this.str); this.str2 = segment(0.9); s.add(this.str2); this.str3 = segment(0.9); s.add(this.str3);
      this.pin = makePin(); s.add(this.pin);
      this.term = L.label({ romaji: 'sumitsubo', kanji: '墨壺', gloss: "carpenter's ink line", x: 96, y: 70 });
      this.l1 = L.label({ romaji: 'ike', kanji: '池', gloss: 'pond: silk floss soaked in ink', x: 0, y: 0, size: 36 });
      this.l2 = L.label({ gloss: 'reel', x: 0, y: 0, size: 36 });
      this.l3 = L.label({ romaji: 'karuko', kanji: '軽子', gloss: 'pin (also written 仮子)', x: 0, y: 0, size: 36 });
      this.l4 = L.text('mulberry traditionally · zelkova common today', { x: 96, y: 990, size: 36, cls: 'soft' });
      this.l5 = L.text('proportions illustrative · pot about 240 mm long', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const e = sh.ev, P = this.pot; P.g.updateMatrixWorld();
      const W = (p) => { const v = new THREE.Vector3(...p); P.g.localToWorld(v); return [v.x, v.y, v.z]; };
      const mouth = W(P.mouth), end = [mouth[0] + 150, 2, 0];
      setSeg(this.str, W(P.reelTop), W(P.pondPt)); setSeg(this.str2, W(P.pondPt), mouth); setSeg(this.str3, mouth, end); this.pin.position.set(end[0], 0, 0);
      const cam = L.camera('threeQ', [60, 30, 0], 900, { orbit: -0.35 + 0.2 * L.lin(t, 0, sh.end - sh.start), lift: 0.3 });
      L.show(this.term, L.ramp(t, e.term - 0.2, e.term + 0.3)); L.show(this.l5, L.ramp(t, e.term, e.term + 0.4));
      anchor(this.l1, cam, W(P.pondPt), 20, -150); L.show(this.l1, L.ramp(t, e.ike - 0.2, e.ike + 0.3));
      anchor(this.l2, cam, W(P.reelTop), -40, -70); L.show(this.l2, L.ramp(t, e.reel - 0.2, e.reel + 0.3));
      anchor(this.l3, cam, [end[0], 30, 0], -330, -130); L.show(this.l3, L.ramp(t, e.pin - 0.2, e.pin + 0.3));
      L.show(this.l4, L.ramp(t, e.wood - 0.2, e.wood + 0.3));
      return { scene: this.sc, camera: cam };
    },
  },
  S04: {
    build() { getTimber(); this.c1 = L.text('pin in at one end · line drawn out through the ink · pulled taut', { x: 96, y: 960, size: 36 }); this.c2 = L.text('lift straight up · let go', { x: 96, y: 960, size: 40 }); },
    frame(t, sh) {
      const S = getTimber(), e = sh.ev;
      const kOut = L.ramp(t, e.draw - 0.3, e.taut + 0.2);
      const lift = 120 * L.ramp(t, e.lift - 0.2, e.lift + 0.6) * (1 - L.lin(t, e.go, e.go + 0.05));
      const vib = t > e.go ? 18 * Math.exp(-(t - e.go) * 9) * Math.sin((t - e.go) * 70) : 0;
      // the pot is carried from the far end back toward its start as the line pays out
      S.pot.g.position.set(L.lerp(S.Lx + 80, -60, kOut), 60, 0);
      poseString(S, 1, lift, vib);
      // pin stays at the far end (pushed in first); string runs from the pot back to it
      S.pin.position.set(S.Lx, S.Ht, 0);
      S.ink.visible = t > e.go + 0.05; L.setProgress(S.ink, t > e.go + 0.05 ? 1 : 0);
      L.show(this.c1, L.fade(t, e.pin, e.lift - 0.3, 0.3)); L.show(this.c2, L.ramp(t, e.lift - 0.2, e.lift + 0.3));
      const near = ['threeQ', [S.Lx - 150, S.Ht, 0], 900, { orbit: 0.4, lift: 0.1 }], far = ['threeQ', [1500, 60, 0], 3500, { orbit: -0.1, lift: 0.2 }];
      const cam = L.cameraBlend(near, far, L.ramp(t, e.draw - 0.4, e.draw + 1.2));
      return { scene: S.s, camera: cam };
    },
  },
  S05: {
    build() {
      const svg = L.svgLayer();
      L.woodRect(svg, 160, 220, 1100, 70); L.woodRect(svg, 160, 400, 1100, 70);
      this.chalk = el2(svg, 'line', { x1: 180, y1: 255, x2: 1240, y2: 255, stroke: '#F7F4EE', 'stroke-width': 7, 'stroke-dasharray': '3 2', opacity: 0.95 });
      this.ink = el2(svg, 'line', { x1: 180, y1: 435, x2: 1240, y2: 435, stroke: INK, 'stroke-width': 3 });
      this.l1 = L.text('chalk line: wipes off easily', { x: 1300, y: 232, size: 40 });
      this.l2 = L.text('ink line', { x: 1300, y: 412, size: 40 });
      // pot outlines to scale: about 180, 240, 300 mm long (R3-03)
      this.pots = el2(svg, 'g', {}); const k = 1.6;
      L.text('ink pot lengths, to scale', { x: 160, y: 620, size: 40 });
      [180, 240, 300].forEach((len, i) => { const y = 700 + i * 90; el2(this.pots, 'rect', { x: 160, y, width: len * k * 2, height: 46, rx: 12, fill: ZELKOVA, opacity: 0.9 }); L.text(`about ${len / 10} cm`, { x: 180 + len * k * 2, y: y + 2, size: 36 }); });
      this.l3 = null;
    },
    frame(t, sh) {
      const e = sh.ev;
      L.show(this.chalk, L.ramp(t, e.chalk - 0.2, e.chalk + 0.3)); L.show(this.l1, L.ramp(t, e.wipes - 0.2, e.wipes + 0.3));
      L.show(this.ink, L.ramp(t, 0, 0.4)); L.show(this.l2, L.ramp(t, 0.2, 0.6));
      L.show(this.pots, L.ramp(t, e.sizes - 0.3, e.sizes + 0.3));
      [...document.querySelectorAll('.shotov')].forEach(() => {});
      return {};
    },
  },
  S06: {
    build() {
      getBoard();
      this.term = L.label({ romaji: 'sumisashi', kanji: '墨差し', gloss: 'ink pen: flattened bamboo', x: 96, y: 70 });
      this.a = L.text('line end: cut on a slant, split into fine slits', { x: 96, y: 900, size: 36 });
      this.b = L.text('writing end: rounded and crushed into a brush', { x: 96, y: 960, size: 36 });
      this.c = L.text('like the notes on the story stick, Episode 1', { x: 1824, y: 980, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const B = getBoard(), e = sh.ev; boardReset(B);
      B.pen.visible = true;
      const kl = L.ramp(t, e.line - 0.1, e.line + 1.4), kw = L.ramp(t, e.write, e.write + 1.6);
      L.setProgress(B.penLine, kl); B.plg.position.x = 160;
      if (t < e.other) { B.pen.rotation.set(0, Math.PI - 0.5, -0.4); B.pen.position.set(160, B.by + 0.5, B.bz / 2 - B.bz * kl); }
      else { // flipped: writing with the rounded end (pivot at that end)
        B.pen.visible = false; B.penW.visible = true; B.penW.rotation.set(0, 0.6, 0.45); B.penW.position.set(335 + 60 * kw, B.by + 1, 20 + 8 * Math.sin(kw * 18));
      }
      B.note.visible = t > e.write; if (B.note.visible) { B.note.material.opacity = kw; }
      L.show(this.term, L.ramp(t, e.term - 0.2, e.term + 0.3)); L.show(this.a, L.ramp(t, e.slant - 0.2, e.slant + 0.3)); L.show(this.b, L.ramp(t, e.other, e.other + 0.4)); L.show(this.c, L.ramp(t, e.ep1 - 0.2, e.ep1 + 0.3));
      const cam = L.camera('threeQ', [260, B.by, 20], 620, { orbit: 0.2, lift: 0.4 });
      return { scene: B.s, camera: cam };
    },
  },
  S07: {
    build() {
      getBoard();
      this.q = L.text('Squaring a line with a flat square', { x: 96, y: 60, size: 48 }); this.q.style.fontWeight = 700;
      this.l1 = L.text('one arm hooks the edge: its inner edge presses the side', { x: 96, y: 880, size: 36 });
      this.l2 = L.text('fingers near the middle of that arm', { x: 96, y: 930, size: 36 });
      this.l3 = L.text('draw along the arm across the face', { x: 96, y: 980, size: 36 });
      // inset: section through the hooked arm at the board's edge (magnified)
      const svg = L.svgLayer(); this.inset = el2(svg, 'g', {}); const ix = 1240, iy = 170, M = 9;
      el2(this.inset, 'rect', { x: ix - 20, y: iy - 30, width: 580, height: 360, fill: L.C.paper, stroke: L.C.ink, 'stroke-width': 2, rx: 10 });
      el2(this.inset, 'path', { d: `M${ix},${iy + 40} h${18 * M} v${22 * M} h${-18 * M} Z`, fill: '#E6C9A0', stroke: L.C.ink, 'stroke-width': 2 });
      el2(this.inset, 'g', { transform: `translate(${ix + 18 * M},${iy + 40 + 0.8 * M})` }).innerHTML = `<rect x="0" y="0" width="${15 * M}" height="${1.4 * M}" fill="#D3D7DB" stroke="${INK}" stroke-width="2"/>`;
      el2(this.inset, 'path', { d: `M${ix + 18 * M + 15 * M + 40},${iy + 40 + 1.5 * M} h-30 m12,-8 l-12,8 l12,8`, stroke: INK, 'stroke-width': 3, fill: 'none' });
      const tx = el2(this.inset, 'text', { x: ix, y: iy + 300, 'font-size': 36, 'font-family': FONT }); tx.textContent = 'section at the edge · not to scale';
      const tx2 = el2(this.inset, 'text', { x: ix + 18 * M + 20, y: iy + 130, 'font-size': 36, 'font-family': FONT }); tx2.textContent = 'inner edge against';
      const tx3 = el2(this.inset, 'text', { x: ix + 18 * M + 20, y: iy + 172, 'font-size': 36, 'font-family': FONT }); tx3.textContent = 'the side face';
      // the three top-view panels (wrong + two right ways)
      this.panels = el2(svg, 'g', {});
      const panel = (x, mode, cap) => {
        const g = el2(this.panels, 'g', {}); const y = 300, w = 420, h = 240;
        el2(g, 'rect', { x, y, width: w, height: h, fill: '#E6C9A0', stroke: INK, 'stroke-width': 2 });
        if (mode === 'long') el2(g, 'path', { d: `M${x + 40},${y + h + 12} h${w - 60} v-12 h${-(w - 60) + 12} v${-h - 40} h-12 Z`, fill: '#D3D7DB', stroke: INK, 'stroke-width': 2 });
        if (mode === 'short') el2(g, 'path', { d: `M${x + 300},${y + h + 12} h-140 v-12 h128 v${-h - 40} h12 Z`, fill: '#D3D7DB', stroke: INK, 'stroke-width': 2 });
        if (mode === 'top') el2(g, 'path', { d: `M${x + 60},${y + h - 30} h300 v-12 h-288 v-170 h-12 Z`, fill: '#D3D7DB', stroke: INK, 'stroke-width': 2, transform: `rotate(-4 ${x + 200} ${y + 120})` });
        g.innerHTML += mode === 'top' ? L.X_ICON(x + w - 30, y + 30, 44) : L.CHECK_ICON(x + w - 30, y + 30, 44);
        const ct = L.text(cap, { x: x + w / 2, y: y + h + 40, size: 36, align: 'center', cls: mode === 'top' ? 'acc' : '', w: 460 }); ct.classList.add('wrap'); g.cap = ct;
        return g;
      };
      this.pTop = panel(130, 'top', 'laid on top: nothing holds it square'); this.pLong = panel(750, 'long', 'long arm hooks the edge'); this.pShort = panel(1370, 'short', 'or the short arm hooks it');
      this.ref = L.text('the hooked edge is the reference: it must be straight and true', { x: 960, y: 130, size: 40, align: 'center' });
      this.views = L.text('top views · arms drawn shortened', { x: 1824, y: 1000, size: 36, cls: 'soft', align: 'right' });
      this.press = L.text('↓ press here', { x: 0, y: 0, size: 40 }); this.press.style.fontWeight = 700;
    },
    frame(t, sh) {
      const B = getBoard(), e = sh.ev; boardReset(B);
      const phase2 = t > e.wrong - 0.3;
      const k = L.ramp(t, e.hook - 0.5, e.hook + 0.5); poseHooked(B, k);
      B.pen.visible = !phase2 && t > e.draw - 0.6; const kd = L.ramp(t, e.draw, e.draw + 1.5);
      B.plg.position.x = HEELX; L.setProgress(B.penLine, phase2 ? 0 : kd);
      B.pen.rotation.set(0, Math.PI - 0.5, -0.4); B.pen.position.set(HEELX + 1, B.by + 0.5, B.bz / 2 - B.bz * kd);
      L.show(this.q, L.ramp(t, 0.1, 0.5) * (phase2 ? 0 : 1));
      L.show(this.l1, phase2 ? 0 : L.ramp(t, e.press - 0.2, e.press + 0.3)); L.show(this.l2, phase2 ? 0 : L.ramp(t, e.fingers - 0.2, e.fingers + 0.3)); L.show(this.l3, phase2 ? 0 : L.ramp(t, e.draw - 0.2, e.draw + 0.3));
      L.show(this.inset, phase2 ? 0 : L.ramp(t, e.press, e.press + 0.4));
      L.show(this.panels, L.ramp(t, e.wrong - 0.3, e.wrong + 0.2)); L.show(this.pLong, L.ramp(t, e.wrong, e.wrong + 0.3)); L.show(this.pShort, L.ramp(t, e.both - 0.3, e.both + 0.2));
      L.show(this.pTop.cap, L.ramp(t, e.wrong - 0.3, e.wrong + 0.2)); L.show(this.pLong.cap, L.ramp(t, e.wrong, e.wrong + 0.3)); L.show(this.pShort.cap, L.ramp(t, e.both - 0.3, e.both + 0.2));
      L.show(this.ref, L.ramp(t, e.ref - 0.2, e.ref + 0.3)); L.show(this.views, phase2 ? 1 : 0);
      if (phase2) { L.show(this.press, 0); return {}; }
      const cam = L.camera('threeQ', [300, B.by, 40], 1050, { orbit: -0.15, lift: 0.4 });
      anchor(this.press, cam, [HEELX - 260, B.by + 2, B.bz / 2 + 8], -20, -70); L.show(this.press, phase2 ? 0 : L.ramp(t, e.fingers - 0.2, e.fingers + 0.3));
      return { scene: B.s, camera: cam };
    },
  },
  S08: {
    build() {
      getBoard();
      this.term = L.label({ romaji: 'kebiki', kanji: '罫引', gloss: 'marking gauge (also written 毛引)', x: 96, y: 70 });
      this.lf = L.label({ romaji: 'jōgi-ita', kanji: '定規板', gloss: 'fence', x: 0, y: 0, size: 36 });
      this.lb = L.label({ romaji: 'sao', kanji: '棹', gloss: 'beam', x: 0, y: 0, size: 36 });
      this.lk = L.label({ gloss: 'blade ↓', x: 0, y: 0, size: 36 });
      this.set = L.text('set once · repeated on every piece', { x: 96, y: 980, size: 40 });
      this.ill = L.text('proportions illustrative', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const B = getBoard(), e = sh.ev; boardReset(B);
      const G2 = B.gauge; G2.g.visible = true;
      const kx = 0.15 + 0.6 * L.ramp(t, e.blade - 0.3, e.set + 0.5);
      G2.g.position.set(60 + (B.bx - 120) * kx, B.by, B.bz / 2); G2.g.rotation.set(0, 0, 0);
      L.setProgress(B.gaugeLine, (G2.g.position.x) / B.bx * (t > e.blade - 0.3 ? 1 : 0));
      const cam = L.camera('threeQ', [300, B.by, 60], 1100, { orbit: 0.25, lift: 0.35 });
      L.show(this.term, L.ramp(t, e.term - 0.2, e.term + 0.3)); L.show(this.ill, L.ramp(t, e.term, e.term + 0.4));
      anchor(this.lf, cam, [G2.g.position.x, B.by - 10, B.bz / 2 + 20], 90, 10); L.show(this.lf, L.ramp(t, e.fence - 0.2, e.fence + 0.3));
      anchor(this.lb, cam, [G2.g.position.x, B.by + 14, B.bz / 2 + 120], -200, -100); L.show(this.lb, L.ramp(t, e.fence + 0.6, e.fence + 1.0));
      anchor(this.lk, cam, [G2.g.position.x, B.by + 20, B.bz / 2 - G.gauge.setting], -30, -130); L.show(this.lk, L.ramp(t, e.blade - 0.2, e.blade + 0.3));
      L.show(this.set, L.ramp(t, e.set - 0.2, e.set + 0.3));
      return { scene: B.s, camera: cam };
    },
  },
  S09: {
    build() {
      const svg = L.svgLayer(); this.svg = svg;
      const box = (x, lab, torn) => {
        const g = el2(svg, 'g', {}); const y = 240, w = 720, h = 440;
        el2(g, 'rect', { x, y, width: w, height: h, fill: '#E6C9A0', stroke: INK, 'stroke-width': 2 });
        for (let i = 0; i < 46; i++) el2(g, 'line', { x1: x + 8 + i * 15.5, y1: y, x2: x + 8 + i * 15.5, y2: y + h, stroke: 'rgba(150,100,55,0.45)', 'stroke-width': 2 });
        const cy = y + h / 2;
        if (!torn) el2(g, 'rect', { x, y: cy - 3, width: w, height: 6, fill: INK });
        else { let d = `M${x},${cy}`; for (let X = x; X <= x + w; X += 15.5) d += ` L${X},${cy + (Math.sin(X * 1.7) * 9 + (X % 31 > 15 ? 7 : -6))}`; el2(g, 'path', { d, stroke: INK, 'stroke-width': 6, fill: 'none' }); for (let X = x + 6; X < x + w; X += 31) el2(g, 'line', { x1: X, y1: cy - 4, x2: X + 6, y2: cy - 22, stroke: INK, 'stroke-width': 2 }); }
        L.text(lab, { x: x + w / 2, y: y + h + 24, size: 40, align: 'center' });
        return g;
      };
      this.pin = box(160, 'pin gauge: tends to tear the fibers', true); this.blade = box(1040, 'blade (kebiki, cutting gauge): slices them', false);
      this.cap = L.text('magnified · a line across the grain', { x: 960, y: 140, size: 40, align: 'center' });
    },
    frame(t, sh) { const e = sh.ev; L.show(this.cap, L.ramp(t, 0, 0.4)); L.show(this.pin, L.ramp(t, e.pin - 0.3, e.pin + 0.2)); L.show(this.blade, L.ramp(t, e.slice - 0.3, e.slice + 0.2)); return {}; },
  },
  S10: {
    build() {
      const svg = L.svgLayer();
      this.a = L.label({ romaji: 'sujikebiki', kanji: '筋罫引', gloss: 'scores lines', x: 160, y: 260 });
      this.b = L.label({ romaji: 'warikebiki', kanji: '割罫引', gloss: 'cuts deeper, to split thin boards to width', x: 1000, y: 260 });
      this.ga = el2(svg, 'g', {}); el2(this.ga, 'rect', { x: 160, y: 520, width: 600, height: 120, fill: '#E6C9A0', stroke: INK, 'stroke-width': 2 }); el2(this.ga, 'path', { d: 'M440,520 l10,22 l10,-22', fill: INK });
      this.gb = el2(svg, 'g', {}); el2(this.gb, 'rect', { x: 1000, y: 540, width: 600, height: 40, fill: '#E6C9A0', stroke: INK, 'stroke-width': 2 }); el2(this.gb, 'path', { d: 'M1280,540 l10,40 l10,-40', fill: INK });
      L.text('sections, magnified', { x: 960, y: 760, size: 36, cls: 'soft', align: 'center' });
      L.text('just two of many kinds', { x: 960, y: 820, size: 36, cls: 'soft', align: 'center' });
    },
    frame(t, sh) { const e = sh.ev; L.show(this.a, L.ramp(t, e.suji - 0.2, e.suji + 0.3)); L.show(this.ga, L.ramp(t, e.suji - 0.2, e.suji + 0.3)); L.show(this.b, L.ramp(t, e.wari - 0.2, e.wari + 0.3)); L.show(this.gb, L.ramp(t, e.wari - 0.2, e.wari + 0.3)); return {}; },
  },
  S11: {
    build() {
      getBoard();
      this.term = L.label({ romaji: 'shiragaki', gloss: 'marking knife · also called shirabiki', x: 96, y: 70 });
      this.f = L.text('most: flat back, one bevel', { x: 96, y: 200, size: 40 });
      this.c = L.text('a fine cut, not just a mark on the surface', { x: 96, y: 980, size: 40 });
      this.n = L.text('how and when to use it: with the cutting tools', { x: 1824, y: 1000, size: 36, cls: 'soft', align: 'right' });
      const svg = L.svgLayer(); this.prof = el2(svg, 'g', {}); const x = 1380, y = 300;
      el2(this.prof, 'path', { d: `M${x},${y} h300 l60,40 h-360 Z`, fill: '#A9AEB3', stroke: INK, 'stroke-width': 2 });
      const a = el2(this.prof, 'text', { x: x + 310, y: y - 14, 'font-size': 36, 'font-family': FONT }); a.textContent = 'bevel ↘';
      const b = el2(this.prof, 'text', { x, y: y + 90, 'font-size': 36, 'font-family': FONT }); b.textContent = 'flat back';
      const c = el2(this.prof, 'text', { x, y: y + 140, 'font-size': 36, 'font-family': FONT, fill: '#4A4642' }); c.textContent = 'section, magnified';
    },
    frame(t, sh) {
      const B = getBoard(), e = sh.ev; boardReset(B); poseHooked(B, 1);
      B.knife.visible = true; const kd = L.ramp(t, e.flat - 0.2, e.flat + 1.4);
      B.klg.position.x = HEELX + 0.5; L.setProgress(B.knifeLine, kd);
      B.knife.rotation.set(0, -Math.PI / 2, 0.5); B.knife.position.set(HEELX + 0.6, B.by + 0.2, B.bz / 2 - B.bz * kd);
      L.show(this.term, L.ramp(t, e.term - 0.2, e.term + 0.3)); L.show(this.f, L.ramp(t, e.flat - 0.2, e.flat + 0.3)); L.show(this.prof, L.ramp(t, e.flat, e.flat + 0.4));
      L.show(this.c, L.ramp(t, e.cut - 0.2, e.cut + 0.3)); L.show(this.n, L.ramp(t, e.later - 0.2, e.later + 0.3));
      const cam = L.camera('threeQ', [380, B.by, 10], 700, { orbit: 0.1, lift: 0.45 });
      return { scene: B.s, camera: cam };
    },
  },
  S12: {
    build() {
      const a = L.text('Next · Episode 3', { x: 96, y: 330, size: 48 }); a.style.fontWeight = 700;
      const b = L.text('From Plan to Timber', { x: 96, y: 410, size: 96 }); b.style.fontWeight = 700;
      this.c = L.text('the board plan, and carrying its lines onto the timber', { x: 96, y: 560, size: 40, cls: 'soft' });
    },
    frame(t, sh) { L.show(this.c, L.ramp(t, sh.ev.plan - 0.2, sh.ev.plan + 0.3)); return {}; },
  },
  S13: {
    build() {
      const h = L.text('Every line has its tool.', { x: 96, y: 70, size: 60 }); h.style.fontWeight = 700;
      L.text('Snap long lines · write with the pen · square with the sashigane · gauge parallels · knife the finest', { x: 96, y: 160, size: 36, cls: 'soft', w: 1728 });
      const rows = [
        ['sumitsubo', '墨壺', 'ink line', 'pot with an inked pond (ike 池), a reel, the line, and a pin (karuko 軽子)'],
        ['sumisashi', '墨差し', 'ink pen', 'flattened bamboo: slanted split end for lines, crushed end for writing'],
        ['kebiki', '罫引', 'marking gauge', 'fence (jōgi-ita 定規板) on an edge, blade on the beam (sao 棹)'],
        ['sujikebiki', '筋罫引', 'scoring gauge', 'just scores lines'],
        ['warikebiki', '割罫引', 'slitting gauge', 'cuts deeper, to split thin boards to width'],
        ['shiragaki / shirabiki', '', 'marking knife', 'most: flat back, one bevel; a fine cut'],
        ['sashigane', '差金', 'squaring a line', 'one arm against the true edge, draw along the other'],
      ];
      const g = L.text('', { x: 96, y: 250, size: 36, w: 1728 }); g.innerHTML = '<div class="soft" style="font-size:36px;margin-bottom:14px;letter-spacing:.08em">GLOSSARY · EPISODE 2 · PART 2</div>' + rows.map((r) => `<div style="display:flex;gap:30px;margin-bottom:18px;align-items:baseline"><div style="width:600px;font-weight:700;font-size:38px"><i>${r[0]}</i> <span style="font-family:'Noto Serif CJK JP',serif;font-style:normal">${r[1]}</span></div><div style="width:1100px;white-space:normal;font-size:36px"><b>${r[2]}</b> — <span class="soft">${r[3]}</span></div></div>`).join('');
    },
    frame() { return {}; },
  },
  S14: { fadeOut: 1.0, build() { endCard(); }, frame() { return {}; } },
};

function titleCard() {
  const svg = L.svgLayer();
  el2(svg, 'line', { x1: 96, y1: 470, x2: 560, y2: 470, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 300, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('EPISODE 2 · PART 2', { x: 96, y: 370, size: 48 }); b.style.fontWeight = 700; b.style.letterSpacing = '0.12em';
  const c = L.text('The Marking Kit', { x: 96, y: 510, size: 110 }); c.style.fontWeight = 700;
  L.text('Ink Line, Pen and Gauges', { x: 96, y: 650, size: 64, cls: 'soft' });
  L.woodRect(svg, 1080, 560, 744, 40); el2(svg, 'line', { x1: 1090, y1: 580, x2: 1814, y2: 580, stroke: INK, 'stroke-width': 3 });
}
function endCard() {
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 330, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('Next · Episode 3', { x: 96, y: 420, size: 48 }); b.style.fontWeight = 700;
  const c = L.text('From Plan to Timber', { x: 96, y: 500, size: 96 }); c.style.fontWeight = 700;
  L.text('the board plan, and carrying its lines onto the timber', { x: 96, y: 640, size: 40, cls: 'soft' });
  const svg = L.svgLayer(); el2(svg, 'line', { x1: 96, y1: 740, x2: 560, y2: 740, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
}
