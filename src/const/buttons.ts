import * as Discord from "discord.js"

export const BUTTONS : { [name: string]: Discord.MessageButton } = {
	nextButton: new Discord.MessageButton({
		style: "SECONDARY",
		emoji: "⏭",
		customId: "tracknext"
	}),

	backButton: new Discord.MessageButton({
		style: "SECONDARY",
		emoji: "⏮️",
		customId: "trackback"
	}),

	playPauseButton: new Discord.MessageButton({
		style: "SECONDARY",
		emoji: "⏯️",
		customId: "playpause"
	}),

	stopButton: new Discord.MessageButton({
		style: "SECONDARY",
		emoji: "⏹",
		customId: "stop"
	}),

	lowerVolumeButton: new Discord.MessageButton({
		style: "SECONDARY",
		emoji: "🔉",
		customId: "lower_volume"
	}),

	raiseVolumeButton: new Discord.MessageButton({
		style: "SECONDARY",
		emoji: "🔊",
		customId: "raise_volume"
	}),

	seekForwardButton: new Discord.MessageButton({
		style: "SECONDARY",
		emoji: "▶️",
		customId: "seek_forward"
	}),

	seekBackwardButton: new Discord.MessageButton({
		style: "SECONDARY",
		emoji: "◀️",
		customId: "seek_backward"
	})
}