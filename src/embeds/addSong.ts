import * as Discord from "discord.js"
import * as DisTube from "distube"

/**
 *  Generate and send status embed
 */
export async function songEmbed(queue: DisTube.Queue, song?: DisTube.Song, title?: string) {
	// If no song is provided, use the first song in the queue
	song = song ?? queue.songs[0]

	const embed = new Discord.EmbedBuilder()
		.setColor("#fffff0")
		.setTitle(title ?? "Added a Song")
		.setDescription(`Song: [\`${song.name}\`](${song.url})`)
		.addFields({name: "Start:", value: `<t:${Math.floor(Date.now()/1000) + queue.duration - song.duration}:R>`, inline: true})
		.addFields({name: "Duration:", value: `\`${song.formattedDuration}\``, inline: true})
		.addFields({name: "Requested by:", value: `${song.user}`, inline: true})
	if (song.thumbnail) {embed.setThumbnail(song.thumbnail)}

	const embedMessage = await queue.textChannel.send({embeds: [embed]})

	// Return the message
	return embedMessage
}