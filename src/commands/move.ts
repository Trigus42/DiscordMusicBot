import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import { Dict } from '../interfaces'

class NewCommand extends Command {
    public name: string = "move"
    public description: string = "Move a song from one position to another in the queue"
    public aliases: string[] = ["mv"]
    public needsArgs: boolean = true
    public usage: string = "move <from> <to>"
    public guildOnly: boolean = true
    public adminOnly: boolean = false
    public ownerOnly: boolean = false
    public needsQueue: boolean = true
    public hidden: boolean = false
    public enabled: boolean = true
    public cooldown: number = 0
    public cooldowns: Dict = {}

    public async execute (message: Discord.Message, args: string[], client: Discord.Client, distube: DisTube.DisTube) {
        if (!isNaN(Number(args[0])) && !isNaN(Number(args[1]))) {
            let queue = distube.getQueue(message)

            // Move song from position args[0] to position args[1]
            queue.songs.splice(Number(args[1]), 0, queue.songs.splice(Number(args[0]), 1)[0])

            message.react("✅")
        }
    }
}

export default new NewCommand()