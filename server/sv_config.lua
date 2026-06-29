--[[ Server-only configuration. Never loaded on the client. ]]

ServerConfig = {}

-- Discord log webhooks. Paste your webhook URLs directly below.
-- Set `default` to reuse one webhook for everything, or give each category
-- its own. Leave a category empty to fall back to `default`.
ServerConfig.Webhooks = {
    default       = '',
    bans          = '',
    kicks         = '',
    warns         = '',
    money         = '',
    teleport      = '',
    selfActions   = '',
    serverActions = '',
    connections   = '',
}

-- Discord bot (used for Discord-role permissions and showing Discord names in
-- logs). Paste your bot token and guild (server) ID directly below.
ServerConfig.Discord = {
    token = '',
    guild = '',
}
