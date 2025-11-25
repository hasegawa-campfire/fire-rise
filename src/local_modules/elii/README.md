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
    <h1 data-bind-text="state.count"></h1>
    <button data-bind-onclick="increment">+</button>
    <button data-bind-onclick="decrement">-</button>
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
}) // 複数の変更を1回のエフェクト実行にまとめる

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

```html
<!-- データバインディング -->
<div data-bind-text="state.message"></div>
<input data-bind-value="state.text" />

<!-- 双方向バインディング -->
<input data-model-value="state.text" />
<input type="checkbox" data-model-checked="state.done" />

<!-- イベントバインディング -->
<button data-bind-onclick="handleClick">Click</button>

<!-- 条件付きレンダリング -->
<template data-if="state.isVisible">
  <div>表示される内容</div>
</template>

<!-- リストレンダリング -->
<template data-for="item in state.items" data-key="item.id">
  <li data-bind-text="item.name"></li>
</template>

<!-- DOM 要素参照 -->
<input data-ref="state.inputEl" />

<!-- クラスバインディング（オブジェクト形式） -->
<div data-bind-class="{ active: state.isActive, disabled: state.isDisabled }"></div>

<!-- クラスバインディング（個別クラス形式） -->
<div data-bind-class-active="state.isActive"></div>

<!-- スタイルバインディング（オブジェクト形式） -->
<div data-bind-style="{ color: state.color, fontSize: state.size + 'px' }"></div>

<!-- スタイルバインディング（個別プロパティ形式） -->
<div data-bind-style-color="state.color"></div>

<!-- スタイルバインディング（個別CSS変数形式） -->
<div data-bind-style--primary-color="state.theme.primaryColor"></div>
```

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
