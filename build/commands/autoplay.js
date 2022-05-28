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
const Embeds = __importStar(require("../embeds"));
const command_1 = require("../classes/command");
class NewCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "autoplay";
        this.description = "Toggle autoplay";
        this.aliases = ["ap"];
        this.needsArgs = false;
        this.usage = "autoplay";
        this.guildOnly = true;
        this.adminOnly = false;
        this.ownerOnly = false;
        this.needsQueue = true;
        this.hidden = false;
        this.enabled = true;
        this.cooldown = 0;
        this.cooldowns = {};
    }
    async execute(message, args, client, distube, config) {
        message.react("✅");
        let autoplayStatus = distube.toggleAutoplay(message) ? "ON" : "OFF";
        if (config.userConfig.actionMessages) {
            Embeds.embedBuilderMessage({
                client,
                message,
                color: "#fffff0",
                title: `Autoplay is now ${autoplayStatus}`,
                deleteAfter: 10000
            });
        }
        // Update status embed autoplay status
        Embeds.statusEmbed(distube.getQueue(message.guildId), config);
    }
}
exports.default = new NewCommand();
