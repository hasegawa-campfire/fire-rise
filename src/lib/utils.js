export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * @template T
 * @param {T[]} array
 * @returns {T[]}
 */
export function shuffleArray(array) {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item)
}

/**
 * @param {unknown} obj
 * @returns {obj is object}
 */
export function isObject(obj) {
  return typeof obj === 'object' && obj !== null
}

/**
 * @param {unknown} obj
 * @returns {obj is object}
 */
export function isPlaneObject(obj) {
  return isObject(obj) && (obj.constructor === Object || !obj.constructor)
}

/**
 * @template T
 * @param {SingleOrArray<T>} values
 * @returns {T[]}
 */
export function normalizeArray(values) {
  return Array.isArray(values) ? values : [values]
}

/**
 * @template {string} TKeyIn
 * @template TValueIn
 * @template {string} TKeyOut
 * @template TValueOut
 * @param {Record<TKeyIn, TValueIn>} object
 * @param {(entry: [TKeyIn, TValueIn]) => [TKeyOut, TValueOut]} mapper
 * @returns {Record<TKeyOut, TValueOut>}
 */
export function mapEntries(object, mapper) {
  // @ts-ignore entriesは型推論がうまくいかないので
  return Object.fromEntries(Object.entries(object).map((entry) => mapper(entry)))
}

/**
 * @template {object} T
 * @param {T} prototype
 * @param {Partial<T>} obj
 * @returns {T}
 */
export function createObject(prototype, obj) {
  return Object.create(prototype, Object.getOwnPropertyDescriptors(obj))
}

/**
 * オブジェクトJSONをパースする
 *
 * @param {unknown} json
 */
export function parseObject(json) {
  try {
    if (typeof json !== 'string') return null
    const value = JSON.parse(json)
    return isObject(value) ? value : null
  } catch {
    return null
  }
}

/**
 * 値を範囲内にマッピングする
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
export function mapRange(value, min, max) {
  return min + value * (max - min)
}
