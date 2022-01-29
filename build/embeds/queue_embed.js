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
exports.queue_embed = void 0;
const Discord = __importStar(require("discord.js"));
/**
 *  Build and return array of embeds for the queue
 */
function queue_embed(queue, client) {
    let embeds = [];
    // Create embeds (one per 10 songs)
    for (let i = 0; i < queue.songs.length; i += 10) {
        // Get next 10 songs
        const current = queue.songs.slice(i, i + 10);
        // Create string of each song (`**Index** - [Title](Link)`)
        let info = [];
        for (let j = 0; j < current.length; j++) {
            try {
                info[j] = `**${j + i}** - [${current[j].name}](${current[j].url})`;
            }
            catch (error) {
                info[j] = `**${j + i}** - ${current[j].url}`;
            }
        }
        // Create and add embed
        const embed = new Discord.MessageEmbed()
            .setTitle("Server Queue")
            .setColor("#fffff0")
            .setDescription(`**Current Song - [\`${queue.songs[0].name}\`](${queue.songs[0].url})**\n\n${info.join("\n")}`)
            .setFooter(client.user.username, client.user.displayAvatarURL());
        embeds.push(embed);
    }
    // Return the embeds
    return embeds;
}
exports.queue_embed = queue_embed;
