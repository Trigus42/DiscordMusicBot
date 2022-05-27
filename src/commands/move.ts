import * as Discord from "discord.js"

export class MoveCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'move',
            description: 'Move a song from one position to another in the queue',
            chatInputCommand: {register: true}
        })
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        if (!isNaN(Number(args[0])) && !isNaN(Number(args[1]))) {
            let queue = distube.getQueue(message)

            // Move song from position args[0] to position args[1]
            queue.songs.splice(Number(args[1]), 0, queue.songs.splice(Number(args[0]), 1)[0])

            message.react("✅")
            queue = distube.getQueue(message)
            return
        }
    }
}