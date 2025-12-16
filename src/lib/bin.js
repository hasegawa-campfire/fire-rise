/**
 * @param {string} path
 */
export async function loadBin(path) {
  const res = await fetch(`./bin/${path}`)
  return res.arrayBuffer()
}
