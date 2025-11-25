/**
 * @fileoverview ディレクティブ処理システム
 * reactiveシステムと統合し、data-*ディレクティブを処理します
 */

import { batch, createEffect, createRoot, onCleanup, reactive, untrack } from './reactive.js'
import { evaluateExpression, parseForExpression, evaluateAssignmentExpression } from './parser.js'
import { isComponent } from './component.js'
import { createObject, toKebabCase } from './utils.js'

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

/**
 * data-bind-*ディレクティブを処理します
 *
 * @param {HTMLElement | SVGElement} element - 対象要素
 * @param {string} bindTarget - バインド対象（例: "text", "html", "class", "value"）
 * @param {string} expression - 評価する式
 * @param {object} context - 評価コンテキスト
 */
export function processBind(element, bindTarget, expression, context) {
  const staticClasses = element.className

  createEffect(() => {
    const value = evaluateExpression(expression, context)

    if (bindTarget === 'text') {
      element.textContent = value ?? ''
    } else if (bindTarget === 'html') {
      element.innerHTML = value ?? ''
    } else if (/^class[A-Z]/.test(bindTarget)) {
      const className = toKebabCase(bindTarget.slice(5)).replace(/^-/, '')
      element.classList.toggle(className, value)
    } else if (bindTarget === 'class') {
      // 既存のclass属性を保持しつつ、動的なclassを追加
      element.setAttribute('class', normalizeClass([staticClasses, value]))
    } else if (/^style[-A-Z]/.test(bindTarget)) {
      const stylePropName = toKebabCase(bindTarget.slice(5)).replace(/^-(?!-)/, '')
      element.style.setProperty(stylePropName, value)
    } else if (bindTarget === 'style') {
      // style属性の特別処理
      if (typeof value === 'string') {
        // 文字列なら属性として設定
        element.setAttribute('style', value)
      } else if (value == null) {
        // nullまたはundefinedならstyle属性を削除
        element.removeAttribute('style')
      } else if (typeof value === 'object') {
        // オブジェクトならstyleプロパティに適用
        Object.assign(element.style, value)
      }
    } else {
      // 通常の属性/プロパティ
      if (bindTarget in element) {
        // プロパティとして設定
        // @ts-ignore - 動的プロパティアクセス
        element[bindTarget] = value
      } else {
        // 属性として設定
        if (value == null || value === false) {
          element.removeAttribute(bindTarget)
        } else {
          element.setAttribute(bindTarget, value === true ? '' : String(value))
        }
      }
    }
  })
}

/**
 * data-refディレクティブを処理します（DOM要素への参照）
 *
 * @param {HTMLElement | SVGElement} element - 対象要素
 * @param {string} expression - 評価する式（代入先）
 * @param {object} context - 評価コンテキスト
 */
export function processRef(element, expression, context) {
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
 * @param {string} propName - バインドするプロパティ名（例: "value", "checked", "valueAsNumber"）
 * @param {string} expression - 評価する式
 * @param {object} context - 評価コンテキスト
 */
export function processModel(element, propName, expression, context) {
  // 読み: state → element[propName]
  createEffect(() => {
    const value = evaluateExpression(expression, context)
    // @ts-ignore - 動的プロパティアクセス
    element[propName] = value
  })

  // 書き: element[propName] → state
  const updateValue = () => {
    // @ts-ignore - 動的プロパティアクセス
    const value = element[propName]
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
      // data-ref 属性を処理（DOM要素への参照）
      if (node.dataset.ref) {
        processRef(node, node.dataset.ref, context)
        delete node.dataset.ref
      }

      // data-bind-* 属性を処理（dataset.bindXxx形式）
      for (const [key, expression] of Object.entries(node.dataset)) {
        // bindで始まり、その後が大文字で始まる場合（例: bindText, bindClass）
        const bindPropName = getTargetName('bind', key)
        if (bindPropName && expression) {
          processBind(node, bindPropName, expression, context)
          delete node.dataset[key]
        }

        // modelで始まり、その後が大文字で始まる場合（例: modelValue, modelChecked）
        const modelPropName = getTargetName('model', key)
        if (modelPropName && expression) {
          processModel(node, modelPropName, expression, context)
          delete node.dataset[key]
        }
      }
    }
  }
}

/**
 * ターゲット名を取得します
 * @param {string} prefix - プレフィックス（例: "bind", "model"）
 * @param {string} key - キー（例: "bindText", "modelValue", "modelChecked"）
 * @returns {string | null} - ターゲット名（例: "text", "class", "value"）
 */
function getTargetName(prefix, key) {
  if (key.startsWith(prefix)) {
    const rest = key.slice(prefix.length)
    if (/^[A-Z]/.test(rest)) {
      return rest.charAt(0).toLowerCase() + rest.slice(1)
    }
  }
  return null
}
