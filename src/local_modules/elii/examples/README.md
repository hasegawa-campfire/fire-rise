# elii Examples

このディレクトリには elii コンポーネントシステムのサンプルが含まれています。

## クイックスタート

`src/index.html`を開いて、すべてのサンプルを一度に確認できます：

```bash
# 開発サーバーを起動（例: VS Code の Live Server など）
# または単純にブラウザで開く
open src/index.html
```

Service Worker が`*.m.html`ファイルを自動的に JavaScript に変換します。

## サンプル一覧

### counter.m.html

基本的なカウンターコンポーネント。

- プロパティバインディング
- イベントハンドリング
- リアクティブ state

### todo.m.html

Todo リストアプリケーション。

- data-for（リストレンダリング）
- data-if（条件付きレンダリング）
- 複数のイベントハンドラ
- 算出プロパティ

### directives-demo.m.html

すべてのディレクティブの総合デモ。

- data-bind-text / data-bind-html
- data-bind-class（オブジェクト形式）
- data-if
- data-for（キー付き）
- ネストされたループ

## 使用方法

これらのサンプルを動かすには、HTML モジュールをサポートする環境が必要です。
現在のブラウザはまだ HTML モジュールをサポートしていないため、Vite プラグイン等で対応する必要があります。

### 一時的なテスト方法

開発中は、スクリプト部分を通常の`<script type="module">`として読み込み、
`import.meta.document`の代わりに手動で作成した Document fragment を渡すことで動作確認できます。

例:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>elii Counter Example</title>
  </head>
  <body>
    <counter-app initial="10"></counter-app>

    <script type="module">
      import { defineComponent } from '../index.js'
      import { reactive } from '../../reactive/index.js'

      // テンプレートとスタイルを手動で作成
      const templateEl = document.createElement('template')
      templateEl.innerHTML = `
      <div class="counter">
        <h1 data-bind-text="state.count"></h1>
        <div class="buttons">
          <button data-bind-onclick="decrement">-</button>
          <button data-bind-onclick="reset">Reset</button>
          <button data-bind-onclick="increment">+</button>
        </div>
      </div>
    `

      const styleEl = document.createElement('style')
      styleEl.textContent = `
      :host { display: block; padding: 20px; }
      h1 { color: #0066cc; font-size: 64px; }
      button { font-size: 24px; padding: 12px 24px; }
    `

      const mockDocument = {
        querySelector(selector) {
          if (selector === 'template') return templateEl
          if (selector === 'style') return styleEl
          return null
        },
      }

      export default defineComponent({
        tag: 'counter-app',
        document: mockDocument,
        props: { initial: 0 },
        setup(props) {
          const state = reactive({ count: props.initial })
          const increment = () => state.count++
          const decrement = () => state.count--
          const reset = () => (state.count = props.initial)
          return { state, increment, decrement, reset }
        },
      })
    </script>
  </body>
</html>
```

## 今後の対応

Vite プラグインを作成することで、`*.m.html`ファイルを直接インポートできるようになります：

```javascript
// コンポーネントクラスをインポート
import CounterApp from './counter.m.html'

// または、自動登録のみを行う
import './counter.m.html'
```

プラグインは以下の処理を行います：

1. `*.m.html`ファイルを解析
2. `<script>`, `<template>`, `<style>`を抽出
3. script から`export default`されたクラスを取得可能にする
4. `import.meta.document`を適切な Document fragment に変換

これにより、HTML モジュールの仕様に近い形で開発が可能になります。
