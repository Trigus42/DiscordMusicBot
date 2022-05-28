import { SpotifyPlugin } from "@distube/spotify"
import { YtDlpPlugin } from "@distube/yt-dlp"
import { DisTube } from "distube"
import { Config } from "../config"

import { Client, Intents } from "discord.js"

/**
   * Returns an array of available discord client and distube instance pairs.
   *
   * @param config - Bot config object
   * @returns Client pair array (client, distube)
   *
   */
export async function createClients(config: Config) {
	const clientPairs: {discord: Client, distube: DisTube}[] = []
	for (const token of config.userConfig.tokens) {

		// Discord client
		const discord = new Client({
			messageCacheLifetime: 0,
			messageSweepInterval: 0,
			intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.DIRECT_MESSAGES],
			partials: ["CHANNEL"]
		})
		discord.login(token)

		// Distube instance
		const distube = new DisTube(discord, {
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

		// Log when the bot is ready
		discord.on("ready", async () => {
			console.log(`Client "${discord.user?.tag}" is ready. Invite link: https://discord.com/oauth2/authorize?client_id=${discord.user.id}&permissions=105330560064&scope=bot`)
			discord.user?.setPresence({
				status: "online",
				activities: [
					{
						name: "Music",
						type: "PLAYING",
					}
				]
			})
		})

		// Log when reconnecting
		discord.on("reconnecting", () => {
			console.log(`Client "${discord.user?.tag}" is reconnecting`)
			discord.user?.setPresence({ status: "invisible" })
		})

		// Log when disconnected
		discord.on("disconnect", () => {
			console.log(`Client "${discord.user?.tag}" is disconnected`) 
			discord.user?.setPresence({ status: "invisible" })
		})
        
		clientPairs.push({discord: discord, distube: distube})
	}

	return clientPairs
}