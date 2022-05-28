"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../classes/command");
class NewCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "resume";
        this.description = "Resume the current song";
        this.aliases = [];
        this.needsArgs = false;
        this.usage = "resume";
        this.guildOnly = true;
        this.adminOnly = false;
        this.ownerOnly = false;
        this.needsQueue = true;
        this.hidden = false;
        this.enabled = true;
        this.cooldown = 0;
        this.cooldowns = {};
    }
    async execute(message, args, client, distube) {
        distube.resume(message);
        message.react("✅");
    }
}
exports.default = new NewCommand();
