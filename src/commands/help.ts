import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from "../interfaces"
import { Config } from "../config"

class NewCommand extends Command {
	public name = "help"
	public description = "Prints help message"
	public aliases: string[] = ["h"]
	public needsArgs = false
	public usage = "help"
	public guildOnly = false
	public adminOnly = false
	public ownerOnly = false
	public needsQueue = false
	public hidden = false
	public enabled = true
	public cooldown = 0
	public cooldowns: Dict = {}

	public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube, config: Config) {
		const embed = new Discord.MessageEmbed()
			.setColor("#fffff0")
			.setTitle("**COMMANDS**\n")
			.setAuthor({name: message.author.tag.split("#")[0], iconURL: message.author.displayAvatarURL({dynamic:true})})
			.setFooter({text: client.user?.username + " | Syntax:  \"<>\": required, \"[]\": optional", iconURL: client.user?.displayAvatarURL({dynamic:true})})

		// Create embed for each command
		config.commands.forEach(command => {
			let aliases = command.aliases.map(alias => `\`${alias}\``).join("**/**")
			aliases = aliases ? "**/**" + aliases : ""
			embed.addField(
				`\`${command.usage}\`` + aliases,
				command.description,
				true
			)
		})

		// Add embed with all filters
		if (message.guild) {
			const filters = await config.getFilters(message.guild.id)
			embed.addField("**FILTERS**", Object.keys(filters).map((filter) => `\`${filter}\``).join(" ") ?? "None")
		}

		message.channel.send({ embeds: [embed] })
	}
}

export default new NewCommand()