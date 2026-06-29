import { useState } from 'react'
import { TerminalSquare, Crosshair, Copy, ScanLine, Send, MapPin } from 'lucide-react'
import { fetchNui } from '../../lib/fetchNui'
import { useNuiEvent } from '../../lib/useNuiEvent'
import { useStore } from '../../store/useStore'
import { Card, SectionHeader, TabPanel, IconChip } from '../ui/primitives'
import { Button, Toggle, Input } from '../ui/controls'

export function Developer() {
  const { can, pushToast, allowConsole } = useStore()
  const [coordsOn, setCoordsOn] = useState(false)
  const [live, setLive] = useState<{ x: number; y: number; z: number; heading: number; vector: string } | null>(null)
  const [entity, setEntity] = useState<any>(null)
  const [command, setCommand] = useState('')

  useNuiEvent('devCoords', (d: any) => setLive(d))

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => undefined)
    pushToast('Copied to clipboard.', 'success')
  }

  const inspect = async () => {
    const res: any = await fetchNui('dev:entityInfo', {})
    if (res?.result && res.result.model) setEntity(res.result)
    else pushToast('No entity nearby.', 'inform')
  }

  const runConsole = async () => {
    if (!command.trim()) return
    try {
      const res: any = await fetchNui('dev:console', { command })
      if (!res?.ok || res?.result?.error) throw new Error()
      pushToast('Command executed.', 'success')
      setCommand('')
    } catch {
      pushToast('Command blocked or failed.', 'error')
    }
  }

  return (
    <TabPanel>
      {can('dev.coords') && (
        <Card>
          <SectionHeader icon={<Crosshair size={16} />} color="#94a3b8" title="Coordinate Tool" subtitle="Live position read-out" />
          <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.015] px-3.5 py-3">
            <span className="flex items-center gap-2 text-sm text-slate-300"><MapPin size={15} /> Show live coordinates</span>
            <Toggle checked={coordsOn} onChange={(v) => { setCoordsOn(v); fetchNui('dev:toggleCoords', { value: v }) }} />
          </div>

          {coordsOn && live && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {(['x', 'y', 'z', 'heading'] as const).map((k) => (
                <div key={k} className="rounded-xl border border-white/[0.06] bg-ink-900/60 p-3 text-center">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">{k}</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-white">{live[k]}</div>
                </div>
              ))}
            </div>
          )}
          {coordsOn && live && (
            <button onClick={() => copy(live.vector)}
              className="mt-2 flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-ink-900/60 px-3.5 py-2.5 font-mono text-xs text-slate-300 transition hover:border-accent/30 hover:text-white">
              {live.vector}
              <Copy size={13} />
            </button>
          )}
        </Card>
      )}

      {can('dev.entity') && (
        <Card>
          <SectionHeader icon={<ScanLine size={16} />} color="#38bdf8" title="Entity Inspector" subtitle="Read the nearest vehicle" />
          <Button className="mt-4" icon={<ScanLine size={15} />} onClick={inspect}>Inspect Nearby Entity</Button>
          {entity && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <Field label="Model Hash" value={entity.model} />
              <Field label="Network ID" value={entity.netId} />
              <Field label="Health" value={entity.health} />
              <Field label="Position" value={entity.coords ? `${entity.coords.x}, ${entity.coords.y}` : '—'} />
            </div>
          )}
        </Card>
      )}

      {can('dev.console') && allowConsole && (
        <Card>
          <SectionHeader icon={<TerminalSquare size={16} />} color="#f43f5e" title="Server Console" subtitle="Run a trusted server command" />
          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-600">{'>'}</span>
              <input className="field pl-7 font-mono" placeholder="e.g. say Hello server" value={command}
                onChange={(e) => setCommand(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runConsole()} />
            </div>
            <Button variant="danger" icon={<Send size={15} />} onClick={runConsole}>Run</Button>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Destructive commands (quit, server shutdown) are blocked server-side.</p>
        </Card>
      )}
    </TabPanel>
  )
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-0.5 font-mono text-sm text-white">{String(value)}</div>
    </div>
  )
}
