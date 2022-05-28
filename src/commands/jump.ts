import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import * as Embeds from "../embeds"
import { Dict } from '../interfaces'

class NewCommand extends Command {
    public name: string = "jump"
    public description: string = "Jumps to a song in queue"
    public aliases: string[] = []
    public needsArgs: boolean = true
    public usage: string = "jump <POSITION>"
    public guildOnly: boolean = true
    public adminOnly: boolean = false
    public ownerOnly: boolean = false
    public needsQueue: boolean = true
    public hidden: boolean = false
    public enabled: boolean = true
    public cooldown: number = 0
    public cooldowns: Dict = {}
    public needsUserInVC: boolean = true

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube) {
        let queue = distube.getQueue(message)
        
        if (0 <= Number(args[0]) && Number(args[0]) <= queue.songs.length) {
            await distube.jump(message, parseInt(args[0]))
                .catch(err => {
                    Embeds.embedBuilderMessage({ client, message, color: "RED", title: "Invalid song number" })
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