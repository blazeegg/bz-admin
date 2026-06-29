import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ScrollText, RefreshCw, ArrowRight, ChevronDown, Copy } from 'lucide-react'
import { rpc } from '../../lib/fetchNui'
import { useStore } from '../../store/useStore'
import { timeAgo } from '../../lib/format'
import { Card, SectionHeader, TabPanel, EmptyState, Spinner, Badge } from '../ui/primitives'
import { Button, Segmented } from '../ui/controls'
import { LOG_CATEGORY_COLOR } from '../../icons'
import type { LogEntry, LogPerson } from '../../types'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'bans', label: 'Bans' },
  { value: 'kicks', label: 'Kicks' },
  { value: 'warns', label: 'Warns' },
  { value: 'money', label: 'Money' },
  { value: 'serverActions', label: 'Server' },
]

const nameOf = (p?: LogPerson) => (p ? p.discordName || p.name || 'Unknown' : '')
const short = (v?: string, keep = 14) =>
  !v ? '—' : v.length > keep + 2 ? v.slice(0, keep) + '…' : v

export function Logs() {
  const { pushToast } = useStore()
  const [logs, setLogs] = useState<LogEntry[] | null>(null)
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState<number | null>(null)

  const load = (cat = filter) => rpc<{ logs: LogEntry[] }>('logs.list', { category: cat })
    .then((r) => setLogs(r.logs)).catch(() => setLogs([]))

  useEffect(() => { load() }, [filter])
  useEffect(() => {
    const t = setInterval(() => load(), 6000)
    return () => clearInterval(t)
  }, [filter])

  const copy = (v?: string) => {
    if (!v) return
    navigator.clipboard?.writeText(v).catch(() => undefined)
    pushToast('Copied to clipboard.', 'success')
  }

  return (
    <TabPanel>
      <Card>
        <SectionHeader icon={<ScrollText size={16} />} color="#eab308" title="Action Log" subtitle="Recent administrative activity"
          right={<Button size="sm" icon={<RefreshCw size={13} />} onClick={() => load()}>Refresh</Button>} />

        <div className="mt-4 overflow-x-auto">
          <Segmented value={filter} onChange={setFilter} options={FILTERS} />
        </div>

        <div className="mt-4 space-y-1.5">
          {logs === null ? (
            <div className="flex justify-center py-10"><Spinner className="h-6 w-6" /></div>
          ) : logs.length === 0 ? (
            <EmptyState icon={<ScrollText size={22} />} title="No activity yet" hint="Actions will appear here in real time." />
          ) : (
            logs.map((log) => {
              const color = LOG_CATEGORY_COLOR[log.category] ?? '#94a3b8'
              const expanded = open === log.id
              return (
                <div key={log.id} className="overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.012]">
                  <button
                    onClick={() => setOpen(expanded ? null : log.id)}
                    className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition hover:bg-white/[0.025]"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-sm">
                        <span className="font-medium text-slate-200">{nameOf(log.admin)}</span>
                        <span className="text-slate-500">{log.action}</span>
                        {log.target && (
                          <>
                            <ArrowRight size={12} className="text-slate-600" />
                            <span className="font-medium text-slate-300">{nameOf(log.target)}</span>
                          </>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                        {log.admin.discordId && <span>admin discord: {log.admin.discordId}</span>}
                        {log.target?.license && (
                          <span className="font-mono">{short(log.target.license, 18)}</span>
                        )}
                        {log.reason && <span className="text-slate-400">“{log.reason}”</span>}
                      </div>
                    </div>
                    <Badge color={color}>{log.category}</Badge>
                    <span className="shrink-0 text-[11px] text-slate-500">{timeAgo(log.time)}</span>
                    <ChevronDown
                      size={15}
                      className={`shrink-0 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                      >
                        <div className="grid grid-cols-1 gap-3 border-t border-white/[0.05] p-3.5 sm:grid-cols-2">
                          <PersonCard title="Admin" person={log.admin} color={color} onCopy={copy} />
                          {log.target && <PersonCard title="Player" person={log.target} color={color} onCopy={copy} />}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </TabPanel>
  )
}

function PersonCard({
  title, person, color, onCopy,
}: { title: string; person: LogPerson; color: string; onCopy: (v?: string) => void }) {
  const ids = person.identifiers ?? {}
  const rows: [string, string | undefined][] = [
    ['Discord name', person.discordName],
    ['Discord ID', person.discordId],
    ['License', ids.license],
    ['Steam', ids.steam],
    ['FiveM', ids.fivem],
  ]
  return (
    <div className="rounded-lg border border-white/[0.06] bg-ink-900/50 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        <span className="ml-auto truncate text-xs text-slate-300">{person.name}</span>
      </div>
      <div className="space-y-1">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <button
            key={k}
            onClick={() => onCopy(v)}
            className="group flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left transition hover:bg-white/[0.04]"
            title="Click to copy"
          >
            <span className="text-[10px] uppercase tracking-wider text-slate-500">{k}</span>
            <span className="flex items-center gap-1.5 truncate font-mono text-[11px] text-slate-300">
              {v}
              <Copy size={11} className="shrink-0 text-slate-600 opacity-0 transition group-hover:opacity-100" />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
