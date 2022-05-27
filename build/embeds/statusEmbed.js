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
exports.statusEmbed = void 0;
const Discord = __importStar(require("discord.js"));
const buttons_1 = require("../const/buttons");
const embeds = __importStar(require("./index"));
/**
 *  Generate and send status embed
 */
async function sendStatusEmbed(queue, config, song, title) {
    // If no song is provided, use the first song in the queue
    song = song !== null && song !== void 0 ? song : queue.songs[0];
    let filters = queue.filters.map(filter => { return filter.includes(queue.textChannel.guildId) ? filter.split(queue.textChannel.guildId)[1] : filter; });
    let embed = new Discord.MessageEmbed()
        .setColor("#fffff0")
        .setTitle(title !== null && title !== void 0 ? title : "Playing Song")
        .setDescription(`Song: [\`${song.name}\`](${song.url})`)
        .addField("Ends:", `<t:${Math.floor(Date.now() / 1000) + queue.songs[0].duration}:R>`, true)
        .addField("Queue:", `\`${queue.songs.length + (queue.songs.length < 2 ? " song" : " songs")} - ${queue.formattedDuration}\``, true)
        .addField("Volume:", `\`${queue.volume} %\``, true)
        .addField("Loop:", `  \`${queue.repeatMode ? queue.repeatMode === 2 ? "Queue" : "Song" : "❌"}\``, true)
        .addField("Autoplay:", `\`${queue.autoplay ? "✅" : "❌"}\``, true)
        .addField("Filter:", `\`${filters.length !== 0 ? filters : "❌"}\``, true)
        .setFooter({ text: queue.client.user.username, iconURL: queue.client.user.displayAvatarURL() });
    if (song.user) {
        embed.setAuthor({ name: song.user.tag.split("#")[0], iconURL: song.user.displayAvatarURL({ dynamic: true }) });
    }
    if (song.thumbnail) {
        embed.setThumbnail(song.thumbnail);
    }
    // Send new playing message
    const embedMessage = await queue.textChannel.send({
        embeds: [embed],
        components: [
            new Discord.MessageActionRow({ components: [
                    buttons_1.BUTTONS.playPauseButton,
                    buttons_1.BUTTONS.backButton,
                    buttons_1.BUTTONS.nextButton,
                    buttons_1.BUTTONS.seekBackwardButton,
                    buttons_1.BUTTONS.seekForwardButton
                ] })
        ]
    });
    // Save the message id to db
    config.setPlayingMessage(queue.textChannel.guildId, queue.voiceChannel.id, embedMessage.id);
    // Return the message
    return embedMessage;
}
/**
 *  Send and watch the status embed
 */
async function statusEmbed(queue, config, song, status) {
    try {
        // Delete old playing message if there is one
        try {
            (await queue.textChannel.messages.fetch(await config.getPlayingMessage(queue.textChannel.guildId, queue.voiceChannel.id))).delete();
            /* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
        }
        catch (error) { }
        // Send new playing message
        let embedMessage = await sendStatusEmbed(queue, config, song, status);
        // Collect button interactions
        const collector = embedMessage.createMessageComponentCollector();
        collector.on("collect", async (interaction) => {
            // Needed for some reason, otherwise you get the message "This interaction failed" although it works fine
            interaction.deferUpdate();
            // Check if user is in the voice channel
            if (!queue.voiceChannel.members.has(interaction.member.user.id)) {
                return;
            }
            switch (interaction.customId) {
                case buttons_1.BUTTONS.playPauseButton.customId:
                    if (queue.playing) {
                        queue.pause();
                        if (config.userConfig.actionMessages) {
                            embeds.embedBuilder(queue.client, interaction.member.user, queue.textChannel, "#fffff0", "PAUSED", "Paused the song")
                                .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                            statusEmbed(queue, config, song, "Paused");
                        }
                    }
                    else {
                        queue.resume();
                        if (config.userConfig.actionMessages) {
                            embeds.embedBuilder(queue.client, interaction.member.user, queue.textChannel, "#fffff0", "RESUMED", "Resumed the song")
                                .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                            statusEmbed(queue, config, song);
                        }
                    }
                    return;
                case buttons_1.BUTTONS.nextButton.customId:
                    if (!queue.autoplay && queue.songs.length <= 1) {
                        queue.stop();
                        queue.emit("finish", queue);
                    }
                    else {
                        await queue.skip();
                    }
                    if (config.userConfig.actionMessages) {
                        embeds.embedBuilder(queue.client, interaction.member.user, queue.textChannel, "#fffff0", "SKIPPED", "Skipped the song")
                            .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                    }
                    // The Distube "playSong" event will call the "playsong" function again
                    return;
                case buttons_1.BUTTONS.backButton.customId:
                    queue.previous();
                    if (config.userConfig.actionMessages) {
                        embeds.embedBuilder(queue.client, interaction.member.user, queue.textChannel, "#fffff0", "PREVIOUS", "Playing previous song")
                            .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                    }
                    // The Distube "playSong" event will call the "playsong" function again
                    return;
                case buttons_1.BUTTONS.seekBackwardButton.customId:
                    var seektime = queue.currentTime - 10;
                    if (seektime < 0) {
                        seektime = 0;
                    }
                    queue.seek(Number(seektime));
                    if (config.userConfig.actionMessages) {
                        embeds.embedBuilder(queue.client, interaction.member.user, queue.textChannel, "#fffff0", "Seeked", "Seeked the song for \`-10 seconds\`")
                            .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                    }
                    statusEmbed(queue, config, song);
                    return;
                case buttons_1.BUTTONS.seekForwardButton.customId:
                    var seektime = queue.currentTime + 10;
                    if (seektime >= queue.songs[0].duration) {
                        seektime = queue.songs[0].duration - 1;
                    }
                    queue.seek(Number(seektime));
                    if (config.userConfig.actionMessages) {
                        embeds.embedBuilder(queue.client, interaction.member.user, queue.textChannel, "#fffff0", "Seeked", "Seeked the song for \`+10 seconds\`")
                            .then(msg => setTimeout(() => msg.delete().catch(console.error), 5000));
                    }
                    statusEmbed(queue, config, song);
                    return;
            }
        });
    }
    catch (error) {
        console.error(error);
    }
}
exports.statusEmbed = statusEmbed;
