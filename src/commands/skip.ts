import { Command } from "../classes/command"
import * as DisTube from "distube"
import * as Discord from "discord.js"
import * as Embeds from "../embeds"
import { Dict } from '../interfaces'
import { Config } from "../config"

class NewCommand extends Command {
    public name: string = "skip"
    public description: string = "Skip song at optional queue position or current song"
    public aliases: string[] = ["s"]
    public needsArgs: boolean = true
    public usage: string = "skip [position]"
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
        // If queue is empty after skipping, stop playing
        if (!queue.autoplay && queue.songs.length <= 1) {
            queue.stop()
            queue.emit("finish", queue)
        } else {
            // Skip song at queue position args[0]
            if (!isNaN(Number(args[0]))) {
                let skip = Number(args[0])
                if (Math.abs(skip) <= queue.songs.length) {
                    let skippedSong = queue.songs.splice(skip, 1)[0]
                    if (config.userConfig.actionMessages) {
                        Embeds.embedBuilderMessage({
                            client,
                            message,
                            color: "#fffff0",
                            title: "Song skipped",
                            description: `Skipped **${skip}** - ${skippedSong.name}`,
                            deleteAfter: 10000
                        })
                    }
                // If skip is greater than queue length, send error message
                } else {
                    Embeds.embedBuilderMessage({
                        client,
                        message,
                        color: "RED",
                        title: "Can't skip song at position " + skip + " because it doesn't exist",
                        deleteAfter: 10000
                    })
                    return
                }
            // Skip song at current position if no number is given
            } else {
                let skippedSong = queue.songs[0]
                await distube.skip(message)
                if (config.userConfig.actionMessages) {
                    Embeds.embedBuilderMessage({
                        client,
                        message,
                        color: "#fffff0",
                        title: "Song skipped",
                        description: `Skipped **${skippedSong.name}**`,
                        deleteAfter: 10000
                    })
                }
            }
        }
        message.react("✅")
    }
}

export default new NewCommand()