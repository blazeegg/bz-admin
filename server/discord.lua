BZ = BZ or {}
BZ.Discord = {}

local cache = {}
local CACHE_TTL = 300

local function cfg() return ServerConfig and ServerConfig.Discord or {} end

function BZ.Discord.Enabled()
    local c = cfg()
    return c.token and c.token ~= '' and c.guild and c.guild ~= ''
end

function BZ.Discord.IdOf(src)
    for i = 0, GetNumPlayerIdentifiers(src) - 1 do
        local id = GetPlayerIdentifier(src, i)
        if id and id:sub(1, 8) == 'discord:' then return id:sub(9) end
    end
    return nil
end

function BZ.Discord.GetRoles(discordId)
    local c = cache[discordId]
    if c and (os.time() - c.ts) < CACHE_TTL then return c.roles end
    return nil
end

function BZ.Discord.GetName(discordId)
    local c = cache[discordId]
    return c and c.name or nil
end

function BZ.Discord.Fetch(discordId, cb)
    cb = cb or function() end
    if not BZ.Discord.Enabled() or not discordId then return cb(nil) end
    local c = cfg()
    PerformHttpRequest(('https://discord.com/api/v10/guilds/%s/members/%s'):format(c.guild, discordId),
        function(status, body)
            local roles, name = {}, nil
            if status == 200 and body then
                local ok, data = pcall(json.decode, body)
                if ok and data then
                    if data.roles then roles = data.roles end
                    if data.user then name = data.nick or data.user.global_name or data.user.username end
                end
            elseif status == 429 then
                BZ.Log.Print('warn', 'Discord API rate limited.')
            end
            cache[discordId] = { roles = roles, name = name, ts = os.time() }
            cb(roles)
        end, 'GET', '', { ['Authorization'] = 'Bot ' .. c.token, ['Content-Type'] = 'application/json' })
end

function BZ.Discord.Prefetch(src)
    if not BZ.Discord.Enabled() then return end
    local did = BZ.Discord.IdOf(src)
    if did and not BZ.Discord.GetRoles(did) then
        BZ.Discord.Fetch(did, function()
            if BZ.Perms then BZ.Perms.Clear(src) end
        end)
    end
end

AddEventHandler('playerJoining', function()
    BZ.Discord.Prefetch(source)
end)

AddEventHandler('onResourceStart', function(res)
    if res ~= GetCurrentResourceName() then return end
    for _, src in ipairs(GetPlayers()) do BZ.Discord.Prefetch(tonumber(src)) end
end)
