import { reactive } from 'elii'
import {
  createHistoryState,
  createLocalStorageState,
  createSessionStorageState,
  pushHistoryState,
} from '@/lib/state.js'

const storeKey = 'fire-tower'

export const runtime = reactive({})

export const settings = createLocalStorageState(storeKey, {
  isMute: false,
})

export const session = createSessionStorageState(storeKey, {})

export const route = createHistoryState(storeKey, {
  page: /** @type {'title' | 'play'} */ ('title'),
  levelId: 'tutorial1',
})

/**
 * @param {Partial<typeof route>} newState
 */
export function pushRoute(newState) {
  pushHistoryState(route, newState)
}
