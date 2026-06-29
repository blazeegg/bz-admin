local RESOURCE = 'es_extended'

local function getCore()
    if GetResourceState(RESOURCE) ~= 'started' then return nil end
    local ok, core = pcall(function() return exports[RESOURCE]:getSharedObject() end)
    if ok and core then return core end
    return nil
end

Bridge.Register('esx', {
    priority  = 50,
    detect    = function() return GetResourceState(RESOURCE) == 'started' end,
    getObject = getCore,

    server = {
        getPlayer = function(src)
            local ESX = Bridge.Object; if not ESX then return nil end
            local xPlayer = ESX.GetPlayerFromId(src)
            if not xPlayer then return nil end
            local job = xPlayer.getJob and xPlayer.getJob() or {}
            return {
                id    = src,
                name  = xPlayer.getName and xPlayer.getName() or GetPlayerName(src),
                cid   = xPlayer.identifier,
                job   = {
                    name = job.name, label = job.label,
                    grade = job.grade, gradeLabel = job.grade_label, onDuty = true,
                },
                money = {
                    cash = xPlayer.getMoney and xPlayer.getMoney() or 0,
                    bank = xPlayer.getAccount and (xPlayer.getAccount('bank') or {}).money or 0,
                    black = xPlayer.getAccount and (xPlayer.getAccount('black_money') or {}).money or 0,
                },
                group       = xPlayer.getGroup and xPlayer.getGroup() or 'user',
                identifiers = Bridge.GetIdentifiers(src),
            }
        end,
        getPlayers = function()
            local ESX = Bridge.Object; if not ESX then return nil end
            local out = {}
            for _, src in ipairs(ESX.GetExtendedPlayers and ESX.GetExtendedPlayers() or {}) do
                out[#out + 1] = Bridge.Call('getPlayer', src.source) or Bridge.GetPlayer(src.source)
            end
            return out
        end,
        getJob = function(src)
            local ESX = Bridge.Object; if not ESX then return nil end
            local xPlayer = ESX.GetPlayerFromId(src); if not xPlayer then return nil end
            local job = xPlayer.getJob()
            return { name = job.name, label = job.label, grade = job.grade, gradeLabel = job.grade_label, onDuty = true }
        end,
        setJob = function(src, job, grade)
            local ESX = Bridge.Object; if not ESX then return false end
            local xPlayer = ESX.GetPlayerFromId(src); if not xPlayer then return false end
            xPlayer.setJob(job, grade or 0)
            return true
        end,
        getMoney = function(src, account)
            local ESX = Bridge.Object; if not ESX then return 0 end
            local xPlayer = ESX.GetPlayerFromId(src); if not xPlayer then return 0 end
            if account == 'cash' or account == 'money' or not account then return xPlayer.getMoney() end
            local acc = xPlayer.getAccount(account == 'bank' and 'bank' or account)
            return acc and acc.money or 0
        end,
        addMoney = function(src, account, amount, reason)
            local ESX = Bridge.Object; if not ESX then return false end
            local xPlayer = ESX.GetPlayerFromId(src); if not xPlayer then return false end
            if account == 'cash' or account == 'money' or not account then
                xPlayer.addMoney(amount, reason)
            else
                xPlayer.addAccountMoney(account, amount, reason)
            end
            return true
        end,
        removeMoney = function(src, account, amount, reason)
            local ESX = Bridge.Object; if not ESX then return false end
            local xPlayer = ESX.GetPlayerFromId(src); if not xPlayer then return false end
            if account == 'cash' or account == 'money' or not account then
                xPlayer.removeMoney(amount, reason)
            else
                xPlayer.removeAccountMoney(account, amount, reason)
            end
            return true
        end,
        getGroup = function(src)
            local ESX = Bridge.Object; if not ESX then return 'user' end
            local xPlayer = ESX.GetPlayerFromId(src)
            return xPlayer and xPlayer.getGroup() or 'user'
        end,
        jobs = function()
            local ESX = Bridge.Object; if not ESX then return {} end
            local out, jobs = {}, ESX.GetJobs and ESX.GetJobs() or {}
            for name, job in pairs(jobs) do
                local grades = {}
                for g, gd in pairs(job.grades or {}) do
                    grades[#grades + 1] = { grade = tonumber(g), label = gd.label }
                end
                table.sort(grades, function(a, b) return a.grade < b.grade end)
                out[#out + 1] = { name = name, label = job.label, grades = grades }
            end
            return out
        end,
        notify = function(src, msg)
            TriggerClientEvent('esx:showNotification', src, msg)
            return true
        end,
    },

    client = {
        getPlayerData = function()
            local ESX = Bridge.Object; if not ESX then return nil end
            local data = ESX.GetPlayerData and ESX.GetPlayerData() or {}
            return { job = data.job or {}, money = { cash = data.money }, accounts = data.accounts }
        end,
        notify = function(msg)
            local ESX = Bridge.Object; if not ESX then return nil end
            if ESX.ShowNotification then ESX.ShowNotification(msg); return true end
            return nil
        end,
    },
})
