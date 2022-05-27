"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../classes/command");
class NewCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "stop";
        this.description = "Stop playing music and clear the queue";
        this.aliases = [];
        this.args = false;
        this.usage = "stop";
        this.guildOnly = true;
        this.adminOnly = false;
        this.ownerOnly = false;
        this.hidden = false;
        this.enabled = true;
        this.cooldown = 0;
        this.cooldowns = {};
    }
    async execute(message, args, client, distube) {
        let queue = distube.getQueue(message.guild.id);
        if (queue)
            await queue.stop();
        message.react("✅");
    }
}
exports.default = new NewCommand();
