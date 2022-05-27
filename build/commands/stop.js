"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopCommand = void 0;
class StopCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'stop',
            description: 'Stop playing music and clear the queue',
            chatInputCommand: { register: true }
        });
    }
    async chatInputRun(interaction) {
        let queue = distube.getQueue(message.guild.id);
        if (queue)
            await queue.stop();
        message.react("✅");
        return;
    }
}
exports.StopCommand = StopCommand;
