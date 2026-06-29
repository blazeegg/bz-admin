BZ.RegisterRPC('gate', {
    handler = function(src, data)
        local perm = data.perm
        if perm and not BZ.Perms.Has(src, perm) then
            Bridge.Notify(src, BZ.Util.L('no_permission'), 'error')
            return { ok = false, error = 'no_permission' }
        end
        if data.log then
            local cat = data.category == 'teleport' and 'teleport' or 'selfActions'
            BZ.Log.Action(cat, {
                admin = { name = Bridge.GetName(src), id = src },
                action = BZ.Util.Sanitize(data.log, 100),
            })
        end
        return { ok = true }
    end,
})

BZ.RegisterRPC('getVehicleList', {
    perm = 'vehicle.spawn',
    handler = function()
        return { models = Config.VehicleModels or {} }
    end,
})
