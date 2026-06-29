local function teleportTo(coords, withGround)
    local ped = PlayerPedId()
    SetEntityCoordsNoOffset(ped, coords.x, coords.y, coords.z, false, false, false)
    if withGround then
        local found, z = GetGroundZFor_3dCoord(coords.x, coords.y, coords.z + 1.0, false)
        if found then SetEntityCoords(ped, coords.x, coords.y, z, false, false, false, false) end
    end
end

RegisterNetEvent('bz-admin:client:setFrozen', function(frozen)
    local ped = PlayerPedId()
    FreezeEntityPosition(ped, frozen)
    SetPlayerControl(PlayerId(), not frozen, 0)
end)

RegisterNetEvent('bz-admin:client:heal', function()
    local ped = PlayerPedId()
    SetEntityHealth(ped, GetEntityMaxHealth(ped))
    SetPedArmour(ped, 100)
    ClearPedBloodDamage(ped)
    ResetPedVisibleDamage(ped)
end)

RegisterNetEvent('bz-admin:client:revive', function()
    local ped = PlayerPedId()
    local coords = GetEntityCoords(ped)
    NetworkResurrectLocalPlayer(coords.x, coords.y, coords.z, GetEntityHeading(ped), true, false)
    SetEntityHealth(ped, GetEntityMaxHealth(ped))
    SetPedArmour(ped, 100)
    ClearPedBloodDamage(ped)
    ClearPedTasksImmediately(ped)
    TriggerEvent('hospital:client:Revive')
    TriggerEvent('esx_ambulancejob:revive')
end)

RegisterNetEvent('bz-admin:client:kill', function()
    SetEntityHealth(PlayerPedId(), 0)
end)

RegisterNetEvent('bz-admin:client:teleportCoords', function(coords)
    DoScreenFadeOut(250)
    Wait(250)
    teleportTo(coords, true)
    Wait(250)
    DoScreenFadeIn(250)
end)

RegisterNetEvent('bz-admin:client:dm', function(payload)
    SendNUIMessage({ action = 'dm', data = payload })
end)
RegisterNetEvent('bz-admin:client:warnPopup', function(payload)
    SendNUIMessage({ action = 'warn', data = payload })
end)

RegisterNetEvent('bz-admin:client:giveWeapon', function(weapon, ammo)
    local hash = type(weapon) == 'string' and GetHashKey(weapon) or weapon
    GiveWeaponToPed(PlayerPedId(), hash, ammo or 250, false, true)
end)

BZ.NUI('spectate', function(body, cb)
    BZ.RPC('player.spectate', { target = body.target }, function(ok, res)
        if ok and res and res.ok then
            BZ.Spectate.Start(res.target, res.coords)
        end
        cb({ ok = ok, result = res })
    end)
end)
BZ.NUI('spectate:stop', function(_, cb)
    BZ.Spectate.Stop()
    cb({ ok = true })
end)
