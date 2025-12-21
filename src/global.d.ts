interface ImportMeta {
  document: Document
}

interface Window {
  LanguageModel?: typeof LanguageModel
}

interface ReadableStream<R> {
  [Symbol.asyncIterator](): AsyncIterableIterator<R>
}

type SingleOrArray<T> = T | T[]

type PartialRequired<T, K extends keyof T> = Required<Pick<T, K>> & Partial<Omit<T, K>>

type IsUnion<T, U = T> = (T extends any ? (U extends T ? false : true) : never) extends false ? false : true

type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : K]: T[K]
}

interface Block {
  id: string
  color: string
  lineId: string
  index: number
}

interface Line {
  id: string
  blockIds: string[]
  size: number
  x: number
  y: number
  even: boolean
}

interface Board {
  levelId: string
  seed: number
  disableEmptyDrop: boolean
  steps: number
  lines: Record<string, Line>
  blocks: Record<string, Block>
}

interface Level {
  id: string
  displayId: string
  name: string
  helpPageId?: string
  silentHelpPageId?: string
  disableEmptyDrop?: boolean
  isVisible: () => boolean
  isUnlocked: () => boolean
  createBoard: (seed: number | null) => Board
}

interface LevelStats {
  wins: number
  streak: number
  highestStreak: number
}

declare const CACHE_PATTERNS: string[]
declare const ASSET_FILES: [string, [number, number]][]
