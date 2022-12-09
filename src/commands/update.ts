import * as Embeds from "../embeds"
import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Config } from "../config"
import { Dict } from "../interfaces/structs"

class TLCommand extends Command {
	public aliases: string[] = ["update"]
	public description = "Update playback status"
	public enabled = true
	public guildOnly = true
	public needsNonEmptyQueue = true
	public needsClientInVC = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		const queue = distube.getQueue(message.guildId!)
		await Embeds.statusEmbed(queue, config, queue.songs[0])
		message.react("✅")
	}
}

export default new TLCommand()