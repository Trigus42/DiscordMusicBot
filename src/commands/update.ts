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
        if (!queue) {
            Embeds.embedBuilderMessage(client, message, "RED", "There is nothing playing")
                .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
            return
        }
        await Embeds.statusEmbed(queue, db, queue.songs[0])
        message.react("✅")
        return
    }
}