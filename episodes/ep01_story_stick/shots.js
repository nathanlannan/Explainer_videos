// Episode 1 shots. Geometry comes from build/geometry.json (params.py); timing from build/timeline.json (storyboard.py).
let L, THREE, G, TL;
const R = (p) => `/episodes/ep01_story_stick/${p}`;

export async function init(lib) {
  L = lib; THREE = lib.THREE;
  G = await (await fetch(R('build/geometry.json'))).json();
  TL = await (await fetch(R('build/timeline.json'))).json();
  const byId = Object.fromEntries(TL.shots.map((s) => [s.id, s]));
  const shots = Object.entries(SHOTS).map(([id, def]) => ({ id, ...byId[id], ...def }));
  return { shots, fps: TL.fps, total: TL.total };
}

const P = () => G.params;
const MARKS = () => G.stick_marks;
const NOTES = () => G.marks.map((m) => m.note);
const mm = (v) => `${v} mm <span class="soft">(${(v / 25.4).toFixed(2)} in)</span>`;

// =============== shared 3D scenes ===============
// Frame scene: the fit-checked cold-open assembly, meshes straight from the geometry kernel.
let frameScene;
function getFrame() {
  if (frameScene) return frameScene;
  const s = L.makeScene({ shadowBox: 3000, lightDir: [0.35, 1, 0.8] });
  const parts = {};
  G.members.filter((m) => m.kind !== 'stick').forEach((m, i) => { const me = L.memberMesh(m, { seed: i + 3 }); parts[m.name] = me; s.add(me); });
  frameScene = { s, parts, centre: [G.x_posts[3] / 2, 1500, 0] };
  return frameScene;
}
// Pose the assembly: k values 0 (away) .. 1 (seated) per part.
function poseFrame(F, k) {
  const off = { sill: [0, 300, 0], post: [0, 900, 0], rail: [0, 0, 900], beam: [0, 700, 0] };
  for (const [n, me] of Object.entries(F.parts)) {
    const kind = n.replace(/\d+$/, ''); const kk = k[n] ?? 1; const o = off[kind];
    me.position.set(o[0] * (1 - kk), o[1] * (1 - kk), o[2] * (1 - kk)); L.setOpacity(me, L.clamp(kk * 4));
  }
}

// Layout scene: uncut posts lying on supports (layout happens before any cutting), plus the stick.
let layScene;
const ZS = (i) => -i * 320;          // post i centre z
const YT = 205;                       // top face of a lying post (support 100 + 105)
function getLayout() {
  if (layScene) return layScene;
  const p = P(), s = L.makeScene({ shadowBox: 2600, lightDir: [0.3, 1, 0.55] });
  const posts = [], postMarks = [], centres = [];
  for (let i = 0; i < 4; i++) {
    const me = L.memberMesh(L.boxMember('lpost' + i, [0, 100, ZS(i) - p.POST / 2, p.POST_LEN, p.POST, p.POST], 'x'), { seed: 20 + i });
    s.add(me); posts.push(me);
    // centre line (shinzumi) on the top face, series dash-dot encoding
    const cl = L.centreLine(p.POST_LEN, 4, [80, 22, 14, 22]); cl.rotation.x = -Math.PI / 2; cl.position.set(0, YT + 0.4, ZS(i)); s.add(cl); centres.push(cl);
    // transferred lines: across the top face, from the stick edge to the far edge
    postMarks.push(MARKS().map((x) => { const g = new THREE.Group(); g.rotation.y = Math.PI / 2; g.position.set(x, YT + 0.5, ZS(i) + p.POST / 2 - p.STICK_W); const ln = L.inkLine(p.POST - p.STICK_W, 6); ln.rotation.x = -Math.PI / 2; g.add(ln); s.add(g); return ln; }));
  }
  const supports = [];
  for (let i = 0; i < 4; i++) for (const x of [450, 2250]) { // two plain blocks under each post
    const b = new THREE.Mesh(new THREE.BoxGeometry(90, 100, 160), new THREE.MeshStandardMaterial({ color: '#B9A58A', roughness: 0.9 }));
    b.position.set(x, 50, ZS(i)); b.castShadow = b.receiveShadow = true; s.add(b); supports.push([i, b]);
  }
  // story stick: lies on a post's top face along its near edge; group origin = stick's bottom end
  const stick = new THREE.Group();
  stick.add(L.memberMesh(L.boxMember('stick', [0, 0, -p.STICK_W, p.POST_LEN, p.STICK_T, p.STICK_W], 'x'), { seed: 9, tint: '#FFF6E6' }));
  const stickMarks = [], stickNotes = [];
  MARKS().forEach((x, k) => {
    const g = new THREE.Group(); g.rotation.y = Math.PI / 2; g.position.set(x, p.STICK_T + 0.4, 0);
    const ln = L.inkLine(p.STICK_W, 3.5); ln.rotation.x = -Math.PI / 2; g.add(ln); stick.add(g); stickMarks.push(ln);
    const note = L.inkText(NOTES()[k], 15); note.rotation.x = -Math.PI / 2;
    // notes in two lanes so close lines (0/15, 2685/2700) don't collide; each sits on the side with room
    // the end notes sit beside the neighbouring line (15 mm away) so no note crosses a line
    const side = [1, 1, -1, 1, -1, -1][k], lane = [-1, 1, -1, -1, 1, -1][k], w = note.geometry.parameters.width;
    const ax = [MARKS()[1], MARKS()[1], x, x, MARKS()[4], MARKS()[4]][k];
    note.position.set(ax + side * (w / 2 + 6), p.STICK_T + 0.5, -p.STICK_W / 2 + lane * p.STICK_W / 4);
    stick.add(note); stickNotes.push(note);
  });
  s.add(stick);
  // ghost guides joining matching marks across all four posts (used in the study hold)
  const guides = MARKS().map((x) => { const g = new THREE.Mesh(new THREE.PlaneGeometry(10, 1180), new THREE.MeshBasicMaterial({ color: L.C.ghost, transparent: true, opacity: 0.55, depthWrite: false })); g.rotation.x = -Math.PI / 2; g.position.set(x, YT + 1.2, -480); g.visible = false; s.add(g); return g; });
  const pen = L.penModel(); s.add(pen);
  const sq = L.squareModel(260, 140, 14); s.add(sq);
  layScene = { s, posts, postMarks, centres, stick, stickMarks, stickNotes, pen, sq, supports, guides };
  return layScene;
}
// Put the stick on post i (or on the bench beside the posts when i = -1), with a lift for moves.
function placeStick(S, i, lift = 0, slide = 0) {
  const p = P();
  if (i < 0) S.stick.position.set(0, lift, 520 + slide);
  else S.stick.position.set(0, YT + lift, ZS(i) + p.POST / 2 + slide);
}
// Pen at a world point, tilted like a hand holding it; hidden if a = 0.
function posePen(S, x, y, z, a = 1, tilt = 0.5) { S.pen.position.set(x, y, z); S.pen.rotation.set(0.0, 0, -tilt); S.pen.visible = a > 0.01; }
function poseSquare(S, x, y, zEdge, a = 1) { S.sq.position.set(x + 2, y + 0.8, zEdge); S.sq.rotation.set(0, Math.PI / 2, 0); S.sq.visible = a > 0.01; }

// Reset the layout scene to a neutral state each frame (frame functions are stateless).
function layoutReset(S, { posts = 4, centres = true, stickMarks = 6, notes = 6, postMarks = [0, 0, 0, 0] } = {}) {
  S.posts.forEach((m, i) => { m.visible = i < posts; });
  S.supports.forEach(([i, b]) => { b.visible = i < posts; });
  S.centres.forEach((c, i) => { c.visible = centres && i < posts; L.setGroupProgress(c, 1); });
  S.stickMarks.forEach((m, k) => L.setProgress(m, k < stickMarks ? 1 : 0));
  S.stickNotes.forEach((n, k) => { n.visible = k < notes; });
  S.postMarks.forEach((arr, i) => arr.forEach((m, k) => L.setProgress(m, i < posts ? L.clamp(postMarks[i] - k) : 0)));
  S.pen.visible = false; S.sq.visible = false;
  (S.extras || []).forEach((o) => { o.visible = false; });
  S.guides.forEach((g) => { g.visible = false; });
}

// small helper: anchor a DOM element at a projected 3D point
function anchor(d, cam, pt, dx = 0, dy = 0) { const [x, y] = L.toScreen(cam, pt); d.style.left = x + dx + 'px'; d.style.top = y + dy + 'px'; }

// =============== the shots ===============
const SHOTS = {
  // ---------- 1. cold open ----------
  S01: {
    fadeIn: 0.8,
    build() { getFrame(); },
    frame(t, sh) {
      const F = getFrame(), e = sh.ev, k = { sill: L.ramp(t, e.sill - 0.5, e.sill + 0.4) };
      for (let i = 0; i < 4; i++) k['post' + (i + 1)] = L.ramp(t, e['post' + i], e['post' + i] + 0.6);
      for (let i = 0; i < 3; i++) k['rail' + (i + 1)] = L.ramp(t, e['rail' + i], e['rail' + i] + 0.6);
      k.beam = L.ramp(t, e.beam, e.beam + 0.8);
      poseFrame(F, k);
      const cam = L.camera('threeQ', [1365, 1500, 0], 10600, { orbit: -0.22 + 0.12 * L.lin(t, 0, sh.end - sh.start) });
      return { scene: F.s, camera: cam };
    },
  },
  S02: {
    fadeIn: 0.5, fadeOut: 0.6,
    build() { titleCard('Episode 1', 'Measure Once', 'The Story Stick'); },
    frame() { return {}; },
  },
  S03: {
    build() { this.q = L.text('How does every piece fit<br>the first time?', { x: 96, y: 70, size: 64, cls: 'wrap' }); this.q.style.fontWeight = 700; },
    frame(t, sh) {
      const F = getFrame(); poseFrame(F, {});
      L.show(this.q, L.fade(t, 0.6, sh.end - sh.start, 0.6));
      const cam = L.camera('threeQ', [300, 1450, 0], 10200, { orbit: -0.13 + 0.08 * L.lin(t, 0, sh.end - sh.start), lift: -0.05 });
      return { scene: F.s, camera: cam };
    },
  },

  // ---------- 2. two workflows ----------
  S04: {
    build() {
      const svg = L.svgLayer(); this.svg = svg;
      const p = P(), X0 = [150, 1050], LEN = 700, sc = LEN / p.POST_LEN, ys = [430, 540, 650, 760], H = 46;
      this.sc = sc; this.X0 = X0; this.ys = ys;
      el2(svg, 'line', { x1: 960, y1: 150, x2: 960, y2: 960, stroke: L.C.ink, 'stroke-width': 2, opacity: 0.25 });
      this.hL = L.label({ gloss: '', x: X0[0], y: 160 }); this.hL.innerHTML = '<div class="term" style="font-size:44px">Measure each piece</div><div class="gloss" style="font-size:36px">tape: hook, read, mark, repeat</div>';
      this.hR = L.label({ gloss: '', x: X0[1], y: 160 }); this.hR.innerHTML = '<div class="term" style="font-size:44px">Copy from one reference</div><div class="gloss" style="font-size:36px">decide once, copy to every piece</div>';
      this.posts = [];
      for (const side of [0, 1]) for (let i = 0; i < 4; i++) this.posts.push(L.woodRect(svg, X0[side], ys[i], LEN, H));
      // marks: left side gets per-piece tape readings (real chained-tape drift x20, labelled); right side exact copies
      const sel = [2, 3, 4]; this.sel = sel;
      this.lmarks = []; this.rmarks = [];
      for (let i = 0; i < 4; i++) {
        this.lmarks.push(sel.map((k) => el2(svg, 'line', { x1: 0, y1: ys[i] - 4, x2: 0, y2: ys[i] + H + 4, stroke: L.C.ink, 'stroke-width': 4, transform: `translate(${X0[0] + (G.tape_marks[i][k] + (G.tape_marks[i][k] - MARKS()[k]) * (p.EXAGGERATE - 1)) * sc},0)` })));
        this.rmarks.push(sel.map((k) => el2(svg, 'line', { x1: X0[1] + MARKS()[k] * sc, y1: ys[i] - 4, x2: X0[1] + MARKS()[k] * sc, y2: ys[i] + H + 4, stroke: L.C.ink, 'stroke-width': 4 })));
      }
      // the stick on the right, above the posts
      this.stick = L.woodRect(svg, X0[1], 330, LEN, 22);
      this.smarks = sel.map((k) => el2(svg, 'line', { x1: X0[1] + MARKS()[k] * sc, y1: 326, x2: X0[1] + MARKS()[k] * sc, y2: 356, stroke: L.C.ink, 'stroke-width': 4 }));
      this.guides = sel.map((k) => el2(svg, 'line', { x1: X0[1] + MARKS()[k] * sc, y1: 356, x2: X0[1] + MARKS()[k] * sc, y2: ys[3] + H + 6, stroke: L.C.ghost, 'stroke-width': 2, 'stroke-dasharray': '6 6' }));
      this.stickLbl = L.text('one stick', { x: X0[1] + LEN - 160, y: 276, size: 36, cls: 'soft' });
      // tape: case + blade + hook, drawn simply
      this.tape = el2(svg, 'g', {});
      this.blade = el2(this.tape, 'rect', { x: 0, y: -10, width: 10, height: 20, fill: '#D8CBB0', stroke: L.C.ink, 'stroke-width': 1.5 });
      el2(this.tape, 'rect', { x: -12, y: -14, width: 8, height: 28, fill: L.C.ink });               // hook on the end
      this.tcase = el2(this.tape, 'rect', { x: 0, y: -34, width: 76, height: 68, rx: 14, fill: '#5E5A55', stroke: L.C.ink, 'stroke-width': 2 });
      this.exag = L.text('differences between pieces drawn 20× larger', { x: X0[0], y: 850, size: 36, cls: 'soft' });
      this.ok = el2(svg, 'g', {}); this.ok.innerHTML = L.CHECK_ICON(X0[1] + LEN + 40, ys[1] + H + 30, 48);
      this.okl = L.text('all four agree', { x: X0[1] + LEN - 210, y: 850, size: 36 });
    },
    frame(t, sh) {
      const e = sh.ev, X0 = this.X0, sc = this.sc, ys = this.ys, LEN = 700;
      // left: the tape visits post 0 (slow, word-synced), then posts 1-3 quickly
      const visits = [[e.hook, e.read, e.mark, e.next1], [e.next1 + 0.3, e.next1 + 0.8, e.next1 + 1.2, e.next2], [e.next2 + 0.3, e.next2 + 0.7, e.next2 + 1.0, e.next2 + 1.5], [e.next2 + 1.6, e.next2 + 2.0, e.next2 + 2.3, e.next2 + 2.8]];
      let tp = null;
      visits.forEach((v, i) => {
        const shown = t >= v[2];
        this.lmarks[i].forEach((m, j) => L.show(m, t >= v[2] + j * 0.12 ? 1 : 0));
        if (t >= v[0] - 0.4 && t < v[3] + 0.2) tp = { i, ext: L.ramp(t, v[1] - 0.3, v[1] + 0.3) * (1 - L.ramp(t, v[3] - 0.15, v[3] + 0.2)), a: L.fade(t, v[0] - 0.4, v[3] + 0.2, 0.25) };
        void shown;
      });
      if (tp) {
        const len = 10 + tp.ext * (MARKS()[4] * sc + 6);
        this.blade.setAttribute('width', len); this.tcase.setAttribute('x', len);
        this.tape.setAttribute('transform', `translate(${X0[0]},${ys[tp.i] + 23})`); L.show(this.tape, tp.a);
      } else L.show(this.tape, 0);
      L.show(this.exag, L.ramp(t, e.next2 + 2.4, e.next2 + 2.9));
      // right: idle until N04; then stick marks, guides drop, copies appear on all four together
      const rA = L.ramp(t, e.once - 1.5, e.once - 0.8);
      L.show(this.hR, 0.85 + 0.15 * rA); this.posts.slice(4).forEach((r) => r.setAttribute('opacity', 0.35 + 0.65 * rA));
      L.show(this.hL, 1 - 0.15 * rA); this.posts.slice(0, 4).forEach((r) => r.setAttribute('opacity', 1 - 0.3 * rA));
      this.lmarks.flat().forEach((m) => m.setAttribute('opacity', 1 - 0.2 * rA));
      L.show(this.stick, L.ramp(t, e.once - 0.8, e.once)); L.show(this.stickLbl, L.ramp(t, e.once - 0.4, e.once + 0.2));
      this.smarks.forEach((m, j) => L.show(m, L.ramp(t, e.once + j * 0.15, e.once + 0.2 + j * 0.15)));
      this.guides.forEach((g) => L.show(g, L.ramp(t, e.copy - 0.3, e.copy + 0.2)));
      this.rmarks.forEach((arr, i) => arr.forEach((m) => L.show(m, L.ramp(t, e.copy + 0.25 + i * 0.35, e.copy + 0.35 + i * 0.35))));
      L.show(this.ok, L.ramp(t, e.every + 0.2, e.every + 0.6)); L.show(this.okl, L.ramp(t, e.every + 0.2, e.every + 0.6));
      return {};
    },
  },
  S05: {
    build() {
      getLayout();
      this.lab = L.label({ romaji: 'sumitsuke', kanji: '墨付け', gloss: 'layout marking: drawing the lines in ink', x: 96, y: 880 });
      // a full-width line across the face (no stick in this shot)
      const S = getLayout(), p = P(); this.grp = new THREE.Group(); this.grp.rotation.y = Math.PI / 2;
      this.grp.position.set(MARKS()[2], YT + 0.5, ZS(0) + p.POST / 2); this.line = L.inkLine(p.POST, 5); this.line.rotation.x = -Math.PI / 2; this.grp.add(this.line); S.s.add(this.grp); (S.extras ||= []).push(this.grp);
    },
    frame(t, sh) {
      const S = getLayout(), e = sh.ev; layoutReset(S, { posts: 1, centres: true, postMarks: [0, 0, 0, 0] });
      placeStick(S, 0, 0, 2000); S.stick.visible = false;
      // one line drawn across post 0 at the rail mark, pen visibly drawing it
      const k = L.ramp(t, e.draw - 0.2, e.draw + 0.9), x = MARKS()[2], p = P();
      this.grp.visible = true; L.setProgress(this.line, k);
      const zA = ZS(0) + p.POST / 2, zB = ZS(0) - p.POST / 2;
      posePen(S, x, YT + 0.5, L.lerp(zA, zB, k), L.fade(t, e.draw - 0.6, e.draw + 1.6, 0.3));
      poseSquare(S, x, YT, ZS(0) + p.POST / 2, 1); S.sq.visible = t > e.draw - 0.8 && t < e.draw + 1.8;
      L.show(this.lab, L.ramp(t, e.term, e.term + 0.5));
      const cam = L.camera('threeQ', [x + 120, YT - 20, ZS(0) + 160], 1100, { orbit: 0.55 });
      return { scene: S.s, camera: cam };
    },
  },

  // ---------- 3. reference first ----------
  S06: {
    build() {
      const svg = L.svgLayer(); this.svg = svg; const s = 3.0;
      this.A = endSection(svg, 560, 560, 105 * s, 3); this.B = endSection(svg, 1300, 560, 99 * s, 5);
      this.la = L.text(mm(105), { x: 560, y: 760, size: 40, align: 'center' });
      this.lb = L.text(mm(99), { x: 1300, y: 760, size: 40, align: 'center' });
      this.hd = L.text('Real timber: never quite the drawing size', { x: 96, y: 90, size: 48 }); this.hd.style.fontWeight = 700;
      this.sq = L.text('not quite square <span class="soft">(exaggerated)</span>', { x: 1300, y: 830, size: 36, align: 'center' });
      this.mv = L.text('shrinks and moves as it dries <span class="soft">(exaggerated)</span>', { x: 960, y: 900, size: 36, align: 'center' });
      this.ghostA = el2(svg, 'rect', { x: 560 - 157.5, y: 560 - 157.5, width: 315, height: 315, fill: 'none', stroke: L.C.ghost, 'stroke-width': 3, 'stroke-dasharray': '10 8' });
      this.ghostB = el2(svg, 'rect', { x: 1300 - 148.5, y: 560 - 148.5, width: 297, height: 297, fill: 'none', stroke: L.C.ghost, 'stroke-width': 3, 'stroke-dasharray': '10 8' });
    },
    frame(t, sh) {
      const e = sh.ev;
      L.show(this.hd, L.ramp(t, 0.1, 0.6));
      L.show(this.A.g, L.ramp(t, e.sizes - 0.3, e.sizes + 0.3)); L.show(this.B.g, L.ramp(t, e.thinner - 1.2, e.thinner - 0.6));
      L.show(this.la, L.ramp(t, e.thinner - 0.6, e.thinner)); L.show(this.lb, L.ramp(t, e.thinner - 0.3, e.thinner + 0.2));
      const sk = 4 * L.ramp(t, e.square - 0.3, e.square + 0.5);
      this.B.g.setAttribute('transform', `translate(1300,560) skewX(${sk})`);
      L.show(this.sq, L.ramp(t, e.square, e.square + 0.4));
      const sh2 = 1 - 0.045 * L.ramp(t, e.moves, e.moves + 1.2);
      this.A.g.setAttribute('transform', `translate(560,560) scale(${sh2},${1 - 0.02 * L.ramp(t, e.moves, e.moves + 1.2)})`);
      this.B.g.setAttribute('transform', `translate(1300,560) skewX(${sk}) scale(${sh2},${1 - 0.02 * L.ramp(t, e.moves, e.moves + 1.2)})`);
      const gA = L.ramp(t, e.moves, e.moves + 0.4); L.show(this.ghostA, gA); L.show(this.ghostB, gA); L.show(this.mv, gA);
      return {};
    },
  },
  S07: {
    build() {
      const svg = L.svgLayer(), s = 2.0, X = 4, sizes = [105, 99, 105, 102], cx = [720, 1010, 1300, 1590];
      // display size = 105 + (true - 105) * X : differences drawn 4x larger (labelled)
      const D = sizes.map((v) => (105 + (v - 105) * X) * s);
      this.parts = { A: [], B: [] };
      const panel = (key, yLine, mode) => {
        const g = el2(svg, 'g', {});
        const items = sizes.map((v, i) => {
          const d = D[i], x0 = cx[i] - d / 2;
          const y0 = mode === 'edge' ? yLine + 52.5 * s - d : yLine - d / 2;   // edge: front faces flush; centre: centred on the line
          const r = L.woodRect(g, x0, y0, d, d, { vertical: true });
          // dot = the post's actual middle. Face panel: front faces flush, so a thin post's middle sits off the plan line.
          const jy = y0 + d / 2;
          const jm = el2(g, 'g', {}); jm.innerHTML = `<circle cx="${cx[i]}" cy="${jy}" r="11" fill="${L.C.ink}"/>`;
          const miss = Math.abs(jy - yLine) > 1;
          const ic = el2(g, 'g', {}); ic.innerHTML = miss ? L.X_ICON(cx[i] + d / 2 + 34, jy, 40) : L.CHECK_ICON(cx[i] + d / 2 + 34, yLine, 40);
          let off = null;
          if (miss) { off = L.text(`middle ${((105 - v) / 2).toFixed(1)} mm off`, { x: cx[i], y: y0 + d + 12, size: 36, cls: 'acc', align: 'center' }); }
          return { r, jm, ic, off, y0, d, i };
        });
        // face panel: the plan's line is shown as a plain ghost line; only the struck center line gets the dash-dot encoding
        const ln = mode === 'edge' ? el2(g, 'line', { x1: 560, y1: yLine, x2: 1780, y2: yLine, stroke: L.C.ghost, 'stroke-width': 3 })
          : el2(g, 'line', { x1: 560, y1: yLine, x2: 1780, y2: yLine, stroke: L.C.ink, 'stroke-width': 3, 'stroke-dasharray': '30 9 6 9' });
        return { g, items, ln };
      };
      this.A = panel('A', 330, 'edge'); this.B = panel('B', 790, 'centre');
      this.tA = L.label({ gloss: '', x: 96, y: 250 }); this.tA.innerHTML = '<div class="term" style="font-size:44px">From a face</div><div class="gloss">front faces<br>lined up</div>';
      this.planL = L.text('<span style="color:#7D8EA0">━━</span> line on the plan', { x: 96, y: 410, size: 36, cls: 'soft' });
      this.front = L.text('front faces: lined up', { x: 1150, y: 330 + 105 + 70, size: 36, cls: 'soft', align: 'center' });
      this.tB = L.label({ gloss: '', x: 96, y: 640 }); this.tB.innerHTML = '<div class="term" style="font-size:44px">From the<br>center line</div>';
      this.term = L.label({ romaji: 'shinzumi', kanji: '芯墨', gloss: 'center line ink', x: 96, y: 790 });
      this.pile = L.text('back faces: the whole difference lands here', { x: 1150, y: 150, size: 36, cls: 'soft', align: 'center' });
      this.split = L.text('difference split: half to each side', { x: 1150, y: 960, size: 36, cls: 'soft', align: 'center' });
      this.ex = L.text('plan view · size differences drawn 4× larger', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const e = sh.ev;
      L.show(this.ex, L.ramp(t, 0.2, 0.7));
      L.show(this.tA, L.ramp(t, e.edge - 0.6, e.edge)); L.show(this.A.g, L.ramp(t, e.edge - 0.6, e.edge));
      this.A.items.forEach((it) => { L.show(it.jm, L.ramp(t, e.off - 0.2 + it.i * 0.15, e.off + 0.1 + it.i * 0.15)); L.show(it.ic, L.ramp(t, e.off + 0.6 + it.i * 0.15, e.off + 0.9 + it.i * 0.15)); L.show(it.off, L.ramp(t, e.off + 0.7, e.off + 1.1)); });
      L.show(this.pile, L.ramp(t, e.piles - 0.2, e.piles + 0.3)); L.show(this.front, L.ramp(t, e.edge, e.edge + 0.4)); L.show(this.planL, L.ramp(t, e.off - 0.5, e.off));
      L.show(this.A.ln, L.ramp(t, e.off - 0.5, e.off));
      // centre panel: line struck first, then posts settle onto it
      L.show(this.tB, L.ramp(t, e.center - 0.5, e.center)); L.show(this.B.g, L.ramp(t, e.center - 0.5, e.center));
      const kLine = L.ramp(t, e.strike - 0.2, e.strike + 0.4);
      this.B.ln.setAttribute('x2', 560 + 1220 * kLine);
      L.show(this.term, L.ramp(t, e.term - 0.2, e.term + 0.3));
      this.B.items.forEach((it) => {
        const a = L.ramp(t, e.line - 0.3 + it.i * 0.1, e.line + 0.3 + it.i * 0.1);
        L.show(it.r, 0.25 + 0.75 * a); L.show(it.jm, L.ramp(t, e.splits - 0.2, e.splits + 0.2)); L.show(it.ic, L.ramp(t, e.inline - 0.2 + it.i * 0.12, e.inline + 0.1 + it.i * 0.12));
      });
      L.show(this.split, L.ramp(t, e.splits, e.splits + 0.4));
      return {};
    },
  },
  S08: {
    build() {
      getLayout();
      this.lab = L.label({ gloss: '', x: 96, y: 790 });
      this.lab.innerHTML = '<div class="term">center line: drawn dash-dot in this series</div><div class="gloss">on real timber it is one solid ink line</div>';
    },
    frame(t, sh) {
      const S = getLayout(), e = sh.ev, p = P(); layoutReset(S, { posts: 1 });
      S.stick.visible = false;
      const k = L.ramp(t, e.draw - 0.3, e.draw + 2.2);
      L.setGroupProgress(S.centres[0], k);
      const x = p.POST_LEN * k; posePen(S, Math.min(x, 1800) , YT + 0.5, ZS(0), L.fade(t, e.draw - 0.6, e.draw + 2.6, 0.3), 0.2);
      L.show(this.lab, L.ramp(t, e.symbol - 0.3, e.symbol + 0.3));
      const cam = L.cameraBlend(['threeQ', [700, YT, ZS(0)], 1500, { orbit: 0.5 }], ['threeQ', [1100, YT, ZS(0)], 1900, { orbit: 0.42 }], L.ramp(t, 0, e.draw + 2.2));
      return { scene: S.s, camera: cam };
    },
  },

  // ---------- 4. the story stick ----------
  S09: {
    build() {
      getLayout();
      this.lab = L.text('story stick: a plain batten, the length of the post', { x: 960, y: 900, size: 40, align: 'center' });
      this.dim = L.text(`${mm(P().POST_LEN)}`, { x: 960, y: 960, size: 36, align: 'center', cls: 'soft' });
    },
    frame(t, sh) {
      const S = getLayout(), e = sh.ev; layoutReset(S, { posts: 1, stickMarks: 0, notes: 0 });
      // stick slides in from the near side and settles on the post's top face, ends flush at the bottom end
      const k = L.ramp(t, e.stick - 0.4, e.flush + 0.45);
      S.stick.visible = true; placeStick(S, 0, 60 * (1 - L.ramp(t, e.flush - 0.2, e.flush + 0.45)), 500 * (1 - k));
      L.show(this.lab, L.ramp(t, e.stick, e.stick + 0.5)); L.show(this.dim, L.ramp(t, e.flush + 0.4, e.flush + 0.9));
      const cam = L.camera('threeQ', [1350, YT, ZS(0)], 4600, { orbit: 0.28 + 0.06 * L.lin(t, 0, sh.end - sh.start) });
      return { scene: S.s, camera: cam };
    },
  },
  S10: {
    build() {
      getLayout();
      this.labels = G.marks.map((m) => L.label({ gloss: '', x: 0, y: 0, size: 36 }));
      this.labels.forEach((d, k) => { d.innerHTML = `<div class="term">${G.marks[k].note}</div><div class="gloss">${['bottom end', 'top of sill', 'rail bottom', 'rail top', 'beam underside', 'top end'][k]} · ${MARKS()[k]} mm</div>`; });
      this.tools = L.text('marking tools: Episode 2', { x: 1824, y: 980, size: 36, align: 'right', cls: 'soft' });
      const svg = L.svgLayer(); this.leaders = G.marks.map(() => el2(svg, 'line', { stroke: L.C.ink, 'stroke-width': 2 }));
    },
    frame(t, sh) {
      const S = getLayout(), e = sh.ev, p = P();
      const marksDone = [0, 1, 2, 3, 4, 5].map((k) => L.ramp(t, e['m' + k], e['m' + k] + 0.6));
      layoutReset(S, { posts: 0, stickMarks: 0, notes: 0, centres: false });
      S.stick.visible = true; placeStick(S, -1);
      S.stickMarks.forEach((m, k) => L.setProgress(m, marksDone[k]));
      S.stickNotes.forEach((n, k) => { n.visible = t > e['m' + k] + 0.65; });
      // which mark is being worked on
      let cur = 0; for (let k = 0; k < 6; k++) if (t >= e['m' + k] - 0.9) cur = k;
      const sz = S.stick.position.z, sy = S.stick.position.y + p.STICK_T;
      const kk = marksDone[cur];
      const working = t < e['m5'] + 1.2;
      posePen(S, MARKS()[cur], sy + 0.5, L.lerp(sz, sz - p.STICK_W, kk), working ? L.fade(t, e.m0 - 0.6, e.m5 + 1.2, 0.3) : 0, 0.35);
      poseSquare(S, MARKS()[cur], sy - 0.5, sz, working ? 1 : 0); S.sq.visible = working && t > e.m0 - 0.8;
      // camera: close top view tracking the current mark (eased moves between marks), then pull back to the whole stick
      const xs = MARKS().map((x) => Math.min(Math.max(x, 140), p.POST_LEN - 140));
      let cx = xs[0]; for (let k = 1; k < 6; k++) cx = L.lerp(cx, xs[k], L.ramp(t, e['m' + k] - 0.9, e['m' + k] - 0.1));
      const pull = L.ramp(t, e.pull - 0.2, e.pull + 2.0);
      const near = ['top', [cx, sy, sz - 22], 700, { lift: 0 }], far = ['top', [1350, sy, sz - 22], 4300, {}];
      const cam = L.cameraBlend(near, far, pull);
      // labels: in the pulled-back study hold, every mark labelled with its note and position
      this.labels.forEach((d, k) => { const a = L.ramp(t, e.pull + 1.6 + k * 0.15, e.pull + 2.0 + k * 0.15); L.show(d, a); if (a > 0) { anchor(d, cam, [MARKS()[k], sy, sz - 22], 0, [-300, 70, -300, 70, -300, 70][k]); d.style.transform = k >= 4 ? 'translateX(-100%)' : (k >= 2 ? 'translateX(-50%)' : ''); } });
      this.leaders.forEach((ln, k) => { const a = L.ramp(t, e.pull + 1.6 + k * 0.15, e.pull + 2.0 + k * 0.15); L.show(ln, a); if (a > 0) { const [x, y] = L.toScreen(cam, [MARKS()[k], sy, sz - 22]); const dir = k % 2 ? 1 : -1; ln.setAttribute('x1', x); ln.setAttribute('x2', x); ln.setAttribute('y1', y + dir * 18); ln.setAttribute('y2', y + dir * (k % 2 ? 66 : 196)); } });
      L.show(this.tools, L.fade(t, e.pull, sh.end - sh.start, 0.4));
      return { scene: S.s, camera: cam };
    },
  },
  S11: {
    fadeOut: 0.5,
    build() {
      getLayout();
      this.lab = L.text('same stick, same lines', { x: 96, y: 60, size: 40 });
      this.cnt = L.text('', { x: 1824, y: 60, size: 40, align: 'right' });
    },
    frame(t, sh) {
      const S = getLayout(), e = sh.ev, p = P();
      const prog = [0, 1, 2, 3].map((i) => (t < e['mk' + i + '_0'] ? 0 : [0, 1, 2, 3, 4, 5].reduce((a, k) => a + L.ramp(t, e[`mk${i}_${k}`], e[`mk${i}_${k}`] + 0.3), 0)));
      layoutReset(S, { posts: 4, postMarks: prog });
      // where is the stick? on post i between place_i and lift_i (+ move), otherwise in transit
      let si = 0; for (let i = 0; i < 4; i++) if (t >= e['place' + i]) si = i;
      const tPlace = e['place' + si], tLift = e['lift' + si];
      const fromZ = si === 0 ? ZS(0) + p.POST / 2 + 600 : ZS(si - 1) + p.POST / 2;
      const kIn = L.ramp(t, tPlace, tPlace + 0.55), kOut = L.ramp(t, tLift, tLift + 0.5);
      S.stick.visible = true;
      if (t < tLift) S.stick.position.set(0, YT + 80 * (1 - kIn), L.lerp(fromZ, ZS(si) + p.POST / 2, kIn));
      else if (si < 3) S.stick.position.set(0, YT + 80 * kOut, ZS(si) + p.POST / 2);
      else { // after the last post: the stick is set down on the bench in front, so all four posts are clear for study
        const kAway = L.ramp(t, tLift, tLift + 1.0);
        S.stick.position.set(0, L.lerp(YT, 0, kAway) + 120 * Math.sin(Math.PI * kAway), L.lerp(ZS(3) + p.POST / 2, ZS(0) + 330, kAway));
      }
      const h0 = sh.holds[0][0];
      S.guides.forEach((g) => { g.visible = t > h0 - 0.4; g.material.opacity = 0.55 * L.ramp(t, h0 - 0.4, h0); });
      // the pen + square carry the current line
      let cur = -1; for (let k = 0; k < 6; k++) if (t >= e[`mk${si}_${k}`] - 0.05) cur = k;
      const kk = cur >= 0 ? L.ramp(t, e[`mk${si}_${cur}`], e[`mk${si}_${cur}`] + 0.3) : 0;
      const active = cur >= 0 && t < e['lift' + si];
      const zA = ZS(si) + p.POST / 2 - p.STICK_W, zB = ZS(si) - p.POST / 2;
      if (active) { posePen(S, MARKS()[cur], YT + 0.5, L.lerp(zA, zB, kk), 1, 0.35); poseSquare(S, MARKS()[cur], YT, ZS(si) + p.POST / 2, 1); }
      const n = prog.filter((v) => v >= 6).length; this.cnt.innerHTML = `posts marked: ${n} / 4`;
      L.show(this.cnt, L.ramp(t, 0.3, 0.8)); L.show(this.lab, L.ramp(t, e.place1 - 0.2, e.place1 + 0.4));
      // camera tightens before the hold, then holds still for study
      const kc = L.ramp(t, sh.holds[0][0] - 1.4, sh.holds[0][0] - 0.1);
      const wide = L.camera('threeQ', [L.lerp(1350, 1300, kc), YT, L.lerp(-480, -380, kc)], L.lerp(4700, 5300, kc), { orbit: 0.18, lift: L.lerp(0.15, 0.3, kc) });
      // post 1: a close camera follows the tool from mark to mark, then eases out to the wide view
      let fx = Math.max(MARKS()[0], 350); for (let k = 1; k < 6; k++) fx = L.lerp(fx, Math.min(Math.max(MARKS()[k], 350), 2350), L.ramp(t, e['mk0_' + k] - 0.55, e['mk0_' + k] - 0.05));
      const kw = L.ramp(t, e.lift0 + 0.1, e.lift0 + 1.3);
      const close = ['threeQ', [fx, YT, ZS(0)], 1700, { orbit: 0.35, lift: 0.25 }];
      const cam = kw >= 1 ? wide : L.cameraBlend(close, ['threeQ', [1350, YT, -480], 4700, { orbit: 0.18, lift: 0.15 }], kw);
      return { scene: S.s, camera: cam };
    },
  },
  S12: {
    build() {
      const svg = L.svgLayer(), p = P(), x0 = 330, LEN = 1240, sc = LEN / p.POST_LEN, X = p.EXAGGERATE;
      this.x0 = x0; this.sc = sc;
      const rowsT = [220, 290, 360, 430], rowsS = [650, 720, 790, 860], H = 34;
      this.hT = L.text('Tape, worst case: each mark measured from the last', { x: 96, y: 130, size: 44 }); this.hT.style.fontWeight = 700;
      this.hS = L.text('Story stick: each mark copied', { x: 96, y: 560, size: 44 }); this.hS.style.fontWeight = 700;
      this.warn = L.text('error drawn 20× larger for visibility', { x: 1824, y: 60, size: 36, align: 'right', cls: 'soft' });
      this.colT = L.text('top-end drift', { x: x0 + LEN + 30, y: 176, size: 36, cls: 'soft' });
      this.T = el2(svg, 'g', {}); this.S = el2(svg, 'g', {});
      // design positions = the stick: thin ghost guides through both blocks
      this.guides = MARKS().map((m) => { const gg = el2(svg, 'g', {}); [[204, 474], [636, 900]].forEach(([a, b]) => el2(gg, 'line', { x1: x0 + m * sc, y1: a, x2: x0 + m * sc, y2: b, stroke: L.C.ghost, 'stroke-width': 2, 'stroke-dasharray': '5 7' })); return gg; });
      const drawRows = (g, rows, pos, tag) => rows.map((y, i) => {
        const r = L.woodRect(g, x0, y, LEN, H);
        L.text(`post ${i + 1}`, { x: x0 - 24, y: y - 4, size: 36, align: 'right' });
        const ticks = pos[i].map((v, k) => el2(g, 'line', { x1: x0 + (MARKS()[k] + (v - MARKS()[k]) * X) * sc, y1: y - 6, x2: x0 + (MARKS()[k] + (v - MARKS()[k]) * X) * sc, y2: y + H + 6, stroke: L.C.ink, 'stroke-width': 4 }));
        return { r, ticks, y, tag };
      });
      this.rowsT = drawRows(this.T, rowsT, G.tape_marks, 't'); this.rowsS = drawRows(this.S, rowsS, G.post_marks, 's');
      // numbers at the top end: actual (not exaggerated) drift per post, and the spread between posts
      const top = G.tape_marks.map((v) => v[5] - MARKS()[5]); const spread = Math.max(...top) - Math.min(...top);
      this.numsT = rowsT.map((y, i) => L.text(`${top[i] >= 0 ? '+' : '−'}${Math.abs(top[i]).toFixed(1)} mm`, { x: x0 + LEN + 30, y: y - 6, size: 36 }));
      this.numsS = rowsS.map((y) => L.text('0.0 mm', { x: x0 + LEN + 30, y: y - 6, size: 36 }));
      this.sprT = L.text(`spread between posts at the top: ${spread.toFixed(1)} mm`, { x: x0 + 56, y: 478, size: 36, cls: 'acc' });
      this.icT = el2(svg, 'g', {}); this.icT.innerHTML = L.X_ICON(x0 + 20, 478 + 24, 40);
      this.sprS = L.text('spread between posts: 0.0 mm', { x: x0 + 56, y: 908, size: 36 });
      this.icS = el2(svg, 'g', {}); this.icS.innerHTML = L.CHECK_ICON(x0 + 20, 908 + 24, 40);
      this.note = L.text('drift relative to the story-stick positions (dashed)', { x: x0, y: 990, size: 36, cls: 'soft' });
    },
    frame(t, sh) {
      const e = sh.ev;
      L.show(this.hT, L.ramp(t, e.tape - 0.4, e.tape + 0.1)); L.show(this.T, L.ramp(t, e.tape - 0.4, e.tape + 0.1));
      this.guides.forEach((g) => L.show(g, L.ramp(t, e.tape, e.tape + 0.5)));
      // tape ticks appear one by one along each post (drift growing along the run), all posts in turn
      this.rowsT.forEach((r, i) => r.ticks.forEach((tk, k) => L.show(tk, L.ramp(t, e.err + i * 0.9 + k * 0.13, e.err + i * 0.9 + k * 0.13 + 0.12))));
      L.show(this.warn, L.ramp(t, e.x20 - 0.3, e.x20 + 0.2)); L.show(this.colT, L.ramp(t, e.adds - 0.3, e.adds));
      this.numsT.forEach((n, i) => L.show(n, L.ramp(t, e.adds + i * 0.3, e.adds + 0.3 + i * 0.3)));
      L.show(this.sprT, L.ramp(t, e.every, e.every + 0.4)); L.show(this.icT, L.ramp(t, e.every, e.every + 0.4));
      L.show(this.hS, L.ramp(t, e.stick - 0.5, e.stick)); L.show(this.S, L.ramp(t, e.stick - 0.5, e.stick));
      this.rowsS.forEach((r, i) => r.ticks.forEach((tk) => L.show(tk, L.ramp(t, e.stick + 0.2 + i * 0.25, e.stick + 0.4 + i * 0.25))));
      this.numsS.forEach((n, i) => L.show(n, L.ramp(t, e.none - 0.2 + i * 0.1, e.none + 0.2 + i * 0.1)));
      L.show(this.sprS, L.ramp(t, e.none + 0.3, e.none + 0.7)); L.show(this.icS, L.ramp(t, e.none + 0.3, e.none + 0.7));
      L.show(this.note, L.ramp(t, e.none + 1.0, e.none + 1.4));
      return {};
    },
  },
  S13: {
    build() {
      const svg = L.svgLayer(), p = P(), x0 = 330, LEN = 1380, sc = LEN / p.POST_LEN, off = 1.0 * p.EXAGGERATE * sc; // 1 mm, drawn x20
      this.off = off;
      this.hd = L.text('If the stick is 1 mm off the drawing…', { x: 96, y: 60, size: 44 }); this.hd.style.fontWeight = 700;
      this.ex = L.text('offset drawn 20× larger', { x: 1824, y: 66, size: 36, cls: 'soft', align: 'right' });
      this.g = el2(svg, 'g', {});
      this.draw = MARKS().map((m) => el2(this.g, 'line', { x1: x0 + m * sc, y1: 200, x2: x0 + m * sc, y2: 560, stroke: L.C.ghost, 'stroke-width': 2, 'stroke-dasharray': '5 7' }));
      this.dl = L.text('positions on the drawing (dashed)', { x: x0 + MARKS()[2] * sc - 12, y: 140, size: 36, cls: 'soft', align: 'center' });
      this.moving = el2(this.g, 'g', {});
      L.woodRect(this.moving, x0, 210, LEN, 20); L.text('stick', { x: x0 - 24, y: 196, size: 36, align: 'right' });
      MARKS().forEach((m) => el2(this.moving, 'line', { x1: x0 + m * sc, y1: 206, x2: x0 + m * sc, y2: 234, stroke: L.C.ink, 'stroke-width': 4 }));
      [290, 350, 410, 470].forEach((y, i) => { L.woodRect(this.moving, x0, y, LEN, 30); L.text(`post ${i + 1}`, { x: x0 - 24, y: y - 6, size: 36, align: 'right' }); MARKS().forEach((m) => el2(this.moving, 'line', { x1: x0 + m * sc, y1: y - 5, x2: x0 + m * sc, y2: y + 35, stroke: L.C.ink, 'stroke-width': 4 })); });
      this.tg = L.text('…all four posts are 1 mm off, together.', { x: 96, y: 590, size: 40 });
      this.k1 = L.text('Not more <i>accurate</i>.', { x: 960, y: 700, size: 56, align: 'center', cls: 'soft' });
      this.k2 = L.text('Identical.', { x: 960, y: 780, size: 84, align: 'center' }); this.k2.style.fontWeight = 700;
      this.k3 = L.text('A joint only cares that its two pieces agree.', { x: 960, y: 920, size: 44, align: 'center' });
    },
    frame(t, sh) {
      const e = sh.ev;
      L.show(this.hd, L.ramp(t, e.off - 0.3, e.off + 0.2)); L.show(this.g, L.ramp(t, e.off - 0.3, e.off + 0.2)); L.show(this.dl, L.ramp(t, e.off, e.off + 0.3));
      const k = L.ramp(t, e.off + 1.0, e.together - 0.2); this.moving.setAttribute('transform', `translate(${this.off * k},0)`);
      L.show(this.ex, L.ramp(t, e.off + 1.0, e.off + 1.4)); L.show(this.tg, L.ramp(t, e.together - 0.4, e.together + 0.1));
      L.show(this.k1, L.ramp(t, e.acc - 0.3, e.acc + 0.2)); L.show(this.k2, L.ramp(t, e.ident - 0.2, e.ident + 0.3)); L.show(this.k3, L.ramp(t, e.joint - 0.2, e.joint + 0.3));
      return {};
    },
  },
  S14: {
    build() {
      getLayout();
      this.lab = L.label({ romaji: 'bakabō', kanji: '馬鹿棒', gloss: 'shop nickname for the story stick; literally "fool\'s stick"', x: 96, y: 96 });
      this.ex = L.text('the usual explanation: anyone gets the same length, every time', { x: 96, y: 210, size: 36, cls: 'soft' });
    },
    frame(t, sh) {
      const S = getLayout(), e = sh.ev; layoutReset(S, { posts: 0, centres: false }); S.stick.visible = true; placeStick(S, -1);
      L.show(this.lab, L.ramp(t, e.term - 0.2, e.term + 0.3)); L.show(this.ex, L.ramp(t, e.expl - 0.2, e.expl + 0.3));
      const cam = L.camera('threeQ', [L.lerp(500, 1300, L.lin(t, 0, sh.end - sh.start)), S.stick.position.y, S.stick.position.z - 260], 1300, { orbit: 0.25, lift: 0.25 });
      return { scene: S.s, camera: cam };
    },
  },

  // ---------- 5. looking ahead ----------
  S15: {
    build() {
      const F = getFrame(), p = P();
      // the height stick standing beside post 1; ghosted length sticks along sill and beam
      if (!F.extra) {
        const st = L.memberMesh(L.boxMember('hstick', [G.x_posts[0] - p.POST / 2 - 160, G.y_post0, p.POST / 2 + 40, p.STICK_W, p.POST_LEN, p.STICK_T], 'y'), { seed: 9, tint: '#FFF6E6' });
        const gs = L.ghostMesh(L.boxMember('ls1', [G.x_posts[0] - 200, 0, p.POST / 2 + 120, G.x_posts[3] + 400, 40, 60], 'x'));
        const gb = L.ghostMesh(L.boxMember('ls2', [G.x_posts[0] - 200, G.y_post0 + p.POST_LEN - p.HOUSING + p.BEAM_H + 60, -30, G.x_posts[3] + 400, 40, 60], 'x'));
        F.s.add(st, gs, gb); F.extra = { st, gs, gb }; [st, gs, gb].forEach((m) => { m.visible = false; });
      }
      this.l1 = L.text('heights: posts', { x: 0, y: 0, size: 40 });
      this.l2 = L.text('lengths along the wall <span class="soft">(ghosted)</span>', { x: 0, y: 0, size: 40 });
    },
    frame(t, sh) {
      const F = getFrame(), e = sh.ev; poseFrame(F, {});
      L.setOpacity(F.extra.st, L.ramp(t, e.heights - 0.4, e.heights + 0.2));
      const g = L.ramp(t, e.lengths - 0.3, e.lengths + 0.3); F.extra.gs.visible = F.extra.gb.visible = g > 0.01; F.extra.gs.material.opacity = F.extra.gb.material.opacity = 0.55 * g;
      const cam = L.camera('threeQ', [1365, 1450, 0], L.lerp(8200, 10400, L.ramp(t, 0, sh.end - sh.start)), { orbit: -0.2 });
      anchor(this.l1, cam, [G.x_posts[0] - 400, G.y_post0 + 1900, 200], -330, 0); L.show(this.l1, L.ramp(t, e.heights, e.heights + 0.4));
      anchor(this.l2, cam, [G.x_posts[2], -60, 200], -200, 40); L.show(this.l2, L.ramp(t, e.lengths, e.lengths + 0.4));
      return { scene: F.s, camera: cam };
    },
  },
  S16: {
    build() {
      const svg = L.svgLayer();
      this.board = el2(svg, 'g', {});
      L.woodRect(this.board, 330, 150, 1260, 560, { vertical: false });
      const gx = (i) => 520 + i * 290, gy = 430;
      el2(this.board, 'line', { x1: 400, y1: gy, x2: 1520, y2: gy, stroke: L.C.ink, 'stroke-width': 3, 'stroke-dasharray': '30 9 6 9' });
      for (let i = 0; i < 4; i++) { el2(this.board, 'rect', { x: gx(i) - 22, y: gy - 22, width: 44, height: 44, fill: 'none', stroke: L.C.ink, 'stroke-width': 4 }); }
      this.hand = [];
      for (let i = 0; i < 4; i++) this.hand.push(L.text(`post ${i + 1}`, { x: gx(i), y: gy + 44, size: 36, align: 'center' }));
      this.hand.push(L.text('sill and beam along this line', { x: 960, y: gy - 96, size: 36, align: 'center' }));
      this.hand.forEach((h) => { h.style.fontFamily = "'Noto Serif CJK JP', serif"; });
      this.lab = L.label({ romaji: 'ita-zu', kanji: '板図', gloss: "the building's plan, drawn on a board", x: 330, y: 740 });
      this.next = L.text('Next: <b>Ep 2</b> The Marking Kit &nbsp;·&nbsp; <b>Ep 3</b> From Plan to Timber', { x: 960, y: 930, size: 40, align: 'center' });
    },
    frame(t, sh) {
      const e = sh.ev;
      L.show(this.board, L.ramp(t, e.board - 0.5, e.board + 0.1));
      this.hand.forEach((h, i) => L.show(h, L.ramp(t, e.board + 0.6 + i * 0.25, e.board + 0.9 + i * 0.25)));
      L.show(this.lab, L.ramp(t, e.term - 0.2, e.term + 0.3)); L.show(this.next, L.ramp(t, e.ep3 - 0.3, e.ep3 + 0.2));
      return {};
    },
  },

  // ---------- 6. recap ----------
  S17: {
    build() {
      const h = L.text('Mark it once. Copy it everywhere.', { x: 96, y: 70, size: 64 }); h.style.fontWeight = 700;
      L.text('Pieces that agree with each other fit, even when they disagree with the tape.', { x: 96, y: 160, size: 40, cls: 'soft' });
      const rows = [
        ['sumitsuke', '墨付け', 'layout marking', 'drawing every line on the timber in ink, before cutting'],
        ['shinzumi', '芯墨', 'center line ink', 'the line down the middle of a member; layout is measured from it'],
        ['bakabō', '馬鹿棒', 'story stick (shop nickname)', 'a plain stick carrying every position, copied to each piece'],
        ['ita-zu', '板図', 'board plan', "the whole building drawn on a board, every piece named"],
      ];
      const g = L.text('', { x: 96, y: 270, size: 36, w: 1728 }); g.innerHTML = '<div class="soft" style="font-size:36px;margin-bottom:18px;letter-spacing:.08em">GLOSSARY · EPISODE 1</div>' + rows.map((r) => `<div style="display:flex;gap:36px;margin-bottom:30px;align-items:baseline"><div style="width:420px;font-weight:700;font-size:40px"><i>${r[0]}</i> <span style="font-family:'Noto Serif CJK JP',serif;font-style:normal">${r[1]}</span></div><div style="width:1230px;white-space:normal"><b>${r[2]}</b> — <span class="soft">${r[3]}</span></div></div>`).join('');
      this.all = [...this.ov?.children || []];
    },
    frame(t) { [...document.querySelectorAll('.shotov')].forEach(() => {}); return {}; },
  },
  S18: {
    fadeOut: 1.0,
    build() { endCard(); },
    frame() { return {}; },
  },
};

// =============== series cards & 2D helpers ===============
function el2(parent, tag, attrs) { return L.el('svg:' + tag, attrs, parent); }
function titleCard(ep, title, sub) {
  const svg = L.svgLayer();
  el2(svg, 'line', { x1: 96, y1: 470, x2: 560, y2: 470, stroke: L.C.ink, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 300, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text(ep.toUpperCase(), { x: 96, y: 370, size: 48 }); b.style.fontWeight = 700; b.style.letterSpacing = '0.12em';
  const c = L.text(title, { x: 96, y: 510, size: 110 }); c.style.fontWeight = 700;
  L.text(sub, { x: 96, y: 650, size: 64, cls: 'soft' });
  // episode emblem slot (right half): Ep 1 shows the marked story stick, drawn from the same mark list
  const x0 = 1060, len = 764, sc = len / P().POST_LEN;
  L.woodRect(svg, x0, 560, len, 34);
  MARKS().forEach((m) => el2(svg, 'line', { x1: x0 + m * sc, y1: 552, x2: x0 + m * sc, y2: 602, stroke: L.C.ink, 'stroke-width': 4 }));
}
function endCard() {
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 330, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('Next · Episode 2', { x: 96, y: 420, size: 48 }); b.style.fontWeight = 700;
  const c = L.text('The Marking Kit', { x: 96, y: 500, size: 96 }); c.style.fontWeight = 700;
  L.text('sashigane, sumitsubo, kebiki — each beside its Western cousin', { x: 96, y: 640, size: 40, cls: 'soft' });
  const svg = L.svgLayer(); el2(svg, 'line', { x1: 96, y1: 740, x2: 560, y2: 740, stroke: L.C.ink, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
}
// end-grain section drawn centred at (0,0) inside a group placed at cx,cy
function endSection(svg, cx, cy, size, seed) {
  const g = el2(svg, 'g', { transform: `translate(${cx},${cy})` });
  el2(g, 'rect', { x: -size / 2, y: -size / 2, width: size, height: size, fill: '#DDBF94', stroke: L.C.ink, 'stroke-width': 3 });
  const ox = (seed % 3 - 1) * size * 0.06, oy = (seed % 2) * size * 0.05;
  const clip = 'c' + seed; const cp = el2(g, 'clipPath', { id: clip }); el2(cp, 'rect', { x: -size / 2, y: -size / 2, width: size, height: size });
  const rings = el2(g, 'g', { 'clip-path': `url(#${clip})` });
  for (let r = size * 0.06; r < size * 0.9; r += size * (0.045 + ((r * 7) % 5) * 0.004)) el2(rings, 'circle', { cx: ox, cy: oy, r, fill: 'none', stroke: 'rgba(150,100,58,0.35)', 'stroke-width': 2 });
  return { g };
}
