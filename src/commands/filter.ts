import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Config } from "../config"
import * as Embeds from "../embeds"
import { Dict } from "../interfaces/structs"

class TLCommand extends Command {
	public aliases: string[] = ["filter", "f"]
	public argsUsage = "<name>"
	public description = "Toggle filters"
	public enabled = true
	public guildOnly = true
	public needsArgs = true
	public subCommands = [
		new AddFilterCommand(),
		new DelFilterCommand(),
	]

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		const queue = distube.getQueue(message.guildId!)
		// Add filter
		if (args[0] === "add") { 
			await config.setFilter(message.guildId!, args[1], args[2])
		// Delete filter
		} else if (args[0] === "del") {
			await config.deleteFilter(message.guildId!, args[1])
		// Apply filter
		} else {
			// Check if filter exists
			const filter = await config.getFilter(message.guildId!, args[0])
			if (filter) {
				// Toggle filter
				distube.filters[message.guildId + args[0]] = filter
				if (queue.filters.has(message.guildId + args[0])) {
					queue.filters.remove(message.guildId + args[0])
				} else {
					queue.filters.add(message.guildId + args[0])
				}

				if (config.userConfig.actionMessages) {
					Embeds.embedBuilderMessage({
						client,
						message,
						color: "#fffff0",
						title: `Toggled filter ${args[0]}`,
						deleteAfter: 10000
					})
				}

				// Update status embed filter status
				Embeds.statusEmbed(queue, config)
			} else {
				message.react("❌")
				Embeds.embedBuilderMessage({
					client,
					message,
					color: "Red",
					title: "Filter not found",
					deleteAfter: 10000
				})
				return
			}
		}
		message.react("✅")
	}
}

class AddFilterCommand extends Command {
	public aliases = ["add", "a"]
	public argsUsage = "<name> <filter_params>"
	public description = "Add a filter"
	public enabled = true
	public guildOnly = true
	public needsArgs = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		await config.setFilter(message.guildId!, args[0], args[1])
		message.react("✅")
	}
}


class DelFilterCommand extends Command {
	public aliases = ["del", "d"]
	public argsUsage = "<name>"
	public description = "Delete a filter"
	public enabled = true
	public guildOnly = true
	public needsArgs = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		await config.deleteFilter(message.guildId!, args[0])
		message.react("✅")
	}
}


export default new TLCommand()