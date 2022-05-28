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
        this.name = "filter";
        this.description = "Toggle or add/delete ([custom](https://ffmpeg.org/ffmpeg-filters.html)) filters";
        this.aliases = [];
        this.needsArgs = true;
        this.usage = "filter [add|del] <name> [filter]";
        this.guildOnly = true;
        this.adminOnly = false;
        this.ownerOnly = false;
        this.needsQueue = false;
        this.hidden = false;
        this.enabled = true;
        this.cooldown = 0;
        this.cooldowns = {};
    }
    async execute(message, args, client, distube, config) {
        let queue = distube.getQueue(message.guildId);
        // Add filter
        if (args[0] === "add") {
            await config.setFilter(message.guildId, args[1], args[2]);
            // Delete filter
        }
        else if (args[0] === "del") {
            await config.deleteFilter(message.guildId, args[1]);
            // Apply filter
        }
        else {
            // Check if filter exists
            let filter = await config.getFilter(message.guildId, args[0]);
            if (filter) {
                distube.filters[message.guildId + args[0]] = filter;
                queue.setFilter(message.guildId + args[0]);
                if (config.userConfig.actionMessages) {
                    Embeds.embedBuilderMessage({
                        client,
                        message,
                        color: "#fffff0",
                        title: `Toggled filter ${args[0]}`,
                        deleteAfter: 10000
                    });
                }
                // Update status embed filter status
                Embeds.statusEmbed(queue, config);
            }
            else {
                message.react("❌");
                Embeds.embedBuilderMessage({
                    client,
                    message,
                    color: "RED",
                    title: "Filter not found",
                    deleteAfter: 10000
                });
                return;
            }
        }
        message.react("✅");
    }
}
exports.default = new NewCommand();
