import * as Embeds from '../embeds'
import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Config } from '../config'
import { Dict } from '../interfaces'

class NewCommand extends Command {
    public name: string = "update"
    public description: string = "Update playback status"
    public aliases: string[] = []
    public needsArgs: boolean = false
    public usage: string = "update"
    public guildOnly: boolean = true
    public adminOnly: boolean = false
    public ownerOnly: boolean = false
    public needsQueue: boolean = true
    public hidden: boolean = false
    public enabled: boolean = true
    public cooldown: number = 0
    public cooldowns: Dict = {}

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube, config: Config) {
        let queue = distube.getQueue(message.guild.id)
        await Embeds.statusEmbed(queue, config, queue.songs[0])
        message.react("✅")
    }
}

export default new NewCommand()