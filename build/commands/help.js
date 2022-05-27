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
class NewCommand extends command_1.Command {
    constructor() {
        super(...arguments);
        this.name = "help";
        this.description = "Prints help message";
        this.aliases = ["h"];
        this.args = false;
        this.usage = "help";
        this.guildOnly = false;
        this.adminOnly = false;
        this.ownerOnly = false;
        this.hidden = false;
        this.enabled = true;
        this.cooldown = 0;
        this.cooldowns = {};
    }
    async execute(message, args, client, distube, config) {
        var _a;
        let embed = new Discord.MessageEmbed()
            .setColor("#fffff0")
            .setTitle("**COMMANDS**\n")
            .setAuthor({ name: message.author.tag.split("#")[0], iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setFooter({ text: client.user.username + " | Syntax:  \"<>\": required, \"[]\": optional", iconURL: client.user.displayAvatarURL({ dynamic: true }) });
        // Create embed for each command
        config.commands.forEach(command => {
            let aliases = command.aliases.map(alias => `\`${alias}\``).join("**/**");
            aliases = aliases ? "**/**" + aliases : "";
            embed.addField(`\`${command.usage}\`` + aliases, command.description, true);
        });
        // Add embed with all filters
        let filters = await config.getFilters(message.guild.id);
        embed.addField("**FILTERS**", (_a = Object.keys(filters).map((filter) => `\`${filter}\``).join(" ")) !== null && _a !== void 0 ? _a : "None");
        message.channel.send({ embeds: [embed] });
    }
}
exports.default = new NewCommand();
