import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from "../interfaces"

class TLCommand extends Command {
	public aliases: string[] = ["ping"]
	public description = "Displays the bot's ping"
	public enabled = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube) {
		const ping =  Date.now() - message.createdTimestamp
		await message.channel.send(`Pong! Latency: ${ping}ms`)

		message.react("✅")
	}
}

export default new TLCommand()