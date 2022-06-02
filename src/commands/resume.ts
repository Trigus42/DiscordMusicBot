import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from "../interfaces"
import { statusEmbed } from "../embeds"
import { Config } from "../config"

class TLCommand extends Command {
	public aliases: string[] = ["resume"]
	public description = "Resume the current song"
	public enabled = true
	public guildOnly = true
	public needsQueue = true
	public needsUserInVC = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		distube.resume(message)
		statusEmbed(distube.getQueue(message.guildId!), config)
		message.react("✅")
	}
}

export default new TLCommand()