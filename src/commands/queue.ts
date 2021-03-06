import { BUTTONS } from "../const/buttons"
import { Command } from "../classes/command"
import * as Discord from "discord.js"
import * as DisTube from "distube"
import * as Embeds from "../embeds"
import { Dict } from "../interfaces"

class TLCommand extends Command {
	public aliases: string[] = ["queue", "qu"]
	public description = "Show the current queue"
	public enabled = true
	public needsQueue = true
	public needsUserInVC = true

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube) {
		const queue = distube.getQueue(message)

		const queue_embeds = Embeds.queueEmbed(queue, client)

		const embedMessage = await queue.textChannel!.send({
			embeds: [queue_embeds[0]],
			components: queue_embeds.length < 2 ? [] : [new Discord.MessageActionRow({components: [
				BUTTONS.nextButton
			]})]
		})

		// Exit if there is only one page of guilds (no need for all of this)
		if (queue_embeds.length < 1) return

		// Collect button interactions
		const collector = embedMessage.createMessageComponentCollector()

		let currentIndex = 0
		collector.on("collect", async (interaction: any) => {
			try {
				// Needed for some reason, otherwise you get the message "This interaction failed" although it works fine
				interaction.deferUpdate()
				// Increase/decrease index
				interaction.customId === BUTTONS.backButton.customId ? (currentIndex -= 1) : (currentIndex += 1)
				// Respond to interaction by updating message with new embed
				embedMessage.edit({
					embeds: [queue_embeds[currentIndex]],
					components: [
						new Discord.MessageActionRow({
							components: [
								// back button if it isn't the start
								...(currentIndex ? [BUTTONS.backButton] : []),
								// forward button if it isn't the end
								...(currentIndex + 1 < queue_embeds.length ? [BUTTONS.nextButton] : [])
							]
						})
					]
				})
			} catch (error) {
				console.error(error)
			}
		})

		message.react("✅")
	}
}

export default new TLCommand()