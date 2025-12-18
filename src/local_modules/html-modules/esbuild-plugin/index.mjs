import { readFile } from 'node:fs/promises'
import { minify } from 'html-minifier-next'
import { transformHtmlModuleToJs } from '../util.mjs'

export { transformHtmlModuleToJs }

/**
 * @returns {import('esbuild').Plugin}
 */
export function htmlModules() {
  return {
    name: 'html-modules',
    async setup(build) {
      build.onLoad({ filter: /\.m\.html$/ }, async (args) => {
        const html = await readFile(args.path, 'utf8')

        const minifiedHtml = await minify(html, {
          minifyCSS: true,
          minifyJS: false,
          collapseWhitespace: true,
        })

        const script = await transformHtmlModuleToJs(minifiedHtml)

        return { contents: script, loader: 'js' }
      })
    },
  }
}
