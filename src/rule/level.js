import { prefs } from '@/r.js'
import { generateId } from '@/lib/utils.js'
import { lineWidth, blockColors, shuffleBlocks, calcLineHeight, blockHeight } from './board-utils.js'

/** @type {Level[]} */
export const levels = [
  {
    id: 'intro1',
    displayId: 'Intro 1',
    name: 'はじめる',
    helpPageId: 'basic',
    isVisible: () => true,
    isUnlocked: () => true,
    createBoard(seed) {
      const [color1] = blockColors
      const lineSize = 4
      let x = 0
      const board = createBlankBoard(this, seed)
      addLine(board, lineSize, fillArray(lineSize, color1), lineWidth * x++)
      addLine(board, lineSize, [], lineWidth * x++)
      addLine(board, lineSize, [], lineWidth * x++)
      addLine(board, lineSize, [], lineWidth * x++)
      return shuffleBlocks(board, 2)
    },
  },
  {
    id: 'intro2',
    displayId: 'Intro 2',
    name: 'いろは',
    helpPageId: 'move',
    isVisible: () => prefs.levelStats['intro1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['intro1']?.wins > 0,
    createBoard(seed) {
      const [color1, color2] = blockColors
      const lineSize = 4
      let x = 0
      const board = createBlankBoard(this, seed)
      addLine(board, lineSize, fillArray(lineSize, color1), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize, color2), lineWidth * x++)
      addLine(board, lineSize, [], lineWidth * x++)
      addLine(board, lineSize, [], lineWidth * x++)
      return shuffleBlocks(board, 3)
    },
  },
  {
    id: 'intro3',
    displayId: 'Intro 3',
    name: 'てはじめ',
    helpPageId: 'menu',
    isVisible: () => prefs.levelStats['intro2']?.wins > 0,
    isUnlocked: () => prefs.levelStats['intro2']?.wins > 0,
    createBoard(seed) {
      const [color1, color2] = blockColors
      const lineSize = 4
      let x = 0
      const board = createBlankBoard(this, seed)
      addLine(board, lineSize, fillArray(lineSize, color1), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize, color2), lineWidth * x++)
      addLine(board, lineSize, [], lineWidth * x++)
      addLine(board, lineSize, [], lineWidth * x++)
      return shuffleBlocks(board, 20)
    },
  },
  {
    id: 'basic1',
    displayId: 'Level 1-1',
    name: 'にれつ',
    isVisible: () => prefs.levelStats['intro3']?.wins > 0,
    isUnlocked: () => prefs.levelStats['intro3']?.wins > 0,
    createBoard(seed) {
      const [color1, color2] = blockColors
      const lineSize = 4
      let x = 1 / 4
      const board = createBlankBoard(this, seed)
      addLine(board, lineSize, fillArray(lineSize, color1), lineWidth * x++)
      x += 1 / 4
      addLine(board, lineSize, fillArray(lineSize, color2), lineWidth * x++)
      x += 1 / 4
      addLine(board, lineSize, [], lineWidth * x++)
      return shuffleBlocks(board, 20)
    },
  },
  {
    id: 'basic2',
    displayId: 'Level 1-2',
    name: 'さんれつ',
    isVisible: () => prefs.levelStats['basic1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['basic1']?.wins > 0,
    createBoard(seed) {
      const [color1, color2, color3] = blockColors
      const lineSize = 4
      let x = 0
      const board = createBlankBoard(this, seed)
      addLine(board, lineSize, fillArray(lineSize, color1), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize, color2), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize, color3), lineWidth * x++)
      addLine(board, lineSize, [], lineWidth * x++)
      return shuffleBlocks(board, 20)
    },
  },
  {
    id: 'basic3',
    displayId: 'Level 1-3',
    name: 'よんれつEX',
    isVisible: () => prefs.levelStats['basic1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['basic2']?.wins > 0,
    createBoard(seed) {
      const [color1, color2, color3, color4] = blockColors
      const lineSize = 4
      let x = 0
      const board = createBlankBoard(this, seed)
      addLine(board, lineSize, fillArray(lineSize - 1, color1), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize - 1, color2), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize - 1, color3), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize - 1, color4), lineWidth * x++)
      return shuffleBlocks(board, 20)
    },
  },
  {
    id: 'high1',
    displayId: 'Level 2-1',
    name: 'たかみ',
    isVisible: () => prefs.levelStats['intro3']?.wins > 0,
    isUnlocked: () => prefs.levelStats['intro3']?.wins > 0,
    createBoard(seed) {
      const [color1, color2, color3] = blockColors
      const lineSize = 6
      let x = 0
      const board = createBlankBoard(this, seed)
      addLine(board, lineSize, fillArray(lineSize, color1), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize, color2), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize, color3), lineWidth * x++)
      addLine(board, lineSize, [], lineWidth * x++)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'high2',
    displayId: 'Level 2-2',
    name: 'たかみ++',
    isVisible: () => prefs.levelStats['high1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['high1']?.wins > 0,
    createBoard(seed) {
      const [color1, color2, color3] = blockColors
      const lineSize = 8
      let x = 0
      const board = createBlankBoard(this, seed)
      addLine(board, lineSize, fillArray(lineSize, color1), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize, color2), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize, color3), lineWidth * x++)
      addLine(board, lineSize, [], lineWidth * x++)
      return shuffleBlocks(board, 40)
    },
  },
  {
    id: 'high3',
    displayId: 'Level 2-3',
    name: 'たかみEx',
    isVisible: () => prefs.levelStats['high1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['high2']?.wins > 0,
    createBoard(seed) {
      const [color1, color2, color3, color4] = blockColors
      const lineSize = 8
      let x = 0
      const board = createBlankBoard(this, seed)
      addLine(board, lineSize, fillArray(lineSize - 2, color1), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize - 2, color2), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize - 2, color3), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize - 2, color4), lineWidth * x++)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'wide1',
    displayId: 'Level 3-1',
    name: 'にだん',
    isVisible: () => prefs.levelStats['intro3']?.wins > 0,
    isUnlocked: () => prefs.levelStats['intro3']?.wins > 0,
    createBoard(seed) {
      const [color1, color2, color3, color4, color5] = blockColors
      const lineSize = 4
      let x = 0
      const h = calcLineHeight(lineSize) + blockHeight * 0.5
      const board = createBlankBoard(this, seed)
      x += 1 / 4
      addLine(board, lineSize, fillArray(lineSize, color1), lineWidth * x++)
      x += 1 / 4
      addLine(board, lineSize, fillArray(lineSize, color2), lineWidth * x++)
      x += 1 / 4
      addLine(board, lineSize, fillArray(lineSize, color3), lineWidth * x++)
      x = 1 / 4
      addLine(board, lineSize, fillArray(lineSize, color4), lineWidth * x++, h)
      x += 1 / 4
      addLine(board, lineSize, fillArray(lineSize, color5), lineWidth * x++, h)
      x += 1 / 4
      addLine(board, lineSize, [], lineWidth * x++, h)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'wide2',
    displayId: 'Level 3-2',
    name: 'にだん++',
    isVisible: () => prefs.levelStats['wide1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['wide1']?.wins > 0,
    createBoard(seed) {
      const [color1, color2, color3, color4, color5, color6, color7] = blockColors
      const lineSize = 4
      let x = 0
      const h = calcLineHeight(lineSize) + blockHeight * 0.5
      const board = createBlankBoard(this, seed)
      addLine(board, lineSize, fillArray(lineSize, color1), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize, color2), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize, color3), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize, color4), lineWidth * x++)
      x = 0
      addLine(board, lineSize, fillArray(lineSize, color5), lineWidth * x++, h)
      addLine(board, lineSize, fillArray(lineSize, color6), lineWidth * x++, h)
      addLine(board, lineSize, fillArray(lineSize, color7), lineWidth * x++, h)
      addLine(board, lineSize, [], lineWidth * x++, h)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'wide3',
    displayId: 'Level 3-3',
    name: 'にだんEx',
    isVisible: () => prefs.levelStats['wide1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['wide2']?.wins > 0,
    createBoard(seed) {
      const [color1, color2, color3, color4, color5, color6, color7, color8] = blockColors
      const lineSize = 4
      let x = 0
      const h = calcLineHeight(lineSize) + blockHeight * 0.5
      const board = createBlankBoard(this, seed)
      addLine(board, lineSize, fillArray(lineSize - 1, color1), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize - 1, color2), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize - 1, color3), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSize - 1, color4), lineWidth * x++)
      x = 0
      addLine(board, lineSize, fillArray(lineSize - 1, color5), lineWidth * x++, h)
      addLine(board, lineSize, fillArray(lineSize - 1, color6), lineWidth * x++, h)
      addLine(board, lineSize, fillArray(lineSize - 1, color7), lineWidth * x++, h)
      addLine(board, lineSize, fillArray(lineSize - 1, color8), lineWidth * x++, h)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'stairs1',
    displayId: 'Level 4-1',
    name: 'かいだん',
    isVisible: () => prefs.levelStats['intro3']?.wins > 0,
    isUnlocked: () => prefs.levelStats['intro3']?.wins > 0,
    createBoard(seed) {
      const [color1, color2, color3, color4, color5, color6, color7, color8] = blockColors
      let lineSize = 4
      let x = 0
      const board = createBlankBoard(this, seed)
      addLine(board, lineSize, fillArray(lineSize, color1), lineWidth * x++)
      lineSize++
      addLine(board, lineSize, fillArray(lineSize, color2), lineWidth * x++)
      lineSize++
      addLine(board, lineSize, fillArray(lineSize, color3), lineWidth * x++)
      lineSize++
      addLine(board, lineSize, [], lineWidth * x++)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'stairs2',
    displayId: 'Level 4-2',
    name: 'かいだん++',
    isVisible: () => prefs.levelStats['stairs1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['stairs1']?.wins > 0,
    createBoard(seed) {
      const [color1, color2, color3, color4, color5, color6, color7, color8] = blockColors
      let lineSizeU = 2
      let lineSizeD = 5
      let x = 0
      const h = blockHeight * 0.5
      const board = createBlankBoard(this, seed)
      addLine(board, lineSizeU, fillArray(lineSizeU, color1), lineWidth * x)
      addLine(board, lineSizeD, fillArray(lineSizeD, color2), lineWidth * x++, calcLineHeight(lineSizeU) + h)
      lineSizeU++
      lineSizeD--
      addLine(board, lineSizeU, fillArray(lineSizeU, color3), lineWidth * x)
      addLine(board, lineSizeD, fillArray(lineSizeD, color4), lineWidth * x++, calcLineHeight(lineSizeU) + h)
      lineSizeU++
      lineSizeD--
      addLine(board, lineSizeU, fillArray(lineSizeU, color5), lineWidth * x)
      addLine(board, lineSizeD, fillArray(lineSizeD, color6), lineWidth * x++, calcLineHeight(lineSizeU) + h)
      lineSizeU++
      lineSizeD--
      addLine(board, lineSizeU, [], lineWidth * x)
      addLine(board, lineSizeD, fillArray(lineSizeD, color7), lineWidth * x++, calcLineHeight(lineSizeU) + h)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'stairs3',
    displayId: 'Level 4-3',
    name: 'かいだんEx',
    isVisible: () => prefs.levelStats['stairs1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['stairs2']?.wins > 0,
    createBoard(seed) {
      const [color1, color2, color3, color4, color5, color6, color7, color8] = blockColors
      let lineSizeU = 3
      let lineSizeD = 6
      let x = 0
      const h = blockHeight * 0.5
      const board = createBlankBoard(this, seed)
      addLine(board, lineSizeU, fillArray(lineSizeU - 1, color1), lineWidth * x)
      addLine(board, lineSizeD, fillArray(lineSizeD - 1, color2), lineWidth * x++, calcLineHeight(lineSizeU) + h)
      lineSizeU++
      lineSizeD--
      addLine(board, lineSizeU, fillArray(lineSizeU - 1, color3), lineWidth * x)
      addLine(board, lineSizeD, fillArray(lineSizeD - 1, color4), lineWidth * x++, calcLineHeight(lineSizeU) + h)
      lineSizeU++
      lineSizeD--
      addLine(board, lineSizeU, fillArray(lineSizeU - 1, color5), lineWidth * x)
      addLine(board, lineSizeD, fillArray(lineSizeD - 1, color6), lineWidth * x++, calcLineHeight(lineSizeU) + h)
      lineSizeU++
      lineSizeD--
      addLine(board, lineSizeU, fillArray(lineSizeU - 1, color7), lineWidth * x)
      addLine(board, lineSizeD, fillArray(lineSizeD - 1, color8), lineWidth * x++, calcLineHeight(lineSizeU) + h)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'stack1',
    displayId: 'Level 5-1',
    name: 'かさね',
    isVisible: () => prefs.levelStats['intro3']?.wins > 0,
    isUnlocked: () => prefs.levelStats['intro3']?.wins > 0,
    createBoard(seed) {
      const [color1, color2, color3, color4, color5, color6] = blockColors
      const lineSize = 2
      let x = 0
      const board = createBlankBoard(this, seed)
      addLine(board, lineSize * 2, fillArray(lineSize, color1).concat(fillArray(lineSize, color2)), lineWidth * x++)
      addLine(board, lineSize * 2, fillArray(lineSize, color3).concat(fillArray(lineSize, color4)), lineWidth * x++)
      addLine(board, lineSize * 2, fillArray(lineSize, color5).concat(fillArray(lineSize, color6)), lineWidth * x++)
      addLine(board, lineSize * 2, [], lineWidth * x++)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'stack2',
    displayId: 'Level 5-2',
    name: 'かさね++',
    isVisible: () => prefs.levelStats['stack1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['stack1']?.wins > 0,
    createBoard(seed) {
      const [color1, color2, color3, color4, color5, color6] = blockColors
      const lineSizeU = 2
      const lineSizeD = 3
      const lineSize = lineSizeU + lineSizeD
      let x = 0
      const board = createBlankBoard(this, seed)
      addLine(board, lineSize, fillArray(lineSizeD, color1).concat(fillArray(lineSizeU, color2)), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSizeD, color3).concat(fillArray(lineSizeU, color4)), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSizeD, color5).concat(fillArray(lineSizeU, color6)), lineWidth * x++)
      addLine(board, lineSize, [], lineWidth * x++)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'stack3',
    displayId: 'Level 5-3',
    name: 'かさねEx',
    isVisible: () => prefs.levelStats['stack1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['stack2']?.wins > 0,
    createBoard(seed) {
      const [color1, color2, color3, color4, color5, color6, color7, color8] = blockColors
      const lineSizeU = 2
      const lineSizeD = 3
      const lineSize = lineSizeU + lineSizeD + 2
      let x = 0
      const board = createBlankBoard(this, seed)
      addLine(board, lineSize, fillArray(lineSizeD, color1).concat(fillArray(lineSizeU, color2)), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSizeD, color3).concat(fillArray(lineSizeU, color4)), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSizeD, color5).concat(fillArray(lineSizeU, color6)), lineWidth * x++)
      addLine(board, lineSize, fillArray(lineSizeD, color7).concat(fillArray(lineSizeU, color8)), lineWidth * x++)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'outro1',
    displayId: 'Outro',
    name: 'すべて',
    helpPageId: 'outro',
    isVisible: () => prefs.levelStats['intro3']?.wins > 0,
    isUnlocked() {
      const levelIds = ['basic3', 'high3', 'wide3', 'stairs3', 'stack3']
      return levelIds.every((levelId) => prefs.levelStats[levelId]?.wins > 0)
    },
    createBoard(seed) {
      const [color1] = blockColors
      const lineSize = 4
      let x = 0
      const board = createBlankBoard(this, seed)
      addLine(board, lineSize, fillArray(lineSize, color1), lineWidth * x++)
      addLine(board, lineSize, [], lineWidth * x++)
      addLine(board, lineSize, [], lineWidth * x++)
      addLine(board, lineSize, [], lineWidth * x++)
      return shuffleBlocks(board, 2)
    },
  },
]

/**
 * @template T
 * @param {number} length
 * @param {T} value
 */
function fillArray(length, value) {
  return Array.from({ length }, () => value)
}

/**
 * @param {Level} level
 * @param {number | null} seed
 * @returns {Board}
 */
function createBlankBoard(level, seed) {
  return {
    levelId: level.id,
    seed: seed ?? NaN,
    disableEmptyDrop: false, // level.disableEmptyDrop ?? false,
    steps: 0,
    lines: {},
    blocks: {},
  }
}

/**
 * @param {Board} board
 * @param {number} size
 * @param {string[]} colors
 */
function addLine(board, size, colors, x = 0, y = 0) {
  const lineId = generateId()
  const blockIds = colors.map((color, index) => {
    const blockId = generateId()
    board.blocks[blockId] = { id: blockId, color, lineId, index }
    return blockId
  })
  board.lines[lineId] = { id: lineId, blockIds, size, x, y }
}

/**
 * @param {string | Level} level
 */
export function getNextLevel(level) {
  const index = levels.findIndex((lv) => {
    return typeof level === 'string' ? lv.id === level : lv === level
  })
  if (index === -1) throw Error('level not found')
  for (let i = index + 1; i < levels.length; i++) {
    if (levels[i].isVisible()) {
      return levels[i]
    }
  }
  return null
}
