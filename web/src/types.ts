export interface PermissionSummary {
  roleId: string
  label: string
  color: string
  power: number
  permissions: string[]
}

export interface Branding {
  title: string
  tag?: string
  icon?: string
  subtitle: string
  accent: string
  logoUrl?: string
}

export interface TabConfig {
  id: TabId
  enabled: boolean
}

export type TabId =
  | 'dashboard'
  | 'players'
  | 'self'
  | 'vehicle'
  | 'world'
  | 'teleport'
  | 'bans'
  | 'logs'
  | 'developer'

export interface AuthorizePayload {
  allowed: boolean
  self: PermissionSummary
  branding: Branding
  tabs: TabConfig[]
  locations: { label: string; coords: { x: number; y: number; z: number } }[]
  weatherList: string[]
  framework: string
  allowConsole?: boolean
}

export interface PlayerRole {
  id: string
  label: string
  color: string
  power: number
}

export interface Job {
  name?: string
  label?: string
  grade?: number
  gradeLabel?: string
  onDuty?: boolean
}

export interface PlayerMoney {
  cash?: number
  bank?: number
  black?: number
  [k: string]: number | undefined
}

export interface Player {
  id: number
  name: string
  cid?: string
  job?: Job
  money?: PlayerMoney
  ping?: number
  role?: PlayerRole | null
  identifiers?: Record<string, string>
}

export interface Ban {
  id: string
  name: string
  reason: string
  admin: string
  created: number
  expires: number
  active: boolean
  identifiers: string[]
  expiresLabel: string
}

export interface LogPerson {
  name: string
  source?: number
  discordId?: string
  discordName?: string
  license?: string
  identifiers?: Record<string, string>
}

export interface LogEntry {
  id: number
  category: string
  action: string
  admin: LogPerson
  target?: LogPerson
  reason?: string
  time: number
}

export interface DashboardData {
  online: number
  max: number
  staff: number
  uptime: number
  framework: string
  serverName: string
  activeBans: number
}

export type ToastKind = 'info' | 'success' | 'error' | 'inform' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastKind
}
