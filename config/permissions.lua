Config = Config or {}

-- `id` is just this role's INTERNAL name (owner/admin/moderator). It is NOT a
-- Discord ID — leave it alone. To grant the role to people, fill in ANY of the
-- fields below (a player matches if ANY of them do; highest power wins):
--   ace          -> add_ace group.admin bz.admin allow  (server.cfg)
--   discord.ids   = { '...' } -> a person's Discord USER id (one account)
--   discord.roles = { '...' } -> a Discord ROLE id (everyone with that role)
--                                (needs the bot token/guild in server/sv_config.lua)
--   identifiers   = { 'license:...' } -> raw FiveM license:/steam:/fivem:
--   groups        = { '...' } -> framework permission group (ESX/QB/etc, via the bridge)
Config.Permissions = {
    acePrefix = 'bz',

    roles = {
        {
            id    = 'moderator',
            label = 'Moderator',
            power = 10,
            color = '#22c55e',
            ace   = 'bz.moderator',
            discord = { ids = {}, roles = {} },
            groups = { 'mod', 'moderator', 'helper' },
            identifiers = {},
            permissions = {
                'menu.open', 'players.view', 'players.spectate', 'players.freeze',
                'players.warn', 'players.kick', 'players.goto', 'players.bring',
                'players.message', 'players.identifiers', 'players.note',
                'self.noclip', 'self.godmode', 'teleport.waypoint', 'teleport.back',
                'logs.view',
            },
        },
        {
            id    = 'admin',
            label = 'Administrator',
            power = 50,
            color = '#4f8cff',
            ace   = 'bz.admin',
            discord = { ids = {}, roles = {} },
            groups = { 'admin' },
            identifiers = {},
            permissions = {
                'menu.open', 'players.*', 'self.*', 'vehicle.*',
                'world.*', 'teleport.*', 'bans.view', 'bans.create',
                'bans.revoke', 'logs.view', 'money.give', 'money.remove',
            },
        },
        {
            id    = 'superadmin',
            label = 'Super Admin',
            power = 90,
            color = '#a855f7',
            ace   = 'bz.superadmin',
            discord = { ids = {}, roles = {} },
            groups = { 'superadmin' },
            identifiers = {},
            permissions = { '*' },
        },
        {
            id    = 'owner',                 -- internal name — leave as 'owner'
            label = 'Owner',
            power = 100,
            color = '#f59e0b',
            ace   = 'bz.owner',
            -- Give YOURSELF guaranteed access — fill in any one of these:
            discord = {
                ids   = {},                  -- e.g. { '326587451234567890' }  (your Discord user id)
                roles = {},                  -- e.g. { '112233445566778899' }  (a Discord role id)
            },
            identifiers = {},                -- e.g. { 'license:abc123...' }
            groups = { 'god', 'owner' },
            permissions = { '*' },
        },
    },

    catalog = {
        'menu.open',
        'players.view', 'players.spectate', 'players.freeze', 'players.warn',
        'players.kick', 'players.ban', 'players.heal', 'players.revive',
        'players.kill', 'players.teleport', 'players.bring', 'players.goto',
        'players.message', 'players.setjob', 'players.identifiers', 'players.note',
        'players.giveweapon',
        'money.give', 'money.remove', 'money.set',
        'self.noclip', 'self.godmode', 'self.invisible', 'self.infammo',
        'self.superjump', 'self.fastrun', 'self.heal', 'self.armor',
        'vehicle.spawn', 'vehicle.delete', 'vehicle.repair', 'vehicle.upgrade',
        'vehicle.plate', 'vehicle.boost',
        'world.weather', 'world.time', 'world.blackout', 'world.cleararea',
        'world.announce', 'world.clearchat',
        'teleport.waypoint', 'teleport.coords', 'teleport.saved', 'teleport.back',
        'bans.view', 'bans.create', 'bans.revoke',
        'logs.view', 'dev.coords', 'dev.entity', 'dev.weather', 'dev.console',
    },
}
