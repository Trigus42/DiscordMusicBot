import { Command } from '@sapphire/framework'
import * as Discord from "discord.js"

export class FilterCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'filter',
            description: 'Add or remove a filter',
            chatInputCommand: {register: true}
        })
    }

    public async chatInputRun(interaction: Command.ChatInputInteraction) {
        let queue = distube.getQueue(message.guild.id)
        if (args[0] === "add") { 
            await db.guilds.setFilters(message.guild.id, {[args[1]] : args[2]})
        } else if (args[0] === "del") {
            await db.guilds.delFilter(message.guild.id, args[1])
        }
        else if (queue) {
            if (queue.filters.includes(message.guildId + command)) {
                queue.setFilter(message.guild.id + command)
            } else {
                distube.filters[message.guild.id + command] = (await db.guilds.getFilters(message.guild.id))[command]
                queue.setFilter(message.guild.id + command)
            }
        }
        message.react("✅")
        return
    }
}