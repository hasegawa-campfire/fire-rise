/**
 * @fileoverview ディレクティブ処理システム
 * reactiveシステムと統合し、data-*ディレクティブを処理します
 */

import { batch, batchify, createEffect, createRoot, onCleanup, reactive, untrack } from './reactive.js'
import { evaluateExpression, parseForExpression, evaluateAssignmentExpression } from './parser.js'
import { isComponent } from './component.js'
import { createObject, toCamelCase } from './utils.js'

/**
 * data-refディレクティブを処理します（DOM要素への参照）
 *
 * @param {HTMLElement | SVGElement} element - 対象要素
 * @param {string} targetName - ターゲット名(未使用)
 * @param {string} expression - 評価する式（代入先）
 * @param {object} context - 評価コンテキスト
 */
export function processRef(element, targetName, expression, context) {
  // 要素を代入
  evaluateAssignmentExpression(expression, context, element)

  // クリーンアップ時にnullを代入
  onCleanup(() => {
    evaluateAssignmentExpression(expression, context, null)
  })
}

/**
 * data-model-*ディレクティブを処理します（双方向バインディング）
 *
 * @param {HTMLElement | SVGElement} element - 対象要素
 * @param {string} targetName - バインドするプロパティ名（例: "value", "checked", "value-as-number"）
 * @param {string} expression - 評価する式
 * @param {object} context - 評価コンテキスト
 */
export function processModel(element, targetName, expression, context) {
  targetName = toCamelCase(targetName)

  // 読み: state → element[targetName]
  createEffect(() => {
    const value = evaluateExpression(expression, context)
    // @ts-ignore - 動的プロパティアクセス
    element[targetName] = value
  })

  // 書き: element[targetName] → state
  const updateValue = () => {
    // @ts-ignore - 動的プロパティアクセス
    const value = element[targetName]
    evaluateAssignmentExpression(expression, context, value)
  }

  // eliiコンポーネントの場合: リアクティブプロパティを追跡
  // 通常のDOM要素の場合: inputイベントで追跡
  if (isComponent(element)) {
    createEffect(updateValue)
  } else {
    element.addEventListener('input', updateValue)
    onCleanup(() => element.removeEventListener('input', updateValue))
  }
}

/**
 * data-textディレクティブを処理します
 *
 * @param {HTMLElement | SVGElement} element - 対象要素
 * @param {string} targetName - ターゲット名(未使用)
 * @param {string} expression - 評価する式
 * @param {object} context - 評価コンテキスト
 */
export function processText(element, targetName, expression, context) {
  createEffect(() => {
    const value = evaluateExpression(expression, context)
    element.textContent = value ?? ''
  })
}

/**
 * data-htmlディレクティブを処理します
 *
 * @param {HTMLElement | SVGElement} element - 対象要素
 * @param {string} targetName - ターゲット名(未使用)
 * @param {string} expression - 評価する式
 * @param {object} context - 評価コンテキスト
 */
export function processHtml(element, targetName, expression, context) {
  createEffect(() => {
    const value = evaluateExpression(expression, context)
    element.innerHTML = value ?? ''
  })
}

/**
 * data-classディレクティブを処理します
 *
 * @param {HTMLElement | SVGElement} element - 対象要素
 * @param {string} targetName - ターゲット名(クラス名)
 * @param {string} expression - 評価する式
 * @param {object} context - 評価コンテキスト
 */
export function processClass(element, targetName, expression, context) {
  const staticClasses = element.className

  createEffect(() => {
    const value = evaluateExpression(expression, context)

    if (targetName) {
      element.classList.toggle(targetName, value)
    } else {
      element.setAttribute('class', normalizeClass([staticClasses, value]))
    }
  })
}

/**
 * data-styleディレクティブを処理します
 *
 * @param {HTMLElement | SVGElement} element - 対象要素
 * @param {string} targetName - ターゲット名(スタイル名)
 * @param {string} expression - 評価する式
 * @param {object} context - 評価コンテキスト
 */
export function processStyle(element, targetName, expression, context) {
  targetName = targetName.replace(/^-/, '--')

  createEffect(() => {
    const value = evaluateExpression(expression, context)

    if (targetName) {
      element.style.setProperty(targetName, value)
    } else {
      if (typeof value === 'string') {
        element.setAttribute('style', value)
      } else if (value == null) {
        element.removeAttribute('style')
      } else if (typeof value === 'object') {
        Object.assign(element.style, value)
      }
    }
  })
}

/**
 * data-onディレクティブを処理します
 *
 * @param {HTMLElement | SVGElement} element - 対象要素
 * @param {string} targetName - ターゲット名(イベント名)
 * @param {string} expression - 評価する式
 * @param {object} context - 評価コンテキスト
 */
export function processOn(element, targetName, expression, context) {
  createEffect(() => {
    const value = evaluateExpression(expression, context)

    if (typeof value === 'function') {
      const batchedFn = batchify(value)
      element.addEventListener(targetName, batchedFn)
      onCleanup(() => element.removeEventListener(targetName, batchedFn))
    }
  })
}

/**
 * data-propディレクティブを処理します
 *
 * @param {HTMLElement | SVGElement} element - 対象要素
 * @param {string} targetName - ターゲット名(プロパティ名)
 * @param {string} expression - 評価する式
 * @param {object} context - 評価コンテキスト
 */
export function processProp(element, targetName, expression, context) {
  targetName = toCamelCase(targetName)

  createEffect(() => {
    const value = evaluateExpression(expression, context)
    // @ts-ignore - 動的プロパティアクセス
    element[targetName] = value
  })
}

/**
 * data-attrディレクティブを処理します
 *
 * @param {HTMLElement | SVGElement} element - 対象要素
 * @param {string} targetName - ターゲット名(属性名)
 * @param {string} expression - 評価する式
 * @param {object} context - 評価コンテキスト
 */
export function processAttr(element, targetName, expression, context) {
  createEffect(() => {
    const value = evaluateExpression(expression, context)

    if (typeof value === 'boolean' || value == null) {
      element.toggleAttribute(targetName, value)
    } else {
      element.setAttribute(targetName, value)
    }
  })
}

/**
 * display:contentsを持つラッパー要素を作成します
 *
 * @param {string} type - ラッパーの種類（if/for/for-item）
 * @returns {HTMLElement} ラッパー要素
 */
function createWrapper(type) {
  const wrapper = document.createElement('div')
  wrapper.style.display = 'contents'
  wrapper.setAttribute(`data-elii-${type}`, '')
  return wrapper
}

/**
 * data-ifディレクティブを処理します
 *
 * @param {HTMLTemplateElement} templateElement - template要素
 * @param {string} expression - 条件式
 * @param {object} context - 評価コンテキスト
 */
export function processIf(templateElement, expression, context) {
  // ラッパー要素を作成してtemplateと置き換え
  const wrapper = createWrapper('if')
  templateElement.replaceWith(wrapper)

  let previousCondition = false
  /** @type {(() => void) | null} */
  let currentDispose = null

  // 親スコープがクリーンアップされる際に、コンテンツもクリーンアップ
  onCleanup(() => currentDispose?.())

  createEffect(() => {
    const condition = Boolean(evaluateExpression(expression, context))

    // 条件が変わっていない場合は何もしない
    if (condition === previousCondition) {
      return
    }
    previousCondition = condition

    if (condition) {
      // テンプレートの内容をクローンして処理
      const fragment = templateElement.content.cloneNode(true)

      // 新しいcreateRootスコープで処理
      currentDispose = createRoot((dispose) => {
        processDirectives(fragment, context)
        return dispose
      })

      // ラッパーの中身を置き換え
      wrapper.replaceChildren(fragment)
    } else {
      // 既存のコンテンツをクリーンアップ
      if (currentDispose) {
        currentDispose()
        currentDispose = null
      }

      // 条件がfalseなら空にする
      wrapper.replaceChildren()
    }
  })
}

/**
 * @typedef {Object} ForItemInfo
 * @property {HTMLElement} wrapper - アイテムラッパー要素
 * @property {object} context - アイテムコンテキスト
 * @property {() => void} dispose - クリーンアップ関数
 */

/**
 * data-forディレクティブを処理します
 *
 * @param {HTMLTemplateElement} templateElement - template要素
 * @param {string} expression - for式
 * @param {object} context - 評価コンテキスト
 * @param {string | null} [keyExpr] - キー式（data-key属性で指定）
 */
export function processFor(templateElement, expression, context, keyExpr = null) {
  // ラッパー要素を作成してtemplateと置き換え
  const wrapper = createWrapper('for')
  templateElement.replaceWith(wrapper)

  const parsed = parseForExpression(expression)

  // キーによるアイテムラッパーのマッピング
  /** @type {Map<string, ForItemInfo>} */
  let itemInfoMap = new Map()

  // 親スコープがクリーンアップされる際に、全アイテムもクリーンアップ
  onCleanup(() => {
    for (const itemInfo of itemInfoMap.values()) {
      itemInfo.dispose()
    }
  })

  createEffect(() => {
    const isDebugTarget = expression === 'blockLine, lineIndex in store.blockLines'

    const list = evaluateExpression(parsed.listName, context)

    if (!Array.isArray(list)) {
      console.warn(`data-for expression "${parsed.listName}" did not evaluate to an array`)
      return
    }

    /** @type {Map<string, ForItemInfo>} */
    const newItemInfoMap = new Map()

    for (const [index, item] of list.entries()) {
      const itemContext = reactive(
        createObject(context, {
          [parsed.itemName]: item,
          [parsed.indexName]: index,
        })
      )

      // キーを生成
      const key = keyExpr ? untrack(() => evaluateExpression(keyExpr, itemContext)) : index

      // 既存のアイテムラッパーを再利用
      let itemInfo = itemInfoMap.get(key)
      itemInfoMap.delete(key)

      if (itemInfo) {
        batch(() => {
          // @ts-ignore - Object.create で作成されたコンテキストへの動的プロパティ代入
          itemInfo.context[parsed.itemName] = item
          // @ts-ignore - Object.create で作成されたコンテキストへの動的プロパティ代入
          itemInfo.context[parsed.indexName] = index
        })
      } else {
        // 新しいアイテムラッパーを作成
        const itemWrapper = createWrapper('for-item')

        // テンプレートの内容をクローンして処理
        const itemFragment = templateElement.content.cloneNode(true)

        // 新しいcreateRootスコープで処理
        const dispose = createRoot((dispose) => {
          processDirectives(itemFragment, itemContext)
          return dispose
        })

        itemWrapper.append(itemFragment)

        itemInfo = { wrapper: itemWrapper, context: itemContext, dispose }
      }

      if (newItemInfoMap.has(key)) {
        throw Error(`Duplicate key "${key}" in data-for directive`)
      }
      newItemInfoMap.set(key, itemInfo)
    }

    // 使われなくなったアイテムをクリーンアップ
    for (const itemInfo of itemInfoMap.values()) {
      itemInfo.dispose()
    }

    // ラッパーの中身を置き換え
    replaceChildren(wrapper, ...newItemInfoMap.values().map(({ wrapper }) => wrapper))

    // マップを更新
    itemInfoMap = newItemInfoMap
  })
}

/**
 * 子要素を効率的に置き換えます（差分更新）
 * 既存の要素で位置が変わらないものはそのままにし、
 * 必要な操作（削除、挿入、移動）だけを行います。
 *
 * @param {HTMLElement} element - 対象要素
 * @param {Node[]} children - 新しい子要素の配列
 */
function replaceChildren(element, ...children) {
  // 1. 最初に不要な要素を削除
  for (const existingChild of Array.from(element.childNodes)) {
    if (!children.includes(existingChild)) {
      element.removeChild(existingChild)
    }
  }

  // 2. 新しい子要素を順番に配置
  for (const [index, newChild] of children.entries()) {
    const existingChild = element.childNodes[index] ?? null

    // 同じ位置に同じ要素があればスキップ
    if (existingChild === newChild) continue

    // 新しい要素を適切な位置に挿入または移動
    element.insertBefore(newChild, existingChild)
  }
}

/**
 * ノードとその子孫要素のディレクティブを処理します
 *
 * @param {Node} root - 対象ノード（Element または DocumentFragment）
 * @param {object} context - 評価コンテキスト
 */
export function processDirectives(root, context) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
  /** @type {Node | null} */
  let nextNode = walker.currentNode

  while (nextNode) {
    const node = nextNode
    nextNode = walker.nextNode()

    // template要素の特殊ディレクティブを処理
    if (node instanceof HTMLTemplateElement) {
      if (node.dataset.if) {
        processIf(node, node.dataset.if, context)
        continue
      }

      if (node.dataset.for) {
        processFor(node, node.dataset.for, context, node.dataset.key ?? null)
        continue
      }
    }

    if (node instanceof HTMLElement || node instanceof SVGElement) {
      for (const attr of [...node.attributes]) {
        for (const [key, process] of Object.entries(processAttributes)) {
          const prefix = `data-${key}`
          if (attr.name.startsWith(`${prefix}-`) || attr.name === prefix) {
            process(node, attr.name.slice(prefix.length + 1), attr.value, context)
            node.removeAttributeNode(attr)
          }
        }
      }
    }
  }
}

/**
 * @type {Record<string, (node: HTMLElement | SVGElement, targetName: string, expression: string, context: object) => void>}
 */
const processAttributes = {
  ref: processRef,
  model: processModel,
  text: processText,
  html: processHtml,
  class: processClass,
  style: processStyle,
  on: processOn,
  prop: processProp,
  attr: processAttr,
}

/**
 * class属性の値を正規化します
 *
 * @param {unknown} value - class値
 * @returns {string} 正規化されたclass文字列
 */
function normalizeClass(value) {
  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean).map(normalizeClass).join(' ')
  }

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value)
      .filter(([, enabled]) => enabled)
      .map(([className]) => className)
      .join(' ')
  }

  return ''
}
