"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeekCommand = void 0;
class SeekCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'seek',
            description: 'Seek to a specific time in the current song',
            chatInputCommand: { register: true }
        });
    }
    async chatInputRun(interaction) {
        // Get time in seconds from HH:MM:SS time_string
        let time_array = args[0].split(":");
        let time_seconds = 0;
        for (let i = 0; i < time_array.length; i++) {
            time_seconds += parseInt(time_array[i]) * Math.pow(60, (time_array.length - 1) - i);
        }
        distube.seek(message, time_seconds);
        message.react("✅");
        return;
    }
}
exports.SeekCommand = SeekCommand;
