import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import * as Embeds from "../embeds"
import { Dict } from "../interfaces"
import { Config } from "../config"

class TLCommand extends Command {
	public aliases: string[] = ["skip", "s"]
	public argsUsage = "[position]"
	public description = "Skip song at optional queue position or current song"
	public enabled = true
	public guildOnly = true
	public needsArgs = false
	public needsQueue = true
	public needsUserInVC = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		const queue = distube.getQueue(message.guildId!)
		// If queue is empty after skipping, stop playing
		if (!queue.autoplay && queue.songs.length <= 1) {
			queue.stop()
			queue.emit("finish", queue)
		} else {
			// Skip song at queue position args[0]
			if (!isNaN(Number(args[0]))) {
				const skip = Number(args[0])
				if (Math.abs(skip) <= queue.songs.length) {
					const skippedSong = queue.songs.splice(skip, 1)[0]
					if (config.userConfig.actionMessages) {
						Embeds.embedBuilderMessage({
							client,
							message,
							color: "#fffff0",
							title: "Song skipped",
							description: `Skipped **${skip}** - ${skippedSong.name}`,
							deleteAfter: 10000
						})
					}
					// If skip is greater than queue length, send error message
				} else {
					Embeds.embedBuilderMessage({
						client,
						message,
						color: "Red",
						title: "Can't skip song at position " + skip + " because it doesn't exist",
						deleteAfter: 10000
					})
					return
				}
				// Skip song at current position if no number is given
			} else {
				const skippedSong = queue.songs[0]
				await distube.skip(message)
				if (config.userConfig.actionMessages) {
					Embeds.embedBuilderMessage({
						client,
						message,
						color: "#fffff0",
						title: "Song skipped",
						description: `Skipped **${skippedSong.name}**`,
						deleteAfter: 10000
					})
				}
			}
		}
		message.react("✅")
	}
}

export default new TLCommand()