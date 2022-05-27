"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCommand = void 0;
class UpdateCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'update',
            description: 'Update playback status',
            chatInputCommand: { register: true }
        });
    }
    async chatInputRun(interaction) {
        let queue = distube.getQueue(message);
        if (!queue) {
            Embeds.embedBuilderMessage(client, message, "RED", "There is nothing playing")
                .then(msg => setTimeout(() => msg.delete().catch(console.error), 10000));
            message.react("❌");
            return;
        }
        if (0 <= Number(args[0]) && Number(args[0]) <= queue.songs.length) {
            await distube.jump(message, parseInt(args[0]))
                .catch(err => {
                Embeds.embedBuilderMessage(client, message, "RED", "Invalid song number")
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 10000));
                message.react("❌");
                return;
            });
            message.react("✅");
            return;
        }
    }
}
exports.UpdateCommand = UpdateCommand;
