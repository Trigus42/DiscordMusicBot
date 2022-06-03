import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import * as Embeds from "../embeds"
import { default as Deezer } from "../apis/deezer"
import { Dict } from "../interfaces"

export class TLCommand extends Command {
	public aliases: string[] = ["play", "p"]
	public argsUsage = "<url> [position]"
	public description = "Add a song or playlist to the queue"
	public enabled = true
	public guildOnly = true
	public needsArgs = true
	public needsUserInVC = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube) {
		let customPlaylist: DisTube.Playlist
		if (args[0].includes("deezer.com")) {
			const type = args[0].split("/").slice(-2,-1)[0]
			if (["track", "album", "playlist", "artist"].includes(type)) {
				const tracks = await Deezer.prototype.tracks(args[0])
				const search_strings = await Promise.all(tracks.map(async track => track[0] + " - " + track[1]))
				const urls = await Promise.all(search_strings.map(async search_string => (await distube.search(search_string, {limit: 1}))[0].url))
				customPlaylist = await distube.createCustomPlaylist(urls, {member: message.member ?? undefined, properties: {message: message}})
			} else {
				Embeds.embedBuilderMessage({
					client,
					message,
					color: "RED",
					title: "Can only play tracks, albums, playlists and artists from Deezer",
					deleteAfter: 10000
				})
				return
			}
		}

		// Replace default client with the correct client
		const channel = await client.channels.fetch(message.member!.voice.channel!.id) as Discord.VoiceChannel

		message.react("✅")

		await distube.play(channel, customPlaylist! ?? args.join(" "), {
			position: Number.isInteger(Number(args[1])) ? Number(args[1]) : -1, 
			textChannel: message.channel as Discord.GuildTextBasedChannel, 
			message: message, 
			member: message.member ?? undefined,
		})
	}
}

export default new TLCommand()