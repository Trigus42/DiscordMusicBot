import { Command } from '@sapphire/framework'
import * as Discord from "discord.js"

export class VolumeCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'volume',
            description: 'Set bot volume',
            chatInputCommand: {register: true}
        })
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        distube.setVolume(message, Number(args[0]))
        message.react("✅")
        return
    }
}