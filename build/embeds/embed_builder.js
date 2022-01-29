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
exports.embed_builder = exports.embed_builder_message = void 0;
const Discord = __importStar(require("discord.js"));
/**
 *  Build and send embed in the channel of the message
 */
function embed_builder_message(client, message, color, title, description, thumbnail) {
    try {
        let embed = new Discord.MessageEmbed()
            .setColor(color)
            .setAuthor(message.author.tag, message.member.user.displayAvatarURL({ dynamic: true }))
            .setFooter(client.user.username, client.user.displayAvatarURL());
        if (title)
            embed.setTitle(title);
        if (description)
            embed.setDescription(description);
        if (thumbnail)
            embed.setThumbnail(thumbnail);
        return message.channel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error(error);
    }
}
exports.embed_builder_message = embed_builder_message;
/**
 *  Build and send embed in the channel of the queue
 */
function embed_builder(client, user, channel, color, title, description, thumbnail) {
    let embed = new Discord.MessageEmbed()
        .setColor(color)
        .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
        .setFooter(client.user.username, client.user.displayAvatarURL());
    if (title)
        embed.setTitle(title);
    if (description)
        embed.setDescription(description);
    if (thumbnail)
        embed.setThumbnail(thumbnail);
    return channel.send({ embeds: [embed] });
}
exports.embed_builder = embed_builder;
