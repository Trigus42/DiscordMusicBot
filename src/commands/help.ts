import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from '../interfaces'
import { Config } from "../config"

class NewCommand extends Command {
    public name: string = "help"
    public description: string = "Prints help message"
    public aliases: string[] = ["h"]
    public needsArgs: boolean = false
    public usage: string = "help"
    public guildOnly: boolean = false
    public adminOnly: boolean = false
    public ownerOnly: boolean = false
    public needsQueue: boolean = false
    public hidden: boolean = false
    public enabled: boolean = true
    public cooldown: number = 0
    public cooldowns: Dict = {}

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube, config: Config) {
        let embed = new Discord.MessageEmbed()
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
            let filters = await config.getFilters(message.guild.id)
            embed.addField("**FILTERS**", Object.keys(filters).map((filter) => `\`${filter}\``).join(" ") ?? "None")
        }

        message.channel.send({ embeds: [embed] })
    }
}

export default new NewCommand()