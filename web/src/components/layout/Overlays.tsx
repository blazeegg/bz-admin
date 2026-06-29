import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Megaphone, MessageSquare, AlertTriangle } from 'lucide-react'
import { useNuiEvent } from '../../lib/useNuiEvent'

export function Overlays() {
  const [announce, setAnnounce] = useState<{ title: string; message: string } | null>(null)
  const [dm, setDm] = useState<{ from: string; message: string } | null>(null)
  const [warn, setWarn] = useState<{ admin: string; reason: string } | null>(null)

  useNuiEvent<{ title: string; message: string }>('announce', (d) => {
    setAnnounce(d)
    setTimeout(() => setAnnounce(null), 8000)
  })
  useNuiEvent<{ from: string; message: string }>('dm', (d) => {
    setDm(d)
    setTimeout(() => setDm(null), 9000)
  })
  useNuiEvent<{ admin: string; reason: string }>('warn', (d) => setWarn(d))

  const item = {
    initial: { opacity: 0, y: -24, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -24, scale: 0.96 },
    transition: { type: 'spring' as const, stiffness: 380, damping: 30 },
  }

  return (
    <div className="pointer-events-none absolute left-1/2 top-6 z-[70] flex w-[460px] max-w-[92vw] -translate-x-1/2 flex-col items-stretch gap-2.5">
      <AnimatePresence>
        {announce && (
          <motion.div key="announce" {...item} className="surface flex items-start gap-3 p-4 shadow-pop">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/15 text-accent">
              <Megaphone size={18} />
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-accent">{announce.title}</div>
              <p className="mt-0.5 text-sm text-slate-200">{announce.message}</p>
            </div>
          </motion.div>
        )}

        {dm && (
          <motion.div key="dm" {...item} className="surface flex items-start gap-3 p-4 shadow-pop">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-sky-500/30 bg-sky-500/15 text-sky-300">
              <MessageSquare size={16} />
            </span>
            <div>
              <div className="text-xs font-semibold text-sky-300">{dm.from} · Staff</div>
              <p className="mt-0.5 text-sm text-slate-200">{dm.message}</p>
            </div>
          </motion.div>
        )}

        {warn && (
          <motion.div key="warn" {...item} className="surface pointer-events-auto overflow-hidden p-4 shadow-pop">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-amber-500/30 bg-amber-500/15 text-amber-300">
                <AlertTriangle size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white">You received a warning</div>
                <div className="text-[11px] text-slate-400">Issued by {warn.admin}</div>
                <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-sm text-amber-100">
                  {warn.reason}
                </div>
              </div>
            </div>
            <button
              onClick={() => setWarn(null)}
              className="mt-3 w-full rounded-lg border border-amber-500/40 bg-amber-500/15 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/25"
            >
              I understand
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
