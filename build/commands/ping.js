"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../classes/command");
class NewCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "ping";
        this.description = "Displays the bot's ping";
        this.aliases = [];
        this.needsArgs = false;
        this.usage = "ping";
        this.guildOnly = false;
        this.adminOnly = false;
        this.ownerOnly = false;
        this.needsQueue = false;
        this.hidden = false;
        this.enabled = true;
        this.cooldown = 0;
        this.cooldowns = {};
    }
    async execute(message, args, client, distube) {
        const m = await message.channel.send("Pong!");
        const ping = m.createdTimestamp - message.createdTimestamp;
        m.edit(`Pong! Latency: ${ping}ms`);
        message.react("✅");
    }
}
exports.default = new NewCommand();
