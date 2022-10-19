import * as DisTube from "distube"
import * as Embeds from "../embeds/index"
import { Config } from "../config"
import queue from "../commands/queue"

export function registerDistubeEventListeners(config: Config) {
	config.clientPairs.forEach(async receivingClientPair => {
		const distube = receivingClientPair.distube
		distube
			.on("playSong", async (queue, song) => {
				if ((Date.now() - config.timeLastPlayStart[queue.id]) < 500) {
					await queue.stop()
					queue.emitError(Error("Queue exeeded play rate limit"), queue.textChannel)
				}
				config.timeLastPlayStart[queue.id] = Date.now()
				Embeds.statusEmbed(queue, config, song)
				const start = config.startTimes.get(song.member.guild.id + song.member.voice.channelId + song.id)
				if (start) queue.seek(start)
			})
			.on("addSong", async (queue, song) => {
				Embeds.songEmbed(queue, song)
			})
			.on("addList", async (queue, playlist) => {
				Embeds.embedBuilder({
					client: distube.client,
					channel: queue.textChannel!, 
					color: "#fffff0", 
					title: "Added a Playlist", 
					description: 
                    `Playlist: [\`${playlist.name}\`](${playlist.url})  -  \`${playlist.songs.length} songs\`` +
                    `\n\nRequested by: ${playlist.user}`, thumbnail: playlist.thumbnail
				})
			})
			.on("searchResult", async (message, results) => {
				let resultListStr
				try {
					resultListStr = (results as DisTube.SearchResultVideo[]).map(
						result => `**${++i}**. [${result.name}](${result.url}) - \`${result.formattedDuration}\``
					).join("\n")
				} catch (error) {
					resultListStr = results.map(
						result => `**${++i}**. [${result.name}](${result.url})`
					).join("\n")
				}

				let i = 0
				Embeds.embedBuilderMessage({
					client: distube.client,
					message, 
					color: "#fffff0",
					title: "",
					description:
                    "**Choose an option from below**\n" +
                    resultListStr +
                    "\n*Enter anything else or wait 60 seconds to cancel*"
				})
			})
			.on("searchCancel", async message => {
				message.reactions.resolve("✅")?.users.remove(distube.client.user?.id)
				message.react("❌")
				Embeds.embedBuilderMessage({
					client: distube.client,
					message,
					color: "Red",
					title: "Searching canceled",
					description: ""
				})
			})
			.on("error", async (channel, error) => {
				console.log(error)
				try {
					channel.lastMessage?.reactions.resolve("✅")?.users.remove(distube.client.user?.id).catch()
					channel.lastMessage?.react("❌").catch()

					Embeds.embedBuilder({
						client: distube.client,
						channel,
						color: "Red",
						title: "An error occurred"
					}).catch()
				} catch {}
			})
			.on("finish", async queue => {
				Embeds.embedBuilder({ 
					client: distube.client,
					channel: queue.textChannel!, 
					color: "Red", 
					title: "There are no more songs left",
					deleteAfter: 10000
				})
			})
			.on("empty", async queue => {
				Embeds.embedBuilder({
					client: distube.client,
					channel: queue.textChannel!,
					color: "Red",
					title: "Left the channel cause it got empty",
					deleteAfter: 10000
				})
			})
			.on("noRelated", async queue => {
				Embeds.embedBuilder({ 
					client: distube.client,
					channel: queue.textChannel!,
					color: "Red",
					title: "Can't find related video to play. Stop playing music.",
					deleteAfter: 10000
				})
			})
			.on("initQueue", async queue => {
				try {
					queue.autoplay = false
					queue.volume = 100
				} catch (error) {
					console.log(error)
				}
			})
	})
}