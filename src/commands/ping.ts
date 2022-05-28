import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from "../interfaces"

class NewCommand extends Command {
	public name = "ping"
	public description = "Displays the bot's ping"
	public aliases: string[] = []
	public needsArgs = false
	public usage = "ping"
	public guildOnly = false
	public adminOnly = false
	public ownerOnly = false
	public needsQueue = false
	public hidden = false
	public enabled = true
	public cooldown = 0
	public cooldowns: Dict = {}

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube) {
		const ping =  Date.now() - message.createdTimestamp
		await message.channel.send(`Pong! Latency: ${ping}ms`)

		message.react("✅")
	}
}

export default new NewCommand()