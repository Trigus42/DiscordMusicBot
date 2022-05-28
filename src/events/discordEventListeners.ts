import * as Discord from "discord.js";
import * as DisTube from "distube"
import queue from "../commands/queue";
import { Config } from "../config";
import * as Embeds from "../embeds/index"

export function registerDiscordEventListeners(clientPairs: {discord: Discord.Client, distube: DisTube.DisTube}[], config: Config): void {
    clientPairs.forEach(receivingClientPair => {
        receivingClientPair.discord.on("messageCreate", async message => {
            // Ignore messages from bots and webhooks
            if (message.author.bot || message.webhookId) return

            // If the message is from a guild, check if this client is the main client
            if (message.guild && clientPairs.length > 1 && !(config.userConfig.mainClientId === message.client.user?.id)) return

            // Get guild prefix if message is in guild; For DMs use default prefix
            let prefix: string
            if (message.guild) {
                prefix = await config.getPrefix(message.guild.id)
            } else {
                prefix = config.userConfig.prefix
            }

            // Ignore messages that don't start with the prefix or mention the bot
            if (receivingClientPair.discord.user?.id && message.mentions.members?.has(receivingClientPair.discord.user.id)) {
                message.reply({ embeds: [new Discord.MessageEmbed().setAuthor({name: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true })}).setDescription(`My Prefix is "${prefix}". To get started; type ${prefix}help`)]})
                return
            } else if (!message.content.startsWith(prefix)) return

            // Extract command name and arguments from message
            const args = message.content.slice(prefix.length).trim().split(/ +/g)
            const commandName = args.shift()

            // Get command
            if (!commandName) return
            const command = config.commands.get(commandName) ?? config.commands.find(command => command.aliases.includes(commandName))
            if (!command) return

            // Check if the command can be used in the current context
            if (command.guildOnly && !message.guild) {
                Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: "This Command can only be used in a server" })
                return
            } else if (command.ownerOnly && !(message.author.id === config.userConfig.ownerId)) {
                Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: "You don't have permission for this command" })
                return
            } else if ((command.needsUserInVC || command.needsQueue) && !message.member?.voice.channel) {
                Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: "You need to be in a voice channel to use this command" })
                return
            } else if (command.needsArgs && !args.length) {
                Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: `You didn't provide any arguments for the ${command.name} command` })
                return
            } else if (command.cooldown > 0) {
                if (message.author.id in command.cooldowns) {
                    const expirationTime = command.cooldowns[message.author.id]
                    if (expirationTime > Date.now()) {
                        const timeLeft = (expirationTime - Date.now()) / 1000
                        Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: `You can use this command again in ${timeLeft.toFixed(1)} seconds` })
                        return
                    }
                } else {
                    command.cooldowns[message.author.id] = Date.now() + command.cooldown
                }
            }

            // Guilds
            if (message.guildId) {
                // Check if command can be executed in the current state
                if (command.adminOnly && !message.member?.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
                    Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: "You don't have permission for this command" })
                    return
                } else if (command.needsQueue && !queue) {
                    Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: `There is nothing playing in the queue` })
                    return
                }

                // If this command needs the client to be in a voice channel, get an available client
                if (command.needsUserInVC) {
                    // Get pair of client and distube for the members voice channel or use a new pair if member is in a new voice channel
                    let chosenClientPair = clientPairs.find(clientPair =>
                        clientPair.distube.getQueue(message.guildId!) ? // Check if client has a queue
                        clientPair.distube.getQueue(message.guildId!)?.voiceChannel?.id === message.member!.voice.channel!.id : false // Check if client queue is in the same voice channel as the message author
                    ) ?? clientPairs.find(clientPair => // If no client has been found, use a new client
                        !clientPair.distube.getQueue(message.guildId!) // Check if client has no queue
                        && clientPair.discord.guilds.fetch().then(guilds => guilds.has(message.guildId!)) // Check if client is in the same guild as the message author
                    )

                    if (!chosenClientPair) {
                        Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: "There are no available clients", description: "Please try again later or free up one of the clients" })
                        return
                    }

                    let queue = chosenClientPair.distube.getQueue(message.guildId)
                    
                    // Switch queue channel if new command is sent in different text channel
                    if (queue) {
                        queue.textChannel = message.channel as Discord.TextChannel
                    }

                    command.execute(message, args, chosenClientPair.discord, chosenClientPair.distube, config)

                // If this command doesn't need the client to be in a voice channel, just use the main client to execute the command
                } else {
                    command.execute(message, args, receivingClientPair.discord, receivingClientPair.distube, config)
                }

            // DMs
            } else {
                let discord = message.client
                let distube = clientPairs.find(clientPair => clientPair.discord === discord)?.distube
                command.execute(message, args, discord, distube, config)
            }
        })
    })
}