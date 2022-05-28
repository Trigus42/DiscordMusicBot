import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from '../interfaces'

class NewCommand extends Command {
    public name: string = "shuffle"
    public description: string = "Shuffle the queue"
    public aliases: string[] = ["mix"]
    public needsArgs: boolean = false
    public usage: string = "shuffle"
    public guildOnly: boolean = false
    public adminOnly: boolean = false
    public ownerOnly: boolean = false
    public needsQueue: boolean = true
    public hidden: boolean = false
    public enabled: boolean = true
    public cooldown: number = 0
    public cooldowns: Dict = {}

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube) {
        await distube.shuffle(message)
        message.react("✅")
    }
}

export default new NewCommand()