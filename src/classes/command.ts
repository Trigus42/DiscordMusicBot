import * as Discord from "discord.js"
import { Config } from "../config"
import { Dict } from "../interfaces/structs"
import * as Embeds from "../embeds"
import { default as Queue } from "../player"

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
	public needsNonEmptyQueue = false
	public needsClientInVC = false
	public onlyExecSubCommands = false
	public ownerOnly = false
	public subCommands: Command[] = []
	public verboseDescription: string = null

	public async handler(message: Discord.Message, args: string[], receivingClient: Discord.Client, config: Config, member?: Discord.GuildMember) {
		if (!this.enabled) return

		// Defaults
		member = member ?? message.member
		const author = member.user ?? message.author 
	
		// Handle subcommands
		if (this.subCommands.length > 0 && args[0]) {
			const subCommand = this.subCommands.find(subCommand => subCommand.aliases.includes(args[0]))
			if (subCommand) {
				subCommand.handler(message, args.slice(1), receivingClient, config, member)
				return
			}
		}
	
		// Check if the command can be used in the current context
		if (this.onlyExecSubCommands) {
			Embeds.embedBuilderMessage({client: receivingClient, message, color: "Red", title: "Use one of the subcommands"})
			return
		}
		if (this.guildOnly && !message.guild) {
			Embeds.embedBuilderMessage({ client: receivingClient, message, color: "Red", title: "This Command can only be used in a server" })
			return
		} else if (this.ownerOnly && !(author.id === config.userConfig.ownerId)) {
			Embeds.embedBuilderMessage({ client: receivingClient, message, color: "Red", title: "You don't have permission for this command" })
			return
		} else if (this.adminOnly && !member?.permissions.has(Discord.PermissionFlagsBits.Administrator) && !(author.id === config.userConfig.ownerId)) {
			Embeds.embedBuilderMessage({ client: receivingClient, message, color: "Red", title: "You don't have permission for this command" })
			return
		} else if ((this.needsClientInVC || this.needsNonEmptyQueue) && !member?.voice.channel) {
			Embeds.embedBuilderMessage({ client: receivingClient, message, color: "Red", title: "You need to be in a voice channel to use this command" })
			return
		} else if (this.needsArgs && !args.length) {
			Embeds.embedBuilderMessage({ client: receivingClient, message, color: "Red", title: `You didn't provide any arguments for the ${this.aliases[0]} command` })
			return
		} else if (author.id in this.cooldowns) {
			const expirationTime = this.cooldowns[author.id]
			if (expirationTime > Date.now()) {
				const timeLeft = (expirationTime - Date.now()) / 1000
				Embeds.embedBuilderMessage({ client: receivingClient, message, color: "Red", title: `You can use this command again in ${timeLeft.toFixed(1)} seconds` })
				return
			}
		} else {
			// 500 ms default cooldown for all commands
			this.cooldowns[author.id] = Date.now() + (this.cooldown >= 0 ? this.cooldown : 500)
		}
	
		// Guilds
		if (message.guildId) {
			// If this command needs the client to be in a voice channel, get an available client
			if (this.needsClientInVC) {
				// Get a queue to work with
				let guildQueues = config.activeQueues.get(message.guild.id)
				let chosenQueue = guildQueues.find(queue => queue.voiceChannel.id === member.voice.channel.id) // Get queue for the requested voice channel

				if (this.needsNonEmptyQueue && (!chosenQueue || chosenQueue.songs.length === 0)) {
					Embeds.embedBuilderMessage({ client: receivingClient, message, color: "Red", title: "There is nothing playing" })
					return
				}

				// If no queue was found get an available client
				if (!chosenQueue) {
					let chosenClient = config.clients.find(client => {
						if (guildQueues.find(queue => queue.client.user.id === client.user.id)) return false // Check if this client is not in use in this guild
						return client.guilds.fetch().then(guilds => guilds.has(message.guild.id)) // Check if client is in this guild
					})

					if (!chosenClient) {
						Embeds.embedBuilderMessage({ client: receivingClient, message, color: "Red", title: "There are no available clients", description: "Please try again later or free up one of the clients" })
						return
					}

					chosenQueue = new Queue(chosenClient, message.guild, message.member.voice.channel, message.channel as Discord.TextChannel)
					chosenQueue.join(message.member.voice.channel)
				} else {
					// Update queue text channel
					chosenQueue.textChannel = message.channel as Discord.TextChannel
				}
	
				this.execute(message, args, chosenQueue.client, config, chosenQueue)
			} else {
				this.execute(message, args, receivingClient, config)
			}
	
			// DMs
		} else {
			const discord = message.client
			this.execute(message, args, discord, config)
		}
	}

	public async execute(message: Discord.Message, args: string[], client: Discord.Client, config?: Config, chosenQueue?: Queue): Promise<void> {
		throw new Error("Method not implemented.")
	}
}