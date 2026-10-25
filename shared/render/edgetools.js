// Chisel, gennō and kanna models (illustrative proportions; nothing here is presented as a dimension).
// makeEdgeTools(lib) -> { chisel(P), genno(P), kanna(P), shaving() }.
export function makeEdgeTools(L) {
  const THREE = L.THREE;
  const std = (c, r = 0.6, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const STEEL = () => std('#D3D7DB', 0.4, 0.15), IRON = () => std('#5E6266', 0.55, 0.2), OAK = () => std('#8B4F2E', 0.65);
  const shadow = (g) => { g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return g; };

  // Chisel. Local: the cutting edge at x = 0, back (flat side) on y = 0 facing -y, the tool extends toward -x.
  // P: { blade, width, thick, bevel (deg), neck, handle, handle_d, hoop (bool) }
  function chisel(P) {
    const g = new THREE.Group();
    const tb = P.thick, bl = P.blade, bv = tb / Math.tan(P.bevel * Math.PI / 180);
    // side profile (x, y): edge at origin, back along y = 0, bevel rising to the top face
    const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(-bl, 0); s.lineTo(-bl, tb * 1.1); s.lineTo(-bv, tb); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: P.width, bevelEnabled: false }); geo.translate(0, 0, -P.width / 2);
    const blade = new THREE.Mesh(geo, STEEL()); g.add(blade);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(tb * 0.45, tb * 0.55, P.neck, 12), STEEL()); neck.rotation.z = Math.PI / 2; neck.position.set(-bl - P.neck / 2, tb * 0.55, 0); g.add(neck);
    const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(P.handle_d / 2 * 0.9, P.handle_d / 2 * 0.95, 14, 20), IRON()); ferrule.rotation.z = Math.PI / 2; ferrule.position.set(-bl - P.neck - 7, tb * 0.55, 0); g.add(ferrule);
    const h = new THREE.Mesh(new THREE.CylinderGeometry(P.handle_d / 2, P.handle_d / 2 * 0.92, P.handle, 8), OAK()); h.rotation.z = Math.PI / 2; h.position.set(-bl - P.neck - 14 - P.handle / 2, tb * 0.55, 0); g.add(h);
    let hoop = null;
    if (P.hoop) { hoop = new THREE.Mesh(new THREE.CylinderGeometry(P.handle_d / 2 + 1.2, P.handle_d / 2 + 1.2, 12, 20, 1, true), IRON()); hoop.material.side = THREE.DoubleSide; hoop.rotation.z = Math.PI / 2; hoop.position.set(-bl - P.neck - 14 - P.handle + 8, tb * 0.55, 0); g.add(hoop); }
    const length = bl + P.neck + 14 + P.handle;
    return { g: shadow(g), blade, hoop, length, buttX: -length, axisY: tb * 0.55 };
  }

  // Gennō. Local: head axis along x, centred at the origin; flat face at +x, domed face at -x; handle along -y.
  // P: { head_len, head_d, dome (mm rise), handle, handle_w }
  function genno(P) {
    const g = new THREE.Group();
    const head = new THREE.Mesh(new THREE.CylinderGeometry(P.head_d / 2, P.head_d / 2, P.head_len, 32), IRON()); head.rotation.z = Math.PI / 2; g.add(head);
    // slight waist band for readability
    const band = new THREE.Mesh(new THREE.CylinderGeometry(P.head_d / 2 + 0.6, P.head_d / 2 + 0.6, 4, 32), std('#43474B', 0.5, 0.2)); band.rotation.z = Math.PI / 2; g.add(band);
    // domed face: a shallow spherical cap of rise `dome` on the -x end
    const r = P.head_d / 2, R = (r * r + P.dome * P.dome) / (2 * P.dome), th = Math.asin(r / R);
    // sphere cap (polar angle 0..th around +y), turned to point along -x; centre placed so the apex is `dome` beyond the end
    const cap = new THREE.Mesh(new THREE.SphereGeometry(R, 32, 8, 0, Math.PI * 2, 0, th), IRON());
    cap.rotation.set(0, 0, Math.PI / 2); cap.position.set(-P.head_len / 2 + (R - P.dome), 0, 0);
    g.add(cap);
    const flat = new THREE.Mesh(new THREE.CircleGeometry(r, 32), std('#8A8F94', 0.35, 0.3)); flat.rotation.y = Math.PI / 2; flat.position.x = P.head_len / 2 + 0.05; g.add(flat);
    const hdl = new THREE.Mesh(new THREE.BoxGeometry(P.handle_w, P.handle, P.handle_w * 0.75), OAK()); hdl.position.set(0, -P.handle / 2 - P.head_d * 0.2, 0); g.add(hdl);
    return { g: shadow(g), flatX: P.head_len / 2, domeX: -P.head_len / 2 - P.dome, cap, flat };
  }

  // Kanna. Local: block along x (length), sole on y = 0, width along z; the user pulls toward +x (the block's rear,
  // where the hands are). Blade bedded at `bed` degrees, its edge at the mouth on the sole.
  // P: { len, w, h, mouth (x from the front), bed (deg), blade_w, blade_t, blade_proj (above block) }
  function kanna(P) {
    const g = new THREE.Group();
    const dai = new THREE.Group(); g.add(dai);
    const oak = std('#C9A26B', 0.7);
    // block with a mouth slot: two boxes either side of a gap (simple, reads clearly)
    const mx = P.mouth, gap = 8;
    const front = new THREE.Mesh(new THREE.BoxGeometry(mx - gap / 2, P.h, P.w), oak); front.position.set((mx - gap / 2) / 2, P.h / 2, 0); dai.add(front);
    const restL = P.len - mx - gap / 2;
    const rear = new THREE.Mesh(new THREE.BoxGeometry(restL, P.h, P.w), oak); rear.position.set(mx + gap / 2 + restL / 2, P.h / 2, 0); dai.add(rear);
    const cheeks = [-1, 1].map((sd) => { const c = new THREE.Mesh(new THREE.BoxGeometry(gap + 2, P.h, (P.w - P.blade_w) / 2), oak); c.position.set(mx, P.h / 2, sd * (P.w / 2 - (P.w - P.blade_w) / 4)); dai.add(c); return c; });
    void cheeks;
    // blade: a tapered slab leaning back at `bed` degrees; edge at (mx, 0)
    const a = P.bed * Math.PI / 180, Lb = (P.h + P.blade_proj) / Math.sin(a);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(Lb, P.blade_t, P.blade_w), std('#C4C9CE', 0.4, 0.2));
    const bladeG = new THREE.Group(); bladeG.add(blade); blade.position.set(Lb / 2, P.blade_t / 2, 0);
    bladeG.position.set(mx, 0.2, 0); bladeG.rotation.z = a; // rises toward the rear (+x), where the user's hands are
    g.add(bladeG);
    // chip breaker: thinner, shorter, on top of the blade, its edge just behind the blade's edge
    const cbL = Lb * 0.78;
    const cb = new THREE.Mesh(new THREE.BoxGeometry(cbL, P.blade_t * 0.5, P.blade_w * 0.94), std('#9EA4AA', 0.45, 0.2));
    const cbG = new THREE.Group(); cbG.add(cb); cb.position.set(cbL / 2 + Lb * 0.18, P.blade_t + P.blade_t * 0.25, 0);
    bladeG.add(cbG);
    return { g: shadow(g), dai, bladeG, blade, cbG, Lb, mouthX: mx };
  }

  // a curling shaving: a thin ribbon along a growing spiral; call setShaving(m, k) to grow it (k 0..1)
  function shaving(w = 40, turns = 1.6, r0 = 26) {
    const N = 120, pos = new Float32Array(N * 2 * 3), idx = [];
    for (let i = 0; i < N - 1; i++) { const a = i * 2, b = a + 1, c = a + 2, d = a + 3; idx.push(a, b, c, b, d, c); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setIndex(idx);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#F0D9B5', roughness: 0.8, side: THREE.DoubleSide }));
    m.castShadow = true; m.userData = { N, w, turns, r0 };
    return m;
  }
  function setShaving(m, k) {
    const { N, w, turns, r0 } = m.userData, p = m.geometry.attributes.position.array;
    const total = turns * Math.PI * 2 * Math.max(0.02, k);
    for (let i = 0; i < N; i++) {
      const t = (i / (N - 1)) * total, r = r0 * (1 - 0.35 * t / (turns * Math.PI * 2));
      // starts at the mouth heading up and back (+y, +x), curling over toward -x
      const x = r * Math.sin(t), y = r * (1 - Math.cos(t)) + 0.0;
      for (let j = 0; j < 2; j++) { const o = (i * 2 + j) * 3; p[o] = x; p[o + 1] = y; p[o + 2] = (j - 0.5) * w; }
    }
    m.geometry.attributes.position.needsUpdate = true; m.geometry.computeVertexNormals(); m.visible = k > 0.01;
  }
  return { chisel, genno, kanna, shaving, setShaving };
}
