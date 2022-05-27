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
exports.embedBuilder = exports.embedBuilderMessage = void 0;
const Discord = __importStar(require("discord.js"));
/**
 *  Build and send embed in the channel of the message
 */
function embedBuilderMessage(client, message, color, title, description, thumbnail) {
    try {
        let embed = new Discord.MessageEmbed()
            .setColor(color)
            .setAuthor({ name: message.author.tag.split("#")[0], iconURL: message.member.user.displayAvatarURL({ dynamic: true }) })
            .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });
        if (title) {
            embed.setTitle(title);
        }
        if (description) {
            embed.setDescription(description);
        }
        if (thumbnail) {
            embed.setThumbnail(thumbnail);
        }
        return message.channel.send({ embeds: [embed] });
    }
    catch (error) {
        console.error(error);
    }
}
exports.embedBuilderMessage = embedBuilderMessage;
/**
 *  Build and send embed in the channel of the queue
 */
function embedBuilder(client, user, channel, color, title, description, thumbnail) {
    let embed = new Discord.MessageEmbed()
        .setColor(color)
        .setAuthor({ name: user.tag.split("#")[0], iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });
    if (title)
        embed.setTitle(title);
    if (description)
        embed.setDescription(description);
    if (thumbnail)
        embed.setThumbnail(thumbnail);
    return channel.send({ embeds: [embed] });
}
exports.embedBuilder = embedBuilder;
