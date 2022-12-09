import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import * as Embeds from "../embeds"
import { Dict } from "../interfaces/structs"
import { Config } from "../config"

class TLCommand extends Command {
	public aliases: string[] = ["jump", "j"]
	public argsUsage = "<POSITION>"
	public description = "Jumps to a song in queue"
	public enabled = true
	public guildOnly = true
	public needsArgs = true
	public needsNonEmptyQueue = true
	public needsClientInVC = true
	public subCommands = [
		new JumpPrevCommand()
	]

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		const queue = distube.getQueue(message)
		let index = Number(args[0])
		
		if (isNaN(index) || index+1 > queue.songs.length || index < -queue.songs.length) {
			message.react("❌")
			Embeds.embedBuilderMessage({
				client,
				message,
				color: "Red",
				title: "Invalid song number",
				deleteAfter: 10000
			})
			return
		}
		
		queue.songs = queue.songs.slice(index)
		queue.seek(0)
		Embeds.statusEmbed(distube.getQueue(message.guildId!), config)

		if (config.userConfig.actionMessages) {
			Embeds.embedBuilderMessage({
				client,
				message,
				color: "#fffff0",
				title: "Jumped to song",
				description: `Jumped to **${queue.songs[0].name}**`,
				deleteAfter: 10000
			})
		}

		message.react("✅")
	}
}

class JumpPrevCommand extends Command {
	public aliases: string[] = ["previous", "prev", "p"]
	public argsUsage = "<POSITION>"
	public description = "Jumps back in the queue"
	public enabled = true
	public guildOnly = true
	public needsArgs = true
	public needsNonEmptyQueue = true
	public needsClientInVC = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		const queue = distube.getQueue(message)
		let index = Number(args[0])

		if (queue.previousSongs.length < index+1 || index < -queue.previousSongs.length) {
			message.react("❌")
			Embeds.embedBuilderMessage({
				client,
				message,
				color: "Red",
				title: "Invalid song number",
				deleteAfter: 10000
			})
			return
		}

		queue.songs.unshift(...queue.previousSongs.splice(0, index < 0 ? queue.previousSongs.length - index + 1: index))
		queue.seek(0)
		Embeds.statusEmbed(distube.getQueue(message.guildId!), config)

		if (config.userConfig.actionMessages) {
			Embeds.embedBuilderMessage({
				client,
				message,
				color: "#fffff0",
				title: "Jumped back in queue",
				description: `Jumped to **${queue.songs[0].name}**`,
				deleteAfter: 10000
			})
		}

		message.react("✅")
	}
}

export default new TLCommand()