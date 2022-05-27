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
        this.usage = "help [command]";
        this.guildOnly = false;
        this.adminOnly = false;
        this.ownerOnly = false;
        this.hidden = false;
        this.enabled = true;
        this.cooldown = 0;
    }
    async execute(message, args, client, distube) {
        let embed = new Discord.MessageEmbed()
            .setColor("#fffff0")
            .setTitle("**COMMANDS**\n")
            .setAuthor({ name: message.author.tag.split("#")[0], iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setFooter({ text: client.user.username + " | Syntax:  \"<>\": required, \"[]\": optional", iconURL: client.user.displayAvatarURL({ dynamic: true }) })
            .addField(`\`$/autoplay\` **/** \`$/ap\``, "Enables autoplay", true)
            .addField(`\`$/filter <add/del> <NAME> [OPTIONS]\``, "Add/delete [custom filters](https://ffmpeg.org/ffmpeg-filters.html)", true)
            .addField(`\`$/help\` **/** \`$/h\``, "List of all commands", true)
            .addField(`\`$/jump <POSITION>\``, "Jumps to a song in queue", true)
            .addField(`\`$/loop <0/1/2>\``, "Loop (off / song / queue)", true)
            .addField(`\`$/move <FROM> <TO>\` **/** \`$/mv\``, "Moves a song from one position to another", true)
            .addField(`\`$/pause\``, "Pauses the song", true)
            .addField(`\`$/ping\``, "Gives you the ping", true)
            .addField(`\`$/play <URL/NAME> [POSITION]\` **/** \`$/p\``, "Add song to queue", true)
            .addField(`\`$/prefix <NEW PREFIX>\``, "Change prefix", true)
            .addField(`\`$/queue\` **/** \`$/qu\``, "Shows current queue", true)
            .addField(`\`$/resume\` **/** \`$/r\``, "Resume the song", true)
            .addField(`\`$/seek <HH:MM:SS>\``, "Moves in the song to HH:MM:SS", true)
            .addField(`\`$/shuffle\` **/** \`$/mix\``, "Shuffles the queue", true)
            .addField(`\`$/skip [POSITION]\` **/** \`$/s\``, "Skips current song or song at POSITION", true)
            .addField(`\`$/status\``, "Update playing message", true)
            .addField(`\`$/stop\``, "Stops playing", true)
            .addField(`\`$/uptime\``, "Shows you the bot's uptime", true)
            .addField(`\`$/volume <VOLUME>\` **/** \`$/vol\``, "Changes volume", true);
        // .addField("**FILTERS**", Object.keys(filters).map((filter) => `\`$/${filter}\``).join(" "))
        message.channel.send({ embeds: [embed] });
    }
}
exports.default = new NewCommand();
