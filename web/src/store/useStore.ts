import { create } from 'zustand'
import type {
  AuthorizePayload, Branding, Player, TabConfig, TabId, Toast, ToastKind,
  PermissionSummary,
} from '../types'
import { rpc } from '../lib/fetchNui'

interface SelfToggles {
  noclip: boolean
  godmode: boolean
  invisible: boolean
  infammo: boolean
  superjump: boolean
  fastrun: boolean
}

interface State {
  open: boolean
  booted: boolean
  framework: string
  branding: Branding
  self: PermissionSummary | null
  tabs: TabConfig[]
  locations: AuthorizePayload['locations']
  weatherList: string[]
  allowConsole: boolean

  activeTab: TabId
  players: Player[]
  selectedPlayerId: number | null
  search: string

  toggles: SelfToggles
  toasts: Toast[]

  boot: (p: AuthorizePayload) => void
  close: () => void
  setTab: (t: TabId) => void
  setSearch: (s: string) => void
  selectPlayer: (id: number | null) => void
  refreshPlayers: () => Promise<void>
  setToggle: (k: keyof SelfToggles, v: boolean) => void
  pushToast: (message: string, type?: ToastKind) => void
  dismissToast: (id: string) => void
  can: (perm: string) => boolean
}

function permMatch(granted: string, required: string) {
  if (granted === '*' || granted === required) return true
  if (granted.endsWith('.*')) {
    const prefix = granted.slice(0, -2)
    return required === prefix || required.startsWith(prefix + '.')
  }
  return false
}

export const useStore = create<State>((set, get) => ({
  open: false,
  booted: false,
  framework: 'standalone',
  branding: { title: 'BZ ADMIN', tag: 'Admin Menu', subtitle: 'Server administration, refined.', accent: '#4f8cff' },
  self: null,
  tabs: [],
  locations: [],
  weatherList: [],
  allowConsole: false,

  activeTab: 'dashboard',
  players: [],
  selectedPlayerId: null,
  search: '',

  toggles: { noclip: false, godmode: false, invisible: false, infammo: false, superjump: false, fastrun: false },
  toasts: [],

  boot: (p) =>
    set({
      open: true,
      booted: true,
      framework: p.framework,
      branding: p.branding,
      self: p.self,
      tabs: p.tabs.filter((t) => t.enabled),
      locations: p.locations,
      weatherList: p.weatherList,
      allowConsole: p.allowConsole ?? false,
      activeTab: 'dashboard',
    }),

  close: () => set({ open: false, selectedPlayerId: null, search: '' }),

  setTab: (t) => set({ activeTab: t, selectedPlayerId: null }),
  setSearch: (s) => set({ search: s }),
  selectPlayer: (id) => set({ selectedPlayerId: id }),

  refreshPlayers: async () => {
    try {
      const res = await rpc<{ players: Player[] }>('getPlayers')
      set({ players: res.players ?? [] })
    } catch {
      void 0
    }
  },

  setToggle: (k, v) => set((s) => ({ toggles: { ...s.toggles, [k]: v } })),

  pushToast: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => get().dismissToast(id), 4200)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  can: (perm) => {
    const self = get().self
    if (!self) return false
    return self.permissions.some((p) => permMatch(p, perm))
  },
}))
