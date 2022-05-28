import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import * as Embeds from "../embeds"
import { Config } from "../config"
import { Dict } from "../interfaces"

class NewCommand extends Command {
	public name = "prefix"
	public description = "Changes the prefix of the bot"
	public aliases: string[] = []
	public needsArgs = false
	public usage = "prefix <NEW PREFIX>"
	public guildOnly = true
	public adminOnly = true
	public ownerOnly = false
	public needsQueue = false
	public hidden = false
	public enabled = true
	public cooldown = 0
	public cooldowns: Dict = {}

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube, config: Config) {
		// If no arguments are given, return current prefix
		if (!args[0]){
			Embeds.embedBuilderMessage({
				client,
				message,
				color: "#fffff0",
				title: `Current Prefix: \`${await config.getPrefix(message.guildId!)}\``,
				description: "Please provide a new prefix"
			})
			message.react("✅")
		}
		// If prefix includes spaces, return error
		else if (args[1]) {
			message.react("❌")
			Embeds.embedBuilderMessage({
				client,
				message,
				color: "RED",
				title: "The prefix can't have whitespaces"
			})
		}
		else {
			// Set new prefix in database
			config.setPrefix(message.guildId!, args[0])
			message.react("✅")
			Embeds.embedBuilderMessage({
				client,
				message,
				color: "#fffff0",
				title: "PREFIX",
				description: `Successfully set new prefix to **\`${args[0]}\`**`
			})
		}
	}
}

export default new NewCommand()