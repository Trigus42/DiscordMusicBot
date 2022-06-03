import { DisTube } from "distube"
import * as Embeds from "../embeds/index"
import { Config } from "../config"
import * as Discord from "discord.js"

export function registerDistubeEventListeners(config: Config) {
	for (const {discord, distube} of config.clientPairs) {
		distube
			.on("playSong", (queue, song) => {
				Embeds.statusEmbed(queue, config, song)
				const start = config.startTimes.get(song.member.guild.id + song.member.voice.channelId + song.id)
				if (start) queue.seek(start)
			})
			.on("addSong", (queue, song) => {
				Embeds.songEmbed(queue, song)
			})
			.on("addList", (queue, playlist) => {
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
			.on("searchResult", (message, results) => {
				let i = 0
				Embeds.embedBuilderMessage({
					client: distube.client,
					message, 
					color: "#fffff0",
					title: "",
					description:
                    "**Choose an option from below**\n" +
                    results.map(song => `**${++i}**. [${song.name}](${song.url}) - \`${song.formattedDuration}\``).join("\n") +
                    "\n*Enter anything else or wait 60 seconds to cancel*"
				})
			})
			.on("searchCancel", (message) => {
				message.reactions.resolve("✅")?.users.remove(distube.client.user?.id)
				message.react("❌")
				Embeds.embedBuilderMessage({
					client: distube.client,
					message,
					color: "RED",
					title: "Searching canceled",
					description: ""
				})
			})
			.on("error", (channel, error) => {
				console.log(error)
				channel.lastMessage?.reactions.resolve("✅")?.users.remove(distube.client.user?.id)
				channel.lastMessage?.react("❌")
				Embeds.embedBuilder({
					client: distube.client,
					channel,
					color: "RED",
					title: "An error occurred:"
				})
			})
			.on("finish", async queue => {
				Embeds.embedBuilder({ 
					client: distube.client,
					channel: queue.textChannel!, 
					color: "RED", 
					title: "There are no more songs left",
					deleteAfter: 10000
				})
			})
			.on("empty", queue => {
				Embeds.embedBuilder({
					client: distube.client,
					channel: queue.textChannel!,
					color: "RED",
					title: "Left the channel cause it got empty",
					deleteAfter: 10000
				})
			})
			.on("noRelated", queue => {
				Embeds.embedBuilder({ 
					client: distube.client,
					channel: queue.textChannel!,
					color: "RED",
					title: "Can't find related video to play. Stop playing music.",
					deleteAfter: 10000
				})
			})
			.on("initQueue", queue => {
				try {
					queue.autoplay = false
					queue.volume = 100
				} catch (error) {
					console.log(error)
				}
			})
	}
}