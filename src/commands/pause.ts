import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from '../interfaces'
import { Config } from "../config"
import { statusEmbed } from "../embeds"

class NewCommand extends Command {
    public name: string = "pause"
    public description: string = "Pause the current song"
    public aliases: string[] = []
    public needsArgs: boolean = false
    public usage: string = "pause"
    public guildOnly: boolean = true
    public adminOnly: boolean = false
    public ownerOnly: boolean = false
    public needsQueue: boolean = true
    public hidden: boolean = false
    public enabled: boolean = true
    public cooldown: number = 0
    public cooldowns: Dict = {}

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube, config: Config) {
        distube.pause(message)
        statusEmbed(distube.getQueue(message.guildId), config)
        message.react("✅")
    }
}

export default new NewCommand()