
/**
 * @param {string} url
 * @param {object} options
 * @param {string} [options.state]
 * @param {'auto' | 'push' | 'replace'} [options.history]
*/
export function navigate(url, options = {}) {
  if (options.history === 'replace') {
    history.replaceState(options.state ?? null, '', url)
  } else if (options.history === 'push') {
    history.pushState(options.state ?? null, '', url)
  } else {
    location.assign(url)
  }
}

/**
 * @param {() => void} callback
 */
export function onNavigate(callback) {
  addEventListener('popstate', () => {
    callback()
  })
}