import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from "../interfaces/structs"
import * as Embeds from "../embeds"
import { Config } from "../config"

class TLCommand extends Command {
	public aliases: string[] = ["shuffle", "mix"]
	public description = "Shuffle the queue"
	public enabled = true
	public needsNonEmptyQueue = true
	public needsClientInVC = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		await distube.shuffle(message)
		if (config.userConfig.actionMessages) {
			Embeds.embedBuilderMessage({
				client,
				message,
				color: "#fffff0",
				title: "Shuffled queue",
				deleteAfter: 10000
			})
		}
		message.react("✅")
	}
}

export default new TLCommand()