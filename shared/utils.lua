BZ = BZ or {}
BZ.Util = {}

local U = BZ.Util

function U.L(key, ...)
    local pack = Locales[Config.Locale] or Locales['en'] or {}
    local str  = pack[key] or (Locales['en'] and Locales['en'][key]) or key
    if select('#', ...) > 0 then
        local ok, res = pcall(string.format, str, ...)
        return ok and res or str
    end
    return str
end

function U.PermMatch(granted, required)
    if granted == '*' or granted == required then return true end
    local prefix = granted:match('^(.-)%.%*$')
    if prefix then
        return required == prefix or required:sub(1, #prefix + 1) == (prefix .. '.')
    end
    return false
end

function U.HasAnyPerm(list, required)
    if not list then return false end
    for _, granted in ipairs(list) do
        if U.PermMatch(granted, required) then return true end
    end
    return false
end

function U.Clamp(n, min, max)
    n = tonumber(n) or 0
    if n < min then return min end
    if n > max then return max end
    return n
end

function U.Round(n, decimals)
    local mult = 10 ^ (decimals or 0)
    return math.floor((tonumber(n) or 0) * mult + 0.5) / mult
end

function U.Duration(seconds)
    if not seconds or seconds <= 0 then return U.L('ban_perma') end
    local units = { { 'd', 86400 }, { 'h', 3600 }, { 'm', 60 }, { 's', 1 } }
    local out, remaining = {}, math.floor(seconds)
    for _, u in ipairs(units) do
        local v = math.floor(remaining / u[2])
        if v > 0 then out[#out + 1] = v .. u[1]; remaining = remaining % u[2] end
    end
    return #out > 0 and table.concat(out, ' ') or '0s'
end

function U.Json(t)
    local ok, res = pcall(json.encode, t)
    return ok and res or '{}'
end

function U.ShortId(len)
    local chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    local id = {}
    for _ = 1, (len or 8) do
        local i = math.random(#chars)
        id[#id + 1] = chars:sub(i, i)
    end
    return table.concat(id)
end

function U.Merge(a, b, overwrite)
    a = a or {}
    for k, v in pairs(b or {}) do
        if overwrite or a[k] == nil then a[k] = v end
    end
    return a
end

-- Coerce to a trimmed string, strip control characters and cap the length.
-- Used on every free-text field that reaches a log, the database, or chat.
function U.Sanitize(str, maxLen)
    if type(str) ~= 'string' then return '' end
    str = str:gsub('[%z\1-\8\11\12\14-\31]', '')
    str = str:gsub('^%s+', ''):gsub('%s+$', '')
    maxLen = maxLen or (Config and Config.MaxTextLength) or 200
    if #str > maxLen then str = str:sub(1, maxLen) end
    return str
end

-- Remove the IP from an identifier map unless Config.ShowIPs is enabled.
function U.PublicIds(ids)
    if not ids or (Config and Config.ShowIPs) then return ids or {} end
    local out = {}
    for k, v in pairs(ids) do if k ~= 'ip' then out[k] = v end end
    return out
end
