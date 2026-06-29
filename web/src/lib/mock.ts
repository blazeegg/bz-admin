const NAMES = [
  'Marcus Reed', 'Ava Lindqvist', 'Dmitri Volkov', 'Sofia Marín', 'Leo Tanaka',
  'Hannah Cole', 'Omar Haddad', 'Nina Petrova', 'Caleb Brooks', 'Yuki Sato',
  'Isla Murphy', 'Theo Berger', 'Priya Nair', 'Jonas Vega', 'Mei Chen',
]
const JOBS = [
  { name: 'police', label: 'Police', grade: 4, gradeLabel: 'Sergeant', onDuty: true },
  { name: 'ambulance', label: 'EMS', grade: 2, gradeLabel: 'Paramedic', onDuty: true },
  { name: 'mechanic', label: 'Mechanic', grade: 0, gradeLabel: 'Apprentice', onDuty: false },
  { name: 'unemployed', label: 'Civilian', grade: 0, gradeLabel: '', onDuty: true },
  { name: 'taxi', label: 'Taxi', grade: 1, gradeLabel: 'Driver', onDuty: true },
]
const ROLES = [
  null, null, null, null,
  { id: 'moderator', label: 'Moderator', color: '#22c55e', power: 10 },
  { id: 'admin', label: 'Administrator', color: '#4f8cff', power: 50 },
]

const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a

const PLAYERS = Array.from({ length: 14 }).map((_, i) => ({
  id: i + 1,
  name: NAMES[i % NAMES.length],
  cid: `BZ${rand(10000, 99999)}`,
  job: JOBS[i % JOBS.length],
  money: { cash: rand(50, 9000), bank: rand(1000, 250000) },
  ping: rand(18, 140),
  role: ROLES[i % ROLES.length],
  identifiers: {
    license: 'license:3a9f2b' + rand(100000, 999999),
    discord: 'discord:2487' + rand(10000000, 99999999),
    steam: 'steam:11000010' + rand(1000000, 9999999),
    ip: `ip:192.168.${rand(0, 255)}.${rand(0, 255)}`,
  },
}))

const BANS = Array.from({ length: 6 }).map((_, i) => ({
  id: 'A' + (1000 + i),
  name: NAMES[(i + 3) % NAMES.length],
  reason: ['Cheating — aimbot', 'Toxicity', 'RDM x4', 'Exploiting', 'Ban evasion', 'Combat logging'][i],
  admin: 'Marcus Reed',
  created: Date.now() / 1000 - rand(3600, 600000),
  expires: i % 3 === 0 ? 0 : Date.now() / 1000 + rand(3600, 600000),
  active: i !== 5,
  identifiers: ['license:3a9f2b' + rand(100000, 999999)],
  expiresLabel: i % 3 === 0 ? 'Permanent' : '2026-07-01 14:30',
}))

const person = (i: number) => {
  const name = NAMES[i % NAMES.length]
  const discordId = String(2487 + rand(10000000, 99999999))
  const license = 'license:3a9f2b' + rand(100000, 999999)
  return {
    name,
    discordId,
    discordName: name.split(' ')[0].toLowerCase() + rand(10, 99),
    license,
    identifiers: {
      discord: 'discord:' + discordId,
      license,
      steam: 'steam:11000010' + rand(1000000, 9999999),
      fivem: 'fivem:' + rand(100000, 999999),
      ip: `ip:192.168.${rand(0, 255)}.${rand(0, 255)}`,
    },
  }
}

const LOGS = Array.from({ length: 30 }).map((_, i) => ({
  id: 1000 - i,
  category: ['bans', 'kicks', 'warns', 'money', 'teleport', 'selfActions', 'serverActions'][i % 7],
  action: ['Ban', 'Kick', 'Warn', 'Give $5000', 'Goto', 'Noclip on', 'Weather -> RAIN'][i % 7],
  admin: person(i),
  target: i % 7 < 5 ? person(i + 2) : undefined,
  reason: i % 3 === 0 ? 'Rule violation' : undefined,
  time: Date.now() / 1000 - i * 240,
}))

const authorize = {
  allowed: true,
  self: {
    roleId: 'owner',
    label: 'Owner',
    color: '#f59e0b',
    power: 100,
    permissions: ['*'],
  },
  branding: { title: 'BZ ADMIN', tag: 'Admin Menu', subtitle: 'Server administration, refined.', accent: '#4f8cff' },
  tabs: [
    { id: 'dashboard', enabled: true }, { id: 'players', enabled: true },
    { id: 'self', enabled: true }, { id: 'vehicle', enabled: true },
    { id: 'world', enabled: true }, { id: 'teleport', enabled: true },
    { id: 'bans', enabled: true }, { id: 'logs', enabled: true },
    { id: 'developer', enabled: true },
  ],
  locations: [
    { label: 'Legion Square', coords: { x: 195, y: -933, z: 30 } },
    { label: 'Sandy Shores PD', coords: { x: 1853, y: 3689, z: 34 } },
    { label: 'Paleto Bay', coords: { x: -110, y: 6470, z: 31 } },
    { label: 'Mirror Park', coords: { x: 1166, y: -425, z: 67 } },
  ],
  weatherList: ['EXTRASUNNY', 'CLEAR', 'CLOUDS', 'OVERCAST', 'RAIN', 'THUNDER', 'SNOW', 'FOGGY', 'XMAS', 'HALLOWEEN'],
  framework: 'esx',
  allowConsole: true,
}

const dashboard = {
  online: PLAYERS.length, max: 64, staff: 2, uptime: 18432,
  framework: 'esx', serverName: 'BZ Roleplay | Serious RP', activeBans: BANS.filter((b) => b.active).length,
}

const rpcTable: Record<string, any> = {
  authorize,
  getPlayers: { players: PLAYERS, count: PLAYERS.length, max: 64 },
  getDashboard: dashboard,
  'ban.list': { bans: BANS },
  'logs.list': { logs: LOGS },
  'player.identifiers': (d: any) => ({
    ok: true,
    identifiers: PLAYERS.find((p) => p.id === d.target)?.identifiers ?? {},
    warns: [{ id: 'W1', reason: 'Minor RDM', admin: 'Marcus Reed', created: Date.now() / 1000 - 90000 }],
    notes: [{ note: 'Repeat offender — watch closely.', admin: 'Ava Lindqvist', created: Date.now() / 1000 - 50000 }],
  }),
  getVehicleList: { models: [] },
  gate: { ok: true },
}

export function mockResponse(callback: string, data: any): unknown {
  if (callback === 'rpc') {
    const { name, data: payload } = data as { name: string; data: any }
    const entry = rpcTable[name]
    const result = typeof entry === 'function' ? entry(payload) : entry ?? { ok: true }
    return { ok: true, result }
  }
  return { ok: true, result: { ok: true } }
}
