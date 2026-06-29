import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

window.addEventListener('error', (e) => {
  if (!(window as any).invokeNative) return
  fetch(`https://${(window as any).GetParentResourceName?.() ?? 'bz-admin'}/error`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `${e.message} @ ${e.filename}:${e.lineno}` }),
  }).catch(() => undefined)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
