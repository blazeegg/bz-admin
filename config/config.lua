Config = Config or {}

Config.Command   = 'admin'          -- chat command to open the menu
Config.OpenKey   = 'F6'             -- default keybind (rebindable in GTA settings)
Config.Suggestion = true

-- 'auto' | 'standalone' | 'esx' | 'qb' | 'qbox' | 'nd' | 'ox' | <resource name>
Config.Framework = 'auto'

-- true = oxmysql, false = KVP JSON (no database required)
Config.Database  = true

Config.Locale    = 'en'

Config.SecureMode      = true       -- re-validate every privileged action server-side
Config.RateLimit       = 12         -- max admin actions per player per 10s
Config.LogClientErrors = true       -- forward NUI errors to the server console
Config.MaxTextLength   = 200        -- cap for reasons / messages / notes
Config.ShowIPs         = false      -- include player IPs in the menu & logs (privacy)
Config.AllowServerConsole = false   -- enable the Developer-tab server console.
                                    -- This runs arbitrary server commands (owner-tier
                                    -- only) — keep it off unless you really need it.

-- Webhooks and the Discord bot token live in server/sv_config.lua (server-only).
Config.Logs = {
    enabled   = true,
    botName   = 'bz-admin',
    botAvatar = '',
}

Config.Self = {
    -- Use txAdmin's built-in noclip instead of the built-in one. Requires
    -- txAdmin (the `monitor` resource) running, its menu enabled, and the
    -- admin to be a txAdmin admin. Falls back to the built-in noclip if
    -- txAdmin isn't present.
    useTxAdminNoclip = false,

    noclipSpeed    = 1.0,
    godmodeArmor   = true,
    superJumpForce = 10.0,
    runSpeed       = 1.49,
    swimSpeed      = 1.49,
}

Config.Vehicles = {
    deletePrevious    = true,
    warpIntoSpawned   = true,
    defaultPlate      = 'BZADMIN',
    maxUpgradeOnSpawn = false,
}

Config.Weather = {
    'EXTRASUNNY', 'CLEAR', 'CLOUDS', 'OVERCAST', 'RAIN',
    'THUNDER', 'CLEARING', 'NEUTRAL', 'SNOW', 'BLIZZARD',
    'SNOWLIGHT', 'XMAS', 'HALLOWEEN', 'FOGGY',
}

Config.Locations = {
    { label = 'Legion Square',   coords = vec3(195.17, -933.77, 30.69) },
    { label = 'Sandy Shores PD', coords = vec3(1853.18, 3689.59, 34.27) },
    { label = 'Paleto Bay',      coords = vec3(-110.0, 6470.0, 31.62) },
    { label = 'Mirror Park',     coords = vec3(1166.0, -425.0, 67.0) },
    { label = 'Airport',         coords = vec3(-1037.0, -2737.0, 20.17) },
    { label = 'Mount Chiliad',   coords = vec3(450.53, 5566.45, 781.18) },
}

-- Order here = order in the sidebar.
Config.Tabs = {
    { id = 'dashboard', enabled = true },
    { id = 'players',   enabled = true },
    { id = 'self',      enabled = true },
    { id = 'vehicle',   enabled = true },
    { id = 'world',     enabled = true },
    { id = 'teleport',  enabled = true },
    { id = 'bans',      enabled = true },
    { id = 'logs',      enabled = true },
    { id = 'developer', enabled = true },
}

Config.Branding = {
    title    = 'BZ ADMIN',          -- top-left big wordmark
    tag      = 'Admin Menu',        -- top-left small line under the title
    icon     = '',                  -- top-left square mark; image URL, empty = shield icon
    subtitle = 'Server administration, refined.',
    accent   = '#4f8cff',           -- whole UI re-themes to this colour
    logoUrl  = '',                  -- top-right logo; image URL, empty = framework badge only
}
