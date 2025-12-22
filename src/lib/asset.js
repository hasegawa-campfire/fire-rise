/** @type {Record<string, ArrayBuffer>} */
const bufferCache = {}

{
  for (const [path, [offset, size]] of ASSET_FILES) {
    const buffer = ASSET_BUFFER?.slice(offset, offset + size)
    if (buffer) {
      bufferCache[path] = buffer
    }
  }
}

/**
 * @param {string} path
 */
export async function loadAsset(path) {
  return bufferCache[path]
}

/** @type {Record<string, string>} */
const urlCache = {}

/**
 * @param {string} path
 */
export function loadAssetUrl(path) {
  const cachedUrl = urlCache[path]
  if (cachedUrl) return cachedUrl

  const buffer = bufferCache[path]
  if (!buffer) throw new Error(`Asset file not found: ${path}`)

  const url = URL.createObjectURL(new Blob([buffer]))
  urlCache[path] = url

  return url
}
