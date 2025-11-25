/**
 * @fileoverview Service Worker for HTML Modules (.m.html)
 * *.m.htmlファイルをJavaScriptモジュールに変換してインターセプトします
 */

const sw = /** @type {ServiceWorkerGlobalScope} */ (self)

sw.addEventListener('install', (event) => {
  sw.skipWaiting()
})

sw.addEventListener('activate', (event) => {
  event.waitUntil(sw.clients.claim())
})

sw.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  if (url.pathname.endsWith('.m.html')) {
    event.respondWith(handleHtmlModuleRequest(event.request))
  }
})

/**
 * .m.htmlファイルをJavaScriptモジュールに変換して返す
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleHtmlModuleRequest(request) {
  try {
    const response = await fetch(request)

    if (!response.ok) {
      console.error('[HTML Modules SW] Failed to fetch HTML module:', response.status)
      return response
    }

    // HTMLモジュールをJavaScriptに変換
    const htmlText = await response.text()
    const jsCode = transformHtmlModuleToJs(htmlText)

    return new Response(jsCode, {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'X-HTML-Module-Transformed': 'true',
      },
    })
  } catch (error) {
    console.error('[HTML Modules SW] Error transforming HTML module:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(`console.error('Failed to transform HTML module: ${errorMessage}');`, {
      status: 500,
      statusText: 'Internal Server Error',
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
      },
    })
  }
}

// scriptタグの正規表現パターン
const SCRIPT_MODULE_PATTERN = /<script[^>]*type\s*=\s*["']module["'][^>]*>([\s\S]*?)<\/script>/i

/**
 * HTML Moduleの内容をJavaScriptコードに変換
 * @param {string} sourceHtml - .m.htmlファイルの内容
 * @returns {string} 変換されたJavaScriptコード
 */
function transformHtmlModuleToJs(sourceHtml) {
  const scriptMatch = sourceHtml.match(SCRIPT_MODULE_PATTERN)

  const scriptContent = scriptMatch ? scriptMatch[1].trim() : ''

  const htmlContent = scriptMatch ? sourceHtml.replace(SCRIPT_MODULE_PATTERN, '') : sourceHtml

  return `
const __import_meta_document__ = (${htmlToDoc})(${JSON.stringify(htmlContent)})

${scriptContent.replaceAll('import.meta.document', '__import_meta_document__')}
`.trim()
}

/**
 * HTMLをDocumentに変換
 * @param {string} html
 * @returns {Document}
 */
function htmlToDoc(html) {
  return new DOMParser().parseFromString(html, 'text/html')
}
