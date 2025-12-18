import { reactive } from 'elii'
import { createLocalStorageState, createSessionStorageState } from '@/lib/state.js'
import { loadAsset, loadAssetUrl } from '@/lib/asset.js'
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
      orange: loadAssetUrl('images/takibi-leg-orange.png'),
      white: loadAssetUrl('images/takibi-leg-white.png'),
      black: loadAssetUrl('images/takibi-leg-black.png'),
    },
    bg: {
      orange: loadAssetUrl('images/takibi-bg-orange.png'),
      white: loadAssetUrl('images/takibi-bg-white.png'),
      black: loadAssetUrl('images/takibi-bg-black.png'),
    },
    face: {
      default: loadAssetUrl('images/takibi-face-default.png'),
      success: loadAssetUrl('images/takibi-face-success.png'),
      failure: loadAssetUrl('images/takibi-face-failure.png'),
      red: loadAssetUrl('images/takibi-face-red.png'),
      blue: loadAssetUrl('images/takibi-face-blue.png'),
      yellow: loadAssetUrl('images/takibi-face-yellow.png'),
      green: loadAssetUrl('images/takibi-face-green.png'),
      orange: loadAssetUrl('images/takibi-face-orange.png'),
      pink: loadAssetUrl('images/takibi-face-pink.png'),
      purple: loadAssetUrl('images/takibi-face-purple.png'),
      gray: loadAssetUrl('images/takibi-face-gray.png'),
    },
    body: {
      red: loadAssetUrl('images/takibi-body-red.png'),
      blue: loadAssetUrl('images/takibi-body-blue.png'),
      yellow: loadAssetUrl('images/takibi-body-yellow.png'),
      green: loadAssetUrl('images/takibi-body-green.png'),
      orange: loadAssetUrl('images/takibi-body-orange.png'),
      pink: loadAssetUrl('images/takibi-body-pink.png'),
      purple: loadAssetUrl('images/takibi-body-purple.png'),
      gray: loadAssetUrl('images/takibi-body-gray.png'),
    },
  },
  wave: loadAssetUrl('images/wave.png'),
  halfTone: loadAssetUrl('images/half-tone.png'),
  star: loadAssetUrl('images/star.png'),
  boardBg: loadAssetUrl('images/board-bg.png'),
  icon: {
    audioOn: loadAssetUrl('images/icon-audio-on.svg'),
    audioOff: loadAssetUrl('images/icon-audio-off.svg'),
    help: loadAssetUrl('images/icon-help.svg'),
    back: loadAssetUrl('images/icon-back.svg'),
    close: loadAssetUrl('images/icon-close.svg'),
    lock: loadAssetUrl('images/icon-lock.svg'),
    undo: loadAssetUrl('images/icon-undo.svg'),
    restart: loadAssetUrl('images/icon-restart.svg'),
    circle: loadAssetUrl('images/icon-circle.svg'),
    arrowLeft: loadAssetUrl('images/icon-arrow-left.svg'),
    arrowRight: loadAssetUrl('images/icon-arrow-right.svg'),
    finger: loadAssetUrl('images/icon-finger.svg'),
  },
}

export const bgm = {
  title: new Audio(loadAsset('bgm/title.mp3'), {
    category: 'bgm',
    volume: 0.2,
    loop: true,
  }),
  play: new Audio(loadAsset('bgm/play.mp3'), {
    category: 'bgm',
    volume: 0.35,
    loop: {
      start: 19.825,
    },
  }),
}

export const se = {
  clear: new Audio(loadAsset('se/clear.mp3'), { category: 'se', volume: 0.3 }),
  click: new Audio(loadAsset('se/click.mp3'), { category: 'se', volume: 0.8 }),
  move: new Audio(loadAsset('se/move.mp3'), { category: 'se', volume: 0.5, minTime: 0.05 }),
  start: new Audio(loadAsset('se/start.mp3'), { category: 'se', volume: 0.9 }),
}

setMasterVolume(1)
setCategoryVolume('bgm', prefs.volumeBgm)
setCategoryVolume('se', prefs.volumeSe)
