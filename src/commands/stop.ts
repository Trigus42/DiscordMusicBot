import * as Discord from "discord.js"

export class StopCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'stop',
            description: 'Stop playing music and clear the queue',
            chatInputCommand: {register: true}
        })
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        let queue = distube.getQueue(message.guild.id)
            if (queue) await queue.stop()
            message.react("✅")
            return
    }
}