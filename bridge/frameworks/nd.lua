local RESOURCE = 'ND_Core'

Bridge.Register('nd', {
    priority  = 40,
    detect    = function() return GetResourceState(RESOURCE) == 'started' end,
    getObject = function()
        if GetResourceState(RESOURCE) ~= 'started' then return nil end
        return exports[RESOURCE]
    end,

    server = {
        getPlayer = function(src)
            local player = exports[RESOURCE]:getPlayer(src)
            if not player then return nil end
            return {
                id   = src,
                name = (player.firstname and (player.firstname .. ' ' .. (player.lastname or '')))
                        or GetPlayerName(src),
                cid  = player.id or player.identifier,
                job  = {
                    name = player.job, label = player.jobInfo and player.jobInfo.label or player.job,
                    grade = player.jobInfo and player.jobInfo.rank or 0,
                    gradeLabel = player.jobInfo and player.jobInfo.rankName or '',
                    onDuty = true,
                },
                money = { cash = player.cash or 0, bank = player.bank or 0 },
                group       = player.groups and next(player.groups) or 'user',
                identifiers = Bridge.GetIdentifiers(src),
            }
        end,
        getGroup = function(src)
            local player = exports[RESOURCE]:getPlayer(src)
            if not player then return 'user' end
            for group in pairs(player.groups or {}) do
                if group == 'admin' or group == 'owner' or group == 'mod' then return group end
            end
            return 'user'
        end,
        getMoney = function(src, account)
            local p = exports[RESOURCE]:getPlayer(src); if not p then return 0 end
            return account == 'bank' and (p.bank or 0) or (p.cash or 0)
        end,
        addMoney = function(src, account, amount)
            local p = exports[RESOURCE]:getPlayer(src); if not p then return false end
            p.addMoney(account == 'bank' and 'bank' or 'cash', amount)
            return true
        end,
        removeMoney = function(src, account, amount)
            local p = exports[RESOURCE]:getPlayer(src); if not p then return false end
            p.deductMoney(account == 'bank' and 'bank' or 'cash', amount)
            return true
        end,
        notify = function(src, msg, type)
            TriggerClientEvent('ND_Core:Notify', src, { message = msg, type = type })
            return true
        end,
    },

    client = {
        getPlayerData = function()
            local data = exports[RESOURCE]:getPlayer() or {}
            return { job = { name = data.job, grade = data.jobInfo and data.jobInfo.rank }, money = { cash = data.cash, bank = data.bank } }
        end,
        notify = function() return nil end,
    },
})
