"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../classes/command");
const embeds_1 = require("../embeds");
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
        this.needsUserInVC = true;
    }
    async execute(message, args, client, distube, config) {
        distube.pause(message);
        (0, embeds_1.statusEmbed)(distube.getQueue(message.guildId), config);
        message.react("✅");
    }
}
exports.default = new NewCommand();
