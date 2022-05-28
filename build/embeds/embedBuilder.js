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
async function embedBuilderMessage({ client, message, color, title, description, thumbnail, deleteAfter }) {
    var _a, _b, _c, _d;
    let embed = new Discord.MessageEmbed()
        .setColor(color)
        .setAuthor({ name: message.author.tag.split("#")[0], iconURL: (_a = message.member) === null || _a === void 0 ? void 0 : _a.user.displayAvatarURL({ dynamic: true }) })
        .setFooter({ text: (_c = (_b = client.user) === null || _b === void 0 ? void 0 : _b.username) !== null && _c !== void 0 ? _c : "", iconURL: (_d = client.user) === null || _d === void 0 ? void 0 : _d.displayAvatarURL() });
    if (title) {
        embed.setTitle(title);
    }
    if (description) {
        embed.setDescription(description);
    }
    if (thumbnail) {
        embed.setThumbnail(thumbnail);
    }
    let embedMsg = await message.channel.send({ embeds: [embed] })
        .then(msg => {
        if (deleteAfter) {
            setTimeout(() => msg.delete().catch(console.error), deleteAfter);
        }
        return msg;
    })
        .catch(console.error);
    return embedMsg;
}
exports.embedBuilderMessage = embedBuilderMessage;
/**
 *  Build and send embed in the channel of the queue
 */
async function embedBuilder({ client, channel, author, color, title, description, thumbnail, deleteAfter }) {
    var _a, _b, _c;
    let embed = new Discord.MessageEmbed()
        .setColor(color !== null && color !== void 0 ? color : "#fffff0")
        .setFooter({ text: (_b = (_a = client.user) === null || _a === void 0 ? void 0 : _a.username) !== null && _b !== void 0 ? _b : "", iconURL: (_c = client.user) === null || _c === void 0 ? void 0 : _c.displayAvatarURL() });
    if (author)
        embed.setAuthor({ name: author.tag.split("#")[0], iconURL: author.displayAvatarURL({ dynamic: true }) });
    if (title)
        embed.setTitle(title);
    if (description)
        embed.setDescription(description);
    if (thumbnail)
        embed.setThumbnail(thumbnail);
    let embedMsg = await channel.send({ embeds: [embed] })
        .then(msg => {
        if (deleteAfter) {
            setTimeout(() => msg.delete().catch(console.error), deleteAfter);
        }
        return msg;
    })
        .catch(console.error);
    return embedMsg;
}
exports.embedBuilder = embedBuilder;
