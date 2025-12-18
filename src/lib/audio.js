import { stickyActivation } from '@/lib/user-activation.js'

const masterPromise = stickyActivation.then(async () => {
  const ctx = new AudioContext()
  ctx.resume() // 待たない

  // ios chrome用のおまじない。
  await new Promise((resolve) => setTimeout(resolve, 100))

  const masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(0, 0)
  masterGain.connect(ctx.destination)

  /** @type {Map<string, GainNode>} */
  const categoryGains = new Map()

  /**
   * @param {string} category
   */
  const getCategoryGain = (category) => {
    let gain = categoryGains.get(category)
    if (!gain) {
      gain = ctx.createGain()
      gain.connect(masterGain)
      categoryGains.set(category, gain)
    }
    return gain
  }

  return { ctx, masterGain, categoryGains, getCategoryGain }
})

/**
 * @param {number} value
 */
export function setMasterVolume(value) {
  masterPromise.then(({ ctx, masterGain }) => {
    masterGain.gain.linearRampToValueAtTime(value, ctx.currentTime + 0.05)
  })
}

/**
 * @param {string} category
 * @param {number} value
 */
export function setCategoryVolume(category, value) {
  masterPromise.then(({ ctx, getCategoryGain }) => {
    getCategoryGain(category).gain.linearRampToValueAtTime(value, ctx.currentTime + 0.05)
  })
}

/**
 * @typedef {Object} AudioParams
 * @property {string} [category]
 * @property {number} [volume]
 * @property {number} [minTime]
 * @property {number} [delay]
 * @property {boolean | { start?: number, end?: number }} [loop]
 */

export class Audio {
  #baseVolume
  #volume = 1
  #minTime
  #delay
  #loop
  #mute = false
  #startTime = Number.MIN_SAFE_INTEGER
  #audioBufferPromise
  #gainNodePromise
  #audioSource = /** @type {AudioBufferSourceNode | null} */ (null)
  #playing = false

  /**
   * @param {ArrayBuffer | Promise<ArrayBuffer>} arrayBuffer
   * @param {AudioParams} [param]
   */
  constructor(arrayBuffer, param) {
    param = param ?? {}
    const category = param.category ?? 'default'
    this.#baseVolume = param.volume ?? 1
    this.#minTime = param.minTime ?? 0
    this.#delay = param.delay ?? 0
    this.#loop = param.loop ?? false

    this.#audioBufferPromise = masterPromise.then(async (master) => {
      const audioBuffer = await arrayBuffer
      return master.ctx.decodeAudioData(audioBuffer)
    })

    this.#gainNodePromise = masterPromise.then(async (master) => {
      const categoryGain = master.getCategoryGain(category)
      const gainNode = master.ctx.createGain()
      gainNode.gain.value = 0
      gainNode.connect(categoryGain)
      return gainNode
    })
  }

  get playing() {
    return this.#playing
  }

  async play(delay = 0, volume = 1) {
    this.#playing = true
    const playTime = Date.now()

    const { ctx } = await masterPromise
    const audioBuffer = await this.#audioBufferPromise
    const gainNode = await this.#gainNodePromise

    if (!this.#playing) return

    const lagTime = (Date.now() - playTime) / 1000
    delay = delay + this.#delay - (lagTime < 0.05 ? 0 : lagTime)

    const startTime = ctx.currentTime + delay
    if (startTime - this.#startTime < this.#minTime) return

    const audioSource = ctx.createBufferSource()

    this.#audioSource?.stop(Math.max(startTime, 0))
    this.#audioSource = audioSource
    this.#startTime = startTime

    if (typeof this.#loop === 'boolean') {
      audioSource.loop = this.#loop
    } else {
      audioSource.loop = true
      audioSource.loopStart = this.#loop.start ?? 0
      audioSource.loopEnd = this.#loop.end ?? audioBuffer.duration
    }

    audioSource.buffer = audioBuffer
    audioSource.connect(gainNode)

    this.#volume = volume

    if (delay < 0) {
      audioSource.start(Math.max(startTime, 0), -delay)
      gainNode.gain.linearRampToValueAtTime(this.#getVolume(), ctx.currentTime + 0.05)
    } else {
      audioSource.start(startTime)
      gainNode.gain.setValueAtTime(this.#getVolume(), startTime)
    }
  }

  async stop(delay = 0) {
    const { ctx } = await masterPromise

    this.#playing = false
    this.#audioSource?.stop(ctx.currentTime + delay)
    this.#audioSource = null
  }

  /**
   * @param {boolean} value
   */
  setMute(value) {
    this.#mute = value
    this.#updateVolume()
  }

  /**
   * @param {number} value
   * @param {number} [time]
   */
  setVolume(value, time = 0) {
    this.#volume = value
    this.#updateVolume(time)
  }

  async #updateVolume(time = 0) {
    const { ctx } = await masterPromise
    const gainNode = await this.#gainNodePromise

    gainNode.gain.cancelScheduledValues(ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.#getVolume(), ctx.currentTime + time)
  }

  #getVolume() {
    return this.#mute ? 0 : this.#volume * this.#baseVolume
  }
}
