import { motion } from 'framer-motion'
import clsx from 'clsx'
import { Check } from 'lucide-react'
import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative inline-flex h-[26px] w-[46px] shrink-0 items-center rounded-full border transition-colors duration-200',
        checked ? 'border-accent/40 bg-accent/80' : 'border-white/10 bg-white/[0.06]',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 34 }}
        className={clsx(
          'mx-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-md',
          checked && 'ml-auto mr-[3px]',
        )}
      />
    </button>
  )
}

export function CheckRow({
  label,
  checked,
  onChange,
  hint,
  right,
}: {
  label: string
  checked: boolean
  onChange: () => void
  hint?: string
  right?: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={clsx(
        'group flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition',
        checked
          ? 'border-accent/30 bg-accent/[0.08]'
          : 'border-white/[0.06] bg-white/[0.015] hover:border-white/15 hover:bg-white/[0.04]',
      )}
    >
      <div className="min-w-0">
        <div className={clsx('truncate text-sm', checked ? 'text-white' : 'text-slate-300')}>{label}</div>
        {hint && <div className="truncate text-[11px] text-slate-500">{hint}</div>}
      </div>
      {right ?? (
        <span
          className={clsx(
            'grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border transition',
            checked ? 'border-accent bg-accent text-white' : 'border-white/15 bg-white/[0.03] text-transparent',
          )}
        >
          <Check size={13} strokeWidth={3} />
        </span>
      )}
    </button>
  )
}

type ButtonVariant = 'primary' | 'danger' | 'ghost' | 'subtle' | 'success'
export function Button({
  children,
  onClick,
  variant = 'subtle',
  icon,
  disabled,
  className,
  full,
  size = 'md',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: ButtonVariant
  icon?: ReactNode
  disabled?: boolean
  className?: string
  full?: boolean
  size?: 'sm' | 'md'
}) {
  const variants: Record<ButtonVariant, string> = {
    primary: 'border-accent/40 bg-accent/15 text-accent hover:bg-accent/25 hover:border-accent/60',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20',
    danger: 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/50',
    ghost: 'border-transparent bg-transparent text-slate-300 hover:bg-white/5',
    subtle: 'border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.07] hover:border-white/20',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl border font-medium transition active:scale-[0.98]',
        size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm',
        variants[variant],
        full && 'w-full',
        disabled && 'pointer-events-none opacity-40',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}

export function Input({
  label,
  className,
  ...props
}: { label?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      {label && <span className="label">{label}</span>}
      <input className={clsx('field', className)} {...props} />
    </label>
  )
}

export function Textarea({
  label,
  className,
  ...props
}: { label?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      {label && <span className="label">{label}</span>}
      <textarea className={clsx('field resize-none', className)} rows={3} {...props} />
    </label>
  )
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="block">
      {label && <span className="label">{label}</span>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="field cursor-pointer appearance-none pr-9"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-ink-850 text-slate-100">
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </label>
  )
}

export function Segmented({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-ink-900/60 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={clsx(
            'relative rounded-lg px-3 py-1.5 text-xs font-medium transition',
            value === o.value ? 'text-white' : 'text-slate-400 hover:text-slate-200',
          )}
        >
          {value === o.value && (
            <motion.span
              layoutId="seg"
              className="absolute inset-0 rounded-lg border border-accent/40 bg-accent/15"
              transition={{ type: 'spring', stiffness: 500, damping: 36 }}
            />
          )}
          <span className="relative z-10">{o.label}</span>
        </button>
      ))}
    </div>
  )
}
