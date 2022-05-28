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
const Discord = __importStar(require("discord.js"));
const Embeds = __importStar(require("../embeds"));
class NewCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "prefix";
        this.description = "Changes the prefix of the bot";
        this.aliases = [];
        this.needsArgs = false;
        this.usage = "prefix <NEW PREFIX>";
        this.guildOnly = true;
        this.adminOnly = true;
        this.ownerOnly = false;
        this.needsQueue = false;
        this.hidden = false;
        this.enabled = true;
        this.cooldown = 0;
        this.cooldowns = {};
    }
    async execute(message, args, client, distube, config) {
        // If no arguments are given, return current prefix
        if (!args[0]) {
            Embeds.embedBuilderMessage(client, message, "#fffff0", `Current Prefix: \`${await config.getPrefix(message.guild.id)}\``, "Please provide a new prefix");
            message.react("✅");
            return;
        }
        // If user is not server admin, return error
        else if (!message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
            Embeds.embedBuilderMessage(client, message, "RED", "❌ You don't have permission for this Command");
            return;
        }
        // If prefix includes spaces, return error
        else if (args[1]) {
            Embeds.embedBuilderMessage(client, message, "RED", "❌ The prefix can't have whitespaces");
            return;
        }
        else {
            // Set new prefix in database
            config.setPrefix(message.guild.id, args[0]);
            message.react("✅");
            Embeds.embedBuilderMessage(client, message, "#fffff0", "PREFIX", `Successfully set new prefix to **\`${args[0]}\`**`);
        }
    }
}
exports.default = new NewCommand();
