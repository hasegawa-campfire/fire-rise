/**
 * camelCaseをkebab-caseに変換します
 *
 * @param {string} str - 変換する文字列
 * @returns {string} kebab-case文字列
 */
export function toKebabCase(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

/**
 * kebab-caseをcamelCaseに変換します
 *
 * @param {string} str - 変換する文字列
 * @returns {string} camelCase文字列
 */
export function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * 値がオブジェクトかどうかを判定します。
 *
 * @param {unknown} obj
 * @returns {obj is object}
 */
export function isObject(obj) {
  return typeof obj === 'object' && obj !== null
}

/**
 * 値がプレーンオブジェクトかどうかを判定します。
 *
 * @param {*} obj - チェックする値
 * @returns {obj is object} プレーンオブジェクトの場合true
 */
export function isPlainObject(obj) {
  return isObject(obj) && (obj.constructor === Object || !obj.constructor)
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
 * メソッドがどのプロトタイプで定義されているかを特定
 *
 * @param {object} target - 対象オブジェクト
 * @param {string | symbol} key - プロパティキー
 * @returns {object | null} メソッドが定義されているプロトタイプ、または null
 */
export function getPropertyOwner(target, key) {
  let proto = Object.getPrototypeOf(target)
  while (proto) {
    if (Object.hasOwn(proto, key)) {
      return proto
    }
    proto = Object.getPrototypeOf(proto)
  }
  return null
}
