/**
 * @param {ViewTransitionUpdateCallback} fn
 * @returns {{finished: Promise<void>}}
 */
export function startViewTransition(fn) {
  if (document.startViewTransition) {
    return document.startViewTransition(fn)
  } else {
    return { finished: Promise.resolve(fn()) }
  }
}
