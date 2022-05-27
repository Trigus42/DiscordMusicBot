import * as Discord from "discord.js"

export class PauseCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'pause',
            description: 'Pause the current song',
            chatInputCommand: {register: true}
        })
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        distube.pause(message)
        message.react("✅")
        return
    }
}