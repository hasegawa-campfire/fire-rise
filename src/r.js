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

export const images = {
  takibi: {
    leg: {
      orange: '/assets/takibi-leg-orange.png',
      white: '/assets/takibi-leg-white.png',
      black: '/assets/takibi-leg-black.png',
    },
    bg: {
      orange: '/assets/takibi-bg-orange.png',
      white: '/assets/takibi-bg-white.png',
      black: '/assets/takibi-bg-black.png',
    },
    face: '/assets/takibi-face.png',
    body: {
      red: '/assets/takibi-body-red.png',
      blue: '/assets/takibi-body-blue.png',
      yellow: '/assets/takibi-body-yellow.png',
      green: '/assets/takibi-body-green.png',
      orange: '/assets/takibi-body-orange.png',
      pink: '/assets/takibi-body-pink.png',
      purple: '/assets/takibi-body-purple.png',
      grey: '/assets/takibi-body-grey.png',
    },
  },
}
