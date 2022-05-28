import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Config } from "../config"
import * as Embeds from "../embeds"
import { Dict } from '../interfaces'

class NewCommand extends Command {
    public name: string = "filter"
    public description: string = "Toggle or add/delete ([custom](https://ffmpeg.org/ffmpeg-filters.html)) filters"
    public aliases: string[] = []
    public needsArgs: boolean = true
    public usage: string = "filter [add|del] <name> [filter]"
    public guildOnly: boolean = true
    public adminOnly: boolean = false
    public ownerOnly: boolean = false
    public needsQueue: boolean = false
    public hidden: boolean = false
    public enabled: boolean = true
    public cooldown: number = 0
    public cooldowns: Dict = {}

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube, config: Config) {
        let queue = distube.getQueue(message.guildId!)
        // Add filter
        if (args[0] === "add") { 
            await config.setFilter(message.guildId!, args[1], args[2])
        // Delete filter
        } else if (args[0] === "del") {
            await config.deleteFilter(message.guildId!, args[1])
        // Apply filter
        } else {
            // Check if filter exists
            let filter = await config.getFilter(message.guildId!, args[0])
            if (filter) {
                distube.filters[message.guildId + args[0]] = filter
                queue.setFilter(message.guildId + args[0])

                if (config.userConfig.actionMessages) {
                    Embeds.embedBuilderMessage({
                        client,
                        message,
                        color: "#fffff0",
                        title: `Toggled filter ${args[0]}`,
                        deleteAfter: 10000
                    })
                }

                // Update status embed filter status
                Embeds.statusEmbed(queue, config)
            } else {
                message.react("❌")
                Embeds.embedBuilderMessage({
                    client,
                    message,
                    color: "RED",
                    title: "Filter not found",
                    deleteAfter: 10000
                })
                return
            }
        }
        message.react("✅")
    }
}

export default new NewCommand()