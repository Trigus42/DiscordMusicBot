"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../classes/command");
class NewCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "volume";
        this.description = "Set bot volume (0-100)";
        this.aliases = ["vol"];
        this.needsArgs = true;
        this.usage = "volume <volume>";
        this.guildOnly = true;
        this.adminOnly = false;
        this.ownerOnly = false;
        this.needsQueue = true;
        this.hidden = false;
        this.enabled = true;
        this.cooldown = 0;
        this.cooldowns = {};
        this.needsUserInVC = true;
    }
    async execute(message, args, client, distube, config) {
        distube.setVolume(message, Number(args[0]));
        message.react("✅");
    }
}
exports.default = new NewCommand();
