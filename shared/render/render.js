// Headless frame renderer: node shared/render/render.js --ep episodes/x/shots.js (--out a.mp4 [--from F --to F] [--workers N] | --stills F1,F2 --outdir D)
const { chromium } = require('playwright'); const { spawn, execFileSync } = require('child_process');
const http = require('http'); const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const A = Object.fromEntries(process.argv.slice(2).reduce((acc, v, i, a) => (v.startsWith('--') ? acc.concat([[v.slice(2), a[i + 1] && !a[i + 1].startsWith('--') ? a[i + 1] : true]]) : acc), []));
const MIME = { js: 'text/javascript', html: 'text/html', json: 'application/json', png: 'image/png', jpg: 'image/jpeg' };
function serve() {
  return new Promise((res) => { const s = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); } fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[f.split('.').pop()] || 'application/octet-stream' }); r.end(d); }); }).listen(0, () => res(s)); });
}
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
  if (A.stills) {
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
