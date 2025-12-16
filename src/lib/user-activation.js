const isSupported = navigator.userActivation?.hasBeenActive === false

let hasBeenActiveState = false

export function hasBeenActive() {
  return isSupported ? navigator.userActivation.hasBeenActive : hasBeenActiveState
}

const userActivationEventTypes = [
  'keydown',
  'keyup',
  'keypress',
  'touchstart',
  'touchend',
  'touchcancel',
  'mousedown',
  'mouseup',
  'contextmenu',
  'click',
  'pointerdown',
  'pointerup',
  'pointercancel',
]

function handleUserActivationEvent() {
  hasBeenActiveState = true
  for (const type of userActivationEventTypes) {
    removeEventListener(type, handleUserActivationEvent)
  }
}

for (const type of userActivationEventTypes) {
  addEventListener(type, handleUserActivationEvent, { once: true })
}

export const stickyActivation = new Promise((resolve) => {
  const check = () => {
    if (hasBeenActive()) {
      resolve(void 0)
    } else {
      requestAnimationFrame(check)
    }
  }
  check()
})
