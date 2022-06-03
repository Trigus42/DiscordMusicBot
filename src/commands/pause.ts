import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from "../interfaces"
import { Config } from "../config"
import { statusEmbed } from "../embeds"

class TLCommand extends Command {
	public aliases: string[] = ["pause"]
	public description = "Pause the current song"
	public enabled = true
	public guildOnly = true
	public needsQueue = true
	public needsUserInVC = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		distube.pause(message)
		statusEmbed(distube.getQueue(message.guildId!), config)
		message.react("✅")
	}
}

export default new TLCommand()