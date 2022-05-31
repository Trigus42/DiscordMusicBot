import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from "../interfaces"
import { Config } from "../config"
import * as Embeds from "../embeds"

class TLCommand extends Command {
	public name = "stop"
	public description = "Stop playing music and clear the queue"
	public aliases: string[] = []
	public needsArgs = false
	public usage = "stop"
	public guildOnly = true
	public adminOnly = false
	public ownerOnly = false
	public needsQueue = true
	public hidden = false
	public enabled = true
	public cooldown = 0
	public cooldowns: Dict = {}
	public needsUserInVC = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		const queue = distube.getQueue(message.guildId!)
		if (queue) await queue.stop()
		if (config.userConfig.actionMessages) {
			Embeds.embedBuilderMessage({
				client,
				message,
				color: "#fffff0",
				title: "Stopped playing",
				deleteAfter: 10000
			})
		}
		message.react("✅")
	}
}

export default new TLCommand()