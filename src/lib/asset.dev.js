/**
 * @param {string} path
 */
export async function loadAsset(path) {
  const res = await fetch(`./assets/${path}`)
  return res.arrayBuffer()
}

/**
 * @param {string} path
 */
export function loadAssetUrl(path) {
  const url = `./assets/${path}`
  return {
    toString: () => url,
  }
}
