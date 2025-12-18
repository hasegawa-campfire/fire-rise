import { adaptHtmlModuleRequest } from './local_modules/html-modules/sw-util/index.js'

const sw = /** @type {ServiceWorkerGlobalScope} */ (self)

sw.addEventListener('install', (event) => {
  sw.skipWaiting()
})

sw.addEventListener('activate', (event) => {
  event.waitUntil(sw.clients.claim())
})

sw.addEventListener('fetch', (event) => {
  const response = adaptHtmlModuleRequest(event.request)
  if (response) event.respondWith(response)
})
