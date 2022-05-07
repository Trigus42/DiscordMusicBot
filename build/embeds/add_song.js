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
exports.songEmbed = void 0;
const Discord = __importStar(require("discord.js"));
/**
 *  Generate and send status embed
 */
async function songEmbed(queue, song, title) {
    // If no song is provided, use the first song in the queue
    song = song !== null && song !== void 0 ? song : queue.songs[0];
    let embed = new Discord.MessageEmbed()
        .setColor("#fffff0")
        .setTitle(title !== null && title !== void 0 ? title : "Added a Song")
        .setDescription(`Song: [\`${song.name}\`](${song.url})`)
        .addField("Start:", `<t:${Math.floor(Date.now() / 1000) + queue.duration - song.duration}:R>`, true)
        .addField("Duration:", `\`${song.formattedDuration}\``, true)
        .addField("Requested by:", `${song.user}`, true)
        .setFooter({ text: queue.client.user.username, iconURL: queue.client.user.displayAvatarURL() });
    if (song.user) {
        embed.setAuthor({ name: song.user.tag.split("#")[0], iconURL: song.user.displayAvatarURL({ dynamic: true }) });
    }
    if (song.thumbnail) {
        embed.setThumbnail(song.thumbnail);
    }
    const embedMessage = await queue.textChannel.send({ embeds: [embed] });
    // Return the message
    return embedMessage;
}
exports.songEmbed = songEmbed;
