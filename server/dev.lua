BZ.RegisterRPC('dev.runCommand', {
    perm = 'dev.console',
    handler = function(src, data)
        if not Config.AllowServerConsole then return { ok = false, error = 'disabled' } end
        if type(data.command) ~= 'string' or data.command == '' then return { ok = false } end
        local blocked = { 'quit', 'sv_endmapwithvote', 'load_server_icon', 'exec', 'sets', 'set', 'setr' }
        local first = (data.command:match('^%s*(%S+)') or ''):lower()
        for _, b in ipairs(blocked) do
            if first == b then return { ok = false, error = 'blocked' } end
        end
        ExecuteCommand(data.command)
        BZ.Log.Action('serverActions', { admin = { name = Bridge.GetName(src), id = src },
            action = 'Console', reason = data.command })
        return { ok = true }
    end,
})

BZ.RegisterRPC('dev.serverInfo', {
    perm = 'dev.console',
    handler = function()
        return {
            resources = GetNumResources(),
            uptime    = math.floor(GetGameTimer() / 1000),
            txAdmin   = GetResourceState('monitor') == 'started',
        }
    end,
})
