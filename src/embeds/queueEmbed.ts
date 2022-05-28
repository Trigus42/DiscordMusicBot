import * as Discord from "discord.js"
import * as DisTube from "distube"

/**
 *  Build and return array of embeds for the queue
 */
export function queueEmbed(queue: DisTube.Queue, client: Discord.Client): Discord.MessageEmbed[]  {
	const embeds = []

	// Create embeds (one per 10 songs)
	for (let i = 0; i < queue.songs.length; i += 10) {
		// Get next 10 songs
		const current = queue.songs.slice(i, i+10)

		// Create string of each song ("**Index** - [Title](Link)")
		const infos: [string[], string[], string[]] = [[], [], []]

		for (let j = 0; j < current.length; j++) {
			infos[0].push(`${j+i}`)
			infos[1].push(`[${current[j].name}](${current[j].url})`)
		}

		// Create and add embed
		const embed = new Discord.MessageEmbed()
			.setTitle(`Queue: \`${queue.voiceChannel.name}\``)
			.setColor("#fffff0")
			.setDescription(`**Current Song: [\`${queue.songs[0].name}\`](${queue.songs[0].url})**`)
			.addField("Index", infos[0].join("\n"), true)
			.addField("Song", infos[1].join("\n"), true)
			.setFooter({text: queue.client.user.username, iconURL: queue.client.user.displayAvatarURL()})
		embeds.push(embed)
	}

	// Return the embeds
	return embeds
}