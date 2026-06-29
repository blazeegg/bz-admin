import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info, AlertTriangle, Bell } from 'lucide-react'
import { useStore } from '../../store/useStore'
import type { ToastKind } from '../../types'

const KIND: Record<ToastKind, { icon: any; color: string }> = {
  success: { icon: CheckCircle2, color: '#34d399' },
  error: { icon: XCircle, color: '#f43f5e' },
  warning: { icon: AlertTriangle, color: '#f59e0b' },
  info: { icon: Info, color: '#4f8cff' },
  inform: { icon: Bell, color: '#38bdf8' },
}

export function Toasts() {
  const { toasts, dismissToast } = useStore()
  return (
    <div className="pointer-events-none absolute left-1/2 top-4 z-[60] flex w-80 -translate-x-1/2 flex-col items-center gap-2">
      <AnimatePresence>
        {toasts.map((t) => {
          const k = KIND[t.type] ?? KIND.info
          const Icon = k.icon
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              onClick={() => dismissToast(t.id)}
              className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-line bg-ink-800 p-3.5 shadow-pop"
            >
              <span
                className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                style={{ color: k.color, background: `color-mix(in srgb, ${k.color} 16%, transparent)` }}
              >
                <Icon size={15} />
              </span>
              <p className="text-sm leading-snug text-slate-200">{t.message}</p>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
