import * as Discord from "discord.js";
import { Collection } from "discord.js";
import { DisTube } from "distube"
import { Command } from "../classes/command";
import { Config } from "../config";
import * as Embeds from "../embeds/index"

export function registerDiscordEventListeners(clients: {discord: Discord.Client, distube: DisTube}[], config: Config): void {
    const mainClient = clients[0].discord

    mainClient.on("messageCreate", async message => {
        try {
            // Ignore messages from bots and webhooks
            if (message.author.bot || message.webhookId) return

            const prefix = await config.getPrefix(message.guild.id)

            // Ignore messages that don't start with the prefix or mention the bot
            if (message.mentions.members.has(mainClient.user.id)) {
                message.reply({ embeds: [new Discord.MessageEmbed().setAuthor({name: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true })}).setDescription(`My Prefix is "${prefix}". To get started; type ${prefix}help`)]})
            } else if (!message.content.startsWith(prefix)) return

            // Get the command name and arguments
            const args = message.content.slice(prefix.length).trim().split(/ +/g)
            const commandName = args.shift()

            // Get command
            const command = config.commands.get(commandName) ?? config.commands.find(command => command.aliases.includes(commandName))
            if (!command) return

            // Get pair of client and distube for the members voice channel or use a new pair if member is in a new voice channel
            let clientArray = clients.find(i =>
                i.distube.getQueue(message.guildId) ? // Check if client has a queue
                i.distube.getQueue(message.guildId).voiceChannel.id === message.member.voice.channel.id : false // Check if client queue is in the same voice channel as the message author
            ) ?? clients.find(i => // If no client has been found, use a new client
                !i.distube.getQueue(message.guildId) // Check if client has no queue
                && i.discord.guilds.fetch().then(guilds => guilds.has(message.guildId)) // Check if client is in the same guild as the message author
            )

            if (!clientArray) {
                Embeds.embedBuilderMessage(mainClient, message, "RED", "❌ There are no available clients", "Please try again later or free up one of the clients")
                return
            }

            let client = clientArray.discord
            let distube = clientArray.distube
            let queue = distube.getQueue(message.guild.id)

            // Switch queue channel if new command is sent in different text channel
            if (queue) {
                queue.textChannel = message.channel as Discord.TextChannel
            }

            // Check if command can be executed in the current state
            if (command.adminOnly && !message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
                Embeds.embedBuilderMessage(client, message, "RED",  "❌ You don't have permission for this Command")
                return
            } else if (command.guildOnly && !message.guild) {
                Embeds.embedBuilderMessage(client, message, "RED",  "❌ This Command can only be used in a server")
                return
            } else if (command.ownerOnly && !(message.author.id === config.userConfig.ownerId)) {
                Embeds.embedBuilderMessage(client, message, "RED",  "❌ You don't have permission for this Command")
                return
            } else if (command.cooldown > 0) {
                if (message.author.id in command.cooldowns) {
                    const expirationTime = command.cooldowns[message.author.id]
                    if (expirationTime > Date.now()) {
                        const timeLeft = (expirationTime - Date.now()) / 1000
                        Embeds.embedBuilderMessage(client, message, "RED", `❌ You can use this command again in ${timeLeft.toFixed(1)} seconds`)
                        return
                    }
                } else {
                    command.cooldowns[message.author.id] = Date.now() + command.cooldown
                }
            }

            // Execute command
            command.execute(message, args, client, distube, config)
        } catch (error) {
            console.error(error)
        }
    })
}