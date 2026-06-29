BZ = BZ or {}
Bridge = Bridge or {}

local registry = {}
Bridge._registry = registry
Bridge.Name = nil
Bridge.Adapter = nil
Bridge.Object = nil
Bridge.Side = IsDuplicityVersion() and 'server' or 'client'

function Bridge.Register(name, spec)
    assert(type(name) == 'string', 'Bridge.Register: name must be a string')
    spec = spec or {}
    spec.name = name
    spec.priority = spec.priority or 0
    registry[name] = spec
end

local function isStarted(res)
    return GetResourceState(res) == 'started'
end
Bridge.ResourceStarted = isStarted

function Bridge.Resolve()
    if Bridge.Adapter then return Bridge.Adapter end

    local want = (Config and Config.Framework) or 'auto'

    if want ~= 'auto' and registry[want] then
        Bridge.Adapter = registry[want]
        Bridge.Name = want
    else
        local best
        for _, spec in pairs(registry) do
            if spec.name ~= 'standalone' and type(spec.detect) == 'function' then
                local ok, detected = pcall(spec.detect)
                if ok and detected then
                    if not best or spec.priority > best.priority then best = spec end
                end
            end
        end
        Bridge.Adapter = best or registry['standalone']
        Bridge.Name = Bridge.Adapter and Bridge.Adapter.name or 'standalone'
    end

    if Bridge.Adapter and type(Bridge.Adapter.getObject) == 'function' then
        local ok, obj = pcall(Bridge.Adapter.getObject)
        if ok then Bridge.Object = obj end
    end

    BZ.Log.Print('info', ('Bridge resolved framework: ^2%s^7'):format(Bridge.Name))
    return Bridge.Adapter
end

function Bridge._handler(method)
    local adapter = Bridge.Adapter or Bridge.Resolve()
    local side = adapter and adapter[Bridge.Side]
    if side and side[method] then return side[method] end
    local std = registry['standalone']
    local stdSide = std and std[Bridge.Side]
    return stdSide and stdSide[method]
end

function Bridge.Call(method, ...)
    local fn = Bridge._handler(method)
    if not fn then return nil end
    local ok, res = pcall(fn, ...)
    if not ok then
        BZ.Log.Print('error', ('Bridge.%s failed: %s'):format(method, res))
        return nil
    end
    return res
end
