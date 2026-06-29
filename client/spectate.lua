BZ.Spectate = { active = false, target = nil, origin = nil }

function BZ.Spectate.Start(targetServerId, coords)
    if BZ.Spectate.active then BZ.Spectate.Stop() end
    local ped = PlayerPedId()
    BZ.Spectate.origin = GetEntityCoords(ped)
    BZ.Spectate.target = targetServerId
    BZ.Spectate.active = true

    DoScreenFadeOut(250); Wait(250)
    SetEntityCoords(ped, coords.x, coords.y, coords.z + 50.0, false, false, false, false)
    SetEntityVisible(ped, false, false)
    FreezeEntityPosition(ped, true)
    SetEntityInvincible(ped, true)

    CreateThread(function()
        while BZ.Spectate.active do
            local targetPlayer = GetPlayerFromServerId(BZ.Spectate.target)
            if targetPlayer ~= -1 and NetworkIsPlayerActive(targetPlayer) then
                local tped = GetPlayerPed(targetPlayer)
                if tped and tped ~= 0 then
                    NetworkSetInSpectatorMode(true, tped)
                end
            end
            Wait(500)
        end
    end)

    Wait(500); DoScreenFadeIn(250)
    SendNUIMessage({ action = 'spectate', data = { active = true, target = targetServerId } })
end

function BZ.Spectate.Stop()
    if not BZ.Spectate.active then return end
    BZ.Spectate.active = false
    local ped = PlayerPedId()
    NetworkSetInSpectatorMode(false, ped)
    DoScreenFadeOut(250); Wait(250)
    if BZ.Spectate.origin then
        SetEntityCoords(ped, BZ.Spectate.origin.x, BZ.Spectate.origin.y, BZ.Spectate.origin.z, false, false, false, false)
    end
    SetEntityVisible(ped, true, false)
    FreezeEntityPosition(ped, false)
    SetEntityInvincible(ped, BZ.SelfState and BZ.SelfState.godmode or false)
    Wait(250); DoScreenFadeIn(250)
    SendNUIMessage({ action = 'spectate', data = { active = false } })
end
