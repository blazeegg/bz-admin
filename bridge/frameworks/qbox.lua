local RESOURCE = 'qbx_core'

Bridge.Register('qbox', {
    priority  = 60,
    detect    = function() return GetResourceState(RESOURCE) == 'started' end,
    getObject = function()
        if GetResourceState(RESOURCE) ~= 'started' then return nil end
        return exports[RESOURCE]
    end,

    server = {
        getPlayer = function(src)
            local player = exports[RESOURCE]:GetPlayer(src)
            if not player then return nil end
            local pd = player.PlayerData
            local job = pd.job or {}
            local ci = pd.charinfo or {}
            return {
                id   = src,
                name = (ci.firstname and (ci.firstname .. ' ' .. (ci.lastname or ''))) or GetPlayerName(src),
                cid  = pd.citizenid,
                job  = {
                    name = job.name, label = job.label,
                    grade = job.grade and job.grade.level or 0,
                    gradeLabel = job.grade and job.grade.name or '',
                    onDuty = job.onduty,
                },
                money = { cash = pd.money and pd.money.cash or 0, bank = pd.money and pd.money.bank or 0 },
                group       = Bridge.Call('getGroup', src) or 'user',
                identifiers = Bridge.GetIdentifiers(src),
            }
        end,
        getPlayers = function()
            local out = {}
            for _, src in pairs(exports[RESOURCE]:GetQBPlayers() or {}) do
                local id = type(src) == 'table' and src.PlayerData and src.PlayerData.source or src
                out[#out + 1] = Bridge.Call('getPlayer', id) or Bridge.GetPlayer(id)
            end
            return out
        end,
        setJob = function(src, job, grade)
            return exports[RESOURCE]:SetJob(src, job, grade or 0)
        end,
        getMoney = function(src, account)
            local p = exports[RESOURCE]:GetPlayer(src); if not p then return 0 end
            return p.PlayerData.money[account == 'bank' and 'bank' or 'cash'] or 0
        end,
        addMoney = function(src, account, amount, reason)
            local p = exports[RESOURCE]:GetPlayer(src); if not p then return false end
            return p.Functions.AddMoney(account == 'bank' and 'bank' or 'cash', amount, reason or 'bz-admin')
        end,
        removeMoney = function(src, account, amount, reason)
            local p = exports[RESOURCE]:GetPlayer(src); if not p then return false end
            return p.Functions.RemoveMoney(account == 'bank' and 'bank' or 'cash', amount, reason or 'bz-admin')
        end,
        getGroup = function(src)
            if IsPlayerAceAllowed(src, 'god') then return 'owner' end
            if IsPlayerAceAllowed(src, 'admin') then return 'admin' end
            if IsPlayerAceAllowed(src, 'mod') then return 'moderator' end
            return 'user'
        end,
        jobs = function()
            local out = {}
            local jobs = exports[RESOURCE]:GetJobs() or {}
            for name, job in pairs(jobs) do
                local grades = {}
                for g, gd in pairs(job.grades or {}) do
                    grades[#grades + 1] = { grade = tonumber(g), label = gd.name }
                end
                table.sort(grades, function(a, b) return a.grade < b.grade end)
                out[#out + 1] = { name = name, label = job.label, grades = grades }
            end
            return out
        end,
        notify = function(src, msg, type)
            exports[RESOURCE]:Notify(src, msg, type)
            return true
        end,
    },

    client = {
        getPlayerData = function()
            local data = exports[RESOURCE]:GetPlayerData() or {}
            return { job = data.job or {}, money = data.money or {} }
        end,
        notify = function(msg, type)
            exports[RESOURCE]:Notify(msg, type)
            return true
        end,
    },
})
