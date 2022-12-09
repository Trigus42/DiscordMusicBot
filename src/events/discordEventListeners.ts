import * as Discord from "discord.js"
import { Config } from "../config"

export function registerDiscordEventListeners(config: Config) {
	config.clients.forEach(async client => {
		client.on("messageCreate", async message => {
			// Ignore messages from bots and webhooks
			if (message.author.bot || message.webhookId) return

			const clientIds = config.clients.map(client => client.user.id)

			// Drop message if
			if (
				// The message is from a guild
				message.guild &&
				// And this bot uses multiple clients
				config.clients.length > 1 &&
				// And in the guild the message was sent from, there are multiple bot clients
				message.guild.presences.cache.filter(presence => clientIds.includes(presence.member.id)).values.length > 1 &&
				// And this is not the main client
				!(config.userConfig.mainClientId === message.client.user?.id)
			) return

			// Get guild prefix if message is in guild; For DMs use default prefix
			let prefix: string
			if (message.guild) {
				prefix = await config.getPrefix(message.guild.id)
			} else {
				prefix = config.userConfig.prefix
			}

			// Get message content
			await message.fetch(true)

			// Ignore messages that don't start with the prefix or mention the bot
			if (client.user?.id && message.mentions.members?.has(client.user.id)) {
				message.reply({ embeds: [new Discord.EmbedBuilder().setTitle(`My Prefix is "${prefix}". To get started; type ${prefix}help`)]})
				return
			} else if (!message.content.startsWith(prefix)) return

			// Extract command name and arguments from message
			const args = message.content.slice(prefix.length).trim().split(/ +/g)
			const commandName = args.shift()

			// Get command
			if (!commandName) return
			const command = config.commands.find(command => command.aliases.includes(commandName))
			if (!command) return

			command.handler(message, args, client, config).catch(error => {console.error(error)})
		})
	})
}