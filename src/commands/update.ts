import * as Embeds from "../embeds"
import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Config } from "../config"
import { Dict } from "../interfaces"

class NewCommand extends Command {
	public name = "update"
	public description = "Update playback status"
	public aliases: string[] = []
	public needsArgs = false
	public usage = "update"
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
		const queue = distube.getQueue(message.guildId!)
		await Embeds.statusEmbed(queue, config, queue.songs[0])
		message.react("✅")
	}
}

export default new NewCommand()