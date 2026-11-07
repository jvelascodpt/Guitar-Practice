/**
 * When a new app version takes over, the page reloads itself into it. That
 * reload isn't the user opening the app, so the intro shouldn't play again.
 * We mark it here and App checks the mark once at startup.
 */
const KEY = 'gy.updateReload'

/** Call once at startup, before the service worker registers. */
export function watchForUpdateReload() {
  const sw = navigator.serviceWorker
  if (!sw) return
  // A first-ever install also changes controller, but doesn't reload; only an
  // update (there was already a controller) triggers the reload.
  const hadController = !!sw.controller
  sw.addEventListener('controllerchange', () => {
    if (!hadController) return
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* storage unavailable */
    }
  })
}

/** True (once) if this page load is an automatic update reload. */
export function consumeUpdateReload(): boolean {
  try {
    const hit = sessionStorage.getItem(KEY) === '1'
    sessionStorage.removeItem(KEY)
    return hit
  } catch {
    return false
  }
}
