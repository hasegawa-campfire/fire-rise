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
}

interface Line {
  id: string
  blocks: Block[]
  size: number
}
