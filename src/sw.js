import { version } from '../package.json'

const cachePatterns = /** @type {RegExp[]} */ ([])

const cacheUrls = CACHE_PATTERNS.filter((pat) => {
  const m = pat.match(/^\/(.*)\/([a-z]*)$/)
  if (!m) return true
  cachePatterns.push(new RegExp(m[1], m[2]))
})

/**
 * @param {ExtendableEvent} e
 */
async function onInstall(e) {
  const cache = await caches.open(version)
  await cache.addAll(['./', ...cacheUrls])
  self.skipWaiting()
}

/**
 * @param {ExtendableEvent} e
 */
async function onActivate(e) {
  for (const key of await caches.keys()) {
    if (key !== version) await caches.delete(key)
  }
}

/**
 * @param {FetchEvent} e
 */
async function onFetch(e) {
  let res = await caches.match(e.request, { ignoreSearch: true })
  if (res) return res
  res = await fetch(e.request)
  if (cachePatterns.some((re) => re.test(e.request.url))) {
    const cache = await caches.open(version)
    cache.put(e.request.url, res.clone())
  }
  return res
}

const sw = /** @type {ServiceWorkerGlobalScope} */ (self)

sw.addEventListener('install', (e) => e.waitUntil(onInstall(e)))
sw.addEventListener('activate', (e) => e.waitUntil(onActivate(e)))
sw.addEventListener('fetch', (e) => e.respondWith(onFetch(e)))
