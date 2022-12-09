import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import * as Embeds from "../embeds"
import { Config } from "../config"

class TLCommand extends Command {
	public aliases: string[] = ["back", "b"]
	public description = "Plays the previous song"
	public enabled = true
	public guildOnly = true
	public needsArgs = false
	public needsNonEmptyQueue = true
	public needsClientInVC = true

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		const queue = distube.getQueue(message)

        if (!queue.previousSongs || !queue.previousSongs.length) {
            message.react("❌")
			Embeds.embedBuilderMessage({
				client,
				message,
				color: "Red",
				title: "There is no previous song",
				deleteAfter: 10000
			})
            return
        }

        queue.previous()
		
		if (config.userConfig.actionMessages) {
			Embeds.embedBuilderMessage({
				client,
				message,
				color: "#fffff0",
				title: "Jumped to song",
				description: `Jumped to **${queue.songs[0].name}**`,
				deleteAfter: 10000
			})
		}

		message.react("✅")
	}
}

export default new TLCommand()