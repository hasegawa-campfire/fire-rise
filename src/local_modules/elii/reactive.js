/**
 * @fileoverview Proxyベースのコンパクトなリアクティブシステム
 * プレーンオブジェクトと配列をリアクティブ化し、値の変更を自動的に追跡して依存する処理を再実行します。
 */

import { isPlainObject, getPropertyOwner } from './utils.js'

/**
 * @typedef {object} Effect
 * @property {Function} run - エフェクトを実行する関数
 * @property {Set<any>[]} deps - このエフェクトが依存しているdeps
 * @property {Set<Function>} cleanups - クリーンアップ関数のセット
 */

/**
 * @typedef {object} Scope
 * @property {Set<Function>} cleanups - スコープのクリーンアップ関数のセット（エフェクトの解放関数を含む）
 */

/**
 * グローバル状態管理
 * リアクティブProxyのマッピング
 */

// リアクティブProxyのマッピング
/** @type {WeakMap<object, object>} */
const reactiveMap = new WeakMap() // 元データ -> リアクティブProxy
/** @type {WeakMap<object, object>} */
const rawMap = new WeakMap() // リアクティブProxy -> 元データ

// 依存関係の管理
/** @type {Map<object, Map<string|symbol, Set<Effect>>>} */
const targetMap = new Map() // target -> Map(key -> Set(effect))

// 実行コンテキストスタック
/** @type {Effect[]} */
let effectStack = [] // 現在実行中のエフェクト
/** @type {Scope[]} */
let scopeStack = [] // 現在のスコープ

// バッチ処理の状態
let isBatching = false
/** @type {Set<Effect>} */
let pendingEffects = new Set()

// オブジェクトのキーリスト変更を追跡するための特殊シンボル
const ITERATE_KEY = Symbol('iterate')

// bind(target)が必要なクラス（DOM APIやビルトインオブジェクト）のプロトタイプ
/** @type {object[]} */
const BIND_RAW_PROTOTYPES = [
  globalThis.HTMLElement,
  globalThis.Element,
  globalThis.Node,
  Date,
  Map,
  Set,
  WeakMap,
  WeakSet,
  RegExp,
  Object,
].flatMap((cls) => cls?.prototype ?? [])

/**
 * リアクティブProxyのハンドラー
 * @type {ProxyHandler<object>}
 */
const reactiveHandler = {
  get(target, key, receiver) {
    track(target, key)

    const result = Reflect.get(target, key, receiver)

    // 自身のプロパティの場合、リアクティブ化して返す
    if (Object.hasOwn(target, key)) {
      return reactive(result)
    }

    // 継承プロパティで関数の場合、定義元をチェック
    if (typeof result === 'function') {
      const owner = getPropertyOwner(target, key)
      // DOM APIやビルトインオブジェクトのメソッドのみbind(target)
      if (owner && BIND_RAW_PROTOTYPES.includes(owner)) {
        return result.bind(target)
      } else {
        /** @type {(this: unknown, ...args: unknown[]) => unknown} */
        return function (...args) {
          return reactive(result.apply(this, args))
        }
      }
    }

    // それ以外はそのまま返す
    return result
  },

  set(target, key, value, receiver) {
    const hadKey = Object.hasOwn(target, key)
    const oldValue = Reflect.get(target, key)
    const result = Reflect.set(target, key, value, receiver)

    // 値が変更された場合のみトリガー
    if (oldValue !== value) {
      trigger(target, key)

      // 新しいプロパティが追加された場合、イテレーション変更を通知
      if (!hadKey) {
        trigger(target, ITERATE_KEY)
      }
    }

    return result
  },

  deleteProperty(target, key) {
    const hadKey = Object.hasOwn(target, key)
    const result = Reflect.deleteProperty(target, key)

    if (hadKey && result) {
      trigger(target, key)
      // イテレーション変更を通知
      trigger(target, ITERATE_KEY)
    }

    return result
  },

  has(target, key) {
    track(target, key)
    return Reflect.has(target, key)
  },

  ownKeys(target) {
    // イテレーションを追跡
    track(target, ITERATE_KEY)
    return Reflect.ownKeys(target)
  },
}

/**
 * プレーンオブジェクトまたは配列をリアクティブ化します。
 * ネストされたオブジェクトも自動的にリアクティブ化されます。
 *
 * @template T
 * @param {T} target - リアクティブ化するオブジェクトまたは配列
 * @returns {T} リアクティブProxy（プレーンオブジェクト/配列以外はそのまま返す）
 *
 * @example
 * const state = reactive({ count: 0, user: { name: 'Alice' } });
 * state.count = 1; // 変更が追跡される
 */
export function reactive(target) {
  // プレーンオブジェクトと配列以外はそのまま返す
  if (!isPlainObject(target) && !Array.isArray(target)) {
    return target
  }

  // 既にリアクティブ化されている場合は既存のProxyを返す
  const existingProxy = reactiveMap.get(target)
  if (existingProxy) {
    // @ts-ignore - WeakMapから取得した値を元の型に復元
    return existingProxy
  }

  // 既にProxyの場合はそのまま返す
  if (rawMap.has(target)) {
    return target
  }

  const proxy = new Proxy(target, reactiveHandler)

  reactiveMap.set(target, proxy)
  rawMap.set(proxy, target)

  // @ts-ignore - Proxyを元の型として返す
  return proxy
}

/**
 * リアクティブプロパティへのアクセスを追跡します。
 * 現在実行中のエフェクトを依存関係として登録します。
 *
 * @param {object} target - 追跡対象のオブジェクト
 * @param {string|symbol} key - 追跡するプロパティのキー
 * @returns {void}
 */
function track(target, key) {
  // 現在実行中のエフェクトがない場合は追跡しない
  const effect = effectStack.at(-1)
  if (!effect) {
    return
  }

  // target -> key -> effects のマッピングを構築
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let deps = depsMap.get(key)
  if (!deps) {
    deps = new Set()
    depsMap.set(key, deps)
  }

  // 依存を登録
  deps.add(effect)
  effect.deps.push(deps)
}

/**
 * リアクティブプロパティの変更を通知します。
 * 依存しているすべてのエフェクトを再実行します。
 *
 * @param {object} target - 変更されたオブジェクト
 * @param {string|symbol} key - 変更されたプロパティのキー
 * @returns {void}
 */
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }

  const deps = depsMap.get(key)
  if (!deps) {
    return
  }

  // エフェクトを実行
  const effects = [...deps]

  if (isBatching) {
    // バッチモードの場合はペンディングに追加
    for (const effect of effects) {
      pendingEffects.add(effect)
    }
  } else {
    // 即座に実行
    for (const effect of effects) {
      effect.run()
    }
  }
}

/**
 * リアクティブに再実行される関数を作成します。
 * 関数内でアクセスされたリアクティブ値を自動的に追跡し、値が変更されると再実行されます。
 *
 * @param {() => any} fn - 実行する関数
 * @returns {() => void} エフェクトを停止するための関数
 *
 * @example
 * const state = reactive({ count: 0 });
 * const dispose = createEffect(() => {
 *   console.log('Count:', state.count);
 * });
 * state.count = 1; // エフェクトが再実行される
 * dispose(); // エフェクトを停止
 */
export function createEffect(fn) {
  /** @type {Effect} */
  const effect = {
    deps: [], // このエフェクトが依存しているdeps
    cleanups: new Set(), // クリーンアップ関数
    run() {
      // 既存の依存をクリーンアップ
      cleanup()

      // エフェクトを実行
      effectStack.push(effect)
      try {
        return fn()
      } catch (e) {
        console.error('Effect error:', e)
        throw e
      } finally {
        effectStack.pop()
      }
    },
  }

  const cleanup = () => {
    // 依存から削除
    for (const dep of effect.deps) {
      dep.delete(effect)
    }
    effect.deps = []

    // クリーンアップを実行
    const cleanups = [...effect.cleanups]
    effect.cleanups.clear()
    for (const cleanup of cleanups) {
      try {
        cleanup()
      } catch (e) {
        console.error('Cleanup error:', e)
      }
    }
  }

  // 現在のスコープを保存
  const currentScope = scopeStack.at(-1)

  // 初回実行
  effect.run()

  // dispose関数を作成
  const dispose = () => {
    cleanup()
    // スコープから削除
    currentScope?.cleanups.delete(dispose)
  }

  // 現在のスコープに登録
  currentScope?.cleanups.add(dispose)

  return dispose
}

/**
 * 新しいスコープを作成します。
 * スコープ内で作成されたすべてのエフェクトを管理し、スコープを解放すると一括でクリーンアップできます。
 *
 * @template {(dispose: () => void) => unknown} T
 * @param {T} fn - スコープ内で実行する関数。dispose関数が引数として渡されます
 * @returns {ReturnType<T>} 関数の戻り値
 *
 * @example
 * createRoot(dispose => {
 *   const state = reactive({ count: 0 });
 *   createEffect(() => console.log(state.count));
 *
 *   // 後でスコープをクリーンアップ
 *   setTimeout(() => dispose(), 1000);
 * });
 */
export function createRoot(fn) {
  /** @type {Scope} */
  const scope = {
    cleanups: new Set(),
  }

  const cleanup = () => {
    // 全てのクリーンアップ関数を実行（エフェクトの解放を含む）
    // Setをコピーしてからループ（ループ中にSetが変更される可能性があるため）
    const cleanups = [...scope.cleanups]
    scope.cleanups.clear()

    for (const cleanup of cleanups) {
      try {
        cleanup()
      } catch (e) {
        console.error('Cleanup error:', e)
      }
    }
  }

  scopeStack.push(scope)
  try {
    // @ts-ignore - fnの戻り値を返す
    return untrack(() => fn(cleanup))
  } finally {
    scopeStack.pop()
  }
}

/**
 * 関数内でのリアクティブ値アクセスを追跡しません。
 *
 * @template T
 * @param {() => T} fn - 追跡を無効化して実行する関数
 * @returns {T} 関数の戻り値
 *
 * @example
 * const state = reactive({ a: 1, b: 2 });
 * createEffect(() => {
 *   console.log('a:', state.a); // 追跡される
 *   console.log('b:', untrack(() => state.b)); // 追跡されない
 * });
 * state.b = 20; // エフェクトは再実行されない
 */
export function untrack(fn) {
  const prevStack = effectStack
  effectStack = []
  try {
    return fn()
  } finally {
    effectStack = prevStack
  }
}

/**
 * 関数内の複数の変更をまとめて処理します。
 * 関数の実行中は変更を即座に通知せず、関数完了後にまとめて通知します。
 *
 * @template T
 * @param {() => T} fn - バッチ処理する関数
 * @returns {T} 関数の戻り値
 *
 * @example
 * const state = reactive({ x: 0, y: 0 });
 * createEffect(() => console.log(`Position: (${state.x}, ${state.y})`));
 *
 * batch(() => {
 *   state.x = 10;
 *   state.y = 20;
 * }); // エフェクトは1回だけ実行される
 */
export function batch(fn) {
  if (isBatching) {
    // 既にバッチモードの場合はそのまま実行
    return fn()
  }

  isBatching = true
  try {
    return fn()
  } finally {
    isBatching = false

    // ペンディングされたエフェクトを実行
    const effects = [...pendingEffects]
    pendingEffects.clear()

    for (const effect of effects) {
      effect.run()
    }
  }
}

/**
 * 関数をbatch化します。
 * 返された関数は、呼び出し時に自動的にbatch内で実行されます。
 * DOMイベントハンドラやコールバック関数を最適化するのに便利です。
 *
 * @template {(this: unknown,...args: unknown[]) => unknown} T
 * @param {T} fn - batch化する関数
 * @returns {T} batch化された関数
 *
 * @example
 * const state = reactive({ x: 0, y: 0 });
 * createEffect(() => console.log(`Position: (${state.x}, ${state.y})`));
 *
 * // イベントハンドラをbatch化
 * const handleClick = batchify((e) => {
 *   state.x = 10;
 *   state.y = 20;
 * });
 * element.addEventListener('click', handleClick); // エフェクトは1回だけ実行される
 *
 * @example
 * // 非同期コールバックにも使える
 * const onMessage = batchify((data) => {
 *   state.messages.push(data);
 *   state.unreadCount++;
 * });
 * websocket.onmessage = onMessage;
 */
export function batchify(fn) {
  /** @type {T} */
  // @ts-ignore - 型推論のために戻り値の型を維持
  return function (...args) {
    return batch(() => fn.call(this, ...args))
  }
}

/**
 * 現在のエフェクトまたはスコープがクリーンアップされる際に実行される関数を登録します。
 * エフェクト内で呼び出された場合はエフェクトの再実行前とエフェクト解放時に実行されます。
 * エフェクト外（スコープ内）で呼び出された場合はスコープの解放時に実行されます。
 *
 * @param {() => void} fn - クリーンアップ時に実行する関数
 * @returns {void}
 *
 * @example
 * // エフェクト内での使用
 * createEffect(() => {
 *   const interval = setInterval(() => {
 *     console.log('Tick');
 *   }, 1000);
 *
 *   onCleanup(() => {
 *     clearInterval(interval);
 *   });
 * });
 *
 * @example
 * // スコープ内での使用
 * createRoot((dispose) => {
 *   const resource = acquireResource();
 *
 *   onCleanup(() => {
 *     releaseResource(resource);
 *   });
 *
 *   // 後でdispose()を呼ぶとクリーンアップが実行される
 * });
 */
export function onCleanup(fn) {
  const effect = effectStack.at(-1)
  if (effect) {
    // エフェクト内の場合はエフェクトに登録
    effect.cleanups.add(fn)
  } else {
    // エフェクト外の場合はスコープに登録
    const scope = scopeStack.at(-1)
    if (scope) {
      scope.cleanups.add(fn)
    } else {
      console.warn('onCleanup called outside of effect and scope')
    }
  }
}

/**
 * リアクティブProxyから元のオブジェクトを取得します。
 *
 * @template T
 * @param {T} observed - リアクティブProxyまたは通常のオブジェクト
 * @param {boolean} deep - 再帰的にtoRawを適用するかどうか
 * @returns {T} 元のオブジェクト（Proxyでない場合はそのまま返す）
 *
 * @example
 * const original = { value: 42 };
 * const proxied = reactive(original);
 * const raw = toRaw(proxied);
 * console.log(original === raw); // true
 */
export function toRaw(observed, deep = false) {
  // @ts-ignore - rawMap.get(observed)はobject型かもしれないが、その場合getはundefinedを返す
  observed = rawMap.get(observed) ?? observed

  if (deep) {
    let hasProxy = false

    if (isPlainObject(observed)) {
      for (const [key, value] of Object.entries(observed)) {
        const rawValue = toRaw(value, deep)
        if (rawValue !== value) {
          if (!hasProxy) {
            hasProxy = true
            observed = { ...observed }
          }
          // @ts-ignore - 取得元のキーなので問題なし
          observed[key] = rawValue
        }
      }
    } else if (Array.isArray(observed)) {
      for (const [index, value] of observed.entries()) {
        const rawValue = toRaw(value, deep)
        if (rawValue !== value) {
          if (!hasProxy) {
            hasProxy = true
            // @ts-ignore - 複製なので問題なし
            observed = [...observed]
          }
          // @ts-ignore - 取得元のキーなので問題なし
          observed[index] = rawValue
        }
      }
    }
  }

  return observed
}

/**
 * メモ化された計算値を作成します。
 * 関数の戻り値はプレーンオブジェクトでなければならず、依存関係が変更された場合にのみ再計算されます。
 * 結果はリアクティブオブジェクトとして返されます。
 *
 * @template {Record<string, any>} T
 * @param {() => T} fn - 実行する関数（戻り値はプレーンオブジェクトでなければならない）
 * @returns {NoInfer<T>} メモ化されたリアクティブオブジェクト
 *
 * @example
 * const state = reactive({ x: 1, y: 2 });
 * const sum = createMemo(() => ({ total: state.x + state.y }));
 * console.log(sum.total); // 3
 * state.x = 5; // sumが自動的に再計算される
 * console.log(sum.total); // 7
 */
export function createMemo(fn) {
  const rawMemo = /** @type {T} */ ({})
  const memo = reactive(rawMemo)

  // エフェクトを作成して依存関係を追跡
  createEffect(() => {
    const rawValue = toRaw(fn())

    // バッチ処理で更新を最適化
    batch(() => {
      // 古いキーを削除
      for (const key of Object.keys(rawMemo)) {
        if (!(key in rawValue)) {
          // @ts-ignore - 動的なキーの削除
          delete memo[key]
        }
      }

      // 新しい値を設定
      Object.assign(memo, rawValue)
    })
  })

  return memo
}
