"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterCommand = void 0;
class FilterCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'filter',
            description: 'Add or remove a filter',
            chatInputCommand: { register: true }
        });
    }
    async chatInputRun(interaction) {
        let queue = distube.getQueue(message.guild.id);
        if (args[0] === "add") {
            await db.guilds.setFilters(message.guild.id, { [args[1]]: args[2] });
        }
        else if (args[0] === "del") {
            await db.guilds.delFilter(message.guild.id, args[1]);
        }
        else if (queue) {
            if (queue.filters.includes(message.guildId + command)) {
                queue.setFilter(message.guild.id + command);
            }
            else {
                distube.filters[message.guild.id + command] = (await db.guilds.getFilters(message.guild.id))[command];
                queue.setFilter(message.guild.id + command);
            }
        }
        message.react("✅");
        return;
    }
}
exports.FilterCommand = FilterCommand;
