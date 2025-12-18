import { transformHtmlModuleToJs } from '../util.mjs'

/**
 * .m.htmlリクエストをJavaScriptのレスポンスに変換する
 * @param {Request} request
 * @returns {Promise<Response> | null}
 */
export function adaptHtmlModuleRequest(request) {
  const url = new URL(request.url)

  if (url.pathname.endsWith('.m.html')) {
    return _adaptHtmlModuleRequest(request)
  }

  return null
}

/**
 * @param {Request} request
 */
async function _adaptHtmlModuleRequest(request) {
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
    return new Response(`Failed to transform HTML module: ${errorMessage}`, {
      status: 500,
      statusText: 'Internal Server Error',
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
      },
    })
  }
}
