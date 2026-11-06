/* Fetch word games offline cache: keeps working with no internet once it has loaded once */
const CACHE='fetch-v1';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('fetch-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  /* the game page: network first so updates arrive, saved copy when offline */
  if(req.mode==='navigate'||url.pathname.endsWith('/index.html')){
    e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(CACHE).then(k=>k.put('index.html',c));return r;}).catch(()=>caches.match(req).then(r=>r||caches.match('index.html')).then(r=>r||caches.match('./'))));return;
  }
  /* icons and fonts: saved copy first */
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok||r.type==='opaque'){const c=r.clone();caches.open(CACHE).then(k=>k.put(req,c));}return r;})));
});
