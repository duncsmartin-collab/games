/* Game Box menu: saved for offline use. Each game folder has its own saver too. */
const CACHE='gamebox-v1';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','brickton/cover.jpg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('gamebox-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  if(req.mode==='navigate'){e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(CACHE).then(k=>k.put(req,c));return r;}).catch(()=>caches.match(req).then(r=>r||caches.match('index.html'))));return;}
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok||r.type==='opaque'){const c=r.clone();caches.open(CACHE).then(k=>k.put(req,c));}return r;})));
});
