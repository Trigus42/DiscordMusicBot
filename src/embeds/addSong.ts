import * as Discord from "discord.js"
import * as DisTube from "distube"

/**
 *  Generate and send status embed
 */
export async function songEmbed(queue: DisTube.Queue, song?: DisTube.Song, title?: string) {
	// If no song is provided, use the first song in the queue
	song = song ?? queue.songs[0]

	const embed = new Discord.MessageEmbed()
		.setColor("#fffff0")
		.setTitle(title ?? "Added a Song")
		.setDescription(`Song: [\`${song.name}\`](${song.url})`)
		.addField("Start:", `<t:${Math.floor(Date.now()/1000) + queue.duration - song.duration}:R>`, true)
		.addField("Duration:", `\`${song.formattedDuration}\``, true)
		.addField("Requested by:", `${song.user}`, true)
	if (song.thumbnail) {embed.setThumbnail(song.thumbnail)}

	const embedMessage = await queue.textChannel.send({embeds: [embed]})

	// Return the message
	return embedMessage
}