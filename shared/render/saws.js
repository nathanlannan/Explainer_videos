// Japanese saw models (illustrative proportions, teeth enlarged so they read on screen).
// makeSaws(lib) -> { ryoba(P), dozuki(P), kataba(P) }; each returns { g, blade, spine?, edges }.
// Local frame: blade along +x from the heel (x = 0) to the toe (x = len); the cutting edge(s) at y = 0 (and y = top);
// the handle runs along -x. Pull-stroke teeth: the steep cutting face of each tooth faces the handle (-x).
export function makeSaws(L) {
  const THREE = L.THREE;
  const steel = () => new THREE.MeshStandardMaterial({ color: '#D9DDE1', metalness: 0.12, roughness: 0.45, side: THREE.DoubleSide });
  const dark = () => new THREE.MeshStandardMaterial({ color: '#8E9398', metalness: 0.4, roughness: 0.45 });

  // tooth profile along an edge from x0 to x1 at baseline y, pointing in dir (-1 down, +1 up)
  function teeth(pts, x0, x1, y, dir, pitch, kind) {
    const n = Math.floor((x1 - x0) / pitch), h = kind === 'rip' ? pitch * 0.62 : pitch * 0.85;
    const tipAt = kind === 'rip' ? 0.12 : 0.42;          // rip: steep face toward the handle; crosscut: near-symmetric
    for (let i = 0; i < n; i++) {
      const a = x0 + i * pitch;
      pts.push([a, y]); pts.push([a + pitch * tipAt, y + dir * h]);
    }
    pts.push([x0 + n * pitch, y]);
  }
  function plate(len, hHeel, hToe, bottom, top, P) {
    // outline counter-clockwise: bottom edge heel->toe, toe end, top edge toe->heel
    const pts = [];
    if (bottom) teeth(pts, 0, len, 0, -1, bottom.pitch, bottom.kind); else pts.push([0, 0], [len, 0]);
    const top_ = [];
    if (top) { teeth(top_, 0, len, 0, +1, top.pitch, top.kind); top_.forEach((p) => { p[1] = hHeel + (hToe - hHeel) * p[0] / len + p[1]; }); top_.reverse(); }
    else top_.push([len, hToe], [0, hHeel]);
    // neck notch at the heel: the blade narrows into the tang
    const s = new THREE.Shape(); const all = pts.concat(top_);
    s.moveTo(...all[0]); all.slice(1).forEach((p) => s.lineTo(...p)); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: P.plate, bevelEnabled: false, curveSegments: 1 });
    geo.translate(0, 0, -P.plate / 2);
    const m = new THREE.Mesh(geo, steel()); m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function caneTexture() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 32; const g = c.getContext('2d');
    for (let i = 0; i < 256; i += 8) { g.fillStyle = (i / 8) % 2 ? '#B48A55' : '#A57B48'; g.fillRect(i, 0, 8, 32); g.fillStyle = 'rgba(60,40,20,0.35)'; g.fillRect(i, 0, 1, 32); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }
  function handle(P, yMid) {
    const g = new THREE.Group();
    const tang = new THREE.Mesh(new THREE.BoxGeometry(P.neck, 16, P.plate * 3), dark()); tang.position.set(-P.neck / 2, yMid, 0); g.add(tang);
    const tex = caneTexture(); tex.repeat.set(P.handle / 40, 1);
    const hm = new THREE.Mesh(new THREE.CylinderGeometry(P.handle_d / 2, P.handle_d / 2 * 0.92, P.handle, 24), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75 }));
    hm.rotation.z = Math.PI / 2; hm.scale.set(1, 1, 0.8); hm.position.set(-P.neck - P.handle / 2, yMid, 0); g.add(hm);
    const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(P.handle_d / 2 + 1, P.handle_d / 2 + 1, 14, 24), dark()); ferrule.rotation.z = Math.PI / 2; ferrule.position.set(-P.neck - 7, yMid, 0); g.add(ferrule);
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
    return g;
  }
  function ryoba(P) {
    const g = new THREE.Group();
    const blade = plate(P.len, P.h_heel, P.h_toe, { kind: 'rip', pitch: P.rip_pitch }, { kind: 'cross', pitch: P.cross_pitch }, P);
    g.add(blade); g.add(handle(P, P.h_heel / 2));
    return { g, blade, edges: { rip: 0, cross: 'top' } };
  }
  function dozuki(P) {
    const g = new THREE.Group();
    const blade = plate(P.len, P.h, P.h, { kind: 'cross', pitch: P.cross_pitch }, null, P); g.add(blade);
    const spine = new THREE.Mesh(new THREE.BoxGeometry(P.len, P.spine_h, P.spine_t), dark()); spine.position.set(P.len / 2, P.h + P.spine_h / 2 - 3, 0); spine.castShadow = true; g.add(spine);
    g.add(handle(P, P.h * 0.6));
    return { g, blade, spine, edges: { cross: 0 } };
  }
  function kataba(P) {
    const g = new THREE.Group();
    const blade = plate(P.len, P.h_heel, P.h_toe, { kind: 'cross', pitch: P.cross_pitch }, null, P);
    g.add(blade); g.add(handle(P, P.h_heel * 0.7));
    return { g, blade, edges: { cross: 0 } };
  }
  return { ryoba, dozuki, kataba };
}
