import { useState } from 'react'
import { MapPin, Navigation, Crosshair, Undo2, Map } from 'lucide-react'
import { fetchNui } from '../../lib/fetchNui'
import { useStore } from '../../store/useStore'
import { Card, SectionHeader, TabPanel, IconChip } from '../ui/primitives'
import { Button, Input } from '../ui/controls'

export function Teleport() {
  const { locations, can, pushToast } = useStore()
  const [coords, setCoords] = useState({ x: '', y: '', z: '' })

  const tp = async (callback: string, data: any, ok: string) => {
    try {
      const res: any = await fetchNui(callback, data)
      if (!res?.ok || res?.result?.error) throw new Error()
      pushToast(ok, 'success')
    } catch {
      pushToast('Unable to teleport.', 'error')
    }
  }

  return (
    <TabPanel>
      <Card>
        <SectionHeader icon={<Navigation size={16} />} color="#f472b6" title="Quick Teleport" subtitle="Common destinations" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {can('teleport.waypoint') && (
            <button onClick={() => tp('teleport:waypoint', {}, 'Teleported to waypoint.')}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.015] py-4 transition hover:border-pink-500/30 hover:bg-pink-500/[0.06]">
              <IconChip icon={<MapPin size={17} />} color="#f472b6" />
              <span className="text-xs font-medium text-slate-200">Waypoint</span>
            </button>
          )}
          {can('teleport.back') && (
            <button onClick={() => tp('teleport:back', {}, 'Teleported back.')}
              className="flex flex-col items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.015] py-4 transition hover:border-white/15 hover:bg-white/[0.04]">
              <IconChip icon={<Undo2 size={17} />} color="#94a3b8" />
              <span className="text-xs font-medium text-slate-200">Back</span>
            </button>
          )}
        </div>
      </Card>

      {can('teleport.saved') && locations.length > 0 && (
        <Card>
          <SectionHeader icon={<Map size={16} />} color="#38bdf8" title="Saved Locations" subtitle="Jump to configured spots" />
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((loc, i) => (
              <button key={loc.label} onClick={() => tp('teleport:saved', { index: i + 1 }, `Teleported to ${loc.label}.`)}
                className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 text-left transition hover:border-sky-500/30 hover:bg-sky-500/[0.06]">
                <IconChip icon={<MapPin size={15} />} color="#38bdf8" size="sm" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-200 group-hover:text-white">{loc.label}</div>
                  <div className="font-mono text-[10px] text-slate-500">
                    {loc.coords.x.toFixed(0)}, {loc.coords.y.toFixed(0)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {can('teleport.coords') && (
        <Card>
          <SectionHeader icon={<Crosshair size={16} />} color="#a855f7" title="Teleport to Coordinates" subtitle="Precise positioning" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Input label="X" type="number" placeholder="0.0" value={coords.x} onChange={(e) => setCoords({ ...coords, x: e.target.value })} />
            <Input label="Y" type="number" placeholder="0.0" value={coords.y} onChange={(e) => setCoords({ ...coords, y: e.target.value })} />
            <Input label="Z" type="number" placeholder="0.0" value={coords.z} onChange={(e) => setCoords({ ...coords, z: e.target.value })} />
          </div>
          <Button variant="primary" full className="mt-3" icon={<Navigation size={15} />}
            onClick={() => tp('teleport:coords', coords, 'Teleported.')}>
            Teleport
          </Button>
        </Card>
      )}
    </TabPanel>
  )
}
