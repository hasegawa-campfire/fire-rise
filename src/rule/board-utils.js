import { mapEntries } from '@/lib/utils.js'
import { createRandom } from '@/lib/random.js'

export const random = createRandom()

/**
 * @template T
 * @param {T[]} array
 * @returns {T[]}
 */
export function shuffleArray(array) {
  const clonedArray = array.slice()
  return array.map(() => {
    const index = Math.floor(random.next() * clonedArray.length)
    return clonedArray.splice(index, 1)[0]
  })
}

/** @type {Record<string, string>} */
export const blockFillColors = {
  red: 'OrangeRed',
  blue: 'DeepSkyBlue',
  yellow: 'gold',
  green: 'limegreen',
  orange: 'orange',
  pink: 'HotPink',
  purple: 'Plum',
  gray: 'DarkGray',
}
export const blockColors = ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'pink', 'gray']
export const blockWidth = 1166
export const blockHeight = 1322
export const blockOverlap = 600
export const linePaddingSide = 200
export const linePaddingTop = 200
export const linePaddingBottom = 400
export const lineWidth = blockWidth + linePaddingSide * 2

/**
 * @param {number} blockCount
 */
export function calcBlocksHeight(blockCount) {
  return blockHeight * blockCount - blockOverlap * (blockCount - 1)
}

/**
 * @param {number} lineSize
 */
export function calcLineHeight(lineSize) {
  return calcBlocksHeight(lineSize) + linePaddingTop + linePaddingBottom
}

/**
 * @typedef {Object} GetMoveWeightContext
 * @property {Board} board
 * @property {Block} dstBlock
 * @property {Line} srcLine
 * @property {number} completionRate
 */

/**
 * @typedef {Object} GetPuzzleScoreContext
 * @property {Board} board
 */

/**
 * @typedef {Object} ShuffleResult
 * @property {Block} dstBlock
 * @property {Line} srcLine
 */

/**
 * @param {GetMoveWeightContext} context
 */
export function getDefaultMoveWeight(context) {
  const { board, dstBlock, srcLine, completionRate } = context
  let score = 0
  let color = ''

  const dstLine = board.lines[dstBlock.lineId]

  if (completionRate < 0.3) {
    return 20 - (dstBlock.index + srcLine.blockIds.length)
  } else {
    return dstBlock.index + srcLine.blockIds.length + 1
  }

  const dstScore = (dstBlock.index + 1) * completionRate + (dstLine.size - dstBlock.index) * (1 - completionRate)
  const srcScore =
    (srcLine.blockIds.length + 1) * completionRate + (srcLine.size - srcLine.blockIds.length) * (1 - completionRate)
  return dstScore + srcScore

  for (const blockId of board.lines[dstBlock.lineId].blockIds.slice(dstBlock.index)) {
    score++
    const block = board.blocks[blockId]
    if (block.color !== color) score += 3
    color = block.color
  }

  return score ** 3
}

/**
 * @param {GetPuzzleScoreContext} context
 */
export function getDefaultPuzzleScore(context) {
  const { board } = context

  let lineSpaces = Object.values(board.lines).map((line) => line.size - line.blockIds.length)
  const averageSpace = lineSpaces.reduce((acc, space) => acc + space, 0) / lineSpaces.length
  const spacePenalty = lineSpaces.reduce((acc, space) => acc + (space - averageSpace) ** 2, 0)

  return board.steps - spacePenalty
}

/**
 * ボードをクローンする
 * @param {Board} board
 * @return {Board}
 */
export function cloneBoard(board) {
  return {
    ...board,
    lines: mapEntries(board.lines, ([id, line]) => {
      return [id, { ...line, blockIds: line.blockIds.slice() }]
    }),
    blocks: mapEntries(board.blocks, ([id, block]) => {
      return [id, { ...block }]
    }),
  }
}

/**
 * @param {Board} board
 */
export function shuffleLines(board) {
  const lines = Object.values(board.lines)

  for (const size of new Set(lines.map((line) => line.size))) {
    const sameLineSizes = lines.filter((line) => line.size === size)

    const shuffled = shuffleArray(sameLineSizes.map((line) => ({ ...line })))

    for (const [index, { blockIds }] of shuffled.entries()) {
      sameLineSizes[index].blockIds = blockIds

      for (const blockId of blockIds) {
        board.blocks[blockId].lineId = sameLineSizes[index].id
      }
    }
  }

  return board
}

/**
 * @param {Board} board
 */
export function shuffleColors(board) {
  const usedColorSet = new Set()

  for (const block of Object.values(board.blocks)) {
    usedColorSet.add(block.color)
  }

  const usedColors = Array.from(usedColorSet)
  const shuffledColors = shuffleArray(usedColors)

  for (const block of Object.values(board.blocks)) {
    block.color = shuffledColors[usedColors.indexOf(block.color)]
  }

  return board
}

/**
 * @param {Board} board
 * @param {number} maxMoves
 * @param {number} trials
 * @param {(context: GetPuzzleScoreContext) => number} [getPuzzleScore]
 * @param {(context: GetMoveWeightContext) => number} [getMoveWeight]
 */
export function shuffleBlocks(board, maxMoves = 20, trials = 20, getPuzzleScore, getMoveWeight) {
  getPuzzleScore = getPuzzleScore ?? getDefaultPuzzleScore
  getMoveWeight = getMoveWeight ?? getDefaultMoveWeight

  const hasSeed = !Number.isNaN(board.seed)

  if (hasSeed) {
    random.seed = board.seed
    trials = 1
  }

  let bestScore = -Infinity
  let bestBoard = board
  let bestCompletionRate = Infinity

  for (let j = 0; j < trials; j++) {
    const clonedBoard = cloneBoard(board)

    if (!hasSeed) {
      clonedBoard.seed = random.seed
    }

    shuffleColors(clonedBoard)
    shuffleLines(clonedBoard)

    let completionRate = 1

    for (let i = 0; i < maxMoves; i++) {
      completionRate = getCompletionRate(clonedBoard)
      if (completionRate <= 0) break

      const result = _shuffleBlocks(clonedBoard, getMoveWeight, completionRate)
      if (!result) break

      clonedBoard.steps++
    }

    if (completionRate > bestCompletionRate) continue
    if (completionRate < bestCompletionRate) bestScore = -Infinity

    const score = getPuzzleScore({ board: clonedBoard })
    if (score > bestScore) {
      bestScore = score
      bestBoard = clonedBoard
      bestCompletionRate = completionRate
    }
  }

  return bestBoard
}

/**
 * @param {Board} board
 * @param {(context: GetMoveWeightContext) => number} getMoveWeight
 * @param {number} completionRate
 */
function _shuffleBlocks(board, getMoveWeight, completionRate) {
  let shuffleResult = /** @type {ShuffleResult | null} */ (null)
  let sumWeight = 0

  /**
   * 移動の候補に挙げる
   * @param {ShuffleResult} result
   */
  const nominateShuffle = (result) => {
    const weight = getMoveWeight({ ...result, board, completionRate })
    if (weight <= 0) return
    sumWeight += weight
    if (random.next() * sumWeight < weight) {
      shuffleResult = result
    }
  }

  // それぞれのブロックを移動先と仮定して、移動元として成り立つ場所を探す
  for (const dstBlock of Object.values(board.blocks)) {
    const dstLine = board.lines[dstBlock.lineId]

    // 空列への移動が禁止なら、移動先が最下段はありえない
    if (board.disableEmptyDrop && dstBlock.index === 0) continue

    // 移動先は、空の列か同色ブロックの上でなければならないので、下にブロックがあり、それが異色の場合は移動先としてありえない
    const dstPrevBlock = board.blocks[dstLine.blockIds[dstBlock.index - 1]]
    if (dstPrevBlock && dstPrevBlock.color !== dstBlock.color) continue

    // 移動してきたブロック塊サイズ (移動先ブロックから先全部)
    const dstBlockLength = dstLine.blockIds.length - dstBlock.index

    // 移動元として可能な列を捜査
    for (const srcLine of Object.values(board.lines)) {
      // 移動元と移動先が同じ列はありえない
      if (srcLine.id === dstLine.id) continue

      // 移動元に余白が足りない場合は除外する
      if (srcLine.size - srcLine.blockIds.length < dstBlockLength) continue

      // 同色の分割は出来ないので、移動元に残っているブロックは必ず異色でなければならない
      const srcLastBlock = board.blocks[srcLine.blockIds.at(-1) ?? '']
      if (srcLastBlock?.color === dstBlock.color) continue

      // 問題作成において、状況の変わらない、もしくはループの可能性がある移動は除外する
      // 具体的には、１列を丸ごと空列に移動する場合
      if (!srcLastBlock && !dstPrevBlock) continue

      nominateShuffle({ dstBlock, srcLine })
    }
  }

  // 移動元にブロックを移す
  if (shuffleResult) {
    const srcLine = shuffleResult.srcLine
    const movingBlockIds = board.lines[shuffleResult.dstBlock.lineId].blockIds.splice(shuffleResult.dstBlock.index)

    for (const [index, blockId] of movingBlockIds.entries()) {
      board.blocks[blockId].lineId = srcLine.id
      board.blocks[blockId].index = srcLine.blockIds.length + index
    }

    srcLine.blockIds.push(...movingBlockIds)
  }

  return shuffleResult
}

/**
 * 列から列へブロックを移動できるかどうかを判定する
 * @param {Board} board
 * @param {Line | string} dstLine
 * @param {Block | string} srcBlock
 */
export function isMovableBlock(board, dstLine, srcBlock) {
  dstLine = typeof dstLine === 'string' ? board.lines[dstLine] : dstLine
  srcBlock = typeof srcBlock === 'string' ? board.blocks[srcBlock] : srcBlock

  // 空列への移動が禁止の場合
  if (board.disableEmptyDrop && dstLine.blockIds.length === 0) return false

  // 同じ列は移動不可能
  const srcLine = board.lines[srcBlock.lineId]
  if (dstLine.id === srcLine.id) return false

  // 同色の分割は出来ない
  const srcPrevBlockId = srcBlock.index > 0 ? srcLine.blockIds[srcBlock.index - 1] : null
  const srcPrevBlock = srcPrevBlockId ? board.blocks[srcPrevBlockId] : null
  if (srcPrevBlock?.color === srcBlock.color) return false

  // 移動先に余白が足りない
  const srcBlockLength = srcLine.blockIds.length - srcBlock.index
  if (dstLine.size - dstLine.blockIds.length < srcBlockLength) return false

  // 列の末尾とブロックの先頭が同色なら移動可能 (移動先が空列なら色を問わない)
  const dstLastBlockId = dstLine.blockIds.at(-1)
  const dstLastBlock = dstLastBlockId ? board.blocks[dstLastBlockId] : null
  return !dstLastBlock || dstLastBlock.color === srcBlock.color
}

/**
 * 列から列へブロックを移動する
 * @param {Board} board
 * @param {Line | string} dstLine
 * @param {Block | string} srcBlock
 */
export function moveBlock(board, dstLine, srcBlock) {
  dstLine = typeof dstLine === 'string' ? board.lines[dstLine] : dstLine
  srcBlock = typeof srcBlock === 'string' ? board.blocks[srcBlock] : srcBlock

  const movingBlockIds = board.lines[srcBlock.lineId].blockIds.splice(srcBlock.index)

  for (const [index, blockId] of movingBlockIds.entries()) {
    board.blocks[blockId].lineId = dstLine.id
    board.blocks[blockId].index = dstLine.blockIds.length + index
  }

  dstLine.blockIds.push(...movingBlockIds)
}

/**
 * 手詰まりかどうかを判定する
 * @param {Board} board
 * @returns {boolean}
 */
export function isStuckState(board) {
  return getPossibleMoves(board).length === 0
}

/**
 * 移動可能な候補を列挙する
 * @param {Board} board
 * @returns {{srcBlock: Block, dstLine: Line}[]}
 */
export function getPossibleMoves(board) {
  /** @type {{srcBlock: Block, dstLine: Line}[]} */
  const moves = []
  for (const srcBlock of Object.values(board.blocks)) {
    for (const dstLine of Object.values(board.lines)) {
      if (isMovableBlock(board, dstLine, srcBlock)) {
        moves.push({ srcBlock, dstLine })
      }
    }
  }
  return moves
}

/**
 * ゴール状態かどうかを判定する
 * - 各色のブロックが全て連続している
 * - 同じ色が複数の列に散らばっていない
 * @param {Board} board
 * @returns {boolean}
 */
export function isGoalState(board) {
  // 既出の色を記録
  const seenColors = new Set()

  for (const line of Object.values(board.lines)) {
    let prevColor = null

    for (const blockId of line.blockIds) {
      // 色が変わったとき既出の色であればNG
      const block = board.blocks[blockId]
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
 * 完成率を取得する
 * @param {Board} board
 */
export function getCompletionRate(board) {
  // 既出の色を記録
  const seenColors = new Set()
  let okCount = 0
  let ngCount = 0

  for (const line of Object.values(board.lines)) {
    let prevColor = null

    for (const blockId of line.blockIds) {
      // 色が変わったとき既出の色であればNG
      const block = board.blocks[blockId]
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

/**
 * ブロックをラインに合わせて整合性を取る
 * @param {Board} board
 */
export function syncBlocks(board) {
  const blockMap = new Map(Object.entries(board.blocks))

  for (const line of Object.values(board.lines)) {
    for (const [index, blockId] of line.blockIds.entries()) {
      const block = blockMap.get(blockId)
      blockMap.delete(blockId)
      if (!block) throw Error(`Block not found: ${blockId}`)
      block.lineId = line.id
      block.index = index
    }
  }

  if (blockMap.size > 0) {
    throw Error(`Inconsistency in blocks: ${Array.from(blockMap.keys()).join(', ')}`)
  }

  return board
}
