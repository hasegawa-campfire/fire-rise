import { reactive } from 'elii'
import { createLocalStorageState, createSessionStorageState } from '@/lib/state.js'
import { loadBin } from '@/lib/bin.js'
import { Audio, setCategoryVolume, setMasterVolume } from '@/lib/audio.js'
import { createRouteState } from './lib/route-state.js'

const storeKey = 'fire-rise'

export const runtime = reactive({
  result: /** @type { 'success' | 'failure' | null} */ (null),
})

export const prefs = createLocalStorageState(storeKey, {
  volumeBgm: 0.5,
  volumeSe: 0.5,
  seenHelps: /** @type {Record<string, boolean>} */ ({}),
  levelStats: /** @type {Record<string, LevelStats>} */ ({}),
  seenCompleted: false,
})

export const session = createSessionStorageState(storeKey, {})

export const route = createRouteState(storeKey, {
  page: /** @type {'title' | 'play'} */ ('title'),
  levelId: 'tutorial1',
  focusLevelId: /** @type {string | null} */ (null),
})

export const images = {
  takibi: {
    leg: {
      orange: new URL('./assets/takibi-leg-orange.png', import.meta.url).href,
      white: new URL('./assets/takibi-leg-white.png', import.meta.url).href,
      black: new URL('./assets/takibi-leg-black.png', import.meta.url).href,
    },
    bg: {
      orange: new URL('./assets/takibi-bg-orange.png', import.meta.url).href,
      white: new URL('./assets/takibi-bg-white.png', import.meta.url).href,
      black: new URL('./assets/takibi-bg-black.png', import.meta.url).href,
    },
    face: {
      default: new URL('./assets/takibi-face-default.png', import.meta.url).href,
      success: new URL('./assets/takibi-face-success.png', import.meta.url).href,
      failure: new URL('./assets/takibi-face-failure.png', import.meta.url).href,
      red: new URL('./assets/takibi-face-red.png', import.meta.url).href,
      blue: new URL('./assets/takibi-face-blue.png', import.meta.url).href,
      yellow: new URL('./assets/takibi-face-yellow.png', import.meta.url).href,
      green: new URL('./assets/takibi-face-green.png', import.meta.url).href,
      orange: new URL('./assets/takibi-face-orange.png', import.meta.url).href,
      pink: new URL('./assets/takibi-face-pink.png', import.meta.url).href,
      purple: new URL('./assets/takibi-face-purple.png', import.meta.url).href,
      gray: new URL('./assets/takibi-face-gray.png', import.meta.url).href,
    },
    body: {
      red: new URL('./assets/takibi-body-red.png', import.meta.url).href,
      blue: new URL('./assets/takibi-body-blue.png', import.meta.url).href,
      yellow: new URL('./assets/takibi-body-yellow.png', import.meta.url).href,
      green: new URL('./assets/takibi-body-green.png', import.meta.url).href,
      orange: new URL('./assets/takibi-body-orange.png', import.meta.url).href,
      pink: new URL('./assets/takibi-body-pink.png', import.meta.url).href,
      purple: new URL('./assets/takibi-body-purple.png', import.meta.url).href,
      gray: new URL('./assets/takibi-body-gray.png', import.meta.url).href,
    },
  },
  wave: new URL('./assets/wave.png', import.meta.url).href,
  halfTone: new URL('./assets/half-tone.png', import.meta.url).href,
  star: new URL('./assets/star.png', import.meta.url).href,
  boardBg: new URL('./assets/board-bg.png', import.meta.url).href,
  icon: {
    audioOn: new URL('./assets/icon-audio-on.svg', import.meta.url).href,
    audioOff: new URL('./assets/icon-audio-off.svg', import.meta.url).href,
    help: new URL('./assets/icon-help.svg', import.meta.url).href,
    back: new URL('./assets/icon-back.svg', import.meta.url).href,
    close: new URL('./assets/icon-close.svg', import.meta.url).href,
    lock: new URL('./assets/icon-lock.svg', import.meta.url).href,
    undo: new URL('./assets/icon-undo.svg', import.meta.url).href,
    restart: new URL('./assets/icon-restart.svg', import.meta.url).href,
    circle: new URL('./assets/icon-circle.svg', import.meta.url).href,
    arrowLeft: new URL('./assets/icon-arrow-left.svg', import.meta.url).href,
    arrowRight: new URL('./assets/icon-arrow-right.svg', import.meta.url).href,
    finger: new URL('./assets/icon-finger.svg', import.meta.url).href,
  },
}

export const bgm = {
  title: new Audio(loadBin('bgm/title.mp3'), {
    category: 'bgm',
    volume: 0.22,
    loop: true,
  }),
  play: new Audio(loadBin('bgm/play.mp3'), {
    category: 'bgm',
    volume: 0.3,
    loop: true,
    // loop: {
    //   start: 10.578,
    //   end: 69.354,
    // },
  }),
}

export const se = {
  clear: new Audio(loadBin('se/clear.mp3'), { category: 'se', volume: 0.8 }),
  click: new Audio(loadBin('se/click.mp3'), { category: 'se', volume: 0.8 }),
  move: new Audio(loadBin('se/move.wav'), { category: 'se', volume: 0.6, minTime: 0.05 }),
  start: new Audio(loadBin('se/start.mp3'), { category: 'se', volume: 0.9 }),
  fire: new Audio(loadBin('se/fire.mp3'), { category: 'se', volume: 0.3 }),
}

setMasterVolume(0.7)
setCategoryVolume('bgm', prefs.volumeBgm)
setCategoryVolume('se', prefs.volumeSe)
