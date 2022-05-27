import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"

class NewCommand extends Command {
    public name: string = "pause"
    public description: string = "Pause the current song"
    public aliases: string[] = []
    public args: boolean = false
    public usage: string = "pause"
    public guildOnly: boolean = true
    public adminOnly: boolean = false
    public ownerOnly: boolean = false
    public hidden: boolean = false
    public enabled: boolean = true
    public cooldown: number = 0

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube) {
        distube.pause(message)
        message.react("✅")
    }
}

export default new NewCommand()