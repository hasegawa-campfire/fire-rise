/**
 * @fileoverview プロパティ管理システム
 * コンポーネントのprops定義からゲッター/セッターを生成し、reactiveオブジェクトと連携します
 */

/**
 * 属性値を適切な型にパースします
 *
 * @param {string | null} value - 属性値
 * @param {string} valueType - デフォルト値（型推論用）
 * @returns {any} パース結果
 */
export function parseAttributeValue(value, valueType) {
  if (valueType === 'boolean') {
    // boolean属性: 存在するだけでtrue、値が"false"の場合のみfalse
    return value !== 'false' && value !== '0' && value !== null
  }

  if (value === null) {
    return value
  }

  if (valueType === 'number') {
    const num = Number(value)
    return isNaN(num) ? value : num
  }

  // オブジェクトや配列の場合はJSON.parseを試みる
  if (valueType === 'object') {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }

  return value
}

/**
 * オブジェクトにプロパティのゲッター/セッターを設定します
 *
 * @param {object} target - 対象オブジェクト
 * @param {Record<string, unknown>} propsDefinition - props定義（例: {count: 0, name: 'default'}）
 * @param {Record<string, unknown>} reactiveProps - reactiveでラップされたpropsオブジェクト
 */
export function defineProperties(target, propsDefinition, reactiveProps) {
  /** @type {[string, PropertyDescriptor][]} */
  const descriptorEntries = Object.keys(propsDefinition).map((propName) => {
    /** @type {PropertyDescriptor} */
    const descriptor = {
      get() {
        return reactiveProps[propName]
      },
      set(value) {
        reactiveProps[propName] = value
      },
      enumerable: true,
      configurable: true,
    }

    return [propName, descriptor]
  })

  Object.defineProperties(target, Object.fromEntries(descriptorEntries))
}
