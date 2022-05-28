"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../classes/command");
class NewCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "seek";
        this.description = "Seek to a specific time in the current song";
        this.aliases = [];
        this.needsArgs = true;
        this.usage = "seek <HH:MM:SS>";
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
    async execute(message, args, client, distube) {
        // Get time in seconds from HH:MM:SS time_string
        let time_array = args[0].split(":");
        let time_seconds = 0;
        for (let i = 0; i < time_array.length; i++) {
            time_seconds += parseInt(time_array[i]) * Math.pow(60, (time_array.length - 1) - i);
        }
        distube.seek(message, time_seconds);
        message.react("✅");
    }
}
exports.default = new NewCommand();
