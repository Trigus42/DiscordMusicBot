import { Command } from '@sapphire/framework'
import * as Discord from "discord.js"

export class UpdateCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'shuffle',
            description: 'Shuffle the queue',
            chatInputCommand: {register: true}
        })
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        await distube.shuffle(message)
        message.react("✅")
        return
    }
}