import * as Discord from "discord.js"

export const Buttons : { [name: string]: Discord.ButtonBuilder } = {
	nextButton: new Discord.ButtonBuilder()
		.setStyle(Discord.ButtonStyle.Secondary)
		.setEmoji("⏭")
		.setCustomId("tracknext"),

	backButton: new Discord.ButtonBuilder()
	.setStyle(Discord.ButtonStyle.Secondary)
	.setEmoji("⏮️")
	.setCustomId("trackback"),

	playPauseButton: new Discord.ButtonBuilder()
	.setStyle(Discord.ButtonStyle.Secondary)
	.setEmoji("⏯️")
	.setCustomId("playpause"),

	stopButton: new Discord.ButtonBuilder()
	.setStyle(Discord.ButtonStyle.Secondary)
	.setEmoji("⏹")
	.setCustomId("stop"),

	lowerVolumeButton: new Discord.ButtonBuilder()
	.setStyle(Discord.ButtonStyle.Secondary)
	.setEmoji("🔉")
	.setCustomId("lower_volume"),

	raiseVolumeButton: new Discord.ButtonBuilder()
	.setStyle(Discord.ButtonStyle.Secondary)
	.setEmoji("🔊")
	.setCustomId("raise_volume"),

	seekForwardButton: new Discord.ButtonBuilder()
	.setStyle(Discord.ButtonStyle.Secondary)
	.setEmoji("▶️")
	.setCustomId("seek_forward"),

	seekBackwardButton: new Discord.ButtonBuilder()
	.setStyle(Discord.ButtonStyle.Secondary)
	.setEmoji("◀️")
	.setCustomId("seek_backward")
}