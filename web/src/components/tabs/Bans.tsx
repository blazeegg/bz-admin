import { useEffect, useState } from 'react'
import { Gavel, Search, ShieldOff, Clock, User, RefreshCw, Plus } from 'lucide-react'
import { rpc } from '../../lib/fetchNui'
import { useStore } from '../../store/useStore'
import { useConfirm } from '../ui/Modal'
import { timeAgo } from '../../lib/format'
import { Card, SectionHeader, TabPanel, Badge, EmptyState, Spinner } from '../ui/primitives'
import { Button, Input, Select } from '../ui/controls'
import type { Ban } from '../../types'

const DURATIONS = [
  { value: '2h', label: '2 Hours' }, { value: '1d', label: '1 Day' },
  { value: '1w', label: '1 Week' }, { value: '1mo', label: '1 Month' },
  { value: 'perma', label: 'Permanent' },
]

export function Bans() {
  const { can, pushToast } = useStore()
  const ask = useConfirm((s) => s.ask)
  const [bans, setBans] = useState<Ban[] | null>(null)
  const [query, setQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ identifier: '', name: '', reason: '', duration: 'perma' })

  const load = () => rpc<{ bans: Ban[] }>('ban.list').then((r) => setBans(r.bans)).catch(() => setBans([]))
  useEffect(() => { load() }, [])

  const revoke = async (ban: Ban) => {
    const yes = await ask({
      title: 'Revoke ban?', danger: true, icon: <ShieldOff size={16} />, confirmLabel: 'Revoke',
      message: `This will lift the ban on ${ban.name} (#${ban.id}). They will be able to reconnect.`,
    })
    if (!yes) return
    try {
      await rpc('ban.revoke', { id: ban.id })
      pushToast(`Ban #${ban.id} revoked.`, 'success')
      load()
    } catch {
      pushToast('Failed to revoke ban.', 'error')
    }
  }

  const createOffline = async () => {
    if (!form.identifier.trim()) return pushToast('Enter an identifier.', 'error')
    try {
      await rpc('ban.createOffline', form)
      pushToast('Offline ban created.', 'success')
      setForm({ identifier: '', name: '', reason: '', duration: 'perma' })
      setShowForm(false)
      load()
    } catch {
      pushToast('Failed to create ban.', 'error')
    }
  }

  const filtered = (bans ?? []).filter(
    (b) => b.name?.toLowerCase().includes(query.toLowerCase()) ||
      b.id.toLowerCase().includes(query.toLowerCase()) ||
      b.reason?.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <TabPanel>
      <Card>
        <SectionHeader icon={<Gavel size={16} />} color="#f43f5e" title="Ban Management"
          subtitle={`${(bans ?? []).filter((b) => b.active).length} active bans`}
          right={
            <div className="flex gap-2">
              <Button size="sm" icon={<RefreshCw size={13} />} onClick={load}>Refresh</Button>
              {can('bans.create') && (
                <Button size="sm" variant="primary" icon={<Plus size={13} />} onClick={() => setShowForm((v) => !v)}>Offline Ban</Button>
              )}
            </div>
          }
        />

        {showForm && can('bans.create') && (
          <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.04] p-4 sm:grid-cols-2">
            <Input label="Identifier" placeholder="license:xxxx / discord:xxxx" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} />
            <Input label="Name (optional)" placeholder="Player name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Reason" placeholder="Reason for ban" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            <Select label="Duration" value={form.duration} onChange={(v) => setForm({ ...form, duration: v })} options={DURATIONS} />
            <div className="sm:col-span-2">
              <Button variant="danger" full icon={<Gavel size={14} />} onClick={createOffline}>Create Ban</Button>
            </div>
          </div>
        )}

        <div className="relative mt-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="field pl-9" placeholder="Search bans by name, ID or reason…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className="mt-4 space-y-2">
          {bans === null ? (
            <div className="flex justify-center py-10"><Spinner className="h-6 w-6" /></div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<Gavel size={22} />} title="No bans found" hint="Your ban list is clean." />
          ) : (
            filtered.map((ban) => (
              <div key={ban.id} className={`flex items-center gap-3 rounded-xl border p-3.5 ${ban.active ? 'border-white/[0.06] bg-white/[0.015]' : 'border-white/[0.04] bg-white/[0.01] opacity-60'}`}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${ban.active ? 'bg-rose-500/15 text-rose-300' : 'bg-white/5 text-slate-500'}`}>
                  <Gavel size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-white">{ban.name || 'Unknown'}</span>
                    <Badge color="#64748b">#{ban.id}</Badge>
                    {!ban.active && <Badge color="#475569">Revoked</Badge>}
                  </div>
                  <p className="truncate text-xs text-slate-400">{ban.reason}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1"><User size={10} /> {ban.admin}</span>
                    <span className="inline-flex items-center gap-1"><Clock size={10} /> {timeAgo(ban.created)}</span>
                    <span className="inline-flex items-center gap-1">Expires: {ban.expiresLabel}</span>
                  </div>
                </div>
                {ban.active && can('bans.revoke') && (
                  <Button size="sm" variant="ghost" icon={<ShieldOff size={13} />} onClick={() => revoke(ban)}>Revoke</Button>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </TabPanel>
  )
}
