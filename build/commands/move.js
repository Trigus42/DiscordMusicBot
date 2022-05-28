"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../classes/command");
const Embeds = __importStar(require("../embeds"));
class NewCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "move";
        this.description = "Move a song from one position to another in the queue";
        this.aliases = ["mv"];
        this.needsArgs = true;
        this.usage = "move <from> <to>";
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
        let queue = distube.getQueue(message);
        if (isNaN(Number(args[0])) || !isNaN(Number(args[1])) || Number(args[0]) < 1 || Number(args[1]) > queue.songs.length) {
            message.react("❌");
            Embeds.embedBuilderMessage({
                client,
                message,
                color: "RED",
                title: "Invalid song number",
                deleteAfter: 10000
            });
            return;
        }
        // Move song from position args[0] to position args[1]
        queue.songs.splice(Number(args[1]), 0, queue.songs.splice(Number(args[0]), 1)[0]);
        message.react("✅");
        if (config.userConfig.actionMessages) {
            Embeds.embedBuilderMessage({
                client,
                message,
                color: "#fffff0",
                title: "Song moved",
                description: `Moved **${args[0]}** to **${args[1]}**`,
                deleteAfter: 10000
            });
        }
    }
}
exports.default = new NewCommand();
