import { Search, X, ShieldCheck, Shield } from 'lucide-react'
import { fetchNui } from '../../lib/fetchNui'
import { useStore } from '../../store/useStore'
import { TAB_META } from '../../icons'
import { IconChip } from '../ui/primitives'

export function Header() {
  const { activeTab, self, branding, search, setSearch, close } = useStore()
  const meta = TAB_META[activeTab]

  const onClose = () => {
    fetchNui('close')
    close()
  }

  return (
    <header className="flex items-center gap-4 border-b border-line px-6 py-4">
      <IconChip icon={<meta.icon size={18} />} color={meta.color} size="lg" />
      <div className="min-w-0">
        <h2 className="text-lg font-semibold leading-tight text-white">{meta.label}</h2>
        <p className="truncate text-xs text-slate-400">{meta.desc}</p>
      </div>

      {activeTab === 'players' && (
        <div className="relative ml-4 hidden flex-1 md:block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, job or identifier…"
            className="field max-w-md pl-9"
          />
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        <span
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300"
          title="Connected to server"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Connected
        </span>
        {self && (
          <span
            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium"
            style={{
              color: self.color,
              borderColor: `color-mix(in srgb, ${self.color} 35%, transparent)`,
              background: `color-mix(in srgb, ${self.color} 12%, transparent)`,
            }}
          >
            <ShieldCheck size={13} />
            {self.label}
          </span>
        )}
        <button
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 transition hover:bg-rose-500/20 active:scale-95"
          title="Close (ESC)"
        >
          <X size={17} />
        </button>

        <div className="ml-1 flex items-center border-l border-line pl-3">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.title}
              className="h-9 w-9 rounded-xl border border-line object-cover"
              onError={(e) => ((e.currentTarget.style.display = 'none'))}
            />
          ) : (
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-accent/40 bg-accent/15 text-accent">
              <Shield size={18} strokeWidth={2.2} />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
