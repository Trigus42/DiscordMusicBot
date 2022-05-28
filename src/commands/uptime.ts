import * as Embeds from '../embeds'
import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Config } from '../config'
import { Dict } from '../interfaces'

class NewCommand extends Command {
    public name: string = "uptime"
    public description: string = "Prints the bot\'s uptime"
    public aliases: string[] = []
    public needsArgs: boolean = false
    public usage: string = "uptime"
    public guildOnly: boolean = false
    public adminOnly: boolean = false
    public ownerOnly: boolean = false
    public needsQueue: boolean = false
    public hidden: boolean = false
    public enabled: boolean = true
    public cooldown: number = 0
    public cooldowns: Dict = {}

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube, config: Config) {
        let days = Math.floor(client.uptime / 86400000)
        let hours = Math.floor(client.uptime / 3600000) % 24
        let minutes = Math.floor(client.uptime / 60000) % 60
        let seconds = Math.floor(client.uptime / 1000) % 60
        Embeds.embedBuilderMessage(client, message, "#fffff0", "UPTIME:", `\`${days}d\` \`${hours}h\` \`${minutes}m\` \`${seconds}s\n\``)
        message.react("✅")
    }
}

export default new NewCommand()