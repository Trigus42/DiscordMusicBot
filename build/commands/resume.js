"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeCommand = void 0;
class ResumeCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'resume',
            description: 'Resume the current song',
            chatInputCommand: { register: true }
        });
    }
    async chatInputRun(interaction) {
        distube.resume(message);
        message.react("✅");
        return;
    }
}
exports.ResumeCommand = ResumeCommand;
