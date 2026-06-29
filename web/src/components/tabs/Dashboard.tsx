import { useEffect, useState } from 'react'
import {
  Users, ShieldCheck, Gavel, Clock, Server, Activity, Zap, Megaphone,
} from 'lucide-react'
import { rpc } from '../../lib/fetchNui'
import { useStore } from '../../store/useStore'
import { uptime } from '../../lib/format'
import { Card, Stat, SectionHeader, TabPanel, Badge } from '../ui/primitives'
import { Button, Input } from '../ui/controls'
import type { DashboardData } from '../../types'

export function Dashboard() {
  const { self, pushToast, setTab, can } = useStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    rpc<DashboardData>('getDashboard').then(setData).catch(() => undefined)
    const t = setInterval(() => rpc<DashboardData>('getDashboard').then(setData).catch(() => undefined), 5000)
    return () => clearInterval(t)
  }, [])

  const quickAnnounce = async () => {
    if (!announcement.trim()) return
    try {
      await rpc('world.announce', { message: announcement })
      setAnnouncement('')
      pushToast('Announcement broadcast to all players.', 'success')
    } catch {
      pushToast('Failed to send announcement.', 'error')
    }
  }

  return (
    <TabPanel>
      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid opacity-40" />
        <div className="relative flex items-end justify-between">
          <div>
            <p className="text-sm text-slate-400">Welcome back,</p>
            <h2 className="mt-0.5 font-display text-2xl font-bold text-white">
              {self?.label} <span className="text-slate-500">·</span>{' '}
              <span className="accent-gradient">{data?.serverName ?? 'Server'}</span>
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Connected to server · {data ? uptime(data.uptime) : '—'} uptime
            </p>
          </div>
          <Badge color="#34d399" dot>
            Online
          </Badge>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Players Online" value={data ? `${data.online}/${data.max}` : '—'} icon={<Users size={18} />} color="#4f8cff" />
        <Stat label="Staff On Duty" value={data?.staff ?? '—'} icon={<ShieldCheck size={18} />} color="#a855f7" />
        <Stat label="Active Bans" value={data?.activeBans ?? '—'} icon={<Gavel size={18} />} color="#f43f5e" />
        <Stat label="Server Uptime" value={data ? uptime(data.uptime) : '—'} icon={<Clock size={18} />} color="#34d399" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader icon={<Zap size={16} />} color="#f59e0b" title="Quick Actions"
            subtitle="Jump straight to common tasks" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <QuickAction icon={<Users size={16} />} label="Players" hint="Manage online" onClick={() => setTab('players')} />
            <QuickAction icon={<Activity size={16} />} label="Self" hint="Noclip · godmode" onClick={() => setTab('self')} />
            <QuickAction icon={<Server size={16} />} label="World" hint="Weather · time" onClick={() => setTab('world')} />
            <QuickAction icon={<Gavel size={16} />} label="Bans" hint="Review list" onClick={() => setTab('bans')} disabled={!can('bans.view')} />
            <QuickAction icon={<Clock size={16} />} label="Logs" hint="Recent activity" onClick={() => setTab('logs')} disabled={!can('logs.view')} />
            <QuickAction icon={<Megaphone size={16} />} label="Teleport" hint="Move around" onClick={() => setTab('teleport')} />
          </div>
        </Card>

        <Card>
          <SectionHeader icon={<Megaphone size={16} />} color="#4f8cff" title="Announce" subtitle="Broadcast to everyone" />
          <div className="mt-4 space-y-3">
            <Input
              placeholder="Type a server-wide message…"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && quickAnnounce()}
              disabled={!can('world.announce')}
            />
            <Button variant="primary" full icon={<Megaphone size={15} />} onClick={quickAnnounce}
              disabled={!can('world.announce') || !announcement.trim()}>
              Broadcast
            </Button>
          </div>
        </Card>
      </div>
    </TabPanel>
  )
}

function QuickAction({
  icon, label, hint, onClick, disabled,
}: { icon: React.ReactNode; label: string; hint: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3.5 text-left transition hover:border-white/15 hover:bg-white/[0.04] disabled:pointer-events-none disabled:opacity-40"
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-slate-300 transition group-hover:bg-accent/15 group-hover:text-accent">
        {icon}
      </span>
      <div>
        <div className="text-sm font-medium text-slate-200">{label}</div>
        <div className="text-[11px] text-slate-500">{hint}</div>
      </div>
    </button>
  )
}
