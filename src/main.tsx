import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/metal-mania/latin-400.css'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'
import { watchForUpdateReload } from './state/updateReload'

watchForUpdateReload()

// Auto-update: check for a new version on launch and whenever the app comes
// back to the foreground; when one is installed the page reloads into it.
// (An in-progress practice timer survives the reload.)
registerSW({
  immediate: true,
  onRegisteredSW(_url, reg) {
    if (!reg) return
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void reg.update()
    })
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
