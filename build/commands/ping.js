"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PingCommand = void 0;
const command_1 = require("../classes/command");
class PingCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "ping";
        this.description = "Displays the bot's ping";
        this.aliases = [];
        this.args = false;
        this.usage = "";
        this.guildOnly = false;
        this.adminOnly = false;
        this.ownerOnly = false;
        this.hidden = false;
        this.enabled = true;
        this.cooldown = 0;
        this.execute = async (message) => {
            const m = await message.channel.send("Pong!");
            const ping = message.createdTimestamp - m.createdTimestamp;
            m.edit(`Pong! Latency: ${ping}ms`);
        };
    }
}
exports.PingCommand = PingCommand;
