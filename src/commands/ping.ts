import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from '../interfaces'

class NewCommand extends Command {
    public name: string = "ping"
    public description: string = "Displays the bot's ping"
    public aliases: string[] = []
    public needsArgs: boolean = false
    public usage: string = "ping"
    public guildOnly: boolean = false
    public adminOnly: boolean = false
    public ownerOnly: boolean = false
    public needsQueue: boolean = false
    public hidden: boolean = false
    public enabled: boolean = true
    public cooldown: number = 0
    public cooldowns: Dict = {}

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube) {
        const m = await message.channel.send("Pong!")
        const ping =  m.createdTimestamp - message.createdTimestamp
        m.edit(`Pong! Latency: ${ping}ms`)

        message.react("✅")
    }
}

export default new NewCommand()