import { batch, batchify, createEffect, reactive, toRaw } from 'elii'
import { parseObject } from './utils.js'

/**
 * ローカルストレージ連携のステートを作成する
 *
 * @template {object} T
 * @param {string} storageKey
 * @param {T} defaultState
 * @returns {NoInfer<T>}
 */
export function createLocalStorageState(storageKey, defaultState) {
  const state = reactive({
    ...defaultState,
    ...parseObject(localStorage.getItem(storageKey)),
  })

  createEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state))
  })

  return state
}

/**
 * セッションストレージ連携のステートを作成する
 *
 * @template {object} T
 * @param {string} storageKey
 * @param {T} defaultState
 * @returns {NoInfer<T>}
 */
export function createSessionStorageState(storageKey, defaultState) {
  const state = reactive({
    ...defaultState,
    ...parseObject(sessionStorage.getItem(storageKey)),
  })

  createEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(state))
  })

  return state
}

/**
 * ヒストリー連携のステートを作成する
 *
 * 読み取り専用です。変更はpushHistoryStateを使用してください。
 *
 * @template {object} T
 * @param {string} stateKey
 * @param {T} defaultState
 * @returns {NoInfer<T>}
 */
export function createHistoryState(stateKey, defaultState) {
  const state = reactive({
    ...defaultState,
    ...history.state?.[stateKey],
  })

  addEventListener('popstate', () => {
    batch(() => Object.assign(state, { ...defaultState, ...history.state?.[stateKey] }))
  })

  history.replaceState({ ...history.state, [stateKey]: toRaw(state, true) }, '')
  historyStateMap.set(toRaw(state), { stateKey, defaultState })

  return state
}

/** @type {WeakMap<object, {stateKey: string, defaultState: object}>} */
const historyStateMap = new WeakMap()

/**
 * @template {object} T
 * @param {T} state
 * @param {Partial<NoInfer<T>>} newState
 */
export function pushHistoryState(state, newState) {
  const info = historyStateMap.get(toRaw(state))
  if (!info) throw Error('invalid history state object')

  batch(() => Object.assign(state, { ...info.defaultState, ...newState }))
  history.pushState({ [info.stateKey]: toRaw(state, true) }, '')
}
