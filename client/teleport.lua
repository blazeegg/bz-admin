local lastPosition = nil

local function safeTeleport(x, y, z, withGround)
    local ped = PlayerPedId()
    lastPosition = GetEntityCoords(ped)
    DoScreenFadeOut(250); Wait(250)

    local entity = IsPedInAnyVehicle(ped, false) and GetVehiclePedIsIn(ped, false) or ped

    if withGround then
        local groundZ, found = z, false
        for _, testZ in ipairs({ z, 100.0, 200.0, 300.0, 500.0, 800.0 }) do
            RequestCollisionAtCoord(x, y, testZ)
            SetEntityCoordsNoOffset(entity, x, y, testZ, false, false, false)
            Wait(150)
            local ok, gz = GetGroundZFor_3dCoord(x, y, testZ, false)
            if ok then groundZ = gz; found = true; break end
        end
        SetEntityCoords(entity, x, y, (found and groundZ or z) + 1.0, false, false, false, false)
    else
        SetEntityCoordsNoOffset(entity, x, y, z, false, false, false)
    end

    Wait(250); DoScreenFadeIn(250)
end

BZ.NUI('teleport:waypoint', function(_, cb)
    BZ.Gated('teleport.waypoint', 'Teleport to waypoint', 'teleport', function()
        local blip = GetFirstBlipInfoId(8)
        if not DoesBlipExist(blip) then Bridge.Notify('No waypoint set.', 'error'); return end
        local coords = GetBlipInfoIdCoord(blip)
        safeTeleport(coords.x, coords.y, coords.z, true)
    end, function(ok, res) cb({ ok = ok, result = res }) end)
end)

BZ.NUI('teleport:coords', function(body, cb)
    BZ.Gated('teleport.coords', 'Teleport to coords', 'teleport', function()
        local x, y, z = tonumber(body.x), tonumber(body.y), tonumber(body.z)
        if not x or not y or not z then Bridge.Notify('Invalid coordinates.', 'error'); return end
        safeTeleport(x, y, z, body.ground ~= false)
    end, function(ok, res) cb({ ok = ok, result = res }) end)
end)

BZ.NUI('teleport:saved', function(body, cb)
    BZ.Gated('teleport.saved', 'Teleport to saved location', 'teleport', function()
        local loc = Config.Locations[tonumber(body.index)]
        if not loc then return end
        safeTeleport(loc.coords.x, loc.coords.y, loc.coords.z, false)
    end, function(ok, res) cb({ ok = ok, result = res }) end)
end)

BZ.NUI('teleport:back', function(_, cb)
    BZ.Gated('teleport.back', 'Teleport back', 'teleport', function()
        if not lastPosition then Bridge.Notify('No previous position.', 'error'); return end
        local p = lastPosition
        safeTeleport(p.x, p.y, p.z, false)
    end, function(ok, res) cb({ ok = ok, result = res }) end)
end)
