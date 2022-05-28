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
exports.queueEmbed = void 0;
const Discord = __importStar(require("discord.js"));
/**
 *  Build and return array of embeds for the queue
 */
function queueEmbed(queue, client) {
    let embeds = [];
    // Create embeds (one per 10 songs)
    for (let i = 0; i < queue.songs.length; i += 10) {
        // Get next 10 songs
        const current = queue.songs.slice(i, i + 10);
        // Create string of each song ("**Index** - [Title](Link)")
        let infos = [[], [], []];
        for (let j = 0; j < current.length; j++) {
            infos[0].push(`${j + i}`);
            infos[1].push(`[${current[j].name}](${current[j].url})`);
        }
        // Create and add embed
        const embed = new Discord.MessageEmbed()
            .setTitle(`Queue: \`${queue.voiceChannel.name}\``)
            .setColor("#fffff0")
            .setDescription(`**Current Song: [\`${queue.songs[0].name}\`](${queue.songs[0].url})**`)
            .addField("Index", infos[0].join("\n"), true)
            .addField("Song", infos[1].join("\n"), true)
            .setFooter({ text: queue.client.user.username, iconURL: queue.client.user.displayAvatarURL() });
        embeds.push(embed);
    }
    // Return the embeds
    return embeds;
}
exports.queueEmbed = queueEmbed;
