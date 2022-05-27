import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import * as Embeds from "../embeds"

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

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube) {
        let queue = distube.getQueue(message)
        if (!queue) {
            Embeds.embedBuilderMessage(client, message, "RED", "There is nothing playing")
                .then(msg => setTimeout(() => msg.delete().catch(console.error), 10000))
            message.react("❌")
            return
        }
    
        if (0 <= Number(args[0]) && Number(args[0]) <= queue.songs.length) {
            await distube.jump(message, parseInt(args[0]))
                .catch(err => {
                    Embeds.embedBuilderMessage(client, message, "RED", "Invalid song number")
                        .then(msg => setTimeout(() => msg.delete().catch(console.error), 10000))
                    message.react("❌")
                    return
                })
            message.react("✅")
            return
        }
    }
}

export default new NewCommand()