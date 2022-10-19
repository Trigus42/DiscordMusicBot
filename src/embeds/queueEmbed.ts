import * as Discord from "discord.js"
import * as DisTube from "distube"

/**
 *  Build and return array of embeds for the queue
 */
export function queueEmbed(queue: DisTube.Queue, client: Discord.Client): Discord.EmbedBuilder[]  {
	const embeds = []

	let i = 0
	while (i < queue.songs.length) {
		// Create string of each song ("**Index** - [Title](Link)")
		const infos: [string[], string[], string[]] = [[], [], []]

		while(i < queue.songs.length) {
			// Discord embeds have a maximum of 1024 characters. This checks if the current embed is getting too big
			if (infos.reduce((a, b) => a + (b).join("\n").length, 0) >= 850) break

			infos[0].push(`${i}`)
			infos[1].push(`[${queue.songs[i].name}](${queue.songs[i].url})`)
			i += 1
		}

		// Create and add embed
		const embed = new Discord.EmbedBuilder()
			.setTitle(`Queue: \`${queue.voiceChannel.name}\``)
			.setColor("#fffff0")
			.setDescription(`**Current Song: [\`${queue.songs[0].name}\`](${queue.songs[0].url})**`)
			.addFields(
				{name: "Index", value: infos[0].join("\n"), inline: true},
				{name: "Song", value: infos[1].join("\n"), inline: true}
			)
		embeds.push(embed)
	}

	// Return the embeds
	return embeds
}