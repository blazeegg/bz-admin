local RESOURCE = 'qb-core'

local function getCore()
    if GetResourceState(RESOURCE) ~= 'started' then return nil end
    local ok, core = pcall(function() return exports[RESOURCE]:GetCoreObject() end)
    if ok and core then return core end
    return nil
end

Bridge.Register('qb', {
    priority  = 50,
    detect    = function() return GetResourceState(RESOURCE) == 'started' end,
    getObject = getCore,

    server = {
        getPlayer = function(src)
            local QB = Bridge.Object; if not QB then return nil end
            local p = QB.Functions.GetPlayer(src)
            if not p then return nil end
            local job = p.PlayerData.job or {}
            local charinfo = p.PlayerData.charinfo or {}
            return {
                id   = src,
                name = (charinfo.firstname and (charinfo.firstname .. ' ' .. (charinfo.lastname or '')))
                        or GetPlayerName(src),
                cid  = p.PlayerData.citizenid,
                job  = {
                    name = job.name, label = job.label,
                    grade = job.grade and job.grade.level or 0,
                    gradeLabel = job.grade and job.grade.name or '',
                    onDuty = job.onduty,
                },
                money = {
                    cash = p.PlayerData.money and p.PlayerData.money.cash or 0,
                    bank = p.PlayerData.money and p.PlayerData.money.bank or 0,
                },
                group       = QB.Functions.GetPermission and QB.Functions.GetPermission(src) or 'user',
                identifiers = Bridge.GetIdentifiers(src),
            }
        end,
        getPlayers = function()
            local QB = Bridge.Object; if not QB then return nil end
            local out = {}
            for _, src in pairs(QB.Functions.GetPlayers()) do
                out[#out + 1] = Bridge.Call('getPlayer', src) or Bridge.GetPlayer(src)
            end
            return out
        end,
        getJob = function(src)
            local QB = Bridge.Object; if not QB then return nil end
            local p = QB.Functions.GetPlayer(src); if not p then return nil end
            local job = p.PlayerData.job or {}
            return {
                name = job.name, label = job.label,
                grade = job.grade and job.grade.level or 0,
                gradeLabel = job.grade and job.grade.name or '',
                onDuty = job.onduty,
            }
        end,
        setJob = function(src, job, grade)
            local QB = Bridge.Object; if not QB then return false end
            local p = QB.Functions.GetPlayer(src); if not p then return false end
            p.Functions.SetJob(job, grade or 0)
            return true
        end,
        getMoney = function(src, account)
            local QB = Bridge.Object; if not QB then return 0 end
            local p = QB.Functions.GetPlayer(src); if not p then return 0 end
            return p.PlayerData.money[account == 'bank' and 'bank' or 'cash'] or 0
        end,
        addMoney = function(src, account, amount, reason)
            local QB = Bridge.Object; if not QB then return false end
            local p = QB.Functions.GetPlayer(src); if not p then return false end
            p.Functions.AddMoney(account == 'bank' and 'bank' or 'cash', amount, reason or 'bz-admin')
            return true
        end,
        removeMoney = function(src, account, amount, reason)
            local QB = Bridge.Object; if not QB then return false end
            local p = QB.Functions.GetPlayer(src); if not p then return false end
            p.Functions.RemoveMoney(account == 'bank' and 'bank' or 'cash', amount, reason or 'bz-admin')
            return true
        end,
        getGroup = function(src)
            local QB = Bridge.Object; if not QB then return 'user' end
            local perm = QB.Functions.GetPermission and QB.Functions.GetPermission(src)
            if type(perm) == 'table' then
                if perm.god then return 'owner' end
                if perm.admin then return 'admin' end
                if perm.mod then return 'moderator' end
                return 'user'
            end
            return perm or 'user'
        end,
        jobs = function()
            local QB = Bridge.Object; if not QB then return {} end
            local out = {}
            for name, job in pairs(QB.Shared.Jobs or {}) do
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
            TriggerClientEvent('QBCore:Notify', src, msg, type)
            return true
        end,
    },

    client = {
        getPlayerData = function()
            local QB = Bridge.Object; if not QB then return nil end
            local data = QB.Functions.GetPlayerData() or {}
            return { job = data.job or {}, money = data.money or {} }
        end,
        notify = function(msg, type)
            local QB = Bridge.Object; if not QB then return nil end
            QB.Functions.Notify(msg, type)
            return true
        end,
    },
})
