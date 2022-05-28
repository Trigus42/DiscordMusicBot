import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from '../interfaces'
import { Config } from "../config"
import * as Embeds from "../embeds"

class NewCommand extends Command {
    public name: string = "stop"
    public description: string = "Stop playing music and clear the queue"
    public aliases: string[] = []
    public needsArgs: boolean = false
    public usage: string = "stop"
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
        let queue = distube.getQueue(message.guildId!)
        if (queue) await queue.stop()
        if (config.userConfig.actionMessages) {
            Embeds.embedBuilderMessage({
                client,
                message,
                color: "#fffff0",
                title: "Stopped playing",
                deleteAfter: 10000
            })
        }
        message.react("✅")
    }
}

export default new NewCommand()