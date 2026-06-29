BZ = BZ or {}
BZ.Rpc = {}

function BZ.RegisterRPC(name, opts)
    BZ.Rpc[name] = opts
end

local buckets = {}
local function rateOk(src)
    local now = GetGameTimer()
    local b = buckets[src]
    if not b then b = {}; buckets[src] = b end
    local i = 1
    while i <= #b do
        if now - b[i] > 10000 then table.remove(b, i) else i = i + 1 end
    end
    if #b >= (Config.RateLimit or 12) then return false end
    b[#b + 1] = now
    return true
end

AddEventHandler('playerDropped', function() buckets[source] = nil end)

local function respond(src, token, ok, payload)
    TriggerClientEvent('bz-admin:rpc:response', src, token, ok, payload)
end

RegisterNetEvent('bz-admin:rpc:request', function(token, name, data)
    local src = source
    data = data or {}
    local def = BZ.Rpc[name]

    if not def then return respond(src, token, false, { error = 'unknown_action' }) end

    if name ~= 'authorize' and not BZ.Perms.IsAdmin(src) then
        return respond(src, token, false, { error = 'no_permission' })
    end

    if Config.SecureMode and not rateOk(src) then
        Bridge.Notify(src, BZ.Util.L('rate_limited'), 'error')
        return respond(src, token, false, { error = 'rate_limited' })
    end

    if def.perm and not BZ.Perms.Has(src, def.perm) then
        Bridge.Notify(src, BZ.Util.L('no_permission'), 'error')
        return respond(src, token, false, { error = 'no_permission' })
    end

    local target
    if def.targeted then
        target = tonumber(data.target)
        if not target or GetPlayerName(target) == nil then
            return respond(src, token, false, { error = 'player_not_found' })
        end
        if not BZ.Perms.CanTarget(src, target) then
            Bridge.Notify(src, BZ.Util.L('target_immune'), 'error')
            return respond(src, token, false, { error = 'target_immune' })
        end
    end

    local ok, result = pcall(def.handler, src, data, target)
    if not ok then
        BZ.Log.Print('error', ('RPC %s failed: %s'):format(name, result))
        return respond(src, token, false, { error = 'internal_error' })
    end
    respond(src, token, true, result)
end)

BZ.RegisterRPC('authorize', {
    handler = function(src)
        local summary = BZ.Perms.Summary(src)
        if not summary or not BZ.Perms.Has(src, 'menu.open') then
            return { allowed = false }
        end
        return {
            allowed      = true,
            self         = summary,
            branding     = Config.Branding,
            tabs         = Config.Tabs,
            locations    = Config.Locations,
            weatherList  = Config.Weather,
            framework    = Bridge.Name,
            allowConsole = Config.AllowServerConsole == true,
        }
    end,
})

BZ.RegisterRPC('getPlayers', {
    perm = 'players.view',
    handler = function()
        local out = {}
        for _, p in ipairs(Bridge.GetPlayers()) do
            local role = BZ.Perms.GetRole(p.id)
            out[#out + 1] = {
                id    = p.id,
                name  = p.name,
                cid   = p.cid,
                job   = p.job,
                money = p.money,
                ping  = GetPlayerPing(p.id),
                role  = role and { id = role.id, label = role.label, color = role.color, power = role.power } or nil,
                identifiers = BZ.Util.PublicIds(p.identifiers),
            }
        end
        table.sort(out, function(a, b) return a.id < b.id end)
        return { players = out, count = #out, max = GetConvarInt('sv_maxclients', 48) }
    end,
})

local dashCache = { data = nil, ts = 0 }
BZ.RegisterRPC('getDashboard', {
    perm = 'menu.open',
    handler = function()
        -- Shared 4s cache so N open admins don't each query the DB every tick.
        if dashCache.data and (GetGameTimer() - dashCache.ts) < 4000 then
            dashCache.data.uptime = math.floor(GetGameTimer() / 1000)
            return dashCache.data
        end
        local players = Bridge.GetPlayers()
        local staff = 0
        for _, p in ipairs(players) do if BZ.Perms.IsAdmin(p.id) then staff = staff + 1 end end
        local result = {
            online     = #players,
            max        = GetConvarInt('sv_maxclients', 48),
            staff      = staff,
            uptime     = math.floor(GetGameTimer() / 1000),
            framework  = Bridge.Name,
            serverName = GetConvar('sv_hostname', 'FiveM Server'),
            activeBans = #BZ.DB.GetBans(true),
        }
        dashCache = { data = result, ts = GetGameTimer() }
        return result
    end,
})

local function tryOpen(src)
    if not BZ.Perms.Has(src, 'menu.open') then
        Bridge.Notify(src, BZ.Util.L('no_permission'), 'error')
        return
    end
    TriggerClientEvent('bz-admin:client:open', src)
end

RegisterCommand(Config.Command, function(src)
    if src == 0 then return end
    tryOpen(src)
end, false)

RegisterNetEvent('bz-admin:server:requestOpen', function()
    tryOpen(source)
end)

if Config.Suggestion then
    AddEventHandler('onResourceStart', function(res)
        if res ~= GetCurrentResourceName() then return end
        TriggerClientEvent('chat:addSuggestion', -1, '/' .. Config.Command, 'Open the bz-admin menu')
    end)
end

RegisterNetEvent('bz-admin:server:clientError', function(err)
    if Config.LogClientErrors then
        BZ.Log.Print('error', ('[NUI %s] %s'):format(source, tostring(err):sub(1, 300)))
    end
end)
