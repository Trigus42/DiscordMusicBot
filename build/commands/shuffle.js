"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCommand = void 0;
class UpdateCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'shuffle',
            description: 'Shuffle the queue',
            chatInputCommand: { register: true }
        });
    }
    async chatInputRun(interaction) {
        await distube.shuffle(message);
        message.react("✅");
        return;
    }
}
exports.UpdateCommand = UpdateCommand;
