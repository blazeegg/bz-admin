BZ.SelfState = {
    godmode   = false,
    invisible = false,
    infammo   = false,
    superjump = false,
    fastrun   = false,
}

CreateThread(function()
    while true do
        local s = BZ.SelfState
        local active = s.godmode or s.invisible or s.infammo or s.superjump or s.fastrun
        if active then
            local ped = PlayerPedId()
            if s.godmode then
                SetEntityInvincible(ped, true)
                SetPlayerInvincible(PlayerId(), true)
                if Config.Self.godmodeArmor then SetPedArmour(ped, 100) end
            end
            if s.invisible then SetEntityVisible(ped, false, false) end
            if s.infammo then
                local _, weapon = GetCurrentPedWeapon(ped, true)
                if weapon then SetPedInfiniteAmmo(ped, true, weapon); SetPedInfiniteAmmoClip(ped, true) end
            end
            if s.superjump then SetSuperJumpThisFrame(PlayerId()) end
            if s.fastrun then
                SetRunSprintMultiplierForPlayer(PlayerId(), Config.Self.runSpeed or 1.49)
                SetSwimMultiplierForPlayer(PlayerId(), Config.Self.swimSpeed or 1.49)
            end
            Wait(0)
        else
            Wait(300)
        end
    end
end)

local PERM = {
    godmode   = 'self.godmode',
    invisible = 'self.invisible',
    infammo   = 'self.infammo',
    superjump = 'self.superjump',
    fastrun   = 'self.fastrun',
}

local function applyToggleOff(feature)
    local ped = PlayerPedId()
    if feature == 'godmode' then
        SetEntityInvincible(ped, false); SetPlayerInvincible(PlayerId(), false)
    elseif feature == 'invisible' then
        SetEntityVisible(ped, true, false)
    elseif feature == 'infammo' then
        local _, weapon = GetCurrentPedWeapon(ped, true)
        if weapon then SetPedInfiniteAmmo(ped, false, weapon); SetPedInfiniteAmmoClip(ped, false) end
    elseif feature == 'fastrun' then
        SetRunSprintMultiplierForPlayer(PlayerId(), 1.0)
        SetSwimMultiplierForPlayer(PlayerId(), 1.0)
    end
end

BZ.NUI('self:toggle', function(body, cb)
    local feature, value = body.feature, body.value == true
    local perm = PERM[feature]
    if not perm then return cb({ ok = false }) end
    BZ.Gated(perm, ('Self: %s %s'):format(feature, value and 'on' or 'off'), 'selfActions', function()
        BZ.SelfState[feature] = value
        if not value then applyToggleOff(feature) end
    end, function(ok, res)
        cb({ ok = ok, result = { value = value, error = res and res.error } })
    end)
end)

BZ.NUI('self:heal', function(_, cb)
    BZ.Gated('self.heal', 'Self heal', 'selfActions', function()
        local ped = PlayerPedId()
        SetEntityHealth(ped, GetEntityMaxHealth(ped))
        ClearPedBloodDamage(ped)
    end, function(ok, res) cb({ ok = ok, result = res }) end)
end)

BZ.NUI('self:armor', function(_, cb)
    BZ.Gated('self.armor', 'Self armor', 'selfActions', function()
        SetPedArmour(PlayerPedId(), 100)
    end, function(ok, res) cb({ ok = ok, result = res }) end)
end)
