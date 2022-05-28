import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from '../interfaces'

class NewCommand extends Command {
    public name: string = "seek"
    public description: string = "Seek to a specific time in the current song"
    public aliases: string[] = []
    public needsArgs: boolean = true
    public usage: string = "seek <HH:MM:SS>"
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
        // Get time in seconds from HH:MM:SS time_string
        let time_array = args[0].split(":")
        let time_seconds = 0
        for (let i = 0; i < time_array.length; i++) {
            time_seconds += parseInt(time_array[i]) * Math.pow(60, (time_array.length - 1) - i)
        }
        distube.seek(message, time_seconds)
        message.react("✅")
    }
}

export default new NewCommand()