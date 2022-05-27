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
        if (!queue) {
            Embeds.embedBuilderMessage(client, message, "RED", "There is nothing playing")
                .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
            return;
        }
        await Embeds.statusEmbed(queue, db, queue.songs[0]);
        message.react("✅");
        return;
    }
}
exports.UpdateCommand = UpdateCommand;
