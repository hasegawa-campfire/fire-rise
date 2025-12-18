// scriptタグの正規表現パターン
const SCRIPT_MODULE_PATTERN = /<script[^>]*type\s*=\s*["']module["'][^>]*>([\s\S]*?)<\/script>/i

/**
 * HTML Moduleの内容をJavaScriptコードに変換
 * @param {string} sourceHtml - .m.htmlファイルの内容
 * @returns {string} 変換されたJavaScriptコード
 */
export function transformHtmlModuleToJs(sourceHtml) {
  const scriptMatch = sourceHtml.match(SCRIPT_MODULE_PATTERN)

  const scriptContent = scriptMatch ? scriptMatch[1].trim() : ''

  const htmlContent = scriptMatch ? sourceHtml.replace(SCRIPT_MODULE_PATTERN, '') : sourceHtml

  return `
const __import_meta_document__ = (${htmlToDoc})(${JSON.stringify(htmlContent)})

${scriptContent.replaceAll('import.meta.document', '__import_meta_document__')}
`
}

/**
 * HTMLをDocumentに変換
 * @param {string} html
 * @returns {Document}
 */
function htmlToDoc(html) {
  return new DOMParser().parseFromString(html, 'text/html')
}
