import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from "../interfaces"
import { Config } from "../config"
import * as Embeds from "../embeds"

class NewCommand extends Command {
	public name = "seek"
	public description = "Seek to a specific time in the current song"
	public aliases: string[] = []
	public needsArgs = true
	public usage = "seek <HH:MM:SS>"
	public guildOnly = true
	public adminOnly = false
	public ownerOnly = false
	public needsQueue = true
	public hidden = false
	public enabled = true
	public cooldown = 0
	public cooldowns: Dict = {}
	public needsUserInVC = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube, config: Config) {
		// Get time in seconds from HH:MM:SS time_string
		const time_array = args[0].split(":")
		let time_seconds = 0
		for (let i = 0; i < time_array.length; i++) {
			time_seconds += parseInt(time_array[i]) * Math.pow(60, (time_array.length - 1) - i)
		}
		distube.seek(message, time_seconds)

		if (config.userConfig.actionMessages) {
			Embeds.embedBuilderMessage({
				client,
				message,
				color: "#fffff0",
				title: "Seeked",
				description: `Seeked to **${args[0]}** in song **${distube.getQueue(message.guildId!).songs[0].name}**`,
				deleteAfter: 10000
			})
		}
		Embeds.statusEmbed(distube.getQueue(message.guildId!), config)
		message.react("✅")
	}
}

export default new NewCommand()