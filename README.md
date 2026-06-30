# bz-admin

A premium, framework-agnostic admin menu for FiveM — built with **React + TailwindCSS**, backed by a clean Lua core and an **open-source framework bridge** so it runs anywhere and anyone can adapt it to their own framework.

![version](https://img.shields.io/badge/version-1.0.0-4f8cff) ![frameworks](https://img.shields.io/badge/frameworks-ESX%20%7C%20QBCore%20%7C%20Qbox%20%7C%20ND%20%7C%20Standalone-22c55e) ![ui](https://img.shields.io/badge/UI-React%20%2B%20Tailwind-38bdf8)

---

<img width="1559" height="1009" alt="bzadmin" src="https://github.com/user-attachments/assets/ad545bb0-a88f-4186-99f5-0154142dcb81" />


## ✨ Highlights

- **Works with any framework** — auto-detects ESX, QBCore, Qbox, ND, or runs fully **standalone**. No framework? No problem.
- **Open bridge** — add support for *your* framework by dropping a single file in `bridge/frameworks/`. No core edits. ([guide](docs/BRIDGE.md))
- **Beautiful, hand-crafted UI** — React + Tailwind + Framer Motion. Dark, fast, premium typography, fully re-brandable accent + logo.
- **Database optional** — uses oxmysql if present, otherwise a built-in KVP JSON store. Boots even with no database at all.
- **Logging** — Discord webhooks **and** an in-menu live log that shows the Discord name/ID of the admin and the Discord name + FiveM license of the target, click-to-copy.

## 📋 Requirements

| | |
| --- | --- |
| **FiveM server** | Any recent artifact |
| **OneSync** | **Required** (server-side player coordinates for goto / bring / spectate) |
| **oxmysql** | *Optional* — only for persistent bans / warns / notes. Without it, a built-in JSON store is used. |
| **Node.js 18+** | *Optional* — only if you want to rebuild the UI. The UI ships pre-built. |

## 🧩 Features

| Area | What you get |
| --- | --- |
| **Dashboard** | Live player / staff / ban counts, uptime, quick actions, instant announcements |
| **Players** | Searchable list + detail drawer: heal, revive, kill, freeze, spectate, goto, bring, warn, kick, ban, DM, set job, give/remove money, identifiers, warnings & staff notes |
| **Self** | Noclip (WASD · Q up · E down · Shift fast · Alt slow), godmode, invisible, infinite ammo, super jump, fast run, full heal, max armor |
| **Vehicle** | Spawn by name or quick-pick, repair, max-upgrade, boost, delete, set plate |
| **World** | Weather, time (with freeze), blackout, clear area, clear chat, server announcements |
| **Teleport** | Waypoint, saved locations, exact coordinates, teleport back |
| **Bans** | Searchable ban list, online & offline bans with durations, one-click revoke, connection-time enforcement |
| **Logs** | Real-time filterable action history with full Discord/license identity, click any field to copy |
| **Developer** | Live coordinate read-out (copy as `vec4`), entity inspector, and an *opt-in* server console |

---

## 🚀 Quick start

1. Drop the `bz-admin` folder into your server's `resources/`.
2. Add to your `server.cfg`:
   ```cfg
   ensure bz-admin
   ```
3. Give yourself access (see below).
4. Open with **`/admin`** or press **F6** (rebindable in GTA → Settings → Key Bindings).

The UI is **pre-built**, so there is nothing to compile — it just works.

## 🔑 Giving yourself access

Open `config/permissions.lua`. A player gets a role if **any** of these match (highest power wins). Pick whichever is easiest for you:

```lua
{
    id    = 'owner',                 -- internal name — leave it
    -- ...
    ace   = 'bz.owner',              -- 1) ACE:        add_ace ... bz.owner allow
    discord = {
        ids   = { '326587451234567890' },  -- 2) your Discord USER id
        roles = { '112233445566778899' },  -- 3) a Discord ROLE id (needs the bot, below)
    },
    identifiers = { 'license:abc123...' }, -- 4) your FiveM license
    groups = { 'god', 'owner' },           -- 5) framework group (ESX/QB admin, etc.)
}
```

- **Enable Developer Mode** in Discord (Settings → Advanced) to copy a User ID or Role ID (right-click → Copy ID).
- Find your **license** in txAdmin's player list, or by running `getplayeridentifiers` in console.

### Discord-role permissions (optional)
To use `discord.roles`, create a bot, invite it to your server, and paste its token + your guild (server) ID into `server/sv_config.lua`:
```lua
ServerConfig.Discord = {
    token = 'YOUR_BOT_TOKEN',
    guild = 'YOUR_GUILD_ID',
}
```
The bot only needs to read guild members. Roles (and the Discord names shown in logs) are fetched on join and cached for 5 minutes. Without the bot, the other four methods still work.

---

## ⚙️ Configuration

Three files, all heavily commented. **Full walkthrough: [docs/CONFIGURATION.md](docs/CONFIGURATION.md).**

| File | What you set |
| --- | --- |
| `config/config.lua` | Command/keybind, framework, database on/off, security options, branding (title · tag · accent · logo), self/vehicle defaults, weather list, saved teleports, which tabs show |
| `config/permissions.lua` | Roles, power tiers, and the ACE / Discord / identifier / group that grants each |
| `server/sv_config.lua` | **Server-only secrets** — Discord webhooks + bot token/guild (never reach the client) |
| `config/locales/` | Translatable text |

Re-brand in seconds:
```lua
Config.Branding = {
    title  = 'BZ ADMIN',     -- top-left wordmark
    tag    = 'Admin Menu',   -- small line under it
    icon   = '',             -- top-left logo image URL (empty = shield)
    accent = '#4f8cff',      -- the whole UI re-themes to this colour
}
```

### Discord webhooks (logging)
Paste your webhook URLs in `server/sv_config.lua`. Set `default` to reuse one for everything, or give each category its own:
```lua
ServerConfig.Webhooks = {
    default = 'https://discord.com/api/webhooks/...',
    bans    = '',  -- empty = uses default
}
```

---

## 🌉 Framework Bridge

bz-admin never calls a framework directly. It talks to a **bridge** that resolves exactly one adapter at runtime. Supported out of the box: **ESX, QBCore, Qbox, ND, Standalone**.

Adding your own framework is a single file and zero core changes — see **[docs/BRIDGE.md](docs/BRIDGE.md)**. The bridge is intentionally MIT-licensed so the community can extend it freely.

---

## 🎨 Customising the UI (optional)

```bash
cd web
npm install
npm run dev      # live dev server with mock data (no game needed)
npm run build    # outputs to web/build, which the resource serves
```

The UI is plain React + Tailwind — components live in `web/src/components`, design tokens in `web/tailwind.config.js` and `web/src/index.css`. **After editing, always run `npm run build`** — the resource serves `web/build`, not the source.

---

## 🔐 Security model

- Opening the menu and **every** action are authorized server-side; the client is never trusted.
- Actions are rate-limited per player (`Config.RateLimit`).
- Targeted actions enforce a strict rank check — you cannot act on an equal or higher role.
- All free text (reasons, messages, notes, announcements) is trimmed, stripped of control characters and length-capped (`Config.MaxTextLength`).
- Player **IPs are hidden** from the menu and logs unless you set `Config.ShowIPs = true`.
- The Developer **server console is disabled by default** (`Config.AllowServerConsole`) — it runs arbitrary commands, so it's opt-in and owner-tier only, with a destructive-command blocklist.
- **Secrets stay server-side.** Webhooks and the Discord bot token/guild live in `server/sv_config.lua`, a server-only script — never sent to the NUI/client.

---

## 🧰 Troubleshooting

| Symptom | Fix |
| --- | --- |
| **Persistent grey screen** covering the game | Old cached UI — restart the resource and clear the FiveM NUI cache (delete `FiveM/data/cache/browser`). The current build is fully transparent. |
| **`/admin` says no permission** | You haven't matched a role in `config/permissions.lua`. Add your license / Discord ID / ACE (see *Giving yourself access*). |
| **Framework shows "standalone"** | Set `Config.Framework` explicitly (e.g. `'esx'`) instead of `'auto'`, and make sure your core resource started **before** bz-admin. |
| **Bans don't persist after restart** | Set `Config.Database = true` and ensure `oxmysql` is running. |
| **Discord names/roles not showing** | Set the bot `token` + `guild` in `server/sv_config.lua`; the bot must be a member of your guild. |
| **Server console does nothing** | It's off by default — set `Config.AllowServerConsole = true`. |

---

## 📄 License

The **framework bridge** (`bridge/`) is released under the **MIT License** (see `bridge/LICENSE`) so anyone can build and share adapters. The rest of bz-admin is a commercial product — see `LICENSE`. Author: **Blazeeot**.
