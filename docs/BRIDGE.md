# bz-admin — Framework Bridge Guide

The bridge is what makes bz-admin framework-agnostic. This document explains how it works and how to add support for **any** framework — including a private/custom one — without touching the core.

> The bridge (`bridge/`) is **MIT-licensed**. Build adapters, ship them, share them.

---

## How it works

1. Every framework is a self-contained **adapter** registered with `Bridge.Register(name, spec)`.
2. On start, the core **resolves one adapter**:
   - if `Config.Framework` is a specific name, that adapter is used;
   - if it's `'auto'`, the highest-`priority` adapter whose `detect()` returns truthy wins;
   - if nothing detects, the **standalone** adapter is used.
3. The rest of the resource only ever calls the stable facade (`Bridge.GetPlayer`, `Bridge.Notify`, …). Each facade method delegates to your adapter and **falls back to standalone** for anything you don't implement.

That last point matters: **every method is optional.** A minimal adapter can be just `detect` + `getGroup`.

---

## Anatomy of an adapter

Create `bridge/frameworks/<name>.lua`:

```lua
Bridge.Register('myframework', {
    priority  = 50,                 -- higher wins auto-detect ties
    detect    = function() return GetResourceState('my-core') == 'started' end,
    getObject = function() return exports['my-core']:GetCore() end, -- cached as Bridge.Object

    server = {
        getPlayer      = function(src) ... end,   -- normalized player table (see below)
        getPlayers     = function() ... end,       -- array of normalized players
        getIdentifiers = function(src) ... end,    -- { license=, discord=, steam=, ip= }
        getName        = function(src) ... end,
        getJob         = function(src) ... end,
        setJob         = function(src, job, grade) ... end,
        getMoney       = function(src, account) ... end,
        addMoney       = function(src, account, amount, reason) ... end,
        removeMoney    = function(src, account, amount, reason) ... end,
        getGroup       = function(src) ... end,    -- 'admin' | 'mod' | 'user' | ...
        jobs           = function() ... end,        -- array: { {name,label,grades={{grade,label}}} }
        notify         = function(src, msg, type) ... end, -- return true if handled
    },

    client = {
        getPlayerData  = function() ... end,
        notify         = function(msg, type) ... end,      -- return true if handled
    },
})
```

That's it. Drop the file in `bridge/frameworks/` — the manifest already globs it (`bridge/frameworks/*.lua`) on both client and server.

---

## The normalized player table

`getPlayer(src)` must return this shape (fill what you can; the rest can be `nil`):

```lua
{
    id    = 3,                                 -- server id
    name  = 'John Doe',                        -- character or account name
    cid   = 'ABC12345',                        -- citizen/character id (optional)
    job   = {
        name = 'police', label = 'Police',
        grade = 4, gradeLabel = 'Sergeant', onDuty = true,
    },
    money = { cash = 500, bank = 12000 },      -- any accounts you support
    group = 'admin',                           -- framework permission group
    identifiers = { license = 'license:..', discord = 'discord:..' },
}
```

The UI and permission system read from these fields, so the closer you map them, the richer the experience.

---

## Permissions & `getGroup`

bz-admin resolves a player's role from three signals (first match, highest power wins):

1. **ACE** — `IsPlayerAceAllowed(src, role.ace)`
2. **Identifiers** — hard-coded list in `config/permissions.lua`
3. **Framework group** — the string your `getGroup(src)` returns, matched against each role's `groups = { ... }`

So your adapter's only *required* permission contribution is a sensible `getGroup`. Map your framework's admin tiers onto strings like `owner`, `superadmin`, `admin`, `moderator`, `user`, and wire those names into the roles in `config/permissions.lua`.

---

## Notifications

`notify` should **return `true`** when it handled the notification. Return `nil`/`false` (or omit the method) to let bz-admin fall back to its own NUI toast. This is how standalone servers still get nice notifications.

---

## Minimal example (group-only adapter)

```lua
-- bridge/frameworks/mycustom.lua
Bridge.Register('mycustom', {
    priority = 30,
    detect   = function() return GetResourceState('my-perms') == 'started' end,
    server = {
        getGroup = function(src)
            return exports['my-perms']:GetRank(src) or 'user'
        end,
    },
})
```

With just this, bz-admin will detect your framework, resolve roles from your rank system, and use native player/identifier APIs (via the standalone fallback) for everything else.

---

## Testing your adapter

1. Set `Config.Framework = 'mycustom'` (or leave `'auto'`).
2. Start the resource and check the console:
   ```
   [bz-admin] INFO  Bridge resolved framework: mycustom
   ```
3. Open the menu — the framework badge in the header should show your adapter name.
4. Verify a couple of round-trips: a player's job/money in the detail drawer, and a notification.

---

## API reference (facade)

These are the stable functions the rest of the codebase calls. You override the underlying handlers; you rarely call these directly from an adapter.

**Server**
`Bridge.GetPlayer(src)`, `Bridge.GetPlayers()`, `Bridge.GetIdentifiers(src)`, `Bridge.GetName(src)`, `Bridge.GetJob(src)`, `Bridge.SetJob(src, job, grade)`, `Bridge.GetMoney(src, account)`, `Bridge.AddMoney(src, account, amount, reason)`, `Bridge.RemoveMoney(src, account, amount, reason)`, `Bridge.GetGroup(src)`, `Bridge.GetJobs()`, `Bridge.Notify(src, msg, type)`

**Client**
`Bridge.GetPlayerData()`, `Bridge.Notify(msg, type)`

**Shared**
`Bridge.Name` (resolved adapter), `Bridge.Object` (framework core), `Bridge.ResourceStarted(name)`
