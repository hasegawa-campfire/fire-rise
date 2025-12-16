/**
 * @fileoverview コンポーネント定義とCustom Elements登録
 */

import { reactive, createRoot } from './reactive.js'
import { defineProperties, parseAttributeValue } from './props.js'
import { processDirectives } from './directives.js'
import { toCamelCase, toKebabCase } from './utils.js'

/**
 * eliiコンポーネントを識別するためのプライベートシンボル
 */
const ELII_COMPONENT = Symbol('eliiComponent')

/**
 * 要素がeliiコンポーネントかどうかを判定します
 *
 * @param {any} element - 判定する要素
 * @returns {boolean} eliiコンポーネントの場合true
 */
export function isComponent(element) {
  return element && element[ELII_COMPONENT] === true
}

/**
 * コンポーネントを定義してCustom Elementsとして登録します
 *
 * @template {Record<string, unknown>} TProps
 * @template {Record<string, unknown> & { $expose?: Record<string, unknown> }} TSetupResult
 * @param {object} options - コンポーネントオプション
 * @param {string} options.tag - カスタム要素のタグ名（例: 'app-root'）
 * @param {Document} options.document - HTMLモジュールのimport.meta.document
 * @param {TProps} [options.props] - プロパティ定義（例: {count: 0, name: 'default'}）
 * @param {(props: TProps) => TSetupResult} [options.setup] - セットアップ関数
 * @returns {HTMLElement & TProps & TSetupResult['$expose']} コンポーネントクラス
 */
export function defineComponent(options) {
  const { tag, document: moduleDocument, props: propsDefinition = /** @type {TProps} */ ({}), setup } = options

  // HTML Moduleからtemplateとstyleを抽出
  const templateElement = moduleDocument.querySelector('template')
  const styleElement = moduleDocument.querySelector('style')

  // adoptedStyleSheetsで再利用するためのCSSStyleSheetを作成（コンポーネント定義時に1度だけ）
  /** @type {CSSStyleSheet | null} */
  let styleSheet = null
  if (styleElement) {
    styleSheet = new CSSStyleSheet()
    styleSheet.replaceSync(styleElement.textContent)
  }

  // Custom Element クラスを定義
  class Component extends HTMLElement {
    static observedAttributes = Object.keys(propsDefinition).map(toKebabCase)

    #props = reactive(structuredClone(propsDefinition))
    /** @type {(() => void) | null} */
    #dispose = null

    constructor() {
      super()

      // eliiコンポーネントであることを示すシンボルマーカー
      this[ELII_COMPONENT] = true

      // Shadow DOMを作成
      this.attachShadow({ mode: 'open' })

      // adoptedStyleSheetsでスタイルを適用（全インスタンスで同じCSSStyleSheetを共有）
      if (styleSheet && this.shadowRoot) {
        this.shadowRoot.adoptedStyleSheets = [styleSheet]
      }

      // プロパティのゲッター/セッターを定義
      defineProperties(this, propsDefinition, this.#props)
    }

    connectedCallback() {
      // createRootでスコープを作成
      this.#dispose = createRoot((dispose) => {
        // setup関数を実行してコンテキストを取得
        const context = { $expose: {}, ...setup?.(this.#props) }

        // $exposeの各プロパティをコンポーネントインスタンスに追加
        for (const [key, value] of Object.entries(context.$expose)) {
          Object.defineProperty(this, key, { value })
        }

        // templateの内容をクローン
        if (templateElement) {
          /** @type {DocumentFragment} */
          // @ts-ignore - cloneNode(true) の返り値は Node 型だが、template.content からクローンしているため DocumentFragment
          const content = templateElement.content.cloneNode(true)

          // ディレクティブを処理
          processDirectives(content, context)

          this.shadowRoot?.appendChild(content)
        }

        return dispose
      })
    }

    disconnectedCallback() {
      // クリーンアップを実行
      if (this.#dispose) {
        this.#dispose()
        this.#dispose = null
      }
    }

    /**
     * 属性が変更されたときに呼ばれる
     *
     * @param {string} name - 属性名
     * @param {string | null} _oldValue - 古い属性値
     * @param {string | null} newValue - 新しい属性値
     */
    attributeChangedCallback(name, _oldValue, newValue) {
      const propName = toCamelCase(name)
      const valueType = typeof propsDefinition[propName]
      // @ts-ignore observedAttributesに従うので問題なし
      this.#props[propName] = parseAttributeValue(newValue, valueType)
    }
  }

  // Custom Elementとして登録
  if (customElements.get(tag)) {
    console.warn(`Custom element with tag ${tag} already defined`)
  } else {
    customElements.define(tag, Component)
  }

  // @ts-ignore - ComponentはTProps & TExposeを継承しているので、型推論が正しく機能しているはず
  return Component
}
