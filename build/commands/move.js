"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveCommand = void 0;
class MoveCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'move',
            description: 'Move a song from one position to another in the queue',
            chatInputCommand: { register: true }
        });
    }
    async chatInputRun(interaction) {
        if (!isNaN(Number(args[0])) && !isNaN(Number(args[1]))) {
            let queue = distube.getQueue(message);
            // Move song from position args[0] to position args[1]
            queue.songs.splice(Number(args[1]), 0, queue.songs.splice(Number(args[0]), 1)[0]);
            message.react("✅");
            queue = distube.getQueue(message);
            return;
        }
    }
}
exports.MoveCommand = MoveCommand;
