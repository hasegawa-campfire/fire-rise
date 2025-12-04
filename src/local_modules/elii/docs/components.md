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
    <h1 data-text="state.value"></h1>
    <button data-on-click="increment">+</button>
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
    <button data-on-click="close">Close</button>
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

elii では、`data-*` 属性を使用して要素にリアクティブなバインディングを設定します。各ディレクティブは特定の目的に最適化されています。

### data-text

要素の `textContent` を設定します。

```html
<p data-text="state.message"></p>
<span data-text="`Count: ${state.count}`"></span>
```

### data-html

要素の `innerHTML` を設定します。

```html
<div data-html="state.htmlContent"></div>
```

**注意**: ユーザー入力など信頼できないコンテンツに使用しないでください。XSS のリスクがあります。

### data-prop-[property]

要素のプロパティにリアクティブな値をバインドします。

```html
<!-- フォーム要素 -->
<input data-prop-value="state.text" />
<button data-prop-disabled="state.isLoading">Submit</button>

<!-- リンク -->
<a data-prop-href="state.url">Link</a>

<!-- その他のプロパティ -->
<video data-prop-muted="state.isMuted"></video>
```

プロパティ名はキャメルケースで指定します（例: `data-prop-value-as-number`）。

### data-attr-[attribute]

HTML 属性にリアクティブな値をバインドします。

```html
<!-- 画像 -->
<img data-attr-src="state.imageUrl" data-attr-alt="state.imageAlt" />

<!-- ARIA属性 -->
<div data-attr-aria-label="state.label" data-attr-aria-expanded="state.isExpanded"></div>

<!-- カスタムデータ属性 -->
<div data-attr-data-id="state.itemId"></div>
```

**`data-prop-*` と `data-attr-*` の違い:**

- `data-prop-*`: DOM プロパティに設定（例: `element.value = "text"`）
- `data-attr-*`: HTML 属性として設定（例: `element.setAttribute("value", "text")`）

多くの場合、プロパティバインディング（`data-prop-*`）の方が適切です。

### data-class

動的なクラスバインディングを提供します。

```html
<!-- 文字列 -->
<div data-class="state.className"></div>

<!-- オブジェクト形式（キーがクラス名、値がboolean） -->
<div data-class="{ active: state.isActive, disabled: state.isDisabled }"></div>

<!-- 配列形式 -->
<div data-class="['btn', state.btnType, state.isActive && 'active']"></div>
```

#### 個別クラス形式

特定のクラスを条件付きで切り替えます。

```html
<div data-class-active="state.isActive"></div>
<div data-class-disabled="state.isDisabled"></div>
```

これは `data-class="{ active: state.isActive }"` と同等ですが、より簡潔に記述できます。

### data-style

動的なスタイルバインディングを提供します。

```html
<!-- オブジェクト形式 -->
<div data-style="{ color: state.color, fontSize: state.size + 'px' }"></div>

<!-- 文字列形式 -->
<div data-style="'color: ' + state.color"></div>
```

#### 個別スタイルプロパティ形式

特定のスタイルプロパティをバインドします。

```html
<div data-style-color="state.color"></div>
<div data-style-font-size="state.size + 'px'"></div>
```

#### CSS 変数

CSS カスタムプロパティを設定します。

```html
<!-- ハイフン2つでCSS変数を設定 -->
<div data-style--primary-color="state.theme.primaryColor"></div>
<div data-style--spacing="state.theme.spacing + 'px'"></div>
```

### data-on-[event]

`addEventListener` を使用してイベントリスナーを追加します。

```html
<button data-on-click="handleClick">Click</button>
<input data-on-input="handleInput" />
<form data-on-submit="handleSubmit">Submit</form>
<div data-on-mouse-enter="handleMouseEnter">Hover</div>
```

**特徴:**

- イベント名はハイフン区切り（`click` → `data-on-click`, `mouseEnter` → `data-on-mouse-enter`）
- イベントハンドラは自動的に `batchify` でラップされ、複数のステート変更が効率的にバッチ処理される
- クリーンアップ時にリスナーは自動的に削除される

**代替方法:**

イベントハンドラをプロパティとして直接設定したい場合は `data-prop-*` を使用できます：

```html
<button data-prop-onclick="handleClick">Click</button>
```

ただし、この方法ではバッチ処理は行われません。通常は `data-on-*` の使用を推奨します。

### data-model-[property]

要素のプロパティに対する双方向バインディングを提供します。指定されたプロパティを読み書きし、ユーザー入力を自動的にステートに反映します。

**動作:**

- **読み（ステート → 要素）**: ステートの値が変わると要素のプロパティが自動更新される
- **書き（要素 → ステート）**: ユーザーが要素を操作するとステートが自動更新される

#### 基本的な使い方

```html
<!-- テキスト入力 -->
<input data-model-value="state.text" />

<!-- 数値入力 -->
<input type="number" data-model-value-as-number="state.count" />

<!-- チェックボックス -->
<input type="checkbox" data-model-checked="state.isChecked" />

<!-- テキストエリア -->
<textarea data-model-value="state.description"></textarea>

<!-- セレクト -->
<select data-model-value="state.category">
  <option value="a">Category A</option>
  <option value="b">Category B</option>
</select>
```

これにより、手動でイベントハンドラを設定する必要がなくなります：

```html
<!-- 従来の方法: data-prop-* と data-on-* を組み合わせ -->
<input data-prop-value="state.text" data-on-input="(e) => state.text = e.target.value" />

<!-- data-model-*: 1つのディレクティブで双方向バインディング -->
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
  <p>入力値: <span data-text="state.text"></span></p>
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
  data-prop-checked="state.filter === 'all'"
  data-on-input="() => state.filter = 'all'"
/>
<input
  type="radio"
  name="filter"
  value="active"
  data-prop-checked="state.filter === 'active'"
  data-on-input="() => state.filter = 'active'"
/>
```

### data-ref

DOM 要素への直接参照を取得します。指定されたステートプロパティに要素が代入されるため、DOM API を直接呼び出すことができます。

```html
<script type="module">
  import { defineComponent, reactive } from 'elii'

  export default defineComponent({
    tag: 'my-component',
    document: import.meta.document,
    setup() {
      const state = reactive({
        inputEl: null,
      })

      const focusInput = () => {
        state.inputEl?.focus()
      }

      return { state, focusInput }
    },
  })
</script>

<template>
  <div>
    <input data-ref="state.inputEl" placeholder="Enter text" />
    <button data-on-click="focusInput">Focus Input</button>
  </div>
</template>
```

#### 複数の要素参照

複数の要素参照を管理する場合は、オブジェクトにまとめると便利です：

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
  <button data-on-click="validateForm">Validate</button>
</template>
```

#### 自動クリーンアップ

コンポーネントが破棄されると、参照は自動的に `null` に設定されます。メモリリークの心配はありません。

#### ユースケース

`data-ref` は、以下のような場合に便利です：

- **フォーカス制御**: `focus()`, `blur()` など
- **スクロール制御**: `scrollIntoView()` など
- **アニメーション**: アニメーションライブラリとの連携
- **Canvas / Video**: 命令的な API へのアクセス
- **サードパーティライブラリ**: 初期化が必要なライブラリとの連携

```html
<script type="module">
  import { reactive, onCleanup } from 'elii'

  const state = reactive({ canvas: null })

  onCleanup(() => {
    if (state.canvas) {
      const ctx = state.canvas.getContext('2d')
      // Canvas描画処理...
    }
  })

  return { state }
</script>

<template>
  <canvas data-ref="state.canvas" width="400" height="300"></canvas>
</template>
```

### data-if

`<template>` 要素で使用します。条件が true の場合のみ、テンプレートの内容をレンダリングします。

```html
<!-- 基本的な使い方 -->
<template data-if="state.isVisible">
  <div>このコンテンツは条件が true の時だけ表示されます</div>
</template>

<!-- 存在チェック -->
<template data-if="state.user">
  <p>Welcome, <span data-text="state.user.name"></span>!</p>
</template>

<!-- 複雑な条件 -->
<template data-if="state.count > 0 && state.isActive">
  <div>アクティブで、カウントが 1 以上です</div>
</template>
```

**動作:**

- 条件が `false` の場合、テンプレートの内容は DOM から削除されます
- 条件が `true` になると、内容が再度レンダリングされます
- 内部で使用されているリアクティブエフェクトは、条件が `false` の間は自動的にクリーンアップされます

### data-for

`<template>` 要素で使用します。配列をイテレートして、各要素に対してテンプレートの内容をレンダリングします。

#### 基本的な使い方

```html
<!-- アイテムのみ -->
<template data-for="item in state.items">
  <li data-text="item.name"></li>
</template>

<!-- アイテムとインデックス -->
<template data-for="item, index in state.items">
  <li>
    <span data-text="index + 1"></span>.
    <span data-text="item.name"></span>
  </li>
</template>
```

#### キーによる最適化

`data-key` 属性でキーを指定することで、要素の再利用と効率的な差分更新が可能です。

```html
<template data-for="item in state.items" data-key="item.id">
  <li data-text="item.name"></li>
</template>
```

**キーの重要性:**

- キーが指定されている場合、elii は各要素を識別して再利用できます
- これにより、配列の順序が変わった場合でも、DOM の再構築を最小限に抑えられます
- キーが指定されていない場合は、配列のインデックスがキーとして使用されます

**例: キーなしとキーありの違い**

```html
<!-- キーなし: 配列がシャッフルされると、すべての要素が再レンダリングされる -->
<template data-for="item in state.items">
  <li data-text="item.name"></li>
</template>

<!-- キーあり: 配列がシャッフルされても、既存の要素が再利用される -->
<template data-for="item in state.items" data-key="item.id">
  <li data-text="item.name"></li>
</template>
```

リスト操作が多いアプリケーション（Todo リスト、ショッピングカートなど）では、キーの指定を推奨します。

## 式の評価

ディレクティブ内では、完全な JavaScript 式を使用できます：

```html
<!-- 算術演算 -->
<div data-text="state.count * 2 + 1"></div>

<!-- 論理演算 -->
<template data-if="state.user && state.user.isAdmin">
  <button>Admin Panel</button>
</template>

<!-- テンプレートリテラル -->
<div data-text="`Hello, ${state.user.name}!`"></div>

<!-- 三項演算子 -->
<div data-class="state.count > 10 ? 'high' : 'low'"></div>

<!-- 配列メソッド -->
<div data-text="state.items.filter(x => x.active).length"></div>
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
      <button data-on-click="addTodo">Add</button>
    </div>

    <ul class="todo-list">
      <template data-for="todo in state.todos" data-key="todo.id">
        <li data-class="{ completed: todo.done }">
          <input type="checkbox" data-model-checked="todo.done" />
          <span data-text="todo.text"></span>
          <button data-on-click="() => removeTodo(todo.id)">×</button>
        </li>
      </template>
    </ul>

    <div class="stats">
      <span data-text="`${state.remaining} items left`"></span>
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
- `processRef()`: DOM 要素参照（`data-ref`）
- `processModel()`: 双方向バインディング（`data-model-*`）
- `processText()`: テキストバインディング（`data-text`）
- `processHtml()`: HTML バインディング（`data-html`）
- `processClass()`: クラスバインディング（`data-class`, `data-class-*`）
- `processStyle()`: スタイルバインディング（`data-style`, `data-style-*`）
- `processOn()`: イベントバインディング（`data-on-*`）
- `processProp()`: プロパティバインディング（`data-prop-*`）
- `processAttr()`: 属性バインディング（`data-attr-*`）

**parser.js**

- `evaluateExpression()`: JavaScript 式の評価（`with`文使用）
- `evaluateAssignmentExpression()`: 代入式の評価（双方向バインディング用）
- `parseForExpression()`: `data-for`の式パース

**props.js**

- `defineProperties()`: リアクティブプロパティの定義
- 属性との双方向バインディング
- kebab-case 変換
