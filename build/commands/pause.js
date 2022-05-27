"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PauseCommand = void 0;
class PauseCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'pause',
            description: 'Pause the current song',
            chatInputCommand: { register: true }
        });
    }
    async chatInputRun(interaction) {
        distube.pause(message);
        message.react("✅");
        return;
    }
}
exports.PauseCommand = PauseCommand;
