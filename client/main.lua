RegisterCommand('+bzadmin_open', function()
    TriggerServerEvent('bz-admin:server:requestOpen')
end, false)
RegisterCommand('-bzadmin_open', function() end, false)

RegisterKeyMapping('+bzadmin_open', 'Open bz-admin menu', 'keyboard', Config.OpenKey or 'F6')

CreateThread(function()
    while true do
        Wait(0)
        if BZ.State.open then
            if IsControlJustReleased(0, 177) then
                BZ.Close()
            end
            DisableControlAction(0, 200, true)
        else
            Wait(250)
        end
    end
end)

AddEventHandler('onResourceStop', function(res)
    if res == GetCurrentResourceName() and BZ.State.open then
        SetNuiFocus(false, false)
    end
end)
