import {
  Ghost, Shield, EyeOff, Crosshair, ArrowUp, Wind, HeartPulse, ShieldPlus, Plane,
} from 'lucide-react'
import { fetchNui } from '../../lib/fetchNui'
import { useStore } from '../../store/useStore'
import { Card, SectionHeader, TabPanel, IconChip } from '../ui/primitives'
import { Toggle, Button } from '../ui/controls'

interface ToggleDef {
  key: 'noclip' | 'godmode' | 'invisible' | 'infammo' | 'superjump' | 'fastrun'
  label: string
  desc: string
  icon: any
  color: string
  perm: string
  callback: string
  feature?: string
}

const TOGGLES: ToggleDef[] = [
  { key: 'noclip', label: 'Noclip', desc: 'Fly through the world freely', icon: Plane, color: '#a855f7', perm: 'self.noclip', callback: 'self:noclip' },
  { key: 'godmode', label: 'God Mode', desc: 'Become invincible to all damage', icon: Shield, color: '#4f8cff', perm: 'self.godmode', callback: 'self:toggle', feature: 'godmode' },
  { key: 'invisible', label: 'Invisible', desc: 'Hide your character from view', icon: EyeOff, color: '#38bdf8', perm: 'self.invisible', callback: 'self:toggle', feature: 'invisible' },
  { key: 'infammo', label: 'Infinite Ammo', desc: 'Never run out of ammunition', icon: Crosshair, color: '#f59e0b', perm: 'self.infammo', callback: 'self:toggle', feature: 'infammo' },
  { key: 'superjump', label: 'Super Jump', desc: 'Leap to extraordinary heights', icon: ArrowUp, color: '#34d399', perm: 'self.superjump', callback: 'self:toggle', feature: 'superjump' },
  { key: 'fastrun', label: 'Fast Run', desc: 'Sprint at maximum speed', icon: Wind, color: '#f472b6', perm: 'self.fastrun', callback: 'self:toggle', feature: 'fastrun' },
]

export function Self() {
  const { toggles, setToggle, can, pushToast } = useStore()

  const flip = async (def: ToggleDef) => {
    const next = !toggles[def.key]
    setToggle(def.key, next) // optimistic
    const body = def.feature ? { feature: def.feature, value: next } : { value: next }
    try {
      const res: any = await fetchNui(def.callback, body)
      if (!res?.ok || res?.result?.error) {
        setToggle(def.key, !next)
        pushToast('You do not have permission for that.', 'error')
      } else {
        pushToast(`${def.label} ${next ? 'enabled' : 'disabled'}.`, next ? 'success' : 'inform')
      }
    } catch {
      setToggle(def.key, !next)
      pushToast('Action failed.', 'error')
    }
  }

  const quick = async (callback: string, label: string) => {
    try {
      const res: any = await fetchNui(callback, {})
      if (!res?.ok) throw new Error()
      pushToast(label, 'success')
    } catch {
      pushToast('You do not have permission for that.', 'error')
    }
  }

  const available = TOGGLES.filter((t) => can(t.perm))

  return (
    <TabPanel>
      <Card>
        <SectionHeader icon={<Ghost size={16} />} color="#a855f7" title="Self Options"
          subtitle="Personal toggles applied only to you" />
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {available.map((def) => {
            const active = toggles[def.key]
            return (
              <div
                key={def.key}
                className={`flex items-center gap-3 rounded-xl border p-3.5 transition ${
                  active ? 'border-accent/30 bg-accent/[0.06]' : 'border-white/[0.06] bg-white/[0.015]'
                }`}
              >
                <IconChip icon={<def.icon size={17} />} color={def.color} />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white">{def.label}</div>
                  <div className="truncate text-[11px] text-slate-500">{def.desc}</div>
                </div>
                <Toggle checked={active} onChange={() => flip(def)} />
              </div>
            )
          })}
        </div>
      </Card>

      {(can('self.heal') || can('self.armor')) && (
        <Card>
          <SectionHeader icon={<HeartPulse size={16} />} color="#34d399" title="Restore" subtitle="Patch yourself up instantly" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {can('self.heal') && <Button variant="success" icon={<HeartPulse size={15} />} onClick={() => quick('self:heal', 'Health restored.')}>Full Heal</Button>}
            {can('self.armor') && <Button variant="primary" icon={<ShieldPlus size={15} />} onClick={() => quick('self:armor', 'Armor applied.')}>Max Armor</Button>}
          </div>
        </Card>
      )}
    </TabPanel>
  )
}
