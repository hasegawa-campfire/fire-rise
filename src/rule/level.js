import { generateId, shuffleArray } from '@/lib/utils.js'
import { blockWidth, linePaddingSide, blockColors, shuffleBlocks } from './block-utils.js'

const lineWidth = blockWidth + linePaddingSide * 2

export const levels = [
  {
    id: 'tutorial1',
    name: '始め',
    isLocked: () => false,
    createLines() {
      const [color1] = shuffleArray(blockColors)
      const lineSize = 4
      let x = 0
      const lines = [
        createLine(lineSize, fillArray(lineSize, color1), lineWidth * x++),
        createLine(lineSize, fillArray(0, color1), lineWidth * x++),
        createLine(lineSize, fillArray(0, color1), lineWidth * x++),
        createLine(lineSize, fillArray(0, color1), lineWidth * x++),
      ]
      return shuffleBlocks(lines, 2)
    },
  },
  {
    id: 'tutorial2',
    name: '始め＋',
    isLocked: () => false,
    createLines() {
      const [color1, color2] = shuffleArray(blockColors)
      const lineSize = 4
      let x = 0
      const lines = [
        createLine(lineSize, fillArray(lineSize, color1), lineWidth * x++),
        createLine(lineSize, fillArray(lineSize, color2), lineWidth * x++),
        createLine(lineSize, fillArray(0, color1), lineWidth * x++),
        createLine(lineSize, fillArray(0, color1), lineWidth * x++),
      ]
      return shuffleBlocks(lines, 3)
    },
  },
  {
    id: 'tutorial3',
    name: '始め＋＋',
    isLocked: () => false,
    createLines() {
      const [color1, color2] = shuffleArray(blockColors)
      const lineSize = 4
      let x = 0
      const lines = [
        createLine(lineSize, fillArray(lineSize, color1), lineWidth * x++),
        createLine(lineSize, fillArray(lineSize, color2), lineWidth * x++),
        createLine(lineSize, fillArray(0, color1), lineWidth * x++),
        createLine(lineSize, fillArray(0, color1), lineWidth * x++),
      ]
      return shuffleBlocks(lines, 10)
    },
  },
  {
    id: 'normal1',
    name: 'ノーマル1',
    isLocked: () => false,
    createLines() {
      const [color1, color2, color3] = shuffleArray(blockColors)
      const lineSize = 4
      let x = 0
      const lines = [
        createLine(lineSize, fillArray(lineSize, color1), lineWidth * x++),
        createLine(lineSize, fillArray(lineSize, color2), lineWidth * x++),
        createLine(lineSize, fillArray(lineSize, color3), lineWidth * x++),
        createLine(lineSize, fillArray(0, color1), lineWidth * x++),
      ]
      return shuffleBlocks(lines, 20)
    },
  },
  {
    id: 'deep1',
    name: '深い',
    isLocked: () => false,
    createLines() {
      const [color1, color2, color3] = shuffleArray(blockColors)
      const lineSize = 8
      let x = 0
      const lines = [
        createLine(lineSize, fillArray(lineSize, color1), lineWidth * x++),
        createLine(lineSize, fillArray(lineSize, color2), lineWidth * x++),
        createLine(lineSize, fillArray(lineSize, color3), lineWidth * x++),
        createLine(lineSize, fillArray(0, color1), lineWidth * x++),
      ]
      return shuffleBlocks(lines, 30)
    },
  },
  {
    id: 'wide1',
    name: '広い',
    isLocked: () => false,
    createLines() {
      const [color1, color2, color3, color4, color5, color6, color7] = shuffleArray(blockColors)
      const lineSize = 4
      let x = 0
      const lines = [
        createLine(lineSize, fillArray(lineSize, color1), lineWidth * x++),
        createLine(lineSize, fillArray(lineSize, color2), lineWidth * x++),
        createLine(lineSize, fillArray(lineSize, color3), lineWidth * x++),
        createLine(lineSize, fillArray(lineSize, color4), lineWidth * x++),
        createLine(lineSize, fillArray(lineSize, color5), lineWidth * x++),
        createLine(lineSize, fillArray(lineSize, color6), lineWidth * x++),
        createLine(lineSize, fillArray(lineSize, color7), lineWidth * x++),
        createLine(lineSize, fillArray(0, color1), lineWidth * x++),
      ]
      return shuffleBlocks(lines, 30)
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
 * @param {number} size
 * @param {string[]} colors
 * @returns {Line}
 */
function createLine(size, colors, x = 0, y = 0) {
  const blocks = colors.map((color) => {
    return { id: generateId(), color }
  })
  return { id: generateId(), blocks, size, x, y }
}

/**
 * @param {number} lineSize
 */
function createLines(lineSize) {
  /** @type {Line[]} */
  const lines = shuffleArray(['DimGrey', 'Purple', 'gold', []]).map((color, i, arr) => {
    const colors = Array.isArray(color) ? color : [color]

    let blocks = /** @type {Block[]} */ ([])

    if (colors.length > 0) {
      blocks = Array.from({ length: lineSize }, (_, i) => {
        const color = colors[(colors.length * (i / lineSize)) | 0]
        return { id: generateId(), color }
      })
    }

    return { id: generateId(), blocks, size: lineSize, x: i, y: i, w: 1 }
  })

  return shuffleBlocks(lines, 10)
}
