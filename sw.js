/* TGAT1 English Studio offline shell. Caches only static app files, never learner data. */
const CACHE_NAME='tgat1-studio-v13-static';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{const cache=await caches.open(CACHE_NAME);await cache.addAll(CORE);await self.skipWaiting();})());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{const names=await caches.keys();await Promise.all(names.filter(n=>n.startsWith('tgat1-studio-')&&n!==CACHE_NAME).map(n=>caches.delete(n)));await self.clients.claim();})());
});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    const cached=await cache.match(request);
    const refresh=fetch(request).then(response=>{
      if(response&&response.ok){cache.put(request,response.clone()).catch(()=>{});}
      return response;
    }).catch(()=>null);
    if(cached){event.waitUntil(refresh);return cached;}
    const response=await refresh;
    if(response)return response;
    if(request.mode==='navigate')return (await cache.match('./index.html'))||Response.error();
    return Response.error();
  })());
});
