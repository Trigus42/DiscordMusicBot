import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Config } from "../config"
import * as Embeds from "../embeds"

class TLCommand extends Command {
	public aliases: string[] = ["help", "h"]
	public argsUsage = "[command]"
	public description = "Prints help message for all commands or a specific command"
	public enabled = true

	private resolveCommand (args: string[], config: Config, command?: Command): Command {
		if (!command) {
			command = config.commands.find(command => command.aliases.includes(args[0]))
		}

		// If there are sub-commands, resolve the sub-command
		if (command.subCommands.length > 0) {
			const subCommand = command.subCommands.find(subCommand => subCommand.aliases.includes(args[1]))
			if (subCommand) {
				return this.resolveCommand(args.slice(1), config, subCommand)
			}
		}

		// If there are no sub-commands, return the command
		return command
	}

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube?: DisTube.DisTube, config?: Config) {
		const embed = new Discord.MessageEmbed()
		// If no arguments are given, print the help message
		if (args.length === 0) {
			embed
				.setColor("#fffff0")
				.setTitle("**COMMANDS**\n")
				.setAuthor({name: message.author.tag.split("#")[0], iconURL: message.author.displayAvatarURL({dynamic:true})})
				.setFooter({text: client.user?.username + " | Syntax:  \"<>\": required, \"[]\": optional", iconURL: client.user?.displayAvatarURL({dynamic:true})})

			// Create field for each command
			config.commands.forEach(command => {
				embed.addField(
					`\`${command.aliases[0]}\`` + ((!command.onlyExecSubCommands && command.argsUsage.length != 0) ? ` \`${command.argsUsage}\`` : ""),
					command.description.length > 0 ? command.description : `Use \`help ${command.aliases[0]}\` for more information`,
					true
				)!
			})

			// Add embed with all filters
			if (message.guild) {
				const filters = await config.getFilters(message.guild.id)
				embed.addField("**FILTERS**", Object.keys(filters).map((filter) => `\`${filter}\``).join(" ") ?? "None")
			}
		} else {
			// If arguments are given, print the help message for the specified command
			const command = this.resolveCommand(args, config)
			if (!command) {
				Embeds.embedBuilderMessage({
					client: client,
					message: message,
					description: "Command not found",
					color: "RED",
					deleteAfter: 10000
				})
				return
			}

			embed
				.setColor("#fffff0")
				.setTitle(`**Command**: **"${command.aliases[0]}**"`)
				.addField("**Aliases**", command.aliases.length > 0 ? command.aliases.map(alias => `\`${alias}\``)?.join("**/**") : "None", false)
				.addField("**Usage**", `\`${command.argsUsage}\``, false)
				.addField("**Description**", command.verboseDescription ?? (command.description.length > 0 ? command.description : `Use \`help ${command.aliases[0]}\` for more information`), false)

			if (command.subCommands.length > 0) {
				embed.addField("**Sub-commands**", command.subCommands.map(subCommand => `\`${subCommand.aliases[0]}\``).join("**/**"), false)
			}
		}

		message.channel.send({ embeds: [embed] })
	}
}

export default new TLCommand()