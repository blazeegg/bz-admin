CreateThread(function()
    Bridge.Resolve()
end)

function Bridge.GetPlayer(src)
    local p = Bridge.Call('getPlayer', src)
    if p then return p end
    if GetPlayerName(src) == nil then return nil end
    return {
        id          = src,
        name        = GetPlayerName(src) or ('Player %s'):format(src),
        cid         = nil,
        job         = { name = 'unemployed', label = 'Civilian', grade = 0, gradeLabel = '', onDuty = true },
        money       = {},
        group       = Bridge.GetGroup(src),
        identifiers = Bridge.GetIdentifiers(src),
    }
end

function Bridge.GetPlayers()
    local list = Bridge.Call('getPlayers')
    if list then return list end
    local out = {}
    for _, src in ipairs(GetPlayers()) do
        local p = Bridge.GetPlayer(tonumber(src))
        if p then out[#out + 1] = p end
    end
    return out
end

function Bridge.GetIdentifiers(src)
    local custom = Bridge.Call('getIdentifiers', src)
    if custom then return custom end
    local ids = {}
    for i = 0, GetNumPlayerIdentifiers(src) - 1 do
        local id = GetPlayerIdentifier(src, i)
        if id then
            local kind = id:match('^(%w+):')
            if kind then ids[kind] = id end
        end
    end
    ids.name = GetPlayerName(src)
    return ids
end

function Bridge.GetName(src)
    return Bridge.Call('getName', src) or GetPlayerName(src) or ('Player %s'):format(src)
end

function Bridge.GetJob(src)
    return Bridge.Call('getJob', src)
        or { name = 'unemployed', label = 'Civilian', grade = 0, gradeLabel = '', onDuty = true }
end

function Bridge.SetJob(src, job, grade)
    return Bridge.Call('setJob', src, job, grade)
end

function Bridge.GetMoney(src, account)
    return Bridge.Call('getMoney', src, account) or 0
end

function Bridge.AddMoney(src, account, amount, reason)
    return Bridge.Call('addMoney', src, account, amount, reason)
end

function Bridge.RemoveMoney(src, account, amount, reason)
    return Bridge.Call('removeMoney', src, account, amount, reason)
end

function Bridge.GetGroup(src)
    return Bridge.Call('getGroup', src) or 'user'
end

function Bridge.GetJobs()
    return Bridge.Call('jobs') or {}
end

function Bridge.Notify(src, msg, type)
    local handled = Bridge.Call('notify', src, msg, type)
    if handled == nil then
        TriggerClientEvent('bz-admin:client:notify', src, { message = msg, type = type or 'info' })
    end
end
