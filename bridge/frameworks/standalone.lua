Bridge.Register('standalone', {
    priority = -100,
    detect   = function() return true end,
    getObject = function() return nil end,

    server = {
        getGroup = function(src)
            if IsPlayerAceAllowed(src, 'bz.owner') then return 'owner' end
            if IsPlayerAceAllowed(src, 'bz.superadmin') then return 'superadmin' end
            if IsPlayerAceAllowed(src, 'bz.admin') then return 'admin' end
            if IsPlayerAceAllowed(src, 'bz.moderator') then return 'moderator' end
            return 'user'
        end,
        getJob = function()
            return { name = 'unemployed', label = 'Civilian', grade = 0, gradeLabel = '', onDuty = true }
        end,
        jobs        = function() return {} end,
        getMoney    = function() return 0 end,
        addMoney    = function() return false end,
        removeMoney = function() return false end,
        notify      = function() return nil end,
    },

    client = {
        getPlayerData = function()
            return { job = { name = 'unemployed', label = 'Civilian', grade = 0 }, money = {} }
        end,
        notify = function() return nil end,
    },
})
