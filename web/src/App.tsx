import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from './store/useStore'
import { useNuiEvent } from './lib/useNuiEvent'
import { fetchNui, isEnvBrowser } from './lib/fetchNui'
import { hexToRgbTriplet } from './lib/format'
import type { AuthorizePayload, TabId, ToastKind } from './types'

import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { Toasts } from './components/layout/Toasts'
import { Overlays } from './components/layout/Overlays'
import { ConfirmHost } from './components/ui/Modal'

import { Dashboard } from './components/tabs/Dashboard'
import { Players } from './components/tabs/Players'
import { PlayerDetail } from './components/tabs/PlayerDetail'
import { Self } from './components/tabs/Self'
import { Vehicle } from './components/tabs/Vehicle'
import { World } from './components/tabs/World'
import { Teleport } from './components/tabs/Teleport'
import { Bans } from './components/tabs/Bans'
import { Logs } from './components/tabs/Logs'
import { Developer } from './components/tabs/Developer'

const TABS: Record<TabId, () => JSX.Element> = {
  dashboard: Dashboard,
  players: Players,
  self: Self,
  vehicle: Vehicle,
  world: World,
  teleport: Teleport,
  bans: Bans,
  logs: Logs,
  developer: Developer,
}

export default function App() {
  const { open, activeTab, boot, close, pushToast, branding, players, selectedPlayerId, selectPlayer } = useStore()

  useNuiEvent<AuthorizePayload>('open', (p) => boot(p))
  useNuiEvent('close', () => close())
  useNuiEvent<{ message: string; type: ToastKind }>('notify', (d) => pushToast(d.message, d.type))

  useEffect(() => {
    if (isEnvBrowser()) {
      fetchNui<AuthorizePayload>('rpc', { name: 'authorize', data: {} }).then((res: any) => {
        if (res?.result?.allowed) boot(res.result)
      })
    }
  }, [boot])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', hexToRgbTriplet(branding.accent))
  }, [branding.accent])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && useStore.getState().open) {
        fetchNui('close')
        close()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const Active = TABS[activeTab] ?? Dashboard

  return (
    <div className="relative h-full w-full overflow-hidden font-sans">
      <Overlays />

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute inset-0 grid place-items-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-black/30" />

            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.985, y: 8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative flex h-[86vh] max-h-[860px] w-full max-w-[1180px] overflow-hidden rounded-2xl border border-line bg-ink-900/95 shadow-pop"
            >
              <Sidebar />

              <div className="relative flex min-w-0 flex-1 flex-col">
                <Header />
                <main className="relative flex-1 overflow-y-auto bg-grid-faint bg-grid p-6">
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-ink-900/40" />
                  <div className="relative" key={activeTab}>
                    <Active />
                  </div>
                </main>
              </div>

              <Toasts />

              <PlayerDetail
                player={players.find((p) => p.id === selectedPlayerId) ?? null}
                onClose={() => selectPlayer(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmHost />
    </div>
  )
}
