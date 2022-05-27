import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import * as Embeds from "../embeds"
import { Config } from "../config"
import { Dict } from '../interfaces'

class NewCommand extends Command {
    public name: string = "prefix"
    public description: string = "Changes the prefix of the bot"
    public aliases: string[] = []
    public args: boolean = false
    public usage: string = "prefix <NEW PREFIX>"
    public guildOnly: boolean = true
    public adminOnly: boolean = true
    public ownerOnly: boolean = false
    public hidden: boolean = false
    public enabled: boolean = true
    public cooldown: number = 0
    public cooldowns: Dict = {}

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube, config: Config) {
        // If no arguments are given, return current prefix
        if (!args[0]){
            Embeds.embedBuilderMessage(client, message, "#fffff0", `Current Prefix: \`${await config.getPrefix(message.guild.id)}\``, "Please provide a new prefix")
            message.react("✅")
            return
        }

        // If user is not server admin, return error
        else if (!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
            Embeds.embedBuilderMessage(client, message, "RED",  "❌ You don't have permission for this Command")
            return
        }

        // If prefix includes spaces, return error
        else if (args[1]) {
            Embeds.embedBuilderMessage(client, message, "RED",  "❌ The prefix can't have whitespaces")
            return
        }

        else {
        // Set new prefix in database
            config.setPrefix(message.guild.id, args[0])
            message.react("✅")
            Embeds.embedBuilderMessage(client, message, "#fffff0", "PREFIX", `Successfully set new prefix to **\`${args[0]}\`**`)
        }
    }
}

export default new NewCommand()