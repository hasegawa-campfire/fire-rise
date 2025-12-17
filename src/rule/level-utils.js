import { generateId } from '@/lib/utils.js'
import {
  lineWidth,
  calcLineHeight,
  blockHeight,
  blockOverlap,
  linePaddingTop,
  linePaddingBottom,
} from './board-utils.js'

const gridUnit = blockHeight - blockOverlap
const overHeight = blockOverlap + linePaddingTop + linePaddingBottom
const lineRowGap = gridUnit - (overHeight % gridUnit) + gridUnit

/**
 * @typedef {object} LineDef
 * @property {number} size
 * @property {number[]} stacks
 */

/**
 * @template T
 * @param {number} length
 * @param {(index: number, array: undefined[]) => T} mapfn
 * @returns {T[]}
 */
export function times(length, mapfn) {
  return Array.from({ length }).map((_, index, array) => mapfn(index, array))
}

/**
 * @param {Level} level
 * @param {number | null} seed
 * @param {LineDef[][]} lineList
 * @param {string[]} colors
 * @returns {Board}
 */
export function createBlankBoard(level, seed, lineList, colors) {
  const board = {
    levelId: level.id,
    seed: seed ?? NaN,
    disableEmptyDrop: false, // 廃止予定
    steps: 0,
    lines: {},
    blocks: {},
  }

  let colorIndex = 0
  /**
   * @param {number[]} stacks
   */
  const toColors = (stacks) => {
    return stacks.flatMap((stack) => {
      const color = colors[colorIndex++]
      return times(stack, () => color)
    })
  }

  // 縦長ボードの場合に gap を計算
  const gap = calcLineGap(lineList)
  const effectiveLineWidth = lineWidth + gap

  // 下段が1列少なく、かつ上段が全て同じサイズなら半列ずらす
  const isSameSize = lineList[0].every((line) => line.size === lineList[0][0].size)
  const lowerOffsetX = isSameSize && lineList[0].length - 1 === lineList[1]?.length ? 0.5 : 0

  for (let i = 0; i < lineList[0].length; i++) {
    const lineUpper = lineList[0][i]
    const lineLower = lineList[1]?.[i]
    addLine(board, lineUpper.size, toColors(lineUpper.stacks), effectiveLineWidth * i, 0, i % 2 === 0)

    if (lineLower) {
      const h = calcLineHeight(lineUpper.size) + lineRowGap
      addLine(
        board,
        lineLower.size,
        toColors(lineLower.stacks),
        effectiveLineWidth * (lowerOffsetX + i),
        h,
        i % 2 !== 0
      )
    }
  }

  return board
}

/**
 * 縦長ボードの場合に列間の gap を算出
 * @param {LineDef[][]} lineList
 * @returns {number}
 */
function calcLineGap(lineList) {
  const upperCount = lineList[0].length
  if (upperCount <= 1) return 0

  const upperWidth = lineWidth * upperCount
  const maxHeight = lineList[0]
    .map((lineUpper, i) => {
      let height = calcLineHeight(lineUpper.size)
      const lineLower = lineList[1]?.[i]
      if (lineLower) {
        height += calcLineHeight(lineLower.size) + lineRowGap
      }
      return height
    })
    .reduce((max, height) => Math.max(max, height), 0)

  const targetRatio = 1
  const currentRatio = upperWidth / maxHeight

  // 4列以下の場合は最低 gap を設定
  const minGap = upperCount < 4 ? lineWidth * 0.33 : 0

  if (currentRatio >= targetRatio) return minGap

  const targetWidth = targetRatio * maxHeight
  const totalGap = targetWidth - upperWidth

  return Math.max(minGap, Math.min(totalGap / (upperCount - 1), lineWidth * 0.5))
}

/**
 * @param {Board} board
 * @param {number} size
 * @param {string[]} colors
 */
function addLine(board, size, colors, x = 0, y = 0, even = true) {
  const lineId = generateId()
  const blockIds = colors.map((color, index) => {
    const blockId = generateId()
    board.blocks[blockId] = { id: blockId, color, lineId, index }
    return blockId
  })
  board.lines[lineId] = { id: lineId, blockIds, size, x, y, even }
}
