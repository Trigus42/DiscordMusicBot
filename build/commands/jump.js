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
        this.name = "jump";
        this.description = "Jumps to a song in queue";
        this.aliases = [];
        this.needsArgs = true;
        this.usage = "jump <POSITION>";
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
        await distube.jump(message, Number(args[0]))
            .catch(err => {
            message.react("❌");
            Embeds.embedBuilderMessage({
                client,
                message,
                color: "RED",
                title: "Invalid song number",
                deleteAfter: 10000
            });
            return;
        });
        if (config.userConfig.actionMessages) {
            Embeds.embedBuilderMessage({
                client,
                message,
                color: "#fffff0",
                title: "Jumped to song",
                description: `Jumped to **${queue.songs[0].name}**`,
                deleteAfter: 10000
            });
        }
        message.react("✅");
    }
}
exports.default = new NewCommand();
