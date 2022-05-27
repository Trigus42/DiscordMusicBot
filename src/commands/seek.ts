import * as Discord from "discord.js"

export class SeekCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'seek',
            description: 'Seek to a specific time in the current song',
            chatInputCommand: {register: true}
        })
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        // Get time in seconds from HH:MM:SS time_string
        let time_array = args[0].split(":")
        let time_seconds = 0
        for (let i = 0; i < time_array.length; i++) {
            time_seconds += parseInt(time_array[i]) * Math.pow(60, (time_array.length - 1) - i)
        }
        distube.seek(message, time_seconds)
        message.react("✅")
        return
    }
}