import { prefs } from '@/r.js'
import { blockColors, shuffleBlocks, random } from './board-utils.js'
import { createBlankBoard, times } from './level-utils.js'
import { genRandomSeed } from '@/lib/random.js'

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
      const size = 4
      const lineList = [
        [
          { size, stacks: [size] },
          { size, stacks: [] },
          { size, stacks: [] },
          { size, stacks: [] },
        ],
      ]
      const board = createBlankBoard(this, seed, lineList, blockColors)
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
      const size = 4
      const lineList = [
        [
          { size, stacks: [size] },
          { size, stacks: [size] },
          { size, stacks: [] },
          { size, stacks: [] },
        ],
      ]
      const board = createBlankBoard(this, seed, lineList, blockColors)
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
      const size = 4
      const lineList = [
        [
          { size, stacks: [size] },
          { size, stacks: [size] },
          { size, stacks: [] },
          { size, stacks: [] },
        ],
      ]
      const board = createBlankBoard(this, seed, lineList, blockColors)
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
      const size = 4
      const lineList = [
        [
          { size, stacks: [size] },
          { size, stacks: [size] },
          { size, stacks: [] },
        ],
      ]
      const board = createBlankBoard(this, seed, lineList, blockColors)
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
      const size = 4
      const lineList = [
        [
          { size, stacks: [size] },
          { size, stacks: [size] },
          { size, stacks: [size] },
          { size, stacks: [] },
        ],
      ]
      const board = createBlankBoard(this, seed, lineList, blockColors)
      return shuffleBlocks(board, 20)
    },
  },
  {
    id: 'basic3',
    displayId: 'Level 1-3',
    name: 'よんれつEx',
    silentHelpPageId: 'ex',
    isVisible: () => prefs.levelStats['basic1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['basic2']?.wins > 0,
    createBoard(seed) {
      const size = 4
      const lineList = [
        [
          { size, stacks: [size - 1] },
          { size, stacks: [size - 1] },
          { size, stacks: [size - 1] },
          { size, stacks: [size - 1] },
        ],
      ]
      const board = createBlankBoard(this, seed, lineList, blockColors)
      return shuffleBlocks(board, 20)
    },
  },
  {
    id: 'high1',
    displayId: 'Level 2-1',
    name: 'たかく',
    isVisible: () => prefs.levelStats['intro3']?.wins > 0,
    isUnlocked: () => prefs.levelStats['intro3']?.wins > 0,
    createBoard(seed) {
      const size = 6
      const lineList = [
        [
          { size, stacks: [size] },
          { size, stacks: [size] },
          { size, stacks: [size] },
          { size, stacks: [] },
        ],
      ]
      const board = createBlankBoard(this, seed, lineList, blockColors)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'high2',
    displayId: 'Level 2-2',
    name: 'たかく++',
    isVisible: () => prefs.levelStats['high1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['high1']?.wins > 0,
    createBoard(seed) {
      const size = 8
      const lineList = [
        [
          { size, stacks: [size] },
          { size, stacks: [size] },
          { size, stacks: [size] },
          { size, stacks: [] },
        ],
      ]
      const board = createBlankBoard(this, seed, lineList, blockColors)
      return shuffleBlocks(board, 40)
    },
  },
  {
    id: 'high3',
    displayId: 'Level 2-3',
    name: 'たかくEx',
    helpPageId: 'ex',
    isVisible: () => prefs.levelStats['high1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['high2']?.wins > 0,
    createBoard(seed) {
      const size = 8
      const lineList = [
        [
          { size, stacks: [size - 2] },
          { size, stacks: [size - 2] },
          { size, stacks: [size - 2] },
          { size, stacks: [size - 2] },
        ],
      ]
      const board = createBlankBoard(this, seed, lineList, blockColors)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'wide1',
    displayId: 'Level 3-1',
    name: 'ひろく',
    isVisible: () => prefs.levelStats['intro3']?.wins > 0,
    isUnlocked: () => prefs.levelStats['intro3']?.wins > 0,
    createBoard(seed) {
      const size = 4
      const lineList = [
        [
          { size, stacks: [size] },
          { size, stacks: [size] },
          { size, stacks: [size] },
        ],
        [
          { size, stacks: [size] },
          { size, stacks: [size] },
          { size, stacks: [] },
        ],
      ]
      const board = createBlankBoard(this, seed, lineList, blockColors)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'wide2',
    displayId: 'Level 3-2',
    name: 'ひろく++',
    isVisible: () => prefs.levelStats['wide1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['wide1']?.wins > 0,
    createBoard(seed) {
      const size = 4
      const lineList = [
        [
          { size, stacks: [size] },
          { size, stacks: [size] },
          { size, stacks: [size] },
          { size, stacks: [size] },
        ],
        [
          { size, stacks: [size] },
          { size, stacks: [size] },
          { size, stacks: [size] },
          { size, stacks: [] },
        ],
      ]
      const board = createBlankBoard(this, seed, lineList, blockColors)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'wide3',
    displayId: 'Level 3-3',
    name: 'ひろくEx',
    helpPageId: 'ex',
    isVisible: () => prefs.levelStats['wide1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['wide2']?.wins > 0,
    createBoard(seed) {
      const size = 4
      const lineList = [
        [
          { size, stacks: [size - 1] },
          { size, stacks: [size - 1] },
          { size, stacks: [size - 1] },
          { size, stacks: [size - 1] },
        ],
        [
          { size, stacks: [size - 1] },
          { size, stacks: [size - 1] },
          { size, stacks: [size - 1] },
          { size, stacks: [size - 1] },
        ],
      ]
      const board = createBlankBoard(this, seed, lineList, blockColors)
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
      const size = 4
      const lineList = [
        [
          { size: size + 0, stacks: [size + 0] },
          { size: size + 1, stacks: [size + 1] },
          { size: size + 2, stacks: [size + 2] },
          { size: size + 3, stacks: [] },
        ],
      ]
      const board = createBlankBoard(this, seed, lineList, blockColors)
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
      const size = 2
      const lineList = [
        [
          { size: size + 0, stacks: [size + 0] },
          { size: size + 1, stacks: [size + 1] },
          { size: size + 2, stacks: [size + 2] },
          { size: size + 3, stacks: [] },
        ],
        [
          { size: size + 3, stacks: [size + 3] },
          { size: size + 2, stacks: [size + 2] },
          { size: size + 1, stacks: [size + 1] },
          { size: size + 0, stacks: [size + 0] },
        ],
      ]
      const board = createBlankBoard(this, seed, lineList, blockColors)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'stairs3',
    displayId: 'Level 4-3',
    name: 'かいだんEx',
    helpPageId: 'ex',
    isVisible: () => prefs.levelStats['stairs1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['stairs2']?.wins > 0,
    createBoard(seed) {
      const size = 2
      const lineList = [
        [
          { size: size + 1, stacks: [size + 0] },
          { size: size + 2, stacks: [size + 1] },
          { size: size + 3, stacks: [size + 2] },
          { size: size + 4, stacks: [size + 3] },
        ],
        [
          { size: size + 4, stacks: [size + 3] },
          { size: size + 3, stacks: [size + 2] },
          { size: size + 2, stacks: [size + 1] },
          { size: size + 1, stacks: [size + 0] },
        ],
      ]
      const board = createBlankBoard(this, seed, lineList, blockColors)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'stack1',
    displayId: 'Level 5-1',
    name: 'かさね',
    silentHelpPageId: 'stack',
    isVisible: () => prefs.levelStats['intro3']?.wins > 0,
    isUnlocked: () => prefs.levelStats['intro3']?.wins > 0,
    createBoard(seed) {
      const size = 4
      const sizeU = Math.max(Math.floor(size / 4), 2)
      const sizeD = size - sizeU
      const lineList = [
        [
          { size, stacks: [sizeD, sizeU] },
          { size, stacks: [sizeD, sizeU] },
          { size, stacks: [sizeD, sizeU] },
          { size, stacks: [] },
        ],
      ]
      const board = createBlankBoard(this, seed, lineList, blockColors)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'stack2',
    displayId: 'Level 5-2',
    name: 'かさね++',
    helpPageId: 'stack',
    isVisible: () => prefs.levelStats['stack1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['stack1']?.wins > 0,
    createBoard(seed) {
      const size = 5
      const sizeU = Math.max(Math.floor(size / 4), 2)
      const sizeD = size - sizeU
      const lineList = [
        [
          { size, stacks: [sizeD, sizeU] },
          { size, stacks: [sizeD, sizeU] },
          { size, stacks: [sizeD, sizeU] },
          { size, stacks: [] },
        ],
      ]
      const board = createBlankBoard(this, seed, lineList, blockColors)
      return shuffleBlocks(board, 30)
    },
  },
  {
    id: 'stack3',
    displayId: 'Level 5-3',
    name: 'かさねEx',
    helpPageId: 'stack',
    isVisible: () => prefs.levelStats['stack1']?.wins > 0,
    isUnlocked: () => prefs.levelStats['stack2']?.wins > 0,
    createBoard(seed) {
      const size = 5
      const sizeU = Math.max(Math.floor(size / 4), 2)
      const sizeD = size - sizeU
      const lineList = [
        [
          { size: size + 2, stacks: [sizeD, sizeU] },
          { size: size + 2, stacks: [sizeD, sizeU] },
          { size: size + 2, stacks: [sizeD, sizeU] },
          { size: size + 2, stacks: [sizeD, sizeU] },
        ],
      ]
      const board = createBlankBoard(this, seed, lineList, blockColors)
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
      seed = random.seed = seed ?? genRandomSeed()

      const streak = prefs.levelStats['outro1']?.streak ?? 0
      const limitStreak = Math.min(streak, 9)
      const isEx = streak % 3 === 2 // 周期的（streak 2, 5, 8）
      const isStack = streak > 2 && random.next() < 0.2 // 確率で（3連勝以上の場合）
      const isStairs = random.next() < 0.4 // 確率で
      const isWide = random.next() < 0.4 // 確率で

      // 基本は4列で列が連勝で長くなる
      let lineList = [times(4, () => ({ size: 4 + limitStreak, stacks: [4 + limitStreak] }))]

      if (isWide) {
        const capacity = lineList.flat().reduce((acc, line) => acc + line.size, 0)
        const aspectRatio = 4 / 3
        const lineCount = Math.min(Math.floor(Math.sqrt(capacity * aspectRatio)), isEx ? 8 : 9)
        const lineSize = Math.floor(capacity / lineCount)
        const lineSizeCeil = Math.ceil(capacity / lineCount)
        const halfCount = Math.ceil(lineCount / 2)
        const restCount = lineCount - halfCount
        lineList =
          lineCount <= 4
            ? [times(lineCount, () => ({ size: lineSize, stacks: [lineSize] }))]
            : [
                times(halfCount, () => ({ size: lineSizeCeil, stacks: [lineSizeCeil] })),
                times(restCount, () => ({ size: lineSize, stacks: [lineSize] })),
              ]
      }

      if (isStairs) {
        const d = 1 + Math.floor(limitStreak / 5) // 段差
        lineList = lineList.map((row) => {
          const n = row.length
          const total = row.reduce((acc, line) => acc + line.size, 0)
          // 等差数列: a, a+d, a+2d, ... 合計 = n*a + d*n*(n-1)/2
          const baseSize = Math.round((total - (d * n * (n - 1)) / 2) / n)
          return times(n, (i) => ({ size: baseSize + d * i, stacks: [baseSize + d * i] }))
        })
        if (lineList[1]) lineList[1].reverse() // 下段を降順にする
      }

      // stacks を決定
      const flatList = lineList.flat().sort((a, b) => a.size - b.size)
      const maxLineSize = flatList.reduce((max, line) => Math.max(max, line.size), 0)

      if (isEx) {
        // 隙間を分散
        let totalGap = maxLineSize
        while (totalGap > 0) {
          for (const line of flatList) {
            if (totalGap > 0 && line.stacks[0] > 2) {
              line.stacks[0]--
              totalGap--
            }
          }
        }
      } else {
        // 空列優先: 最大サイズの列を1つ空にする
        for (const line of flatList) {
          if (line.size === maxLineSize) {
            line.stacks = []
            break
          }
        }
      }

      if (isStack) {
        // 残りの色数を計算
        let restColorCount = 8 - flatList.reduce((acc, line) => acc + line.stacks.length, 0)

        // 大きい列から分割（flatList は小さい順なので逆順）
        for (const line of flatList.toReversed()) {
          if (restColorCount > 0 && line.stacks.length === 1 && line.stacks[0] >= 4) {
            const total = line.stacks[0]
            const upper = Math.max(Math.floor(total / 4), 2)
            line.stacks = [total - upper, upper]
            restColorCount--
          }
        }
      }

      const board = createBlankBoard(this, seed, lineList, blockColors)
      return shuffleBlocks(board, 100)
    },
  },
]

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
