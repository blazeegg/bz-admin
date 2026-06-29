import clsx from 'clsx'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function IconChip({
  icon,
  color = '#4f8cff',
  size = 'md',
}: {
  icon: ReactNode
  color?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const dim = size === 'lg' ? 'h-11 w-11' : size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
  return (
    <span
      className={clsx('grid shrink-0 place-items-center rounded-xl border', dim)}
      style={{
        color,
        background: `color-mix(in srgb, ${color} 16%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      {icon}
    </span>
  )
}

export function SectionHeader({
  icon,
  color,
  title,
  subtitle,
  right,
}: {
  icon: ReactNode
  color?: string
  title: string
  subtitle?: string
  right?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <IconChip icon={icon} color={color} />
        <div>
          <h3 className="text-[15px] font-semibold leading-tight text-white">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  )
}

export function Card({
  children,
  className,
  pad = true,
}: {
  children: ReactNode
  className?: string
  pad?: boolean
}) {
  return <div className={clsx('surface', pad && 'p-5', className)}>{children}</div>
}

export function Badge({
  children,
  color,
  dot,
}: {
  children: ReactNode
  color?: string
  dot?: boolean
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium"
      style={{
        color: color ?? '#94a3b8',
        background: color ? `color-mix(in srgb, ${color} 14%, transparent)` : 'rgb(255 255 255 / 0.05)',
      }}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: color ?? '#94a3b8' }} />}
      {children}
    </span>
  )
}

export function Stat({
  label,
  value,
  icon,
  color = '#4f8cff',
  hint,
}: {
  label: string
  value: ReactNode
  icon: ReactNode
  color?: string
  hint?: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <IconChip icon={icon} color={color} />
        {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-tight text-white">{value}</div>
      <div className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-500">{label}</div>
    </Card>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-accent',
        className,
      )}
    />
  )
}

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: ReactNode
  title: string
  hint?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.06] bg-white/[0.02] text-slate-500">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-300">{title}</p>
        {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      </div>
    </div>
  )
}

export function TabPanel({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-5"
    >
      {children}
    </motion.div>
  )
}
