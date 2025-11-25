# Reactive System

Proxy ベースのコンパクトなリアクティブシステムです。プレーンオブジェクトと配列をリアクティブ化し、値の変更を自動的に追跡して依存する処理を再実行します。

## 特徴

- **軽量**: 1 ファイルのコンパクトな実装
- **Proxy ベース**: ES6 Proxy を使用した透過的なリアクティビティ
- **ネスト対応**: ネストされたオブジェクトも自動的にリアクティブ化
- **配列サポート**: 配列の直接代入を追跡。非破壊的メソッド（`filter`、`map`など）を推奨
- **メモ化**: `createMemo`による計算値のメモ化とパフォーマンス最適化
- **スコープ管理**: エフェクトのライフサイクルを管理
- **バッチ処理**: 複数の変更をまとめて処理

## API

### `reactive(data)`

プレーンオブジェクトまたは配列をリアクティブ化します。

```javascript
import { reactive } from 'elii'

const state = reactive({ count: 0, user: { name: 'Alice' } })
state.count = 1 // 変更を追跡
state.user.name = 'Bob' // ネストされた値も追跡
```

**注意点:**

- プレーンオブジェクトと配列のみがリアクティブ化されます
- Date、Map、Set などの組み込みオブジェクトはそのまま返されます
- 既にリアクティブ化されたオブジェクトは再利用されます

### `createEffect(fn)`

リアクティブに再実行される関数を作成します。関数内でアクセスされたリアクティブ値を自動的に追跡し、値が変更されると再実行されます。

```javascript
import { reactive, createEffect } from 'elii'

const state = reactive({ count: 0 })

const dispose = createEffect(() => {
  console.log('Count:', state.count)
}) // 即座に実行: "Count: 0"

state.count = 1 // 再実行: "Count: 1"
state.count = 2 // 再実行: "Count: 2"

dispose() // エフェクトを停止
```

**戻り値:**

- `dispose()` 関数を返します。呼び出すとエフェクトを停止できます。

### `createMemo(fn)`

メモ化された計算値を作成します。関数の戻り値は object でなければならず、依存関係が変更された場合にのみ再計算されます。結果はリアクティブオブジェクトとして返されます。

```javascript
import { reactive, createMemo } from 'elii'

const state = reactive({ x: 1, y: 2 })

const computed = createMemo(() => ({
  sum: state.x + state.y,
  product: state.x * state.y,
  message: `x=${state.x}, y=${state.y}`,
}))

console.log(computed.sum) // 3
console.log(computed.product) // 2

state.x = 5 // computedが自動的に再計算される
console.log(computed.sum) // 7
console.log(computed.product) // 10
console.log(computed.message) // "x=5, y=2"
```

**引数:**

- `fn()`: 計算する関数。戻り値は必ず object でなければなりません。

**戻り値:**

- メモ化されたリアクティブオブジェクト。オブジェクトのプロパティにアクセスすると依存関係として追跡されます。

**特徴:**

- 依存する値が変更された場合のみ再計算されます（メモ化）
- 結果はリアクティブオブジェクトなので、他のエフェクトから参照できます
- `createEffect`とは異なり、エフェクトを停止する必要はありません

**注意点:**

- 関数の戻り値は必ず object でなければなりません（プリミティブ値や配列のみは不可）
- 配列を返したい場合は、`{ items: [...] }`のようにオブジェクトでラップしてください

### `createRoot(fn)`

新しいスコープを作成します。スコープ内で作成されたすべてのエフェクトを管理し、スコープを解放すると一括でクリーンアップできます。

```javascript
import { reactive, createEffect, createRoot } from 'elii'

createRoot((dispose) => {
  const state = reactive({ value: 1 })

  createEffect(() => {
    console.log('Effect 1:', state.value)
  })

  createEffect(() => {
    console.log('Effect 2:', state.value * 2)
  })

  state.value = 2 // 両方のエフェクトが再実行

  dispose() // すべてのエフェクトをクリーンアップ
})
```

**引数:**

- `fn(dispose)`: スコープ内で実行する関数。`dispose`関数が渡されます。

**戻り値:**

- `fn`の戻り値をそのまま返します。

### `untrack(fn)`

関数内でのリアクティブ値アクセスを追跡しません。

```javascript
import { reactive, createEffect, untrack } from 'elii'

const state = reactive({ a: 1, b: 2 })

createEffect(() => {
  console.log('a:', state.a) // 追跡される
  console.log(
    'b:',
    untrack(() => state.b)
  ) // 追跡されない
})

state.a = 10 // エフェクトが再実行される
state.b = 20 // エフェクトは再実行されない
```

**戻り値:**

- `fn`の戻り値を返します。

### `batch(fn)`

関数内の複数の変更をまとめて処理します。関数の実行中は変更を即座に通知せず、関数完了後にまとめて通知します。

```javascript
import { reactive, createEffect, batch } from 'elii'

const state = reactive({ x: 0, y: 0 })

createEffect(() => {
  console.log(`Position: (${state.x}, ${state.y})`)
})

batch(() => {
  state.x = 10
  state.y = 20
}) // エフェクトは1回だけ実行される
```

**利点:**

- パフォーマンスの最適化
- 一貫性のある状態更新（途中の状態が見えない）

### `batchify(fn)`

関数を batch 化します。返された関数は、呼び出し時に自動的に batch 内で実行されます。DOM イベントハンドラやコールバック関数を最適化するのに便利です。

```javascript
import { reactive, createEffect, batchify } from 'elii'

const state = reactive({ x: 0, y: 0 })

createEffect(() => {
  console.log(`Position: (${state.x}, ${state.y})`)
})

// イベントハンドラをbatch化
const handleClick = batchify((e) => {
  state.x = 10
  state.y = 20
})

element.addEventListener('click', handleClick) // エフェクトは1回だけ実行される
```

**利点:**

- イベントハンドラやコールバックを簡単に最適化できる
- 明示的でわかりやすい
- DOM イベント以外（WebSocket、タイマーなど）でも使える

**使用例:**

```javascript
// WebSocketのメッセージハンドラ
const onMessage = batchify((data) => {
  state.messages.push(data)
  state.unreadCount++
})
websocket.onmessage = onMessage

// setTimeoutやsetIntervalでも使える
const tick = batchify(() => {
  state.time++
  state.elapsed += 1000
})
setInterval(tick, 1000)
```

### `onCleanup(fn)`

現在のエフェクトまたはスコープがクリーンアップされる際に実行される関数を登録します。

**エフェクト内での使用:**

```javascript
import { reactive, createEffect, onCleanup } from 'elii'

const state = reactive({ intervalId: null })

const dispose = createEffect(() => {
  const id = setInterval(() => {
    console.log('Tick:', state.value)
  }, 1000)

  onCleanup(() => {
    clearInterval(id)
    console.log('Interval cleared')
  })
})

// エフェクトが再実行される前、または停止される前にクリーンアップが実行される
dispose() // "Interval cleared" が表示される
```

**スコープ内（エフェクト外）での使用:**

```javascript
import { createRoot, onCleanup } from 'elii'

createRoot((dispose) => {
  const resource = acquireResource()

  onCleanup(() => {
    releaseResource(resource)
    console.log('Resource released')
  })

  // スコープの解放時にクリーンアップが実行される
  dispose() // "Resource released" が表示される
})
```

**動作:**

- **エフェクト内**: エフェクトの再実行前とエフェクト解放時に実行
- **エフェクト外**: スコープの解放時に実行

**使用例:**

- タイマーのクリア
- イベントリスナーの削除
- サブスクリプションの解除
- リソースの解放

### `toRaw(obj)`

リアクティブ Proxy から元のオブジェクトを取得します。

```javascript
import { reactive, toRaw } from 'elii'

const original = { value: 42 }
const proxied = reactive(original)
const raw = toRaw(proxied)

console.log(original === raw) // true
console.log(proxied === original) // false
```

**使用例:**

- シリアライズ（JSON.stringify など）
- デバッグ
- 外部ライブラリへの受け渡し

## 実装の詳細

### 依存関係の追跡

リアクティブシステムは以下の仕組みで動作します：

1. **Proxy**: オブジェクトの get/set 操作をインターセプト
2. **グローバルスタック**: 現在実行中のエフェクトを追跡
3. **依存関係マップ**: `target -> key -> Set<effect>` の構造で依存を管理
4. **トリガー**: 値が変更されると、依存するすべてのエフェクトを再実行

### 制約事項

- **プレーンオブジェクトと配列のみ**: Date、Map、Set などの組み込みオブジェクトはリアクティブ化されません
- **配列操作のベストプラクティス**: 配列を操作する際は非破壊的メソッドを使用してください。破壊的メソッド（`push()`, `pop()`, `splice()`など）は内部で複数の操作を引き起こすため、中途半端な状態がエフェクトに見える可能性があります
- **エフェクトのエラー**: エフェクト内でエラーが発生するとコンソールにログが出力されますが、他のエフェクトの実行は継続されます
- **循環参照**: 循環参照を持つオブジェクトもリアクティブ化できますが、エフェクト内で無限ループを作成しないよう注意が必要です
- **DOM API の安全性**: DOM 要素のメソッド（`addEventListener`など）は自動的に適切な`this`コンテキストで実行されるため、安全に使用できます

## 使用例

### 基本的な状態管理

```javascript
import { reactive, createEffect, createRoot } from 'elii'

createRoot((dispose) => {
  const state = reactive({
    todos: [],
    filter: 'all',
  })

  // 自動的に更新されるUI
  createEffect(() => {
    const filtered = state.todos.filter((todo) => {
      if (state.filter === 'active') return !todo.completed
      if (state.filter === 'completed') return todo.completed
      return true
    })
    console.log('Filtered todos:', filtered)
  })

  // 操作（非破壊的メソッドを使用）
  state.todos = [...state.todos, { text: 'Learn Reactive', completed: false }]
  state.todos = [...state.todos, { text: 'Build App', completed: false }]
  state.filter = 'active'

  // 要素の直接変更も可能
  state.todos[0].completed = true
})
```

### メモ化された計算値

`createMemo`を使用すると、計算コストの高い処理をメモ化できます。依存する値が変更された場合のみ再計算されます。

```javascript
import { reactive, createMemo, createEffect } from 'elii'

const state = reactive({
  todos: [
    { text: 'Learn Reactive', completed: false },
    { text: 'Build App', completed: true },
    { text: 'Deploy', completed: false },
  ],
  filter: 'all',
})

// メモ化された計算値
const stats = createMemo(() => {
  const total = state.todos.length
  const completed = state.todos.filter((t) => t.completed).length
  const active = total - completed

  return {
    total,
    completed,
    active,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
})

// 統計情報を表示するエフェクト
createEffect(() => {
  console.log(`Progress: ${stats.completed}/${stats.total} (${stats.percentage}%)`)
})

// 統計は自動的に更新される
state.todos = [...state.todos, { text: 'Test App', completed: false }]
// Progress: 1/4 (25%)

state.todos[0].completed = true
// Progress: 2/4 (50%)
```

**メモ化の利点:**

- 計算コストの高い処理を最適化
- 複数のエフェクトから同じ計算結果を参照できる
- コードの可読性が向上（ロジックを分離）

### 配列操作のベストプラクティス

配列を操作する際は、非破壊的メソッドを使用することを推奨します：

```javascript
import { reactive, createEffect, createRoot } from 'elii'

createRoot((dispose) => {
  const state = reactive({ items: [1, 2, 3] })

  createEffect(() => {
    console.log('Items:', state.items.join(', '))
    console.log('Length:', state.items.length)
  })

  // ✅ 推奨: 非破壊的メソッド
  state.items = [...state.items, 4] // 追加
  state.items = state.items.filter((x) => x !== 3) // 削除
  state.items = state.items.map((x) => x * 2) // 更新
  state.items = state.items.slice(0, 2) // 一部取得

  // ❌ 非推奨: 破壊的メソッド（中途半端な状態が見える可能性）
  // state.items.push(4)
  // state.items.pop()
  // state.items.splice(1, 1)

  dispose()
})
```

**理由:**

破壊的メソッド（`push()`, `pop()`, `splice()`など）は内部で複数の操作を引き起こすため、エフェクトが複数回実行され、中途半端な状態が見える可能性があります。非破壊的メソッドを使用することで、1 回の操作で配列全体を置き換えるため、一貫した状態が保証されます。

### 非同期処理

```javascript
import { reactive, createEffect, onCleanup } from 'elii'

const state = reactive({ userId: 1, userData: null })

createEffect(() => {
  const userId = state.userId
  let cancelled = false

  fetch(`/api/users/${userId}`)
    .then((res) => res.json())
    .then((data) => {
      if (!cancelled) {
        state.userData = data
      }
    })

  onCleanup(() => {
    cancelled = true
  })
})

// userIdが変更されると、前のリクエストはキャンセルされ、新しいリクエストが開始される
state.userId = 2
```
