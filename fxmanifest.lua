fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'bz-admin'
author 'Blazeeot'
version '1.0.0'
description 'A Premium Admin Menu Experience'

ui_page 'web/build/index.html'

shared_scripts {
    'config/config.lua',
    'config/permissions.lua',
    'config/locales/*.lua',
    'shared/utils.lua',
    'shared/logger.lua',
}

shared_script 'bridge/init.lua'

client_scripts {
    'bridge/frameworks/*.lua',
    'bridge/client.lua',
    'client/main.lua',
    'client/nui.lua',
    'client/state.lua',
    'client/players.lua',
    'client/self.lua',
    'client/noclip.lua',
    'client/spectate.lua',
    'client/vehicles.lua',
    'client/teleport.lua',
    'client/world.lua',
    'client/dev.lua',
}

server_scripts {
    -- oxmysql is used via runtime exports (server/database.lua), so it is
    -- intentionally NOT referenced here — the resource boots without a DB.
    'server/sv_config.lua',
    'bridge/frameworks/*.lua',
    'bridge/server.lua',
    'server/discord.lua',
    'server/database.lua',
    'server/permissions.lua',
    'server/main.lua',
    'server/players.lua',
    'server/bans.lua',
    'server/actions.lua',
    'server/world.lua',
    'server/logs.lua',
    'server/dev.lua',
}

files {
    'web/build/index.html',
    'web/build/assets/*.js',
    'web/build/assets/*.css',
    'web/build/assets/*.woff',
    'web/build/assets/*.woff2',
    'web/build/assets/*.png',
    'web/build/assets/*.svg',
    'web/build/**/*',
}

-- OneSync is required for server-side player coordinates (goto/bring/spectate).
dependencies {
    '/onesync',
}
