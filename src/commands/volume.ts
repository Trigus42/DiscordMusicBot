import * as Embeds from '../embeds'
import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Config } from '../config'
import { Dict } from '../interfaces'

class NewCommand extends Command {
    public name: string = "volume"
    public description: string = "Set bot volume (0-100)"
    public aliases: string[] = ["vol"]
    public needsArgs: boolean = true
    public usage: string = "volume <volume>"
    public guildOnly: boolean = true
    public adminOnly: boolean = false
    public ownerOnly: boolean = false
    public needsQueue: boolean = true
    public hidden: boolean = false
    public enabled: boolean = true
    public cooldown: number = 0
    public cooldowns: Dict = {}
    public needsUserInVC: boolean = true

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube, config: Config) {
        distube.setVolume(message, Number(args[0]))
        message.react("✅")
    }
}

export default new NewCommand()