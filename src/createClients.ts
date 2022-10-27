import { SpotifyPlugin } from "@distube/spotify"
import { YtDlpPlugin } from "@distube/yt-dlp"
import { DisTube, StreamType } from "distube"

import { ActivityType, Client, IntentsBitField, Partials } from "discord.js"
import { UserConfig } from "./interfaces"

/**
   * Returns an array of available discord client and distube instance pairs.
   *
   * @param tokens - List of Discord bot tokens
   * @param userConfig - UserConfig object
   * @returns Client pair array (client, distube)
   *
*/
export async function createClients(tokens: string[], userConfig?: UserConfig) {
	const clientPairs: {discord: Client, distube: DisTube}[] = []
	for (const token of tokens) {

		// Discord client
		const discord = new Client({
			intents: [
				IntentsBitField.Flags.Guilds,
				IntentsBitField.Flags.GuildMessages,
				IntentsBitField.Flags.GuildVoiceStates,
				IntentsBitField.Flags.DirectMessages
			],
			partials: [Partials.Channel]
		})
		discord.login(token)

		// Distube instance
		const distube = new DisTube(discord, {
			youtubeCookie: userConfig.youtubeCookie ?? undefined,
			youtubeIdentityToken: userConfig.youtubeIdentityToken ?? undefined,
			nsfw: userConfig.nsfw ?? false,
			searchSongs: 10, 
			leaveOnStop: true,
			leaveOnFinish: false,
			leaveOnEmpty: true,
			streamType: StreamType.OPUS,
			plugins: userConfig.spotify ? [
				new SpotifyPlugin({
					api: {
                		clientId: userConfig.spotify.clientId,
                		clientSecret: userConfig.spotify.clientSecret},
            		parallel: true,
                	emitEventsAfterFetching: true}),
				new YtDlpPlugin()
			] : [
				new YtDlpPlugin()
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
						type: ActivityType.Playing,
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