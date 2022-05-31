import * as Discord from "discord.js"
import * as DisTube from "distube"
import { Config } from "../config"
import { Dict } from "../interfaces"
import * as Embeds from "../embeds"

export class Command {
	public name!: string
	public description = "No description"
	public verboseDescription: string = null
	public aliases: string[] = []
	public needsArgs = false
	public usage = "No usage"
	public guildOnly = false
	public adminOnly = false
	public ownerOnly = false
	public needsQueue = false
	public hidden = false
	public enabled = false
	public cooldown = 0
	public cooldowns: Dict = {}
	public needsUserInVC = false
	public subCommands: Command[] = []

	public async handler(message: Discord.Message, args: string[], receivingClientPair: {discord: Discord.Client, distube: DisTube.DisTube}, config: Config) {
		if (!this.enabled) return
	
		// Handle subcommands
		if (this.subCommands.length > 0 && args[0]) {
			const subCommand = this.subCommands.find(subCommand => subCommand.aliases.includes(args[0]))
			if (subCommand) {
				subCommand.handler(message, args.slice(1), receivingClientPair, config)
				return
			}
		}
	
		// Check if the command can be used in the current context
		if (this.guildOnly && !message.guild) {
			Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: "This Command can only be used in a server" })
			return
		} else if (this.ownerOnly && !(message.author.id === config.userConfig.ownerId)) {
			Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: "You don't have permission for this command" })
			return
		} else if (this.adminOnly && !message.member?.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR) && !(message.author.id === config.userConfig.ownerId)) {
			Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: "You don't have permission for this command" })
			return
		} else if ((this.needsUserInVC || this.needsQueue) && !message.member?.voice.channel) {
			Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: "You need to be in a voice channel to use this command" })
			return
		} else if (this.needsArgs && !args.length) {
			Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: `You didn't provide any arguments for the ${this.name} command` })
			return
		} else if (this.cooldown > 0) {
			if (message.author.id in this.cooldowns) {
				const expirationTime = this.cooldowns[message.author.id]
				if (expirationTime > Date.now()) {
					const timeLeft = (expirationTime - Date.now()) / 1000
					Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: `You can use this command again in ${timeLeft.toFixed(1)} seconds` })
					return
				}
			} else {
				this.cooldowns[message.author.id] = Date.now() + this.cooldown
			}
		}
	
		// Guilds
		if (message.guildId) {
			// If this command needs the client to be in a voice channel, get an available client
			if (this.needsUserInVC) {
				// Get pair of client and distube for the members voice channel or use a new pair if member is in a new voice channel
				const chosenClientPair = config.clientPairs.find(clientPair =>
					clientPair.distube.getQueue(message.guildId!) ? // Check if client has a queue
						clientPair.distube.getQueue(message.guildId!)?.voiceChannel?.id === message.member!.voice.channel!.id : false // Check if client queue is in the same voice channel as the message author
				) ?? config.clientPairs.find(clientPair => // If no client has been found, use a new client
					!clientPair.distube.getQueue(message.guildId!) // Check if client has no queue
					&& clientPair.discord.guilds.fetch().then(guilds => guilds.has(message.guildId!)) // Check if client is in the same guild as the message author
				)
	
				if (!chosenClientPair) {
					Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: "There are no available clients", description: "Please try again later or free up one of the clients" })
					return
				}
	
				const queue = chosenClientPair.distube.getQueue(message.guildId)
				
				// Switch queue channel if new command is sent in different text channel
				if (queue) {
					queue.textChannel = message.channel as Discord.TextChannel
				}
	
				if (this.needsQueue && !chosenClientPair.distube.getQueue(message.guildId)) {
					Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "RED", title: "There is nothing playing in the queue" })
					return
				}
	
				this.execute(message, args, chosenClientPair.discord, chosenClientPair.distube, config)
			} else {
				this.execute(message, args, receivingClientPair.discord, receivingClientPair.distube, config)
			}
	
			// DMs
		} else {
			const discord = message.client
			const distube = config.clientPairs.find(clientPair => clientPair.discord === discord)?.distube
			this.execute(message, args, discord, distube, config)
		}
	}

	public async execute(message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config): Promise<void> {
		throw new Error("Method not implemented.")
	}

	constructor() {}
}