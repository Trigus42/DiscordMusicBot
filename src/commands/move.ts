import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from "../interfaces"
import * as Embeds from "../embeds"
import { Config } from "../config"

class NewCommand extends Command {
	public name = "move"
	public description = "Move a song from one position to another in the queue"
	public aliases: string[] = ["mv"]
	public needsArgs = true
	public usage = "move <from> <to>"
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
		const queue = distube.getQueue(message)

		if (isNaN(Number(args[0])) || !isNaN(Number(args[1])) || Number(args[0]) < 1 || Number(args[1]) > queue.songs.length) {
			message.react("❌")
			Embeds.embedBuilderMessage({
				client,
				message,
				color: "RED",
				title: "Invalid song number",
				deleteAfter: 10000
			})
			return
		}
            

		// Move song from position args[0] to position args[1]
		queue.songs.splice(Number(args[1]), 0, queue.songs.splice(Number(args[0]), 1)[0])
		message.react("✅")

		if (config.userConfig.actionMessages) {
			Embeds.embedBuilderMessage({
				client,
				message,
				color: "#fffff0",
				title: "Song moved",
				description: `Moved **${args[0]}** to **${args[1]}**`,
				deleteAfter: 10000
			})
		}
	}
}

export default new NewCommand()