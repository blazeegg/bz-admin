local frozenTime = nil

RegisterNetEvent('bz-admin:client:setWeather', function(weather)
    SetWeatherTypeOverTime(weather, 15.0)
    CreateThread(function() Wait(15000); SetWeatherTypePersist(weather); SetWeatherTypeNow(weather) end)
end)

RegisterNetEvent('bz-admin:client:setTime', function(h, m, freeze)
    NetworkOverrideClockTime(h, m, 0)
    frozenTime = freeze and { h = h, m = m } or nil
end)

CreateThread(function()
    while true do
        if frozenTime then
            NetworkOverrideClockTime(frozenTime.h, frozenTime.m, 0)
            Wait(1000)
        else
            Wait(2000)
        end
    end
end)

RegisterNetEvent('bz-admin:client:setBlackout', function(value)
    SetArtificialLightsState(value == true)
end)

RegisterNetEvent('bz-admin:client:announce', function(payload)
    SendNUIMessage({ action = 'announce', data = payload })
end)

RegisterNetEvent('bz-admin:client:clearArea', function(center, radius)
    ClearAreaOfVehicles(center.x, center.y, center.z, radius + 0.0, false, false, false, false, false)
    ClearAreaOfObjects(center.x, center.y, center.z, radius + 0.0, 0)
    ClearAreaOfPeds(center.x, center.y, center.z, radius + 0.0, 1)
end)
