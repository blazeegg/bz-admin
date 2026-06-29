BZ = BZ or {}
BZ.Perms = {}

local roleById = {}
for _, role in ipairs(Config.Permissions.roles) do roleById[role.id] = role end

local function expandPermissions(role)
    local set = {}
    for _, perm in ipairs(role.permissions or {}) do
        if perm == '*' then
            for _, key in ipairs(Config.Permissions.catalog) do set[key] = true end
        elseif perm:match('%.%*$') then
            local prefix = perm:gsub('%.%*$', '')
            for _, key in ipairs(Config.Permissions.catalog) do
                if key == prefix or key:sub(1, #prefix + 1) == prefix .. '.' then set[key] = true end
            end
        else
            set[perm] = true
        end
    end
    return set
end

for _, role in ipairs(Config.Permissions.roles) do role._permSet = expandPermissions(role) end

local function inList(list, value)
    for _, v in ipairs(list or {}) do
        if tostring(v) == tostring(value) then return true end
    end
    return false
end

function BZ.Perms.Resolve(src)
    local identifiers = Bridge.GetIdentifiers(src)
    local group = Bridge.GetGroup(src)
    local discordId = BZ.Discord and BZ.Discord.IdOf(src) or nil
    local discordRoles = discordId and BZ.Discord.GetRoles(discordId) or nil
    local best

    for _, role in ipairs(Config.Permissions.roles) do
        local matched = false
        local d = role.discord or {}

        if role.ace and IsPlayerAceAllowed(src, role.ace) then matched = true end

        if not matched and discordId and inList(d.ids, discordId) then matched = true end

        if not matched and discordRoles and d.roles then
            for _, want in ipairs(d.roles) do
                if inList(discordRoles, want) then matched = true break end
            end
        end

        if not matched and role.identifiers then
            for _, want in ipairs(role.identifiers) do
                for _, have in pairs(identifiers) do
                    if want == have then matched = true break end
                end
                if matched then break end
            end
        end

        if not matched and role.groups then
            for _, g in ipairs(role.groups) do
                if g == group then matched = true break end
            end
        end

        if matched and (not best or role.power > best.power) then best = role end
    end

    return best
end

local cache = {}

function BZ.Perms.GetRole(src)
    local c = cache[src]
    if c and (os.time() - c.ts) < 30 then return c.role end
    local role = BZ.Perms.Resolve(src)
    cache[src] = { role = role, ts = os.time() }
    return role
end

function BZ.Perms.Clear(src) cache[src] = nil end

AddEventHandler('playerDropped', function() BZ.Perms.Clear(source) end)

function BZ.Perms.IsAdmin(src)
    return BZ.Perms.GetRole(src) ~= nil
end

function BZ.Perms.Has(src, perm)
    local role = BZ.Perms.GetRole(src)
    if not role then return false end
    if role._permSet['*'] then return true end
    return role._permSet[perm] == true
end

function BZ.Perms.Power(src)
    local role = BZ.Perms.GetRole(src)
    return role and role.power or 0
end

function BZ.Perms.CanTarget(adminSrc, targetSrc)
    if tonumber(adminSrc) == tonumber(targetSrc) then return true end
    return BZ.Perms.Power(adminSrc) > BZ.Perms.Power(targetSrc)
end

function BZ.Perms.Summary(src)
    local role = BZ.Perms.GetRole(src)
    if not role then return nil end
    local perms = {}
    for key in pairs(role._permSet) do perms[#perms + 1] = key end
    return {
        roleId = role.id, label = role.label, color = role.color,
        power = role.power, permissions = perms,
    }
end
