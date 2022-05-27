import * as Embeds from '../embeds'
import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Config } from '../config'

class NewCommand extends Command {
    public name: string = "update"
    public description: string = "Update playback status"
    public aliases: string[] = []
    public args: boolean = false
    public usage: string = "update"
    public guildOnly: boolean = true
    public adminOnly: boolean = false
    public ownerOnly: boolean = false
    public hidden: boolean = false
    public enabled: boolean = true
    public cooldown: number = 0

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube, config: Config) {
        let queue = distube.getQueue(message.guild.id)
        if (!queue) {
            Embeds.embedBuilderMessage(client, message, "RED", "There is nothing playing")
                .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
            return
        }
        await Embeds.statusEmbed(queue, config, queue.songs[0])
        message.react("✅")
    }
}

export default new NewCommand()