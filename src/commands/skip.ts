import * as Discord from "discord.js"

export class SkipCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'skip',
            description: 'Skip current song',
            chatInputCommand: {register: true}
        })
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        let queue = distube.getQueue(message.guild.id)
        // If queue is empty after skipping, stop playing
        if (!queue.autoplay && queue.songs.length <= 1) {
            queue.stop()
            queue.emit("finish", queue)
        } else {
            // Skip song at queue position args[0]
            if (!isNaN(Number(args[0]))) {
                let skip = Number(args[0])
                if (Math.abs(skip) <= queue.songs.length) {
                    queue.songs.splice(skip, 1)
                // If skip is greater than queue length, send error message
                } else {
                    Embeds.embedBuilderMessage(client, message, "RED", "Can't skip song at position " + skip + " because it doesn't exist")
                        .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000))
                    return
                }
            // Skip song at current position if no number is given
            } else {
                await distube.skip(message)
            }
        }
        message.react("✅")
        return
    }
}