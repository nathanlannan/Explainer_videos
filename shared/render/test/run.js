const {chromium}=require('playwright');const {spawn}=require('child_process');const http=require('http');const fs=require('fs');const path=require('path');
const root=path.resolve(__dirname,'..');
const srv=http.createServer((q,s)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){s.writeHead(404);return s.end()}s.writeHead(200,{'Content-Type':f.endsWith('.js')?'text/javascript':f.endsWith('.html')?'text/html':'application/octet-stream'});s.end(d)})}).listen(8123);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('console',m=>console.log('page:',m.text()));
await p.goto('http://localhost:8123/test/box.html');await p.waitForFunction('window.ready');
console.log('GL:',await p.evaluate('glinfo()'));
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate','30','-i','-','-c:v','libx264','-crf','16','-pix_fmt','yuv420p',path.join(__dirname,'box_test.mp4')]);
const t0=Date.now();for(let f=0;f<90;f++){await p.evaluate(`renderFrame(${f})`);const buf=await p.screenshot({type:'png'});ff.stdin.write(buf)}
const dt=(Date.now()-t0)/90/1000;ff.stdin.end();await new Promise(r=>ff.on('close',r));
await p.evaluate('renderFrame(45)');await p.screenshot({path:path.join(__dirname,'box_still.png')});
console.log('sec/frame',dt.toFixed(3),'projected 5min',(dt*9000/60).toFixed(1),'min');await b.close();srv.close()})();
