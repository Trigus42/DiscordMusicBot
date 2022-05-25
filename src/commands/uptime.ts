import { Command } from '@sapphire/framework'
import * as Discord from "discord.js"

export class UptimeCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'uptime',
            description: 'Prints the bot\'s uptime',
            chatInputCommand: {register: true}
        })
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        let days = Math.floor(client.uptime / 86400000)
        let hours = Math.floor(client.uptime / 3600000) % 24
        let minutes = Math.floor(client.uptime / 60000) % 60
        let seconds = Math.floor(client.uptime / 1000) % 60
        Embeds.embedBuilderMessage(client, message, "#fffff0", "UPTIME:", `\`${days}d\` \`${hours}h\` \`${minutes}m\` \`${seconds}s\n\``)
        return
    }
}