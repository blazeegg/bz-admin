BZ = BZ or {}
BZ.State = {
    open   = false,
    self   = nil,
    booted = false,
}

local pending, counter = {}, 0

function BZ.RPC(name, data, cb)
    counter = counter + 1
    local token = counter
    pending[token] = cb or function() end
    SetTimeout(10000, function()
        if pending[token] then pending[token](false, { error = 'timeout' }); pending[token] = nil end
    end)
    TriggerServerEvent('bz-admin:rpc:request', token, name, data or {})
end

RegisterNetEvent('bz-admin:rpc:response', function(token, ok, payload)
    local cb = pending[token]
    if cb then pending[token] = nil; cb(ok, payload) end
end)

function BZ.Has(perm)
    local s = BZ.State.self
    if not s then return false end
    for _, p in ipairs(s.permissions or {}) do
        if BZ.Util.PermMatch(p, perm) then return true end
    end
    return false
end

function BZ.Gated(perm, logLabel, category, fn, cb)
    BZ.RPC('gate', { perm = perm, log = logLabel, category = category }, function(ok, res)
        if ok and res and res.ok then
            local applied = fn and fn() or nil
            if cb then cb(true, applied) end
        else
            if cb then cb(false, res) end
        end
    end)
end

function BZ.Open()
    if BZ.State.open then return end
    BZ.RPC('authorize', {}, function(ok, payload)
        if not ok or not payload or not payload.allowed then
            Bridge.Notify(BZ.Util.L('no_permission'), 'error')
            return
        end
        BZ.State.self   = payload.self
        BZ.State.booted = true
        BZ.State.open   = true
        SetNuiFocus(true, true)
        SendNUIMessage({ action = 'open', data = payload })
    end)
end

function BZ.Close()
    if not BZ.State.open then return end
    BZ.State.open = false
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'close' })
end

RegisterNetEvent('bz-admin:client:open', function()
    BZ.Open()
end)

RegisterNetEvent('bz-admin:client:notify', function(payload)
    SendNUIMessage({ action = 'notify', data = payload })
end)
