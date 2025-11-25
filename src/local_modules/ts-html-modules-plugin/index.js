/**
 * @type {import('typescript').server.PluginModuleFactory}
 */
module.exports = (ts) => {
  return {
    create({ languageService, languageServiceHost: host }) {
      // 元のメソッドを保存
      const { getScriptSnapshot, getScriptKind, resolveModuleNameLiterals } = host

      // .m.htmlファイルをモジュールとして解決
      if (resolveModuleNameLiterals) {
        host.resolveModuleNameLiterals = (...args) => {
          const [moduleLiterals, containingFile, , options] = args

          // デフォルトの解決を実行
          const resolvedModules = resolveModuleNameLiterals.call(host, ...args)

          return resolvedModules.map((resolvedModule, index) => {
            // 既に解決済みの場合はそのまま返す
            if (resolvedModule?.resolvedModule) {
              return resolvedModule
            }

            // モジュール名を取得（文字列リテラルまたは文字列）
            const moduleLiteral = moduleLiterals[index]
            const moduleName = typeof moduleLiteral === 'string' ? moduleLiteral : moduleLiteral.text

            // .m.htmlファイルのインポートを処理
            if (moduleName.endsWith('.m.html')) {
              // .m.htmlファイルを解決（宣言ファイルが存在するものとして誤魔化す）
              const result = ts.typescript.resolveModuleName(moduleName, containingFile, options, {
                ...host,
                fileExists: (path) => ts.typescript.sys.fileExists(toHtmlFileName(path)),
                readFile: (path) => ts.typescript.sys.readFile(toHtmlFileName(path)),
              })

              if (result.resolvedModule) {
                // .m.htmlファイルをJavaScriptモジュールとして扱う
                return {
                  resolvedModule: {
                    ...result.resolvedModule,
                    resolvedFileName: toHtmlFileName(result.resolvedModule.resolvedFileName),
                    extension: ts.typescript.Extension.Js,
                  },
                }
              }

              // ファイルが存在しない場合は既存の結果を返す（またはundefined）
              return resolvedModule || { resolvedModule: undefined }
            }

            // .m.html以外は既存の結果を返す
            return resolvedModule
          })
        }
      }

      // .m.htmlファイルをJavaScriptとして提供
      if (getScriptSnapshot) {
        host.getScriptSnapshot = (fileName) => {
          // 元のgetScriptSnapshotでファイルを取得
          const snapshot = getScriptSnapshot.call(host, fileName)

          // .m.htmlファイルでない場合は元の処理を使用
          if (!snapshot || !fileName.endsWith('.m.html')) return snapshot

          // 元のファイル内容（HTML）を取得
          const htmlContent = snapshot.getText(0, snapshot.getLength())

          // HTMLからスクリプトを抽出
          const scriptContent = htmlToScript(htmlContent)

          // ScriptSnapshotを作成
          return ts.typescript.ScriptSnapshot.fromString(scriptContent)
        }
      }

      // .m.htmlファイルをJavaScriptとして扱う
      if (getScriptKind) {
        host.getScriptKind = (fileName) => {
          if (fileName.endsWith('.m.html')) {
            return ts.typescript.ScriptKind.JS
          }

          return getScriptKind.call(host, fileName)
        }
      }

      return languageService
    },
  }
}

/**
 * 宣言の元ファイル名をHTMLファイル名に変換
 * @param {string} fileName
 */
function toHtmlFileName(fileName) {
  return fileName.replace(/\.m\.d\.html\.ts$/, '.m.html')
}

/**
 * スクリプト以外をマスクすることで HTML をスクリプトに変換する
 * @param {string} html
 */
function htmlToScript(html) {
  const match = html.match(reHtmlWithoutScript)
  if (!match) return ''

  const [, beforeScript, scriptContent, afterScript] = match
  const maskedBeforeScript = beforeScript.replaceAll(/./g, ' ')
  const maskedAfterScript = afterScript.replaceAll(/./g, ' ')

  return `${maskedBeforeScript}${scriptContent}${maskedAfterScript}`
}

const reHtmlWithoutScript = /([\s\S]*?<script[^>]*>)([\s\S]*?)(<\/script>[\s\S]*)/i
