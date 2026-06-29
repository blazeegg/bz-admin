BZ = BZ or {}
BZ.Log = {}

local COLORS = {
    bans          = 15158332,
    kicks         = 15105570,
    warns         = 16776960,
    money         = 5763719,
    teleport      = 3447003,
    selfActions   = 10181046,
    serverActions = 3066993,
    connections   = 9807270,
    default       = 5198940,
}

function BZ.Log.Print(level, msg)
    local lvl = ({
        info = '^2INFO ^7', warn = '^3WARN ^7', error = '^1ERROR^7', debug = '^6DEBUG^7',
    })[level] or '^7'
    print('^5[bz-admin]^7 ' .. lvl .. ' ' .. tostring(msg))
end

if not IsDuplicityVersion() then return end

function BZ.Log.Discord(category, data)
    if not (Config.Logs and Config.Logs.enabled) then return end
    local hooks = ServerConfig and ServerConfig.Webhooks or {}
    local url = (hooks[category] and hooks[category] ~= '' and hooks[category]) or hooks.default
    if not url or url == '' then return end

    PerformHttpRequest(url, function() end, 'POST', json.encode({
        username   = Config.Logs.botName or 'bz-admin',
        avatar_url = Config.Logs.botAvatar ~= '' and Config.Logs.botAvatar or nil,
        embeds = { {
            title       = data.title or 'bz-admin',
            description = data.description or '',
            color       = data.color or COLORS[category] or COLORS.default,
            fields      = data.fields or {},
            footer      = { text = ('bz-admin • %s'):format(os.date('%Y-%m-%d %H:%M:%S')) },
        } },
    }), { ['Content-Type'] = 'application/json' })
end

function BZ.Log.Action(category, opts)
    local fields = {}
    if opts.admin then
        fields[#fields + 1] = { name = 'Admin', value = ('%s `(%s)`'):format(opts.admin.name or '?', opts.admin.id or '?'), inline = true }
    end
    if opts.target then
        fields[#fields + 1] = { name = 'Target', value = ('%s `(%s)`'):format(opts.target.name or '?', opts.target.id or '?'), inline = true }
    end
    if opts.action then
        fields[#fields + 1] = { name = 'Action', value = opts.action, inline = true }
    end
    if opts.reason and opts.reason ~= '' then
        fields[#fields + 1] = { name = 'Reason', value = opts.reason, inline = false }
    end
    for _, f in ipairs(opts.extra or {}) do fields[#fields + 1] = f end

    BZ.Log.Discord(category, {
        title  = opts.title or ('bz-admin • ' .. (opts.action or 'action')),
        fields = fields,
    })
    BZ.Log.Print('info', ('%s %s'):format(opts.action or 'action',
        opts.target and ('-> ' .. (opts.target.name or '')) or ''))

    if BZ.Log.Record then BZ.Log.Record(category, opts) end
end
