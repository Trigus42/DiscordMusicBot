import * as Embeds from "../embeds"
import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Config } from "../config"
import { Dict } from "../interfaces"

class TLCommand extends Command {
	public aliases: string[] = ["volume", "vol"]
	public argsUsage = "<volume>"
	public description = "Set bot volume (0-100)"
	public enabled = true
	public guildOnly = true
	public needsArgs = true
	public needsQueue = true
	public needsUserInVC = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		distube.setVolume(message, Number(args[0]))
		Embeds.statusEmbed(distube.getQueue(message.guildId!), config)
		message.react("✅")
	}
}

export default new TLCommand()