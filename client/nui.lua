RegisterNUICallback('rpc', function(body, cb)
    BZ.RPC(body.name, body.data, function(ok, payload)
        cb({ ok = ok, result = payload })
    end)
end)

RegisterNUICallback('close', function(_, cb)
    BZ.Close()
    cb({ ok = true })
end)

RegisterNUICallback('error', function(body, cb)
    TriggerServerEvent('bz-admin:server:clientError', body and body.message or 'unknown')
    cb({ ok = true })
end)

function BZ.NUI(name, fn)
    RegisterNUICallback(name, function(body, cb)
        local ok, err = pcall(fn, body or {}, cb)
        if not ok then
            BZ.Log.Print('error', ('NUI %s failed: %s'):format(name, err))
            cb({ ok = false, result = { error = 'client_error' } })
        end
    end)
end
