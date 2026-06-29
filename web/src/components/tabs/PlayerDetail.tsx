import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  X, HeartPulse, Activity, Snowflake, Eye, MapPin, Move, Skull, AlertTriangle,
  LogOut, Gavel, MessageSquare, Briefcase, DollarSign, Fingerprint, StickyNote,
  ChevronRight, Send,
} from 'lucide-react'
import { rpc, clientAction } from '../../lib/fetchNui'
import { useStore } from '../../store/useStore'
import { useConfirm } from '../ui/Modal'
import { avatar, money, timeAgo } from '../../lib/format'
import { Badge, IconChip } from '../ui/primitives'
import { Button, Input, Textarea, Select, Segmented } from '../ui/controls'
import type { Player } from '../../types'

const BAN_DURATIONS = [
  { value: '2h', label: '2 Hours' },
  { value: '1d', label: '1 Day' },
  { value: '3d', label: '3 Days' },
  { value: '1w', label: '1 Week' },
  { value: '2w', label: '2 Weeks' },
  { value: '1mo', label: '1 Month' },
  { value: 'perma', label: 'Permanent' },
]

export function PlayerDetail({ player, onClose }: { player: Player | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {player && <Drawer key={player.id} player={player} onClose={onClose} />}
    </AnimatePresence>
  )
}

function Drawer({ player, onClose }: { player: Player; onClose: () => void }) {
  const { can, pushToast } = useStore()
  const ask = useConfirm((s) => s.ask)
  const av = avatar(player.name)

  const [info, setInfo] = useState<any>(null)
  const [reason, setReason] = useState('')
  const [banDuration, setBanDuration] = useState('perma')
  const [showBan, setShowBan] = useState(false)
  const [dm, setDm] = useState('')
  const [moneyAmount, setMoneyAmount] = useState('')
  const [account, setAccount] = useState('cash')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (can('players.identifiers')) {
      rpc('player.identifiers', { target: player.id }).then(setInfo).catch(() => undefined)
    }
  }, [player.id, can])

  const act = async (name: string, data: Record<string, unknown> = {}, ok?: string) => {
    try {
      await rpc(name, { target: player.id, ...data })
      if (ok) pushToast(ok, 'success')
    } catch (e: any) {
      pushToast(humanError(e?.message), 'error')
    }
  }

  const confirmAct = async (cfg: { title: string; message: string; label: string; name: string; data?: any; ok: string; danger?: boolean; icon?: any }) => {
    const yes = await ask({
      title: cfg.title, message: cfg.message, confirmLabel: cfg.label, danger: cfg.danger, icon: cfg.icon,
    })
    if (yes) act(cfg.name, cfg.data, cfg.ok)
  }

  return (
    <>
      <motion.div
        className="absolute inset-0 z-40 bg-black/40"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 36 }}
        className="absolute right-0 top-0 z-40 flex h-full w-[400px] flex-col border-l border-line bg-ink-850 shadow-pop"
      >
        <div className="relative shrink-0 overflow-hidden border-b border-line p-5">
          <div className="relative flex items-start gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl text-lg font-bold text-white" style={av.style}>
              {av.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-lg font-semibold text-white">{player.name}</h3>
                {player.role && <Badge color={player.role.color} dot>{player.role.label}</Badge>}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                <Badge>ID {player.id}</Badge>
                {player.cid && <Badge>{player.cid}</Badge>}
                <Badge color="#38bdf8"><Briefcase size={10} /> {player.job?.label ?? 'Civilian'}{player.job?.gradeLabel ? ` · ${player.job.gradeLabel}` : ''}</Badge>
              </div>
              <div className="mt-2 flex gap-2">
                <MiniStat label="Cash" value={money(player.money?.cash)} />
                <MiniStat label="Bank" value={money(player.money?.bank)} />
              </div>
            </div>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <Section title="Quick Actions">
            <div className="grid grid-cols-4 gap-2">
              <ActionTile icon={<HeartPulse size={16} />} label="Heal" color="#34d399" show={can('players.heal')} onClick={() => act('player.heal', {}, 'Player healed.')} />
              <ActionTile icon={<Activity size={16} />} label="Revive" color="#22d3ee" show={can('players.revive')} onClick={() => act('player.revive', {}, 'Player revived.')} />
              <ActionTile icon={<Snowflake size={16} />} label="Freeze" color="#60a5fa" show={can('players.freeze')} onClick={() => act('player.freeze', { value: true }, 'Player frozen.')} />
              <ActionTile icon={<Snowflake size={16} className="opacity-50" />} label="Unfreeze" color="#94a3b8" show={can('players.freeze')} onClick={() => act('player.freeze', { value: false }, 'Player unfrozen.')} />
              <ActionTile icon={<Eye size={16} />} label="Spectate" color="#a855f7" show={can('players.spectate')} onClick={() => clientAction('spectate', { target: player.id })} />
              <ActionTile icon={<MapPin size={16} />} label="Goto" color="#f472b6" show={can('players.goto')} onClick={() => act('player.goto', {}, 'Teleported to player.')} />
              <ActionTile icon={<Move size={16} />} label="Bring" color="#fb923c" show={can('players.bring')} onClick={() => act('player.bring', {}, 'Player brought to you.')} />
              <ActionTile icon={<Skull size={16} />} label="Kill" color="#f43f5e" show={can('players.kill')}
                onClick={() => confirmAct({ title: 'Kill player?', message: `This will set ${player.name}'s health to zero.`, label: 'Kill', name: 'player.kill', ok: 'Player killed.', danger: true, icon: <Skull size={16} /> })} />
            </div>
          </Section>

          {(can('players.warn') || can('players.kick') || can('players.ban')) && (
            <Section title="Moderation">
              <Input label="Reason" placeholder="Reason for action…" value={reason} onChange={(e) => setReason(e.target.value)} />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {can('players.warn') && (
                  <Button variant="subtle" icon={<AlertTriangle size={14} />} onClick={() => act('player.warn', { reason }, 'Warning issued.')}>Warn</Button>
                )}
                {can('players.kick') && (
                  <Button variant="subtle" icon={<LogOut size={14} />}
                    onClick={() => confirmAct({ title: 'Kick player?', message: `${player.name} will be disconnected.`, label: 'Kick', name: 'player.kick', data: { reason }, ok: 'Player kicked.', danger: true, icon: <LogOut size={16} /> })}>Kick</Button>
                )}
                {can('players.ban') && (
                  <Button variant="danger" icon={<Gavel size={14} />} onClick={() => setShowBan((v) => !v)}>Ban</Button>
                )}
              </div>

              <AnimatePresence>
                {showBan && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-3">
                      <Select label="Duration" value={banDuration} onChange={setBanDuration} options={BAN_DURATIONS} />
                      <Button variant="danger" full className="mt-3" icon={<Gavel size={14} />}
                        onClick={() => confirmAct({
                          title: 'Confirm ban', danger: true, icon: <Gavel size={16} />,
                          message: `Ban ${player.name} for "${reason || 'no reason'}" (${BAN_DURATIONS.find((d) => d.value === banDuration)?.label}). This cannot be undone without an unban.`,
                          label: 'Ban player', name: 'ban.create', data: { reason, duration: banDuration }, ok: 'Player banned.',
                        })}>
                        Ban {player.name}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Section>
          )}

          {can('players.message') && (
            <Section title="Direct Message">
              <div className="flex gap-2">
                <input className="field" placeholder="Send a private message…" value={dm} onChange={(e) => setDm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && dm && (act('player.message', { message: dm }, 'Message sent.'), setDm(''))} />
                <Button variant="primary" icon={<Send size={14} />} onClick={() => { if (dm) { act('player.message', { message: dm }, 'Message sent.'); setDm('') } }}>Send</Button>
              </div>
            </Section>
          )}

          {can('players.setjob') && (
            <Section title="Set Job">
              <JobForm onSet={(job, grade) => act('player.setjob', { job, grade }, 'Job updated.')} />
            </Section>
          )}

          {(can('money.give') || can('money.remove')) && (
            <Section title="Economy">
              <div className="flex items-end gap-2">
                <Input label="Amount" type="number" placeholder="0" value={moneyAmount} onChange={(e) => setMoneyAmount(e.target.value)} />
                <div className="w-32">
                  <Segmented value={account} onChange={setAccount} options={[{ value: 'cash', label: 'Cash' }, { value: 'bank', label: 'Bank' }]} />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {can('money.give') && <Button variant="success" icon={<DollarSign size={14} />} onClick={() => { act('player.givemoney', { amount: moneyAmount, account }, 'Money given.'); setMoneyAmount('') }}>Give</Button>}
                {can('money.remove') && <Button variant="danger" icon={<DollarSign size={14} />} onClick={() => { act('player.removemoney', { amount: moneyAmount, account }, 'Money removed.'); setMoneyAmount('') }}>Remove</Button>}
              </div>
            </Section>
          )}

          {can('players.identifiers') && info && (
            <Section title="Identity & History">
              <div className="space-y-1.5">
                {Object.entries(info.identifiers ?? {}).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2">
                    <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      <Fingerprint size={12} /> {k}
                    </span>
                    <span className="max-w-[200px] truncate font-mono text-[11px] text-slate-300">{String(v)}</span>
                  </div>
                ))}
              </div>

              {info.warns?.length > 0 && (
                <div className="mt-3">
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">Warnings ({info.warns.length})</p>
                  {info.warns.map((w: any) => (
                    <div key={w.id} className="mb-1.5 rounded-lg border border-amber-500/15 bg-amber-500/[0.05] px-3 py-2 text-xs text-amber-100">
                      {w.reason} <span className="text-amber-500/60">· {w.admin} · {timeAgo(w.created)}</span>
                    </div>
                  ))}
                </div>
              )}

              {can('players.note') && (
                <div className="mt-3">
                  <div className="flex gap-2">
                    <input className="field" placeholder="Add a staff note…" value={note} onChange={(e) => setNote(e.target.value)} />
                    <Button variant="subtle" icon={<StickyNote size={14} />} onClick={() => { if (note) { act('player.addnote', { note }, 'Note saved.'); setNote('') } }}>Save</Button>
                  </div>
                  {info.notes?.map((n: any, i: number) => (
                    <div key={i} className="mt-1.5 rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2 text-xs text-slate-300">
                      {n.note} <span className="text-slate-500">· {n.admin} · {timeAgo(n.created)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}
        </div>
      </motion.aside>
    </>
  )
}

function humanError(code?: string) {
  const map: Record<string, string> = {
    no_permission: 'You do not have permission for that.',
    target_immune: "You can't target someone of equal or higher rank.",
    rate_limited: 'Slow down — too many actions.',
    player_not_found: 'Player is no longer online.',
    invalid_amount: 'Enter a valid amount.',
  }
  return map[code ?? ''] ?? 'Action failed.'
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
      {children}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1">
      <div className="text-[9px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-xs font-semibold text-emerald-300">{value}</div>
    </div>
  )
}

function ActionTile({ icon, label, color, onClick, show = true }: { icon: React.ReactNode; label: string; color: string; onClick: () => void; show?: boolean }) {
  if (!show) return null
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.015] py-2.5 transition hover:border-white/15 hover:bg-white/[0.05] active:scale-95">
      <IconChip icon={icon} color={color} size="sm" />
      <span className="text-[10px] font-medium text-slate-300">{label}</span>
    </button>
  )
}

function JobForm({ onSet }: { onSet: (job: string, grade: number) => void }) {
  const [job, setJob] = useState('')
  const [grade, setGrade] = useState('0')
  return (
    <div className="flex items-end gap-2">
      <Input label="Job name" placeholder="police" value={job} onChange={(e) => setJob(e.target.value)} />
      <div className="w-20">
        <Input label="Grade" type="number" placeholder="0" value={grade} onChange={(e) => setGrade(e.target.value)} />
      </div>
      <Button variant="primary" icon={<ChevronRight size={14} />} onClick={() => job && onSet(job, Number(grade) || 0)}>Set</Button>
    </div>
  )
}
