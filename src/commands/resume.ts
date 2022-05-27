import * as Discord from "discord.js"

export class ResumeCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'resume',
            description: 'Resume the current song',
            chatInputCommand: {register: true}
        })
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        distube.resume(message)
        message.react("✅")
        return
    }
}