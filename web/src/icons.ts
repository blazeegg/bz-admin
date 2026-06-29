import {
  LayoutDashboard, Users, UserCog, Car, CloudSun, MapPin, Gavel,
  ScrollText, TerminalSquare,
} from 'lucide-react'
import type { TabId } from './types'

export const TAB_META: Record<TabId, { label: string; icon: any; color: string; desc: string }> = {
  dashboard: { label: 'Dashboard', icon: LayoutDashboard, color: '#4f8cff', desc: 'Server overview' },
  players: { label: 'Players', icon: Users, color: '#38bdf8', desc: 'Manage connected players' },
  self: { label: 'Self', icon: UserCog, color: '#a855f7', desc: 'Personal admin toggles' },
  vehicle: { label: 'Vehicle', icon: Car, color: '#f59e0b', desc: 'Spawn & modify vehicles' },
  world: { label: 'World', icon: CloudSun, color: '#34d399', desc: 'Weather, time & area' },
  teleport: { label: 'Teleport', icon: MapPin, color: '#f472b6', desc: 'Move around the map' },
  bans: { label: 'Bans', icon: Gavel, color: '#f43f5e', desc: 'Ban list & revocation' },
  logs: { label: 'Logs', icon: ScrollText, color: '#eab308', desc: 'Live action history' },
  developer: { label: 'Developer', icon: TerminalSquare, color: '#94a3b8', desc: 'Tools & console' },
}

export const LOG_CATEGORY_COLOR: Record<string, string> = {
  bans: '#f43f5e',
  kicks: '#f59e0b',
  warns: '#eab308',
  money: '#34d399',
  teleport: '#38bdf8',
  selfActions: '#a855f7',
  serverActions: '#4f8cff',
  connections: '#94a3b8',
}
