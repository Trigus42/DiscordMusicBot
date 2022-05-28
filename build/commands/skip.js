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
        this.name = "skip";
        this.description = "Skip song at optional queue position or current song";
        this.aliases = ["s"];
        this.needsArgs = true;
        this.usage = "skip [position]";
        this.guildOnly = true;
        this.adminOnly = false;
        this.ownerOnly = false;
        this.needsQueue = true;
        this.hidden = false;
        this.enabled = true;
        this.cooldown = 0;
        this.cooldowns = {};
    }
    async execute(message, args, client, distube) {
        let queue = distube.getQueue(message.guild.id);
        // If queue is empty after skipping, stop playing
        if (!queue.autoplay && queue.songs.length <= 1) {
            queue.stop();
            queue.emit("finish", queue);
        }
        else {
            // Skip song at queue position args[0]
            if (!isNaN(Number(args[0]))) {
                let skip = Number(args[0]);
                if (Math.abs(skip) <= queue.songs.length) {
                    queue.songs.splice(skip, 1);
                    // If skip is greater than queue length, send error message
                }
                else {
                    Embeds.embedBuilderMessage(client, message, "RED", "Can't skip song at position " + skip + " because it doesn't exist")
                        .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                    return;
                }
                // Skip song at current position if no number is given
            }
            else {
                await distube.skip(message);
            }
        }
        message.react("✅");
    }
}
exports.default = new NewCommand();
