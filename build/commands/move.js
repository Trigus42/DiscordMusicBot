"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../classes/command");
class NewCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "move";
        this.description = "Move a song from one position to another in the queue";
        this.aliases = ["mv"];
        this.args = true;
        this.usage = "move <from> <to>";
        this.guildOnly = true;
        this.adminOnly = false;
        this.ownerOnly = false;
        this.hidden = false;
        this.enabled = true;
        this.cooldown = 0;
        this.cooldowns = {};
    }
    async execute(message, args, client, distube) {
        if (!isNaN(Number(args[0])) && !isNaN(Number(args[1]))) {
            let queue = distube.getQueue(message);
            // Move song from position args[0] to position args[1]
            queue.songs.splice(Number(args[1]), 0, queue.songs.splice(Number(args[0]), 1)[0]);
            message.react("✅");
        }
    }
}
exports.default = new NewCommand();
