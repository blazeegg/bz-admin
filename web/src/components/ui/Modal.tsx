import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { create } from 'zustand'
import type { ReactNode } from 'react'
import { Button } from './controls'
import { IconChip } from './primitives'

export function Modal({
  open,
  onClose,
  children,
  title,
  icon,
  color,
  width = 'max-w-lg',
}: {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  icon?: ReactNode
  color?: string
  width?: string
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-50 grid place-items-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/55" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className={`surface relative z-10 w-full ${width} overflow-hidden shadow-pop`}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div className="flex items-center gap-3">
                  {icon && <IconChip icon={icon} color={color} size="sm" />}
                  <h3 className="text-[15px] font-semibold text-white">{title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface ConfirmOptions {
  title: string
  message: ReactNode
  confirmLabel?: string
  danger?: boolean
  icon?: ReactNode
}
interface ConfirmState {
  options: ConfirmOptions | null
  resolve?: (v: boolean) => void
  ask: (o: ConfirmOptions) => Promise<boolean>
  settle: (v: boolean) => void
}
export const useConfirm = create<ConfirmState>((set, get) => ({
  options: null,
  ask: (options) =>
    new Promise<boolean>((resolve) => set({ options, resolve })),
  settle: (v) => {
    get().resolve?.(v)
    set({ options: null, resolve: undefined })
  },
}))

export function ConfirmHost() {
  const { options, settle } = useConfirm()
  return (
    <Modal open={!!options} onClose={() => settle(false)} title={options?.title} icon={options?.icon}
      color={options?.danger ? '#f43f5e' : '#4f8cff'} width="max-w-md">
      <div className="text-sm leading-relaxed text-slate-300">{options?.message}</div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => settle(false)}>
          Cancel
        </Button>
        <Button variant={options?.danger ? 'danger' : 'primary'} onClick={() => settle(true)}>
          {options?.confirmLabel ?? 'Confirm'}
        </Button>
      </div>
    </Modal>
  )
}
