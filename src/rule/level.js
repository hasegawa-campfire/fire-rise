import { generateId, shuffleArray } from '@/lib/utils.js'
import { shuffleBlocks } from './block-utils.js'

export const levels = [
  {
    id: 'tutorial1',
    name: '始め',
    isLocked: () => false,
    createLines: () => createLines(3),
  },
  {
    id: 'tutorial2',
    name: '始め＋',
    isLocked: () => false,
    createLines: () => createLines(4),
  },
]

/**
 * @param {number} lineSize
 */
function createLines(lineSize) {
  /** @type {Line[]} */
  const lines = ['crimson', 'forestgreen', 'gold', []].map((color) => {
    const colors = Array.isArray(color) ? color : [color]
    let blocks = /** @type {Block[]} */ ([])
    if (colors.length > 0) {
      blocks = Array.from({ length: lineSize }, (_, i) => {
        const color = colors[(colors.length * (i / lineSize)) | 0]
        return { id: generateId(), color }
      })
    }
    return { id: generateId(), blocks, size: lineSize }
  })

  return shuffleArray(shuffleBlocks(lines, 10))
}
