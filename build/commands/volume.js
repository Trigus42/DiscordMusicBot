"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolumeCommand = void 0;
class VolumeCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'volume',
            description: 'Set bot volume',
            chatInputCommand: { register: true }
        });
    }
    async chatInputRun(interaction) {
        distube.setVolume(message, Number(args[0]));
        message.react("✅");
        return;
    }
}
exports.VolumeCommand = VolumeCommand;
