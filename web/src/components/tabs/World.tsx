import { useState } from 'react'
import {
  CloudSun, Clock, Megaphone, Eraser, MessageSquareOff, Lightbulb, Sun, Moon,
} from 'lucide-react'
import { rpc } from '../../lib/fetchNui'
import { useStore } from '../../store/useStore'
import { Card, SectionHeader, TabPanel } from '../ui/primitives'
import { Button, Input, Toggle } from '../ui/controls'

const WEATHER_LABEL: Record<string, string> = {
  EXTRASUNNY: 'Extra Sunny', CLEAR: 'Clear', CLOUDS: 'Cloudy', OVERCAST: 'Overcast',
  RAIN: 'Rain', THUNDER: 'Thunder', CLEARING: 'Clearing', NEUTRAL: 'Neutral',
  SNOW: 'Snow', BLIZZARD: 'Blizzard', SNOWLIGHT: 'Light Snow', XMAS: 'Christmas',
  HALLOWEEN: 'Halloween', FOGGY: 'Foggy',
}

export function World() {
  const { weatherList, can, pushToast } = useStore()
  const [activeWeather, setActiveWeather] = useState('')
  const [hour, setHour] = useState(12)
  const [minute, setMinute] = useState(0)
  const [freezeTime, setFreezeTime] = useState(false)
  const [blackout, setBlackout] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  const run = async (name: string, data: any, ok: string) => {
    try {
      await rpc(name, data)
      pushToast(ok, 'success')
    } catch {
      pushToast('You do not have permission for that.', 'error')
    }
  }

  return (
    <TabPanel>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {can('world.weather') && (
          <Card>
            <SectionHeader icon={<CloudSun size={16} />} color="#34d399" title="Weather" subtitle="Set conditions server-wide" />
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {weatherList.map((w) => (
                <button key={w} onClick={() => { setActiveWeather(w); run('world.weather', { weather: w }, `Weather set to ${WEATHER_LABEL[w] ?? w}.`) }}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                    activeWeather === w ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200' : 'border-white/[0.06] bg-white/[0.015] text-slate-300 hover:border-white/15 hover:bg-white/[0.04]'
                  }`}>
                  {WEATHER_LABEL[w] ?? w}
                </button>
              ))}
            </div>
          </Card>
        )}

        {can('world.time') && (
          <Card>
            <SectionHeader icon={<Clock size={16} />} color="#4f8cff" title="Time" subtitle="Override the in-game clock" />
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="label mb-0">Hour</span>
                <span className="font-mono text-lg font-semibold text-white">
                  {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
                </span>
              </div>
              <input type="range" min={0} max={23} value={hour} onChange={(e) => setHour(Number(e.target.value))}
                className="w-full accent-accent" />
              <input type="range" min={0} max={59} value={minute} onChange={(e) => setMinute(Number(e.target.value))}
                className="mt-2 w-full accent-accent" />

              <div className="mt-3 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.015] px-3.5 py-2.5">
                <span className="text-sm text-slate-300">Freeze time</span>
                <Toggle checked={freezeTime} onChange={setFreezeTime} />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <Button size="sm" icon={<Sun size={14} />} onClick={() => { setHour(12); setMinute(0) }}>Noon</Button>
                <Button size="sm" icon={<Moon size={14} />} onClick={() => { setHour(0); setMinute(0) }}>Midnight</Button>
                <Button size="sm" variant="primary" onClick={() => run('world.time', { hour, minute, freeze: freezeTime }, `Time set to ${hour}:${String(minute).padStart(2, '0')}.`)}>Apply</Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <Card>
        <SectionHeader icon={<Megaphone size={16} />} color="#4f8cff" title="Server Controls" subtitle="Broadcast & environment" />
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {can('world.announce') && (
            <div className="space-y-2">
              <Input label="Announcement title (optional)" placeholder="Announcement" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Input label="Message" placeholder="Type your broadcast…" value={message} onChange={(e) => setMessage(e.target.value)} />
              <Button variant="primary" full icon={<Megaphone size={15} />}
                onClick={() => { if (message.trim()) { run('world.announce', { title, message }, 'Announcement sent.'); setMessage('') } }}>
                Broadcast to all
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {can('world.blackout') && (
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.015] px-3.5 py-3">
                <span className="flex items-center gap-2 text-sm text-slate-300"><Lightbulb size={15} className="text-amber-400" /> Blackout</span>
                <Toggle checked={blackout} onChange={(v) => { setBlackout(v); run('world.blackout', { value: v }, `Blackout ${v ? 'enabled' : 'disabled'}.`) }} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {can('world.cleararea') && <Button icon={<Eraser size={15} />} onClick={() => run('world.cleararea', { radius: 100 }, 'Area cleared.')}>Clear Area</Button>}
              {can('world.clearchat') && <Button icon={<MessageSquareOff size={15} />} onClick={() => run('world.clearchat', {}, 'Chat cleared.')}>Clear Chat</Button>}
            </div>
          </div>
        </div>
      </Card>
    </TabPanel>
  )
}
