import { Command } from '@sapphire/framework'
import * as Discord from "discord.js"

export class UpdateCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'update',
            description: 'Update playback status',
            chatInputCommand: {register: true}
        })
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        let queue = distube.getQueue(message)
        if (!queue) {
            Embeds.embedBuilderMessage(client, message, "RED", "There is nothing playing")
                .then(msg => setTimeout(() => msg.delete().catch(console.error), 10000))
            message.react("❌")
            return
        }

        if (0 <= Number(args[0]) && Number(args[0]) <= 2) {
            distube.setRepeatMode(message, parseInt(args[0]))
            await Embeds.embedBuilderMessage(client, message, "#fffff0", "Repeat mode set to:", `${args[0].replace("0", "OFF").replace("1", "Repeat song").replace("2", "Repeat Queue")}`)
                .then(msg => setTimeout(() => msg.delete().catch(console.error), 10000))
            message.react("✅")
            return
        }
        else {
            Embeds.embedBuilderMessage(client, message, "RED", "Please use a number between **0** and **2**   |   *(0: disabled, 1: Repeat a song, 2: Repeat the entire queue)*")
                .then(msg => setTimeout(() => msg.delete().catch(console.error), 10000))
            message.react("❌")
            return
        }
    }
}