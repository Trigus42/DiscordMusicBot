import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import * as Embeds from "../embeds"
import { Dict } from '../interfaces'
import { Config } from "../config"

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

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube, config: Config) {
        let queue = distube.getQueue(message)
        
        await distube.jump(message, Number(args[0]))
            .catch(err => {
                message.react("❌")
                Embeds.embedBuilderMessage({
                    client,
                    message,
                    color: "RED",
                    title: "Invalid song number",
                    deleteAfter: 10000
                })
                return
            })

        if (config.userConfig.actionMessages) {
            Embeds.embedBuilderMessage({
                client,
                message,
                color: "#fffff0",
                title: "Jumped to song",
                description: `Jumped to **${queue.songs[0].name}**`,
                deleteAfter: 10000
            })
        }

        message.react("✅")
    }
}

export default new NewCommand()