import * as Discord from "discord.js"
import * as DisTube from "distube"

import {Buttons} from "../const/buttons"
import { Config } from "../config"

/**
 *  Generate and send status embed
 */
async function sendStatusEmbed(queue: DisTube.Queue, config: Config, song?: DisTube.Song, title?: string) {
	// If no song is provided, use the first song in the queue
	song = song ?? queue.songs[0]

	const filters = queue.filters.collection.map(filter => filter.toString().includes(queue.textChannel.guildId) ? filter.toString().split(queue.textChannel.guildId)[1] : filter.toString())

	const embed = new Discord.EmbedBuilder()
		.setColor("#fffff0")
		.setTitle(title ?? "Playing Song")
		.setDescription(`Song: [\`${song.name}\`](${song.url})`)
		.addFields(
			{name: "Ends:", value: queue.playing ? `<t:${Math.floor(Date.now()/1000 + (queue.songs[0].duration - queue.currentTime))}:R>` : "`Stopped`", inline: true},
			{name: "Queue:", value: `\`${queue.songs.length + (queue.songs.length < 2 ? " song" : " songs")} - ${queue.formattedDuration}\``, inline: true},
			{name: "Volume:", value: `\`${queue.volume} %\``, inline: true},
			{name: "Loop:", value: `  \`${queue.repeatMode ? queue.repeatMode === 2 ? "Queue" : "Song" : "❌"}\``, inline: true},
			{name: "Autoplay:", value: `\`${queue.autoplay ? "✅" : "❌"}\``, inline: true},
			{name: "Filter:", value: `\`${filters.length !== 0 ? filters : "❌"}\``, inline: true}
		)
	if (song.thumbnail) {embed.setThumbnail(song.thumbnail)}

	const row = new Discord.ActionRowBuilder()
		.addComponents(
			Buttons.playPauseButton,
			Buttons.backButton,
			Buttons.nextButton,
			Buttons.seekBackwardButton,
			Buttons.seekForwardButton,
		) as undefined as Discord.APIActionRowComponent<Discord.APIMessageActionRowComponent> // Types seem broken so we need to assert the type

	// Send new playing message
	const embedMessage = await queue.textChannel.send({
		embeds: [embed],
		components: [row]
	})

	// Save the message id to db
	config.setPlayingMessage(queue.textChannel.guildId, queue.voiceChannel.id, embedMessage.id)

	// Return the message
	return embedMessage
}

/**
 *  Send and watch the status embed
 */
export async function statusEmbed(queue: DisTube.Queue, config: Config, song?: DisTube.Song, status?: string) {
	try {
		// Delete old playing message if there is one
		try {
			await (await queue.textChannel.messages.fetch(await config.getPlayingMessage(queue.textChannel.guildId, queue.voiceChannel.id).catch()).catch()).delete().catch()
			/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
		} catch {}

		// Send new playing message
		const embedMessage = await sendStatusEmbed(queue, config, song, status)

		// Collect button interactions
		const collector = embedMessage.createMessageComponentCollector()
		collector.on("collect", async (interaction: any) => {
			// Needed for some reason, otherwise you get the message "This interaction failed" although it works fine
			interaction.deferUpdate()

			// Check if user is in the voice channel
			if (!queue.voiceChannel.members.has(interaction.member.user.id)) {return}

			switch (interaction.customId) {
				case "playpause":
					if (queue.playing) {
						queue.pause()
						statusEmbed(queue, config, song, "Paused")
					} else {
						queue.resume()
						statusEmbed(queue, config, song)
					}
					return

				case "tracknext":
					if (!queue.autoplay && queue.songs.length <= 1) {
						queue.stop()
						queue.emit("finish", queue)
					} else {
						await queue.skip()
					}
					return

				case "trackback":
					queue.previous().catch(error => {
						queue.seek(0)
					})
					return

				case "seek_backward":
					var seektime = queue.currentTime - 10
					if (seektime < 0) {seektime = 0}
					queue.seek(Number(seektime))
					statusEmbed(queue, config, song)
					return

				case "seek_forward":
					var seektime = queue.currentTime + 10
					if (seektime >= queue.songs[0].duration) { seektime = queue.songs[0].duration - 1 }
					queue.seek(Number(seektime))
					statusEmbed(queue, config, song)
					return
			}
		})
	} catch (error) {
		console.error(error)
	}
}