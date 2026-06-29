BZ.Dev = { coords = false, names = false }

CreateThread(function()
    while true do
        if BZ.Dev.coords and BZ.State.open then
            local ped = PlayerPedId()
            local c = GetEntityCoords(ped)
            local h = GetEntityHeading(ped)
            SendNUIMessage({ action = 'devCoords', data = {
                x = BZ.Util.Round(c.x, 2), y = BZ.Util.Round(c.y, 2), z = BZ.Util.Round(c.z, 2),
                heading = BZ.Util.Round(h, 2),
                vector = ('vec4(%s, %s, %s, %s)'):format(BZ.Util.Round(c.x, 2), BZ.Util.Round(c.y, 2), BZ.Util.Round(c.z, 2), BZ.Util.Round(h, 2)),
            } })
            Wait(250)
        else
            Wait(500)
        end
    end
end)

BZ.NUI('dev:toggleCoords', function(body, cb)
    BZ.Gated('dev.coords', nil, nil, function()
        BZ.Dev.coords = body.value == true
    end, function(ok) cb({ ok = ok, result = { value = body.value == true } }) end)
end)

BZ.NUI('dev:entityInfo', function(_, cb)
    BZ.Gated('dev.entity', nil, nil, function()
        local ped = PlayerPedId()
        local ent = IsPedInAnyVehicle(ped, false) and GetVehiclePedIsIn(ped, false)
            or GetClosestVehicle(GetEntityCoords(ped), 8.0, 0, 70)
        if ent and ent ~= 0 and DoesEntityExist(ent) then
            local c = GetEntityCoords(ent)
            return {
                model  = GetEntityModel(ent),
                netId  = NetworkGetNetworkIdFromEntity(ent),
                health = GetEntityHealth(ent),
                coords = { x = BZ.Util.Round(c.x, 2), y = BZ.Util.Round(c.y, 2), z = BZ.Util.Round(c.z, 2) },
            }
        end
        return nil
    end, function(ok, applied)
        cb({ ok = ok, result = applied })
    end)
end)

BZ.NUI('dev:console', function(body, cb)
    BZ.RPC('dev.runCommand', { command = body.command }, function(ok, res)
        cb({ ok = ok, result = res })
    end)
end)
