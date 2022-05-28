import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import * as Embeds from "../embeds"
import { Dict } from '../interfaces'
import { Config } from "../config"

class NewCommand extends Command {
    public name: string = "loop"
    public description: string = "Set loop mode to off|song|queue"
    public aliases: string[] = []
    public needsArgs: boolean = true
    public usage: string = "loop <0|1|2>"
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

        if (0 <= Number(args[0]) && Number(args[0]) <= 2) {
            distube.setRepeatMode(message, Number(args[0]))
            message.react("✅")

            if (config.userConfig.actionMessages) {
                Embeds.embedBuilderMessage({
                    client,
                    message,
                    color: "#fffff0",
                    title: "Repeat mode set to:",
                    description: `${args[0].replace("0", "OFF").replace("1", "Repeat song").replace("2", "Repeat Queue")}`,
                    deleteAfter: 10000
                })
            }
            Embeds.statusEmbed(queue, config)
            return
        }
        else {
            message.react("❌")
            Embeds.embedBuilderMessage({
                client,
                message,
                color: "RED",
                title: "Please use a number between **0** and **2**   |   *(0: disabled, 1: Repeat a song, 2: Repeat the entire queue)*", 
                deleteAfter: 10000
            })
            return
        }
    }
}

export default new NewCommand()