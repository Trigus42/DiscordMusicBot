import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from "../interfaces"
import * as Embeds from "../embeds"
import { Config } from "../config"

class TLCommand extends Command {
	public name = "shuffle"
	public description = "Shuffle the queue"
	public aliases: string[] = ["mix"]
	public needsArgs = false
	public usage = "shuffle"
	public guildOnly = false
	public adminOnly = false
	public ownerOnly = false
	public needsQueue = true
	public hidden = false
	public enabled = true
	public cooldown = 0
	public cooldowns: Dict = {}
	public needsUserInVC = true

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