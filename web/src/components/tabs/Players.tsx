import { useEffect, useMemo } from 'react'
import { RefreshCw, Users, Wifi, Briefcase } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { avatar, money, pingColor } from '../../lib/format'
import { Card, SectionHeader, TabPanel, Badge, EmptyState, Spinner } from '../ui/primitives'
import { Button } from '../ui/controls'
import type { Player } from '../../types'

export function Players() {
  const { players, refreshPlayers, search, selectPlayer } = useStore()

  useEffect(() => {
    refreshPlayers()
    const t = setInterval(refreshPlayers, 8000)
    return () => clearInterval(t)
  }, [refreshPlayers])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return players
    return players.filter((p) => {
      const ids = Object.values(p.identifiers ?? {}).join(' ').toLowerCase()
      return (
        p.name.toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        (p.cid ?? '').toLowerCase().includes(q) ||
        (p.job?.label ?? '').toLowerCase().includes(q) ||
        ids.includes(q)
      )
    })
  }, [players, search])

  return (
    <TabPanel>
      <Card>
        <SectionHeader
          icon={<Users size={16} />}
          color="#38bdf8"
          title="Connected Players"
          subtitle={`${filtered.length} shown · ${players.length} online`}
          right={
            <Button size="sm" icon={<RefreshCw size={13} />} onClick={refreshPlayers}>
              Refresh
            </Button>
          }
        />

        <div className="mt-4">
          {players.length === 0 ? (
            <div className="flex justify-center py-10">
              <Spinner className="h-6 w-6" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={<Users size={22} />} title="No players match your search" hint="Try a different name or ID." />
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <PlayerCard key={p.id} player={p} onClick={() => selectPlayer(p.id)} />
              ))}
            </div>
          )}
        </div>
      </Card>
    </TabPanel>
  )
}

function PlayerCard({ player, onClick }: { player: Player; onClick: () => void }) {
  const av = avatar(player.name)
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 text-left transition hover:border-accent/30 hover:bg-accent/[0.05]"
    >
      <div className="relative">
        <div className="grid h-11 w-11 place-items-center rounded-xl text-sm font-semibold text-white/90" style={av.style}>
          {av.initials}
        </div>
        <span
          className="absolute -bottom-1 -right-1 grid h-5 min-w-[20px] place-items-center rounded-md border border-ink-850 bg-ink-700 px-1 text-[10px] font-bold text-slate-300"
          title="Server ID"
        >
          {player.id}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-white">{player.name}</span>
          {player.role && (
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: player.role.color }} title={player.role.label} />
          )}
        </div>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Briefcase size={11} />
            {player.job?.label ?? 'Civilian'}
          </span>
          <span className={`inline-flex items-center gap-1 ${pingColor(player.ping)}`}>
            <Wifi size={11} />
            {player.ping ?? '—'}ms
          </span>
        </div>
      </div>

      {player.money?.bank != null && (
        <Badge color="#34d399">{money(player.money.bank)}</Badge>
      )}
    </button>
  )
}
