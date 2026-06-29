local DURATIONS = {
    ['2h']    = 2 * 3600,
    ['1d']    = 86400,
    ['3d']    = 3 * 86400,
    ['1w']    = 7 * 86400,
    ['2w']    = 14 * 86400,
    ['1mo']   = 30 * 86400,
    ['perma'] = 0,
}

BZ.RegisterRPC('ban.create', {
    perm = 'bans.create', targeted = true,
    handler = function(src, data, target)
        local reason   = BZ.Util.Sanitize(data.reason)
        if reason == '' then reason = 'Banned by an administrator' end
        local seconds  = tonumber(data.seconds) or DURATIONS[data.duration or 'perma'] or 0
        local expires  = seconds > 0 and (os.time() + seconds) or 0
        local id       = BZ.Util.ShortId(8)
        local ids      = Bridge.GetIdentifiers(target)
        local idList   = {}
        for k, v in pairs(ids) do if k ~= 'name' and k ~= 'ip' then idList[#idList + 1] = v end end

        BZ.DB.InsertBan({
            id = id, name = Bridge.GetName(target), identifiers = idList,
            reason = reason, admin = Bridge.GetName(src),
            admin_id = (ids.license or tostring(src)), created = os.time(), expires = expires,
        })

        BZ.Log.Action('bans', {
            admin = { name = Bridge.GetName(src), id = src },
            target = { name = Bridge.GetName(target), id = target },
            action = 'Ban', reason = reason,
            extra = { { name = 'Duration', value = BZ.Util.Duration(seconds), inline = true },
                      { name = 'Ban ID', value = id, inline = true } },
        })

        DropPlayer(target, BZ.Util.L('banned', reason, seconds > 0 and os.date('%Y-%m-%d %H:%M', expires) or BZ.Util.L('ban_perma'), id))
        Bridge.Notify(src, BZ.Util.L('ban_created', id, Bridge.GetName(target)), 'success')
        return { ok = true, id = id }
    end,
})

BZ.RegisterRPC('ban.createOffline', {
    perm = 'bans.create',
    handler = function(src, data)
        local identifier = BZ.Util.Sanitize(data.identifier, 64)
        if identifier == '' then return { ok = false } end
        local reason = BZ.Util.Sanitize(data.reason)
        if reason == '' then reason = 'Banned by an administrator' end
        local name = BZ.Util.Sanitize(data.name, 100)
        if name == '' then name = 'Offline' end
        local seconds = tonumber(data.seconds) or DURATIONS[data.duration or 'perma'] or 0
        local id = BZ.Util.ShortId(8)
        BZ.DB.InsertBan({
            id = id, name = name, identifiers = { identifier },
            reason = reason, admin = Bridge.GetName(src), admin_id = tostring(src),
            created = os.time(), expires = seconds > 0 and (os.time() + seconds) or 0,
        })
        BZ.Log.Action('bans', { admin = { name = Bridge.GetName(src), id = src },
            action = 'Offline Ban', reason = reason,
            extra = { { name = 'Identifier', value = identifier, inline = false } } })
        return { ok = true, id = id }
    end,
})

BZ.RegisterRPC('ban.list', {
    perm = 'bans.view',
    handler = function(src, data)
        local bans = BZ.DB.GetBans(data and data.activeOnly)
        local out = {}
        for _, b in ipairs(bans) do
            out[#out + 1] = {
                id = b.id, name = b.name, reason = b.reason, admin = b.admin,
                created = b.created, expires = b.expires, active = b.active ~= false,
                identifiers = b.identifiers,
                expiresLabel = (b.expires and b.expires > 0) and os.date('%Y-%m-%d %H:%M', b.expires) or 'Permanent',
            }
        end
        return { bans = out }
    end,
})

BZ.RegisterRPC('ban.revoke', {
    perm = 'bans.revoke',
    handler = function(src, data)
        if not data.id then return { ok = false } end
        BZ.DB.RevokeBan(data.id)
        BZ.Log.Action('bans', { admin = { name = Bridge.GetName(src), id = src },
            action = 'Unban', extra = { { name = 'Ban ID', value = data.id, inline = true } } })
        Bridge.Notify(src, BZ.Util.L('ban_revoked', data.id), 'success')
        return { ok = true }
    end,
})

AddEventHandler('playerConnecting', function(name, setKick, deferrals)
    local src = source
    local ids = {}
    for i = 0, GetNumPlayerIdentifiers(src) - 1 do ids[#ids + 1] = GetPlayerIdentifier(src, i) end

    deferrals.defer()
    Wait(0)
    deferrals.update(('[bz-admin] Checking %s...'):format(name))

    local ban = BZ.DB.FindActiveBan(ids)
    if ban then
        local expires = (ban.expires and ban.expires > 0) and os.date('%Y-%m-%d %H:%M', ban.expires) or BZ.Util.L('ban_perma')
        deferrals.done(('\n[bz-admin] You are banned.\nReason: %s\nExpires: %s\nBan ID: %s')
            :format(ban.reason or '-', expires, ban.id or '-'))
        BZ.Log.Discord('connections', {
            title = 'Blocked banned connection',
            description = ('**%s** tried to connect (Ban `%s`).'):format(name, ban.id),
        })
        return
    end
    deferrals.done()
end)
