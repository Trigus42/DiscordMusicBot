"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../classes/command");
class NewCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "shuffle";
        this.description = "Shuffle the queue";
        this.aliases = ["mix"];
        this.args = false;
        this.usage = "shuffle";
        this.guildOnly = false;
        this.adminOnly = false;
        this.ownerOnly = false;
        this.hidden = false;
        this.enabled = true;
        this.cooldown = 0;
        this.cooldowns = {};
    }
    async execute(message, args, client, distube) {
        await distube.shuffle(message);
        message.react("✅");
    }
}
exports.default = new NewCommand();
