import { reactive, untrack } from 'elii'

/** @type {Record<string, Promise<ArrayBuffer>>} */
const bufferCache = {}

{
  const files = ASSET_FILES
  const promise = fetch('./assets.bin').then((res) => res.arrayBuffer())
  for (const [path, [offset, size]] of files) {
    bufferCache[path] = promise.then((buf) => buf.slice(offset, offset + size))
  }
}

/**
 * @param {string} path
 */
export function loadAsset(path) {
  return bufferCache[path]
}

/** @type {Record<string, string>} */
const urlCache = reactive({})

const minGif = new Uint8Array([
  71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 255, 255, 255, 0, 0, 0, 33, 249, 4, 1, 0, 0, 0, 0, 44, 0, 0, 0, 0, 1,
  0, 1, 0, 0, 2, 2, 68, 1, 0, 59,
])

/** @type {Record<string, string>} */
const placeholders = {
  image: URL.createObjectURL(new Blob([minGif], { type: 'image/gif' })),
}

/**
 * @param {string} path
 */
export function loadAssetUrl(path, type = 'image') {
  return {
    toString() {
      const cachedUrl = urlCache[path]
      if (cachedUrl) return cachedUrl

      const buffPromise = bufferCache[path]
      if (!buffPromise) throw new Error(`Asset file not found: ${path}`)

      const placeholderDataUrl = placeholders[type]
      if (!placeholderDataUrl) throw new Error(`Placeholder not found: ${type}`)

      untrack(() => {
        urlCache[path] = placeholderDataUrl
      })

      buffPromise.then((buff) => {
        const url = URL.createObjectURL(new Blob([buff]))
        urlCache[path] = url
      })

      return placeholderDataUrl
    },
  }
}
