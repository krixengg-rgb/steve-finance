// Steve service worker – offline cache. Data never goes through here: it lives in localStorage on the device.
const CACHE='steve-3ba3dab036',ASSETS=["./", "index.html", "manifest.webmanifest", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "lib/chart.umd.min.js", "lib/papaparse.min.js", "lib/pdf.min.js", "lib/pdf.worker.min.js"];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.origin===location.origin){ // app shell: cache first, fall back to network
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c))}return res}).catch(()=>r.mode==='navigate'?caches.match('index.html'):Response.error())));return}
 if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){ // optional web font: stale-while-revalidate
  e.respondWith(caches.open(CACHE).then(c=>c.match(r).then(m=>{const f=fetch(r).then(res=>{c.put(r,res.clone());return res}).catch(()=>m);return m||f})))}
});
