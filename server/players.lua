local function adminMeta(src)
    return { name = Bridge.GetName(src), id = src, ids = Bridge.GetIdentifiers(src) }
end
local function targetMeta(src)
    return { name = Bridge.GetName(src), id = src, ids = Bridge.GetIdentifiers(src) }
end

local function pedCoords(src)
    local ped = GetPlayerPed(src)
    return ped and GetEntityCoords(ped) or vector3(0, 0, 0)
end

BZ.RegisterRPC('player.kick', {
    perm = 'players.kick', targeted = true,
    handler = function(src, data, target)
        local reason = BZ.Util.Sanitize(data.reason)
        if reason == '' then reason = 'Kicked by an administrator' end
        BZ.Log.Action('kicks', { admin = adminMeta(src), target = targetMeta(target), action = 'Kick', reason = reason })
        DropPlayer(target, ('[bz-admin] %s'):format(reason))
        return { ok = true }
    end,
})

BZ.RegisterRPC('player.warn', {
    perm = 'players.warn', targeted = true,
    handler = function(src, data, target)
        local reason = BZ.Util.Sanitize(data.reason)
        if reason == '' then reason = 'No reason provided' end
        local ids = Bridge.GetIdentifiers(target)
        BZ.DB.InsertWarn({
            id = BZ.Util.ShortId(8), identifier = ids.license or ids.discord or tostring(target),
            name = Bridge.GetName(target), reason = reason, admin = Bridge.GetName(src), created = os.time(),
        })
        Bridge.Notify(target, BZ.Util.L('warned', Bridge.GetName(src), reason), 'error')
        TriggerClientEvent('bz-admin:client:warnPopup', target, { admin = Bridge.GetName(src), reason = reason })
        BZ.Log.Action('warns', { admin = adminMeta(src), target = targetMeta(target), action = 'Warn', reason = reason })
        return { ok = true }
    end,
})

BZ.RegisterRPC('player.freeze', {
    perm = 'players.freeze', targeted = true,
    handler = function(src, data, target)
        local frozen = data.value == true
        TriggerClientEvent('bz-admin:client:setFrozen', target, frozen)
        Bridge.Notify(target, frozen and BZ.Util.L('frozen') or BZ.Util.L('unfrozen'), 'inform')
        return { ok = true, value = frozen }
    end,
})

BZ.RegisterRPC('player.heal', {
    perm = 'players.heal', targeted = true,
    handler = function(src, data, target)
        TriggerClientEvent('bz-admin:client:heal', target)
        Bridge.Notify(target, BZ.Util.L('healed'), 'success')
        return { ok = true }
    end,
})
BZ.RegisterRPC('player.revive', {
    perm = 'players.revive', targeted = true,
    handler = function(src, data, target)
        TriggerClientEvent('bz-admin:client:revive', target)
        Bridge.Notify(target, BZ.Util.L('revived'), 'success')
        return { ok = true }
    end,
})
BZ.RegisterRPC('player.kill', {
    perm = 'players.kill', targeted = true,
    handler = function(src, data, target)
        TriggerClientEvent('bz-admin:client:kill', target)
        return { ok = true }
    end,
})

BZ.RegisterRPC('player.bring', {
    perm = 'players.bring', targeted = true,
    handler = function(src, data, target)
        local c = pedCoords(src)
        TriggerClientEvent('bz-admin:client:teleportCoords', target, { x = c.x, y = c.y, z = c.z })
        Bridge.Notify(target, BZ.Util.L('teleported'), 'inform')
        BZ.Log.Action('teleport', { admin = adminMeta(src), target = targetMeta(target), action = 'Bring' })
        return { ok = true }
    end,
})
BZ.RegisterRPC('player.goto', {
    perm = 'players.goto', targeted = true,
    handler = function(src, data, target)
        local c = pedCoords(target)
        TriggerClientEvent('bz-admin:client:teleportCoords', src, { x = c.x, y = c.y, z = c.z + 0.5 })
        BZ.Log.Action('teleport', { admin = adminMeta(src), target = targetMeta(target), action = 'Goto' })
        return { ok = true }
    end,
})

BZ.RegisterRPC('player.spectate', {
    perm = 'players.spectate', targeted = true,
    handler = function(src, data, target)
        local c = pedCoords(target)
        return { ok = true, target = target, coords = { x = c.x, y = c.y, z = c.z } }
    end,
})

BZ.RegisterRPC('player.message', {
    perm = 'players.message', targeted = true,
    handler = function(src, data, target)
        local message = BZ.Util.Sanitize(data.message, 300)
        if message == '' then return { ok = false } end
        TriggerClientEvent('bz-admin:client:dm', target, { from = Bridge.GetName(src), message = message })
        return { ok = true }
    end,
})

BZ.RegisterRPC('player.setjob', {
    perm = 'players.setjob', targeted = true,
    handler = function(src, data, target)
        if type(data.job) ~= 'string' or data.job == '' then return { ok = false } end
        local ok = Bridge.SetJob(target, data.job, tonumber(data.grade) or 0)
        if ok then Bridge.Notify(target, BZ.Util.L('job_set', data.job), 'success') end
        return { ok = ok ~= false }
    end,
})

BZ.RegisterRPC('player.givemoney', {
    perm = 'money.give', targeted = true,
    handler = function(src, data, target)
        local amount = math.floor(tonumber(data.amount) or 0)
        if amount <= 0 then return { ok = false, error = 'invalid_amount' } end
        local account = data.account or 'cash'
        Bridge.AddMoney(target, account, amount, 'bz-admin grant')
        Bridge.Notify(target, BZ.Util.L('money_given', amount, account), 'success')
        BZ.Log.Action('money', { admin = adminMeta(src), target = targetMeta(target),
            action = ('Give $%s'):format(amount), reason = account })
        return { ok = true }
    end,
})
BZ.RegisterRPC('player.removemoney', {
    perm = 'money.remove', targeted = true,
    handler = function(src, data, target)
        local amount = math.floor(tonumber(data.amount) or 0)
        if amount <= 0 then return { ok = false, error = 'invalid_amount' } end
        local account = data.account or 'cash'
        Bridge.RemoveMoney(target, account, amount, 'bz-admin removal')
        Bridge.Notify(target, BZ.Util.L('money_removed', amount, account), 'error')
        BZ.Log.Action('money', { admin = adminMeta(src), target = targetMeta(target),
            action = ('Remove $%s'):format(amount), reason = account })
        return { ok = true }
    end,
})

BZ.RegisterRPC('player.giveweapon', {
    perm = 'players.giveweapon', targeted = true,
    handler = function(src, data, target)
        if not data.weapon then return { ok = false } end
        TriggerClientEvent('bz-admin:client:giveWeapon', target, data.weapon, tonumber(data.ammo) or 250)
        return { ok = true }
    end,
})

BZ.RegisterRPC('player.identifiers', {
    perm = 'players.identifiers', targeted = true,
    handler = function(src, data, target)
        local ids = Bridge.GetIdentifiers(target)
        local key = ids.license or ids.discord or tostring(target)
        return {
            ok = true,
            identifiers = BZ.Util.PublicIds(ids),
            warns = BZ.DB.GetWarns(key),
            notes = BZ.DB.GetNotes(key),
        }
    end,
})
BZ.RegisterRPC('player.addnote', {
    perm = 'players.note', targeted = true,
    handler = function(src, data, target)
        local note = BZ.Util.Sanitize(data.note, 300)
        if note == '' then return { ok = false } end
        local ids = Bridge.GetIdentifiers(target)
        BZ.DB.AddNote({
            identifier = ids.license or ids.discord or tostring(target),
            note = note, admin = Bridge.GetName(src), created = os.time(),
        })
        return { ok = true }
    end,
})
