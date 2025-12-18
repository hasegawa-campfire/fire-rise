# Fire Rise

焚き火さんをまとめて積み上げて！火力上昇パズルゲームです。

🔗 [プレイはこちら](https://hasegawa-campfire.github.io/fire-rise/)

## 概要

積み上げ型のパズルゲームです。
ウォーターソートパズルやスパイダーソリティアに近いルールで、同色のブロックをまとめてクリアを目指します。

## ゲームルール

### 基本構造

- **盤面（Board）**: 複数の列とブロックで構成される
- **列（Line）**: ブロックを積み上げる場所。各列には最大サイズ（積める数）がある
- **ブロック（Block）**: 色を持つ単位。列に下から順に積まれる

### 移動ルール

ブロックを別の列に移動できる条件：

1. **同じ列への移動は不可**

   - 自分自身の列には移動できない

2. **同色の分割は不可**

   - 同じ色のブロックが連続している場合、途中から分割できない
   - 移動時は、選択したブロックからその列の一番上まで全て一緒に移動する

3. **移動先の余白が必要**

   - 移動先の列に、移動するブロック数分の空きが必要

4. **移動先の条件**
   - 空の列、または
   - 移動先の一番上のブロックと同じ色の場合のみ移動可能

### 完成条件

以下の両方を満たすとクリア：

- 各色のブロックが全て連続している（分断されていない）
- 同じ色が複数の列に散らばっていない

※ 列が単色で埋まっている必要はなく、複数色が 1 列に積まれていても OK

### 失敗条件

- 移動可能な手がなくなったら手詰まり（失敗）

## 技術スタック

- **フロントエンド**: Vanilla JavaScript (ES2024+)
- **UI フレームワーク**: [elii](./src/local_modules/elii/) - 軽量リアクティブコンポーネントフレームワーク
- **コンポーネント形式**: [html-modules](./src/local_modules/html-modules/) - HTML Modules（策定中）の開発支援ツール集
- **型安全性**: TypeScript 型定義 + JSDoc
- **ビルドツール**: なし（ネイティブ ESM）
- **PWA**: Service Worker によるオフライン対応

### ビルドレス開発

このプロジェクトの技術的な特徴は、**開発時にビルドツールを一切使用しない**ことです。

- ネイティブ ESM による直接実行
- Service Worker を活用した `.m.html` 形式のコンポーネント読み込み
- Import Maps によるモジュール解決

本番公開時は閲覧者向けに esbuild でバンドル・最適化を行いますが、開発環境ではファイルを保存するだけで即座に反映されます。

## プロジェクト構造

```
src/
├── components/           # UIコンポーネント（.m.html形式）
│   ├── app-root.m.html       # アプリケーションルート
│   ├── title-*.m.html        # タイトル画面系
│   ├── play-*.m.html         # プレイ画面系
│   ├── dialog-*.m.html       # ダイアログ系
│   └── x-*.m.html            # 汎用コンポーネント
├── lib/                  # ユーティリティ
│   ├── audio.js              # オーディオ管理
│   ├── state.js              # 状態管理
│   ├── route-state.js        # ルーティング
│   └── ...
├── rule/                 # ゲームロジック
│   ├── board-utils.js        # ボード操作・判定ロジック
│   ├── level.js              # レベル定義
│   └── level-utils.js        # レベル生成ユーティリティ
├── assets/               # アセット
│   ├── bgm/                  # BGM音源
│   ├── se/                   # 効果音
│   └── images/               # 画像リソース
├── local_modules/        # ローカルパッケージ
│   ├── elii/                 # UIフレームワーク
│   └── html-modules/         # HTML Modules開発支援ツール集
├── static/               # 静的ファイル（favicon等）
├── index.html            # エントリーポイント
├── main.js               # メインスクリプト
├── sw.js                 # Service Worker（本番用）
├── sw.dev.js             # Service Worker（開発用）
└── manifest.json         # PWAマニフェスト
```

## 開発ガイド

### セットアップ

```bash
npm install
```

### 開発サーバー

```bash
npm run serve        # http://localhost:3001 で起動
npm run serve:ssl    # https://localhost:3002 で起動（SSL証明書が必要）
```

### ビルド

```bash
npm run build        # distディレクトリにビルド
npm run preview      # ビルド結果をhttp://localhost:3003でプレビュー
```

### 型定義の活用

JSDoc で TypeScript の型チェックを利用：

```javascript
/**
 * @param {Board} board
 * @returns {boolean}
 */
export function isGoalState(board) {
  // ...
}
```

## コンポーネントシステム

### HTML Modules

[HTML Modules](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/html-modules-proposal.md) は、HTML ファイルを ES Modules としてインポートできるようにする提案中のブラウザネイティブ機能です。`import.meta.document` を使ってインラインスクリプトから宣言的なコンテンツ（template 要素など）にアクセスできます。

まだ公式のツールサポートがないため、このプロジェクトでは独自の開発支援ツール集を用意しています：

- **sw-util**: Service Worker で `.m.html` を JS に変換（開発時）
- **esbuild-plugin**: ビルド時の変換プラグイン
- **ts-plugin**: TypeScript Language Service プラグイン（IDE での型チェック・補完）

これにより、`.m.html` 形式の単一ファイルコンポーネントでの開発が可能です：

```html
<script type="module">
  import { defineComponent } from 'elii'

  export default defineComponent({
    tag: 'my-component',
    document: import.meta.document,
    setup() {
      return { message: 'Hello!' }
    },
  })
</script>

<template>
  <p data-text="message"></p>
</template>

<style>
  :host {
    display: block;
  }
</style>
```

詳細は [elii/README.md](./src/local_modules/elii/README.md) を参照してください。

## 設計思想

### ビルドレス開発の追求

- 開発時はビルドツール不要で即座に動作
- ネイティブ ESM と Service Worker の活用
- ファイル保存だけで即時反映される開発体験

### 型安全性の維持

- TypeScript 型定義で静的チェック
- JSDoc でランタイム検証なし
- ビルドなしでも型の恩恵を享受

### シンプルな実装

- 軽量なカスタムフレームワーク（elii）
- 最小限の依存関係
- 理解しやすいコード

### オフライン対応

- Service Worker によるアセットキャッシュ
- PWA としてインストール可能

## ライセンス

ISC
