/**
 * シード付き乱数生成器を作成する（Mulberry32）
 * @param {number} [initialSeed]
 */
export function createRandom(initialSeed) {
  let seed = initialSeed ?? Math.floor(Math.random() * 0x100000000)

  const next = () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000
  }

  const fork = () => {
    return createRandom(Math.floor(next() * 0x100000000))
  }

  return {
    next,
    fork,
    get seed() {
      return seed
    },
    set seed(value) {
      seed = value
    },
  }
}
