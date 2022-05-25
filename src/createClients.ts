// Array of available clients
// Discord client, Distube instance pairs


let clients: {discord: Discord.Client, distube: DisTube.DisTube}[] = []
for (let token of db.userConfig.tokens) {

    // Discord client
    let discord = new Discord.Client({
        messageCacheLifetime: 0,
        messageSweepInterval: 0,
        intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"]
    })
    
    discord.login(token)

    let distube = new DisTube.DisTube(discord, {
        youtubeDL: false,
        youtubeCookie: db.userConfig.youtubeCookie ?? undefined,
        youtubeIdentityToken: db.userConfig.youtubeIdentityToken ?? undefined,
        nsfw: db.userConfig.nsfw ?? false,
        customFilters: db.filters,
        searchSongs: 10, 
        leaveOnStop: true,
        leaveOnFinish: false,
        leaveOnEmpty: true,
        plugins: 
            [db.userConfig.spotify ? (new SpotifyPlugin({api: {
                clientId: db.userConfig.spotify.clientId,
                clientSecret: db.userConfig.spotify.clientSecret},
                parallel: true,
                emitEventsAfterFetching: true
            }), new YtDlpPlugin()) : new YtDlpPlugin(), 
        ]
    })
    
    clients.push({discord: discord, distube: distube})
}