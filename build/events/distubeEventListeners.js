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
exports.registerDistubeEventListeners = void 0;
const Embeds = __importStar(require("../embeds/index"));
function registerDistubeEventListeners(clients, config) {
    for (let { discord, distube } of clients) {
        distube
            .on("playSong", (queue, song) => {
            try {
                Embeds.statusEmbed(queue, config, song);
                return;
            }
            catch (error) {
                console.error(error);
            }
        })
            .on("addSong", (queue, song) => {
            try {
                Embeds.songEmbed(queue, song);
                return;
            }
            catch (error) {
                console.error(error);
            }
        })
            .on("addList", (queue, playlist) => {
            Embeds.embedBuilder({
                client: distube.client,
                user: playlist.user,
                channel: queue.textChannel,
                color: "#fffff0",
                title: "Added a Playlist",
                description: `Playlist: [\`${playlist.name}\`](${playlist.url})  -  \`${playlist.songs.length} songs\`` +
                    `\n\nRequested by: ${playlist.user}`, thumbnail: playlist.thumbnail
            });
        })
            .on("searchResult", (message, results) => {
            let i = 0;
            Embeds.embedBuilderMessage({
                client: distube.client,
                message,
                color: "#fffff0",
                title: "",
                description: `**Choose an option from below**\n` +
                    results.map(song => `**${++i}**. [${song.name}](${song.url}) - \`${song.formattedDuration}\``).join("\n") +
                    `\n*Enter anything else or wait 60 seconds to cancel*`
            });
        })
            .on("searchCancel", (message) => {
            var _a, _b;
            (_a = message.reactions.resolve("✅")) === null || _a === void 0 ? void 0 : _a.users.remove((_b = distube.client.user) === null || _b === void 0 ? void 0 : _b.id);
            message.react("❌");
            Embeds.embedBuilderMessage({
                client: distube.client,
                message,
                color: "RED",
                title: "Searching canceled",
                description: ""
            });
        })
            .on("error", (channel, error) => {
            try {
                channel.lastMessage.reactions.resolve("✅").users.remove(distube.client.user.id);
                channel.lastMessage.react("❌");
            }
            catch (error) {
                console.error(error);
            }
            console.log(error);
            try {
                Embeds.embedBuilder({ client: distube.client, user: channel.lastMessage.member.user, channel, color: "RED", title: "An error encountered:", description: "```" + error + "```" });
                return;
            }
            catch (error) {
                console.error(error);
            }
        })
            .on("finish", async (queue) => {
            try {
                Embeds.embedBuilder({ client: distube.client, user: queue.textChannel.lastMessage.member.user, channel: queue.textChannel, color: "RED", title: "There are no more songs left" }).then(msg => setTimeout(() => msg.delete().catch(console.error), 60000));
            }
            catch (error) {
                console.error(error);
            }
        })
            .on("empty", queue => {
            try {
                Embeds.embedBuilder({ client: distube.client, user: queue.textChannel.lastMessage.member.user, channel: queue.textChannel, color: "RED", title: "Left the channel cause it got empty" }).then(msg => setTimeout(() => msg.delete().catch(console.error), 60000));
                return;
            }
            catch (error) {
                console.error(error);
            }
        })
            .on("noRelated", queue => {
            try {
                Embeds.embedBuilder({ client: distube.client, user: queue.textChannel.lastMessage.member.user, channel: queue.textChannel, color: "RED", title: "Can't find related video to play. Stop playing music." }).then(msg => setTimeout(() => msg.delete().catch(console.error), 60000));
                return;
            }
            catch (error) {
                console.error(error);
            }
        })
            .on("initQueue", queue => {
            try {
                queue.autoplay = false;
                queue.volume = 100;
            }
            catch (error) {
                console.log(error);
            }
        })
            .on("searchDone", () => { })
            .on("searchNoResult", () => { })
            .on("searchInvalidAnswer", () => { });
    }
}
exports.registerDistubeEventListeners = registerDistubeEventListeners;
