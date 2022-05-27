"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
class Command {
    constructor() {
        this.cooldowns = {};
    }
    async execute(message, args, client, distube, config) {
        throw new Error("Method not implemented.");
    }
}
exports.Command = Command;
