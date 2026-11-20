const CACHE="kardia-v14";
const CORE=["./","./index.html","./manifest.webmanifest","./icon-180.png?v=k10","./icon-192.png?v=k10","./icon-512.png?v=k10","./icon-maskable-512.png?v=k10"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  if(r.mode==="navigate"){ // pagina: întâi rețeaua, ca actualizările să ajungă imediat; offline din cache
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put("./index.html",cp));return res}).catch(()=>caches.match("./index.html")));return}
  const same=new URL(r.url).origin===location.origin;
  if(same){ // fișierele aplicației: întâi rețeaua, ca orice actualizare să ajungă imediat
    e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r)));return}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res&&(res.ok||res.type==="opaque")){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})));
});

self.addEventListener("push",e=>{let d={};try{d=e.data?e.data.json():{}}catch(x){d={body:e.data?e.data.text():""}}
  const tab=d.tab||"azi";
  e.waitUntil(self.registration.showNotification(d.title||"Kardia",{body:d.body||"",icon:"./icon-192.png?v=k10",badge:"./icon-192.png?v=k10",tag:"kardia-"+tab,renotify:true,data:{url:"./#"+tab}}));
});
self.addEventListener("notificationclick",e=>{e.notification.close();
  const url=new URL((e.notification.data&&e.notification.data.url)||"./",self.registration.scope).href;
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>{for(const c of cs){if(c.url.startsWith(self.registration.scope)&&"focus" in c){if("navigate" in c)c.navigate(url).catch(()=>{});return c.focus()}}return clients.openWindow(url)}));
});
