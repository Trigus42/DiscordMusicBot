"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
class Command {
    constructor() {
        this.description = "No description";
        this.aliases = [];
        this.needsArgs = false;
        this.usage = "No usage";
        this.guildOnly = false;
        this.adminOnly = false;
        this.ownerOnly = false;
        this.needsQueue = false;
        this.hidden = false;
        this.enabled = false;
        this.cooldown = 0;
        this.cooldowns = {};
        this.needsUserInVC = false;
    }
    async execute(message, args, client, distube, config) {
        throw new Error("Method not implemented.");
    }
}
exports.Command = Command;
