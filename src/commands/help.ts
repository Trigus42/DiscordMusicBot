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
		const embed = new Discord.EmbedBuilder()
		// If no arguments are given, print the help message
		if (args.length === 0) {
			embed
				.setColor("#fffff0")
				.setTitle("**COMMANDS**\n")
				.setFooter({text: "Syntax:  \"<>\": required, \"[]\": optional"})

			// Create field for each command
			config.commands.forEach(command => {
				embed.addFields({
					name: `\`${command.aliases[0]}\`` + ((!command.onlyExecSubCommands && command.argsUsage.length != 0) ? ` \`${command.argsUsage}\`` : ""),
					value: command.description.length > 0 ? (command.subCommands.length > 0 ? command.description + `; Use \`help ${command.aliases[0]}\` to view sub-commands` : command.description) : `Use \`help ${command.aliases[0]}\` for more information`,
					inline: true
				})
			})

			// Add embed with all filters
			if (message.guild) {
				const filters = await config.getFilters(message.guild.id)
				embed.addFields({name: "**FILTERS**", value: Object.keys(filters).map((filter) => `\`${filter}\``).join(" ") ?? "None"})
			}
		} else {
			// If arguments are given, print the help message for the specified command
			const command = this.resolveCommand(args, config)
			if (!command) {
				Embeds.embedBuilderMessage({
					client: client,
					message: message,
					description: "Command not found",
					color: "Red",
					deleteAfter: 10000
				})
				return
			}

			embed
				.setColor("#fffff0")
				.setTitle(`**Command**: **"${command.aliases[0]}**"`)
				.addFields(
					{name: "**Aliases**", value: command.aliases.length > 0 ? command.aliases.map(alias => `\`${alias}\``)?.join("**/**") : "None"},
					{name: "**Usage**", value: `\`${command.argsUsage}\``},
					{name: "**Description**", value: command.verboseDescription ?? (command.description.length > 0 ? command.description : `Use \`help ${command.aliases[0]}\` for more information`)}
				)
			if (command.subCommands.length > 0) {
				embed.addFields({name: "**Sub-commands**", value: command.subCommands.map(subCommand => `\`${subCommand.aliases[0]}\``).join("**/**")})
			}
		}

		message.channel.send({ embeds: [embed] })
	}
}

export default new TLCommand()