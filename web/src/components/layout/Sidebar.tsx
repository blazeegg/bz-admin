import clsx from 'clsx'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { TAB_META } from '../../icons'
import type { TabId } from '../../types'

export function Sidebar() {
  const { tabs, activeTab, setTab, branding, can } = useStore()

  const TAB_PERMS: Record<string, string[]> = {
    dashboard: ['menu.open'],
    players: ['players.view'],
    self: ['self.noclip', 'self.godmode', 'self.invisible', 'self.heal', 'self.armor'],
    vehicle: ['vehicle.spawn', 'vehicle.repair', 'vehicle.delete', 'vehicle.upgrade'],
    world: ['world.weather', 'world.time', 'world.announce', 'world.blackout', 'world.cleararea'],
    teleport: ['teleport.waypoint', 'teleport.coords', 'teleport.saved', 'teleport.back'],
    bans: ['bans.view'],
    logs: ['logs.view'],
    developer: ['dev.console', 'dev.coords', 'dev.entity'],
  }

  const visible = tabs.filter((t) => {
    const perms = TAB_PERMS[t.id]
    return !perms || perms.some((p) => can(p))
  })

  return (
    <aside className="flex w-[230px] shrink-0 flex-col border-r border-line bg-ink-900/60">
      <div className="flex items-center gap-3 px-5 py-5">
        {branding.icon ? (
          <img
            src={branding.icon}
            alt=""
            className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-glow"
          />
        ) : (
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-accent/40 bg-accent/15 text-accent shadow-glow">
            <Shield size={20} strokeWidth={2.2} />
          </div>
        )}
        <div className="leading-tight">
          <div className="font-display text-[15px] font-bold tracking-wide text-white">
            {branding.title}
          </div>
          {branding.tag && (
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{branding.tag}</div>
          )}
        </div>
      </div>

      <div className="mx-5 mb-2 hatch h-px opacity-60" />

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {visible.map((t) => {
          const meta = TAB_META[t.id as TabId]
          const Icon = meta.icon
          const active = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as TabId)}
              className={clsx(
                'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                active ? 'text-white' : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200',
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl border border-white/[0.08] bg-white/[0.04]"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <span
                className="relative z-10 grid h-7 w-7 place-items-center rounded-lg transition"
                style={
                  active
                    ? { color: meta.color, background: `color-mix(in srgb, ${meta.color} 18%, transparent)` }
                    : { color: 'inherit' }
                }
              >
                <Icon size={16} strokeWidth={2.1} />
              </span>
              <span className="relative z-10 font-medium">{meta.label}</span>
              {active && (
                <span
                  className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full"
                  style={{ background: meta.color }}
                />
              )}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-line px-5 py-3 text-[10px] text-slate-600">
        bz-admin · v1.0.0
      </div>
    </aside>
  )
}
