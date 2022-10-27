import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import * as Embeds from "../embeds"
import { default as Deezer } from "../apis/deezer"
import { Regex } from "../const/regex"
import { SelectMenuBuilder } from "discord.js"

export class TLCommand extends Command {
	public aliases: string[] = ["play", "p"]
	public argsUsage = "<url> [position]"
	public description = "Add a song or playlist to the queue"
	public enabled = true
	public guildOnly = true
	public needsArgs = true
	public needsUserInVC = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube) {
		// Replace default client with the correct client
		const channel = await client.channels.fetch(message.member!.voice.channel!.id) as Discord.VoiceChannel

		let customPlaylist: DisTube.Playlist
		if (args[0].includes("deezer.com")) {
			const type = args[0].split("/").slice(-2,-1)[0]
			if (["track", "album", "playlist", "artist"].includes(type)) {
				const tracks = await Deezer.prototype.tracks(args[0]).catch((error) => {
					Embeds.embedBuilderMessage({
						client,
						message,
						color: "Red",
						title: "Cannot find playlist. Maybe it's private?",
						deleteAfter: 10000
					})
					message.react("❌")
				})
				if (!tracks) return
				const search_strings = await Promise.all(tracks.map(async track => track.title + " - " + track.artist))
				const urls = await Promise.all(search_strings.map(async search_string => (await distube.search(search_string, {limit: 1}))[0].url))
				const extractor = distube.extractorPlugins.find(plugin => plugin.validate(urls[0]))
				const songs = await Promise.all(urls.map(async url => extractor.resolve(url, {}))) as DisTube.Song[]
				customPlaylist = await distube.createCustomPlaylist(songs, {member: message.member ?? undefined, properties: {message: message}})
			} else {
				Embeds.embedBuilderMessage({
					client,
					message,
					color: "Red",
					title: "Can only play tracks, albums, playlists and artists from Deezer",
					deleteAfter: 10000
				})
				return
			}
		}

		// Return if Deezer playlist was not found
		if (customPlaylist && !customPlaylist.songs) return

		// Workaround for a bug in distube where distube tries to add the Deezer playlist to the queue but fails
		if (args[0].includes("deezer.page.link")) {
			Embeds.embedBuilderMessage({
				client,
				message,
				color: "Red",
				title: "Can only play tracks, albums, playlists and artists from Deezer",
				deleteAfter: 10000
			})
			return
		}

		if (!(Regex.urlValidate.test(args[0]))) {
			const results = await distube.search(args[0], {limit: 25})

			const row = new Discord.ActionRowBuilder()
				.addComponents(
					new SelectMenuBuilder()
						.setCustomId('select')
						.setPlaceholder('Nothing selected')
						.addOptions(results.map(result => {
							return {
								label: result.name,
								description: result.uploader.name,
								value: result.id,
							}
						})),
				) as undefined as Discord.APIActionRowComponent<Discord.APIMessageActionRowComponent> // Types seem broken so we need to assert the type
			
			const embed = new Discord.EmbedBuilder()
				.setColor("#fffff0")
				.setTitle("Search Song")
				.setDescription(`Select a song to play`)

			const embedMessage = await message.reply({
				embeds: [embed],
				components: [row]
			})

			client.on(Discord.Events.InteractionCreate, async interaction => {
				if (!interaction.isSelectMenu() || interaction.message.id != embedMessage.id) return
				interaction.deferUpdate()
				const song = results.find(result => result.id === interaction.values[0])

				await distube.play(channel, song, {
					position: Number.isInteger(Number(args[1])) ? Number(args[1]) : -1, 
					textChannel: message.channel as Discord.GuildTextBasedChannel, 
					message: message, 
					member: message.member ?? undefined,
				})
			})

			return
		}

		await distube.play(channel, customPlaylist ?? args.join(" "), {
			position: Number.isInteger(Number(args[1])) ? Number(args[1]) : -1, 
			textChannel: message.channel as Discord.GuildTextBasedChannel, 
			message: message, 
			member: message.member ?? undefined,
		})
		.then(() => {
			message.react("✅")
		})
		.catch((error) => {
			console.error(error)
			message.react("❌")
		})
	}
}

export default new TLCommand()