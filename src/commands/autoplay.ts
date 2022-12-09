import * as Embeds from "../embeds"
import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from "../interfaces/structs"
import { Config } from "../config"

class TLCommand extends Command {
	public aliases: string[] = ["ap"]
	public description = "Toggle autoplay"
	public enabled = true
	public guildOnly = true
	public needsNonEmptyQueue = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		message.react("✅")
		const autoplayStatus = distube.toggleAutoplay(message) ? "ON" : "OFF"

		if (config.userConfig.actionMessages) {
			Embeds.embedBuilderMessage({
				client,
				message,
				color: "#fffff0",
				title: `Autoplay is now ${autoplayStatus}`,
				deleteAfter: 10000
			})
		}

		// Update status embed autoplay status
		Embeds.statusEmbed(distube.getQueue(message.guildId!), config)
	}
}

export default new TLCommand()