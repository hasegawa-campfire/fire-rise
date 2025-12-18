import { readFile, glob } from 'node:fs/promises'
import * as esbuild from 'esbuild'
import { htmlPlugin } from '@craftamap/esbuild-plugin-html'
import { copy } from 'esbuild-plugin-copy'
import * as cheerio from 'cheerio'
import { packAssets } from './src/lib/asset-util.mjs'
import { htmlModules } from 'html-modules/esbuild-plugin'

const $ = cheerio.load(await readFile('src/index.html'))
$('[data-prod-remove]').remove()
$('template[data-prod-unwrap]').replaceWith(function () {
  return $(this).contents()
})

await esbuild.build({
  bundle: true,
  entryPoints: ['src/main.js'],
  minify: true,
  metafile: true,
  outdir: 'dist/',
  format: 'esm',
  define: {
    ASSET_FILES: JSON.stringify(await packAssets()),
  },
  plugins: [
    htmlModules(),
    htmlPlugin({
      files: [
        {
          entryPoints: ['src/main.js'],
          filename: 'index.html',
          htmlTemplate: $.html(),
          scriptLoading: 'module',
        },
      ],
    }),
    copy({
      assets: [
        { from: './src/static/**/*', to: './static' },
        { from: './src/manifest.json', to: './' },
      ],
    }),
  ],
  alias: {
    '@': './src',
    'package.json': './package.json',
  },
})

const cachePaths = await Array.fromAsync(glob('**/*.*', { cwd: './dist', exclude: ['index.html'] }))

await esbuild.build({
  bundle: true,
  entryPoints: ['src/sw.js'],
  minify: true,
  outdir: 'dist/',
  format: 'esm',
  define: {
    CACHE_PATTERNS: JSON.stringify([...cachePaths, String(/fonts.(googleapis|gstatic).com/)]),
  },
})
