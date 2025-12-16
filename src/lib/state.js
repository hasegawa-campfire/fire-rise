import { createEffect, reactive } from 'elii'
import { parseObject } from './utils.js'

/**
 * ローカルストレージ連携のステートを作成する
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
