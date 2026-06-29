BZ.Noclip = { active = false }

local speed = 1.0

local function getCamRelativeForward()
    local rot = GetGameplayCamRot(2)
    local rx, rz = math.rad(rot.x), math.rad(rot.z)
    local cosrx = math.abs(math.cos(rx))
    return vector3(-math.sin(rz) * cosrx, math.cos(rz) * cosrx, math.sin(rx))
end
local function getCamRelativeRight()
    local rot = GetGameplayCamRot(2)
    local rz = math.rad(rot.z)
    return vector3(math.cos(rz), math.sin(rz), 0.0)
end

CreateThread(function()
    while true do
        if BZ.Noclip.active then
            local ped = PlayerPedId()
            local entity = IsPedInAnyVehicle(ped, false) and GetVehiclePedIsIn(ped, false) or ped
            local pos = GetEntityCoords(entity)

            -- Block every control that could move the ped, change stance, or
            -- fire an action. 36 (duck/Left Ctrl) is the one that caused the
            -- crouch — it's now disabled.
            DisableControlAction(0, 32, true)  DisableControlAction(0, 33, true) -- W / S
            DisableControlAction(0, 34, true)  DisableControlAction(0, 35, true) -- A / D
            DisableControlAction(0, 44, true)  DisableControlAction(0, 38, true) -- Q / E
            DisableControlAction(0, 21, true)  DisableControlAction(0, 19, true) -- Shift / Alt
            DisableControlAction(0, 22, true)  DisableControlAction(0, 36, true) -- Space / Ctrl (duck)
            DisableControlAction(0, 23, true)  DisableControlAction(0, 75, true) -- enter / exit vehicle

            local dx, dy, dz = 0.0, 0.0, 0.0
            local fwd, right = getCamRelativeForward(), getCamRelativeRight()

            if IsDisabledControlPressed(0, 32) then dx = dx + fwd.x; dy = dy + fwd.y; dz = dz + fwd.z end -- W
            if IsDisabledControlPressed(0, 33) then dx = dx - fwd.x; dy = dy - fwd.y; dz = dz - fwd.z end -- S
            if IsDisabledControlPressed(0, 34) then dx = dx - right.x; dy = dy - right.y end             -- A
            if IsDisabledControlPressed(0, 35) then dx = dx + right.x; dy = dy + right.y end             -- D
            if IsDisabledControlPressed(0, 44) then dz = dz + 1.0 end                                    -- Q up
            if IsDisabledControlPressed(0, 38) then dz = dz - 1.0 end                                    -- E down

            -- Frame-time scaled so movement speed is the same at 30 or 144 fps.
            local mult = speed * (Config.Self.noclipSpeed or 1.0) * (GetFrameTime() * 60.0)
            if IsDisabledControlPressed(0, 21) then mult = mult * 3.0 end    -- Shift = faster
            if IsDisabledControlPressed(0, 19) then mult = mult * 0.25 end   -- Alt = slower

            SetEntityVelocity(entity, 0.0, 0.0, 0.0)
            SetEntityCoordsNoOffset(entity, pos.x + dx * mult, pos.y + dy * mult, pos.z + dz * mult, true, true, true)

            if IsControlPressed(0, 241) then speed = math.min(speed + 0.05, 10.0) end
            if IsControlPressed(0, 242) then speed = math.max(speed - 0.05, 0.1) end

            Wait(0)
        else
            Wait(300)
        end
    end
end)

local function setNoclip(on)
    BZ.Noclip.active = on
    local ped = PlayerPedId()
    local entity = IsPedInAnyVehicle(ped, false) and GetVehiclePedIsIn(ped, false) or ped
    SetEntityInvincible(entity, on)
    FreezeEntityPosition(entity, false)
    SetEntityCollision(entity, not on, not on)
    if entity == ped then SetEntityVisible(ped, not on, false) end
    if not on then
        local pos = GetEntityCoords(entity)
        SetEntityCoords(entity, pos.x, pos.y, pos.z, false, false, false, false)
        if entity == ped then SetEntityVisible(ped, true, false) end
        SetEntityInvincible(entity, BZ.SelfState and BZ.SelfState.godmode or false)
    end
end

local function txNoclip()
    return Config.Self.useTxAdminNoclip and GetResourceState('monitor') == 'started'
end

BZ.NUI('self:noclip', function(body, cb)
    BZ.Gated('self.noclip', 'Noclip ' .. (body.value and 'on' or 'off'), 'selfActions', function()
        if txNoclip() then
            ExecuteCommand('txAdmin:menu:noClipToggle')
        else
            setNoclip(body.value == true)
        end
    end, function(ok, res)
        cb({ ok = ok, result = { value = body.value == true, error = res and res.error } })
    end)
end)
