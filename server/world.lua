local function broadcast(meta, action)
    BZ.Log.Action('serverActions', {
        admin = { name = Bridge.GetName(meta), id = meta }, action = action,
    })
end

BZ.RegisterRPC('world.weather', {
    perm = 'world.weather',
    handler = function(src, data)
        local valid = false
        for _, w in ipairs(Config.Weather) do if w == data.weather then valid = true break end end
        if not valid then return { ok = false } end
        TriggerClientEvent('bz-admin:client:setWeather', -1, data.weather)
        broadcast(src, 'Weather -> ' .. data.weather)
        return { ok = true }
    end,
})

BZ.RegisterRPC('world.time', {
    perm = 'world.time',
    handler = function(src, data)
        local h = math.floor(BZ.Util.Clamp(data.hour, 0, 23))
        local m = math.floor(BZ.Util.Clamp(data.minute or 0, 0, 59))
        TriggerClientEvent('bz-admin:client:setTime', -1, h, m, data.freeze == true)
        broadcast(src, ('Time -> %02d:%02d'):format(h, m))
        return { ok = true }
    end,
})

BZ.RegisterRPC('world.blackout', {
    perm = 'world.blackout',
    handler = function(src, data)
        TriggerClientEvent('bz-admin:client:setBlackout', -1, data.value == true)
        broadcast(src, 'Blackout ' .. (data.value and 'ON' or 'OFF'))
        return { ok = true, value = data.value == true }
    end,
})

BZ.RegisterRPC('world.announce', {
    perm = 'world.announce',
    handler = function(src, data)
        local message = BZ.Util.Sanitize(data.message, 300)
        if message == '' then return { ok = false } end
        local title = BZ.Util.Sanitize(data.title, 60)
        if title == '' then title = BZ.Util.L('announce_title') end
        TriggerClientEvent('bz-admin:client:announce', -1, { title = title, message = message })
        BZ.Log.Action('serverActions', { admin = { name = Bridge.GetName(src), id = src },
            action = 'Announcement', reason = message })
        return { ok = true }
    end,
})

BZ.RegisterRPC('world.clearchat', {
    perm = 'world.clearchat',
    handler = function(src)
        TriggerClientEvent('chat:clear', -1)
        broadcast(src, 'Clear chat')
        return { ok = true }
    end,
})

BZ.RegisterRPC('world.cleararea', {
    perm = 'world.cleararea',
    handler = function(src, data)
        local ped = GetPlayerPed(src)
        local c = GetEntityCoords(ped)
        local radius = BZ.Util.Clamp(data.radius or 100, 1.0, 500.0)
        TriggerClientEvent('bz-admin:client:clearArea', -1, { x = c.x, y = c.y, z = c.z }, radius)
        broadcast(src, 'Clear area')
        return { ok = true }
    end,
})
