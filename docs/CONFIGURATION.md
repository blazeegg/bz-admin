# bz-admin — Configuration Guide

Everything is in three files. You never need to touch the Lua logic or rebuild anything — just edit values.

- [`config/config.lua`](#1-configconfiglua) — general settings, security, branding
- [`config/permissions.lua`](#2-configpermissionslua) — who can do what
- [`server/sv_config.lua`](#3-serversv_configlua) — secrets (webhooks + Discord bot)

After editing any of these, run `restart bz-admin` in your server console.

---

## 1. `config/config.lua`

### General
```lua
Config.Command    = 'admin'   -- the chat command that opens the menu
Config.OpenKey    = 'F6'      -- default keybind (players can rebind in GTA settings)
Config.Suggestion = true      -- show /admin in the chat suggestion list
Config.Framework  = 'auto'    -- 'auto' detects your framework. Force it with
                              -- 'esx' | 'qb' | 'qbox' | 'nd' | 'standalone'
Config.Database   = true      -- true = save bans/warns/notes with oxmysql
                              -- false = use a built-in JSON file (no database needed)
Config.Locale     = 'en'      -- language file from config/locales/
```

### Security (sensible defaults — leave these unless you know why)
```lua
Config.SecureMode         = true   -- re-check every action on the server
Config.RateLimit          = 12     -- max actions per player per 10 seconds
Config.LogClientErrors    = true   -- print NUI errors to the server console
Config.MaxTextLength      = 200    -- max length for reasons / messages / notes
Config.ShowIPs            = false  -- show player IPs in the menu & logs?
Config.AllowServerConsole = false  -- enable the Developer-tab server console.
                                   -- It runs ANY server command (owner only) — keep
                                   -- off unless you really need it.
```

### Branding — make it yours
```lua
Config.Branding = {
    title  = 'BZ ADMIN',     -- big wordmark, top-left
    tag    = 'Admin Menu',   -- small line under the title ('' to hide it)
    icon   = '',             -- top-left logo: an image URL, or '' for the shield
    accent = '#4f8cff',      -- ONE colour that re-themes the whole UI
    logoUrl = '',            -- optional top-right logo image URL
}
```
> Tip: `accent` drives every highlight, button and active state. Change just this one value to recolour the entire menu.

### Self / vehicle defaults
```lua
Config.Self = {
    useTxAdminNoclip = false,  -- use txAdmin's noclip instead of the built-in one
    noclipSpeed      = 1.0,    -- base noclip fly speed
    godmodeArmor     = true,   -- godmode also tops up armor
    runSpeed         = 1.49,   -- fast-run multiplier
}

Config.Vehicles = {
    deletePrevious    = true,        -- delete your last spawned car when spawning a new one
    warpIntoSpawned   = true,        -- put you in the driver seat
    defaultPlate      = 'BZADMIN',
    maxUpgradeOnSpawn = false,       -- fully upgrade spawned cars automatically
}
```

### Lists you can edit freely
```lua
Config.Weather   = { 'EXTRASUNNY', 'CLEAR', ... }   -- options shown in the World tab
Config.Locations = {                                -- shown in the Teleport tab
    { label = 'Legion Square', coords = vec3(195.17, -933.77, 30.69) },
    -- add your own:
    { label = 'My Spot',       coords = vec3(0.0, 0.0, 72.0) },
}
```

### Show / hide / reorder tabs
The order here = the order in the sidebar. Set `enabled = false` to hide one.
```lua
Config.Tabs = {
    { id = 'dashboard', enabled = true },
    { id = 'players',   enabled = true },
    { id = 'developer', enabled = false },  -- example: hide the developer tab
}
```

---

## 2. `config/permissions.lua`

A **role** is a rank (moderator → admin → superadmin → owner). A player gets a role if **any** of its access fields match. The highest-`power` matching role wins, and an admin can only act on players with **lower** power than themselves.

```lua
{
    id    = 'admin',          -- internal name — don't change for the built-in roles
    label = 'Administrator',  -- shown in the UI
    power = 50,               -- higher = outranks lower
    color = '#4f8cff',        -- badge colour

    -- ANY of these grants the role:
    ace         = 'bz.admin',                 -- add_ace <principal> bz.admin allow
    discord     = { ids = {}, roles = {} },   -- Discord USER ids / ROLE ids
    identifiers = {},                         -- { 'license:...', 'steam:...' }
    groups      = { 'admin' },                -- framework groups (ESX/QB/etc.)

    permissions = { 'players.*', 'self.*', ... },  -- what this role can do
}
```

### Permissions
- Use a full key like `players.kick`, or a wildcard like `players.*` (all player actions), or `*` (everything).
- The complete list of keys is the `catalog` at the bottom of the file.
- The UI automatically hides any tab/button the player has no permission for.

### Common recipes
```lua
-- Make a trial-mod that can only spectate and warn:
permissions = { 'menu.open', 'players.view', 'players.spectate', 'players.warn' }

-- Give admins everything except the developer tools:
permissions = { 'menu.open', 'players.*', 'self.*', 'vehicle.*', 'world.*',
                'teleport.*', 'bans.*', 'logs.view', 'money.give', 'money.remove' }
```

### Add a brand-new role
Copy any role block, give it a unique `id`, a `power` between two existing roles, and its own access + permissions. Done — no code changes.

---

## 3. `server/sv_config.lua`

This file is **server-only** and never sent to players. Put your secrets here.

### Webhooks
```lua
ServerConfig.Webhooks = {
    default = 'https://discord.com/api/webhooks/xxx/yyy',  -- used for everything…
    bans    = '',   -- …unless a category has its own URL (empty = use default)
    kicks   = '',
    warns   = '',
}
```
Leave a webhook empty to disable that category. Leave **all** empty to disable Discord logging (the in-menu Logs tab still works).

### Discord bot (optional — for Discord-role perms + names in logs)
```lua
ServerConfig.Discord = {
    token = '',   -- your bot token
    guild = '',   -- your server (guild) id
}
```

---

## Translations

Copy `config/locales/en.lua` to e.g. `config/locales/fr.lua`, translate the values, then set `Config.Locale = 'fr'`. Missing keys fall back to English.

---

That's everything. If something isn't behaving, check the **Troubleshooting** table in the [README](../README.md).
