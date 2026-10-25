// Episode 8 shots: watari-ago (crossing joint), compared with aigaki (half-lap); where the spec uses it; hardware and the law.
// Joints are the exact, fit-checked solids from params.py. The model follows the dictionary description (KN + JAANUS);
// the spec's roof-beam case is never drawn as a stack (Gate A, R8-37). Depths are illustrative and say so.
let L, THREE, G, TL;
const R = (p) => `/episodes/ep08_watari_ago/${p}`;

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
const INK = '#1B1B1B', ACC = '#B8432F', GHOST = '#7D8EA0', WOOD = '#E6C9A0', WOODD = '#C9A577', STEEL = '#6F757B';
const kj = (s) => `<span style="font-family:'Noto Serif CJK JP',serif;font-style:normal;font-weight:600">${s}</span>`;
function arrow(svg, x1, y1, x2, y2, { color = INK, w = 4, head = 18 } = {}) {
  const g = el2(svg, 'g', {}); const a = Math.atan2(y2 - y1, x2 - x1);
  el2(g, 'line', { x1, y1, x2: x2 - Math.cos(a) * head * 0.8, y2: y2 - Math.sin(a) * head * 0.8, stroke: color, 'stroke-width': w });
  const p = [[x2, y2], [x2 - Math.cos(a - 0.42) * head, y2 - Math.sin(a - 0.42) * head], [x2 - Math.cos(a + 0.42) * head, y2 - Math.sin(a + 0.42) * head]];
  el2(g, 'polygon', { points: p.map((q) => q.join(',')).join(' '), fill: color });
  return g;
}
function xMark(svg, x, y, s = 22) { const g = el2(svg, 'g', {}); el2(g, 'circle', { cx: x, cy: y, r: s, fill: ACC }); el2(g, 'path', { d: `M${x - s * 0.45},${y - s * 0.45} L${x + s * 0.45},${y + s * 0.45} M${x + s * 0.45},${y - s * 0.45} L${x - s * 0.45},${y + s * 0.45}`, stroke: '#fff', 'stroke-width': 4 }); return g; }
const ghostify = (mesh, a = 0.3) => { const m = mesh.material; [].concat(m).forEach((x) => { x.transparent = true; x.opacity = a; x.depthWrite = false; }); return mesh; };
const r = (t, a) => L.ramp(t, a - 0.3, a + 0.3);
const win = (t, a, b) => L.ramp(t, a - 0.3, a + 0.2) * (1 - L.ramp(t, b - 0.3, b));

// ---------- scene ----------
let SC;
function getScene() {
  if (SC) return SC;
  const s = L.makeScene({ shadowBox: 1800, lightDir: [0.45, 1, 0.65] });
  const wa = new THREE.Group(); const low = L.memberMesh(G.watari[0], { seed: 4 }); const upG = new THREE.Group(); const up = L.memberMesh(G.watari[1], { seed: 9, tint: '#EAD3AE' });
  upG.add(up); wa.add(low, upG);
  const gx = ghostify(L.memberMesh(G.watari[1], { seed: 9 })), gz = ghostify(L.memberMesh(G.watari[1], { seed: 9 }));
  wa.add(gx, gz);
  const sec = new THREE.Group(); const sLow = L.memberMesh(G.section[0], { seed: 4 }), sUp = L.memberMesh(G.section[1], { seed: 9, tint: '#EAD3AE' }); sec.add(sLow, sUp);
  const ai = new THREE.Group(); const aLow = L.memberMesh(G.aigaki[0], { seed: 5 }); const aUpG = new THREE.Group(); aUpG.add(L.memberMesh(G.aigaki[1], { seed: 12, tint: '#EAD3AE' })); ai.add(aLow, aUpG);
  s.add(wa, sec, ai);
  SC = { s, wa, upG, up, gx, gz, sec, ai, aUpG };
  return SC;
}
function only(sc, which) {
  sc.wa.visible = which.includes('wa'); sc.sec.visible = which.includes('sec'); sc.ai.visible = which.includes('ai');
  sc.gx.visible = false; sc.gz.visible = false;
  [sc.wa, sc.sec, sc.ai].forEach((g) => { g.position.set(0, 0, 0); g.rotation.set(0, 0, 0); });
  setUp(sc, 0, 0); sc.aUpG.position.set(0, 0, 0);
}
// the upper timber about its own centre (y = MID): lifted by y, turned over by ang about its length axis
const MID = 75;
function setUp(sc, y, ang) { sc.upG.position.set(0, y + MID, 0); sc.up.position.set(0, -MID, 0); sc.upG.rotation.set(0, 0, ang); }

const SHOTS = {
  S01: {
    build() {},
    frame(t, sh) {
      const sc = getScene(), e = sh.ev; only(sc, ['wa']);
      const k = L.ease(L.ramp(t, e.comes, e.comes + 2.0)); setUp(sc, 320 * (1 - k), 0);
      return { scene: sc.s, camera: L.camera('threeQ', [0, 60 + 100 * (1 - k), 0], 1500, { orbit: -0.3 + 0.01 * t, lift: 0.35 }) };
    },
  },
  S02: { fadeIn: 0.5, fadeOut: 0.6, build() { titleCard(); }, frame() { return {}; } },
  S03: {
    build() {
      const svg = L.svgLayer();
      // Episode 5 callback: splice vs joint at an angle (small, top)
      this.a = el2(svg, 'g', {});
      L.woodRect(this.a, 96, 150, 220, 70, { vertical: false }); L.woodRect(this.a, 316, 150, 220, 70, { vertical: false });
      el2(this.a, 'path', { d: 'M316,150 v70', stroke: INK, 'stroke-width': 3, 'stroke-dasharray': '10 6' });
      this.la = L.label({ romaji: 'tsugite', kanji: '継手', gloss: 'a splice, end to end (Episode 5)', x: 96, y: 250 });
      this.b = el2(svg, 'g', {});
      L.woodRect(this.b, 1060, 150, 300, 70, { vertical: false }); L.woodRect(this.b, 1060, 220, 70, 150, { vertical: true });
      el2(this.b, 'path', { d: 'M1060,220 h70', stroke: INK, 'stroke-width': 3, 'stroke-dasharray': '10 6' });
      this.lb = L.label({ romaji: 'shiguchi', kanji: '仕口', gloss: 'timbers meeting at an angle (also read shikuchi)', x: 1160, y: 250 });
      this.lb.style.width = '640px'; this.lb.style.whiteSpace = 'normal';
      this.lw = L.text('the watari-ago is one of these', { x: 1160, y: 400, size: 36, cls: 'soft' });
      // the name, large
      this.big = L.text(`${kj('渡り')}<span style="display:inline-block;width:40px"></span>${kj('腮')}`, { x: 960, y: 520, size: 120, align: 'center' });
      this.g1 = L.text('<i>watari</i> · as an everyday word,<br>can mean "a crossing"', { x: 420, y: 720, size: 40, w: 640 }); this.g1.classList.add('wrap');
      this.g2 = L.text('<i>ago</i> · "jaw"<br><span class="soft">on its own, also read <i>era</i>, "gills"</span>', { x: 1080, y: 720, size: 40, w: 640 }); this.g2.classList.add('wrap');
      this.g3 = L.text(`the Flat 35 house specification writes ${kj('渡りあご')}`, { x: 960, y: 880, size: 40, align: 'center', cls: 'soft' });
      this.q = L.text('Which part is the jaw? Our sources don\'t say.', { x: 960, y: 960, size: 44, align: 'center' }); this.q.style.fontWeight = 700;
    },
    frame(t, sh) {
      const e = sh.ev;
      const a = r(t, e.splice), b = r(t, e.family);
      this.a.setAttribute('opacity', a); L.show(this.la, a); this.b.setAttribute('opacity', b); L.show(this.lb, b); L.show(this.lw, r(t, e.one));
      L.show(this.big, r(t, e.crossing - 0.6)); L.show(this.g1, r(t, e.crossing)); L.show(this.g2, r(t, e.jaw)); L.show(this.g3, r(t, e.kana)); L.show(this.q, r(t, e.jaw2));
      return {};
    },
  },
  S04: {
    build() {
      this.src = L.text('described from a Japanese dictionary (Nihon Kokugo Daijiten) · our model', { x: 96, y: 990, size: 36, cls: 'soft' });
      this.tag = L.text('depths drawn for illustration: no modern specification gives one', { x: 96, y: 990, size: 36, cls: 'plate' });
      this.lg = L.text('groove across the underside', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.lm = L.text('middle left standing', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.lc = L.text('cut away left and right', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.lf = L.text('upper timber shown turned over', { x: 96, y: 70, size: 36, cls: 'plate' });
      this.svg = L.svgLayer(); this.items = [];
      this.lx = L.text('<span class="acc">✕ can\'t slide along either timber</span>', { x: 96, y: 900, size: 40, cls: 'plate' });
      this.lu = L.text('nothing stops it lifting', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.ls = L.text('cut away for the view · seen from the end of the lower timber', { x: 96, y: 70, size: 36, cls: 'plate' });
      this.lr = L.text('raised middle', { x: 0, y: 0, size: 40, cls: 'plate' });
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev, P = G.WA; this.items.forEach((x) => x.remove()); this.items = [];
      const endView = t > e.end - 0.4;
      if (!endView) {
        only(sc, ['wa']);
        const k = L.ease(L.ramp(t, e.comes, e.comes + 1.4)); const flip = 1 - L.ease(L.ramp(t, e.middle + 1.2, e.comes - 0.1));
        setUp(sc, 380 * (1 - k), Math.PI * flip);
        const cam = L.camera('threeQ', [0, 40 + 210 * (1 - k), 0], 1250 + 1050 * (1 - k), { orbit: -0.15, lift: 0.3 + 0.1 * (1 - k) });
        // labels while exploded
        const ex = win(t, e.groove, e.comes);
        anchor(this.lg, cam, [P.W / 2, 380 + 2 * MID + P.CUT, -60], 30, -40); L.show(this.lg, win(t, e.groove, e.middle + 1.2));
        anchor(this.lm, cam, [-60, 0, 0], -380, -60); L.show(this.lm, win(t, e.middle, e.comes));
        anchor(this.lc, cam, [0, -P.CUT / 2, P.W / 2], 20, 40); L.show(this.lc, win(t, e.lower, e.comes)); L.show(this.lf, win(t, e.groove, e.middle + 1.2)); void ex;
        // ghosts trying to slide (fit-checked: locked in X and Z)
        const g = win(t, e.slide, e.lift);
        if (g > 0.01) {
          sc.gx.visible = true; sc.gx.position.set(70, 0, 0); sc.gz.visible = true; sc.gz.position.set(0, 0, 110);
          [sc.gx, sc.gz].forEach((m) => [].concat(m.material).forEach((x) => { x.opacity = 0.3 * g; }));
          const [x1, y1] = L.toScreen(cam, [P.W / 2 + 70, P.H_up - P.CUT + 20, 0]); this.items.push(xMark(this.svg, x1, y1));
          const [x2, y2] = L.toScreen(cam, [0, P.H_up - P.CUT + 20, 260]); this.items.push(xMark(this.svg, x2, y2));
          this.items.forEach((it) => it.setAttribute('opacity', g));
        }
        L.show(this.lx, g);
        const u = win(t, e.lift, e.end);
        if (u > 0.01) {
          const [x, y] = L.toScreen(cam, [0, P.H_up - P.CUT, 0]); const ar = arrow(this.svg, x, y - 10, x, y - 120); ar.setAttribute('opacity', u); this.items.push(ar);
          anchor(this.lu, cam, [0, P.H_up - P.CUT, 0], 30, -110);
        }
        L.show(this.lu, u); L.show(this.ls, 0); L.show(this.lr, 0);
        L.show(this.src, win(t, e.dict, e.deep)); L.show(this.tag, 0);
        return { scene: sc.s, camera: cam };
      }
      // end-on view of the cut-away pair
      only(sc, ['sec']);
      const cam = L.camera('section', [0, -5, 0], 560, { orbit: -0.12, lift: 0.12 });
      L.show(this.lg, 0); L.show(this.lf, 0); L.show(this.lm, 0); L.show(this.lc, 0); L.show(this.lx, 0); L.show(this.lu, 0); L.show(this.src, 0);
      L.show(this.ls, r(t, e.end));
      anchor(this.lr, cam, [0, -P.CUT / 2, P.RIDGE / 2], 120, 120);
      const rr = r(t, e.raised); L.show(this.lr, rr);
      if (rr > 0.01) { const [x0, y0] = L.toScreen(cam, [0, -P.CUT / 2, 0]); const ar = arrow(this.svg, x0 + 130, y0 + 110, x0 + 30, y0 + 15); ar.setAttribute('opacity', rr); this.items.push(ar); }
      L.show(this.tag, r(t, e.deep));
      return { scene: sc.s, camera: cam };
    },
  },
  S05: {
    build() {
      this.la = L.text(`<i>aigaki</i> ${kj('相欠き')} · a half-lap<br><span class="soft">each cut to half its depth · tops flush</span>`, { x: 0, y: 0, size: 40, cls: 'plate' });
      this.lw = L.text('<i>watari-ago</i><br><span class="soft">shallow cuts · different heights<br>the middle locks into the groove</span>', { x: 0, y: 0, size: 40, cls: 'plate' });
      this.src = L.text('used where two timbers cross at slightly different heights (Nihon Kokugo Daijiten) · same model as before', { x: 96, y: 990, size: 36, cls: 'soft' });
    },
    frame(t, sh) {
      const sc = getScene(), e = sh.ev; only(sc, ['wa', 'ai']);
      sc.ai.position.set(-480, 0, 0); sc.wa.position.set(480, 0, 0);
      const k = L.ease(L.ramp(t, e.aigaki, e.flush - 0.2)); sc.aUpG.position.set(0, 220 * (1 - k), 0);
      const cam = L.camera('threeQ', [0, -40, 0], 2450, { orbit: -0.05, lift: 0.22 });
      anchor(this.la, cam, [-480, 0, 0], -300, 150); anchor(this.lw, cam, [480, 0, 0], -300, 150);
      L.show(this.la, r(t, e.half)); L.show(this.lw, r(t, e.shallow)); L.show(this.src, r(t, e.dict));
      return { scene: sc.s, camera: cam };
    },
  },
  S06: {
    build() {
      const h = L.text('Where it\'s used', { x: 96, y: 70, size: 56 }); h.style.fontWeight = 700;
      L.text('Flat 35 house specification, except where marked', { x: 96, y: 150, size: 36, cls: 'soft' });
      const row = (y, html) => { const d = L.text(html, { x: 96, y, size: 40, w: 1700 }); d.classList.add('wrap'); return d; };
      this.r1 = row(250, `roof beam ↔ eaves plate: ${kj('かぶとあり掛け')} <i>kabuto-arikake</i>, a dovetail, or ${kj('渡りあご')} <i>watari-ago</i>`);
      this.r1b = row(320, `<span class="soft">either one fastened with a plate bolt ${kj('羽子板ボルト')}</span>`);
      this.r2 = row(420, `tops to finish flush: ${kj('大入れあり掛け')}, a housed dovetail <span class="soft">· not a crossing joint</span>`);
      this.r3 = row(520, 'second-floor beams resting on another horizontal member');
      this.r4 = row(590, 'log roof beams, where they cross a support <span class="soft">· held with staples</span>');
      this.r5 = row(690, `one traditional framing style, ${kj('京呂組')}: the roof beam set on top of the eaves plate, with this joint or the dovetail <span class="soft">· JAANUS architecture glossary</span>`);
      this.n = L.text('which timber sits on top varies with the use: not drawn here', { x: 96, y: 990, size: 36, cls: 'soft' });
    },
    frame(t, sh) {
      const e = sh.ev;
      L.show(this.r1, r(t, e.roof)); L.show(this.r1b, r(t, e.bolt)); L.show(this.r2, r(t, e.flush)); L.show(this.r3, r(t, e.second)); L.show(this.r4, r(t, e.log)); L.show(this.r5, r(t, e.style)); L.show(this.n, r(t, e.roof + 1.5));
      return {};
    },
  },
  S07: {
    build() {
      const svg = L.svgLayer();
      this.law = L.text('Building Standard Law, Enforcement Order, Art. 47', { x: 96, y: 80, size: 40 }); this.law.style.fontWeight = 700;
      this.law2 = L.text('structurally important joints of a timber frame are to be fastened, with bolts, staples, pegs or another approved method, so they carry their loads', { x: 96, y: 140, size: 36, cls: 'soft', w: 1700 }); this.law2.classList.add('wrap');
      this.pairs = L.text('Flat 35, depending on the use: plate bolt · staples · nails · other bolts', { x: 96, y: 260, size: 40, cls: 'plate' });
      // a generic plate bolt, standalone (F §5.2.2): steel plate with a bolt welded to it; nut and washer
      this.pb = el2(svg, 'g', {}); const px = 300, py = 470;
      el2(this.pb, 'rect', { x: px, y: py, width: 300, height: 60, fill: STEEL, stroke: INK, 'stroke-width': 2, rx: 4 });
      [0, 1, 2].forEach((i) => el2(this.pb, 'circle', { cx: px + 60 + i * 80, cy: py + 30, r: 9, fill: '#F3EEE4', stroke: INK, 'stroke-width': 2 }));
      el2(this.pb, 'rect', { x: px + 300, y: py + 22, width: 380, height: 16, fill: STEEL, stroke: INK, 'stroke-width': 2 });
      el2(this.pb, 'rect', { x: px + 600, y: py + 4, width: 12, height: 52, fill: '#8A9096', stroke: INK, 'stroke-width': 2 });
      el2(this.pb, 'rect', { x: px + 616, y: py + 10, width: 30, height: 40, fill: '#8A9096', stroke: INK, 'stroke-width': 2 });
      this.lpb = L.text(`plate bolt ${kj('羽子板ボルト')} · a steel plate (3.2 mm) with a bolt (12 mm) welded to it · nut and washer · generic, not to scale`, { x: px, y: py + 90, size: 36, w: 1200 }); this.lpb.classList.add('wrap');
      this.lpb2 = L.text('the plate is fixed to one member; the bolt passes through another', { x: px, y: py + 190, size: 36, cls: 'soft' });
      // Art. 44: a beam over two supports, a weakening notch on the underside near mid-span
      this.bm = el2(svg, 'g', {}); const bx = 260, by = 520;
      L.woodRect(this.bm, bx, by, 1400, 110, { vertical: false });
      el2(this.bm, 'rect', { x: bx + 40, y: by + 110, width: 90, height: 200, fill: WOODD, stroke: INK, 'stroke-width': 2 });
      el2(this.bm, 'rect', { x: bx + 1270, y: by + 110, width: 90, height: 200, fill: WOODD, stroke: INK, 'stroke-width': 2 });
      el2(this.bm, 'rect', { x: bx + 660, y: by + 80, width: 80, height: 30, fill: '#F1ECE2', stroke: ACC, 'stroke-width': 4 });
      xMark(this.bm, bx + 700, by + 180);
      this.l44 = L.text('<span class="acc">✕ a weakening notch on the underside near mid-span</span> <span class="soft">· Art. 44, beams and other horizontal members</span>', { x: 96, y: 860, size: 36 });
      this.rest = el2(svg, 'g', {}); [bx + 85, bx + 1315].forEach((x) => el2(this.rest, 'circle', { cx: x, cy: by + 110, r: 34, fill: 'none', stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '8 6' }));
      this.lrest = L.text('in the uses above: cut where one timber rests on the other (dashed), not in the open span', { x: 96, y: 940, size: 36 });
      this.sch = L.text('schematic', { x: 1824, y: 54, size: 36, cls: 'soft', align: 'right' });
    },
    frame(t, sh) {
      const e = sh.ev;
      const a = win(t, e.law, e.plate), b = win(t, e.plate, e.forbid), c = r(t, e.forbid);
      L.show(this.law, a); L.show(this.law2, a); L.show(this.pairs, win(t, e.pairs, e.plate));
      this.pb.setAttribute('opacity', b); L.show(this.lpb, b); L.show(this.lpb2, b * r(t, e.plate + 3.5));
      this.bm.setAttribute('opacity', c); L.show(this.l44, c); L.show(this.sch, b + c);
      const d = r(t, e.rests); this.rest.setAttribute('opacity', d); L.show(this.lrest, d);
      return {};
    },
  },
  S08: {
    build() {
      const a = L.text('Next · Episode 9', { x: 96, y: 330, size: 48 }); a.style.fontWeight = 700;
      const b = L.text('Back to Splices', { x: 96, y: 410, size: 96 }); b.style.fontWeight = 700;
    },
    frame() { return {}; },
  },
  S09: {
    build() {
      const h = L.text('Both timbers are cut; the middle locks into the groove; hardware holds it together.', { x: 96, y: 60, size: 48, w: 1728 }); h.style.fontWeight = 700; h.classList.add('wrap');
      const rows = [
        ['watari-ago', '渡り腮', 'crossing joint', 'specs write 渡りあご; groove above, middle left standing below'],
        ['ago', '腮', 'jaw', 'on its own also read era, "gills"; which part is the jaw: not stated'],
        ['shiguchi', '仕口', 'joint at an angle', 'also read shikuchi; tsugite 継手 is a splice'],
        ['aigaki', '相欠き', 'half-lap', 'each cut to half depth; tops flush'],
        ['kabuto-arikake', 'かぶとあり掛け', 'a dovetail', "the spec's other choice, roof beam to eaves plate"],
        ['(plate bolt)', '羽子板ボルト', 'plate bolt', 'a steel plate with a bolt welded to it'],
      ];
      const g = L.text('', { x: 96, y: 230, size: 36, w: 1728 });
      g.innerHTML = '<div class="soft" style="font-size:36px;margin-bottom:12px;letter-spacing:.08em">GLOSSARY · EPISODE 8</div>' + rows.map((x) => `<div style="display:flex;gap:30px;margin-bottom:16px;align-items:baseline"><div style="width:600px;font-weight:700;font-size:38px"><i>${x[0]}</i> <span style="font-family:'Noto Serif CJK JP',serif;font-style:normal">${x[1]}</span></div><div style="width:1100px;white-space:normal;font-size:36px"><b>${x[2]}</b> — <span class="soft">${x[3]}</span></div></div>`).join('');
    },
    frame() { return {}; },
  },
  S10: { fadeOut: 1.0, build() { endCard(); }, frame() { return {}; } },
};

function titleCard() {
  const svg = L.svgLayer();
  el2(svg, 'line', { x1: 96, y1: 470, x2: 560, y2: 470, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 300, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('EPISODE 8', { x: 96, y: 370, size: 48 }); b.style.fontWeight = 700; b.style.letterSpacing = '0.12em';
  const c = L.text('Beam Over Beam', { x: 96, y: 510, size: 96 }); c.style.fontWeight = 700;
  L.text(`<i>watari-ago</i> ${kj('渡り腮')}`, { x: 96, y: 650, size: 56, cls: 'soft' });
  // two timbers crossing, end view of the lower one
  L.woodRect(svg, 1260, 420, 520, 150, { vertical: false });
  el2(svg, 'rect', { x: 1450, y: 570, width: 120, height: 150, fill: WOODD, stroke: INK, 'stroke-width': 3 });
}
function endCard() {
  const a = L.text('JAPANESE JOINERY BY HAND', { x: 96, y: 330, size: 40 }); a.style.letterSpacing = '0.18em';
  const b = L.text('Next · Episode 9', { x: 96, y: 420, size: 48 }); b.style.fontWeight = 700;
  const c = L.text('Back to Splices', { x: 96, y: 500, size: 96 }); c.style.fontWeight = 700;
  const svg = L.svgLayer(); el2(svg, 'line', { x1: 96, y1: 740, x2: 560, y2: 740, stroke: INK, 'stroke-width': 4, 'stroke-dasharray': '60 14 10 14' });
}
