CreateThread(function()
    Bridge.Resolve()
end)

function Bridge.GetPlayerData()
    return Bridge.Call('getPlayerData') or {
        job   = { name = 'unemployed', label = 'Civilian', grade = 0 },
        money = {},
    }
end

function Bridge.Notify(msg, type)
    local handled = Bridge.Call('notify', msg, type)
    if handled == nil then
        SendNUIMessage({ action = 'notify', data = { message = msg, type = type or 'info' } })
    end
end

RegisterNetEvent('bz-admin:client:notify', function(payload)
    Bridge.Notify(payload.message, payload.type)
end)
