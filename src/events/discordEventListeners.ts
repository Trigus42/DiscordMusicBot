import * as Discord from "discord.js"
import { Config } from "../config"

export function registerDiscordEventListeners(config: Config) {
	config.clientPairs.forEach(receivingClientPair => {
		receivingClientPair.discord.on("messageCreate", async message => {
			// Ignore messages from bots and webhooks
			if (message.author.bot || message.webhookId) return

			// If the message is from a guild, check if this client is the main client
			if (message.guild && config.clientPairs.length > 1 && !(config.userConfig.mainClientId === message.client.user?.id)) return

			// Get guild prefix if message is in guild; For DMs use default prefix
			let prefix: string
			if (message.guild) {
				prefix = await config.getPrefix(message.guild.id)
			} else {
				prefix = config.userConfig.prefix
			}

			// Ignore messages that don't start with the prefix or mention the bot
			if (receivingClientPair.discord.user?.id && message.mentions.members?.has(receivingClientPair.discord.user.id)) {
				message.reply({ embeds: [new Discord.MessageEmbed().setTitle(`My Prefix is "${prefix}". To get started; type ${prefix}help`)]})
				return
			} else if (!message.content.startsWith(prefix)) return

			// Extract command name and arguments from message
			const args = message.content.slice(prefix.length).trim().split(/ +/g)
			const commandName = args.shift()

			// Get command
			if (!commandName) return
			const command = config.commands.find(command => command.aliases.includes(commandName))
			if (!command) return

			command.handler(message, args, receivingClientPair, config)
		})
	})
}