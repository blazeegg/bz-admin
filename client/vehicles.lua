local spawnedVehicle = nil

local function loadModel(model)
    local hash = type(model) == 'string' and GetHashKey(model) or model
    if not IsModelInCdimage(hash) or not IsModelAVehicle(hash) then return nil end
    RequestModel(hash)
    local timeout = GetGameTimer() + 5000
    while not HasModelLoaded(hash) and GetGameTimer() < timeout do Wait(10) end
    return HasModelLoaded(hash) and hash or nil
end

local function maxUpgrade(veh)
    SetVehicleModKit(veh, 0)
    for mod = 0, 16 do
        local count = GetNumVehicleMods(veh, mod)
        if count > 0 then SetVehicleMod(veh, mod, count - 1, false) end
    end
    ToggleVehicleMod(veh, 18, true)
    SetVehicleFixed(veh)
end

local function reply(cb)
    return function(ok, res) cb({ ok = ok, result = res }) end
end

BZ.NUI('vehicle:spawn', function(body, cb)
    BZ.Gated('vehicle.spawn', 'Spawn vehicle: ' .. tostring(body.model), 'selfActions', function()
        local hash = loadModel(body.model)
        if not hash then Bridge.Notify('Invalid vehicle model.', 'error'); return end
        local ped = PlayerPedId()
        if Config.Vehicles.deletePrevious and spawnedVehicle and DoesEntityExist(spawnedVehicle) then
            DeleteEntity(spawnedVehicle)
        end
        local coords = GetEntityCoords(ped)
        local veh = CreateVehicle(hash, coords.x, coords.y, coords.z, GetEntityHeading(ped), true, false)
        SetVehicleOnGroundProperly(veh)
        SetVehicleNumberPlateText(veh, Config.Vehicles.defaultPlate or 'BZADMIN')
        SetEntityAsMissionEntity(veh, true, true)
        if Config.Vehicles.warpIntoSpawned then TaskWarpPedIntoVehicle(ped, veh, -1) end
        if Config.Vehicles.maxUpgradeOnSpawn then maxUpgrade(veh) end
        SetModelAsNoLongerNeeded(hash)
        spawnedVehicle = veh
    end, reply(cb))
end)

BZ.NUI('vehicle:delete', function(_, cb)
    BZ.Gated('vehicle.delete', 'Delete vehicle', 'selfActions', function()
        local ped = PlayerPedId()
        local veh = GetVehiclePedIsIn(ped, false)
        if veh == 0 then
            veh = GetClosestVehicle(GetEntityCoords(ped), 5.0, 0, 70)
        end
        if veh and DoesEntityExist(veh) then
            SetEntityAsMissionEntity(veh, true, true)
            DeleteVehicle(veh)
        end
    end, reply(cb))
end)

BZ.NUI('vehicle:repair', function(_, cb)
    BZ.Gated('vehicle.repair', 'Repair vehicle', 'selfActions', function()
        local veh = GetVehiclePedIsIn(PlayerPedId(), false)
        if veh ~= 0 then
            SetVehicleFixed(veh); SetVehicleDeformationFixed(veh)
            SetVehicleEngineHealth(veh, 1000.0); SetVehicleBodyHealth(veh, 1000.0)
            SetVehicleDirtLevel(veh, 0.0); SetVehicleFixed(veh)
        end
    end, reply(cb))
end)

BZ.NUI('vehicle:upgrade', function(_, cb)
    BZ.Gated('vehicle.upgrade', 'Max upgrade vehicle', 'selfActions', function()
        local veh = GetVehiclePedIsIn(PlayerPedId(), false)
        if veh ~= 0 then maxUpgrade(veh) end
    end, reply(cb))
end)

BZ.NUI('vehicle:plate', function(body, cb)
    BZ.Gated('vehicle.plate', 'Set plate', 'selfActions', function()
        local veh = GetVehiclePedIsIn(PlayerPedId(), false)
        if veh ~= 0 and body.plate then SetVehicleNumberPlateText(veh, tostring(body.plate):sub(1, 8)) end
    end, reply(cb))
end)

BZ.NUI('vehicle:boost', function(_, cb)
    BZ.Gated('vehicle.boost', 'Vehicle boost', 'selfActions', function()
        local veh = GetVehiclePedIsIn(PlayerPedId(), false)
        if veh ~= 0 then
            SetVehicleForwardSpeed(veh, GetEntitySpeed(veh) + 25.0)
        end
    end, reply(cb))
end)

BZ.NUI('vehicle:color', function(body, cb)
    BZ.Gated('vehicle.upgrade', 'Vehicle color', 'selfActions', function()
        local veh = GetVehiclePedIsIn(PlayerPedId(), false)
        if veh ~= 0 then
            local p, s = tonumber(body.primary) or 0, tonumber(body.secondary) or 0
            SetVehicleColours(veh, p, s)
        end
    end, reply(cb))
end)
