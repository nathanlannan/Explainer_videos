// Shared renderer library: three.js scene, materials, camera presets, marks, labels, 2D diagrams.
// Every shot in every episode is built from these pieces so the series looks the same.
import * as THREE from 'three';
import { C, FONT, SIZE, SAFE, LINE } from '../style/tokens.js';

export { THREE, C, FONT, SIZE, SAFE, LINE };
export const W = 1920, H = 1080;

// ---------- timing helpers ----------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ease = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
export const ramp = (t, t0, t1) => ease((t - t0) / Math.max(1e-6, t1 - t0)); // eased 0..1 between t0 and t1
export const lin = (t, t0, t1) => clamp((t - t0) / Math.max(1e-6, t1 - t0));
export const fade = (t, t0, t1, d = 0.5) => clamp(Math.min((t - t0) / d, (t1 - t) / d)); // in/out envelope
export const lerp = (a, b, k) => a + (b - a) * k;
export const lerp3 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));

// ---------- renderer & scene ----------
let renderer;
export function getRenderer() {
  if (renderer) return renderer;
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H); renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.domElement.id = 'gl';
  document.getElementById('stage').appendChild(renderer.domElement);
  return renderer;
}

export function makeScene({ floor = true, shadowBox = 4000, lightDir = [0.45, 1, 0.65] } = {}) {
  const s = new THREE.Scene();
  s.background = new THREE.Color(C.paper);
  s.add(new THREE.HemisphereLight('#fffaf0', '#cbbba0', 1.6));
  const d = new THREE.DirectionalLight('#fff3df', 2.3);
  d.position.set(...lightDir.map((v) => v * 6000)); d.castShadow = true;
  d.shadow.mapSize.set(4096, 4096); d.shadow.radius = 4; d.shadow.bias = -0.0004; d.shadow.normalBias = 2;
  Object.assign(d.shadow.camera, { left: -shadowBox, right: shadowBox, top: shadowBox, bottom: -shadowBox, near: 100, far: 20000 });
  s.add(d); s.add(d.target);
  const fill = new THREE.DirectionalLight('#e8eef5', 0.5); fill.position.set(-4000, 2000, -1000); s.add(fill);
  if (floor) {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(60000, 60000), new THREE.ShadowMaterial({ opacity: 0.16 }));
    f.rotation.x = -Math.PI / 2; f.receiveShadow = true; f.name = 'floor'; s.add(f);
  }
  s.userData.sun = d;
  return s;
}

// ---------- camera presets (series-wide) ----------
// All take a target point and a distance; FOV is fixed per preset so framing stays consistent.
export const PRESETS = {
  front: { dir: [0, 0.05, 1], fov: 24 },
  threeQ: { dir: [0.62, 0.42, 1], fov: 24 },
  top: { dir: [0, 1, 0.0001], fov: 24 },
  section: { dir: [1, 0.02, 0], fov: 24 },
};
const cams = {};
export function camera(preset, target, dist, { orbit = 0, lift = 0 } = {}) {
  const p = PRESETS[preset];
  const cam = cams[preset] || (cams[preset] = new THREE.PerspectiveCamera(p.fov, W / H, 10, 100000));
  const d = new THREE.Vector3(...p.dir).normalize();
  if (orbit) d.applyAxisAngle(new THREE.Vector3(0, 1, 0), orbit);
  d.y += lift; d.normalize();
  cam.position.set(target[0] + d.x * dist, target[1] + d.y * dist, target[2] + d.z * dist);
  if (preset === 'top') cam.up.set(0, 0, -1); else cam.up.set(0, 1, 0);
  cam.lookAt(...target);
  cam.updateMatrixWorld();
  return cam;
}
// Blend two camera framings (for slow eased moves).
export function cameraBlend(a, b, k) {
  const ca = camera(...a), pa = ca.position.clone(), qa = ca.quaternion.clone();
  const cb = camera(...b);
  const pb = cb.position.clone(), qb = cb.quaternion.clone();
  cb.position.lerpVectors(pa, pb, k); cb.quaternion.slerpQuaternions(qa, qb, k); cb.updateMatrixWorld();
  return cb;
}
// Project a world point to screen px (for anchoring 2D labels to 3D things).
export function toScreen(cam, p) {
  const v = new THREE.Vector3(...p).project(cam);
  return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H];
}

// ---------- wood material (procedural hinoki, grain along the member's long axis) ----------
function rng(seed) { let x = seed % 2147483647 || 1; return () => (x = (x * 16807) % 2147483647) / 2147483647; }
const texCache = {};
function sideGrain(seed) {
  const key = 's' + seed; if (texCache[key]) return texCache[key];
  const w = 4096, h = 512, c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'), r = rng(seed * 7919 + 13);
  g.fillStyle = C.wood; g.fillRect(0, 0, w, h);
  // broad tonal bands (latewood/earlywood), then fine lines, all running along u (= along the grain)
  for (let i = 0; i < 26; i++) {
    const y0 = r() * h, bw = 6 + r() * 30, a = 0.03 + r() * 0.06, ph = r() * 6.28, amp = 2 + r() * 8;
    g.fillStyle = `rgba(176,128,78,${a})`;
    g.beginPath();
    for (let X = 0; X <= w; X += 16) { const y = y0 + Math.sin(X / w * 6.28 * 1.5 + ph) * amp; X ? g.lineTo(X, y) : g.moveTo(X, y); }
    for (let X = w; X >= 0; X -= 16) { const y = y0 + bw + Math.sin(X / w * 6.28 * 1.5 + ph + 0.4) * amp; g.lineTo(X, y); }
    g.fill();
  }
  for (let i = 0; i < 220; i++) {
    const y0 = r() * h, a = 0.04 + r() * 0.12, ph = r() * 6.28, amp = 1 + r() * 4;
    g.strokeStyle = `rgba(140,92,50,${a})`; g.lineWidth = 0.5 + r() * 1.6; g.beginPath();
    for (let X = 0; X <= w; X += 16) { const y = y0 + Math.sin(X / w * 6.28 * 1.5 + ph) * amp + Math.sin(X / 211 + ph) * 0.8; X ? g.lineTo(X, y) : g.moveTo(X, y); }
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return (texCache[key] = t);
}
function endGrain(seed) {
  const key = 'e' + seed; if (texCache[key]) return texCache[key];
  const s = 512, c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d'), r = rng(seed * 104729 + 7);
  g.fillStyle = '#D9B98E'; g.fillRect(0, 0, s, s);
  const cx = s * (0.45 + r() * 0.1), cy = s * (0.45 + r() * 0.1);
  for (let k = 4; k < s; k += 5 + r() * 6) { g.strokeStyle = `rgba(150,100,58,${0.12 + r() * 0.15})`; g.lineWidth = 0.8 + r() * 1.6; g.beginPath(); g.arc(cx, cy, k, 0, 6.29); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return (texCache[key] = t);
}
const AX = { x: 0, y: 1, z: 2 };
// Build a mesh from exported member geometry (positions in mm). UVs: side faces get u along the
// member's long axis (so grain runs the right way); end faces get the ring texture.
export function memberMesh(m, { seed = 1, opacity = 1, tint = null } = {}) {
  const P = m.positions, n = P.length; // vertex count (3 per triangle)
  const pos = new Float32Array(P.flat()), uv = new Float32Array(n * 2);
  const L = AX[m.axis], box = m.box, groups = [[], []]; // 0 side, 1 end
  const ox = (seed * 0.137) % 1, oy = (seed * 0.291) % 1;
  for (let t = 0; t < n; t += 3) {
    const a = P[t], b = P[t + 1], c2 = P[t + 2];
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c2[0] - a[0], c2[1] - a[1], c2[2] - a[2]];
    const nn = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]].map(Math.abs);
    const dom = nn.indexOf(Math.max(...nn));
    const isEnd = dom === L;
    const across = [0, 1, 2].find((k) => k !== L && k !== dom);
    for (let j = 0; j < 3; j++) {
      const p = P[t + j];
      if (isEnd) {
        const [u1, u2] = [0, 1, 2].filter((k) => k !== L);
        uv[(t + j) * 2] = (p[u1] - box[u1]) / box[3 + u1]; uv[(t + j) * 2 + 1] = (p[u2] - box[u2]) / box[3 + u2];
      } else {
        uv[(t + j) * 2] = (p[L] - box[L]) / 2400 + ox; uv[(t + j) * 2 + 1] = (p[across] - box[across]) / 300 + oy + dom * 0.31;
      }
    }
    groups[isEnd ? 1 : 0].push(t);
  }
  // reorder triangles by group
  const order = [...groups[0], ...groups[1]];
  const pos2 = new Float32Array(n * 3), uv2 = new Float32Array(n * 2);
  order.forEach((t, i) => { for (let j = 0; j < 3; j++) { pos2.set(pos.subarray((t + j) * 3, (t + j) * 3 + 3), (i * 3 + j) * 3); uv2.set(uv.subarray((t + j) * 2, (t + j) * 2 + 2), (i * 3 + j) * 2); } });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos2, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv2, 2));
  geo.computeVertexNormals();
  geo.addGroup(0, groups[0].length * 3, 0); geo.addGroup(groups[0].length * 3, groups[1].length * 3, 1);
  const tr = opacity < 1;
  const mats = [new THREE.MeshStandardMaterial({ map: sideGrain(seed), roughness: 0.78, transparent: tr, opacity }),
    new THREE.MeshStandardMaterial({ map: endGrain(seed), roughness: 0.85, transparent: tr, opacity })];
  if (tint) mats.forEach((mt) => mt.color.set(tint));
  const mesh = new THREE.Mesh(geo, mats); mesh.castShadow = true; mesh.receiveShadow = true; mesh.name = m.name;
  return mesh;
}
export function ghostMesh(m) {
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(m.positions.flat()), 3));
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: C.ghost, transparent: true, opacity: 0.28, depthWrite: false }));
}
export function setOpacity(obj, a) {
  obj.traverse((o) => { if (o.material) [].concat(o.material).forEach((m) => { m.transparent = a < 1; m.opacity = a; m.depthWrite = a > 0.95; }); });
  obj.visible = a > 0.002;
}

// ---------- ink marks on timber ----------
const inkMat = new THREE.MeshBasicMaterial({ color: C.ink });
// A straight ink line on a face. `face` = {origin, u (unit dir along line), n (outward normal)}; length in mm.
// progress 0..1 draws it from the start, like the pen moving.
export function inkLine(len, width = 4) {
  const g = new THREE.PlaneGeometry(1, 1); g.translate(0.5, 0, 0);
  const m = new THREE.Mesh(g, inkMat); m.scale.set(len, width, 1); m.userData.len = len; return m;
}
export function setProgress(line, k) { line.scale.x = Math.max(0.0001, line.userData.len * clamp(k)); line.visible = k > 0.001; }
// Dash-dot centre line (series encoding), as a group of short planes.
export function centreLine(len, width = 3, pattern = [60, 16, 10, 16]) {
  const grp = new THREE.Group(); let x = 0, i = 0;
  while (x < len) { const seg = Math.min(pattern[i % 4], len - x); if (i % 2 === 0) { const p = inkLine(seg, width); p.position.x = x; grp.add(p); } x += pattern[i % 4]; i++; }
  grp.userData.len = len; return grp;
}
export function setGroupProgress(grp, k) { const lim = grp.userData.len * clamp(k); grp.children.forEach((c) => { c.visible = c.position.x < lim; }); }
// Handwritten-style note as a textured plane (ink on transparent), size in mm.
export function inkText(text, h = 22, { font = FONT.latin, weight = 700 } = {}) {
  const c = document.createElement('canvas'); const px = 128; const g = c.getContext('2d');
  g.font = `${weight} ${px}px ${font}`; const w = Math.ceil(g.measureText(text).width) + 16;
  c.width = w; c.height = px * 1.3; g.font = `${weight} ${px}px ${font}`; g.fillStyle = C.ink; g.textBaseline = 'middle'; g.fillText(text, 8, c.height / 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(h * w / c.height, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }));
  return m;
}

// ---------- simple tool models (silhouettes only; tools are taught in Ep 2) ----------
export function penModel() { // bamboo ink pen: flat strip with a thin chisel tip (light detail on purpose)
  const g = new THREE.Group();
  const bam = new THREE.MeshStandardMaterial({ color: '#C8B07A', roughness: 0.6 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(14, 190, 4), bam); body.position.y = 95 + 20; g.add(body);
  const tipG = new THREE.CylinderGeometry(7, 0.6, 22, 4, 1); tipG.rotateY(Math.PI / 4); tipG.scale(1, 1, 0.3); tipG.rotateX(Math.PI);
  const tip = new THREE.Mesh(tipG, new THREE.MeshStandardMaterial({ color: '#3a3430', roughness: 0.5 })); tip.position.y = 11; g.add(tip);
  g.traverse((o) => { o.castShadow = true; });
  return g; // origin = tip
}
export function squareModel(blade = 500, tongue = 250, w = 15) { // plain L-square silhouette, no scales shown
  const g = new THREE.Group(); const mt = new THREE.MeshStandardMaterial({ color: '#9AA0A6', metalness: 0.6, roughness: 0.35 });
  const a = new THREE.Mesh(new THREE.BoxGeometry(blade, 1.5, w), mt); a.position.set(blade / 2, 0, w / 2); g.add(a);
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, 1.5, tongue), mt); b.position.set(w / 2, 0, tongue / 2); g.add(b);
  g.traverse((o) => { o.castShadow = true; }); return g;
}

// ---------- DOM overlay: labels, cards, svg ----------
let ovRoot = null;
export const overlay = () => ovRoot || document.getElementById('overlay');
export function setOverlay(d) { ovRoot = d; }
export function el(tag, attrs = {}, parent, html) {
  const e = tag.startsWith('svg:') ? document.createElementNS('http://www.w3.org/2000/svg', tag.slice(4)) : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === 'style' && typeof v === 'object') Object.assign(e.style, v); else e.setAttribute(k, v); }
  if (html !== undefined) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}
// Series label: Japanese term (romaji + kanji when verified) above, English gloss below.
export function label({ romaji, kanji, gloss, x, y, align = 'left', size = SIZE.label }) {
  const d = el('div', { class: 'label' }, overlay());
  Object.assign(d.style, { left: x + 'px', top: y + 'px', textAlign: align, transform: align === 'center' ? 'translateX(-50%)' : align === 'right' ? 'translateX(-100%)' : '' });
  if (romaji || kanji) el('div', { class: 'term', style: { fontSize: size + 'px' } }, d, `${romaji ? `<span class="romaji">${romaji}</span>` : ''}${kanji ? `<span class="kanji">${kanji}</span>` : ''}`);
  if (gloss) el('div', { class: 'gloss', style: { fontSize: Math.max(SIZE.gloss, size - 4) + 'px' } }, d, gloss);
  return d;
}
export function text(html, { x, y, size = SIZE.label, align = 'left', cls = '', w } = {}) {
  const d = el('div', { class: 'txt ' + cls }, overlay(), html);
  Object.assign(d.style, { left: x + 'px', top: y + 'px', fontSize: size + 'px', textAlign: align, transform: align === 'center' ? 'translateX(-50%)' : align === 'right' ? 'translateX(-100%)' : '' });
  if (w) d.style.width = w + 'px';
  return d;
}
export function show(d, a) { if (!d) return; d.style.opacity = clamp(a); d.style.display = a > 0.002 ? '' : 'none'; }
export function svgLayer() { const s = el('svg:svg', { viewBox: `0 0 ${W} ${H}`, width: W, height: H, class: 'svg' }, overlay()); return s; }
export const X_ICON = (x, y, s = 40) => `<g transform="translate(${x},${y})" class="xicon"><circle r="${s / 2}" fill="${C.accent}"/><path d="M${-s / 5},${-s / 5}L${s / 5},${s / 5}M${s / 5},${-s / 5}L${-s / 5},${s / 5}" stroke="${C.paper}" stroke-width="${s / 9}" stroke-linecap="round"/></g>`;
export const CHECK_ICON = (x, y, s = 40) => `<g transform="translate(${x},${y})"><circle r="${s / 2}" fill="${C.ink}"/><path d="M${-s / 4.5},0L${-s / 14},${s / 6}L${s / 4},${-s / 6}" stroke="${C.paper}" stroke-width="${s / 9}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
// Wood-coloured rectangle with grain stripes for 2D diagrams (grain along the long side).
let patN = 0;
export function woodRect(svg, x, y, w, h, { vertical = h > w, stroke = C.ink, sw = 2 } = {}) {
  const id = 'wg' + (patN++);
  const defs = el('svg:defs', {}, svg);
  const p = el('svg:pattern', { id, patternUnits: 'userSpaceOnUse', width: vertical ? 40 : 400, height: vertical ? 400 : 40, patternTransform: `translate(${x},${y})` }, defs);
  el('svg:rect', { width: vertical ? 40 : 400, height: vertical ? 400 : 40, fill: C.wood }, p);
  for (let i = 0; i < 5; i++) {
    const o = 4 + i * 8 + (i * 37 % 5);
    el('svg:path', { d: vertical ? `M${o},0 C${o + 3},130 ${o - 3},270 ${o},400` : `M0,${o} C130,${o + 3} 270,${o - 3} 400,${o}`, stroke: 'rgba(150,100,55,0.22)', 'stroke-width': 1 + (i % 2), fill: 'none' }, p);
  }
  return el('svg:rect', { x, y, width: w, height: h, fill: `url(#${id})`, stroke, 'stroke-width': sw }, svg);
}
export function clearOverlay() { overlay().innerHTML = ''; }

// Plain (uncut) stock as a member-like object, so layout shots show timber BEFORE any cutting.
export function boxMember(name, box, axis) {
  const [x, y, z, sx, sy, sz] = box;
  const g = new THREE.BoxGeometry(sx, sy, sz).toNonIndexed(); g.translate(x + sx / 2, y + sy / 2, z + sz / 2);
  const a = g.attributes.position.array, P = [];
  for (let i = 0; i < a.length; i += 3) P.push([a[i], a[i + 1], a[i + 2]]);
  return { name, axis, box, positions: P };
}
