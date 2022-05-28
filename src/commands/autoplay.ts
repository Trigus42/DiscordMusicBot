import * as Embeds from '../embeds'
import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from '../interfaces'
import { Config } from '../config'

class NewCommand extends Command {
    public name: string = "autoplay"
    public description: string = "Toggle autoplay"
    public aliases: string[] = ["ap"]
    public needsArgs: boolean = false
    public usage: string = "autoplay"
    public guildOnly: boolean = true
    public adminOnly: boolean = false
    public ownerOnly: boolean = false
    public needsQueue: boolean = true
    public hidden: boolean = false
    public enabled: boolean = true
    public cooldown: number = 0
    public cooldowns: Dict = {}

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube, config: Config) {
        message.react("✅")
        let autoplayStatus = distube.toggleAutoplay(message) ? "ON" : "OFF"

        if (config.userConfig.actionMessages) {
            Embeds.embedBuilderMessage({
                client,
                message,
                color: "#fffff0",
                title: `Autoplay is now ${autoplayStatus}`,
                deleteAfter: 10000
            })
        }

        // Update status embed autoplay status
        Embeds.statusEmbed(distube.getQueue(message.guildId!), config)
    }
}

export default new NewCommand()