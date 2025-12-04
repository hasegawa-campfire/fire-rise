# elii

Web Components ベースの HTML コンポーネントシステム、統合されたリアクティブシステム付き。

## 概要

elii は`*.m.html`形式の HTML モジュールをベースにした、リアクティブなコンポーネントシステムです。Shadow DOM と Custom Elements を活用し、Proxy ベースのリアクティブシステムとの統合により自動的な依存関係追跡と DOM 更新を実現します。

## 特徴

### リアクティブシステム

- **軽量**: 1 ファイルのコンパクトな実装
- **Proxy ベース**: ES6 Proxy を使用した透過的なリアクティビティ
- **ネスト対応**: ネストされたオブジェクトも自動的にリアクティブ化
- **メモ化**: `createMemo`による計算値のメモ化
- **スコープ管理**: エフェクトのライフサイクルを管理
- **バッチ処理**: 複数の変更をまとめて処理

### コンポーネントシステム

- **HTML モジュール形式**: `*.m.html`ファイルで`<template>`, `<style>`, `<script type="module">`を使用
- **Shadow DOM**: スタイルのスコープ化とカプセル化
- **宣言的ディレクティブ**: `data-*`属性によるデータバインディング
- **双方向バインディング**: `data-model-*`による簡潔なフォーム入力の管理
- **DOM 要素参照**: `data-ref`による直接的な要素アクセス
- **コンポーネント外部への公開**: `$expose`によるメソッドやプロパティの外部公開
- **効率的な差分更新**: 不要な再レンダリングを防止する最適化機構
- **Constructable Stylesheets**: 高速なスタイル適用とメモリ効率

## クイックスタート

```bash
# リポジトリをクローン
git clone <repository-url>
cd roguelite-test

# ブラウザで開く（HTTPS または localhost が必要）
open src/index.html
```

Service Worker が自動的に`*.m.html`ファイルを JavaScript に変換して動作します。

## 基本的な使い方

### シンプルなカウンターコンポーネント

`counter.m.html`:

```html
<script type="module">
  import { defineComponent, reactive } from 'elii'

  export default defineComponent({
    tag: 'counter-app',
    document: import.meta.document,
    props: {
      initial: 0,
    },
    setup(props) {
      const state = reactive({
        count: props.initial,
      })

      const increment = () => state.count++
      const decrement = () => state.count--

      return {
        state,
        increment,
        decrement,
      }
    },
  })
</script>

<template>
  <div>
    <h1 data-text="state.count"></h1>
    <button data-on-click="increment">+</button>
    <button data-on-click="decrement">-</button>
  </div>
</template>

<style>
  :host {
    display: block;
    padding: 20px;
  }
  h1 {
    color: #0066cc;
    font-size: 48px;
  }
  button {
    font-size: 20px;
    padding: 10px 20px;
    margin: 5px;
  }
</style>
```

### コンポーネントの使用

```html
<!DOCTYPE html>
<html>
  <head>
    <title>elii Example</title>
  </head>
  <body>
    <counter-app initial="10"></counter-app>

    <script type="module">
      // Service Worker を登録
      await navigator.serviceWorker.register('./sw.js')

      // Service Worker の準備を待つ
      if (!navigator.serviceWorker.controller) {
        await new Promise((resolve) => {
          navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true })
        })
      }

      // コンポーネントをインポート
      await import('./counter.m.html')
    </script>
  </body>
</html>
```

**重要:** Service Worker は HTTPS または localhost でのみ動作します。

## 主要 API

### リアクティブシステム

```javascript
import { reactive, createEffect, createMemo, createRoot, batch, batchify, onCleanup, untrack, toRaw } from 'elii'

// リアクティブオブジェクトの作成
const state = reactive({ count: 0, user: { name: 'Alice' } })

// エフェクトの作成
const dispose = createEffect(() => {
  console.log('Count:', state.count)
})

// 値の変更（エフェクトが自動的に再実行される）
state.count = 1

// エフェクトを停止
dispose()

// メモ化された計算値の作成（fnの戻り値はobject限定）
const computed = createMemo(() => ({
  doubled: state.count * 2,
  message: `Count is ${state.count}`,
}))

console.log(computed.doubled) // 2
state.count = 5 // computedが自動的に再計算される
console.log(computed.doubled) // 10

// イベントハンドラの最適化
const handleClick = batchify((e) => {
  state.count++
  state.user.name = 'Bob'
  // これらの変更に依存するエフェクトは、このイベントハンドラの終わりにまとめて実行される
})

element.addEventListener('click', handleClick)
```

### コンポーネント

```javascript
import { defineComponent, isComponent } from 'elii'

export default defineComponent({
  tag: 'my-component',
  document: import.meta.document,
  props: { count: 0 },
  setup(props) {
    // セットアップロジック
    const open = () => {
      /* ... */
    }
    const close = () => {
      /* ... */
    }

    return {
      /* コンテキスト */
      // コンポーネント外部に公開するメソッドやプロパティ
      $expose: {
        open,
        close,
      },
    }
  },
})

// 使用例
const element = document.querySelector('my-component')
element.open() // $exposeで公開されたメソッド
```

### ディレクティブ

elii では、HTML 要素に `data-*` 属性を指定することで、リアクティブなデータバインディングを実現します。

#### テキスト・HTML バインディング

```html
<!-- textContent を設定 -->
<div data-text="state.message"></div>

<!-- innerHTML を設定 -->
<div data-html="state.htmlContent"></div>
```

#### プロパティ・属性バインディング

```html
<!-- プロパティバインディング: 要素のプロパティに値を設定 -->
<input data-prop-value="state.text" />
<button data-prop-disabled="state.isLoading">Submit</button>

<!-- 属性バインディング: HTML属性として設定 -->
<img data-attr-src="state.imageUrl" />
<div data-attr-aria-label="state.label"></div>
```

`data-prop-*` は要素のプロパティに、`data-attr-*` は HTML 属性に値を設定します。プロパティと属性の違いに注意してください（例: `disabled` プロパティは boolean、`disabled` 属性は文字列）。

#### 双方向バインディング

```html
<!-- フォーム要素とステートを自動的に同期 -->
<input data-model-value="state.text" />
<input type="checkbox" data-model-checked="state.done" />
<select data-model-value="state.category">
  <option value="a">Category A</option>
  <option value="b">Category B</option>
</select>
```

`data-model-*` を使用すると、ユーザーの入力が自動的にステートに反映されます。

#### イベントバインディング

```html
<!-- addEventListener でリスナーを追加（推奨） -->
<button data-on-click="handleClick">Click</button>
<button data-on-mouse-enter="handleMouseEnter">Hover</button>
<form data-on-submit="handleSubmit">Submit</form>

<!-- プロパティに直接代入 -->
<button data-prop-onclick="handleClick">Click</button>
```

**`data-on-*` の特徴:**

- イベント名はハイフン区切り（`data-on-click`, `data-on-mouse-enter`）
- `addEventListener` でリスナーを追加
- イベントハンドラは自動的に `batchify` でラップされるため、複数のステート変更が効率的にバッチ処理される

**`data-prop-*` でのイベント設定:**

- プロパティに直接代入（`onclick`, `onmouseover` など）
- バッチ処理は行われない

通常は `data-on-*` の使用を推奨します。

#### 条件付きレンダリング

```html
<!-- 条件が true の場合のみレンダリング -->
<template data-if="state.isVisible">
  <div>表示される内容</div>
</template>
```

#### リストレンダリング

```html
<!-- 配列をイテレートして要素を生成 -->
<template data-for="item in state.items" data-key="item.id">
  <li data-text="item.name"></li>
</template>

<!-- インデックス付き -->
<template data-for="item, index in state.items" data-key="item.id">
  <li data-text="`${index + 1}. ${item.name}`"></li>
</template>
```

`data-key` を指定することで、要素の再利用と効率的な差分更新が可能になります。

#### DOM 要素参照

```html
<!-- 要素への直接参照を取得 -->
<input data-ref="state.inputEl" />
```

ステートに要素が代入されるため、`state.inputEl.focus()` のように DOM API を直接呼び出せます。

#### クラスバインディング

```html
<!-- オブジェクト形式: キーがクラス名、値が boolean -->
<div data-class="{ active: state.isActive, disabled: state.isDisabled }"></div>

<!-- 個別クラス形式: 特定のクラスを条件付きで切り替え -->
<div data-class-active="state.isActive"></div>
<div data-class-disabled="state.isDisabled"></div>

<!-- 文字列や配列も使用可能 -->
<div data-class="state.className"></div>
<div data-class="['btn', state.btnType]"></div>
```

#### スタイルバインディング

```html
<!-- オブジェクト形式: プロパティとして設定 -->
<div data-style="{ color: state.color, fontSize: state.size + 'px' }"></div>

<!-- 個別プロパティ形式 -->
<div data-style-color="state.color"></div>
<div data-style-font-size="state.size + 'px'"></div>

<!-- CSS変数の設定 -->
<div data-style--primary-color="state.theme.primaryColor"></div>

<!-- 文字列形式 -->
<div data-style="'color: ' + state.color"></div>
```

#### 条件付きレンダリング・リストレンダリング

```html
<!-- 条件付きレンダリング: 条件が true の場合のみレンダリング -->
<template data-if="state.isVisible">
  <div>表示される内容</div>
</template>

<!-- リストレンダリング: 配列をイテレート -->
<template data-for="item in state.items" data-key="item.id">
  <li data-text="item.name"></li>
</template>

<!-- インデックス付き -->
<template data-for="item, index in state.items" data-key="item.id">
  <li data-text="`${index + 1}. ${item.name}`"></li>
</template>
```

**`data-key` について:**
`data-key` を指定すると、配列の要素が追加・削除・並び替えされた際に、DOM 要素を効率的に再利用できます。リストが動的に変化する場合は必ず指定することを推奨します。

#### DOM 要素参照

```html
<!-- 要素への直接参照を取得 -->
<input data-ref="state.inputEl" />
```

`state.inputEl` に要素が代入されるため、`state.inputEl.focus()` のように DOM API を直接呼び出せます。

## 詳細ドキュメント

より詳しい情報については、以下のドキュメントを参照してください：

- **[リアクティブシステム](./docs/reactive.md)** - reactive, createEffect, createRoot などの詳細な使い方と実装の詳細
- **[コンポーネントシステム](./docs/components.md)** - defineComponent, ディレクティブ、プロパティシステムの詳細

## サンプル

`examples/`ディレクトリには、以下のサンプルコンポーネントがあります：

- **counter.m.html** - シンプルなカウンターコンポーネント
- **todo.m.html** - Todo リストアプリケーション
- **directives-demo.m.html** - 各種ディレクティブのデモンストレーション

## モジュール構成

```
elii/
├── index.js          # 公開 API のエクスポート
├── reactive.js       # リアクティブシステム
├── component.js      # コンポーネント定義
├── directives.js     # ディレクティブ処理
├── parser.js         # 式パーサー
├── props.js          # プロパティシステム
├── utils.js          # ユーティリティ関数
├── docs/
│   ├── reactive.md   # リアクティブシステムの詳細
│   └── components.md # コンポーネントシステムの詳細
└── examples/         # サンプルコンポーネント
    ├── counter.m.html
    ├── todo.m.html
    └── directives-demo.m.html
```

## Service Worker による HTML Modules の変換

現在のブラウザは HTML Modules をネイティブサポートしていないため、elii は Service Worker を使用して`*.m.html`ファイルを実行時に JavaScript に変換します。

### 変換プロセス

1. `*.m.html`ファイルへのリクエストをインターセプト
2. `<script>`, `<template>`, `<style>`を抽出
3. mock の`import.meta.document`オブジェクトを生成
4. スクリプト内の`import.meta.document`を置き換え
5. JavaScript モジュールとして返す

### 利点

- **ビルド不要**: 開発時にビルドステップが不要
- **リアルタイム更新**: ファイルを保存すると即座に反映
- **標準準拠**: 将来の HTML Modules 仕様に近い形式

### 注意点

- Service Worker は HTTPS または localhost でのみ動作
- ネットワークオフライン時は動作しない（キャッシュ未実装）

## ライセンス

MIT
