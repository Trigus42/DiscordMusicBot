import * as Discord from "discord.js";
import { Collection } from "discord.js";
import { DisTube } from "distube"
import { Command } from "../classes/command";
import { Config } from "../config";
import * as Embeds from "../embeds/index"

export function registerDiscordEventListeners(clients: {discord: Discord.Client, distube: DisTube}[], config: Config, commands: Collection<string, Command>): void {
    const mainClient = clients[0].discord

    mainClient.on("messageCreate", async message => {
        try {
            // Ignore messages from bots, webhooks, and DMs
            if (message.author.bot || message.webhookId || !message.guild) return

            const prefix = await config.getPrefix(message.guild.id)

            // Ignore messages that don't start with the prefix or mention the bot
            if (message.mentions.members.has(mainClient.user.id)) {
                message.reply({ embeds: [new Discord.MessageEmbed().setAuthor({name: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true })}).setDescription(`My Prefix is "${prefix}". To get started; type ${prefix}help`)]})
            } else if (!message.content.startsWith(prefix)) return

            // Get the command name and arguments
            const args = message.content.slice(prefix.length).trim().split(/ +/g)
            const commandName = args.shift()

            // Check if the command exists
            if (!commands.has(commandName)) return

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

            // Execute command
            const command = commands.get(commandName)
            command.execute(message, args, client, distube, config)
        } catch (error) {
            console.error(error)
        }
    })
}