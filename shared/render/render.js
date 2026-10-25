// Headless frame renderer: node shared/render/render.js --ep episodes/x/shots.js (--out a.mp4 [--from F --to F] [--workers N] | --stills F1,F2 --outdir D | --layout STEP)
// --layout STEP: every STEP frames, measure every visible overlay text box: outside the 5% title-safe area, under 36 px,
// or overlapping another visible text box -> printed as issues (one line per issue, consecutive repeats merged).
const { chromium } = require('playwright'); const { spawn, execFileSync } = require('child_process');
const http = require('http'); const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const A = Object.fromEntries(process.argv.slice(2).reduce((acc, v, i, a) => (v.startsWith('--') ? acc.concat([[v.slice(2), a[i + 1] && !a[i + 1].startsWith('--') ? a[i + 1] : true]]) : acc), []));
const MIME = { js: 'text/javascript', html: 'text/html', json: 'application/json', png: 'image/png', jpg: 'image/jpeg' };
function serve() {
  return new Promise((res) => { const s = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); } fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[f.split('.').pop()] || 'application/octet-stream' }); r.end(d); }); }).listen(0, () => res(s)); });
}

const LAYOUT_JS = `(() => {
  const SAFE = [96, 54, 1824, 1026], out = [];
  const ov = [...document.querySelectorAll('.shotov')].find((d) => d.style.display !== 'none'); if (!ov) return out;
  const vis = (e) => { for (let n = e; n && n !== ov; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; } return true; };
  const boxes = [];
  for (const e of ov.querySelectorAll('.txt, .label, text')) {
    if (!vis(e) || !e.textContent.trim()) continue;
    const r = document.createRange(); r.selectNodeContents(e); const rs = [...r.getClientRects()].filter((q) => q.width > 0 && q.height > 0); if (!rs.length) continue;
    const b = { x0: Math.min(...rs.map((q) => q.left)), y0: Math.min(...rs.map((q) => q.top)), x1: Math.max(...rs.map((q) => q.right)), y1: Math.max(...rs.map((q) => q.bottom)) };
    const name = e.textContent.trim().slice(0, 40);
    if (b.x0 < SAFE[0] - 2 || b.y0 < SAFE[1] - 2 || b.x1 > SAFE[2] + 2 || b.y1 > SAFE[3] + 2) out.push('outside-safe: ' + name + ' [' + [b.x0, b.y0, b.x1, b.y1].map(Math.round) + ']');
    const small = [e, ...e.querySelectorAll('*')].filter((n) => [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())).map((n) => parseFloat(getComputedStyle(n).fontSize)).filter((v) => v < 35.5);
    if (small.length) out.push('small-text ' + Math.min(...small) + 'px: ' + name);
    if (e.tagName !== 'text' && +getComputedStyle(e).opacity > 0.3) boxes.push([name, b, e]);
  }
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const [na, a, ea] = boxes[i], [nb, c, eb] = boxes[j]; if (ea.contains(eb) || eb.contains(ea)) continue;
    const ox = Math.min(a.x1, c.x1) - Math.max(a.x0, c.x0), oy = Math.min(a.y1, c.y1) - Math.max(a.y0, c.y0);
    if (ox > 4 && oy > 4) out.push('overlap: ' + na + ' <> ' + nb);
  }
  return out;
})()`;
async function page(browser, port) {
  const p = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('page:', m.text()); }); p.on('pageerror', (e) => console.log('pageerror:', e.message));
  await p.goto(`http://localhost:${port}/shared/render/stage.html?ep=${A.ep}`); await p.waitForFunction('window.ready', null, { timeout: 900000 });
  return p;
}
async function segment(browser, port, f0, f1, out) {
  const p = await page(browser, port);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', '30', out]);
  for (let f = f0; f < f1; f++) { await p.evaluate(`renderFrame(${f})`); const b = await p.screenshot({ type: 'png', timeout: 0 }); if (!ff.stdin.write(b)) await new Promise((r) => ff.stdin.once('drain', r)); if ((f - f0) % 300 === 0) console.log(`  ${out.split('/').pop()} frame ${f}`); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await p.close();
}
(async () => {
  const srv = await serve(); const port = srv.address().port;
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const t0 = Date.now();
  if (A.layout) {
    const p = await page(browser, port); const total = await p.evaluate('Math.round(window.total*30)'); const step = +A.layout;
    let prev = new Map(); const report = [];
    for (let f = +(A.from || 0); f < Math.min(+(A.to || total), total); f += step) {
      const id = await p.evaluate(`renderFrame(${f})`); const issues = await p.evaluate(LAYOUT_JS); const now = new Map();
      for (const k of issues) { now.set(k, prev.has(k) ? prev.get(k) : [f, id]); }
      for (const [k, [f0, id0]] of prev) if (!now.has(k)) report.push(`${id0} f${f0}-${f - step}: ${k}`);
      prev = now;
    }
    for (const [k, [f0, id0]] of prev) report.push(`${id0} f${f0}-end: ${k}`);
    console.log(report.length ? report.join('\n') : 'layout: no issues');
  } else if (A.stills) {
    const p = await page(browser, port); fs.mkdirSync(A.outdir, { recursive: true });
    for (const f of String(A.stills).split(',').map(Number)) { const id = await p.evaluate(`renderFrame(${f})`); const t1 = Date.now(); await p.screenshot({ timeout: 0, path: path.join(A.outdir, `f${String(f).padStart(5, '0')}_${id}.png`) }); console.log('still', f, id, Date.now() - t1, 'ms'); }
  } else {
    const p = await page(browser, port); const total = await p.evaluate('Math.round(window.total*30)'); await p.close();
    const f0 = +(A.from || 0), f1 = Math.min(+(A.to || total), total), N = +(A.workers || 2);
    A.out = path.resolve(A.out); const tmp = path.join(path.dirname(A.out), '.seg'); fs.mkdirSync(tmp, { recursive: true });
    const per = Math.ceil((f1 - f0) / N), segs = [];
    await Promise.all([...Array(N).keys()].map((i) => { const a = f0 + i * per, b = Math.min(f1, a + per); if (a >= b) return null; const o = path.join(tmp, `seg${i}.mp4`); segs.push([i, o]); return segment(browser, port, a, b, o); }));
    segs.sort((x, y) => x[0] - y[0]); fs.writeFileSync(path.join(tmp, 'list.txt'), segs.map((s) => `file '${s[1]}'`).join('\n'));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'list.txt'), '-c', 'copy', A.out]);
    console.log(`frames ${f1 - f0}, ${((Date.now() - t0) / 1000 / (f1 - f0)).toFixed(3)} s/frame wall`);
  }
  await browser.close(); srv.close();
})();
