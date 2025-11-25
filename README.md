# Fire Tower

パズルゲームの試作です

## 概要

積み上げ型のパズルゲームです。
ウォーターソートパズルやスパイダーソリティアに近いものです。

## 技術スタック

- **フロントエンド**: Vanilla JavaScript (ES2024+)
- **UI フレームワーク**: [elii](./src/local_modules/elii/) - 軽量リアクティブフレームワーク
- **型安全性**: TypeScript 型定義 + JSDoc
- **ビルドツール**: なし（ネイティブ ESM）

## アーキテクチャ

### コアコンセプト

## プロジェクト構造

```
src/
├── local_modules/
│   └── elii/         # UIフレームワーク（詳細は elii/README.md）
└── index.html        # エントリーポイント
```

## 開発ガイド

### 型定義の活用

JSDoc で TypeScript の型チェックを利用：

```javascript
/**
 * @param {unknown} obj
 * @returns {obj is object}
 */
export function isObject(obj) {
  return typeof obj === 'object' && obj !== null
}
```

## 設計思想

### 型安全性の維持

- TypeScript 型定義で静的チェック
- JSDoc でランタイム検証なし
- 開発体験の向上

### シンプルな実装

- 複雑なフレームワーク不要
- 最小限の依存関係
- 理解しやすいコード

## 開発状況

**完了:**

- [x] **型定義**（global.d.ts）

  - TypeScript による型安全性
  - JSDoc との連携

**未完了:**

- [ ] ゲームロジック
- [ ] UI 実装
- [ ] バランス調整

## ライセンス

未定
