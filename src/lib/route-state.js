import { batch, reactive, toRaw } from 'elii'
import { stickyActivation } from '@/lib/user-activation.js'

/**
 * ルート用のステートを作成する
 *
 * stateは読み取り専用です。変更はpushStateを使用してください。
 * @template {object} T
 * @param {string} stateKey
 * @param {T} defaultState
 */
export function createRouteState(stateKey, defaultState) {
  const state = reactive({
    ...defaultState,
    ...history.state?.[stateKey],
  })

  let resolvers = abortable(stickyActivation)

  history.replaceState({ ...history.state, [stateKey]: toRaw(state, true) }, '')

  addEventListener('popstate', () => {
    resolvers.abort()
    const { finished } = startViewTransition(() => {
      batch(() => Object.assign(state, { ...defaultState, ...history.state?.[stateKey] }))
    })
    resolvers = abortable(finished)
  })

  /**
   * @param {Partial<T>} newState
   */
  const pushState = (newState) => {
    resolvers.abort()
    const { finished } = startViewTransition(() => {
      batch(() => Object.assign(state, { ...defaultState, ...newState }))
      history.pushState({ ...history.state, [stateKey]: toRaw(state, true) }, '')
    })
    resolvers = abortable(finished)
  }

  /**
   * @param {() => void} callback
   */
  const onReady = (callback) => {
    resolvers.promise
      .then(() => callback())
      .catch((err) => {
        if (!isAbortError(err)) throw err
      })
  }

  return { state, pushState, onReady }
}

/**
 * @param {ViewTransitionUpdateCallback} fn
 * @returns {{finished: Promise<void>}}
 */
function startViewTransition(fn) {
  if (document.startViewTransition) {
    return document.startViewTransition(fn)
  } else {
    return { finished: Promise.resolve(fn()) }
  }
}

/**
 * @template {Promise<unknown>} T
 * @param {T} promise
 * @returns {{abort: () => void, promise: T}}
 */
function abortable(promise) {
  const { reject, promise: abortPromise } = Promise.withResolvers()

  return {
    /**
     * @param {unknown} [reason]
     */
    abort(reason) {
      const message = reason ? String(reason) : 'aborted'
      reject(new DOMException(message, 'AbortError'))
    },
    promise: /** @type {T} */ (Promise.race([promise, abortPromise])),
  }
}

/**
 * @param {unknown} error
 * @returns {error is Error}
 */
function isAbortError(error) {
  return error instanceof Error && error.name === 'AbortError'
}
