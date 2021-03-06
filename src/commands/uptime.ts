import * as Embeds from "../embeds"
import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Config } from "../config"
import { Dict } from "../interfaces"

class TLCommand extends Command {
	public aliases: string[] = ["uptime"]
	public description = "Prints the bot's uptime"
	public enabled = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		const days = Math.floor(client.uptime / 86400000)
		const hours = Math.floor(client.uptime / 3600000) % 24
		const minutes = Math.floor(client.uptime / 60000) % 60
		const seconds = Math.floor(client.uptime / 1000) % 60
		Embeds.embedBuilderMessage({ client, message, color: "#fffff0", title: "UPTIME:", description: `\`${days}d\` \`${hours}h\` \`${minutes}m\` \`${seconds}s\n\`` })
		message.react("✅")
	}
}

export default new TLCommand()