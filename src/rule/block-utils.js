/** @type {Record<string, string>} */
export const blockFillColors = {
  red: 'OrangeRed',
  blue: 'DeepSkyBlue',
  yellow: 'gold',
  green: 'limegreen',
  orange: 'orange',
  pink: 'HotPink',
  purple: 'Plum',
  grey: 'DarkGray',
}
export const blockColors = ['red', 'blue', 'yellow', 'green', 'orange', 'pink', 'purple', 'grey']
export const blockWidth = 1166
export const blockHeight = 1322
export const blockOverlap = 600
export const linePaddingSide = 200
export const linePaddingTop = 200
export const linePaddingBottom = 400

/**
 * @typedef {Object} GetMoveWeightContext
 * @property {Line[]} lines
 * @property {number} dstLineIndex
 * @property {number} dstBlockIndex
 * @property {number} srcLineIndex
 */

import { shuffleArray } from '@/lib/utils.js'

/**
 * @typedef {Object} GetPuzzleScoreContext
 * @property {Line[]} lines
 */

/**
 * @typedef {Object} ShuffleResult
 * @property {number} dstLineIndex
 * @property {number} dstBlockIndex
 * @property {number} srcLineIndex
 */

/**
 * @param {GetMoveWeightContext} context
 */
function getDefaultMoveWeight(context) {
  const { lines, dstLineIndex, dstBlockIndex, srcLineIndex } = context
  let score = 0
  let color = ''

  for (const block of lines[dstLineIndex].blocks.slice(dstBlockIndex)) {
    score++
    if (block.color !== color) score += 3
    color = block.color
  }

  return score ** 3
}

/**
 * @param {GetPuzzleScoreContext} context
 */
function getDefaultPuzzleScore(context) {
  const { lines } = context
  let score = 0

  for (const line of lines) {
    let color = ''
    for (const block of line.blocks) {
      if (block.color !== color) score++
      color = block.color
    }
    score += line.size > line.blocks.length ? 2 : 0
  }

  score += Math.sqrt(Array.from(getAllPossibleMoves(lines)).length)

  return score
}

/**
 * @param {Line[]} lines
 */
export function shuffleLines(lines) {
  for (const size of new Set(lines.map((line) => line.size))) {
    const blockses = lines.filter((line) => line.size === size).map((line) => line.blocks)
    for (const [index, blocks] of shuffleArray(blockses).entries()) {
      lines[index].blocks = blocks
    }
  }
  return lines
}

/**
 * @param {Line[]} lines
 * @param {number} maxMoves
 * @param {number} trials
 * @param {(context: GetPuzzleScoreContext) => number} [getPuzzleScore]
 * @param {(context: GetMoveWeightContext) => number} [getMoveWeight]
 */
export function shuffleBlocks(lines, maxMoves = 20, trials = 20, getPuzzleScore, getMoveWeight) {
  getPuzzleScore = getPuzzleScore ?? getDefaultPuzzleScore
  getMoveWeight = getMoveWeight ?? getDefaultMoveWeight

  let bestScore = -Infinity
  let bestLines = lines

  shuffleLines(lines)

  for (let j = 0; j < trials; j++) {
    const clonedLines = lines.map((line) => {
      return { ...line, blocks: line.blocks.slice() }
    })

    for (let i = 0; i < maxMoves; i++) {
      const result = _shuffleBlocks(clonedLines, getMoveWeight)
      if (!result) break
      // console.log(
      //   [result.srcLineIndex, lines[result.srcLineIndex].length],
      //   [result.dstLineIndex, result.dstBlockIndex],
      //   lines[result.dstLineIndex].slice(result.dstBlockIndex).map((block) => block.color)
      // )
    }

    const score = getPuzzleScore({ lines: clonedLines })
    if (score > bestScore) {
      bestScore = score
      bestLines = clonedLines
    }
  }

  return bestLines
}

/**
 * @param {Line[]} lines
 * @param {(context: GetMoveWeightContext) => number} getMoveWeight
 */
function _shuffleBlocks(lines, getMoveWeight) {
  let shuffleResult = /** @type {ShuffleResult | null} */ (null)
  let sumWeight = 0

  /**
   * 移動の候補に挙げる
   *
   * @param {ShuffleResult} result
   */
  const nominateShuffle = (result) => {
    const weight = getMoveWeight({ ...result, lines })
    if (weight <= 0) return
    sumWeight += weight
    if (Math.random() * sumWeight < weight) {
      shuffleResult = result
    }
  }

  // それぞれのブロックを移動先と仮定して、移動元として成り立つ場所を探す
  for (const [dstLineIndex, dstLine] of lines.entries()) {
    for (const [dstBlockIndex, dstBlock] of dstLine.blocks.entries()) {
      // 移動先は、空の列か同色ブロックの上でなければならないので、下にブロックがあり、それが異色の場合は移動先としてありえない
      const dstPrevBlock = dstBlockIndex > 0 ? dstLine.blocks[dstBlockIndex - 1] : null
      if (dstPrevBlock && dstPrevBlock.color !== dstBlock.color) continue

      // 移動してきたブロック塊サイズ (移動先ブロックから先全部)
      const dstBlockLength = dstLine.blocks.length - dstBlockIndex

      // 移動元として可能な列を捜査
      for (const [srcLineIndex, srcLine] of lines.entries()) {
        // 移動元と移動先が同じ列はありえない
        if (srcLineIndex === dstLineIndex) continue

        // 移動元に余白が足りない場合は除外する
        if (srcLine.size - srcLine.blocks.length < dstBlockLength) continue

        // 同色の分割は出来ないので、移動元に残っているブロックは必ず異色でなければならない
        const srcLastBlock = srcLine.blocks.at(-1)
        if (srcLastBlock?.color === dstBlock.color) continue

        // 問題作成において、状況の変わらない移動は除外する
        // 具体的には、同じサイズの列にブロックを丸ごと移す場合
        if (dstLine.size === srcLine.size && !srcLastBlock && !dstPrevBlock) continue

        nominateShuffle({ dstLineIndex, dstBlockIndex, srcLineIndex })
      }
    }
  }

  // 移動元にブロックを移す
  if (shuffleResult) {
    const blocks = lines[shuffleResult.dstLineIndex].blocks.splice(shuffleResult.dstBlockIndex)
    lines[shuffleResult.srcLineIndex].blocks.push(...blocks)
  }

  return shuffleResult
}

/**
 * 列から列へブロックを移動できるかどうかを判定する
 *
 * @param {Line} dstLine
 * @param {Line} srcLine
 * @param {number} srcBlockIndex
 */
export function isAddableBlocksToLine(dstLine, srcLine, srcBlockIndex = 0) {
  // 同じ列は移動不可能
  if (dstLine.id === srcLine.id) return false

  // 移動元のブロックがない
  const srcFirstBlock = srcLine.blocks.at(srcBlockIndex)
  if (!srcFirstBlock) return false

  // 同色の分割は出来ない
  const srcPrevBlock = srcBlockIndex > 0 ? srcLine.blocks[srcBlockIndex - 1] : null
  if (srcPrevBlock?.color === srcFirstBlock.color) return false

  // 移動先に余白が足りない
  const srcBlockLength = srcLine.blocks.length - srcBlockIndex
  if (dstLine.size - dstLine.blocks.length < srcBlockLength) return false

  // 列の末尾とブロックの先頭が同色なら移動可能 (移動先が空列なら色を問わない)
  const dstLastBlock = dstLine.blocks.at(-1)
  return !dstLastBlock || srcFirstBlock.color === dstLastBlock?.color
}

/**
 * 移動可能な候補を列挙する
 *
 * @param {Line[]} lines
 */
export function* getAllPossibleMoves(lines) {
  for (const [srcLineIndex, srcLine] of lines.entries()) {
    for (const [srcBlockIndex, srcBlock] of srcLine.blocks.entries()) {
      // 同色の分割は出来ないので、移動元の足場があるなら必ず異色でなければならない
      const srcPrevBlock = srcBlockIndex > 0 ? srcLine.blocks[srcBlockIndex - 1] : null
      if (srcBlock.color === srcPrevBlock?.color) continue

      for (const [dstLineIndex, dstLine] of lines.entries()) {
        // 同じサイズの列にブロックを丸ごと移動しても無意味なので数えない
        if (srcLine.size === dstLine.size && srcBlockIndex === 0 && dstLine.blocks.length === 0) continue

        // 移動可能な場合はカウントを増やす
        if (isAddableBlocksToLine(dstLine, srcLine, srcBlockIndex)) {
          yield { srcLineIndex, srcBlockIndex, dstLineIndex }
        }
      }
    }
  }
}

/**
 * ゴール状態かどうかを判定する
 * - 各色のブロックが全て連続している
 * - 同じ色が複数の列に散らばっていない
 *
 * @param {Line[]} lines
 * @returns {boolean}
 */
export function isGoalState(lines) {
  // 既出の色を記録
  const seenColors = new Set()

  for (const line of lines) {
    let prevColor = null

    for (const block of line.blocks) {
      // 色が変わったとき既出の色であればNG
      if (block.color !== prevColor) {
        if (seenColors.has(block.color)) return false
        seenColors.add(block.color)
      }

      prevColor = block.color
    }
  }

  return true
}

/**
 * 手詰まりかどうかを判定する
 *
 * @param {Line[]} lines
 * @returns {boolean}
 */
export function isStuckState(lines) {
  return Array.from(getAllPossibleMoves(lines)).length === 0
}

/**
 * 盤面のハッシュ値を取得する
 * 列の順序と色の違いを無視して構造だけを比較するため、
 * 列をソートしてから色を出現順の番号に正規化し、16進数ハッシュにする
 *
 * @param {Line[]} lines
 * @returns {string} 16進数ハッシュ文字列
 */
export function getStateHash(lines) {
  // 列を色とキーのペアに変換
  const paired = lines
    .map((line) => {
      const colors = line.blocks.map((block) => block.color)
      const key = colors.join(',')
      return { colors, key, size: line.size }
    })
    .sort((a, b) => a.size - b.size || a.key.localeCompare(b.key))

  // ソート後の列を走査して色を出現順の番号に正規化
  const colorMap = new Map()
  let colorId = 1

  const normalized = paired
    .map(({ colors }) =>
      colors
        .map((color) => {
          let id = colorMap.get(color)
          if (!id) {
            id = colorId++
            colorMap.set(color, id)
          }
          return id
        })
        .join(',')
    )
    .join('|')

  // 文字列を32ビットハッシュに変換
  let hash = 0
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // 32ビットに変換
  }

  // 符号なし整数として16進数に変換
  return (hash >>> 0).toString(16).padStart(8, '0')
}

/**
 * ブロックIDからブロックを取得する
 * @param {Line[]} lines
 * @param {string} blockId
 */
export function findBlockById(lines, blockId) {
  for (const [lineIndex, line] of lines.entries()) {
    for (const [blockIndex, block] of line.blocks.entries()) {
      if (block.id === blockId) return { line, lineIndex, block, blockIndex }
    }
  }
  throw new Error(`Block not found: ${blockId}`)
}

/**
 * 完成率を取得する
 * @param {Line[]} lines
 */
export function getCompletionRate(lines) {
  // 既出の色を記録
  const seenColors = new Set()
  let okCount = 0
  let ngCount = 0

  for (const line of lines) {
    let prevColor = null

    for (const block of line.blocks) {
      // 色が変わったとき既出の色であればNG
      if (block.color === prevColor) {
        okCount++
      } else {
        if (seenColors.has(block.color)) ngCount++
        else seenColors.add(block.color)
      }

      prevColor = block.color
    }
  }

  if (okCount + ngCount === 0) return 1

  return okCount / (okCount + ngCount)
}
