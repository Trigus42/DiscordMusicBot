import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from "../interfaces"
import * as Embeds from "../embeds"
import { Config } from "../config"

class TLCommand extends Command {
	public description = "Move a song from one position to another in the queue"
	public aliases: string[] = ["move", "mv"]
	public argsUsage = "<from> <to>"
	public enabled = true
	public guildOnly = true
	public needsArgs = true
	public needsUserInVC = true
	public verboseDescription = 
		"This command moves a song from one position to another in the queue. " +
		"The song at the `<from>` position will be moved to the `<to>` position, and the song that was previously at the `<to>` position will be moved back by one.\n" +
		"If the song is moved to position `0`, the current playback progress is saved, the new song is played and the playback is resumed later."

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		const queue = distube.getQueue(message)

		if (isNaN(Number(args[0])) || isNaN(Number(args[1])) || Math.abs(Number(args[0])) > queue.songs.length || Math.abs(Number(args[0])) > queue.songs.length) {
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

		// If song is moved to position 0, save current playback progress
		if (Number(args[1]) === 0) {
			config.startTimes.set(message.guild.id + message.member.voice.channelId + queue.songs[0].id, queue.currentTime)
		}
		// Insert song at new position, move the old song back one position
		queue.songs.splice(Number(args[1]), 0, queue.songs.splice(Number(args[0]), 1)[0])
		// If currently playing song has changed, start playing the new song and update the embed
		if (Number(args[1]) === 0) {
			queue.seek(0)
			Embeds.statusEmbed(queue, config)
		}
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

export default new TLCommand()