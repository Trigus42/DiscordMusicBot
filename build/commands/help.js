"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
exports.help = void 0;
const Discord = __importStar(require("discord.js"));
async function help(message, prefix, filters) {
    let helpembed = new Discord.MessageEmbed()
        .setColor("#fffff0")
        .setTitle("***COMMANDS***\n")
        .setAuthor(message.author.tag, message.member.user.displayAvatarURL({ dynamic: true }))
        .setFooter(message.client.user.username + " | Syntax:  <>...must    []...optional", message.client.user.displayAvatarURL())
        .addField(`\`${prefix}prefix <NEW PREFIX>\``, `**Change Prefix**`, true)
        .addField(`\`${prefix}help\`  \`${prefix}h\``, `**List of all Commands**`, true)
        .addField(`\`${prefix}play <URL/NAME>\` \`${prefix}p\``, `**Plays a song**`, true)
        .addField(`\`${prefix}status\``, `**Update playing message**`, true)
        .addField(`\`${prefix}pause\``, `**Pauses the song**`, true)
        .addField(`\`${prefix}resume\`  \`${prefix}r\``, `**Resume the song**`, true)
        .addField(`\`${prefix}shuffle\`  \`${prefix}mix\``, `**Shuffles the queue**`, true)
        .addField(`\`${prefix}autoplay\`  \`${prefix}ap\``, `**Enables autoplay - random similar songs**`, true)
        .addField(`\`${prefix}skip\`  \`${prefix}s\``, `**Skips current song**`, true)
        .addField(`\`${prefix}stop\`  \`${prefix}leave\``, `**Stops playing**`, true)
        .addField(`\`${prefix}seek <HH:MM:SS>\``, `**Moves in the song to HH:MM:SS**`, true)
        .addField(`\`${prefix}move <FROM> <TO>\` \`${prefix}mv\``, `**Moves a song from one position to another**`, true)
        .addField(`\`${prefix}volume <VOLUME>\`  \`${prefix}vol\``, `**Changes volume**`, true)
        .addField(`\`${prefix}queue\`  \`${prefix}qu\``, `**Shows current Queue**`, true)
        .addField(`\`${prefix}loop <0/1/2>\`  \`${prefix}mix\``, `**Loop (off / song / queue)**`, true)
        .addField(`\`${prefix}jump <Queue index>\``, `**Jumps to a queue song**`, true)
        .addField(`\`${prefix}ping\``, `**Gives you the ping**`, true)
        .addField(`\`${prefix}uptime\``, `**Shows you the Bot's Uptime**`, true)
        .addField(`​`, `​`, true)
        .addField("***FILTERS:***", Object.keys(filters).map(filter => `\`${prefix}${filter}\``).join(" "));
    return message.channel.send({ embeds: [helpembed] });
}
exports.help = help;
