import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from '../interfaces'
import * as Embeds from "../embeds"
import { Config } from "../config"

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
    public needsUserInVC: boolean = true

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube, config: Config) {
        await distube.shuffle(message)
        if (config.userConfig.actionMessages) {
            Embeds.embedBuilderMessage({
                client,
                message,
                color: "#fffff0",
                title: "Shuffled queue",
                deleteAfter: 10000
            })
        }
        message.react("✅")
    }
}

export default new NewCommand()