import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from "../interfaces"
import { Config } from "../config"
import { embedBuilderMessage } from "../embeds"

class TLCommand extends Command {
	public aliases: string[] = ["playlist", "pl"]
	public argsUsage = "<command> <playlist> [args]"
	public description = ""
	public enabled = true
	public needsArgs = true
	public onlyExecSubCommands = true
	public subCommands: Command[] = [
		new PlaylistAddCommand(),
		new PlaylistRemoveCommand(),
		new PlaylistDeleteCommand(),
		new PlaylistPlayCommand(),
		new PlaylistListCommand(),
		new PlaylistShowCommand()
	]
}

class PlaylistAddCommand extends Command {
	public aliases: string[] = ["add", "a"]
	public argsUsage = "<playlist> <track> [tracks...]"
	public description = "Add one or multiple songs to a playlist"
	public enabled = true
	public needsArgs = true
	public subCommands: Command[] = [new PlaylistAddFromCommand()]

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		const numberPlaylists = await config.db.models.Playlist.count({
			where: {
				userId: message.author.id
			}
		})

		if (numberPlaylists > 100) {
			embedBuilderMessage({
				client,
				message,
				color: "Red",
				title: "Too many playlists",
				description: "You can only have 100 playlists at a time."
			})
			return
		}

		const playlist = await config.getPlaylist(message.author.id, args[0])

		// Validate tracks
		const tracks: string[] = []
		const invalidTracks: string[] = []
		for (const track of args.slice(1)) {
			if (distube.extractorPlugins.find(plugin => plugin.validate(track))) {
				tracks.push(track)
			} else {
				invalidTracks.push(track)
			}
		}

		playlist.addTracks(tracks)

		embedBuilderMessage({
			client,
			message,
			color: "#fffff0",
			title: `${playlist.tracks.length > 1 ? "Updated" : "Created"} playlist ${playlist.name}`,
			description: 
				`Added ${tracks.length} track${tracks.length != 1 ? "s" : ""} to playlist.` +
				(invalidTracks.length > 0 ? `\n\n${invalidTracks.length} track${invalidTracks.length > 1 ? "s" : ""} were invalid` : "")
		})
	}
}

class PlaylistAddFromCommand extends Command {
	public aliases: string[] = ["from"]
	public argsUsage = "<playlist> <url>"
	public description = "Add a Spotify/YouTube playlist to your playlist"
	public enabled = true
	public needsArgs = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		const playlist = await config.getPlaylist(message.author.id, args[0])

		const tracks = await distube.extractorPlugins.find(plugin => plugin.validate(args[1]))?.resolve(args[1], {})

		if (tracks instanceof DisTube.Playlist) {
			playlist.addTracks(tracks.songs.map(song => song.url))
			embedBuilderMessage({
				client,
				message,
				color: "#fffff0",
				title: `${playlist.tracks.length > 1 ? "Updated" : "Created"} playlist ${playlist.name}`,
				description: `Added ${tracks.songs.length} track${tracks.songs.length != 1 ? "s" : ""} to playlist.`
			})
		} else {
			embedBuilderMessage({
				client,
				message,
				color: "Red",
				title: "Invalid playlist",
				description: "Could not resolve the url to a playlist."
			})
			return
		}
	}
}

class PlaylistRemoveCommand extends Command {
	public aliases: string[] = ["remove", "rem", "r"]
	public argsUsage = "<playlist> <index>"
	public description = "Remove song at specified index from playlist"
	public enabled = true
	public needsArgs = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		if (isNaN(Number(args[0]))) {
			embedBuilderMessage({
				client,
				message,
				color: "Red",
				title: "Invalid index",
				description: "Index must be a number"
			})
			return
		}

		const playlist = await config.getPlaylist(message.author.id, args[0])
		playlist.removeTrack(Number(args[0]))

		embedBuilderMessage({
			client,
			message,
			color: "#fffff0",
			title: `Updated playlist ${playlist.name}`,
			description: `Removed track at index ${args[0]}`
		})
	}
}

class PlaylistDeleteCommand extends Command {
	public aliases: string[] = ["delete", "del", "d"]
	public argsUsage = "<playlist>"
	public description = "Delete a playlist"
	public enabled = true
	public needsArgs = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		const playlist = await config.getPlaylist(message.author.id, args[0])
		playlist.delete()
		embedBuilderMessage({
			client,
			message,
			color: "#fffff0",
			title: `Deleted playlist ${playlist.name}`,
		})
	}
}

class PlaylistPlayCommand extends Command {
	public aliases: string[] = ["play", "p"]
	public argsUsage = "<playlist>"
	public description = "Add a playlist to queue"
	public enabled = true
	public guildOnly = true
	public needsArgs = true
	public needsUserInVC = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		const playlist = await config.getPlaylist(message.author.id, args[0])

		if (playlist.tracks.length == 0) {
			embedBuilderMessage({
				client,
				message,
				color: "Red",
				title: "No tracks in playlist",
				description: "Playlist is empty"
			})
			return
		}

		const playlistOwner = await message.guild.members.fetch(playlist.owner)
		const distubePlaylist = await distube.createCustomPlaylist(playlist.tracks, {
			member: playlistOwner ?? undefined, 
			properties: {
				name: playlist.name,
				message: message,
			}
		})

		// Replace default client with the correct client
		const channel = await client.channels.fetch(message.member?.voice.channel?.id) as Discord.VoiceChannel

		await distube.play(channel, distubePlaylist, {
			// position: Number.isInteger(Number(args[1])) ? Number(args[1]) : -1, 
			textChannel: message.channel as Discord.GuildTextBasedChannel, 
			message: message, 
			member: playlistOwner ?? undefined,
		})
	}
}

class PlaylistListCommand extends Command {
	public aliases: string[] = ["list", "l"]
	public description = "List all your playlists"
	public enabled = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		const playlists = await config.getPlaylists(message.author.id)
		if (playlists.length == 0) {
			embedBuilderMessage({
				client,
				message,
				color: "#fffff0",
				title: "No playlists",
				description: "You don't have any playlists"
			})
			return
		}

		embedBuilderMessage({
			client,
			message,
			color: "#fffff0",
			title: "Playlists",
			description: playlists.map(playlist => `**${playlist.name}** - ${playlist.tracks.length} track${playlist.tracks.length != 1 ? "s" : ""}`).join("\n")
		})
	}
}

class PlaylistShowCommand extends Command {
	public aliases: string[] = ["show", "s"]
	public argsUsage = "<playlist>"
	public description = "Show playlist"
	public enabled = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		const playlist = await config.getPlaylist(message.author.id, args[0])

		if (playlist.tracks.length == 0) {
			embedBuilderMessage({
				client,
				message,
				color: "#fffff0",
				title: "No tracks in playlist",
				description: "Playlist is empty"
			})
			return
		}

		const embed = new Discord.EmbedBuilder()
			.setColor("#fffff0")
			.setTitle(`${playlist.name}`)

		embed.addFields({name: "Index", value: playlist.tracks.map((value, index) => `**${index}**`).join("\n")})
		embed.addFields({name: "Link", value: playlist.tracks.map((value, index) => `**${value}**`).join("\n")})

		message.channel.send({ embeds: [embed] })
	}
}

export default new TLCommand()