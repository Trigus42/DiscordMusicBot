import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from "../interfaces"
import { Config } from "../config"
import { embedBuilderMessage } from "../embeds"

class TLCommand extends Command {
	public name = "playlist"
	public description = ""
	public aliases: string[] = ["playlist", "pl"]
	public needsArgs = true
	public usage = "playlist <command> <playlist name> [args]"
	public guildOnly = false
	public adminOnly = false
	public ownerOnly = false
	public needsQueue = false
	public hidden = false
	public enabled = true
	public cooldown = 0
	public cooldowns: Dict = {}
	public subCommands: Command[] = [new PlaylistAddCommand(), new PlaylistRemoveCommand(), new PlaylistDeleteCommand(), new PlaylistPlayCommand(), new PlaylistListCommand()]
}

class PlaylistAddCommand extends Command {
	public name = "playlist add"
	public description = "Add one or multiple songs to a playlist"
	public aliases: string[] = ["add", "a"]
	public needsArgs = true
	public usage = "playlist add <playlist name> <track> [track] [track]..."
	public guildOnly = false
	public adminOnly = false
	public ownerOnly = false
	public needsQueue = false
	public hidden = false
	public enabled = true
	public cooldown = 0
	public cooldowns: Dict = {}
	public subCommands: Command[] = []

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
				color: "RED",
				title: "Too many playlists",
				description: "You can only have 100 playlists at a time."
			})
			return
		}

		const playlist = await config.getPlaylist(message.author.id, args[0])

		// Validate tracks
		let tracks: string[] = []
		let invalidTracks: string[] = []
		for (let track of args.slice(1)) {
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

class PlaylistRemoveCommand extends Command {
	public name = "playlist remove"
	public description = "Remove song at specified index from playlist"
	public aliases: string[] = ["remove", "rem", "r"]
	public needsArgs = true
	public usage = "playlist remove <playlist name> <index>"
	public guildOnly = false
	public adminOnly = false
	public ownerOnly = false
	public needsQueue = false
	public hidden = false
	public enabled = true
	public cooldown = 0
	public cooldowns: Dict = {}
	public subCommands: Command[] = []

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		if (isNaN(Number(args[0]))) {
			embedBuilderMessage({
				client,
				message,
				color: "RED",
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
	public name = "playlist delete"
	public description = "Delete a playlist"
	public aliases: string[] = ["delete", "del", "d"]
	public needsArgs = true
	public usage = "playlist delete <playlist name>"
	public guildOnly = false
	public adminOnly = false
	public ownerOnly = false
	public needsQueue = false
	public hidden = false
	public enabled = true
	public cooldown = 0
	public cooldowns: Dict = {}
	public subCommands: Command[] = []

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
	public name = "playlist play"
	public description = "Add a playlist to queue"
	public aliases: string[] = ["play", "p"]
	public needsArgs = true
	public usage = "playlist play <playlist name>"
	public guildOnly = true
	public adminOnly = false
	public ownerOnly = false
	public needsQueue = false
	public hidden = false
	public enabled = true
	public cooldown = 0
	public cooldowns: Dict = {}
	public subCommands: Command[] = []
	public needsUserInVC = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		const playlist = await config.getPlaylist(message.author.id, args[0])

		if (playlist.tracks.length == 0) {
			embedBuilderMessage({
				client,
				message,
				color: "RED",
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
	public name = "playlist list"
	public description = "List all your playlists"
	public aliases: string[] = ["list", "l"]
	public needsArgs = false
	public usage = "playlist list"
	public guildOnly = false
	public adminOnly = false
	public ownerOnly = false
	public needsQueue = false
	public hidden = false
	public enabled = true
	public cooldown = 0
	public cooldowns: Dict = {}
	public subCommands: Command[] = []

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

export default new TLCommand()