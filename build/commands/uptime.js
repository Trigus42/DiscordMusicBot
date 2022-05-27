"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UptimeCommand = void 0;
class UptimeCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'uptime',
            description: 'Prints the bot\'s uptime',
            chatInputCommand: { register: true }
        });
    }
    async chatInputRun(interaction) {
        let days = Math.floor(client.uptime / 86400000);
        let hours = Math.floor(client.uptime / 3600000) % 24;
        let minutes = Math.floor(client.uptime / 60000) % 60;
        let seconds = Math.floor(client.uptime / 1000) % 60;
        Embeds.embedBuilderMessage(client, message, "#fffff0", "UPTIME:", `\`${days}d\` \`${hours}h\` \`${minutes}m\` \`${seconds}s\n\``);
        return;
    }
}
exports.UptimeCommand = UptimeCommand;
