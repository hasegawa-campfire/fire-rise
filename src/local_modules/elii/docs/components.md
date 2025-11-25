# Component System

elii のコンポーネントシステムの詳細ドキュメントです。

## コンポーネントの定義

### 基本構造

`*.m.html`ファイルには、`<script type="module">`, `<template>`, `<style>`の 3 つのセクションを含めることができます。

```html
<script type="module">
  import { defineComponent, reactive } from 'elii'

  export default defineComponent({
    tag: 'my-component',
    document: import.meta.document,
    props: { count: 0 },
    setup(props) {
      const state = reactive({ value: props.count })
      const increment = () => state.value++
      return { state, increment }
    },
  })
</script>

<template>
  <div>
    <h1 data-bind-text="state.value"></h1>
    <button data-bind-onclick="increment">+</button>
  </div>
</template>

<style>
  :host {
    display: block;
  }
  h1 {
    color: #0066cc;
  }
</style>
```

## API

### defineComponent(options)

コンポーネントを定義し、Custom Elements として登録します。

**パラメータ:**

- `options.tag` (string): カスタム要素のタグ名（例: `'my-component'`）
- `options.document` (Document): HTML モジュールの`import.meta.document`
- `options.props` (object): プロパティ定義（例: `{count: 0, name: 'default'}`）
- `options.setup` (function): セットアップ関数。props を受け取り、テンプレートで使用するコンテキストを返す。戻り値に`$expose`オブジェクトを含めることで、コンポーネント外部にメソッドやプロパティを公開できる

**戻り値:**

コンポーネントクラス（HTMLElement を継承）。`props` で定義されたプロパティと `$expose`で公開されたプロパティは、コンポーネントインスタンスから直接アクセス可能

### isComponent(element)

要素が elii コンポーネントかどうかを判定します。

**パラメータ:**

- `element` (any): 判定する要素

**戻り値:**

`boolean` - elii コンポーネントの場合`true`

**使用例:**

```javascript
import { isComponent } from 'elii'

const element = document.querySelector('counter-app')
if (isComponent(element)) {
  console.log('This is an elii component')
}
```

### プロパティシステム

#### 定義

```javascript
props: {
  count: 0,           // number
  userName: 'Guest',  // string
  isActive: true      // boolean
}
```

#### 属性との対応

プロパティ名は自動的に kebab-case の属性名に変換されます:

- `count` → `count`
- `userName` → `user-name`
- `isActive` → `is-active`

#### 初期値の優先順位

1. HTML 属性値（最優先）
2. アクセサー定義前に JavaScript で設定された値
3. props 定義のデフォルト値

```html
<!-- 属性で初期値を指定 -->
<counter-app initial="100"></counter-app>

<script>
  // JavaScriptから設定
  const counter = document.createElement('counter-app')
  counter.initial = 50
</script>
```

### コンポーネント外部への公開

`setup()`関数の戻り値に`$expose`オブジェクトを含めることで、コンポーネント外部からメソッドやプロパティにアクセスできるようになります。

#### 基本的な使い方

```html
<script type="module">
  import { defineComponent, reactive } from 'elii'

  export default defineComponent({
    tag: 'dialog-component',
    document: import.meta.document,
    setup() {
      const state = reactive({
        refDialog: null,
      })

      const open = () => {
        state.refDialog?.showModal()
      }

      const close = () => {
        state.refDialog?.close()
      }

      return {
        state,
        close,
        // コンポーネント外部に公開するメソッド
        $expose: {
          open,
          close,
        },
      }
    },
  })
</script>

<template>
  <dialog data-ref="state.refDialog">
    <slot></slot>
    <button data-bind-onclick="close">Close</button>
  </dialog>
</template>
```

#### 外部からの使用

```javascript
// コンポーネント要素を取得
const dialog = document.querySelector('dialog-component')

// $exposeで公開されたメソッドを呼び出し
dialog.open() // ダイアログを開く
dialog.close() // ダイアログを閉じる
```

#### 特徴

- **不変性**: `$expose`で公開されたプロパティは、コンポーネントのライフサイクル中は変更不可（`writable: false`, `configurable: false`）
- **テンプレート内でも使用可能**: `$expose`の内容はテンプレートコンテキストにも含まれるため、テンプレート内からもアクセス可能
- **型安全性**: TypeScript を使用している場合、`$expose`で公開されたプロパティは型推論によりコンポーネントクラスに反映される

#### ユースケース

- モーダルダイアログの開閉制御
- フォームの検証や送信
- アニメーションの開始・停止
- サードパーティライブラリとの連携
- 親コンポーネントからの子コンポーネント操作

## ディレクティブ

### data-bind-[target]

要素のプロパティや属性にリアクティブな値をバインドします。

#### 基本バインディング

```html
<!-- プロパティバインディング -->
<input data-bind-value="state.text" />

<!-- 属性バインディング -->
<img data-bind-src="state.imageUrl" />
<a data-bind-href="state.link">
  <!-- disabled等のboolean属性 -->
  <button data-bind-disabled="state.isLoading">Submit</button></a
>
```

#### 特殊バインディング

**data-bind-text**: `textContent`を設定

```html
<p data-bind-text="state.message"></p>
```

**data-bind-html**: `innerHTML`を設定

```html
<div data-bind-html="state.htmlContent"></div>
```

**data-bind-class**: 動的クラスバインディング

```html
<!-- 文字列 -->
<div data-bind-class="state.className"></div>

<!-- オブジェクト形式（キーがクラス名、値がboolean） -->
<div data-bind-class="{ active: state.isActive, disabled: state.isDisabled }"></div>

<!-- 配列形式 -->
<div data-bind-class="['btn', state.btnType, state.isActive && 'active']"></div>
```

**data-bind-style**: 動的スタイルバインディング

```html
<!-- 文字列 -->
<div data-bind-style="'color: ' + state.color"></div>

<!-- オブジェクト形式 -->
<div data-bind-style="{ color: state.color, fontSize: state.size + 'px' }"></div>
```

### data-model-[property]

要素のプロパティに対する双方向バインディングを提供します。指定されたプロパティを読み書きし、ユーザー入力を自動的にステートに反映します。

**重要**: elii コンポーネントに対して使用した場合、リアクティブプロパティの変更も自動的に追跡されます。通常の DOM 要素では`input`イベントによる追跡、elii コンポーネントではリアクティブシステムによる追跡となります。

#### 基本的な使い方

```html
<!-- テキスト入力 -->
<input data-model-value="state.text" />

<!-- 数値入力 -->
<input type="number" data-model-value-as-number="state.count" />

<!-- チェックボックス -->
<input type="checkbox" data-model-checked="todo.done" />

<!-- テキストエリア -->
<textarea data-model-value="state.description"></textarea>

<!-- セレクト -->
<select data-model-value="state.category">
  <option value="a">Category A</option>
  <option value="b">Category B</option>
</select>
```

#### 従来の方法との比較

```html
<!-- Before: data-bind-* を使った手動バインディング -->
<input data-bind-value="state.text" data-bind-oninput="(e) => state.text = e.target.value" />

<!-- After: data-model-* を使った双方向バインディング -->
<input data-model-value="state.text" />
```

#### elii コンポーネントとの双方向バインディング

elii コンポーネントに対しても使用できます：

```html
<!-- 親コンポーネント -->
<script type="module">
  const state = reactive({ text: 'initial' })
  return { state }
</script>

<template>
  <custom-input data-model-value="state.text"></custom-input>
  <p>入力値: <span data-bind-text="state.text"></span></p>
</template>

<!-- 子コンポーネント: custom-input.m.html -->
<script type="module">
  export default defineComponent({
    tag: 'custom-input',
    document: import.meta.document,
    props: { value: '' },
    setup(props) {
      // props.value が親の state.text と双方向バインディングされる
      return { props }
    },
  })
</script>

<template>
  <input data-model-value="props.value" />
</template>
```

この場合、子コンポーネントの`props.value`が変更されると、親の`state.text`も自動的に更新されます。

#### 対応するプロパティ

`data-model-*`はどのプロパティでも指定できます：

- `data-model-value`: `element.value`を読み書き（text, textarea, select など）
- `data-model-checked`: `element.checked`を読み書き（checkbox）
- `data-model-value-as-number`: `element.valueAsNumber`を読み書き（number input）
- その他任意のプロパティ名に対応（elii コンポーネントのカスタムプロパティ含む）

#### 動作

- **読み（state → 要素）**: リアクティブに要素のプロパティを更新
- **書き（要素 → state）**:
  - 通常の DOM 要素: `input`イベントで自動的にステートを更新
  - elii コンポーネント: リアクティブプロパティの変更を追跡して自動更新

#### 制限事項

**ラジオボタン**: グループの概念がないため、`data-model-*`では対応していません。従来の方法を使用してください：

```html
<input
  type="radio"
  name="filter"
  value="all"
  data-bind-checked="state.filter === 'all'"
  data-bind-oninput="() => state.filter = 'all'"
/>
<input
  type="radio"
  name="filter"
  value="active"
  data-bind-checked="state.filter === 'active'"
  data-bind-oninput="() => state.filter = 'active'"
/>
```

### data-ref

DOM 要素への参照を取得します。指定されたステートプロパティに要素を直接代入するため、DOM API を直接呼び出すことができます。

#### 基本的な使い方

```html
<script type="module">
  import { defineComponent, reactive } from 'elii'

  export default defineComponent({
    tag: 'my-component',
    document: import.meta.document,
    setup() {
      const state = reactive({
        refInput: null,
      })

      const focusInput = () => {
        state.refInput?.focus()
      }

      return { state, focusInput }
    },
  })
</script>

<template>
  <div>
    <input data-ref="state.refInput" placeholder="Enter text" />
    <button data-bind-onclick="focusInput">Focus Input</button>
  </div>
</template>
```

#### 複数の要素参照

```html
<script type="module">
  const refs = reactive({
    emailInput: null,
    passwordInput: null,
  })

  const validateForm = () => {
    if (!refs.emailInput.value) {
      refs.emailInput.focus()
      return
    }
    if (!refs.passwordInput.value) {
      refs.passwordInput.focus()
      return
    }
    // Submit form...
  }

  return { refs, validateForm }
</script>

<template>
  <input data-ref="refs.emailInput" type="email" />
  <input data-ref="refs.passwordInput" type="password" />
  <button data-bind-onclick="validateForm">Validate</button>
</template>
```

#### クリーンアップ

コンポーネントが破棄されると、参照は自動的に`null`に設定されます。メモリリークの心配はありません。

#### ユースケース

- フォーカス制御（`focus()`, `blur()`）
- スクロール制御（`scrollIntoView()`）
- アニメーションライブラリとの連携
- Canvas や Video などの命令的 API へのアクセス
- サードパーティライブラリの初期化

```html
<script type="module">
  const state = reactive({ refCanvas: null })

  // setup関数内でonCleanupを使用
  onCleanup(() => {
    if (state.refCanvas) {
      const ctx = state.refCanvas.getContext('2d')
      // Canvas描画処理...
    }
  })
</script>

<!-- Canvas要素へのアクセス -->
<canvas data-ref="state.refCanvas" width="400" height="300"></canvas>
```

### data-if

`<template>`要素で使用。条件が true の場合のみ内容をレンダリングします。

```html
<template data-if="state.isVisible">
  <div>このコンテンツは条件がtrueの時だけ表示されます</div>
</template>

<template data-if="state.user">
  <p>Welcome, <span data-bind-text="state.user.name"></span>!</p>
</template>
```

### data-for

`<template>`要素で使用。配列をイテレートして要素を生成します。

#### 基本的な使い方

```html
<!-- アイテムのみ -->
<template data-for="item in state.items">
  <li data-bind-text="item.name"></li>
</template>

<!-- アイテムとインデックス -->
<template data-for="item, index in state.items">
  <li>
    <span data-bind-text="index"></span>:
    <span data-bind-text="item.name"></span>
  </li>
</template>
```

#### キーによる最適化

`data-key`属性でキーを指定することで、要素の再利用と効率的な差分更新が可能です。

```html
<template data-for="item in state.items" data-key="item.id">
  <li data-bind-text="item.name"></li>
</template>
```

キーが指定されていない場合は、配列のインデックスがキーとして使用されます。

## 式の評価

ディレクティブ内では、完全な JavaScript 式を使用できます：

```html
<!-- 算術演算 -->
<div data-bind-text="state.count * 2 + 1"></div>

<!-- 論理演算 -->
<template data-if="state.user && state.user.isAdmin">
  <button>Admin Panel</button>
</template>

<!-- テンプレートリテラル -->
<div data-bind-text="`Hello, ${state.user.name}!`"></div>

<!-- 三項演算子 -->
<div data-bind-class="state.count > 10 ? 'high' : 'low'"></div>

<!-- 配列メソッド -->
<div data-bind-text="state.items.filter(x => x.active).length"></div>
```

### 注意事項

- 式は`with`文を使用してコンテキストで評価されます
- セキュリティ上、信頼できないユーザー入力を式に含めないでください

## Shadow DOM とスロット

elii は Shadow DOM を使用しているため、ネイティブの`<slot>`要素をそのまま使用できます:

```html
<template>
  <div class="card">
    <div class="header">
      <slot name="header"></slot>
    </div>
    <div class="body">
      <slot></slot>
    </div>
  </div>
</template>
```

使用時:

```html
<my-card>
  <h2 slot="header">Title</h2>
  <p>Card content goes here</p>
</my-card>
```

## サンプル

### Todo リスト

```html
<script type="module">
  import { defineComponent, reactive } from 'elii'

  export default defineComponent({
    tag: 'todo-app',
    document: import.meta.document,
    props: {},
    setup() {
      const state = reactive({
        todos: [],
        newTodo: '',
        get remaining() {
          return this.todos.filter((t) => !t.done).length
        },
      })

      let nextId = 1

      const addTodo = () => {
        if (state.newTodo.trim()) {
          state.todos.push({
            id: nextId++,
            text: state.newTodo,
            done: false,
          })
          state.newTodo = ''
        }
      }

      const removeTodo = (id) => {
        state.todos = state.todos.filter((t) => t.id !== id)
      }

      return { state, addTodo, removeTodo }
    },
  })
</script>

<template>
  <div class="todo-app">
    <h1>Todo List</h1>

    <div class="input-area">
      <input data-model-value="state.newTodo" placeholder="What needs to be done?" />
      <button data-bind-onclick="addTodo">Add</button>
    </div>

    <ul class="todo-list">
      <template data-for="todo in state.todos" data-key="todo.id">
        <li data-bind-class="{ completed: todo.done }">
          <input type="checkbox" data-model-checked="todo.done" />
          <span data-bind-text="todo.text"></span>
          <button data-bind-onclick="() => removeTodo(todo.id)">×</button>
        </li>
      </template>
    </ul>

    <div class="stats">
      <span data-bind-text="`${state.remaining} items left`"></span>
    </div>
  </div>
</template>

<style>
  .todo-app {
    max-width: 600px;
    margin: 0 auto;
  }
  .completed span {
    text-decoration: line-through;
    opacity: 0.5;
  }
</style>
```

## 実装詳細

### アーキテクチャ

#### 1. Constructable Stylesheets（`adoptedStyleSheets`）

コンポーネント定義時に一度だけ`CSSStyleSheet`を作成し、すべてのインスタンスで共有します：

```javascript
const styleSheet = new CSSStyleSheet()
styleSheet.replaceSync(styleElement.textContent)

// 各インスタンスで再利用
this.shadowRoot.adoptedStyleSheets = [styleSheet]
```

**利点:**

- スタイルのパースとコンパイルが 1 回だけ
- メモリ効率が良い
- 動的なスタイル更新が高速

#### 2. TreeWalker による DOM 走査

ディレクティブ処理には`TreeWalker`を使用し、効率的に DOM を走査します：

```javascript
const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null)
```

**利点:**

- 再帰呼び出しによるスタックオーバーフローリスクがない
- `<template>`要素の子孫を自動的にスキップ
- パフォーマンスが良好

#### 3. スコープベースのクリーンアップ

`reactive`の`createRoot`を使用して、エフェクトのライフサイクルを管理します：

```javascript
// data-if の場合
const dispose = createRoot((dispose) => {
  processDirectives(fragment, context)
  return dispose
})

// 条件が false になったらクリーンアップ
if (currentDispose) {
  currentDispose()
}
```

**利点:**

- メモリリークの防止
- ネストされたディレクティブの自動クリーンアップ
- WeakMap などの手動管理が不要

#### 4. 差分更新の最適化

**data-if**: 条件の boolean 値が変わった時のみ再レンダリング

```javascript
if (condition === previousCondition) {
  return // 不要な再レンダリングをスキップ
}
```

**data-for**: キーベースで要素を再利用

```javascript
// 既存の要素を再利用してプロパティを更新
if (itemInfo) {
  batch(() => {
    itemInfo.context[parsed.itemName] = item
    itemInfo.context[parsed.indexName] = index
  })
}
```

## モジュール構成

### ファイル構造

```
elii/
├── index.js          # エクスポート
├── reactive.js       # リアクティブシステム
├── component.js      # defineComponent, EliiComponent クラス
├── directives.js     # processDirectives, processIf, processFor, processBind
├── parser.js         # evaluateExpression, parseForExpression
├── props.js          # defineProperties, toKebabCase
├── docs/             # ドキュメント
│   ├── reactive.md   # リアクティブシステムの詳細
│   └── components.md # コンポーネントシステムの詳細
└── examples/         # サンプルコンポーネント
```

### 主要モジュール

**component.js**

- `defineComponent()`: コンポーネント定義と Custom Elements 登録
- `isComponent()`: 要素が elii コンポーネントかどうかを判定
- `EliiComponent`: HTMLElement を継承したベースクラス
- スタイルシート管理（`adoptedStyleSheets`）
- プロパティ定義とディレクティブ処理の初期化

**directives.js**

- `processDirectives()`: DOM 走査とディレクティブ処理のエントリーポイント
- `processIf()`: 条件付きレンダリング
- `processFor()`: リストレンダリング
- `processBind()`: データバインディング
- `processModel()`: 双方向バインディング
- `processRef()`: DOM 要素参照

**parser.js**

- `evaluateExpression()`: JavaScript 式の評価（`with`文使用）
- `evaluateAssignmentExpression()`: 代入式の評価（双方向バインディング用）
- `parseForExpression()`: `data-for`の式パース

**props.js**

- `defineProperties()`: リアクティブプロパティの定義
- 属性との双方向バインディング
- kebab-case 変換
