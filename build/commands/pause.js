"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../classes/command");
class NewCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "pause";
        this.description = "Pause the current song";
        this.aliases = [];
        this.needsArgs = false;
        this.usage = "pause";
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
        distube.pause(message);
        message.react("✅");
    }
}
exports.default = new NewCommand();
