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
    public args: boolean = true
    public usage: string = "filter [add|del] <name> [filter]"
    public guildOnly: boolean = true
    public adminOnly: boolean = false
    public ownerOnly: boolean = false
    public hidden: boolean = false
    public enabled: boolean = true
    public cooldown: number = 0
    public cooldowns: Dict = {}

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube, config: Config) {
        let queue = distube.getQueue(message.guild.id)
        // Add filter
        if (args[0] === "add") { 
            await config.setFilter(message.guild.id, args[1], args[2])
        // Delete filter
        } else if (args[0] === "del") {
            await config.deleteFilter(message.guild.id, args[1])
        // Apply filter
        } else if (queue) {
            // Check if filter exists
            let filter = await config.getFilter(message.guild.id, args[0])
            if (filter) {
                distube.filters[message.guild.id + args[0]] = filter
                queue.setFilter(message.guild.id + args[0])
            } else {
                Embeds.embedBuilderMessage(client, message, "RED", "Filter not found")
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 10000))
                return
            }
        } else {
            Embeds.embedBuilderMessage(client, message, "RED", "There is nothing playing")
                .then(msg => setTimeout(() => msg.delete().catch(console.error), 10000))
            message.react("❌")
            return
        }
        message.react("✅")
    }
}

export default new NewCommand()