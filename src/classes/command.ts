import * as Discord from "discord.js"
import * as DisTube from "distube"
import { Config } from "../config"
import { Dict } from "../interfaces"
import * as Embeds from "../embeds"

export class Command {
	public adminOnly = false
	public aliases: string[] = []
	public argsUsage = ""
	// Cooldown in ms; Default is 500 ms
	public cooldown: number
	public cooldowns: Dict = {}
	public description = ""
	public enabled = false
	public guildOnly = false
	public hidden = false
	public needsArgs = false
	public needsQueue = false
	public needsUserInVC = false
	public onlyExecSubCommands = false
	public ownerOnly = false
	public subCommands: Command[] = []
	public verboseDescription: string = null

	public async handler(message: Discord.Message, args: string[], receivingClientPair: {discord: Discord.Client, distube: DisTube.DisTube}, config: Config, member?: Discord.GuildMember) {
		if (!this.enabled) return

		// Defaults
		member = member ?? message.member
		const author = member.user ?? message.author 
	
		// Handle subcommands
		if (this.subCommands.length > 0 && args[0]) {
			const subCommand = this.subCommands.find(subCommand => subCommand.aliases.includes(args[0]))
			if (subCommand) {
				subCommand.handler(message, args.slice(1), receivingClientPair, config, member)
				return
			}
		}
	
		// Check if the command can be used in the current context
		if (this.onlyExecSubCommands) {
			Embeds.embedBuilderMessage({client: receivingClientPair.discord, message, color: "Red", title: "Use one of the subcommands"})
			return
		}
		if (this.guildOnly && !message.guild) {
			Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "Red", title: "This Command can only be used in a server" })
			return
		} else if (this.ownerOnly && !(author.id === config.userConfig.ownerId)) {
			Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "Red", title: "You don't have permission for this command" })
			return
		} else if (this.adminOnly && !member?.permissions.has(Discord.PermissionFlagsBits.Administrator) && !(author.id === config.userConfig.ownerId)) {
			Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "Red", title: "You don't have permission for this command" })
			return
		} else if ((this.needsUserInVC || this.needsQueue) && !member?.voice.channel) {
			Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "Red", title: "You need to be in a voice channel to use this command" })
			return
		} else if (this.needsArgs && !args.length) {
			Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "Red", title: `You didn't provide any arguments for the ${this.aliases[0]} command` })
			return
		} else if (author.id in this.cooldowns) {
			const expirationTime = this.cooldowns[author.id]
			if (expirationTime > Date.now()) {
				const timeLeft = (expirationTime - Date.now()) / 1000
				Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "Red", title: `You can use this command again in ${timeLeft.toFixed(1)} seconds` })
				return
			}
		} else {
			// 500 ms default cooldown for all commands
			this.cooldowns[author.id] = Date.now() + (this.cooldown >= 0 ? this.cooldown : 500)
		}
	
		// Guilds
		if (message.guildId) {
			// If this command needs the client to be in a voice channel, get an available client
			if (this.needsUserInVC) {
				// Get pair of client and distube for the members voice channel or use a new pair if member is in a new voice channel
				const chosenClientPair = config.clientPairs.find(clientPair =>
					clientPair.distube.getQueue(message.guildId!) ? // Check if client has a queue
						clientPair.distube.getQueue(message.guildId!)?.voiceChannel?.id === member!.voice.channel!.id : false // Check if client queue is in the same voice channel as the message author
				) ?? config.clientPairs.find(clientPair => // If no client has been found, use a new client
					!clientPair.distube.getQueue(message.guildId!) // Check if client has no queue
					&& clientPair.discord.guilds.fetch().then(guilds => guilds.has(message.guildId!)) // Check if client is in the same guild as the message author
				)
	
				if (!chosenClientPair) {
					Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "Red", title: "There are no available clients", description: "Please try again later or free up one of the clients" })
					return
				}
	
				const queue = chosenClientPair.distube.getQueue(message.guildId)
				
				// Switch queue channel if new command is sent in different text channel
				if (queue) {
					queue.textChannel = message.channel as Discord.TextChannel
				}
	
				if (this.needsQueue && (!chosenClientPair.distube.getQueue(message.guildId) || !(chosenClientPair.distube.getQueue(message.guildId).songs.length > 0))) {
					Embeds.embedBuilderMessage({ client: receivingClientPair.discord, message, color: "Red", title: "There is nothing playing in the queue" })
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
}