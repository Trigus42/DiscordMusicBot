import * as Embeds from '../embeds'
import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Config } from '../config'

class NewCommand extends Command {
    public name: string = "volume"
    public description: string = "Set bot volume (0-100)"
    public aliases: string[] = []
    public args: boolean = false
    public usage: string = "volume <volume>"
    public guildOnly: boolean = true
    public adminOnly: boolean = false
    public ownerOnly: boolean = false
    public hidden: boolean = false
    public enabled: boolean = true
    public cooldown: number = 0

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube, config: Config) {
        distube.setVolume(message, Number(args[0]))
        message.react("✅")
    }
}

export default new NewCommand()