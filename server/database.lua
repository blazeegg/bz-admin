BZ = BZ or {}
BZ.DB = {}

local USE_SQL = Config.Database == true and GetResourceState('oxmysql') == 'started'

local function sqlQuery(query, params)
    local p = promise.new()
    exports.oxmysql:query(query, params or {}, function(result) p:resolve(result or {}) end)
    return Citizen.Await(p)
end
local function sqlExecute(query, params)
    local p = promise.new()
    exports.oxmysql:update(query, params or {}, function(affected) p:resolve(affected) end)
    return Citizen.Await(p)
end
local function sqlInsert(query, params)
    local p = promise.new()
    exports.oxmysql:insert(query, params or {}, function(id) p:resolve(id) end)
    return Citizen.Await(p)
end

local SCHEMA = {
[[CREATE TABLE IF NOT EXISTS `bz_admin_bans` (
  `id` VARCHAR(16) NOT NULL,
  `name` VARCHAR(100) DEFAULT NULL,
  `identifiers` LONGTEXT DEFAULT NULL,
  `reason` TEXT DEFAULT NULL,
  `admin` VARCHAR(100) DEFAULT NULL,
  `admin_id` VARCHAR(64) DEFAULT NULL,
  `created` BIGINT DEFAULT 0,
  `expires` BIGINT DEFAULT 0,
  `active` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;]],
[[CREATE TABLE IF NOT EXISTS `bz_admin_warns` (
  `id` VARCHAR(16) NOT NULL,
  `identifier` VARCHAR(64) DEFAULT NULL,
  `name` VARCHAR(100) DEFAULT NULL,
  `reason` TEXT DEFAULT NULL,
  `admin` VARCHAR(100) DEFAULT NULL,
  `created` BIGINT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;]],
[[CREATE TABLE IF NOT EXISTS `bz_admin_notes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `identifier` VARCHAR(64) DEFAULT NULL,
  `note` TEXT DEFAULT NULL,
  `admin` VARCHAR(100) DEFAULT NULL,
  `created` BIGINT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;]],
}

CreateThread(function()
    if USE_SQL then
        for _, stmt in ipairs(SCHEMA) do sqlQuery(stmt) end
        BZ.Log.Print('info', 'Database ready (oxmysql).')
    elseif Config.Database == true then
        BZ.Log.Print('warn', 'Config.Database is true but oxmysql is not started — using KVP fallback.')
    else
        BZ.Log.Print('info', 'Running without MySQL — using KVP JSON store.')
    end
end)

local function kvpGet(key)
    local raw = GetResourceKvpString(key)
    if not raw then return {} end
    local ok, data = pcall(json.decode, raw)
    return ok and data or {}
end
local function kvpSet(key, value)
    SetResourceKvp(key, json.encode(value))
end

function BZ.DB.InsertBan(ban)
    if USE_SQL then
        sqlInsert('INSERT INTO bz_admin_bans (id,name,identifiers,reason,admin,admin_id,created,expires,active) VALUES (?,?,?,?,?,?,?,?,1)',
            { ban.id, ban.name, json.encode(ban.identifiers or {}), ban.reason, ban.admin, ban.admin_id, ban.created, ban.expires })
    else
        local bans = kvpGet('bans')
        bans[ban.id] = ban
        kvpSet('bans', bans)
    end
end

function BZ.DB.GetBans(activeOnly)
    if USE_SQL then
        local rows = sqlQuery('SELECT * FROM bz_admin_bans' .. (activeOnly and ' WHERE active = 1' or '') .. ' ORDER BY created DESC')
        for _, r in ipairs(rows) do
            r.identifiers = (function() local ok, d = pcall(json.decode, r.identifiers or '{}'); return ok and d or {} end)()
            r.active = r.active == 1
        end
        return rows
    end
    local out = {}
    for _, b in pairs(kvpGet('bans')) do
        if not activeOnly or b.active ~= false then out[#out + 1] = b end
    end
    table.sort(out, function(a, b) return (a.created or 0) > (b.created or 0) end)
    return out
end

function BZ.DB.FindActiveBan(identifiers)
    local now = os.time()
    for _, ban in ipairs(BZ.DB.GetBans(true)) do
        if ban.active ~= false and (ban.expires == 0 or ban.expires > now) then
            for _, id in pairs(identifiers) do
                for _, bid in pairs(ban.identifiers or {}) do
                    if id == bid then return ban end
                end
            end
        elseif ban.expires ~= 0 and ban.expires <= now then
            BZ.DB.RevokeBan(ban.id)
        end
    end
    return nil
end

function BZ.DB.RevokeBan(id)
    if USE_SQL then
        sqlExecute('UPDATE bz_admin_bans SET active = 0 WHERE id = ?', { id })
    else
        local bans = kvpGet('bans')
        if bans[id] then bans[id].active = false; kvpSet('bans', bans) end
    end
end

function BZ.DB.InsertWarn(warn)
    if USE_SQL then
        sqlInsert('INSERT INTO bz_admin_warns (id,identifier,name,reason,admin,created) VALUES (?,?,?,?,?,?)',
            { warn.id, warn.identifier, warn.name, warn.reason, warn.admin, warn.created })
    else
        local warns = kvpGet('warns'); warns[#warns + 1] = warn; kvpSet('warns', warns)
    end
end

function BZ.DB.GetWarns(identifier)
    if USE_SQL then
        return sqlQuery('SELECT * FROM bz_admin_warns WHERE identifier = ? ORDER BY created DESC', { identifier })
    end
    local out = {}
    for _, w in ipairs(kvpGet('warns')) do if w.identifier == identifier then out[#out + 1] = w end end
    return out
end

function BZ.DB.AddNote(note)
    if USE_SQL then
        sqlInsert('INSERT INTO bz_admin_notes (identifier,note,admin,created) VALUES (?,?,?,?)',
            { note.identifier, note.note, note.admin, note.created })
    else
        local notes = kvpGet('notes'); notes[#notes + 1] = note; kvpSet('notes', notes)
    end
end

function BZ.DB.GetNotes(identifier)
    if USE_SQL then
        return sqlQuery('SELECT * FROM bz_admin_notes WHERE identifier = ? ORDER BY created DESC', { identifier })
    end
    local out = {}
    for _, n in ipairs(kvpGet('notes')) do if n.identifier == identifier then out[#out + 1] = n end end
    return out
end
