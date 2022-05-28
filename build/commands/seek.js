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
    async execute(message, args, client, distube, config) {
        // Get time in seconds from HH:MM:SS time_string
        let time_array = args[0].split(":");
        let time_seconds = 0;
        for (let i = 0; i < time_array.length; i++) {
            time_seconds += parseInt(time_array[i]) * Math.pow(60, (time_array.length - 1) - i);
        }
        distube.seek(message, time_seconds);
        if (config.userConfig.actionMessages) {
            Embeds.embedBuilderMessage({
                client,
                message,
                color: "#fffff0",
                title: "Seeked",
                description: `Seeked to **${args[0]}** in song **${distube.getQueue(message.guildId).songs[0].name}**`,
                deleteAfter: 10000
            });
        }
        Embeds.statusEmbed(distube.getQueue(message.guildId), config);
        message.react("✅");
    }
}
exports.default = new NewCommand();
