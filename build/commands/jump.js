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
        this.name = "update";
        this.description = "Update playback status";
        this.aliases = [];
        this.args = false;
        this.usage = "update";
        this.guildOnly = true;
        this.adminOnly = false;
        this.ownerOnly = false;
        this.hidden = false;
        this.enabled = true;
        this.cooldown = 0;
    }
    async execute(message, args, client, distube) {
        let queue = distube.getQueue(message);
        if (!queue) {
            Embeds.embedBuilderMessage(client, message, "RED", "There is nothing playing")
                .then(msg => setTimeout(() => msg.delete().catch(console.error), 10000));
            message.react("❌");
            return;
        }
        if (0 <= Number(args[0]) && Number(args[0]) <= queue.songs.length) {
            await distube.jump(message, parseInt(args[0]))
                .catch(err => {
                Embeds.embedBuilderMessage(client, message, "RED", "Invalid song number")
                    .then(msg => setTimeout(() => msg.delete().catch(console.error), 10000));
                message.react("❌");
                return;
            });
            message.react("✅");
            return;
        }
    }
}
exports.default = new NewCommand();
