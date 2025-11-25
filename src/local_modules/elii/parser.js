/**
 * @fileoverview data-for式のパーサー
 * 例: "item in items" -> {itemName: 'item', indexName: null, listName: 'items'}
 * 例: "item, index in items" -> {itemName: 'item', indexName: 'index', listName: 'items'}
 */

/**
 * data-for式をパースします
 *
 * @param {string} expression - data-for式（例: "item in items" または "item, index in items"）
 * @returns {{itemName: string, indexName: string, listName: string}}
 */
export function parseForExpression(expression) {
  // " in " でマッチング（前後にスペースが必要）
  const match = expression.match(/^(.+?)\s+in\s+(.+)$/)
  if (!match) {
    throw Error(`Invalid data-for expression: "${expression}"`)
  }

  const [, leftPart, listName] = match

  // 左辺をカンマで分割してitem名とindex名を取得
  const leftItems = leftPart.split(',').map((s) => s.trim())

  if (leftItems.length > 2) {
    throw Error(`Invalid data-for expression: "${expression}"`)
  }

  return {
    itemName: leftItems[0],
    indexName: leftItems[1] ?? 'index',
    listName: listName.trim(),
  }
}

/**
 * 式を評価します
 *
 * @param {string} expression - 評価する式（JavaScript式として評価される）
 * @param {object} context - 評価コンテキスト
 * @returns {any} 評価結果
 */
export function evaluateExpression(expression, context) {
  try {
    // with文を使用してcontextのプロパティをスコープに追加
    // Functionコンストラクタは非strict modeで実行されるため、withが使える
    const func = new Function('__context__', `with (__context__) { return (${expression}) }`)
    return func(context)
  } catch (e) {
    console.warn(`Failed to evaluate expression: ${expression}`, e)
    return undefined
  }
}

/**
 * 代入式を評価します
 *
 * @param {string} expression - 評価する式（JavaScript式として評価される）
 * @param {object} context - 評価コンテキスト
 * @param {any} value - 代入する値
 * @returns {any} 評価結果
 */
export function evaluateAssignmentExpression(expression, context, value) {
  try {
    // with文を使用してcontextのプロパティをスコープに追加
    // Functionコンストラクタは非strict modeで実行されるため、withが使える
    const func = new Function('__context__', '__value__', `with (__context__) { (${expression} = __value__) }`)
    return func(context, value)
  } catch (e) {
    console.warn(`Failed to evaluate assignment expression: ${expression} = ${value}`, e)
    return undefined
  }
}
