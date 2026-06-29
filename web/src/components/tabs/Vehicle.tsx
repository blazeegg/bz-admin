import { useState } from 'react'
import { Car, Trash2, Wrench, Gauge, Hash, Rocket, Search } from 'lucide-react'
import { fetchNui } from '../../lib/fetchNui'
import { useStore } from '../../store/useStore'
import { Card, SectionHeader, TabPanel } from '../ui/primitives'
import { Button, Input } from '../ui/controls'

const POPULAR: { model: string; label: string; cat: string }[] = [
  { model: 'adder', label: 'Adder', cat: 'Super' },
  { model: 'zentorno', label: 'Zentorno', cat: 'Super' },
  { model: 't20', label: 'T20', cat: 'Super' },
  { model: 'krieger', label: 'Krieger', cat: 'Super' },
  { model: 'sultanrs', label: 'Sultan RS', cat: 'Sports' },
  { model: 'elegy2', label: 'Elegy RH8', cat: 'Sports' },
  { model: 'kuruma2', label: 'Kuruma (Armored)', cat: 'Sports' },
  { model: 'dominator', label: 'Dominator', cat: 'Muscle' },
  { model: 'sandking', label: 'Sandking', cat: 'Off-Road' },
  { model: 'kamacho', label: 'Kamacho', cat: 'Off-Road' },
  { model: 'police', label: 'Police Cruiser', cat: 'Emergency' },
  { model: 'police3', label: 'Police Interceptor', cat: 'Emergency' },
  { model: 'ambulance', label: 'Ambulance', cat: 'Emergency' },
  { model: 'fbi2', label: 'FBI SUV', cat: 'Emergency' },
  { model: 'buzzard', label: 'Buzzard Heli', cat: 'Air' },
  { model: 'maverick', label: 'Maverick Heli', cat: 'Air' },
]

export function Vehicle() {
  const { can, pushToast } = useStore()
  const [model, setModel] = useState('')
  const [plate, setPlate] = useState('')
  const [query, setQuery] = useState('')

  const call = async (callback: string, data: any, ok: string) => {
    try {
      const res: any = await fetchNui(callback, data)
      if (!res?.ok || res?.result?.error) throw new Error()
      pushToast(ok, 'success')
    } catch {
      pushToast('You do not have permission for that.', 'error')
    }
  }

  const spawn = (m: string) => {
    if (!m) return
    call('vehicle:spawn', { model: m }, `Spawned ${m}.`)
  }

  const filtered = POPULAR.filter(
    (v) => v.label.toLowerCase().includes(query.toLowerCase()) || v.model.includes(query.toLowerCase()),
  )

  return (
    <TabPanel>
      {can('vehicle.spawn') && (
        <Card>
          <SectionHeader icon={<Car size={16} />} color="#f59e0b" title="Spawn Vehicle" subtitle="By model name or quick pick" />
          <div className="mt-4 flex gap-2">
            <Input placeholder="Enter a spawn name, e.g. adder" value={model}
              onChange={(e) => setModel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && spawn(model)} />
            <Button variant="primary" icon={<Car size={15} />} onClick={() => spawn(model)}>Spawn</Button>
          </div>

          <div className="relative mt-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input className="field pl-9" placeholder="Filter quick picks…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((v) => (
              <button key={v.model} onClick={() => spawn(v.model)}
                className="group flex flex-col gap-1 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 text-left transition hover:border-amber-500/30 hover:bg-amber-500/[0.06]">
                <span className="text-[10px] font-medium uppercase tracking-wider text-amber-500/70">{v.cat}</span>
                <span className="text-sm font-medium text-slate-200 group-hover:text-white">{v.label}</span>
                <span className="font-mono text-[10px] text-slate-500">{v.model}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <SectionHeader icon={<Wrench size={16} />} color="#38bdf8" title="Current Vehicle" subtitle="Actions on the car you're in" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {can('vehicle.repair') && <Button icon={<Wrench size={15} />} onClick={() => call('vehicle:repair', {}, 'Vehicle repaired.')}>Repair</Button>}
          {can('vehicle.upgrade') && <Button icon={<Gauge size={15} />} onClick={() => call('vehicle:upgrade', {}, 'Vehicle fully upgraded.')}>Max Upgrade</Button>}
          {can('vehicle.boost') && <Button icon={<Rocket size={15} />} onClick={() => call('vehicle:boost', {}, 'Boost!')}>Boost</Button>}
          {can('vehicle.delete') && <Button variant="danger" icon={<Trash2 size={15} />} onClick={() => call('vehicle:delete', {}, 'Vehicle deleted.')}>Delete</Button>}
        </div>

        {can('vehicle.plate') && (
          <div className="mt-4 flex gap-2">
            <Input label="Number Plate" placeholder="BZADMIN" value={plate} maxLength={8} onChange={(e) => setPlate(e.target.value.toUpperCase())} />
            <Button className="self-end" icon={<Hash size={15} />} onClick={() => plate && call('vehicle:plate', { plate }, 'Plate updated.')}>Set Plate</Button>
          </div>
        )}
      </Card>
    </TabPanel>
  )
}
