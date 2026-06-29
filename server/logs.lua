local RING_SIZE = 250
local ring = {}
local seq = 0

local function strip(id, prefix)
    if not id then return nil end
    return (id:gsub('^' .. prefix .. ':', ''))
end

-- Build a rich identity for a log entry from the participant's source id.
local function person(p)
    if not p then return nil end
    local entry = { name = p.name or 'Unknown', source = p.id }
    local src = p.id
    if src and GetPlayerName(src) ~= nil then
        local ids = Bridge.GetIdentifiers(src)
        entry.discordId   = strip(ids.discord, 'discord')
        entry.discordName = entry.discordId and BZ.Discord.GetName(entry.discordId) or nil
        entry.license     = ids.license
        entry.identifiers = BZ.Util.PublicIds({
            discord = ids.discord, license = ids.license,
            steam = ids.steam, fivem = ids.fivem, ip = ids.ip,
        })
    end
    return entry
end

function BZ.Log.Record(category, opts)
    seq = seq + 1
    ring[#ring + 1] = {
        id       = seq,
        category = category,
        action   = opts.action or 'action',
        admin    = person(opts.admin) or { name = 'System' },
        target   = person(opts.target),
        reason   = opts.reason,
        time     = os.time(),
    }
    if #ring > RING_SIZE then table.remove(ring, 1) end
end

BZ.RegisterRPC('logs.list', {
    perm = 'logs.view',
    handler = function(src, data)
        local out = {}
        local filter = data and data.category
        for i = #ring, 1, -1 do
            local e = ring[i]
            if not filter or filter == 'all' or e.category == filter then
                out[#out + 1] = e
            end
            if #out >= 120 then break end
        end
        return { logs = out }
    end,
})
