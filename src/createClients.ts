import { SpotifyPlugin } from "@distube/spotify"
import { YtDlpPlugin } from "@distube/yt-dlp"
import { DisTube } from "distube"
import { Config } from "./config"
import { SapphireClient } from '@sapphire/framework'
import { prepareClients } from "./events/prepareClients"
import { registerMessageListener } from "./events/messageListener"

/**
   * Returns an array of available discord client and distube instance pairs.
   *
   * @param config - Bot config object
   * @returns Client pair array (client, distube)
   *
   */
export function createClients(config: Config) {
    let clients: {discord: SapphireClient, distube: DisTube}[] = []
    for (let token of config.userConfig.tokens) {

        // Discord client
        let discord = new SapphireClient({
            messageCacheLifetime: 0,
            messageSweepInterval: 0,
            intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES"]
        })
        // Remove default listeners to prevent duplicate events
        discord.removeAllListeners("messageCreate")
        
        discord.login(token)

        let distube = new DisTube(discord, {
            youtubeDL: false,
            youtubeCookie: config.userConfig.youtubeCookie ?? undefined,
            youtubeIdentityToken: config.userConfig.youtubeIdentityToken ?? undefined,
            nsfw: config.userConfig.nsfw ?? false,
            customFilters: config.filters,
            searchSongs: 10, 
            leaveOnStop: true,
            leaveOnFinish: false,
            leaveOnEmpty: true,
            plugins: 
                [config.userConfig.spotify ? (new SpotifyPlugin({api: {
                    clientId: config.userConfig.spotify.clientId,
                    clientSecret: config.userConfig.spotify.clientSecret},
                    parallel: true,
                    emitEventsAfterFetching: true
                }), new YtDlpPlugin()) : new YtDlpPlugin(), 
            ]
        })
        
        clients.push({discord: discord, distube: distube})
    }

    // Set client status and register distube event listeners
    prepareClients(clients, config)
    // Register message listener
    registerMessageListener(clients)

    return clients
}